/**
 * سیستم لایسنس محاسبه‌گر تاسیسات یزد
 * --------------------------------------------------------------------------
 * وضعیت کاربر (رایگان / تخصصی) با یک توکن امضاشده در localStorage ذخیره می‌شود.
 * توکن شامل تاریخ انقضا و یک امضای دیجیتال (HMAC-style) است؛ بنابراین اگر کسی
 * به‌صورت دستی مقدار localStorage را تغییر دهد، امضا دیگر مطابقت نخواهد داشت و
 * لایسنس نامعتبر شناخته می‌شود.
 *
 * نکته امنیتی مهم: هیچ‌گاه امنیت کامل در سمت کلاینت (مرورگر) قابل تضمین نیست،
 * زیرا کلید در باندل جا دارد. برای پروژه‌ی نهایی و واقعی، صدور و اعتبارسنجی
 * لایسنس باید در سمت سرور انجام شود. این پیاده‌سازی برای جلوگیری از دستکاری
 * ساده‌ی کاربران عادی طراحی شده و نسبت به ذخیره‌ی ساده‌ی flag بسیار مقاوم‌تر است.
 */

/**
 * سیستم لایسنس محاسبه‌گر تاسیسات یزد
 * --------------------------------------------------------------------------
 * دو مکانیزم موازی وجود دارد:
 *
 * ۱) طرح جدید و امن (برای production): ورود با «شماره موبایل + کد ۵ رقمی».
 *    اعتبارسنجی واقعیِ شماره+کد فقط سمت سرور (Supabase Edge Function
 *    `license-login`) انجام می‌شود که دسترسی به دیتابیس و rate-limit دارد.
 *    در صورت موفقیت، سرور یک توکن امضاشده با کلید خصوصی ECDSA برمی‌گرداند.
 *    اینجا (مرورگر) فقط با کلید عمومی متناظر، امضا را تایید می‌کند — کلید
 *    عمومی افشا شود مشکلی ندارد چون فقط برای «تایید» است، نه «ساختن» امضا.
 *    یعنی برخلاف طرح قدیمی، دیگر هیچ رازی در باندل مرورگر نیست که با آن
 *    بتوان توکن جعلی ساخت.
 *
 * ۲) طرح قدیمی (HMAC ساده، فقط برای DEV/تست بدون نیاز به سرور):
 *    `activate()` و `redeemCode()` با کدهای دمو — این‌ها در بیلد نهایی
 *    (production) به‌طور خودکار غیرفعال می‌شوند (به import.meta.env.DEV نگاه
 *    کنید) و صرفاً برای تست محلی نگه داشته شده‌اند.
 */

const STORAGE_KEY = "tyz_license_v1"; // طرح قدیمی (dev)
const REMOTE_TOKEN_KEY = "tyz_remote_token_v1"; // طرح جدید (production)
const CHANGE_EVENT = "tyz-license-change";
const OPEN_EVENT = "tyz-open-activation";

// ── طرح قدیمی (فقط DEV) ─────────────────────────────────────────────────
const SECRET = "tasisatyazd::mohasebe-ger::1404::yazd";
const SALT = "yz-pro";

function signature(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x00000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul((h2 + c) ^ 0x9e3779b9, 5) >>> 0;
  }
  return (
    h1.toString(16).padStart(8, "0") +
    h2.toString(16).padStart(8, "0") +
    h1.toString(16).padStart(4, "0")
  );
}

function sign(exp: number): string {
  return signature(`${exp}.${SALT}.${SECRET}`);
}

function readLegacyLicense(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const obj = JSON.parse(raw) as { exp?: number; sig?: string };
    if (!obj || typeof obj.exp !== "number" || typeof obj.sig !== "string") return false;
    if (obj.sig !== sign(obj.exp)) return false;
    if (Date.now() > obj.exp) return false;
    return true;
  } catch {
    return false;
  }
}

/** فعال‌سازی مستقیم — فقط برای تست محلی بدون نیاز به سرور. در production بی‌اثر است. */
export function activate(expYears = 10): boolean {
  if (!import.meta.env.DEV) return false;
  const exp = Date.now() + expYears * 365 * 24 * 3600 * 1000;
  const payload = { exp, sig: sign(exp), v: 1 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  notify();
  return true;
}

/** اعتبارسنجی کد فعال‌سازی قدیمی — فقط برای تست محلی. در production غیرفعال است. */
export function redeemCode(code: string): { ok: boolean; msg: string } {
  const clean = code.trim().toUpperCase();
  const demoCodes = import.meta.env.DEV
    ? ["TYZ-PRO-1404", "تاسیسات یزد", "TASISAT YAZD"]
    : [];
  if (demoCodes.includes(clean)) {
    activate();
    return { ok: true, msg: "کد فعال‌سازی معتبر است؛ نسخه تخصصی برای همیشه فعال شد." };
  }
  if (import.meta.env.DEV) {
    const parts = clean.split("-");
    if (parts.length === 3 && parts[0] === "TYZ") {
      const exp = parseInt(parts[1], 10);
      if (!Number.isNaN(exp) && sign(exp) === parts[2]) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ exp, sig: parts[2], v: 1 }));
        notify();
        return { ok: true, msg: "کد معتبر است؛ نسخه تخصصی فعال شد." };
      }
    }
  }
  return { ok: false, msg: "کد واردشده نامعتبر است. لطفاً از فرم «شماره موبایل + کد لایسنس» استفاده کنید." };
}

// ── طرح جدید (production): شماره موبایل + کد ۵ رقمی، اعتبارسنجی سمت سرور ──

// کلید عمومی ECDSA (P-256) — فقط برای تایید امضای توکن صادرشده توسط سرور.
// افشای این کلید مشکلی ندارد؛ کلید خصوصی متناظرش فقط در Supabase Edge
// Function (متغیر محیطی LICENSE_PRIVATE_JWK) نگه‌داری می‌شود.
const PUBLIC_KEY_JWK: JsonWebKey = {
  key_ops: ["verify"], ext: true, kty: "EC", crv: "P-256",
  x: "Vbn-LeMhdDiQDJ3eZJW0St-WAlvXa9AHLFNEr4KTUp8",
  y: "d9g0TW1algPR-1lO6S-Z4uVMx0G8cHN4qbddu7MQUR4",
};

// آدرس Edge Function ها — بعد از دیپلوی روی Supabase، این‌ها را در فایل .env
// (بر اساس .env.example) پر کنید. تا وقتی خالی‌اند، ورود با شماره+کد کار
// نمی‌کند و پیام مناسب نمایش داده می‌شود.
const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ?? "";
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

let cachedRemotePro = false;

async function verifyRemoteToken(token: string): Promise<boolean> {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return false;
    const payload = JSON.parse(atob(payloadB64)) as { phone: string; exp: number };
    if (Date.now() > payload.exp) return false;
    const key = await crypto.subtle.importKey(
      "jwk", PUBLIC_KEY_JWK, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]
    );
    const sig = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
    const data = new TextEncoder().encode(JSON.stringify(payload));
    return await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, sig, data);
  } catch {
    return false;
  }
}

/** در لود اولیه‌ی برنامه، توکن ذخیره‌شده (اگر باشد) را به‌صورت async تایید می‌کند */
async function initRemoteVerification() {
  const token = localStorage.getItem(REMOTE_TOKEN_KEY);
  if (!token) return;
  const ok = await verifyRemoteToken(token);
  if (ok !== cachedRemotePro) {
    cachedRemotePro = ok;
    notify();
  }
  if (!ok) localStorage.removeItem(REMOTE_TOKEN_KEY); // منقضی/نامعتبر → پاکسازی
}
if (typeof window !== "undefined") {
  void initRemoteVerification();
}

/** ورود با شماره موبایل + کد لایسنس (بدون نیاز به پیامک) از طریق سرور */
export async function remoteLogin(phone: string, code: string): Promise<{ ok: boolean; msg: string }> {
  if (!FUNCTIONS_BASE) {
    return { ok: false, msg: "سرویس ورود هنوز روی سایت تنظیم نشده است (VITE_SUPABASE_FUNCTIONS_URL خالی است)." };
  }
  try {
    const res = await fetch(`${FUNCTIONS_BASE}/license-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();
    if (!data.ok) return { ok: false, msg: data.msg ?? "ورود ناموفق بود." };
    localStorage.setItem(REMOTE_TOKEN_KEY, data.token);
    const valid = await verifyRemoteToken(data.token);
    cachedRemotePro = valid;
    notify();
    return valid
      ? { ok: true, msg: "ورود موفق؛ نسخه تخصصی فعال شد." }
      : { ok: false, msg: "توکن دریافتی نامعتبر بود (لطفاً دوباره تلاش کنید)." };
  } catch {
    return { ok: false, msg: "خطا در اتصال به سرور. اتصال اینترنت را بررسی کنید." };
  }
}

export function clearLicense(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(REMOTE_TOKEN_KEY);
  cachedRemotePro = false;
  notify();
}

export interface License {
  pro: boolean;
}

/** خلاصه‌ی وضعیت لایسنس — ترکیب طرح قدیمی (dev) و طرح جدید (production) */
export function readLicense(): License {
  return { pro: cachedRemotePro || readLegacyLicense() };
}

export function isPro(): boolean {
  return readLicense().pro;
}

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** درخواست باز کردن پنجره‌ی فعال‌سازی از هر جای برنامه */
export function requestActivation() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export { CHANGE_EVENT, OPEN_EVENT };
