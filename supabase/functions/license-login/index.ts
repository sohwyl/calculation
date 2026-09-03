// محاسبه‌گر تاسیسات یزد — Edge Function ورود با شماره موبایل + کد لایسنس
// --------------------------------------------------------------------------
// چون کد لایسنس فقط ۵ رقمی است (۹۰٬۰۰۰ حالت)، تنها همین تابع، که سمت سرور
// اجرا می‌شود، اجازه دارد کد را با دیتابیس مقایسه کند. برای جلوگیری از
// حدس‌زنی خودکار (brute-force)، بعد از ۵ تلاش ناموفق برای یک شماره، ورود آن
// شماره به مدت ۱۰ دقیقه قفل می‌شود.
//
// در صورت موفقیت، یک توکن امضاشده با کلید خصوصی ECDSA برمی‌گرداند. کلید
// عمومی متناظر در src/lib/license.ts (سمت مرورگر) هاردکد است و فقط برای
// «تایید» امضا استفاده می‌شود — نه ساختن آن. یعنی هیچ‌کس با دیدن کد فرانت‌اند
// نمی‌تواند توکن جعلی معتبر بسازد؛ فقط این تابع (که کلید خصوصی را دارد)
// می‌تواند.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 10;
const TOKEN_VALID_DAYS = 730; // ۲ سال اعتبار توکن صادرشده

async function signToken(payload: { phone: string; exp: number }): Promise<string> {
  const privJwk = JSON.parse(Deno.env.get("LICENSE_PRIVATE_JWK")!);
  const key = await crypto.subtle.importKey(
    "jwk", privJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );
  const data = new TextEncoder().encode(JSON.stringify(payload));
  const sigBuf = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, data);
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
  const payloadB64 = btoa(JSON.stringify(payload));
  return `${payloadB64}.${sigB64}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { phone, code } = await req.json();
    const cleanPhone = String(phone ?? "").trim();
    const cleanCode = String(code ?? "").trim();
    if (!/^09\d{9}$/.test(cleanPhone) || !/^\d{4,5}$/.test(cleanCode)) {
      return json({ ok: false, msg: "شماره موبایل یا کد نامعتبر است" }, 400);
    }

    const { data: row } = await supabase
      .from("licenses")
      .select("id, code, paid, failed_attempts, locked_until")
      .eq("phone", cleanPhone)
      .maybeSingle();

    // پیام یکسان برای «شماره وجود ندارد» و «کد اشتباه است» تا مهاجم نتواند
    // شماره‌های معتبر را از روی تفاوت پیام حدس بزند.
    const genericInvalid = () => json({ ok: false, msg: "شماره موبایل یا کد لایسنس اشتباه است" }, 401);

    if (!row || !row.paid) return genericInvalid();

    if (row.locked_until && new Date(row.locked_until) > new Date()) {
      return json({ ok: false, msg: "به دلیل تلاش‌های ناموفق زیاد، ورود این شماره موقتاً قفل است. کمی بعد دوباره امتحان کنید." }, 429);
    }

    if (row.code !== cleanCode) {
      const attempts = row.failed_attempts + 1;
      const patch: Record<string, unknown> = { failed_attempts: attempts };
      if (attempts >= MAX_ATTEMPTS) {
        patch.locked_until = new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString();
        patch.failed_attempts = 0;
      }
      await supabase.from("licenses").update(patch).eq("id", row.id);
      return genericInvalid();
    }

    // موفقیت‌آمیز — ریست تلاش‌ها و ثبت زمان اولین ورود
    await supabase.from("licenses").update({
      failed_attempts: 0,
      locked_until: null,
      activated_at: new Date().toISOString(),
    }).eq("id", row.id);

    const exp = Date.now() + TOKEN_VALID_DAYS * 24 * 3600 * 1000;
    const token = await signToken({ phone: cleanPhone, exp });
    return json({ ok: true, token });
  } catch (e) {
    return json({ ok: false, msg: "خطای غیرمنتظره: " + String(e) }, 500);
  }
});
