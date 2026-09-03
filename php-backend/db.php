<?php
/**
 * اتصال دیتابیس — SQLite (یک فایل سبک، بدون نیاز به نصب MySQL روی هاست)
 */

function tyz_db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;

    $dbFile = __DIR__ . "/data/licenses.sqlite";
    $pdo = new PDO("sqlite:$dbFile");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("PRAGMA journal_mode = WAL;"); // پایداری بهتر برای نوشتن هم‌زمان

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS licenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL UNIQUE,
            full_name TEXT NOT NULL,
            code TEXT NOT NULL DEFAULT '',
            paid INTEGER NOT NULL DEFAULT 0,
            order_id TEXT,
            zarinpal_authority TEXT,
            amount_toman INTEGER,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            activated_at TEXT,
            failed_attempts INTEGER NOT NULL DEFAULT 0,
            locked_until TEXT
        );
    ");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);");

    return $pdo;
}
