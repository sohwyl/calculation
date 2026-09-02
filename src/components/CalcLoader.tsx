import { createPortal } from "react-dom";

/**
 * لودر محاسباتی به‌صورت باکس مودال — با Portal در document.body رندر می‌شود.
 * چون مستقیماً روی body قرار می‌گیرد، هیچ عنصر اجدادی (مثل .reveal با transform)
 * نمی‌تواند آن را محدود کند؛ در نتیجه با position:fixed همیشه دقیقاً در مرکز
 * دید کاربر (viewport) ظاهر می‌شود، مهم نیست کاربر کجای صفحه اسکرول کرده باشد.
 */

const PHRASES = [
  "دریافت مشخصات فضا…",
  "اعمال ضرایب اقلیم ایران…",
  "محاسبه بار حرارتی (Q = A × U × ΔT)…",
  "محاسبه بار برودتی و نهان…",
  "اعمال مبحث ۱۶ و ۱۹…",
  "محاسبه دبی و قطر لوله (Darcy-Weisbach)…",
  "محاسبه حجم منبع انبساط…",
  "محاسبه هد و دبی پمپ سیرکولاتور…",
  "محاسبه ظرفیت چیلر و فن‌کوایل…",
  "رند روی ظرفیت‌های بازار ایران…",
];

export default function CalcLoader({ area }: { area: number }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      style={{ animation: "overlay-in 0.25s ease-out" }}
    >
      {/* باکس مرکزی — دقیقاً وسط دید کاربر */}
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/5"
        style={{ animation: "box-pop 0.35s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* هدر گرادیانی */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-sky-800 p-6 text-center text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />

          {/* چرخ‌دنده محاسباتی */}
          <div className="relative mx-auto mb-4 h-20 w-20">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#ffffff22" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34" fill="none" stroke="url(#lgrad)" strokeWidth="6"
                strokeLinecap="round" strokeDasharray="70 200"
                style={{ animation: "loader-spin 1s linear infinite", transformOrigin: "center" }}
              />
              <defs>
                <linearGradient id="lgrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5eead4" />
                  <stop offset="100%" stopColor="#7dd3fc" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 grid place-items-center text-2xl animate-pulse">⚙️</span>
          </div>

          <p className="relative text-lg font-extrabold">در حال محاسبه…</p>
          <p className="relative mt-1 text-xs text-teal-100">
            تاسیسات {area.toLocaleString("fa-IR")} متر مربع شما
          </p>
        </div>

        {/* بدنه */}
        <div className="space-y-3 px-6 py-5 text-center">
          {/* عبارات چرخان */}
          <div className="h-5 overflow-hidden">
            <div className="animate-[loader-text_3.5s_steps(10)_infinite]">
              {PHRASES.map((p) => (
                <p key={p} className="h-5 text-xs font-semibold text-teal-600">{p}</p>
              ))}
            </div>
          </div>

          {/* نوار پیشرفت */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-l from-teal-600 to-sky-400" style={{ animation: "loader-bar 1.1s ease-in-out infinite" }} />
          </div>

          {/* نمادهای ریاضی متحرک */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1" dir="ltr">
            {["∑Q", "ΔT", "GPM", "BTU/h", "COP", "kcal"].map((s, i) => (
              <span
                key={s}
                className="rounded-md bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-teal-300"
                style={{ animation: `loader-fade 1.5s ease-in-out ${i * 0.15}s infinite` }}
              >
                {s}
              </span>
            ))}
          </div>

          <p className="pt-1 text-[11px] text-slate-400">لحظه‌ای صبر کنید… پشت صحنه کارهای مهندسی انجام می‌شود.</p>
        </div>

        <style>{`
          @keyframes overlay-in { 0%{opacity:0} 100%{opacity:1} }
          @keyframes box-pop { 0%{transform:scale(0.85) translateY(10px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }
          @keyframes loader-spin { to { transform: rotate(360deg); } }
          @keyframes loader-text { to { transform: translateY(-200px); } }
          @keyframes loader-bar { 0%{transform:translateX(-120%)} 100%{transform:translateX(420%)} }
          @keyframes loader-fade { 0%,100%{opacity:0.3;transform:translateY(2px)} 50%{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    </div>,
    document.body
  );
}
