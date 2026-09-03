#!/usr/bin/env node
/**
 * تولید جفت‌کلید ECDSA (P-256) برای سیستم لایسنس محاسبه‌گر تاسیسات یزد.
 *
 * استفاده:
 *   node scripts/generate-keypair.mjs
 *
 * خروجی دو مقدار می‌دهد:
 *  - PUBLIC_JWK  → باید در src/lib/license.ts (ثابت PUBLIC_KEY_JWK) قرار بگیرد
 *  - PRIVATE_JWK → باید فقط به‌عنوان Secret در Supabase تنظیم شود، هرگز commit
 *    نشود:
 *      supabase secrets set LICENSE_PRIVATE_JWK='<PRIVATE_JWK را اینجا بگذارید>'
 *
 * ⚠️ اگر این اسکریپت را دوباره اجرا کنید، کلید قبلی باطل می‌شود و توکن‌های
 * صادرشده‌ی قبلی (مشتری‌های قبلی) دیگر معتبر شناخته نمی‌شوند — فقط برای چرخش
 * واقعی کلید (مثلاً در صورت افشا شدن) این کار را انجام دهید.
 */
import { webcrypto } from "crypto";

const { subtle } = webcrypto;

const kp = await subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const pub = await subtle.exportKey("jwk", kp.publicKey);
const priv = await subtle.exportKey("jwk", kp.privateKey);

console.log("PUBLIC_JWK (برای src/lib/license.ts):");
console.log(JSON.stringify(pub));
console.log();
console.log("PRIVATE_JWK (برای Supabase secret — هرگز commit نکنید):");
console.log(JSON.stringify(priv));
