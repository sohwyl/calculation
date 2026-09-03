<?php
/**
 * GET /php-backend/verify-payment.php?orderId=...&Authority=...&Status=OK|NOK
 * (این آدرس را زرین‌پال بعد از پرداخت، با ریدایرکت مرورگر کاربر صدا می‌زند —
 * همان "callback_url" ای که در start-order.php ساختیم.)
 *
 * بعد از تایید واقعی پرداخت نزد زرین‌پال، کاربر را به سایت با
 * ?pay=ok&phone=...&code=... برمی‌گرداند (یا ?pay=fail در صورت شکست).
 * فرانت‌اند با دیدن این پارامترها خودش remoteLogin را صدا می‌زند تا توکن
 * امضاشده بگیرد — یعنی این فایل خودش امضا نمی‌کند، فقط از همان مسیر امن
 * license-login عبور می‌دهد.
 */

require __DIR__ . "/bootstrap.php";
require __DIR__ . "/db.php";

$siteUrl = rtrim($config["SITE_URL"], "/");

function tyz_redirect_fail(string $siteUrl): never {
    header("Location: $siteUrl/?pay=fail");
    exit;
}

$orderId = (string)($_GET["orderId"] ?? "");
$authority = (string)($_GET["Authority"] ?? "");
$status = (string)($_GET["Status"] ?? "");

if ($orderId === "") tyz_redirect_fail($siteUrl);

$db = tyz_db();
$stmt = $db->prepare("SELECT * FROM licenses WHERE order_id = :order_id");
$stmt->execute([":order_id" => $orderId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$row) tyz_redirect_fail($siteUrl);

// اگر قبلاً تایید شده (مثلاً کاربر صفحه را رفرش کرده)، دوباره همان کد را نشان بده
if ((int)$row["paid"] === 1 && $row["code"] !== "") {
    header("Location: $siteUrl/?pay=ok&phone=" . urlencode($row["phone"]) . "&code=" . urlencode($row["code"]));
    exit;
}

if ($status !== "OK" || $authority === "") tyz_redirect_fail($siteUrl);

$base = !empty($config["ZARINPAL_SANDBOX"]) ? "https://sandbox.zarinpal.com" : "https://api.zarinpal.com";
$payload = [
    "merchant_id" => $config["ZARINPAL_MERCHANT_ID"],
    "amount" => (int)$row["amount_toman"] * 10,
    "authority" => $authority,
];
$ch = curl_init("$base/pg/v4/payment/verify.json");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 15,
]);
$res = curl_exec($ch);
curl_close($ch);
if ($res === false) tyz_redirect_fail($siteUrl);

$data = json_decode($res, true);
$code = $data["data"]["code"] ?? null;
if ($code != 100 && $code != 101) tyz_redirect_fail($siteUrl); // پرداخت تایید نشد

// ── صدور کد ۵ رقمی یکتا ─────────────────────────────────────────────────
function tyz_unique_code(PDO $db): string {
    for ($i = 0; $i < 30; $i++) {
        $c = (string) random_int(10000, 99999);
        $s = $db->prepare("SELECT 1 FROM licenses WHERE code = :c");
        $s->execute([":c" => $c]);
        if (!$s->fetch()) return $c;
    }
    throw new Exception("فضای کد تقریباً پر شده — باید طول کد را افزایش دهید");
}

$licenseCode = tyz_unique_code($db);
$upd = $db->prepare("UPDATE licenses SET paid = 1, code = :code WHERE id = :id");
$upd->execute([":code" => $licenseCode, ":id" => $row["id"]]);

require __DIR__ . "/lib/sms.php";
tyz_send_sms(
    $config,
    $row["phone"],
    "محاسبه‌گر تاسیسات یزد\nکد لایسنس شما: $licenseCode\nاین کد را در بخش «شماره موبایل + کد لایسنس» وارد کنید."
);

header("Location: $siteUrl/?pay=ok&phone=" . urlencode($row["phone"]) . "&code=" . urlencode($licenseCode));
