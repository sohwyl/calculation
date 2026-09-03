// محاسبه‌گر تاسیسات یزد — Edge Function صدور لایسنس
// --------------------------------------------------------------------------
// این تابع دو حالت دارد که با فیلد "action" در body مشخص می‌شود:
//
// 1) action = "start"
//    قبل از رفتن به درگاه پرداخت صدا زده می‌شود. نام+شماره موبایل مشتری را
//    می‌گیرد و یک ردیف "در انتظار پرداخت" در جدول licenses می‌سازد (paid=false).
//    یک order_id تصادفی برمی‌گرداند تا بعد از پرداخت، رکورد مربوطه پیدا شود.
//
// 2) action = "verify"
//    بعد از بازگشت کاربر از درگاه پرداخت صدا زده می‌شود. باید پرداخت را واقعاً
//    نزد درگاه تایید کند (بخش TODO زیر — بسته به این‌که کدام درگاه ایرانی
//    استفاده می‌کنید، این بخش را تکمیل کنید)، سپس یک کد ۵ رقمی یکتا می‌سازد،
//    رکورد را paid=true می‌کند و کد را (فقط همین یک‌بار) به فرانت برمی‌گرداند
//    تا به مشتری نشان داده شود — چون طبق تصمیم پروژه، پیامک ارسال نمی‌شود.
//
// نکته امنیتی: این تابع از SUPABASE_SERVICE_ROLE_KEY استفاده می‌کند که فقط در
// محیط سرور Edge Function در دسترس است، هرگز به مرورگر ارسال نمی‌شود.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // در صورت تمایل، به دامنه سایت خودتان محدود کنید
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function randomOrderId(): string {
  return crypto.randomUUID();
}

/** تولید کد ۵ رقمی (۱۰۰۰۰ تا ۹۹۹۹۹) */
function randomCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

async function findUniqueCode(supabase: ReturnType<typeof createClient>): Promise<string> {
  // چون فضای کد فقط ۹۰٬۰۰۰ حالت است، قبل از استفاده، یکتا بودنش را چک می‌کنیم.
  for (let i = 0; i < 20; i++) {
    const code = randomCode();
    const { data } = await supabase.from("licenses").select("id").eq("code", code).maybeSingle();
    if (!data) return code;
  }
  throw new Error("no unique code found — رسیدن به این خطا یعنی جدول licenses تقریباً پر شده و باید فضای کد را بزرگ‌تر کنید");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();

    if (body.action === "start") {
      const phone = String(body.phone ?? "").trim();
      const fullName = String(body.fullName ?? "").trim();
      if (!/^09\d{9}$/.test(phone)) return json({ ok: false, msg: "شماره موبایل نامعتبر است" }, 400);
      if (!fullName) return json({ ok: false, msg: "نام و نام خانوادگی الزامی است" }, 400);

      const orderId = randomOrderId();
      // اگر شماره قبلاً سفارش ناتمام داشت، آن را با سفارش جدید جایگزین می‌کنیم
      // (upsert روی phone که unique است)
      const { error } = await supabase.from("licenses").upsert(
        { phone, full_name: fullName, code: "", paid: false, order_id: orderId },
        { onConflict: "phone" }
      );
      if (error) return json({ ok: false, msg: "خطای سرور: " + error.message }, 500);
      return json({ ok: true, orderId });
    }

    if (body.action === "verify") {
      const orderId = String(body.orderId ?? "");
      const gatewayRef = String(body.gatewayRef ?? ""); // مثلاً Authority در زرین‌پال
      if (!orderId) return json({ ok: false, msg: "شناسه سفارش نامعتبر است" }, 400);

      // ── TODO: تایید واقعی پرداخت نزد درگاه ──────────────────────────────
      // اینجا باید با API درگاه پرداختی که انتخاب می‌کنید (مثلاً زرین‌پال)
      // تماس بگیرید و مطمئن شوید gatewayRef واقعاً برای این مبلغ پرداخت شده.
      // مثال ساختار برای زرین‌پال (باید merchant_id را به‌صورت Secret در
      // تنظیمات Supabase ذخیره کنید: `supabase secrets set ZARINPAL_MERCHANT=...`):
      //
      //   const res = await fetch("https://api.zarinpal.com/pg/v4/payment/verify.json", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       merchant_id: Deno.env.get("ZARINPAL_MERCHANT"),
      //       amount: PRICE_IN_TOMAN * 10, // زرین‌پال ریال می‌گیرد
      //       authority: gatewayRef,
      //     }),
      //   });
      //   const data = await res.json();
      //   const paymentOk = data?.data?.code === 100 || data?.data?.code === 101;
      //
      // فعلاً تا این بخش تکمیل نشده، پرداخت را تایید نمی‌کنیم:
      const paymentOk = false;
      // ─────────────────────────────────────────────────────────────────────

      if (!paymentOk) return json({ ok: false, msg: "پرداخت تایید نشد" }, 402);

      const { data: row } = await supabase
        .from("licenses")
        .select("id, paid, code")
        .eq("order_id", orderId)
        .maybeSingle();
      if (!row) return json({ ok: false, msg: "سفارش یافت نشد" }, 404);
      if (row.paid && row.code) return json({ ok: true, code: row.code }); // idempotent

      const code = await findUniqueCode(supabase);
      const { error } = await supabase.from("licenses").update({ paid: true, code }).eq("id", row.id);
      if (error) return json({ ok: false, msg: "خطای سرور: " + error.message }, 500);

      return json({ ok: true, code });
    }

    return json({ ok: false, msg: "action نامعتبر است" }, 400);
  } catch (e) {
    return json({ ok: false, msg: "خطای غیرمنتظره: " + String(e) }, 500);
  }
});
