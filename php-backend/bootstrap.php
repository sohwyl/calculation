<?php
/**
 * بوت‌استرپ مشترک: بارگذاری تنظیمات + هدرهای CORS/JSON.
 * در ابتدای هر endpoint با require گفته می‌شود.
 */

$configPath = __DIR__ . "/config.php";
if (!file_exists($configPath)) {
    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(["ok" => false, "msg" => "config.php تنظیم نشده است — از config.example.php کپی کنید."]);
    exit;
}
$config = require $configPath;

// در صورت تمایل، Access-Control-Allow-Origin را به دامنه‌ی سایت خودتان محدود کنید
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

function tyz_json(array $body, int $status = 200): void {
    http_response_code($status);
    echo json_encode($body);
    exit;
}

function tyz_read_json_body(): array {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function tyz_valid_phone(string $phone): bool {
    return (bool) preg_match('/^09\d{9}$/', $phone);
}
