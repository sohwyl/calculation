import { Bolt, Phone, Layers, Shield } from "./Icons";
import { usePWAInstall } from "../hooks/usePWAInstall";

export default function CTA() {
  const { installable, installed, promptInstall } = usePWAInstall();
  return (
    <section id="download" className="relative px-4 py-24 sm:px-6">
      <div className="reveal relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 px-6 py-16 text-center shadow-2xl shadow-teal-900/30 sm:px-12 sm:py-20">
        {/* Ambient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-500/30 blur-[100px] animate-float-slow" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-sky-500/30 blur-[100px] animate-float-med" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff18 1px, transparent 1px), linear-gradient(90deg, #ffffff18 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              maskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, #000, transparent)",
            }}
          />
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-teal-200">
            <Bolt className="h-4 w-4" /> همین حالا شروع کنید
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            تاسیسات خانه‌تان را <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-300 to-sky-300">هوشمندانه</span> انتخاب کنید
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-300">
            محاسبه‌گر تاسیسات یزد را رایگان دریافت کنید و از همین امروز با اطمینان کامل خرید کنید.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {installed ? (
              <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-400/40 bg-teal-500/10 px-8 py-4 text-base font-bold text-teal-200 sm:w-auto">
                <Shield className="h-5 w-5" />
                برنامه روی دستگاه شما نصب است
              </div>
            ) : installable ? (
              <button
                onClick={promptInstall}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-teal-500 to-sky-400 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:w-auto"
              >
                <Layers className="h-5 w-5 transition-transform group-hover:scale-125" />
                نصب روی گوشی (اپ)
              </button>
            ) : (
              <a
                href="#top"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-teal-500 to-sky-400 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:w-auto"
              >
                <Bolt className="h-5 w-5 transition-transform group-hover:scale-125" />
                شروع محاسبه رایگان
              </a>
            )}
            <a
              href="tel:+98"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 sm:w-auto"
            >
              <Phone className="h-5 w-5" />
              مشاوره رایگان
            </a>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            {installable
              ? "نصب آنی روی گوشی • بدون نیاز به ثبت‌نام • رایگان برای همیشه"
              : "برای نصب روی آیفون: منوی اشتراک‌گذاری ← افزودن به صفحه اصلی"}
          </p>
        </div>
      </div>
    </section>
  );
}
