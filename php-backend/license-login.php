<?php
/**
 * POST /php-backend/license-login.php
 * body: { phone, code }
 *
 * بعد از ۵ تلاش ناموفق برای یک شماره، ورود آن شماره ۱۰ دقیقه قفل می‌شود.
 * در موفقیت، توکنی امضاشده با کلید خصوصی ECDSA برمی‌گرداند که مرورگر با
 * کلید عمومی (هاردکد در src/lib/license.ts) تاییدش می‌کند.
 */

require __DIR__ . "/bootstrap.php";
require __DIR__ . "/db.php";
require __DIR__ . "/lib/ecdsa.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") tyz_json(["ok" => false, "msg" => "روش نامعتبر"], 405);

$body = tyz_read_json_body();
$phone = trim((string)($body["phone"] ?? ""));
$code = trim((string)($body["code"] ?? ""));

if (!tyz_valid_phone($phone) || !preg_match('/^\d{4,5}$/', $code)) {
    tyz_json(["ok" => false, "msg" => "شماره موبایل یا کد نامعتبر است"], 400);
}

$db = tyz_db();
$stmt = $db->prepare("SELECT * FROM licenses WHERE phone = :phone");
$stmt->execute([":phone" => $phone]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

// پیام یکسان برای «شماره وجود ندارد» و «کد اشتباه است» — مهاجم نباید از تفاوت
// پیام بفهمد کدام شماره‌ها در دیتابیس واقعی هستند.
$genericInvalid = fn() => tyz_json(["ok" => false, "msg" => "شماره موبایل یا کد لایسنس اشتباه است"], 401);

if (!$row || (int)$row["paid"] !== 1) $genericInvalid();

if ($row["locked_until"] && strtotime($row["locked_until"]) > time()) {
    tyz_json(["ok" => false, "msg" => "به دلیل تلاش‌های ناموفق زیاد، ورود این شماره موقتاً قفل است. کمی بعد دوباره امتحان کنید."], 429);
}

if (!hash_equals($row["code"], $code)) {
    $attempts = (int)$row["failed_attempts"] + 1;
    $maxAttempts = (int)($config["MAX_LOGIN_ATTEMPTS"] ?? 5);
    if ($attempts >= $maxAttempts) {
        $lockMinutes = (int)($config["LOCK_MINUTES"] ?? 10);
        $lockedUntil = date("Y-m-d H:i:s", time() + $lockMinutes * 60);
        $db->prepare("UPDATE licenses SET failed_attempts = 0, locked_until = :lu WHERE id = :id")
            ->execute([":lu" => $lockedUntil, ":id" => $row["id"]]);
    } else {
        $db->prepare("UPDATE licenses SET failed_attempts = :a WHERE id = :id")
            ->execute([":a" => $attempts, ":id" => $row["id"]]);
    }
    $genericInvalid();
}

// موفقیت‌آمیز
$db->prepare("UPDATE licenses SET failed_attempts = 0, locked_until = NULL, activated_at = COALESCE(activated_at, datetime('now')) WHERE id = :id")
    ->execute([":id" => $row["id"]]);

$tokenValidDays = (int)($config["TOKEN_VALID_DAYS"] ?? 730);
$exp = (int)(microtime(true) * 1000) + $tokenValidDays * 24 * 3600 * 1000;

try {
    $token = tyz_sign_token(["phone" => $phone, "exp" => $exp], $config["PRIVATE_KEY_PATH"]);
} catch (Throwable $e) {
    tyz_json(["ok" => false, "msg" => "خطای سرور در صدور توکن: " . $e->getMessage()], 500);
}

tyz_json(["ok" => true, "token" => $token]);
