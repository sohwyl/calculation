<?php
/**
 * تنظیمات بک‌اند لایسنس — این فایل را کپی کنید به «config.php» (کنار همین
 * فایل) و مقادیر واقعی خودتان را جایگزین کنید. «config.php» در .gitignore
 * است و هرگز نباید commit شود چون کلیدهای محرمانه دارد.
 */

return [
    // ── زرین‌پال ──────────────────────────────────────────────────────
    "ZARINPAL_MERCHANT_ID" => "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
    "ZARINPAL_SANDBOX" => false, // موقع تست اولیه true بگذارید (پرداخت آزمایشی، بدون پول واقعی)
    "PRICE_TOMAN" => 49000,

    // آدرس کامل سایت شما (برای بازگشت کاربر بعد از پرداخت)
    "SITE_URL" => "https://your-domain.example",
    // آدرس کامل همین پوشه‌ی php-backend روی هاست شما
    "API_URL" => "https://your-domain.example/php-backend",

    // ── پیامک (کاوه‌نگار) ────────────────────────────────────────────
    // اگر فعلاً پیامک نمی‌خواهید، SMS_ENABLED را false بگذارید — بقیه سیستم
    // بدون مشکل کار می‌کند و کد فقط روی صفحه نمایش داده می‌شود.
    "SMS_ENABLED" => false,
    "KAVENEGAR_API_KEY" => "",
    "KAVENEGAR_SENDER" => "", // شماره خط اختصاصی شما در کاوه‌نگار

    // ── امنیت ──────────────────────────────────────────────────────
    "PRIVATE_KEY_PATH" => __DIR__ . "/keys/private.pem",
    "MAX_LOGIN_ATTEMPTS" => 5,
    "LOCK_MINUTES" => 10,
    "TOKEN_VALID_DAYS" => 730,
];
