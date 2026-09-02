import { useEffect, useState } from "react";
import SectionHeading from "./SectionHeading";
import { Shield, Sparkle } from "./Icons";
import { calculate, type Inputs, CLIMATE_LABEL } from "../lib/calc";

const fa = (n: number, d = 0) => n.toLocaleString("fa-IR", { maximumFractionDigits: d });

type YazdiTheme = "firoozeh" | "khaki" | "ajori" | "shen";
const themes: Record<YazdiTheme, { border: string; badge: string; glow: string }> = {
  firoozeh: { border: "from-teal-500 to-sky-400", badge: "bg-teal-50 text-teal-700 border-teal-200", glow: "from-teal-200/40 to-sky-200/30" },
  khaki: { border: "from-[#cbb89a] to-[#a78b6a]", badge: "bg-[#fdf6ea] text-[#7a5a3a] border-[#e8d8b8]", glow: "from-amber-100/60 to-orange-100/40" },
  ajori: { border: "from-[#c46a48] to-[#8e3a2a]", badge: "bg-[#fdf0eb] text-[#8e3a2a] border-[#f0c8b8]", glow: "from-orange-200/40 to-red-200/30" },
  shen: { border: "from-[#e7d8b8] to-[#d1b896]", badge: "bg-[#fdf8ef] text-[#6b5a3f] border-[#eadfc2]", glow: "from-[#f5ecd0]/60 to-[#e8dcc0]/30" },
};

interface ExampleCity {
  city: string;
  areaName: string;
  climate: Inputs["climate"];
  area: number;
  floor: Inputs["floor"];
  sun: Inputs["sun"];
  insulation: Inputs["insulation"];
  hotWater: Inputs["hotWater"];
  elevation: number;
  temp: string;
  rain: string;
  note: string;
  theme: YazdiTheme;
  checked?: boolean;
}

const examples: ExampleCity[] = [
  { city: "یزد", areaName: "بافت تاریخی", climate: "yazd", area: 85, floor: "middle", sun: "high", insulation: "normal", hotWater: "normal", elevation: 1216, temp: "زمستان −۵ تا تابستان ۴۵°C", rain: "میانگین بارش ۶۰mm", note: "خانه خشتی با پنجره‌های دوجداره جدید، آفتاب مستقیم حیاط مرکزی.", theme: "ajori" },
  { city: "میبد", areaName: "محله قدیم", climate: "yazd", area: 90, floor: "middle", sun: "high", insulation: "old", hotWater: "normal", elevation: 1071, temp: "۴۶°C تابستان / −۶°C زمستان", rain: "۶۵mm", note: "دیوارهای خشتی ضخیم، عایقی طبیعی در تابستان.", theme: "shen" },
  { city: "اردکان", areaName: "شمال استان", climate: "yazd", area: 100, floor: "ground", sun: "high", insulation: "normal", hotWater: "normal", elevation: 1030, temp: "تا ۴۴°C", rain: "۵۵mm", note: "همکف با بادگیر، وزش باد کویری در محاسبه لحاظ شده.", theme: "khaki" },
  { city: "مهریز", areaName: "جنوب یزد", climate: "yazd", area: 95, floor: "middle", sun: "normal", insulation: "normal", hotWater: "high", elevation: 1475, temp: "شب‌های خنک‌تر", rain: "۸۰mm", note: "ارتفاع بیشتر، باغ‌های انار و هوای مطبوع غروب.", theme: "firoozeh" },
  { city: "تفت", areaName: "دامنه شیرکوه", climate: "mild", area: 85, floor: "top", sun: "normal", insulation: "normal", hotWater: "normal", elevation: 1580, temp: "تابستان ۳۲°C / زمستان −۸°C", rain: "۱۲۰mm", note: "نیمه‌معتدل کوهپایه‌ای، سقف شیروانی و آفتاب ملایم.", theme: "firoozeh" },
  { city: "ده بالا", areaName: "ییلاق مرکزی تفت", climate: "cold", area: 70, floor: "villa", sun: "low", insulation: "good", hotWater: "normal", elevation: 2330, temp: "تابستان ۲۸°C / زمستان −۱۵°C", rain: "۵۶cm برف رکورد ۱۴۰۴ + ۲۰۰mm بارش", note: "به‌روز ۵ فروردین ۱۴۰۵: ده‌بالا سردترین ییلاق با ۵۶cm برف گزارش شده (خبرگزاری مهر). رودخانه دائمی و باغ گل محمدی.", theme: "firoozeh", checked: true },
  { city: "سانیج", areaName: "ارتفاعات تفت", climate: "cold", area: 65, floor: "villa", sun: "low", insulation: "good", hotWater: "low", elevation: 2450, temp: "تابستان ۲۶°C / زمستان −۱۴°C", rain: "۲۹mm در سامانه اخیر ۱۴۰۴", note: "به‌روز ۱۴۰۵: سلطان‌باد سانیج ۱۵cm برف، بارش اخیر ۲۹mm. بافتی سنگی و باغی.", theme: "khaki", checked: true },
  { city: "طزرجان", areaName: "پای شیرکوه", climate: "cold", area: 75, floor: "villa", sun: "normal", insulation: "good", hotWater: "normal", elevation: 2520, temp: "تابستان ۲۵°C / زمستان −۱۶°C", rain: "۳۳.۶mm بارش اخیر / ۲۰mm طزرجان", note: "به‌روز ۵ فروردین ۱۴۰۵: طزرجان جزو سردترین نقاط استان (کمینه ۹°C تفت) با ۳۳.۶mm بارش در سامانه اخیر و ۱۳cm برف.", theme: "ajori", checked: true },
  { city: "بافق", areaName: "شرق استان", climate: "yazd", area: 90, floor: "middle", sun: "high", insulation: "old", hotWater: "normal", elevation: 927, temp: "تا ۴۸°C گرم‌ترین", rain: "۴۰mm", note: "فراخشک و گرم، به‌روز ۱۴۰۵: بافق با ۳۰°C گرم‌ترین نقطه استان.", theme: "shen" },
  { city: "ابرکوه", areaName: "غرب استان", climate: "yazd", area: 110, floor: "ground", sun: "high", insulation: "normal", hotWater: "normal", elevation: 1510, temp: "تا ۴۲°C", rain: "۵۰mm", note: "سرو کهن و آفتاب تند کویر.", theme: "khaki" },
  { city: "تهران", areaName: "پایتخت", climate: "mild", area: 95, floor: "middle", sun: "normal", insulation: "normal", hotWater: "normal", elevation: 1189, temp: "−۵ تا ۴۲°C", rain: "۲۳۰mm", note: "آپارتمان میانی با پنجره‌های معمولی.", theme: "firoozeh" },
  { city: "اصفهان", areaName: "نصف جهان", climate: "mild", area: 100, floor: "middle", sun: "high", insulation: "normal", hotWater: "normal", elevation: 1571, temp: "−۱۰ تا ۴۰°C", rain: "۱۱۰mm", note: "خانه آجری با حیاط مرکزی.", theme: "ajori" },
  { city: "شیراز", areaName: "شهر بهارنارنج", climate: "mild", area: 90, floor: "middle", sun: "high", insulation: "normal", hotWater: "normal", elevation: 1486, temp: "−۴ تا ۴۰°C", rain: "۳۰۰mm", note: "معتدل رو به گرم.", theme: "shen" },
  { city: "اهواز", areaName: "خوزستان", climate: "yazd", area: 95, floor: "top", sun: "high", insulation: "old", hotWater: "low", elevation: 23, temp: "تا ۵۰°C شرجی", rain: "۲۳۰mm", note: "شرجی‌ترین اقلیم، تمرکز روی سرمایش.", theme: "ajori" },
  { city: "مشهد", areaName: "شمال شرق", climate: "mild", area: 100, floor: "middle", sun: "normal", insulation: "good", hotWater: "normal", elevation: 995, temp: "−۲۰ تا ۴۲°C", rain: "۲۵۰mm", note: "زمستان سرد و خشک.", theme: "firoozeh" },
  { city: "تبریز", areaName: "شمال غرب", climate: "cold", area: 95, floor: "middle", sun: "low", insulation: "good", hotWater: "normal", elevation: 1348, temp: "−۲۵ تا ۳۸°C", rain: "۳۰۰mm", note: "سردسیر با نیاز گرمایش بالا.", theme: "shen" },
  { city: "رشت", areaName: "گیلان", climate: "mild", area: 85, floor: "ground", sun: "low", insulation: "old", hotWater: "high", elevation: 5, temp: "−۱۰ تا ۳۷°C", rain: "۱۳۵۰mm", note: "مرطوب‌ترین شهر، عایق رطوبتی مهم.", theme: "firoozeh" },
  { city: "بندرعباس", areaName: "خلیج فارس", climate: "yazd", area: 80, floor: "top", sun: "high", insulation: "normal", hotWater: "low", elevation: 9, temp: "۴۸°C شرجی", rain: "۱۷۰mm", note: "ساحلی و شرجی.", theme: "khaki" },
  { city: "کرمان", areaName: "جنوب شرق", climate: "yazd", area: 100, floor: "middle", sun: "high", insulation: "normal", hotWater: "normal", elevation: 1755, temp: "−۱۵ تا ۴۲°C", rain: "۱۴۰mm", note: "کویری با شب‌های خنک.", theme: "ajori" },
  { city: "اردبیل", areaName: "سردسیر", climate: "cold", area: 85, floor: "top", sun: "low", insulation: "good", hotWater: "high", elevation: 1332, temp: "−۳۰ تا ۳۵°C", rain: "۳۱۰mm + برف", note: "یکی از سردترین‌ها.", theme: "firoozeh" },
];

export default function Examples() {
  const [active, setActive] = useState(0);
  const [perView, setPerView] = useState(3);
  const [paused, setPaused] = useState(false);
  const maxActive = Math.max(0, examples.length - perView);
  const visibleExamples = examples.slice(active, active + perView);

  useEffect(() => {
    const upd = () => {
      if (window.innerWidth < 640) setPerView(1);
      else if (window.innerWidth < 1024) setPerView(2);
      else setPerView(3);
    };
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  // اتو اسلاید — با hover متوقف می‌شود
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((c) => (c >= maxActive ? 0 : c + 1));
    }, 3200);
    return () => clearInterval(id);
  }, [maxActive, paused]);

  return (
    <section id="examples" className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="۲۰ مثال آماده"
          title={<><span className="text-gradient">۲۰ مثال آماده</span> برای راهنمایی بیشتر شما عزیزان</>}
          desc="نمونه‌های آماده و کاربردی از شهرها و ییلاقات مختلف تا انتخاب سیستم گرمایش و سرمایش برای شما ساده‌تر شود."
        />

        {/* کاروسل تاریک الماسی */}
        <div
          className="relative overflow-hidden rounded-[1.75rem] border border-slate-700/80 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-4 shadow-2xl sm:p-5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* درخشش الماسی پس‌زمینه */}
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(45,212,191,0.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.2), transparent 35%), linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)" }} />

          <button
            aria-label="قبلی"
            onClick={() => setActive((p) => (p <= 0 ? maxActive : p - 1))}
            className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-lg font-bold text-white shadow-lg backdrop-blur transition hover:bg-teal-500 sm:grid"
          >
            ‹
          </button>
          <button
            aria-label="بعدی"
            onClick={() => setActive((p) => (p >= maxActive ? 0 : p + 1))}
            className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10 text-lg font-bold text-white shadow-lg backdrop-blur transition hover:bg-teal-500 sm:grid"
          >
            ›
          </button>

          <div className="overflow-hidden" dir="ltr">
            <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}>
              {visibleExamples.map((ex, idx) => {
                const result = calculate({ area: ex.area, climate: ex.climate, floor: ex.floor, sun: ex.sun, insulation: ex.insulation, hotWater: ex.hotWater } as Inputs);
                return (
                  <div
                    key={ex.city + active + idx}
                    dir="rtl"
                    className="group relative flex min-h-[260px] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-400/40 hover:bg-white/[0.1]"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-l ${themes[ex.theme].border}`} />
                    <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-teal-400/10 blur-2xl" />

                    <div className="relative flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-white sm:text-[15px]">{ex.city}</h3>
                          {ex.checked && <span className="rounded-full bg-teal-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white">۱۴۰۵</span>}
                        </div>
                        <p className="text-[10px] text-slate-400">{ex.areaName} • {ex.elevation.toLocaleString("fa-IR")} متر</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[9px] font-bold text-teal-200">{CLIMATE_LABEL[ex.climate]}</span>
                    </div>

                    <div className="relative mt-2.5 grid grid-cols-2 gap-1.5 text-[10px]">
                      <div className="rounded-lg bg-white/5 px-2.5 py-1.5"><b className="block text-slate-300">دما</b><span className="text-slate-400">{ex.temp}</span></div>
                      <div className="rounded-lg bg-white/5 px-2.5 py-1.5"><b className="block text-slate-300">بارش</b><span className="text-slate-400">{ex.rain}</span></div>
                    </div>

                    <div className="relative mt-2.5 grid grid-cols-3 gap-1.5">
                      <div className="rounded-xl bg-teal-500/15 px-1.5 py-2 text-center"><p className="text-[9px] text-teal-300">پکیج</p><b className="text-[12px] text-white">{fa(result.boiler.kw)}kW</b></div>
                      <div className="rounded-xl bg-sky-500/15 px-1.5 py-2 text-center"><p className="text-[9px] text-sky-300">اسپلیت</p><b className="text-[12px] text-white">{fa(result.split.btu)}</b></div>
                      <div className="rounded-xl bg-amber-500/15 px-1.5 py-2 text-center"><p className="text-[9px] text-amber-300">پنلی</p><b className="text-[12px] text-white">{fa(result.radiator.panelMeters)}m</b></div>
                    </div>

                    <p className="relative mt-2 text-[10px] leading-4 text-slate-400">واحد {fa(ex.area)} متری، {ex.floor === "villa" ? "ویلایی" : ex.floor === "top" ? "طبقه آخر" : ex.floor === "ground" ? "همکف" : "میانی"}</p>

                    <div className="relative mt-auto rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
                      <p className="flex items-start gap-1.5 text-[10px] leading-5 text-slate-300"><Shield className="mt-0.5 h-3 w-3 shrink-0 text-teal-400" />{ex.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mt-4 flex items-center justify-center gap-1.5">
            {Array.from({ length: maxActive + 1 }).map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className={`h-2 rounded-full transition-all duration-400 ${i === active ? "w-7 bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.6)]" : "w-2 bg-white/25 hover:bg-white/40"}`} aria-label={`گروه ${i + 1}`} />
            ))}
            {paused && <span className="absolute left-2 text-[10px] font-bold text-teal-300/80">❚❚ مکث</span>}
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-gradient-to-l from-teal-50 to-sky-50 p-5 shadow-md sm:p-6">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 sm:text-base"><Sparkle className="h-5 w-5 text-teal-600" /> آب‌وهوای ییلاقات یزد در بهار ۱۴۰۵</h3>
          <div className="mt-3 grid gap-3 text-xs leading-6 text-slate-700 sm:grid-cols-3 sm:text-sm sm:leading-7">
            <div className="rounded-xl bg-white p-3.5 shadow-sm"><b className="block text-teal-700">ده بالا (۲۳۳۰m)</b>۵۶cm برف رکورد، تفت ۹°C سردترین نقطه. محاسبه با ضریب سرد.</div>
            <div className="rounded-xl bg-white p-3.5 shadow-sm"><b className="block text-teal-700">سانیج (۲۴۵۰m)</b>۲۹mm بارش و ۱۵cm برف سلطان‌باد، پیش‌بینی ناپایدار ارتفاعات.</div>
            <div className="rounded-xl bg-white p-3.5 shadow-sm"><b className="block text-teal-700">طزرجان (۲۵۲۰m)</b>۳۳.۶mm باران اخیر، سردترین نقطه با ۹°C، وزش باد محلی.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
