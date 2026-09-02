import { Check, Bolt, Boiler, Radiator, Cooler, Sparkle } from "./Icons";

const categories = [
  { icon: Boiler, name: "پکیج", sub: "دیواری و زمینی" },
  { icon: Radiator, name: "رادیاتور پنلی", sub: "فولادی و آلومینیومی" },
  { icon: Cooler, name: "کولر گازی", sub: "انواع سرد و گرم" },
  { icon: Radiator, name: "حوله خشک‌کن", sub: "در انواع سایز و رنگ" },
  { icon: Sparkle, name: "تصفیه آب", sub: "۶ و ۸ فیلتره" },
  { icon: Bolt, name: "لوازم خانگی", sub: "اقتصادی و باکیفیت" },
];

const features = ["مشاوره تخصصی", "پشتیبانی آنلاین", "ضمانت اصالت کالا", "ارسال سریع در یزد"];

const stats = [
  ["۱۰۸+", "مشتریان"],
  ["۱۲+", "دسته محصولات"],
  ["۱۱۵+", "سفارش موفق"],
];

export default function StorePromo() {
  return (
    <section className="relative px-4 py-20 sm:px-6">
      <div className="reveal relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white shadow-2xl shadow-slate-900/5">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          {/* Right: copy */}
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-8 text-white sm:p-12">
            <div className="absolute -left-12 -top-12 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl animate-float-slow" />
            <div className="absolute -bottom-16 right-8 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl animate-float-med" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-teal-100">
                <Sparkle className="h-4 w-4" />
                زیرمجموعه‌ی فروشگاه تاسیسات یزد
              </span>
              <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
                محاسبه کردی؟ حالا <span className="text-amber-300">با اطمینان بخر</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-teal-100">
                این محاسبه‌گر محصول مجموعه‌ی <b className="text-white">تاسیسات یزد</b> است؛
                کامل‌ترین فروشگاه پکیج، رادیاتور، کولر گازی، حوله خشک‌کن و تصفیه آب در استان.
                پس از محاسبه، همان تجهیزات متناسب با نتیجه را مستقیم از ما تهیه کنید.
              </p>

              <div className="mt-7 grid grid-cols-3 gap-3">
                {stats.map(([n, l]) => (
                  <div key={l} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                    <p className="text-2xl font-extrabold text-white">{n}</p>
                    <p className="mt-0.5 text-[11px] text-teal-200">{l}</p>
                  </div>
                ))}
              </div>

              <a
                href="https://tasisatyazd.ir/"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-amber-400 to-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1"
              >
                <Bolt className="h-5 w-5 transition-transform group-hover:scale-125" />
                ورود به فروشگاه تاسیسات یزد
              </a>
            </div>
          </div>

          {/* Left: categories + features */}
          <div className="p-8 sm:p-12">
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">
              دسته‌بندی محصولات
            </p>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <a
                  key={c.name}
                  href="https://tasisatyazd.ir/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-3.5 transition-all hover:-translate-y-1 hover:border-teal-300 hover:bg-white hover:shadow-lg"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-teal-600 to-sky-500 text-white shadow-md transition-transform group-hover:scale-110">
                    <c.icon className="h-6 w-6" />
                  </span>
                  <span>
                    <b className="block text-sm text-slate-900">{c.name}</b>
                    <span className="text-[11px] text-slate-500">{c.sub}</span>
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2.5 text-xs font-bold text-teal-700">
                  <Check className="h-4 w-4 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
