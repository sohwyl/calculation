/**
 * محاسبه‌گر تاسیسات یزد — هسته محاسباتی
 * --------------------------------------------------------------------------
 * منطق محاسبات بر اساس ضرایب و قواعد رایج طراحی تاسیسات در ایران تنظیم شده است:
 *  - بار حرارتی سرانگشتی بر اساس اقلیم (گرم‌وخشک / معتدل / سرد)
 *  - محاسبه رادیاتور، پکیج و کولر بر اساس بار سرانگشتی
 *  - محاسبات تخصصی (لوله، منبع انبساط، پمپ سیرکولاتور، گرمایش از کف) با الهام از
 *    الزامات مبحث ۱۶ (آبرسانی/لوله‌کشی) و اصول متداول طراحی مکانیکی
 *
 * توجه: این محاسبات برای تصمیم‌گیری سریع و برآورد اولیه طراحی شده‌اند و جایگزین
 * محاسبات دقیق اجرایی و نرم‌افزارهای بارگذاری (HAP/Carrier/ASHRAE) برای پروژه‌های بزرگ نیستند.
 */

export type ClimateKey = "yazd" | "mild" | "cold" | "humid";
export type FloorKey = "middle" | "top" | "ground" | "villa";
export type SunKey = "low" | "normal" | "high";
export type InsulationKey = "old" | "normal" | "good";
export type HotWaterKey = "low" | "normal" | "high";

// ── فیلدهای پیشرفته (تنظیمات دقیق‌تر) ── مطابق مباحث ۱۴/۱۶/۱۹
export type WindowRatio = "low" | "normal" | "high" | "veryHigh";
export type Orientation = "north" | "south" | "eastwest" | "all";
export type Usage = "residential" | "office" | "commercial";
export type CeilingHeight = number; // متر
export type WallType = "adobe" | "brick" | "concrete" | "stone" | "other";
export type WindowType = "single" | "double" | "triple" | "none";

export interface Inputs {
  area: number; // متر مربع
  climate: ClimateKey;
  floor: FloorKey;
  sun: SunKey;
  insulation: InsulationKey;
  hotWater: HotWaterKey;
  // پیشرفته — اختیاری با مقادیر پیش‌فرض
  city?: string;
  ceilingHeight?: CeilingHeight;
  windowRatio?: WindowRatio;
  orientation?: Orientation;
  occupancy?: number;
  usage?: Usage;
  wallType?: WallType;
  windowType?: WindowType;
}

// استان‌ها و شهرستان‌های ایران (برای تنظیمات دقیق‌تر)
export const PROVINCES: Record<string, string[]> = {
  "یزد": ["یزد","میبد","اردکان","مهریز","تفت","بافق","ابرکوه","بهاباد","خاتم","صدوق","ده بالا","سانیج","طزرجان"],
  "تهران": ["تهران","شهریار","اسلامشهر","ری","ورامین","دماوند","فیروزکوه","پاکدشت","رباط‌کریم","قدس","ملارد","بهارستان","پردیس"],
  "اصفهان": ["اصفهان","کاشان","نجف‌آباد","خمینی‌شهر","شاهین‌شهر","لنجان","فلاورجان","مبارکه","نایین","اردستان","سمیرم","تیران"],
  "فارس": ["شیراز","مرودشت","کازرون","فسا","جهرم","لارستان","داراب","نی‌ریز","اقلید","آباده","ممسنی","فیروزآباد"],
  "خراسان رضوی": ["مشهد","نیشابور","سبزوار","تربت حیدریه","قوچان","تربت جام","گناباد","کاشمر","خواف","چناران","فریمان"],
  "آذربایجان شرقی": ["تبریز","مراغه","مرند","اهر","بناب","سراب","میانه","هشترود","شبستر","ملکان","آذرشهر","جلفا"],
  "گیلان": ["رشت","لاهیجان","بندرانزلی","آستارا","تالش","رودسر","صومعه‌سرا","فومن","لنگرود","شفت","سیاهکل","املش"],
  "هرمزگان": ["بندرعباس","میناب","قشم","بندرلنگه","حاجی‌آباد","رودان","جاسک","پارسیان","بستک","خمیر"],
  "کرمان": ["کرمان","رفسنجان","جیرفت","سیرجان","بم","زرند","بردسیر","کهنوج","شهربابک","بافت","راور","ارزوئیه"],
  "اردبیل": ["اردبیل","پارس‌آباد","مشکین‌شهر","خلخال","نمین","گرمی","بیله‌سوار","کوثر","سرعین"],
  "خوزستان": ["اهواز","آبادان","خرمشهر","دزفول","بهبهان","شوشتر","ایذه","مسجدسلیمان","اندیمشک","ماهشهر","شوش","رامهرمز"],
  "البرز": ["کرج","فردیس","نظرآباد","هشتگرد","اشتهارد","طالقان","ساوجبلاغ","ماهدشت"],
  "قم": ["قم"],
  "آذربایجان غربی": ["ارومیه","خوی","مهاباد","بوکان","میاندوآب","سلماس","نقده","پیرانشهر","سردشت","تکاب","شاهین‌دژ","اشنویه"],
  "سیستان و بلوچستان": ["زاهدان","چابهار","ایرانشهر","زابل","سراوان","خاش","نیکشهر","کنارک"],
  "همدان": ["همدان","ملایر","نهاوند","تویسرکان","اسدآباد","بهار","رزن","کبودرآهنگ","فامنین"],
  "کرمانشاه": ["کرمانشاه","اسلام‌آبادغرب","سنقر","کنگاور","هرسین","صحنه","پاوه","جوانرود","گیلانغرب","سرپل‌ذهاب","قصرشیرین"],
  "کهگیلویه و بویراحمد": ["یاسوج","دهدشت","گچساران","دوگنبدان","لیکک","باشت"],
  "گلستان": ["گرگان","گنبدکاووس","آق‌قلا","علی‌آباد","بندرگز","بندرترکمن","کردکوی","مینودشت","کلاله","آزادشهر","رامیان"],
  "مازندران": ["ساری","بابل","آمل","قائمشهر","بابلسر","نوشهر","چالوس","تنکابن","رامسر","بهشهر","نکا","سوادکوه","جویبار"],
  "مرکزی": ["اراک","ساوه","خمین","دلیجان","محلات","شازند","تفرش","آشتیان","زرندیه","کمیجان"],
  "زنجان": ["زنجان","ابهر","خرمدره","قیدار","طارم","ماهنشان","سلطانیه","ایجرود"],
  "قزوین": ["قزوین","البرز","بوئین‌زهرا","تاکستان","آبیک","آوج"],
  "کردستان": ["سنندج","سقز","مریوان","بانه","بیجار","قروه","کامیاران","دهگلان","دیواندره","سروآباد"],
  "لرستان": ["خرم‌آباد","بروجرد","دورود","الیگودرز","کوهدشت","ازنا","پل‌دختر","دلفان","سلسله"],
  "ایلام": ["ایلام","دهلران","ایوان","آبدانان","دره‌شهر","مهران","سرابله","چرداول"],
  "بوشهر": ["بوشهر","برازجان","گناوه","دیلم","کنگان","دیر","جم","خورموج","عسلویه"],
  "چهارمحال و بختیاری": ["شهرکرد","بروجن","لردگان","فارسان","کوهرنگ","سامان","اردل","بن","کیار"],
  "خراسان جنوبی": ["بیرجند","قاین","نهبندان","فردوس","طبس","سربیشه","سرایان","بشرویه","درمیان","خوسف","زیرکوه"],
  "خراسان شمالی": ["بجنورد","شیروان","اسفراین","جاجرم","فاروج","مانه‌وسملقان","گرمه","راز‌وجرگلان"],
  "سمنان": ["سمنان","شاهرود","دامغان","گرمسار","مهدیشهر","سرخه","آرادان","میامی"],
};

// نگاشت شهرستان → اقلیم (خودکار از نام استان)
function buildCityClimate(): Record<string, ClimateKey> {
  const map: Record<string, ClimateKey> = {};
  const hotDry: string[] = ["یزد","کرمان","سیستان و بلوچستان","قم"];
  const humid: string[] = ["خوزستان","هرمزگان","بوشهر"];
  const cold: string[] = ["اردبیل","آذربایجان غربی","آذربایجان شرقی","کردستان","همدان","چهارمحال و بختیاری","زنجان","خراسان شمالی","لرستان"];
  const coldCities = ["ده بالا","سانیج","طزرجان"];
  for (const [prov, cities] of Object.entries(PROVINCES)) {
    let climate: ClimateKey = "mild";
    if (hotDry.includes(prov)) climate = "yazd";
    if (humid.includes(prov)) climate = "humid";
    if (cold.includes(prov)) climate = "cold";
    for (const c of cities) {
      if (coldCities.includes(c)) { map[c] = "cold"; continue; }
      map[c] = climate;
    }
  }
  return map;
}

export const CITY_CLIMATE: Record<string, ClimateKey> = buildCityClimate();

// لیست مسطح شهرها (سازگاری با قبل)
export const CITY_LIST: string[] = Object.values(PROVINCES).flat();

// ضرایب بار حرارتی سرانگشتی بر اساس اقلیم ایران (kcal/m²·h)
export const HEAT_KCAL: Record<ClimateKey, number> = {
  yazd: 80, // یزد، کرمان، خوزستان (گرم‌وخشک)
  mild: 120, // تهران، اصفهان، کرج (معتدل)
  cold: 150, // تبریز، اردبیل، کردستان (سرد)
  humid: 70, // بندرعباس، جنوب (گرم و مرطوب، زمستان ملایم و نیاز گرمایش کم)
};

export const FLOOR_H: Record<FloorKey, number> = {
  middle: 1.0,
  top: 1.2, // زیر پشت‌بام
  ground: 1.12, // همکف / طبقه اول
  villa: 1.25, // ویلایی
};

export const SUN_H: Record<SunKey, number> = {
  low: 1.04,
  normal: 1.0,
  high: 0.96,
};

export const INS_H: Record<InsulationKey, number> = {
  old: 1.18, // پرت بالا
  normal: 1.0,
  good: 0.88, // دوجداره / عایق
};

// ضرایب پیشرفته — مطابق مباحث ۱۴/۱۶/۱۹ و اصول طراحی
export const WINDOW_H: Record<NonNullable<Inputs["windowRatio"]>, number> = {
  low: 0.92,
  normal: 1.0,
  high: 1.12,
  veryHigh: 1.28,
};
export const ORIENT_H: Record<NonNullable<Inputs["orientation"]>, number> = {
  north: 1.06,
  south: 0.94,
  eastwest: 1.02,
  all: 1.0,
};
export const USAGE_H: Record<NonNullable<Inputs["usage"]>, number> = {
  residential: 1.0,
  office: 0.95,
  commercial: 0.9,
};

// ضرایب دیوارهای خارجی (U-value معادل) — مبحث ۱۹ عایق‌کاری
export const WALL_H: Record<NonNullable<Inputs["wallType"]>, number> = {
  adobe: 1.22,
  brick: 1.12,
  concrete: 0.95,
  stone: 1.18,
  other: 1.0,
};

// ضرایب شیشه — مبحث ۱۹ پنجره دوجداره
export const WINDOW_TYPE_H: Record<NonNullable<Inputs["windowType"]>, number> = {
  single: 1.25,
  double: 1.0,
  triple: 0.82,
  none: 0.95,
};

// 1 kW ≈ 860 kcal/h
const KCAL_TO_KW = 1 / 860;

function effectiveClimate(i: Inputs): ClimateKey {
  if (i.city && CITY_CLIMATE[i.city]) return CITY_CLIMATE[i.city];
  return i.climate;
}

/** بار حرارتی سرانگشتی بر حسب kcal/h — با اعمال فیلدهای پیشرفته */
export function heatingKcal(i: Inputs): number {
  const climate = effectiveClimate(i);
  const base =
    i.area *
    HEAT_KCAL[climate] *
    FLOOR_H[i.floor] *
    SUN_H[i.sun] *
    INS_H[i.insulation];

  const h = i.ceilingHeight ?? 2.8;
  const heightFactor = h / 2.8;

  const windowFactor = WINDOW_H[i.windowRatio ?? "normal"] * WINDOW_TYPE_H[i.windowType ?? "double"];
  const orientFactor = ORIENT_H[i.orientation ?? "all"];
  const usageFactor = USAGE_H[i.usage ?? "residential"];
  const wallFactor = WALL_H[i.wallType ?? "brick"];

  // هر نفر ~۷۰ kcal گرمای داخلی -> کاهش بار گرمایش
  const occ = i.occupancy ?? 3;
  const occReduction = occ * 70;

  const total = base * heightFactor * windowFactor * orientFactor * usageFactor * wallFactor - occReduction;
  return Math.max(600, total);
}

/** بار حرارتی بر حسب kW */
export const heatingKw = (i: Inputs) => heatingKcal(i) * KCAL_TO_KW;

/* ------------------------------ رادیاتور ------------------------------ */
const PANEL_KCAL_PER_M = 1850; // رادیاتور پنلی، حدود kcal به ازای هر متر

export function radiator(i: Inputs) {
  const kcal = heatingKcal(i);
  return {
    kcal,
    sections120: Math.ceil(kcal / 120), // پره ۱۲۰ kcal
    sections145: Math.ceil(kcal / 145), // پره ۱۴۵ kcal
    panelMeters: Math.ceil((kcal / PANEL_KCAL_PER_M) * 2) / 2, // رند روی ۰٫۵ متر
  };
}

/* -------------------------------- پکیج -------------------------------- */
const HW_BONUS: Record<HotWaterKey, number> = {
  low: 4,
  normal: 6,
  high: 8,
}; // افزودنی آب‌گرم مصرفی (kW)
export const PACKAGE_STEPS = [22, 24, 28, 32, 36, 40]; // ظرفیت‌های رایج بازار ایران

export function packageBoiler(i: Inputs) {
  const raw = heatingKw(i) + HW_BONUS[i.hotWater];
  const maxStep = PACKAGE_STEPS[PACKAGE_STEPS.length - 1];
  const kw = PACKAGE_STEPS.find((s) => raw <= s) ?? maxStep;
  // اگر بار محاسبه‌شده از بالاترین پکیج موجود در جدول (تک‌دستگاهی) بیشتر باشد،
  // این پیشنهاد دیگر کافی نیست و باید موتورخانه/چند پکیج در نظر گرفته شود.
  return { rawKw: raw, kw, undersized: raw > maxStep };
}

/* ------------------------- کولر گازی / اسپلیت ------------------------- */
const COOL_BTU: Record<ClimateKey, number> = {
  yazd: 580,
  mild: 500,
  cold: 430,
  humid: 650, // گرم و مرطوب: بار برودتی بالا به دلیل بار نهان رطوبت
}; // BTU/m²
const FLOOR_C: Record<FloorKey, number> = {
  middle: 1.0,
  top: 1.18,
  ground: 0.95,
  villa: 1.12,
};
const SUN_C: Record<SunKey, number> = {
  low: 0.94,
  normal: 1.0,
  high: 1.12,
};
const INS_C: Record<InsulationKey, number> = {
  old: 1.1,
  normal: 1.0,
  good: 0.9,
};
export const SPLIT_STEPS = [9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000];

export const WINDOW_C: Record<NonNullable<Inputs["windowRatio"]>, number> = {
  low: 0.9,
  normal: 1.0,
  high: 1.15,
  veryHigh: 1.35,
};
export const ORIENT_C: Record<NonNullable<Inputs["orientation"]>, number> = {
  north: 0.92,
  south: 1.08,
  eastwest: 1.05,
  all: 1.0,
};
export const USAGE_C: Record<NonNullable<Inputs["usage"]>, number> = {
  residential: 1.0,
  office: 1.15,
  commercial: 1.25,
};

export function splitCooler(i: Inputs) {
  const climate = effectiveClimate(i);
  const base = i.area * COOL_BTU[climate] * FLOOR_C[i.floor] * SUN_C[i.sun] * INS_C[i.insulation];

  const h = i.ceilingHeight ?? 2.8;
  const heightFactor = h / 2.8;

  const windowFactor = WINDOW_C[i.windowRatio ?? "normal"] * WINDOW_TYPE_H[i.windowType ?? "double"];
  const orientFactor = ORIENT_C[i.orientation ?? "all"];
  const usageFactor = USAGE_C[i.usage ?? "residential"];
  const wallFactor = WALL_H[i.wallType ?? "brick"];

  const occ = i.occupancy ?? 3;
  const occAddBtu = occ * 400; // هر نفر ~۴۰۰ BTU بار برودتی

  const raw = base * heightFactor * windowFactor * orientFactor * usageFactor * wallFactor + occAddBtu;
  const maxStep = SPLIT_STEPS[SPLIT_STEPS.length - 1];
  const btu = SPLIT_STEPS.find((s) => raw <= s) ?? maxStep;
  // اگر بار محاسبه‌شده از بالاترین اسپلیت موجود در جدول (تک‌دستگاهی) بیشتر باشد،
  // این پیشنهاد کافی نیست و باید چند اسپلیت یا سیستم چیلر/داکت اسپلیت در نظر گرفته شود.
  return { rawBtu: raw, btu, undersized: raw > maxStep };
}

/* ----------------------------- کولر آبی ----------------------------- */
// تعویض هوا ۲۲ بار در ساعت، ارتفاع سقف فرضی ۲٫۸ متر
const AIR_CHANGES = 22;
const PAD_STEPS = [
  { label: "پد سلولزی متوسط", maxArea: 90 },
  { label: "پد سلولزی بزرگ", maxArea: 150 },
  { label: "پد سلولزی خیلی بزرگ", maxArea: 240 },
];

export function evaporativeCooler(i: Inputs) {
  const volume = i.area * (i.ceilingHeight ?? 2.8);
  const airflow = volume * AIR_CHANGES; // m³/h
  const pad = PAD_STEPS.find((p) => i.area <= p.maxArea) ?? PAD_STEPS[PAD_STEPS.length - 1];
  return { airflow, volume, padLabel: pad.label, count: i.area > 150 ? 2 : 1 };
}

/* ---------- محاسبات تخصصی (نسخه خریداری / مبحث ۱۶) ---------- */

// لوله‌کشی شوفاژ: دبی از بار، قطر از سرعت مجاز (۰٫۹ m/s)، ΔT طراحی = ۱۵°C
const PIPE_D_T = 15;
const PIPE_VELOCITY = 0.9;
export function pipeSizing(i: Inputs) {
  const kcal = heatingKcal(i);
  const flowM3h = kcal / (PIPE_D_T * 1000); // m³/h
  const flowLpm = (flowM3h * 1000) / 60; // لیتر بر دقیقه
  const dMm =
    Math.sqrt((4 * flowM3h) / (Math.PI * PIPE_VELOCITY * 3600)) * 1000;
  return { flowM3h, flowLpm, diameterMm: dMm, inch: toInch(dMm) };
}

function toInch(mm: number): string {
  if (mm < 16) return "۱/۲ اینچ";
  if (mm < 22) return "۳/۴ اینچ";
  if (mm < 28) return "۱ اینچ";
  if (mm < 35) return "۱¼ اینچ";
  if (mm < 43) return "۱½ اینچ";
  return "۲ اینچ";
}

// منبع انبساط: حجم آب سیستم، انبساط آب (۳٫۶٪)، ضریب پذیرش دیافراگمی (۰٫۵)، اطمینان
const WATER_PER_M2 = 1.8; // لیتر آب سیستم به ازای هر متر مربع (رادیاتور + لوله)
export function expansionTank(i: Inputs) {
  const waterVolume = i.area * WATER_PER_M2;
  const expansion = waterVolume * 0.036; // ۱۰ → ۹۰ درجه
  const tank = (expansion / 0.5) * 1.25;
  return { waterVolume, expansion, tank };
}

// پمپ سیرکولاتور: دبی = بار(kcal) ÷ ۲۵۰۰ (GPM)؛ هد = افت مسیر + افت تجهیزات
export function circPump(i: Inputs) {
  const kcal = heatingKcal(i);
  const gpm = kcal / 2500;
  const m3h = gpm * 0.2271;
  const pipeLen = Math.max(8, i.area * 0.6); // طولانی‌ترین مسیر تقریبی
  const head = pipeLen * 0.06 + 2.5; // افت اصطکاکی + افت تجهیزات (رادیاتور + پکیج)
  const headClamped = Math.min(8, Math.max(2.5, head));
  return { gpm, m3h, head: headClamped, pipeLen };
}

// گرمایش از کف: فاصله لوله ۱۸ سانت، طول لوله، تعداد لوپ (هر لوپ نهایتاً ۹۰m)
const FLOOR_LOOP_MAX = 90;
export function underfloor(i: Inputs) {
  const pipeLen = (i.area / 0.18) * 1.05;
  const loops = Math.ceil(pipeLen / FLOOR_LOOP_MAX);
  const manifold = Math.ceil(loops / 2) * 2; // کلکتور معمولا زوج
  return { pipeLen, loops, manifold };
}

/* ---------------- محاسبات تخصصی تکمیلی (نسخه پولی) ---------------- */

// مصـرف گـاز ماهـانه (pro) — برآورد فصل گرمایش، روزانه ۸ ساعت کارکرد
export function gasConsumption(i: Inputs) {
  const kw = heatingKw(i);
  const efficiency = 0.9; // راندمان تقریبی پکیج
  const hoursPerDay = 8;
  const days = 30;
  const gasKwh = (kw * hoursPerDay * days) / efficiency;
  const gasM3 = gasKwh / 9.5; // ارزش حرارتی گاز شهری ~ 9.5 kWh/m³
  return { gasM3: Math.round(gasM3), gasKwh: Math.round(gasKwh) };
}

// تخمیـن هزیـنه تجهیـزات (pro) — قیمت‌های تقریبی بازار ایران (تومان)
const PACKAGE_PRICE: Record<number, number> = {
  22: 16000000,
  24: 17500000,
  28: 21000000,
  32: 26000000,
  36: 30000000,
  40: 34000000,
};
const SPLIT_PRICE: Record<number, number> = {
  9000: 13000000,
  12000: 16000000,
  18000: 21000000,
  24000: 26000000,
  30000: 32000000,
  36000: 38000000,
  48000: 52000000,
  60000: 65000000,
};
export function costEstimate(i: Inputs) {
  const b = packageBoiler(i);
  const s = splitCooler(i);
  const rad = radiator(i);
  const boiler = PACKAGE_PRICE[b.kw] ?? 18000000;
  const split = SPLIT_PRICE[s.btu] ?? 20000000;
  const radiatorCost = Math.round(rad.sections145 * 70000 + rad.panelMeters * 1200000);
  const total = boiler + split + radiatorCost;
  return { boiler, split, radiator: radiatorCost, total };
}

// صرفه‌جویی انرژی با عایق (pro) — مقایسه عایق خوب با وضعیت قدیمی (مبحث ۱۹)
export function energySavings(i: Inputs) {
  // نکته: از effectiveClimate استفاده می‌شود (نه i.climate خام) تا وقتی کاربر شهر
  // را انتخاب کرده، این محاسبه با بقیه‌ی محاسبات (که همه از اقلیم مؤثر شهر
  // استفاده می‌کنند) هماهنگ بماند.
  const climate = effectiveClimate(i);
  const base = i.area * HEAT_KCAL[climate] * FLOOR_H[i.floor] * SUN_H[i.sun];
  const asOldKw = (base * INS_H["old"]) / 860;
  const asGoodKw = (base * INS_H["good"]) / 860;
  const savingPct = Math.round(((asOldKw - asGoodKw) / asOldKw) * 100);
  const savingKw = Math.round((asOldKw - heatingKw(i)) * 10) / 10;
  return { savingPct, savingKw, asOldKw: Math.round(asOldKw) };
}

// منبع ذخیره آب گرم مصرفی (pro)
const DHW_LITERS: Record<HotWaterKey, number> = { low: 80, normal: 120, high: 180 };
export function dhwTank(i: Inputs) {
  const liters = DHW_LITERS[i.hotWater] + Math.round(i.area * 0.3);
  return { liters };
}

// چیلر و فن‌کوایل (pro) — مناسب فضاهای بزرگ‌تر
export function chillerFanCoil(i: Inputs) {
  const coolKw = splitCooler(i).rawBtu / 3412; // BTU → kW
  const tons = coolKw / 3.516; // تن تبرید
  const fanCoils = Math.max(1, Math.round(i.area / 25));
  return { tons: Math.round(tons * 10) / 10, fanCoils };
}

// افت فشار شبکه (pro)
export function pressureDrop(i: Inputs) {
  const p = circPump(i);
  const dropPerMeter = 0.2; // kPa/m تقریبی
  const total = p.pipeLen * dropPerMeter + 8; // + افت تجهیزات
  return { kPa: Math.round(total * 10) / 10, mbar: Math.round(total * 10) };
}

// زمان گرم شدن تقریبی فضا (pro)
export function warmUpTime(i: Inputs) {
  const kw = heatingKw(i);
  const surplus = packageBoiler(i).kw - kw;
  const minutes = Math.max(15, Math.round((i.area * 1.4) / Math.max(2, surplus + 3)));
  return { minutes };
}

// مشاور خرید هوشمند (pro) — پیشنهاد متناسب با شرایط
export function buyingAdvisor(i: Inputs) {
  const tips: string[] = [];
  if (i.floor === "top" || i.floor === "villa") {
    tips.push("به دلیل تماس بیشتر با بیرون، عایق سقف را در اولویت قرار دهید.");
  }
  if (i.insulation === "old") {
    tips.push("ارتقا به پنجره دوجداره می‌تواند تا ۲۰٪ از بار حرارتی بکاهد.");
  }
  if (i.hotWater === "high") {
    tips.push("برای مصرف آب گرم زیاد، پکیج دو مبدله یا مخزن‌دار مناسب‌تر است.");
  }
  if (i.area > 120) {
    tips.push("برای این متراژ، گرمایش از کف گزینه‌ای یکنواخت‌تر و اقتصادی‌تر است.");
  }
  if (i.climate === "yazd") {
    tips.push("در اقلیم خشک یزد، کولر آبی مصرف برق کمتری نسبت به اسپلیت دارد.");
  }
  if (tips.length === 0) tips.push("انتخاب شما منطبق با میانگین استاندارد است.");
  return { tips };
}

/* ---------- ابزارهای تخصصی تکمیلی (الهام از سایت‌های داخلی/خارجی) ---------- */

// داکت و کانال‌کشی (pro) — تعویض هوا سرمایش و قطر کانال اصلی
export function ductSizing(i: Inputs) {
  const cool = splitCooler(i).rawBtu;
  const volume = i.area * 2.8;
  const achCool = 8;
  const m3h = volume * achCool;
  const cfm = Math.round(m3h * 0.588);
  const diameterMm =
    Math.sqrt((4 * m3h) / (Math.PI * 4 * 3600)) * 1000; // سرعت ۴ m/s
  return { m3h: Math.round(m3h), cfm, diameterMm: Math.round(diameterMm), coolBtu: cool };
}

// پمپ حرارتی / هیتر (pro) — ترکیب گرمایش و سرمایش
export function heatPump(i: Inputs) {
  const heat = heatingKw(i);
  const cool = splitCooler(i).rawBtu / 3412; // BTU→kW
  const capacity = Math.max(heat, cool) * 1.15;
  return { capacityKw: Math.round(capacity * 10) / 10, heatKw: Math.round(heat * 10) / 10, coolKw: Math.round(cool * 10) / 10 };
}

// لوله‌کشی گاز (pro) — مصرف گاز اوج و سایز لوله اصلی
export function gasPipe(i: Inputs) {
  const kw = packageBoiler(i).kw;
  const m3h = (kw * 3.6) / 9.5; // اوج مصرف گاز (m³/h)
  const inch = m3h < 1.5 ? "۱/۲ اینچ" : m3h < 3 ? "۳/۴ اینچ" : m3h < 5 ? "۱ اینچ" : "۱¼ اینچ";
  return { m3h: Math.round(m3h * 10) / 10, inch };
}

// دودکش پکیج/موتورخانه (pro) — قطر دودکش بر اساس ظرفیت
const FLUE_TABLE: Array<[number, number]> = [
  [24, 100],
  [28, 110],
  [36, 130],
  [40, 150],
];
export function chimney(i: Inputs) {
  const kw = packageBoiler(i).kw;
  const row = FLUE_TABLE.find(([k]) => kw <= k) ?? FLUE_TABLE[FLUE_TABLE.length - 1];
  return { diameterMm: row[1], kw };
}

// کلکتور خورشیدی آب گرم (pro) — مساحت کلکتور و حجم مخزن
export function solarWater(i: Inputs) {
  const liters = dhwTank(i).liters;
  const collectorArea = Math.round((liters * 0.05) * 10) / 10; // m²
  return { collectorArea, tankLiters: liters };
}

// مصرف روزانه آب ساختمان (pro) — تقاضای آب آشامیدنی
export function dailyWater(i: Inputs) {
  const people = Math.max(1, Math.round(i.area / 25));
  const liters = people * 150; // ۱۵۰ لیتر به ازای هر نفر در روز
  return { people, liters };
}

// ضریب COP و SEER (pro) — برآورد راندمان
export function efficiency(i: Inputs) {
  const cop = 3.6; // پمپ حرارتی گرمایش
  const seer = 16; // کولر گازی
  const eer = Math.round((seer / 3.412) * 10) / 10;
  return { cop, seer, eer, kw: heatingKw(i) };
}

// برج خنک‌کننده (pro) — برای چیلر مرکزی
export function coolingTower(i: Inputs) {
  const tons = chillerFanCoil(i).tons;
  const range = 5; // °C
  const flow = tons * 0.9; // m³/h تقریبی
  return { tons, range, flow: Math.round(flow * 10) / 10 };
}

// حجم فاضلاب و چاه (pro) — برآورد گنجایش چاه جذبی
export function septic(i: Inputs) {
  const people = Math.max(1, Math.round(i.area / 25));
  const daily = people * 150;
  const pitM3 = Math.round((daily * 3) / 1000); // گنجایش چاه سه‌روزه
  return { dailyLiters: daily, pitM3 };
}

// بار نهان و حساس (pro) — تقسیم بار سرمایش
export function latentLoad(i: Inputs) {
  const total = splitCooler(i).rawBtu;
  const sensible = Math.round(total * 0.75);
  const latent = total - sensible;
  return { total, sensible, latent };
}

/* ---------------------------- نتیجه یکپارچه ---------------------------- */
// ابزارهای تخصصی پیشرفته تکمیلی (برای رسیدن به ۳۵ ابزار)
export function advancedTools(i: Inputs) {
  const kcal = heatingKcal(i);
  const btu = splitCooler(i).rawBtu;
  const h = i.ceilingHeight ?? 2.8;
  const vol = i.area * h;
  const occ = i.occupancy ?? 3;

  return {
    // حجم آب کل سیستم گرمایش (لیتر)
    systemWater: Math.round(kcal / 1000 * 12),
    // تعداد شیر ترموستاتیک رادیاتور
    thermostaticValves: Math.max(2, Math.round(i.area / 15)),
    // ضخامت عایق لوله (mm) طبق مبحث ۱۹
    pipeInsulation: pipeSizing(i).diameterMm > 28 ? 25 : 19,
    // دبی فن تهویه سرویس/آشپزخانه (CFM)
    exhaustFan: Math.round((vol * 8) * 0.588 / 10),
    // ظرفیت آبگرمکن برقی (لیتر)
    electricHeater: occ <= 2 ? 30 : occ <= 4 ? 50 : 80,
    // تعداد دریچه/دیفیوزر هوا
    diffusers: Math.max(2, Math.round(i.area / 20)),
    // توان الکتریکی سرمایش (kW برق مصرفی)
    coolingPowerKw: Math.round((btu / 12000) * 1.1 * 10) / 10,
    // جریان برق مورد نیاز (آمپر، تک‌فاز ۲۲۰ ولت)
    ampere: Math.round((btu / 12000) * 1.1 * 1000 / 220),
    // ظرفیت رطوبت‌گیر (لیتر در روز) - مناطق مرطوب
    dehumidifier: effectiveClimate(i) === "humid" ? Math.round(i.area * 0.6) : Math.round(i.area * 0.2),
    // ظرفیت منبع ذخیره آب (لیتر)
    waterStorage: Math.max(500, occ * 250),
    // تعداد رادیاتور حوله‌ای حمام
    towelRadiators: Math.max(1, Math.round(i.area / 70)),
    // پمپ آبرسانی بوستر (بار فشار)
    boosterBar: i.floor === "villa" ? 2 : Math.max(2, Math.round(i.area / 80) + 2),
    // انبساط خطی لوله رفت (mm) در طول مسیر
    pipeExpansion: Math.round((circPump(i).pipeLen / 10) * 1.8),
    // بار محسوس گرمایش هر متر مربع (kcal)
    heatPerSqm: Math.round(kcal / Math.max(1, i.area)),
    // ظرفیت دیگ چدنی موتورخانه (kcal/h) با ۲۰٪ ضریب اطمینان
    boilerRoom: Math.round(kcal * 1.2),
    // مصرف برق سالانه سرمایش (kWh)
    annualKwh: Math.round((btu / 12000) * 1.1 * 6 * 90),
    // ضریب هوای تازه مورد نیاز (CFM) طبق ASHRAE
    freshAir: Math.round(occ * 15),
    // ظرفیت سختی‌گیر / رسوب‌گیر آب (گرین) — برای جلوگیری از رسوب پکیج و رادیاتور
    softener: Math.max(12000, occ * 8500),
  };
}

export interface FullResult {
  heating: { kcal: number; kw: number };
  radiator: ReturnType<typeof radiator>;
  boiler: ReturnType<typeof packageBoiler>;
  split: ReturnType<typeof splitCooler>;
  evaporative: ReturnType<typeof evaporativeCooler>;
  pipe: ReturnType<typeof pipeSizing>;
  tank: ReturnType<typeof expansionTank>;
  pump: ReturnType<typeof circPump>;
  floor: ReturnType<typeof underfloor>;
  gas: ReturnType<typeof gasConsumption>;
  cost: ReturnType<typeof costEstimate>;
  savings: ReturnType<typeof energySavings>;
  dhw: ReturnType<typeof dhwTank>;
  chiller: ReturnType<typeof chillerFanCoil>;
  pressure: ReturnType<typeof pressureDrop>;
  warmup: ReturnType<typeof warmUpTime>;
  advisor: ReturnType<typeof buyingAdvisor>;
  duct: ReturnType<typeof ductSizing>;
  heatpump: ReturnType<typeof heatPump>;
  gaspipe: ReturnType<typeof gasPipe>;
  chimney: ReturnType<typeof chimney>;
  solar: ReturnType<typeof solarWater>;
  water: ReturnType<typeof dailyWater>;
  efficiency: ReturnType<typeof efficiency>;
  tower: ReturnType<typeof coolingTower>;
  septic: ReturnType<typeof septic>;
  latent: ReturnType<typeof latentLoad>;
  advanced: ReturnType<typeof advancedTools>;
}

export function calculate(i: Inputs): FullResult {
  return {
    heating: { kcal: heatingKcal(i), kw: heatingKw(i) },
    radiator: radiator(i),
    boiler: packageBoiler(i),
    split: splitCooler(i),
    evaporative: evaporativeCooler(i),
    pipe: pipeSizing(i),
    tank: expansionTank(i),
    pump: circPump(i),
    floor: underfloor(i),
    gas: gasConsumption(i),
    cost: costEstimate(i),
    savings: energySavings(i),
    dhw: dhwTank(i),
    chiller: chillerFanCoil(i),
    pressure: pressureDrop(i),
    warmup: warmUpTime(i),
    advisor: buyingAdvisor(i),
    duct: ductSizing(i),
    heatpump: heatPump(i),
    gaspipe: gasPipe(i),
    chimney: chimney(i),
    solar: solarWater(i),
    water: dailyWater(i),
    efficiency: efficiency(i),
    tower: coolingTower(i),
    septic: septic(i),
    latent: latentLoad(i),
    advanced: advancedTools(i),
  };
}

/* ------------------------- فرمول‌ها (نمایش) ------------------------- */
export const CLIMATE_LABEL: Record<ClimateKey, string> = {
  yazd: "گرم و خشک",
  mild: "معتدل",
  cold: "سرد",
  humid: "گرم و مرطوب",
};

export interface FormulaItem {
  id: string;
  tier: "free" | "pro";
  title: string;
  formula: string;
  note: string;
}

export const FORMULAS: FormulaItem[] = [
  {
    id: "radiator",
    tier: "free",
    title: "رادیاتور",
    formula: "بار حرارتی = متراژ × ضریب اقلیم (یزد ۸۰ / معتدل ۱۲۰ / سرد ۱۵۰) × ضریب طبقه × ضریب آفتاب × ضریب عایق",
    note: "تعداد پره = بار حرارتی (kcal) ÷ بازده هر پره (۱۲۰ یا ۱۴۵ kcal). رادیاتور پنلی ≈ بار ÷ ۱۸۵۰ kcal/m.",
  },
  {
    id: "boiler",
    tier: "free",
    title: "پکیج",
    formula: "ظرفیت (kW) = بار حرارتی (kcal) ÷ ۸۶۰ + افزودنی آب‌گرم مصرفی (۴/۶/۸ kW)",
    note: "سپس روی ظرفیت‌های رایج بازار ایران یعنی ۲۲، ۲۴، ۲۸، ۳۲، ۳۶ و ۴۰ kW رند می‌شود.",
  },
  {
    id: "split",
    tier: "free",
    title: "کولر گازی / اسپلیت",
    formula: "ظرفیت (BTU) = متراژ × ضریب اقلیم (یزد ۵۸۰ / معتدل ۵۰۰ / سرد ۴۳۰) × ضریب طبقه × ضریب آفتاب × ضریب عایق",
    note: "خروجی روی مدل‌های ۹۰۰۰ تا ۶۰۰۰۰ BTU رند می‌شود تا مستقیم قابل خرید باشد.",
  },
  {
    id: "evap",
    tier: "free",
    title: "کولر آبی",
    formula: "دبی هوای مورد نیاز (m³/h) = حجم فضا (متراژ × ارتفاع ۲٫۸) × تعویض هوا (۲۲ بار در ساعت)",
    note: "بر اساس دبی هوای محاسبه‌شده، سایز پد سلولزی و تعداد کولر انتخاب می‌شود. کولر آبی در اقلیم خشک یزد بسیار کارآمد است.",
  },
  {
    id: "pipe",
    tier: "pro",
    title: "لوله و اتصالات",
    formula: "دبی (m³/h) = بار حرارتی (kcal) ÷ (ΔT طراحی ۱۵°C × ۱۰۰۰) — قطر لوله از سرعت مجاز ۰٫۹ m/s",
    note: "مطابق منطق مبحث ۱۶ مقررات ملی ساختمان برای انتخاب سایز لوله بر اساس دبی و سرعت جریان.",
  },
  {
    id: "tank",
    tier: "pro",
    title: "منبع انبساط",
    formula: "حجم آب سیستم = متراژ × ۱٫۸ لیتر — حجم منبع = (حجم آب × ۳٫۶٪) ÷ ضریب پذیرش ۰٫۵ × ضریب اطمینان ۱٫۲۵",
    note: "ضریب انبساط ۳٫۶٪ برای گرم شدن آب از ۱۰ تا ۹۰ درجه سانتی‌گراد در نظر گرفته شده است.",
  },
  {
    id: "pump",
    tier: "pro",
    title: "پمپ سیرکولاتور",
    formula: "دبی (GPM) = بار حرارتی (kcal) ÷ ۲۵۰۰ — هد (m) = افت مسیر (طول × ۰٫۰۶) + افت تجهیزات ۲٫۵m",
    note: "دبی بر حسب GPM با ضریب ۰٫۲۲۷۱ به مترمکعب بر ساعت تبدیل می‌شود. هد پمپ سیرکولاتور در مدار بسته فقط افت اصطکاکی را جبران می‌کند.",
  },
  {
    id: "floor",
    tier: "pro",
    title: "گرمایش از کف",
    formula: "طول لوله = (متراژ ÷ فاصله لوله‌ها ۰٫۱۸m) × ۱٫۰۵ — تعداد لوپ = طول ÷ حداکثر ۹۰m",
    note: "دمای آب گرمایش از کف پایین‌تر از رادیاتور (حدود ۴۰ تا ۵۰ درجه) و فاصله لوله‌ها معمولاً ۱۵ تا ۲۰ سانت است.",
  },
  {
    id: "gas",
    tier: "pro",
    title: "مصرف گاز ماهانه",
    formula: "گاز (m³) = بار حرارتی (kW) × ساعت روزانه ۸ × ۳۰ روز ÷ راندمان پکیج ۹۰٪ ÷ ارزش حرارتی گاز ۹٫۵ kWh/m³",
    note: "برآورد تقریبی مصرف گاز در فصل گرمایش؛ برای تخمین قبض گاز خانگی کاربردی است.",
  },
  {
    id: "cost",
    tier: "pro",
    title: "تخمین هزینه تجهیزات",
    formula: "مجموع = قیمت پکیج (بر اساس kW) + قیمت اسپلیت (بر اساس BTU) + قیمت رادیاتور (تعداد پره و متر پنلی)",
    note: "بر پایه میانگین قیمت‌های تقریبی بازار ایران؛ نرخ‌ها متغیر و صرفاً برای برآورد اولیه است.",
  },
  {
    id: "savings",
    tier: "pro",
    title: "صرفه‌جویی با عایق",
    formula: "درصد صرفه‌جویی = (بار در حالت قدیمی − بار در حالت عایق خوب) ÷ بار در حالت قدیمی × ۱۰۰",
    note: "نشان می‌دهد ارتقا به پنجره دوجداره و عایق (مبحث ۱۹) چقدر از بار حرارتی و هزینه انرژی می‌کاهد.",
  },
  {
    id: "dhw",
    tier: "pro",
    title: "منبع آب گرم مصرفی",
    formula: "ظرفیت منبع (لیتر) = مصرف پایه آب گرم + متراژ × ۰٫۳",
    note: "بر اساس مصرف آب گرم انتخاب می‌شود؛ برای مصرف زیاد، منبع یا پکیج مخزن‌دار بزرگ‌تر پیشنهاد می‌شود.",
  },
  {
    id: "chiller",
    tier: "pro",
    title: "چیلر و فن‌کوایل",
    formula: "تن تبرید = بار سرمایش (kW) ÷ ۳٫۵۱۶ — تعداد فن‌کوایل = متراژ ÷ ۲۵",
    note: "برای فضاهای بزرگ‌تر و تجاری که یک اسپلیت تک‌کافی نیست؛ چیلر مرکزی با شبکه فن‌کوایل.",
  },
  {
    id: "pressure",
    tier: "pro",
    title: "افت فشار شبکه",
    formula: "افت کل (kPa) = طول مسیر × ۰٫۲ kPa/m + افت تجهیزات ۸ kPa",
    note: "افت فشار کل شبکه برای بررسی صحت انتخاب پمپ و سایز لوله‌ها استفاده می‌شود.",
  },
  {
    id: "warmup",
    tier: "pro",
    title: "زمان گرم شدن فضا",
    formula: "زمان تقریبی (دقیقه) = (متراژ × ۱٫۴) ÷ (مازاد ظرفیت پکیج + ۳)",
    note: "هرچه مازاد ظرفیت پکیج نسبت به بار بیشتر باشد، فضا سریع‌تر گرم می‌شود. مقدار تقریبی است.",
  },
];
