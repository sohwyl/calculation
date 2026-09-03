<?php
/**
 * ارسال پیامک تک‌باره (بعد از خرید موفق) از طریق کاوه‌نگار.
 * اگر SMS_ENABLED در config.php برابر false باشد، این تابع کاری نمی‌کند —
 * سیستم بدون مشکل کار می‌کند و کد فقط روی صفحه‌ی سایت نمایش داده می‌شود.
 *
 * عمداً هیچ Exception ای بیرون نمی‌اندازد: شکست ارسال پیامک هرگز نباید باعث
 * شکست کل فرآیند خرید/صدور لایسنس شود (لایسنس مهم‌تر از پیامک است).
 */
function tyz_send_sms(array $config, string $phone, string $text): bool {
    if (empty($config["SMS_ENABLED"])) return false;
    if (empty($config["KAVENEGAR_API_KEY"])) return false;

    try {
        $url = "https://api.kavenegar.com/v1/" . rawurlencode($config["KAVENEGAR_API_KEY"]) . "/sms/send.json";
        $params = [
            "receptor" => $phone,
            "message" => $text,
        ];
        if (!empty($config["KAVENEGAR_SENDER"])) $params["sender"] = $config["KAVENEGAR_SENDER"];

        $ch = curl_init($url . "?" . http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 8);
        $res = curl_exec($ch);
        $ok = $res !== false && curl_getinfo($ch, CURLINFO_HTTP_CODE) < 300;
        curl_close($ch);
        return $ok;
    } catch (Throwable $e) {
        return false; // فقط شکست خاموش — لایسنس همچنان صادر می‌شود
    }
}
