import SectionHeading from "./SectionHeading";
import { Radiator, Cooler, Chart, Shield } from "./Icons";
import { FloatingShapes } from "./Decor";

const features = [
  { icon: Radiator, title: "خروجی واقعی و قابل خرید", desc: "به‌جای عددهای گیج‌کننده، نتیجه را به‌صورت پکیج ۲۴kW، اسپلیت ۱۸۰۰۰ یا ۶ متر پنلی می‌بینید؛ دقیقاً چیزی که می‌توانید بخرید.", tone: "teal" },
  { icon: Cooler, title: "مناسب اقلیم ایران", desc: "یزد و شهرهای گرم‌وخشک، معتدل و سرد منطق یکسانی ندارند. اثر اقلیم، طبقه، آفتاب و عایق در محاسبه لحاظ می‌شود.", tone: "sky" },
  { icon: Chart, title: "سؤال ساده به‌جای فرمول سخت", desc: "به‌جای ضریب انتقال حرارت یا بار نهان، فقط چند سؤال روزمره جواب می‌دهید. پیچیدگی پشت صحنه می‌ماند.", tone: "orange" },
];

const toneMap: Record<string, string> = {
  teal: "from-teal-500 to-teal-600 shadow-teal-500/30",
  sky: "from-sky-500 to-sky-600 shadow-sky-500/30",
  orange: "from-orange-400 to-orange-500 shadow-orange-500/30",
};

export default function Features() {
  return (
    <section id="features" className="relative py-20">
      <FloatingShapes />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="چرا متفاوت است"
          title={<>ساده برای مردم، <span className="text-gradient">دقیق مثل مهندس</span></>}
          desc="هر آنچه برای تصمیم‌گیری درست لازم دارید، بدون درگیر شدن با اصطلاحات فنی پیچیده."
        />

        <div className="grid gap-5 sm:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="reveal group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-900/10"
              data-delay={`${i * 90}`}
            >
              <span className={`mb-5 inline-grid h-13 w-13 place-items-center rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg ${toneMap[f.tone]} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                <f.icon className="h-7 w-7" />
              </span>
              <h3 className="mb-2 text-lg font-extrabold text-slate-900">{f.title}</h3>
              <p className="text-sm leading-7 text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* نوار اعتماد */}
        <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-3" data-delay="120">
          {[
            "بر پایه مباحث ۱۶ و ۱۹",
            "ضرایب اقلیم ایران",
            "کارکرد کامل آفلاین",
            "بدون تبلیغ مزاحم",
          ].map((t) => (
            <span key={t} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700">
              <Shield className="h-4 w-4 text-teal-600" /> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
