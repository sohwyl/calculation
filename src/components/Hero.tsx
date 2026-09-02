import { Boiler, Radiator, Cooler, Sparkle, Bolt, Shield, Clock, Check } from "./Icons";

// نتایج نمونه برای نمایش در باکس‌های شناور هیرو
const samples = [
  { icon: Boiler, badge: "نمونه محاسبه", title: "واحد ۶۰ متری در یزد", value: "پکیج ۲۴ کیلووات", color: "from-teal-500 to-teal-600" },
  { icon: Cooler, badge: "نمونه محاسبه", title: "سالن ۴۰ متری، طبقه آخر", value: "اسپلیت ۲۴۰۰۰ BTU", color: "from-sky-500 to-sky-600" },
  { icon: Radiator, badge: "نمونه محاسبه", title: "آپارتمان ۹۰ متری معتدل", value: "۱۰ متر رادیاتور پنلی", color: "from-orange-400 to-orange-500" },
];

const badges = [
  ["رایگان برای همیشه", "رادیاتور، پکیج و کولر بدون پرداخت"],
  ["نسخه تخصصی", "لوله، منبع انبساط، پمپ و گرمایش از کف"],
  ["فاکتور PDF", "ذخیره گزارش به‌صورت عکس یا PDF"],
] as const;

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-16 sm:pt-40 lg:pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-1/4 h-[520px] w-[520px] rounded-full bg-teal-300/30 blur-[120px] animate-float-slow" />
        <div className="absolute top-20 -left-32 h-[440px] w-[440px] rounded-full bg-sky-300/30 blur-[120px] animate-float-med" />
        <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-orange-200/40 blur-[120px] animate-float-slow" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10">
        {/* متن */}
        <div className="text-center lg:text-right">
          <span className="reveal inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-teal-700 shadow-sm">
            <Shield className="h-4 w-4" />
            مبتنی بر مباحث ۱۶ و ۱۹ مقررات ملی ساختمان • سازمان نظام مهندسی
          </span>

          <h1 className="reveal mt-6 text-4xl font-extrabold leading-[1.15] text-slate-900 sm:text-5xl" data-delay="80">
            محاسبه‌گر تاسیسات یزد
            <br />
            <span className="text-gradient font-display text-4xl sm:text-5xl lg:text-6xl">
              تاسیسات را ساده حساب کن، مطمئن بخر
            </span>
          </h1>

          <p className="reveal mx-auto mt-6 max-w-xl text-base leading-8 text-slate-600 lg:mx-0 lg:text-lg" data-delay="160">
            رادیاتور، پکیج، کولر آبی و کولر گازی کاملاً رایگان محاسبه کن؛ و برای محاسبات
            تخصصی مثل لوله، منبع انبساط و پمپ، نسخه کامل را فعال کن. با تکیه بر ضرایب اقلیم
            ایران و قواعد رایج طراحی تاسیسات، خروجی را به‌صورت فاکتور ذخیره کن.
          </p>

          <div className="reveal mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start" data-delay="240">
            <a href="#pricing" className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-teal-600 to-sky-500 px-7 py-4 text-base font-bold text-white shadow-xl shadow-teal-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-500/40 sm:w-auto">
              <Bolt className="h-5 w-5 transition-transform group-hover:scale-125" />
              فعال‌سازی نسخه تخصصی
            </a>
            <a href="#calculator" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/70 px-7 py-4 text-base font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:text-teal-700 sm:w-auto">
              <Sparkle className="h-5 w-5" />
              شروع محاسبه
            </a>
          </div>

          <div className="reveal mt-8 grid gap-3 sm:grid-cols-3" data-delay="320">
            {badges.map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-right shadow-sm">
                <b className="block text-sm text-slate-900">{title}</b>
                <span className="mt-1 block text-xs leading-6 text-slate-500">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* باکس‌های شناور پیشنهادی */}
        <div className="reveal relative" data-delay="200">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-teal-400/20 via-sky-400/20 to-orange-300/20 blur-3xl" />

          <div className="relative grid gap-4">
            {samples.map((s, i) => (
              <div
                key={s.title}
                className={"group relative flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-xl shadow-slate-900/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 " + (i % 2 === 0 ? "animate-float-slow" : "animate-float-med")}
                style={{ animationDelay: i * 0.6 + "s" }}
              >
                <span className={"grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg " + s.color}>
                  <s.icon className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">{s.badge}</span>
                  <p className="mt-1 truncate text-sm font-bold text-slate-700">{s.title}</p>
                  <p className="text-base font-extrabold text-slate-900">{s.value}</p>
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700">
                  <Check className="h-4 w-4" />
                </span>
              </div>
            ))}
          </div>

          {/* باکس آویزون فاکتور */}
          <div className="absolute -bottom-6 -left-3 hidden animate-float-med items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-slate-900/10 sm:flex" style={{ animationDelay: "1.2s" }}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-100 text-orange-600">
              <Clock className="h-5 w-5" />
            </span>
            <span className="text-xs">
              <b className="block text-slate-900">فاکتور PDF رایگان</b>
              <span className="text-slate-500">گزارش قابل ذخیره</span>
            </span>
          </div>

          {/* درخشش اعتماد */}
          <div className="absolute -top-3 right-2 hidden animate-float-slow items-center gap-1.5 rounded-2xl bg-white px-3 py-2 shadow-xl shadow-slate-900/10 sm:flex" style={{ animationDelay: "0.4s" }}>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-600 text-white text-[10px] font-bold">۹۸٪</span>
            <span className="text-[11px] font-bold text-slate-700">دقت محاسبه</span>
          </div>
        </div>
      </div>
    </section>
  );
}
