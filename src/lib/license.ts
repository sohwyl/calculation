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

const SECRET = "tasisatyazd::mohasebe-ger::1404::yazd";
const STORAGE_KEY = "tyz_license_v1";
const SALT = "yz-pro";
const CHANGE_EVENT = "tyz-license-change";
const OPEN_EVENT = "tyz-open-activation";

/** هش غیرخطی (FNV-1a ترکیب‌شده) برای ساخت امضا — مقاوم در برابر ویرایش دستی */
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

export interface License {
  pro: boolean;
  exp: number; // timestamp ms
}

export function readLicense(): License {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { pro: false, exp: 0 };
    const obj = JSON.parse(raw) as { exp?: number; sig?: string; v?: number };
    if (!obj || typeof obj.exp !== "number" || typeof obj.sig !== "string") {
      return { pro: false, exp: 0 };
    }
    // بررسی صحت امضا (مقاوم در برابر دستکاری دستی)
    if (obj.sig !== sign(obj.exp)) return { pro: false, exp: 0 };
    // بررسی انقضا
    if (Date.now() > obj.exp) return { pro: false, exp: 0 };
    return { pro: true, exp: obj.exp };
  } catch {
    return { pro: false, exp: 0 };
  }
}

export function isPro(): boolean {
  return readLicense().pro;
}

/** فعال‌سازی مستقیم (شبیه‌سازی صدور لایسنس از سمت سرور پس از پرداخت) */
export function activate(expYears = 10): boolean {
  const exp = Date.now() + expYears * 365 * 24 * 3600 * 1000;
  const payload = { exp, sig: sign(exp), v: 1 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  notify();
  return true;
}

export function clearLicense(): void {
  localStorage.removeItem(STORAGE_KEY);
  notify();
}

/** اعتبارسنجی کد فعال‌سازی (کد را سرور صادر می‌کند؛ اینجا بررسی امضا انجام می‌شود) */
export function redeemCode(code: string): { ok: boolean; msg: string } {
  const clean = code.trim().toUpperCase();
  // کدهای نمونه‌ی نمایشی (فقط برای تست در محیط توسعه)
  // نکته امنیتی: این کدها در محیط توسعه فعال‌اند تا بدون درگاه واقعی بتوانید تست
  // کنید. در بیلد نهایی (production) به‌طور خودکار غیرفعال می‌شوند تا در سورس
  // منتشرشده‌ی سایت قابل استفاده‌ی رایگان توسط کاربران نباشند.
  const demoCodes = import.meta.env.DEV
    ? ["TYZ-PRO-1404", "تاسیسات یزد", "TASISAT YAZD"]
    : [];
  if (demoCodes.includes(clean)) {
    activate();
    return { ok: true, msg: "کد فعال‌سازی معتبر است؛ نسخه تخصصی برای همیشه فعال شد." };
  }
  // کد رسمی: TYZ-<exp(ms)>-<sig>
  const parts = clean.split("-");
  if (parts.length === 3 && parts[0] === "TYZ") {
    const exp = parseInt(parts[1], 10);
    if (!Number.isNaN(exp) && sign(exp) === parts[2]) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ exp, sig: parts[2], v: 1 }));
      notify();
      return { ok: true, msg: "کد معتبر است؛ نسخه تخصصی فعال شد." };
    }
  }
  return { ok: false, msg: "کد واردشده نامعتبر است. لطفاً کد صحیح را وارد کنید." };
}

// نکته: تابع تولید کد لایسنس (generateCode) عمداً اینجا نگه داشته نمی‌شود چون
// هیچ کامپوننتی در برنامه به آن نیاز ندارد؛ نگه‌داشتنش در باندل مرورگر فقط
// سطح حمله را بیشتر می‌کند. برای صدور دستی کد لایسنس، از اسکریپت مستقل
// scripts/generate-license.mjs در ریشه‌ی پروژه استفاده کنید (روی سرور/کامپیوتر
// خودتان اجرا می‌شود، هرگز به مرورگر ارسال نمی‌شود).

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** درخواست باز کردن پنجره‌ی فعال‌سازی از هر جای برنامه */
export function requestActivation() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export { CHANGE_EVENT, OPEN_EVENT };
