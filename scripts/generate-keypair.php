#!/usr/bin/env php
<?php
/**
 * تولید جفت‌کلید ECDSA (P-256) برای سیستم لایسنس.
 *
 * اجرا با: php scripts/generate-keypair.php
 *
 * خروجی:
 *  - php-backend/keys/private.pem  → کلید خصوصی؛ فقط روی هاست شما می‌ماند،
 *    هرگز commit نشود (در .gitignore هست). این فایل امضای توکن‌های لایسنس را
 *    انجام می‌دهد.
 *  - روی صفحه: مقدار PUBLIC_KEY_JWK که باید در src/lib/license.ts جای‌گذاری
 *    شود (افشای این مقدار مشکلی ندارد؛ فقط برای «تایید» امضا استفاده می‌شود).
 *
 * ⚠️ اگر دوباره اجرا کنید، کلید قبلی باطل می‌شود و لایسنس‌های صادرشده‌ی قبلی
 * دیگر معتبر شناخته نمی‌شوند. فقط برای چرخش واقعی کلید (مثلاً افشای کلید)
 * این کار را انجام دهید.
 */

function b64url(string $bin): string {
    return rtrim(strtr(base64_encode($bin), '+/', '-_'), '=');
}

$res = openssl_pkey_new([
    "curve_name" => "prime256v1",
    "private_key_type" => OPENSSL_KEYTYPE_EC,
]);
if (!$res) {
    fwrite(STDERR, "خطا: امکان ساخت کلید نیست. مطمئن شوید extension openssl فعال است.\n");
    exit(1);
}

openssl_pkey_export($res, $privPem);
$keyDir = __DIR__ . "/../php-backend/keys";
if (!is_dir($keyDir)) mkdir($keyDir, 0700, true);
file_put_contents("$keyDir/private.pem", $privPem);
chmod("$keyDir/private.pem", 0600);

$details = openssl_pkey_get_details($res);
$jwk = [
    "key_ops" => ["verify"], "ext" => true, "kty" => "EC", "crv" => "P-256",
    "x" => b64url($details["ec"]["x"]),
    "y" => b64url($details["ec"]["y"]),
];

echo "✅ کلید خصوصی ذخیره شد در: php-backend/keys/private.pem\n\n";
echo "این مقدار را در src/lib/license.ts، ثابت PUBLIC_KEY_JWK جای‌گذاری کنید:\n\n";
echo json_encode($jwk, JSON_PRETTY_PRINT) . "\n";
