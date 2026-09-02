import { Bolt, Phone, Boiler, Radiator, Cooler, Sparkle, Check } from "./Icons";

const productCats = [
  "پکیج دیواری",
  "پکیج زمینی",
  "رادیاتور پنلی فولادی",
  "رادیاتور آلومینیومی",
  "کولر گازی سرد و گرم",
  "حوله خشک‌کن",
  "دستگاه تصفیه آب",
  "لوازم خانگی اقتصادی",
];

const links = [
  "محاسبه‌گر رادیاتور",
  "محاسبه‌گر پکیج",
  "محاسبه‌گر کولر گازی",
  "محاسبه‌گر کولر آبی",
  "نسخه تخصصی",
  "سوالات متداول",
];

const features = ["مشاوره تخصصی", "پشتیبانی آنلاین", "ضمانت اصالت کالا", "ارسال سریع در یزد"];

export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200 bg-slate-950 pt-16 text-slate-300">
      {/* Top feature strip (matching tasisatyazd.ir) */}
      <div className="mx-auto mb-14 max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {features.map((f) => (
            <div key={f} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-sm font-bold text-teal-200">
              <Check className="h-5 w-5 shrink-0 text-teal-400" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 pb-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="https://tasisatyazd.ir/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-600 to-sky-500 text-white shadow-lg shadow-teal-500/30">
                <Bolt className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block text-[15px] font-extrabold text-white">محاسبه‌گر تاسیسات یزد</span>
                <span className="block text-[11px] font-medium text-teal-400">زیرمجموعه فروشگاه تاسیسات یزد</span>
              </span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              دستیار هوشمند شما برای محاسبه دقیق سیستم گرمایش و سرمایش. مبتنی بر مباحث ۱۶ و ۱۹
              مقررات ملی ساختمان و تجربه فروشگاه تخصصی پکیج، رادیاتور و کولر گازی تاسیسات یزد.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: Boiler, label: "پکیج" },
                { icon: Radiator, label: "رادیاتور" },
                { icon: Cooler, label: "کولر گازی" },
                { icon: Sparkle, label: "تصفیه آب" },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                  <b.icon className="h-4 w-4 text-teal-400" />
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Product categories */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">دسته‌بندی محصولات</h4>
            <ul className="space-y-2.5">
              {productCats.map((p) => (
                <li key={p}>
                  <a href="https://tasisatyazd.ir/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 transition-colors hover:text-teal-400">
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* App links */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">دسترسی سریع</h4>
            <ul className="space-y-2.5">
              {links.map((l) => (
                <li key={l}>
                  <a href="#top" className="text-sm text-slate-400 transition-colors hover:text-teal-400">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">ارتباط با ما</h4>
            <a href="tel:+98" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-teal-400 hover:text-teal-300">
              <Phone className="h-4 w-4 text-teal-400" />
              ۰۳۵ - ۳۷۲۰۰۰۰۰
            </a>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              استان یزد — فروشگاه تخصصی تاسیسات یزد
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["ایتا", "اینستاگرام"].map((s) => (
                <a
                  key={s}
                  href="https://eitaa.com/tasisat_yazd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:text-teal-300"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-center sm:flex-row sm:text-right">
          <p className="text-xs text-slate-500">
            © ۱۴۰۴ محاسبه‌گر تاسیسات یزد — زیرمجموعه فروشگاه تاسیسات یزد. تمامی حقوق محفوظ است.
          </p>
          <p className="text-xs text-slate-500">
            نمایندگی فروش برندهای مطرح از جمله <b className="text-slate-300">آریستون</b>
          </p>
        </div>
      </div>

      {/* Developer credit */}
      <div className="border-t border-white/10 bg-black/30 py-4">
        <p className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 sm:px-6">
          طراحی، توسعه و برنامه‌نویسی:{" "}
          <span className="bg-gradient-to-l from-teal-400 to-sky-400 bg-clip-text font-bold text-transparent">
            سهیل گلکار
          </span>
        </p>
      </div>
    </footer>
  );
}
