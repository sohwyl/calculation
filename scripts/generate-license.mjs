#!/usr/bin/env node
/**
 * اسکریپت صدور کد لایسنس — محاسبه‌گر تاسیسات یزد
 * --------------------------------------------------------------------------
 * این اسکریپت فقط روی سیستم/سرور خودتان اجرا می‌شود و هرگز بخشی از باندل
 * مرورگر نیست. منطق امضا دقیقاً همان چیزی است که در src/lib/license.ts
 * برای اعتبارسنجی استفاده می‌شود — اگر آن فایل را تغییر دادید، اینجا را هم
 * به‌روز کنید.
 *
 * استفاده:
 *   node scripts/generate-license.mjs [تعداد سال، پیش‌فرض ۱۰]
 *
 * مثال:
 *   node scripts/generate-license.mjs 1
 *   → یک کد لایسنس با اعتبار ۱ سال چاپ می‌کند.
 */

const SECRET = "tasisatyazd::mohasebe-ger::1404::yazd";
const SALT = "yz-pro";

function signature(input) {
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

function sign(exp) {
  return signature(`${exp}.${SALT}.${SECRET}`);
}

function generateCode(expYears = 10) {
  const exp = Date.now() + expYears * 365 * 24 * 3600 * 1000;
  return `TYZ-${exp}-${sign(exp)}`;
}

const years = Number(process.argv[2]) || 10;
const code = generateCode(years);

console.log(`کد لایسنس (اعتبار ${years} سال):`);
console.log(code);
