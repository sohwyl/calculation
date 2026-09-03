import { useEffect, useState } from "react";
import { useIsPro, onActivationRequest } from "../hooks/useLicense";
import { activate, clearLicense, redeemCode, remoteLogin } from "../lib/license";
import { Bolt, Shield, Check, Sparkle } from "./Icons";

/* ════════════════════════════════════════════════════════════════
 *  🔗 لینک درگاه پرداخت اختصاصی
 *  این مقدار را با آدرس درگاه واقعی خود جایگزین کنید.
 *  مثال: "https://your-gateway.ir/pay?amount=49000"
 *  تا زمانی که خالی باشد، برای پیش‌نمایش، روند پرداخت موفق شبیه‌سازی می‌شود.
 * ════════════════════════════════════════════════════════════════ */
const GATEWAY_URL = "";

type Stage = "choose" | "gateway" | "success" | "failed";

const PERKS = [
  "۴۰ ابزار مهندسی تخصصی",
  "نمایش فرمول‌های محاسبه",
  "فاکتور و گزارش کامل PDF",
  "بروزرسانی‌های آینده رایگان",
];

export default function ActivationModal() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("choose");
  const isPro = useIsPro();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // باز شدن با رویداد درخواست فعال‌سازی
  useEffect(() => onActivationRequest(() => { setStage("choose"); setOpen(true); }), []);

  // بازگشت از درگاه واقعی با پارامتر ?pay=ok|fail
  // TODO (در انتظار انتخاب درگاه پرداخت — طبق برنامه، آخر کار تکمیل می‌شود):
  // با معماری جدید (شماره موبایل + کد ۵ رقمی)، روند صحیح این است که بعد از
  // بازگشت از درگاه، اکشن "verify" تابع create-license صدا زده شود (نه
  // redeemCode قدیمی)، کد ۵ رقمی از پاسخ گرفته و مستقیم به کاربر نمایش داده
  // شود (چون طبق تصمیم پروژه، پیامک ارسال نمی‌کنیم). فعلاً این بخش placeholder
  // است و redeemCode قدیمی را صدا می‌زند که فقط در DEV کار می‌کند.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pay = params.get("pay");
    const returnedCode = params.get("code");
    if (pay === "ok") {
      if (returnedCode) {
        const res = redeemCode(returnedCode);
        setStage(res.ok ? "success" : "failed");
        setOpen(true);
      } else if (import.meta.env.DEV) {
        // فقط در محیط توسعه، برای تست بدون درگاه واقعی، فعال‌سازی مستقیم مجاز است.
        activate();
        setStage("success");
        setOpen(true);
      } else {
        // در نسخه‌ی نهایی، بدون کد معتبر از درگاه، فعال‌سازی انجام نمی‌شود.
        setStage("failed");
        setOpen(true);
      }
    }
    if (pay === "fail") { setStage("failed"); setOpen(true); }
  }, []);

  if (!open) return null;

  function handleRedeem() {
    const res = redeemCode(code);
    setMsg({ ok: res.ok, text: res.msg });
    if (res.ok) { activate(); setTimeout(() => { setStage("success"); }, 300); }
  }

  async function handleRemoteLogin() {
    setLoggingIn(true);
    setMsg(null);
    const res = await remoteLogin(phone.trim(), loginCode.trim());
    setLoggingIn(false);
    setMsg({ ok: res.ok, text: res.msg });
    if (res.ok) setTimeout(() => { setStage("success"); }, 300);
  }

  function handlePay() {
    setStage("gateway");
    if (GATEWAY_URL) {
      // هدایت واقعی به درگاه اختصاصی
      setTimeout(() => { window.location.href = GATEWAY_URL; }, 1600);
      return;
    }
    if (import.meta.env.DEV) {
      // شبیه‌سازی بازگشت موفق از درگاه — فقط برای پیش‌نمایش در محیط توسعه.
      setTimeout(() => { activate(); setStage("success"); }, 2200);
      return;
    }
    // نکته امنیتی: در نسخه‌ی نهایی (production build) اگر GATEWAY_URL تنظیم نشده
    // باشد، دیگر Pro به‌صورت رایگان فعال نمی‌شود — وگرنه هر کاربری بدون پرداخت
    // به نسخه‌ی تخصصی دسترسی پیدا می‌کند. باید پیش از انتشار، GATEWAY_URL را
    // با آدرس درگاه پرداخت واقعی پر کنید.
    setTimeout(() => { setStage("failed"); }, 800);
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => stage !== "gateway" && setOpen(false)}>
      <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white shadow-2xl transition-all" onClick={(e) => e.stopPropagation()}>

        {/* ─────────────── مرحله موفقیت (سبز/آبی) ─────────────── */}
        {stage === "success" && (
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-teal-600 to-sky-600 p-7 text-center text-white">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-sky-300/30 blur-3xl" />
            <button onClick={() => setOpen(false)} className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-lg bg-white/15 text-white/80 transition hover:text-white">✕</button>

            <div className="relative mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-white shadow-xl" style={{ animation: "pop 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
              <Check className="h-10 w-10 text-teal-600" />
            </div>
            <h3 className="relative text-2xl font-extrabold">خرید موفق بود! 🎉</h3>
            <p className="relative mt-2 text-sm text-teal-50">نسخه تخصصی برای همیشه فعال شد. حالا صاحب ابزار کامل تاسیسات هستید.</p>

            <div className="relative mt-5 space-y-2 text-right">
              {PERKS.map((p) => (
                <div key={p} className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white">
                  <Check className="h-4 w-4 shrink-0" /> {p}
                </div>
              ))}
            </div>

            <button onClick={() => { setOpen(false); setStage("choose"); }} className="relative mt-6 w-full rounded-2xl bg-white py-3.5 text-sm font-bold text-teal-700 shadow-lg transition hover:-translate-y-0.5">
              <Bolt className="mr-1 inline h-4 w-4" /> شروع استفاده از ابزارها
            </button>
            <style>{`@keyframes pop{0%{transform:scale(0)}60%{transform:scale(1.15)}100%{transform:scale(1)}}`}</style>
          </div>
        )}

        {/* ─────────────── مرحله ناموفق (قرمز) ─────────────── */}
        {stage === "failed" && (
          <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 p-7 text-center text-white">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <button onClick={() => setOpen(false)} className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-lg bg-white/15 text-white/80 transition hover:text-white">✕</button>
            <div className="relative mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-white shadow-xl">
              <span className="text-4xl font-extrabold text-rose-600">✕</span>
            </div>
            <h3 className="relative text-2xl font-extrabold">پرداخت کامل نشد</h3>
            <p className="relative mt-2 text-sm text-rose-50">به نظر می‌رسد پرداخت لغو شد یا ناموفق بود. می‌توانید دوباره تلاش کنید.</p>
            <div className="relative mt-6 flex flex-col gap-2">
              <button onClick={() => setStage("choose")} className="w-full rounded-2xl bg-white py-3.5 text-sm font-bold text-rose-600 shadow-lg transition hover:-translate-y-0.5">
                تلاش مجدد
              </button>
              <button onClick={() => setOpen(false)} className="w-full rounded-2xl bg-white/15 py-3 text-sm font-semibold text-white transition hover:bg-white/25">
                ادامه با نسخه رایگان
              </button>
            </div>
          </div>
        )}

        {/* ─────────────── مرحله درگاه ─────────────── */}
        {stage === "gateway" && (
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-teal-950 p-8 text-center text-white">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/30 blur-3xl" />
            <div className="relative mx-auto mb-5 h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#ffffff22" strokeWidth="5" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#14b8a6" strokeWidth="5" strokeLinecap="round" strokeDasharray="50 150" style={{ animation: "gw-spin 1s linear infinite", transformOrigin: "center" }} />
              </svg>
            </div>
            <h3 className="relative text-lg font-extrabold">در حال اتصال به درگاه پرداخت…</h3>
            <p className="relative mt-2 text-sm text-slate-300">پرداخت کاملاً امن و رمزنگاری‌شده است. لطفاً صبر کنید.</p>
            <style>{`@keyframes gw-spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* ─────────────── مرحله انتخاب (پیش‌فرض) ─────────────── */}
        {stage === "choose" && (
          <>
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-6 text-white">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/30 blur-3xl" />
              <button onClick={() => setOpen(false)} className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white/80 transition hover:text-white">✕</button>
              <div className="relative flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <Shield className="h-6 w-6 text-amber-300" />
                </span>
                <div>
                  <p className="text-lg font-extrabold">فعال‌سازی نسخه تخصصی</p>
                  <p className="text-[11px] text-teal-200">با ۴۹٬۰۰۰ تومان یک‌بار، مادام‌العمر صاحب شوید</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6">
              {isPro ? (
                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 text-center">
                  <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-teal-600 text-white"><Check className="h-6 w-6" /></span>
                  <p className="text-sm font-extrabold text-teal-800">نسخه تخصصی شما فعال است</p>
                  <button onClick={() => { clearLicense(); setMsg(null); }} className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 transition hover:text-red-500">غیرفعال‌سازی</button>
                </div>
              ) : (
                <>
                  {/* خرید */}
                  <button onClick={handlePay} className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-gradient-to-l from-teal-600 to-sky-500 p-4 text-right text-white shadow-lg shadow-teal-500/30 transition hover:-translate-y-0.5">
                    <span>
                      <span className="block text-sm font-extrabold">پرداخت امن و شفاف</span>
                      <span className="block text-[11px] text-teal-100">۴۹٬۰۰۰ تومان — فعال‌سازی آنی و همیشگی</span>
                    </span>
                    <span className="shrink-0 text-left">
                      <b className="block text-lg leading-none">۴۹٬۰۰۰</b>
                      <span className="text-[10px] text-teal-100">تومان</span>
                    </span>
                  </button>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" /> قبلاً خرید کرده‌اید؟ وارد شوید <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="space-y-2">
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="شماره موبایل (مثلاً 09123456789)" dir="ltr" inputMode="numeric" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-center text-sm font-bold tracking-widest text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white" />
                    <input value={loginCode} onChange={(e) => setLoginCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRemoteLogin()} placeholder="کد لایسنس (۵ رقم)" dir="ltr" inputMode="numeric" maxLength={5} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-center text-sm font-bold tracking-[0.3em] text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white" />
                    <button onClick={handleRemoteLogin} disabled={loggingIn} className="mt-1 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal-700 disabled:opacity-60">
                      <Sparkle className="mr-1 inline h-4 w-4" /> {loggingIn ? "در حال بررسی…" : "ورود"}
                    </button>
                    {msg && (
                      <p className={"mt-2 rounded-lg px-3 py-2 text-center text-xs font-semibold " + (msg.ok ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-600")}>{msg.text}</p>
                    )}
                  </div>

                  {/* فرم قدیمی کد تکی — فقط برای تست محلی بدون نیاز به سرور، در نسخه نهایی رندر نمی‌شود */}
                  {import.meta.env.DEV && (
                    <div className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3">
                      <p className="text-center text-[10px] font-bold text-slate-400">(فقط DEV) کد تکی قدیمی برای تست سریع</p>
                      <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRedeem()} placeholder="مثلاً TYZ-PRO-1404" dir="ltr" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-center text-sm font-bold tracking-widest text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white" />
                      <button onClick={handleRedeem} className="w-full rounded-xl bg-slate-700 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
                        فعال‌سازی با کد قدیمی (dev)
                      </button>
                    </div>
                  )}

                  <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[11px] leading-5 text-amber-700">
                    <Bolt className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>با این خرید، ۴۰ ابزار مهندسی، فرمول‌ها و فاکتور کامل را برای همیشه آزاد می‌کنید.</p>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
