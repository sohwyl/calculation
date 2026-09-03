<?php
/**
 * امضای دیجیتال ECDSA (P-256) سازگار با WebCrypto مرورگر.
 *
 * نکته فنی مهم: PHP/OpenSSL امضا را با فرمت DER (ASN.1) تولید می‌کند، اما
 * WebCrypto مرورگر (crypto.subtle.verify) فرمت raw (r||s با طول ثابت ۳۲+۳۲
 * بایت) می‌خواهد. تابع derToRaw این تبدیل را انجام می‌دهد. این سازگاری با
 * تست عملی (امضا در PHP، تایید با Node.js/WebCrypto) تایید شده است.
 */

function tyz_der_to_raw(string $der, int $len = 32): string {
    $offset = 0;
    if (ord($der[$offset]) !== 0x30) throw new Exception("امضای نامعتبر (DER)");
    $offset++;
    $seqLen = ord($der[$offset]);
    $offset++;
    if ($seqLen === 0x81) $offset++; // طول بلندتر یک‌بایتی احتمالی (نادر برای P-256)

    $readInt = function () use ($der, &$offset, $len) {
        if (ord($der[$offset]) !== 0x02) throw new Exception("امضای نامعتبر (INTEGER)");
        $offset++;
        $l = ord($der[$offset]);
        $offset++;
        $bytes = substr($der, $offset, $l);
        $offset += $l;
        $bytes = ltrim($bytes, "\x00"); // حذف صفر پیشرو (padding علامت مثبت در DER)
        return str_pad($bytes, $len, "\x00", STR_PAD_LEFT);
    };

    $r = $readInt();
    $s = $readInt();
    return $r . $s;
}

/** امضای payload با کلید خصوصی؛ خروجی: base64(payloadJson) + "." + base64(rawSig) */
function tyz_sign_token(array $payload, string $privateKeyPath): string {
    $priv = openssl_pkey_get_private(file_get_contents($privateKeyPath));
    if (!$priv) throw new Exception("خواندن کلید خصوصی ناموفق بود");
    $json = json_encode($payload);
    openssl_sign($json, $der, $priv, OPENSSL_ALGO_SHA256);
    $raw = tyz_der_to_raw($der);
    return base64_encode($json) . "." . base64_encode($raw);
}
