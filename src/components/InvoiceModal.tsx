import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { Bolt, Check } from "./Icons";
import type { FullResult, Inputs } from "../lib/calc";
import { CLIMATE_LABEL } from "../lib/calc";

const fa = (n: number, digits = 0) =>
  n.toLocaleString("fa-IR", { maximumFractionDigits: digits });

const FLOOR_L: Record<Inputs["floor"], string> = {
  middle: "طبقه میانی",
  top: "طبقه آخر / زیر پشت‌بام",
  ground: "همکف / طبقه اول",
  villa: "ویلایی",
};
const SUN_L: Record<Inputs["sun"], string> = { low: "کم", normal: "معمولی", high: "زیاد" };
const INS_L: Record<Inputs["insulation"], string> = {
  old: "قدیمی / پرت بالا",
  normal: "معمولی",
  good: "دوجداره / عایق خوب",
};
const HW_L: Record<Inputs["hotWater"], string> = { low: "کم", normal: "معمولی", high: "زیاد" };

export default function InvoiceModal({
  open,
  onClose,
  inputs,
  result,
  includePro,
}: {
  open: boolean;
  onClose: () => void;
  inputs: Inputs;
  result: FullResult;
  includePro: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);

  const meta = useMemo(() => {
    const now = new Date();
    const num =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      "-" +
      Math.floor(Math.random() * 9000 + 1000);
    return {
      number: num,
      date: now.toLocaleDateString("fa-IR"),
      time: now.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const summary: Array<[string, string]> = [
    ["متراژ فضا", fa(inputs.area) + " متر مربع"],
    ["اقلیم منطقه", CLIMATE_LABEL[inputs.climate]],
    ["موقعیت واحد", FLOOR_L[inputs.floor]],
    ["آفتاب‌گیری", SUN_L[inputs.sun]],
    ["پنجره و عایق", INS_L[inputs.insulation]],
    ["مصرف آب گرم", HW_L[inputs.hotWater]],
  ];

  const freeRows: Array<[string, string, string]> = [
    ["پکیج پیشنهادی", fa(result.boiler.kw) + " kW", "نزدیک‌ترین ظرفیت رایج بازار"],
    ["کولر گازی / اسپلیت", fa(result.split.btu) + " BTU", "رند شده روی مدل‌های موجود"],
    [
      "رادیاتور پره‌ای",
      fa(result.radiator.sections145) + " تا " + fa(result.radiator.sections120) + " پره",
      "بسته به راندمان هر پره",
    ],
    ["رادیاتور پنلی", fa(result.radiator.panelMeters) + " متر", "تقسیم بین اتاق‌ها"],
    ["کولر آبی", fa(result.evaporative.airflow) + " m3/h", result.evaporative.padLabel],
  ];

  const proRows: Array<[string, string, string]> = [
    // لوله‌کشی و شبکه (۱۰)
    ["قطر لوله اصلی", fa(result.pipe.diameterMm, 1) + " mm", result.pipe.inch + " • دبی " + fa(result.pipe.flowLpm, 1) + " لیتر/دقیقه"],
    ["پمپ سیرکولاتور", fa(result.pump.m3h, 1) + " m3/h", "هد " + fa(result.pump.head, 1) + " متر — گردش آب شوفاژ"],
    ["منبع انبساط", fa(result.tank.tank, 1) + " لیتر", "حجم آب سیستم " + fa(result.tank.waterVolume, 1) + " لیتر"],
    ["لوله‌کشی گاز", fa(result.gaspipe.m3h, 1) + " m3/h", result.gaspipe.inch + " — سایز لوله گاز شهری"],
    ["دودکش پکیج", fa(result.chimney.diameterMm) + " mm", "قطر دودکش برای " + fa(result.chimney.kw) + " kW — ایمنی"],
    ["افت فشار شبکه", fa(result.pressure.kPa, 1) + " kPa", "افت فشار کل مسیر برای انتخاب پمپ"],
    ["حجم آب سیستم", fa(result.advanced.systemWater) + " لیتر", "کل آب داخل رادیاتورها و لوله‌ها"],
    ["عایق لوله", fa(result.advanced.pipeInsulation) + " mm", "ضخامت عایق حرارتی لوله‌های رفت/برگشت"],
    ["انبساط خطی لوله", fa(result.advanced.pipeExpansion) + " mm", "انبساط طولی لوله داغ در طول مسیر"],
    ["پمپ آبرسانی بوستر", fa(result.advanced.boosterBar) + " بار", "فشار پمپ تأمین آب مصرفی"],
    // گرمایش (۹)
    ["گرمایش از کف", fa(result.floor.pipeLen) + " متر لوله", fa(result.floor.loops) + " لوپ — طول لوله کف‌گرمایش"],
    ["کلکتور گرمایش کف", fa(result.floor.manifold) + " انشعاب", "تعداد پورت کلکتور رفت/برگشت کف‌گرمایش"],
    ["زمان گرم شدن فضا", fa(result.warmup.minutes) + " دقیقه", "گرم شدن تقریبی کل فضا تا دمای ایده‌آل"],
    ["منبع آب گرم", fa(result.dhw.liters) + " لیتر", "ظرفیت مخزن آب گرم مصرفی حمام/آشپزخانه"],
    ["پمپ حرارتی / هیتر", fa(result.heatpump.capacityKw, 1) + " kW", "گرمایش " + fa(result.heatpump.heatKw, 1) + " و سرمایش " + fa(result.heatpump.coolKw, 1) + " kW"],
    ["شیر ترموستاتیک", fa(result.advanced.thermostaticValves) + " عدد", "تعداد شیر ترموستاتیک برای هر اتاق"],
    ["رادیاتور حوله‌ای", fa(result.advanced.towelRadiators) + " عدد", "تعداد حوله‌خشک‌کن سرویس‌ها"],
    ["دیگ موتورخانه", fa(result.advanced.boilerRoom) + " kcal/h", "ظرفیت دیگ چدنی با ۲۰٪ ضریب اطمینان"],
    ["بار حرارتی هر متر", fa(result.advanced.heatPerSqm) + " kcal", "شدت بار گرمایش به ازای هر متر مربع"],
    // سرمایش و تهویه (۸)
    ["داکت و کانال‌کشی", fa(result.duct.cfm) + " CFM", "قطر کانال " + fa(result.duct.diameterMm) + " mm — هوادهی"],
    ["چیلر و فن‌کوایل", fa(result.chiller.tons, 1) + " تن تبرید", fa(result.chiller.fanCoils) + " فن‌کوایل — فضاهای بزرگ"],
    ["برج خنک‌کننده", fa(result.tower.tons, 1) + " تن", "دبی آب " + fa(result.tower.flow, 1) + " m3/h — دفع حرارت چیلر"],
    ["بار نهان و حساس", fa(result.latent.sensible) + " BTU", "بار نهان " + fa(result.latent.latent) + " BTU — تفکیک رطوبت"],
    ["دریچه و دیفیوزر", fa(result.advanced.diffusers) + " عدد", "تعداد دریچه توزیع هوای سرد/گرم سقف"],
    ["فن تهویه (هواکش)", fa(result.advanced.exhaustFan) + " CFM", "دبی هواکش سرویس بهداشتی/آشپزخانه"],
    ["رطوبت‌گیر", fa(result.advanced.dehumidifier) + " لیتر/روز", "ظرفیت رطوبت‌زدایی (اقلیم مرطوب)"],
    ["هوای تازه", fa(result.advanced.freshAir) + " CFM", "هوای تازه ASHRAE مورد نیاز ساکنین"],
    // انرژی و برق (۸)
    ["مصرف گاز ماهانه", "حدود " + fa(result.gas.gasM3) + " m3", "برآورد قبض فصل گرمایش"],
    ["تخمین هزینه تجهیزات", fa(result.cost.total / 1000000, 1) + " میلیون تومان", "پکیج + اسپلیت + رادیاتور"],
    ["صرفه‌جویی با عایق", fa(result.savings.savingPct) + "٪", "کاهش بار با پنجره دوجداره (مبحث ۱۹)"],
    ["راندمان COP / SEER", "COP " + fa(result.efficiency.cop, 1), "SEER " + fa(result.efficiency.seer) + " — بازده فصلی"],
    ["کلکتور خورشیدی", fa(result.solar.collectorArea, 1) + " m2", "مخزن " + fa(result.solar.tankLiters) + " لیتر — انرژی خورشید"],
    ["توان برق سرمایش", fa(result.advanced.coolingPowerKw, 1) + " kW", "توان الکتریکی مصرفی سرمایش"],
    ["جریان برق", fa(result.advanced.ampere) + " آمپر", "آمپر مدار برق سرمایش تک‌فاز"],
    ["مصرف برق سالانه", fa(result.advanced.annualKwh) + " kWh", "برآورد مصرف برق سالانه سرمایش"],
    // آب و فاضلاب (۵)
    ["مصرف روزانه آب", fa(result.water.liters) + " لیتر/روز", fa(result.water.people) + " نفر ساکن — آب شرب"],
    ["منبع ذخیره آب", fa(result.advanced.waterStorage) + " لیتر", "مخزن ذخیره آب مصرفی ساختمان"],
    ["آبگرمکن برقی", fa(result.advanced.electricHeater) + " لیتر", "ظرفیت آبگرمکن برقی کمکی"],
    ["چاه جذبی/سپتیک", fa(result.septic.pitM3) + " m³", "گنجایش چاه فاضلاب سه‌روزه"],
    ["سختی‌گیر / رسوب‌گیر", fa(result.advanced.softener) + " گرین", "ظرفیت سختی‌گیر برای جلوگیری از رسوب پکیج"],
  ];

  async function capture() {
    if (!cardRef.current) return null;
    return html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
  }

  async function downloadPng() {
    setBusy("png");
    try {
      const canvas = await capture();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = "faaktor-mohasebe-ye-tasisat-yazd.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setBusy(null);
    }
  }

  async function downloadPdf() {
    setBusy("pdf");
    try {
      const canvas = await capture();
      if (!canvas) return;
      const imgW = 210;
      const imgH = (canvas.height * imgW) / canvas.width;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
      heightLeft -= 297;
      while (heightLeft > 0) {
        position -= 297;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
        heightLeft -= 297;
      }
      pdf.save("faaktor-mohasebe-ye-tasisat-yazd.pdf");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative my-4 w-full max-w-3xl">
        <div className="sticky top-0 z-10 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl glass px-4 py-3 shadow-lg">
          <p className="text-sm font-bold text-slate-800">پیش‌نمایش فاکتور محاسبه</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={downloadPng}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:text-teal-700 disabled:opacity-50"
            >
              {busy === "png" ? "در حال ساخت..." : "دانلود عکس (PNG)"}
            </button>
            <button
              onClick={downloadPdf}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-teal-600 to-sky-500 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {busy === "pdf" ? "در حال ساخت..." : "دانلود PDF"}
            </button>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-red-500"
              aria-label="بستن"
            >
              ✕
            </button>
          </div>
        </div>

        <div ref={cardRef} className="overflow-hidden rounded-[1.75rem] bg-white shadow-2xl">
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-7 text-white">
            <div className="absolute -left-10 -top-10 h-44 w-44 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="absolute -bottom-12 right-10 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20">
                  <Bolt className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-extrabold leading-tight">محاسبه‌گر تاسیسات یزد</p>
                  <p className="text-[11px] text-teal-200">گزارش و فاکتور محاسبه تاسیسات ساختمان</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-2 text-left ring-1 ring-white/15">
                <p className="text-[11px] text-teal-200">شماره فاکتور</p>
                <p dir="ltr" className="text-sm font-bold tracking-wide">{meta.number}</p>
              </div>
            </div>
            <div className="relative mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-teal-100">
              <span>تاریخ: {meta.date}</span>
              <span>ساعت: {meta.time}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">صادرشده توسط محاسبه‌گر تاسیسات یزد</span>
            </div>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <span className="h-4 w-1 rounded-full bg-teal-600" /> مشخصات فضا (ورودی کاربر)
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {summary.map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <p className="text-[11px] text-slate-500">{k}</p>
                    <p className="text-[13px] font-bold text-slate-800">{v}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <span className="h-4 w-1 rounded-full bg-teal-600" /> نتایج اصلی (رایگان)
              </h3>
              <table className="w-full overflow-hidden rounded-xl text-right">
                <thead>
                  <tr className="bg-teal-600 text-white">
                    <th className="px-3 py-2 text-[12px] font-bold">دستگاه</th>
                    <th className="px-3 py-2 text-[12px] font-bold">ظرفیت پیشنهادی</th>
                    <th className="hidden px-3 py-2 text-[12px] font-bold sm:table-cell">توضیح</th>
                  </tr>
                </thead>
                <tbody>
                  {freeRows.map(([d, c, n], i) => (
                    <tr key={d} className={i % 2 ? "bg-slate-50" : "bg-white"}>
                      <td className="px-3 py-2.5 text-[13px] font-bold text-slate-800">{d}</td>
                      <td className="px-3 py-2.5 text-[13px] font-extrabold text-teal-700">{c}</td>
                      <td className="hidden px-3 py-2.5 text-[12px] text-slate-500 sm:table-cell">{n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <span className="h-4 w-1 rounded-full bg-amber-500" /> محاسبات تخصصی ({fa(proRows.length)} مورد)
                </h3>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-700">
                  نسخه تخصصی
                </span>
              </div>
              {includePro ? (
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {proRows.map(([d, c, n]) => (
                    <div key={d} className="flex items-center justify-between gap-2 rounded-xl border border-amber-100 bg-amber-50/40 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-bold text-slate-800">{d}</p>
                        <p className="truncate text-[11px] text-slate-500">{n}</p>
                      </div>
                      <p dir="ltr" className="shrink-0 text-[12px] font-extrabold text-slate-900">{c}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-4 text-center text-[12px] text-amber-700">
                  برای ثبت تمام محاسبات تخصصی در فاکتور، نسخه تخصصی را فعال کنید.
                </div>
              )}
            </section>

            {/* مشاور خرید هوشمند (ویژه نسخه تخصصی) */}
            {includePro && result.advisor.tips.length > 0 && (
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                  <span className="h-4 w-1 rounded-full bg-teal-600" /> مشاور خرید هوشمند
                </h3>
                <div className="space-y-2">
                  {result.advisor.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 rounded-xl border border-teal-100 bg-teal-50/50 px-3 py-2.5 text-[12px] leading-6 text-slate-700">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-teal-600 text-[9px] font-bold text-white">{fa(idx + 1)}</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-3">
              <div className="rounded-xl bg-slate-50 p-4 text-[12px] leading-6 text-slate-600">
                <p className="mb-1 font-bold text-slate-800">بار حرارتی تقریبی محاسبه‌شده</p>
                <p>
                  {fa(result.heating.kcal)} کیلوکالری بر ساعت (حدود {fa(result.heating.kw, 1)} کیلووات).
                  این مقدار مبنای انتخاب رادیاتور، پکیج و سایر تجهیزات است.
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-xl border border-slate-200 p-4 text-[11px] leading-6 text-slate-500">
                <span className="mt-0.5 shrink-0 text-teal-600">
                  <Check className="h-4 w-4" />
                </span>
                <p>
                  این گزارش بر پایه برآورد سرانگشتی و ضرایب رایج طراحی تاسیسات در ایران تهیه شده و
                  برای خرید و تصمیم‌گیری اولیه مناسب است. برای پروژه‌های بزرگ، چندواحدی یا اجرایی،
                  بررسی کارشناس رسمی توصیه می‌شود.
                </p>
              </div>
            </section>
          </div>

          <div className="border-t border-slate-100 bg-slate-900 px-6 py-4 text-center text-[11px] text-slate-400">
            محاسبه‌گر تاسیسات یزد • تاسیسات را ساده حساب کن، مطمئن بخر
          </div>
        </div>
      </div>
    </div>
  );
}
