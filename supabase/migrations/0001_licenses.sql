-- محاسبه‌گر تاسیسات یزد — جدول لایسنس‌ها
-- --------------------------------------------------------------------------
-- نکته امنیتی مهم: RLS (Row Level Security) فعال است و هیچ policy ای برایش
-- تعریف نشده، یعنی نه کاربر anonymous و نه هیچ کلاینتی نمی‌تواند مستقیماً این
-- جدول را بخواند/بنویسد. تنها راه دسترسی، از طریق Edge Function هاست که با
-- service_role key کار می‌کنند (کلیدی که هرگز به مرورگر ارسال نمی‌شود).

create table if not exists licenses (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  full_name text not null,
  code text not null,               -- کد ۵ رقمی (به همراه شماره موبایل، برای ورود)
  paid boolean not null default false,
  order_id text,                    -- شناسه تراکنش درگاه پرداخت (برای پیگیری)
  created_at timestamptz not null default now(),
  activated_at timestamptz,         -- اولین باری که با موفقیت وارد شد
  failed_attempts int not null default 0,
  locked_until timestamptz          -- اگر ست باشد و در آینده باشد، ورود قفل است
);

create index if not exists licenses_phone_idx on licenses (phone);

alter table licenses enable row level security;
-- عمداً هیچ policy ای اینجا اضافه نمی‌شود (deny-by-default برای anon/authenticated).
