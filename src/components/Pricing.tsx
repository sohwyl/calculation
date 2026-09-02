import SectionHeading from "./SectionHeading";
import { Check, Bolt, Sparkle, Shield } from "./Icons";
import { useIsPro } from "../hooks/useLicense";
import { requestActivation } from "../lib/license";
import { BlobField, FloatingShapes } from "./Decor";

const freeTools = ["رادیاتور", "پکیج", "کولر گازی / اسپلیت", "کولر آبی", "فاکتور PDF"];
const proTools = [
  "قطر لوله اصلی", "پمپ سیرکولاتور", "منبع انبساط", "لوله گاز", "دودکش",
  "افت فشار شبکه", "حجم آب سیستم", "عایق لوله", "انبساط خطی لوله", "پمپ آبرسانی بوستر",
  "گرمایش از کف", "کلکتور گرمایش کف", "زمان گرم شدن", "منبع آب گرم", "پمپ حرارتی",
  "شیر ترموستاتیک", "رادیاتور حوله‌ای", "دیگ موتورخانه", "بار حرارتی هر متر",
  "داکت و کانال", "چیلر و فن‌کوایل", "برج خنک‌کننده", "بار نهان و حساس", "دریچه و دیفیوزر",
  "فن تهویه (هواکش)", "رطوبت‌گیر", "هوای تازه",
  "مصرف گاز", "هزینه تجهیزات", "صرفه‌جویی عایق", "راندمان COP", "کلکتور خورشیدی",
  "توان برق سرمایش", "جریان برق", "مصرف برق سالانه",
  "آب روزانه", "منبع ذخیره آب", "آبگرمکن برقی", "چاه جذبی/سپتیک", "سختی‌گیر / رسوب‌گیر",
];

const COUNT = 40;

export default function Pricing() {
  const isPro = useIsPro();
  return (
    <section id="pricing" className="relative py-20">
      <BlobField />
      <FloatingShapes />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="تعرفه"
          title={<>رایگان شروع کن، <span className="text-gradient">یک‌بار ارتقا بده</span></>}
          desc="ابزارهای اصلی تاسیسات برای همه رایگان است. فقط برای دسترسی به ۴۰ ابزار تخصصی، یک‌بار و برای همیشه ۴۹٬۰۰۰ تومان پرداخت کن."
        />

        {/* نوار ارزش — نشان دادن طلای ناب بدون التماس */}
        <div className="reveal mx-auto mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl border border-amber-200 bg-amber-50/70 px-6 py-4 text-center" data-delay="80">
          <span className="text-sm font-bold text-slate-700">
            ۴۰ ابزار تخصصی ← تنها <b className="text-amber-600">۴۹٬۰۰۰ تومان</b>
          </span>
          <span className="hidden h-4 w-px bg-amber-300 sm:block" />
          <span className="text-xs text-slate-500">مبلغی <b className="text-teal-600">کوچک</b> در برابر دقت و آسایشی که برای همیشه به دست می‌آورید</span>
        </div>

        <div className="grid items-stretch gap-5 lg:grid-cols-2">
          {/* رایگان */}
          <div className="reveal flex flex-col rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-100 text-teal-700">
                  <Sparkle className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">رایگان</h3>
                  <p className="text-xs text-slate-500">برای همه، برای همیشه</p>
                </div>
              </div>
              <div className="text-left">
                <span className="text-3xl font-extrabold text-slate-900">۰</span>
                <span className="text-xs text-slate-500"> تومان</span>
              </div>
            </div>

            <p className="mb-3 mt-5 text-xs font-bold text-slate-400">ابزارهای اصلی تاسیسات</p>
            <div className="flex flex-wrap gap-2">
              {freeTools.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">
                  <Check className="h-3.5 w-3.5" /> {t}
                </span>
              ))}
            </div>

            <ul className="mb-6 mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
              {["محاسبه نامحدود", "بدون ثبت‌نام", "بدون تبلیغ", "کارکرد آفلاین"].map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 shrink-0 text-teal-600" /> {f}
                </li>
              ))}
            </ul>

            <a href="#calculator" className="mt-auto block rounded-2xl border-2 border-slate-200 bg-white py-3 text-center text-sm font-bold text-slate-800 transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:text-teal-700">
              رایگان محاسبه کن
            </a>
          </div>

          {/* تخصصی */}
          <div className="reveal relative flex flex-col rounded-3xl border border-transparent bg-gradient-to-b from-slate-900 to-teal-950 p-6 pt-5 text-white shadow-2xl shadow-teal-900/30 transition-all duration-500 hover:-translate-y-1 sm:p-7" data-delay="100">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="mx-auto mb-4 w-fit rounded-full bg-gradient-to-l from-amber-400 to-orange-500 px-5 py-1 text-xs font-bold text-white shadow-lg ring-1 ring-white/20">
              محبوب‌ترین انتخاب
            </div>

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-amber-300 ring-1 ring-white/15">
                  <Bolt className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-white">نسخه تخصصی</h3>
                  <p className="text-xs text-teal-200">دسترسی کامل، خرید همیشگی</p>
                </div>
              </div>
              <div className="text-left">
                <span className="text-3xl font-extrabold text-white">۴۹٬۰۰۰</span>
                <span className="text-xs text-teal-200"> تومان</span>
              </div>
            </div>

            <p className="relative mt-4 text-[11px] text-teal-200">یک‌بار پرداخت، مادام‌العمر استفاده — بدون اشتراک</p>

            <p className="relative mb-3 mt-4 text-xs font-bold text-teal-300">{COUNT} ابزار تخصصی نظام مهندسی</p>
            <div className="relative mb-5 flex max-h-[150px] flex-wrap content-start gap-1.5 overflow-y-auto [scrollbar-width:thin]">
              {proTools.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-200">
                  <Check className="h-3 w-3 text-amber-300" /> {t}
                </span>
              ))}
            </div>

            {isPro ? (
              <div className="relative mt-auto block rounded-2xl border-2 border-teal-400/40 bg-teal-500/10 py-3 text-center text-sm font-bold text-teal-200">
                <Shield className="mr-1 inline h-4 w-4" /> نسخه تخصصی شما فعال است
              </div>
            ) : (
              <button onClick={requestActivation} className="relative mt-auto block w-full rounded-2xl bg-gradient-to-l from-teal-500 to-sky-400 py-3 text-center text-sm font-bold text-white shadow-lg shadow-teal-500/40 transition-all hover:-translate-y-0.5">
                <Bolt className="mr-1 inline h-4 w-4" /> خرید نسخه تخصصی — ۴۹٬۰۰۰ تومان
              </button>
            )}
            <p className="relative mt-2 text-center text-[11px] text-slate-400">پرداخت یک‌بار • {COUNT} ابزار تخصصی • پشتیبانی فارسی</p>
          </div>
        </div>
      </div>
    </section>
  );
}
