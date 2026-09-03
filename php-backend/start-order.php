<?php
/**
 * POST /php-backend/start-order.php
 * body: { phone, fullName }
 *
 * ۱) نام و شماره را در دیتابیس ثبت می‌کند (paid=false).
 * ۲) از زرین‌پال یک "authority" برای این تراکنش می‌گیرد.
 * ۳) لینک صفحه‌ی پرداخت را برمی‌گرداند تا فرانت‌اند کاربر را به آن هدایت کند.
 */

require __DIR__ . "/bootstrap.php";
require __DIR__ . "/db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") tyz_json(["ok" => false, "msg" => "روش نامعتبر"], 405);

$body = tyz_read_json_body();
$phone = trim((string)($body["phone"] ?? ""));
$fullName = trim((string)($body["fullName"] ?? ""));

if (!tyz_valid_phone($phone)) tyz_json(["ok" => false, "msg" => "شماره موبایل نامعتبر است (باید مثلاً 09123456789 باشد)"], 400);
if ($fullName === "" || mb_strlen($fullName) < 2) tyz_json(["ok" => false, "msg" => "نام و نام خانوادگی را کامل وارد کنید"], 400);

$orderId = bin2hex(random_bytes(16));
$amountToman = (int)$config["PRICE_TOMAN"];

// درخواست پرداخت از زرین‌پال
$base = !empty($config["ZARINPAL_SANDBOX"]) ? "https://sandbox.zarinpal.com" : "https://api.zarinpal.com";
$callbackUrl = rtrim($config["API_URL"], "/") . "/verify-payment.php?orderId=" . $orderId;

$payload = [
    "merchant_id" => $config["ZARINPAL_MERCHANT_ID"],
    "amount" => $amountToman * 10, // زرین‌پال ریال می‌گیرد
    "callback_url" => $callbackUrl,
    "description" => "خرید نسخه تخصصی محاسبه‌گر تاسیسات یزد",
    "metadata" => ["mobile" => $phone],
];

$ch = curl_init("$base/pg/v4/payment/request.json");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 15,
]);
$res = curl_exec($ch);
$curlErr = curl_error($ch);
curl_close($ch);

if ($res === false) tyz_json(["ok" => false, "msg" => "اتصال به درگاه پرداخت ناموفق بود: $curlErr"], 502);

$data = json_decode($res, true);
$authority = $data["data"]["authority"] ?? null;
$code = $data["data"]["code"] ?? null;

if (!$authority || $code != 100) {
    $errMsg = $data["errors"]["message"] ?? "خطای نامشخص از درگاه پرداخت";
    tyz_json(["ok" => false, "msg" => "درگاه پرداخت: $errMsg"], 502);
}

// ثبت/به‌روزرسانی سفارش در دیتابیس (هر شماره فقط یک سفارش فعال دارد)
$db = tyz_db();
$stmt = $db->prepare("
    INSERT INTO licenses (phone, full_name, order_id, zarinpal_authority, amount_toman, paid, code)
    VALUES (:phone, :full_name, :order_id, :authority, :amount, 0, '')
    ON CONFLICT(phone) DO UPDATE SET
        full_name = excluded.full_name,
        order_id = excluded.order_id,
        zarinpal_authority = excluded.zarinpal_authority,
        amount_toman = excluded.amount_toman
");
$stmt->execute([
    ":phone" => $phone, ":full_name" => $fullName, ":order_id" => $orderId,
    ":authority" => $authority, ":amount" => $amountToman,
]);

$payUrl = ($base === "https://sandbox.zarinpal.com" ? "https://sandbox.zarinpal.com" : "https://www.zarinpal.com")
    . "/pg/StartPay/$authority";

tyz_json(["ok" => true, "redirectUrl" => $payUrl]);
