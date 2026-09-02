import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Radiator, Boiler, Cooler, Sparkle, Bolt, Shield, Plus, Ruler, Chart, Clock, Layers } from "./Icons";
import { calculate, CLIMATE_LABEL, FORMULAS, type Inputs, CITY_CLIMATE, PROVINCES } from "../lib/calc";
import { useIsPro } from "../hooks/useLicense";
import { requestActivation } from "../lib/license";
import InvoiceModal from "./InvoiceModal";
import CalcLoader from "./CalcLoader";

const fa = (n: number, d = 0) => n.toLocaleString("fa-IR", { maximumFractionDigits: d });

type HelpKey = string | null;
const HELP: Record<string, string> = {
  area: "متراژ مفید فضایی که می‌خواهید گرم یا خنک کنید. برای دقت بیشتر هر اتاق را جداگانه حساب کنید.",
  climate: "گرم و خشک برای یزد، کرمان؛ معتدل برای تهران، اصفهان؛ سرد برای تبریز، اردبیل و ییلاقات شیرکوه.",
  city: "انتخاب شهر، اقلیم را دقیق‌تر می‌کند و جایگزین انتخاب ساده اقلیم می‌شود (مبحث ۱۹).",
  floor: "طبقه آخر و ویلایی پرت بیشتری دارد. همکف از کف سردتر است. میانی کمترین پرت را دارد.",
  sun: "اتاق آفتاب‌گیر در زمستان گرمایش کمتر و در تابستان سرمایش بیشتر نیاز دارد.",
  insulation: "دوجداره و عایق خوب تا ۳۰٪ بار را کم می‌کند (مبحث ۱۹).",
  hotWater: "مصرف آب گرم زیاد، پکیج بزرگ‌تر یا دو مبدله می‌طلبد.",
  ceiling: "ارتفاع استاندارد ۲٫۸ متر. سقف بلندتر حجم هوا و بار را افزایش می‌دهد (مبحث ۱۴).",
  window: "نسبت پنجره به دیوار: پنجره زیاد پرت حرارتی بیشتری دارد. مبحث ۱۹ سطح شفاف را محدود می‌کند.",
  orientation: "جنوبی در زمستان گرما می‌گیرد (بار گرمایش کمتر) اما تابستان بار سرمایش بیشتر.",
  occupancy: "هر نفر ~۸۰ وات گرمای داخلی تولید می‌کند؛ گرمایش را کم، سرمایش را زیاد می‌کند.",
  usage: "اداری و تجاری به دلیل تجهیزات و رفت‌وآمد، بار سرمایش بیشتری از مسکونی دارد.",
  wall: "نوع دیوار خارجی: خشت و آجر باز بیشترین پرت و مصرف انرژی را دارد (مبحث ۱۹ عایق‌کاری).",
  windowType: "نوع شیشه: دوجداره استاندارد، سه‌جداره کم‌ترین پرت و تک‌جداره بیشترین را دارد.",
};

function HelpBtn({ id, active, setActive }: { id: string; active: HelpKey; setActive: (k: HelpKey) => void }) {
  const open = active === id;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [tipPosition, setTipPosition] = useState({ top: 0, left: 0, width: 288 });

  useEffect(() => {
    if (!open) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const width = Math.min(288, window.innerWidth - 24);
      const left = Math.min(window.innerWidth - width - 12, Math.max(12, rect.right - width));
      const estimatedHeight = 150;
      const topBelow = rect.bottom + 10;
      const top = topBelow + estimatedHeight > window.innerHeight
        ? Math.max(12, rect.top - estimatedHeight - 10)
        : topBelow;
      setTipPosition({ top, left, width });
    }
    const t = window.setTimeout(() => setActive(null), 4000);
    return () => window.clearTimeout(t);
  }, [open, setActive]);

  return (
    <span className="relative inline-flex">
      <button
        ref={buttonRef}
        onClick={() => setActive(open ? null : id)}
        className={`grid h-5 w-5 place-items-center rounded-full border text-xs font-bold transition ${open ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600"}`}
        aria-label="راهنما"
      >
        ?
      </button>
      {open && createPortal(
        <div
          className="fixed z-[100] rounded-2xl border border-slate-200 bg-white p-3.5 text-right text-[12px] leading-6 text-slate-700 shadow-2xl"
          style={{ top: tipPosition.top, left: tipPosition.left, width: tipPosition.width, animation: "help-fade 4s ease forwards" }}
          dir="rtl"
        >
          {HELP[id] ?? "راهنما"}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full w-full origin-right rounded-full bg-green-500"
              style={{ animation: "help-bar 4s linear forwards" }}
            />
          </div>
          <style>{`
            @keyframes help-bar {
              from { transform: scaleX(1); }
              to { transform: scaleX(0); }
            }
            @keyframes help-fade {
              0% { opacity: 0; transform: translateY(6px) scale(0.97); }
              10% { opacity: 1; transform: translateY(0) scale(1); }
              75% { opacity: 1; transform: translateY(0) scale(1); }
              100% { opacity: 0; transform: translateY(-8px) scale(0.97); }
            }
          `}</style>
        </div>,
        document.body
      )}
    </span>
  );
}

function FieldLabel({ title, helpId, activeHelp, setActiveHelp }: { title: string; helpId: string; activeHelp: HelpKey; setActiveHelp: (k: HelpKey) => void }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-600">
      {title} <HelpBtn id={helpId} active={activeHelp} setActive={setActiveHelp} />
    </p>
  );
}

function ChoiceGrid<T extends string>({ value, onChange, options, cols }: { value: T; onChange: (v: T) => void; options: ReadonlyArray<[T, string]>; cols: string }) {
  return (
    <div className={"grid gap-2 " + cols}>
      {options.map(([key, label]) => (
        <button key={key} onClick={() => onChange(key)} className={"rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all sm:text-sm " + (value === key ? "border-teal-500 bg-teal-600 text-white shadow-md" : "border-slate-200 bg-white text-slate-600 hover:border-teal-300")}>
          {label}
        </button>
      ))}
    </div>
  );
}

function ResultCard({ icon, title, value, desc, tone, wide }: { icon: React.ReactNode; title: string; value: string; desc: string; tone: "teal" | "sky" | "orange"; wide?: boolean }) {
  const tones = {
    teal: "from-teal-50 to-teal-100/50 text-teal-700 border-teal-100",
    sky: "from-sky-50 to-sky-100/50 text-sky-700 border-sky-100",
    orange: "from-orange-50 to-orange-100/50 text-orange-700 border-orange-100",
  }[tone];
  return (
    <div className={"rounded-2xl border bg-gradient-to-b p-3.5 transition hover:-translate-y-1 " + tones + (wide ? " sm:col-span-2" : "")}>
      <div className="mb-1.5 flex items-center gap-2"><span>{icon}</span><span className="text-xs font-bold text-slate-700">{title}</span></div>
      <b className="block text-lg font-extrabold text-slate-900">{value}</b>
      <span className="mt-0.5 block text-[11px] leading-5 text-slate-500">{desc}</span>
    </div>
  );
}

function getClimateLabel(input: Inputs): string {
  if (input.city && (CITY_CLIMATE as any)[input.city]) {
    const c = (CITY_CLIMATE as any)[input.city];
    return `${CLIMATE_LABEL[c as keyof typeof CLIMATE_LABEL]} (${input.city})`;
  }
  return CLIMATE_LABEL[input.climate];
}

export default function Calculator() {
  const [area, setArea] = useState(95);
  const [draftArea, setDraftArea] = useState(95);
  const [climate, setClimate] = useState<Inputs["climate"]>("yazd");
  const [floor, setFloor] = useState<Inputs["floor"]>("middle");
  const [sun, setSun] = useState<Inputs["sun"]>("normal");
  const [insulation, setInsulation] = useState<Inputs["insulation"]>("normal");
  const [hotWater, setHotWater] = useState<Inputs["hotWater"]>("normal");

  // پیشرفته
  const provinceNames = Object.keys(PROVINCES);
  const [province, setProvince] = useState("یزد");
  const [city, setCity] = useState("یزد");
  const [ceiling, setCeiling] = useState(2.8);
  const [draftCeiling, setDraftCeiling] = useState(2.8);
  const [windowRatio, setWindowRatio] = useState<NonNullable<Inputs["windowRatio"]>>("normal");
  const [orientation, setOrientation] = useState<NonNullable<Inputs["orientation"]>>("all");
  const [occupancy, setOccupancy] = useState(3);
  const [draftOccupancy, setDraftOccupancy] = useState(3);
  const [usage, setUsage] = useState<NonNullable<Inputs["usage"]>>("residential");
  const [wallType, setWallType] = useState<NonNullable<Inputs["wallType"]>>("brick");
  const [windowType, setWindowType] = useState<NonNullable<Inputs["windowType"]>>("double");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeHelp, setActiveHelp] = useState<HelpKey>(null);

  const isPro = useIsPro();
  const [showFormula, setShowFormula] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const [computing, setComputing] = useState(false);
  const initialInputs: Inputs = { area, climate, floor, sun, insulation, hotWater, city, ceilingHeight: ceiling, windowRatio, orientation, occupancy, usage, wallType, windowType };
  const [shownInputs, setShownInputs] = useState<Inputs>(initialInputs);
  const startTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const lastKeyRef = useRef<string>(`${area}|${climate}|${floor}|${sun}|${insulation}|${hotWater}|${city}|${ceiling}|${windowRatio}|${orientation}|${occupancy}|${usage}|${wallType}|${windowType}`);

  useEffect(() => {
    const current: Inputs = { area, climate, floor, sun, insulation, hotWater, city, ceilingHeight: ceiling, windowRatio, orientation, occupancy, usage, wallType, windowType };
    const currentKey = `${area}|${climate}|${floor}|${sun}|${insulation}|${hotWater}|${city}|${ceiling}|${windowRatio}|${orientation}|${occupancy}|${usage}|${wallType}|${windowType}`;
    if (currentKey === lastKeyRef.current) return;
    if (startTimerRef.current) window.clearTimeout(startTimerRef.current);
    if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);
    const isRangeChanging = false;
    const startDelay = isRangeChanging ? 0 : 0;
    startTimerRef.current = window.setTimeout(() => {
      setComputing(true);
      finishTimerRef.current = window.setTimeout(() => {
        setShownInputs(current);
        setComputing(false);
        lastKeyRef.current = currentKey;
      }, 1200);
    }, startDelay);
    return () => {
      if (startTimerRef.current) window.clearTimeout(startTimerRef.current);
      if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current);
    };
  }, [area, climate, floor, sun, insulation, hotWater, city, ceiling, windowRatio, orientation, occupancy, usage, wallType, windowType]);

  const r = useMemo(() => calculate(shownInputs), [shownInputs]);

  const proCategories = [
    {
      name: "لوله‌کشی و شبکه",
      tools: [
        { icon: <Ruler className="h-6 w-6" />, title: "قطر لوله اصلی", value: fa(r.pipe.diameterMm, 1) + " mm", desc: r.pipe.inch + " — سایز لوله رفت/برگشت گرمایش بر اساس دبی و سرعت مجاز مبحث ۱۶" },
        { icon: <Bolt className="h-6 w-6" />, title: "پمپ سیرکولاتور", value: fa(r.pump.m3h, 1) + " m³/h", desc: "هد " + fa(r.pump.head, 1) + " متر — پمپ گردش آب شوفاژ در مدار بسته" },
        { icon: <Chart className="h-6 w-6" />, title: "منبع انبساط", value: fa(r.tank.tank, 1) + " لیتر", desc: "مخزن دیافراگمی برای جذب انبساط آب داغ سیستم گرمایش" },
        { icon: <Bolt className="h-6 w-6" />, title: "لوله گاز", value: fa(r.gaspipe.m3h, 1) + " m³/h", desc: r.gaspipe.inch + " — سایز لوله گاز شهری ورودی به پکیج" },
        { icon: <Shield className="h-6 w-6" />, title: "دودکش", value: fa(r.chimney.diameterMm) + " mm", desc: "قطر دودکش خروج دود احتراق پکیج — ایمنی و استاندارد" },
        { icon: <Chart className="h-6 w-6" />, title: "افت فشار شبکه", value: fa(r.pressure.kPa, 1) + " kPa", desc: "افت فشار کل مسیر لوله‌کشی برای انتخاب صحیح پمپ" },
        { icon: <Chart className="h-6 w-6" />, title: "حجم آب سیستم", value: fa(r.advanced.systemWater) + " لیتر", desc: "کل آب داخل رادیاتورها و لوله‌ها برای شارژ اولیه سیستم" },
        { icon: <Ruler className="h-6 w-6" />, title: "عایق لوله", value: fa(r.advanced.pipeInsulation) + " mm", desc: "ضخامت عایق حرارتی لوله‌های رفت و برگشت طبق مبحث ۱۹" },
        { icon: <Ruler className="h-6 w-6" />, title: "انبساط خطی لوله", value: fa(r.advanced.pipeExpansion) + " mm", desc: "میزان انبساط طولی لوله داغ — نیاز به لوپ انبساطی" },
        { icon: <Bolt className="h-6 w-6" />, title: "پمپ آبرسانی بوستر", value: fa(r.advanced.boosterBar) + " بار", desc: "فشار پمپ تأمین آب مصرفی ساختمان" },
      ],
    },
    {
      name: "گرمایش",
      tools: [
        { icon: <Radiator className="h-6 w-6" />, title: "گرمایش از کف", value: fa(r.floor.pipeLen) + " متر", desc: fa(r.floor.loops) + " لوپ — طول لوله و تعداد مدار کف‌گرمایش" },
        { icon: <Layers className="h-6 w-6" />, title: "کلکتور گرمایش کف", value: fa(r.floor.manifold) + " انشعاب", desc: "تعداد پورت کلکتور رفت/برگشت گرمایش از کف" },
        { icon: <Clock className="h-6 w-6" />, title: "زمان گرم شدن", value: fa(r.warmup.minutes) + " دقیقه", desc: "مدت تقریبی رسیدن فضا به دمای ایده‌آل پس از روشن شدن سیستم" },
        { icon: <Radiator className="h-6 w-6" />, title: "منبع آب گرم", value: fa(r.dhw.liters) + " لیتر", desc: "ظرفیت مخزن آب گرم مصرفی برای حمام و آشپزخانه" },
        { icon: <Cooler className="h-6 w-6" />, title: "پمپ حرارتی", value: fa(r.heatpump.capacityKw, 1) + " kW", desc: "ظرفیت هیتر/پمپ حرارتی ترکیبی برای گرمایش و سرمایش" },
        { icon: <Bolt className="h-6 w-6" />, title: "شیر ترموستاتیک", value: fa(r.advanced.thermostaticValves) + " عدد", desc: "تعداد شیر ترموستاتیک رادیاتورها برای کنترل دمای هر اتاق" },
        { icon: <Radiator className="h-6 w-6" />, title: "رادیاتور حوله‌ای", value: fa(r.advanced.towelRadiators) + " عدد", desc: "تعداد رادیاتور حوله‌خشک‌کن مورد نیاز سرویس‌ها" },
        { icon: <Sparkle className="h-6 w-6" />, title: "دیگ موتورخانه", value: fa(r.advanced.boilerRoom) + " kcal/h", desc: "ظرفیت دیگ چدنی با ۲۰٪ ضریب اطمینان برای موتورخانه" },
        { icon: <Chart className="h-6 w-6" />, title: "بار حرارتی هر متر", value: fa(r.advanced.heatPerSqm) + " kcal", desc: "شدت بار گرمایش به ازای هر متر مربع فضا" },
      ],
    },
    {
      name: "سرمایش و تهویه",
      tools: [
        { icon: <Layers className="h-6 w-6" />, title: "داکت و کانال", value: fa(r.duct.cfm) + " CFM", desc: "قطر " + fa(r.duct.diameterMm) + " mm — هوادهی و سایز کانال کولر/داکت" },
        { icon: <Cooler className="h-6 w-6" />, title: "چیلر و فن‌کوایل", value: fa(r.chiller.tons, 1) + " تن", desc: fa(r.chiller.fanCoils) + " فن‌کوایل — برای فضاهای بزرگ و تجاری" },
        { icon: <Cooler className="h-6 w-6" />, title: "برج خنک‌کننده", value: fa(r.tower.tons, 1) + " تن", desc: fa(r.tower.flow, 1) + " m³/h — دفع حرارت چیلر آبی" },
        { icon: <Chart className="h-6 w-6" />, title: "بار نهان و حساس", value: fa(r.latent.sensible) + " BTU", desc: "تفکیک بار محسوس (دما) و نامحسوس (رطوبت) سرمایش" },
        { icon: <Layers className="h-6 w-6" />, title: "دریچه و دیفیوزر", value: fa(r.advanced.diffusers) + " عدد", desc: "تعداد دریچه توزیع هوای سرد/گرم در سقف" },
        { icon: <Bolt className="h-6 w-6" />, title: "فن تهویه (هواکش)", value: fa(r.advanced.exhaustFan) + " CFM", desc: "دبی هواکش سرویس بهداشتی و آشپزخانه" },
        { icon: <Cooler className="h-6 w-6" />, title: "رطوبت‌گیر", value: fa(r.advanced.dehumidifier) + " لیتر/روز", desc: "ظرفیت رطوبت‌زدایی مورد نیاز فضا (اقلیم مرطوب)" },
        { icon: <Sparkle className="h-6 w-6" />, title: "هوای تازه", value: fa(r.advanced.freshAir) + " CFM", desc: "دبی هوای تازه مورد نیاز ساکنین طبق استاندارد ASHRAE" },
      ],
    },
    {
      name: "برق و انرژی",
      tools: [
        { icon: <Sparkle className="h-6 w-6" />, title: "مصرف گاز", value: "حدود " + fa(r.gas.gasM3) + " m³", desc: "برآورد ماهانه قبض گاز فصل گرمایش" },
        { icon: <Chart className="h-6 w-6" />, title: "هزینه تجهیزات", value: fa(r.cost.total / 1000000, 1) + " م.ت", desc: "تخمین تقریبی هزینه خرید پکیج + اسپلیت + رادیاتور" },
        { icon: <Shield className="h-6 w-6" />, title: "صرفه‌جویی عایق", value: fa(r.savings.savingPct) + "٪", desc: "درصد کاهش بار با ارتقا به پنجره دوجداره و عایق مبحث ۱۹" },
        { icon: <Bolt className="h-6 w-6" />, title: "راندمان COP", value: "COP " + fa(r.efficiency.cop, 1), desc: "SEER " + fa(r.efficiency.seer) + " — ضریب عملکرد و بازده فصلی دستگاه" },
        { icon: <Sparkle className="h-6 w-6" />, title: "کلکتور خورشیدی", value: fa(r.solar.collectorArea, 1) + " m²", desc: "مخزن " + fa(r.solar.tankLiters) + "L — آب گرم با انرژی خورشید" },
        { icon: <Bolt className="h-6 w-6" />, title: "توان برق سرمایش", value: fa(r.advanced.coolingPowerKw, 1) + " kW", desc: "توان الکتریکی مصرفی سیستم سرمایش" },
        { icon: <Bolt className="h-6 w-6" />, title: "جریان برق", value: fa(r.advanced.ampere) + " آمپر", desc: "آمپر مورد نیاز مدار برق سیستم سرمایش (تک‌فاز)" },
        { icon: <Chart className="h-6 w-6" />, title: "مصرف برق سالانه", value: fa(r.advanced.annualKwh) + " kWh", desc: "برآورد مصرف برق سالانه سرمایش" },
      ],
    },
    {
      name: "آب و فاضلاب",
      tools: [
        { icon: <Chart className="h-6 w-6" />, title: "آب روزانه", value: fa(r.water.liters) + " لیتر", desc: fa(r.water.people) + " نفر — مصرف آب آشامیدنی تقریبی خانوار" },
        { icon: <Chart className="h-6 w-6" />, title: "منبع ذخیره آب", value: fa(r.advanced.waterStorage) + " لیتر", desc: "ظرفیت مخزن ذخیره آب مصرفی ساختمان" },
        { icon: <Sparkle className="h-6 w-6" />, title: "آبگرمکن برقی", value: fa(r.advanced.electricHeater) + " لیتر", desc: "ظرفیت آبگرمکن برقی جایگزین/کمکی" },
        { icon: <Chart className="h-6 w-6" />, title: "چاه جذبی/سپتیک", value: fa(r.septic.pitM3) + " m³", desc: "گنجایش چاه فاضلاب سه‌روزه ساختمان" },
        { icon: <Shield className="h-6 w-6" />, title: "سختی‌گیر / رسوب‌گیر", value: fa(r.advanced.softener) + " گرین", desc: "ظرفیت سختی‌گیر آب برای جلوگیری از رسوب پکیج و رادیاتور" },
      ],
    },
  ] as const;

  return (
    <section id="calculator" className="relative py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-teal-50 px-4 py-1.5 text-xs font-bold text-teal-700">ماشین‌حساب تخصصی</span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">محاسبه آنی تاسیسات خانه شما</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">جواب‌های ساده را انتخاب کنید؛ برای دقت بیشتر تنظیمات دقیق‌تر را باز کنید.</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-teal-400/20 via-sky-400/20 to-orange-300/20 blur-2xl" />
          <div className="glass relative overflow-hidden rounded-[2rem] p-1.5 shadow-2xl shadow-teal-900/10">
            <div className="rounded-[1.7rem] bg-white/85 p-5 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div><p className="text-xs font-semibold text-teal-600">جواب‌های ساده</p><h3 className="text-lg font-extrabold text-slate-900">مشخصات خانه شما</h3></div>
                    <span className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold text-teal-700"><Shield className="h-3.5 w-3.5" /> منطق ایرانی</span>
                  </div>

                  <label className="mb-4 block">
                    <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-600">
                      <span className="flex items-center gap-1.5">خانه شما چند متر است؟ <HelpBtn id="area" active={activeHelp} setActive={setActiveHelp} /></span>
                      <b className="text-slate-900">{fa(draftArea)} متر</b>
                    </span>
                    <input
                      type="range" min={25} max={300} value={draftArea}
                      onChange={(e) => setDraftArea(+e.target.value)}
                      onPointerUp={() => setArea(draftArea)}
                      onTouchEnd={() => setArea(draftArea)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setArea(draftArea); }}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-600"
                    />
                  </label>

                  <FieldLabel title="اقلیم منطقه" helpId="climate" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                  <ChoiceGrid value={climate} onChange={setClimate} options={[["yazd", "گرم و خشک"], ["mild", "معتدل"], ["cold", "سرد"]]} cols="grid-cols-3" />

                  <div className="mt-4" />
                  <FieldLabel title="موقعیت واحد" helpId="floor" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                  <ChoiceGrid value={floor} onChange={setFloor} options={[["middle", "میانی"], ["top", "زیر پشت‌بام"], ["ground", "همکف"], ["villa", "ویلایی"]]} cols="grid-cols-2" />

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <p className="mb-3 text-center text-xs font-extrabold text-slate-700">شرایط تابش و مصرف</p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl bg-white p-3 shadow-sm text-center">
                        <FieldLabel title="آفتاب" helpId="sun" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                        <ChoiceGrid value={sun} onChange={setSun} options={[["low", "کم"], ["normal", "معمولی"], ["high", "زیاد"]]} cols="grid-cols-1" />
                      </div>
                      <div className="rounded-xl bg-white p-3 shadow-sm text-center">
                        <FieldLabel title="عایق" helpId="insulation" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                        <ChoiceGrid value={insulation} onChange={setInsulation} options={[["old", "قدیمی"], ["normal", "معمولی"], ["good", "خوب"]]} cols="grid-cols-1" />
                      </div>
                      <div className="rounded-xl bg-white p-3 shadow-sm text-center">
                        <FieldLabel title="آب گرم" helpId="hotWater" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                        <ChoiceGrid value={hotWater} onChange={setHotWater} options={[["low", "کم"], ["normal", "معمولی"], ["high", "زیاد"]]} cols="grid-cols-1" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button onClick={() => setShowAdvanced((o) => !o)} className="flex w-full items-center justify-between rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-teal-300 hover:text-teal-700">
                      <span className="flex items-center gap-2"><Sparkle className="h-4 w-4 text-teal-600" /> تنظیمات دقیق‌تر {showAdvanced ? "(بستن)" : "(اختیاری - برای دقت بیشتر)"}</span>
                      <Plus className={"h-4 w-4 transition-transform " + (showAdvanced ? "rotate-45" : "")} />
                    </button>
                    {showAdvanced && (
                      <div className="mt-3 space-y-4 rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <FieldLabel title="استان" helpId="city" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                            <select value={province} onChange={(e) => { setProvince(e.target.value); setCity(PROVINCES[e.target.value]?.[0] ?? ""); }} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-teal-400">
                              {provinceNames.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-medium text-slate-600">شهرستان</p>
                            <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-teal-400">
                              {(PROVINCES[province] ?? []).map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <FieldLabel title={`ارتفاع سقف: ${fa(draftCeiling, 1)} متر`} helpId="ceiling" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                            <input
                              type="range" min={2.2} max={4.2} step={0.1} value={draftCeiling}
                              onChange={(e) => setDraftCeiling(parseFloat(e.target.value))}
                              onPointerUp={() => setCeiling(draftCeiling)}
                              onTouchEnd={() => setCeiling(draftCeiling)}
                              onKeyUp={() => setCeiling(draftCeiling)}
                              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-600"
                            />
                            <p className="mt-1 text-[11px] text-slate-500">استاندارد ۲٫۸ متر — مطابق مبحث ۱۴</p>
                          </div>
                          <div>
                            <FieldLabel title={`تعداد نفرات: ${fa(draftOccupancy)} نفر`} helpId="occupancy" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                            <input
                              type="range" min={1} max={10} value={draftOccupancy}
                              onChange={(e) => setDraftOccupancy(parseInt(e.target.value))}
                              onPointerUp={() => setOccupancy(draftOccupancy)}
                              onTouchEnd={() => setOccupancy(draftOccupancy)}
                              onKeyUp={() => setOccupancy(draftOccupancy)}
                              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-600"
                            />
                          </div>
                        </div>
                        <FieldLabel title="نسبت پنجره به دیوار" helpId="window" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                        <ChoiceGrid value={windowRatio} onChange={setWindowRatio} options={[["low", "کم (۱۰٪)"], ["normal", "متوسط (۲۰٪)"], ["high", "زیاد (۳۵٪)"], ["veryHigh", "خیلی زیاد"]]} cols="grid-cols-2" />
                        <FieldLabel title="جهت اصلی پنجره‌ها" helpId="orientation" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                        <ChoiceGrid value={orientation} onChange={setOrientation} options={[["south", "جنوبی"], ["north", "شمالی"], ["eastwest", "شرقی-غربی"], ["all", "همه طرف"]]} cols="grid-cols-2" />
                        <FieldLabel title="نوع کاربری" helpId="usage" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                        <ChoiceGrid value={usage} onChange={setUsage} options={[["residential", "مسکونی"], ["office", "اداری"], ["commercial", "تجاری"]]} cols="grid-cols-3" />
                        <FieldLabel title="نوع دیوارهای خارجی" helpId="wall" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                        <ChoiceGrid value={wallType} onChange={setWallType} options={[["adobe", "خشت/آجر باز"], ["brick", "آجر سنگی"], ["concrete", "بتن‌لبه"], ["stone", "سنگ طبیعی"], ["other", "سایر"]]} cols="grid-cols-2" />
                        <FieldLabel title="نوع شیشه / پنجره" helpId="windowType" activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
                        <ChoiceGrid value={windowType} onChange={setWindowType} options={[["single", "تک‌جداره"], ["double", "دوجداره"], ["triple", "سه‌جداره"], ["none", "بدون پنجره"]]} cols="grid-cols-2" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:border-r lg:border-slate-200 lg:pr-6">
                  <div className="mb-3 rounded-2xl bg-slate-50 p-3 text-center text-[11px] leading-5 text-slate-500">
                    بار حرارتی: <b className="text-slate-700">{fa(r.heating.kcal)} kcal/h</b> ≈ <b>{fa(r.heating.kw, 1)} kW</b> • {getClimateLabel(shownInputs)}
                  </div>
                  <p className="mb-2.5 flex items-center gap-2 text-xs font-bold text-teal-700"><span className="h-1.5 w-1.5 rounded-full bg-teal-600" /> نتایج اصلی (رایگان)</p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <ResultCard icon={<Boiler className="h-5 w-5" />} title="پکیج" value={fa(r.boiler.kw) + " kW"} desc="رایج بازار" tone="teal" />
                    <ResultCard icon={<Cooler className="h-5 w-5" />} title="اسپلیت" value={fa(r.split.btu) + " BTU"} desc="رند شده" tone="sky" />
                    <ResultCard icon={<Radiator className="h-5 w-5" />} title="پره‌ای" value={fa(r.radiator.sections145) + "-" + fa(r.radiator.sections120) + " پره"} desc="بسته به راندمان" tone="orange" wide />
                    <ResultCard icon={<Radiator className="h-5 w-5" />} title="پنلی" value={fa(r.radiator.panelMeters) + " متر"} desc="کل خانه" tone="teal" />
                    <ResultCard icon={<Cooler className="h-5 w-5" />} title="کولر آبی" value={fa(r.evaporative.airflow) + " m³/h"} desc={r.evaporative.padLabel} tone="sky" />
                  </div>

                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="flex items-center gap-2 text-xs font-bold text-amber-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        ابزارهای تخصصی ({fa(proCategories.reduce((n, c) => n + c.tools.length, 0))})
                      </p>
                      {isPro ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">فعال ✓</span> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">قفل‌شده</span>}
                    </div>

                    <div className="space-y-4">
                      {proCategories.map((cat) => (
                        <div key={cat.name}>
                          <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-slate-500">
                            <span className="h-px flex-1 bg-slate-200" />
                            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">{cat.name}</span>
                            <span className="h-px flex-1 bg-slate-200" />
                          </p>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                            {cat.tools.map((t) => (
                              <button
                                key={t.title}
                                onClick={requestActivation}
                                className={`group thunder-tile relative flex flex-col items-start gap-1 overflow-hidden rounded-2xl border p-3 text-right shadow-sm transition-all duration-300 hover:-translate-y-0.5 ${isPro ? "border-amber-200 bg-gradient-to-b from-amber-50 to-white hover:shadow-md" : "border-slate-200 bg-gradient-to-br from-slate-900 to-teal-950 hover:shadow-lg hover:shadow-amber-500/20"}`}
                              >
                                <div className="flex w-full items-center gap-2">
                                  <span className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isPro ? "text-amber-600" : "text-amber-300"}`}>{t.icon}</span>
                                  <span className={`min-w-0 flex-1 font-bold leading-tight ${isPro ? "text-[12px] text-slate-800" : "text-[12px] text-slate-100 sm:text-[13px]"}`}>{t.title}</span>
                                  {!isPro && <span className="text-[12px]">🔒</span>}
                                </div>
                                {isPro ? (
                                  <>
                                    <b dir="ltr" className="text-[13px] font-extrabold text-slate-900">{t.value}</b>
                                    <span className="text-[10px] leading-4 text-slate-500">{t.desc}</span>
                                  </>
                                ) : (
                                  <span className="text-[10px] leading-4 text-slate-400 line-clamp-2">{t.desc}</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {!isPro && (
                      <button onClick={requestActivation} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-amber-500 to-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5">
                        <Bolt className="h-4 w-4" /> فعال‌سازی برای باز کردن تمام ابزارها
                      </button>
                    )}
                    <p className="mt-2 text-center text-[11px] text-slate-400">برای دسترسی به ابزارهای بیشتر باید نسخه تخصصی را فعال‌سازی کنید</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_auto]">
                <button onClick={() => setInvoiceOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-teal-600 to-sky-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg">فاکتور محاسبه و ذخیره گزارش</button>
                <button onClick={() => setShowFormula((s) => !s)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700">نمایش فرمول</button>
              </div>

              {showFormula && (
                <div className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  {FORMULAS.filter((f) => f.tier === "free").map((f) => (
                    <div key={f.id} className="rounded-xl bg-white p-3 text-right shadow-sm"><b className="text-xs">{f.title}</b><p className="text-[11px] text-teal-800">{f.formula}</p><p className="text-[11px] text-slate-500">{f.note}</p></div>
                  ))}
                  {isPro ? FORMULAS.filter((f) => f.tier === "pro").map((f) => (
                    <div key={f.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3"><b className="text-xs">{f.title}</b><p className="text-[11px] text-amber-800">{f.formula}</p></div>
                  )) : <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-center text-[11px] text-amber-700">🔒 فرمول‌های تخصصی با فعال‌سازی نمایش داده می‌شود.</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* استایل افکت رعد و برق */}
      <style>{`
        .thunder-tile {
          position: relative;
          isolation: isolate;
        }
        .thunder-tile::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 0%, transparent 40%, rgba(255,255,255,0.85) 50%, transparent 60%, transparent 100%);
          transform: translateX(-120%) skewX(-20deg);
          transition: transform 0s;
          pointer-events: none;
          z-index: 2;
        }
        .thunder-tile:hover::before {
          animation: thunder-sweep 0.85s ease-out;
        }
        @keyframes thunder-sweep {
          0% { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateX(120%) skewX(-20deg); opacity: 0; }
        }
      `}</style>

      <InvoiceModal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} inputs={shownInputs} result={r} includePro={isPro} />
      {computing && <CalcLoader area={area} />}
    </section>
  );
}
