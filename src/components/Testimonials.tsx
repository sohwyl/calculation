import SectionHeading from "./SectionHeading";
import { Star } from "./Icons";
import { FloatingShapes, GridLines } from "./Decor";

const items = [
  {
    name: "رضا محمدی",
    role: "صاحب‌خانه، یزد",
    text: "می‌خواستم برای خونه جدیدم رادیاتور بخرم ولی نمی‌دونستم چند پره. با این برنامه دقیق حساب کردم و فروشنده هم تایید کرد. عالی بود!",
    color: "from-teal-400 to-teal-600",
  },
  {
    name: "سمیرا کاظمی",
    role: "کاربر خانگی",
    text: "خیلی ساده و فارسیه. برای انتخاب کولر آپارتمانم استفاده کردم و واقعاً کمکم کرد پول اضافه ندم. پیشنهاد می‌کنم.",
    color: "from-orange-300 to-orange-500",
  },
  {
    name: "مهندس علوی",
    role: "نصاب تاسیسات",
    text: "به‌عنوان نصاب، این ابزار زمان محاسبه‌هام رو نصف کرده. سرِ کار سریع بار حرارتی رو درمیارم و به مشتری نشون می‌دم.",
    color: "from-sky-400 to-sky-600",
  },
  {
    name: "حسین رستمی",
    role: "خریدار پکیج",
    text: "قبلاً پکیج بزرگ‌تر از نیازم خریده بودم. کاش زودتر این برنامه رو داشتم. حالا برای واحد دومم درست انتخاب کردم.",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    name: "فاطمه نوری",
    role: "مدیر ساختمان",
    text: "برای مجتمع مسکونی خیلی به کار اومد. همه واحدها رو محاسبه و ذخیره کردم. رابط کاربری‌ش تمیز و حرفه‌ایه.",
    color: "from-violet-400 to-violet-600",
  },
  {
    name: "امیر تقوی",
    role: "کاربر جدید",
    text: "رایگان بودن و آفلاین کار کردنش عالیه. تو کارگاه بدون اینترنت هم راحت محاسبه می‌کنم. ممنون از تیم تاسیسات یزد.",
    color: "from-rose-400 to-rose-600",
  },
];

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden py-24">
      <GridLines />
      <FloatingShapes />
      <div className="pointer-events-none absolute left-1/2 top-40 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-100/50 blur-[130px]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="نظر کاربران"
          title={<>مردم به <span className="text-gradient">محاسبه‌گر تاسیسات یزد</span> اعتماد کرده‌اند</>}
          desc="از صاحب‌خانه‌ها تا نصاب‌های حرفه‌ای؛ همه از سادگی و دقت این برنامه راضی هستند."
        />

        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {items.map((t, i) => (
            <figure
              key={t.name}
              className="reveal mb-5 break-inside-avoid rounded-3xl border border-slate-200/70 bg-white p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-teal-900/10"
              data-delay={`${(i % 3) * 90}`}
            >
              <div className="mb-3 flex gap-0.5 text-orange-400">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4" />
                ))}
              </div>
              <blockquote className="text-sm leading-7 text-slate-700">«{t.text}»</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${t.color} font-bold text-white`}>
                  {t.name.charAt(0)}
                </span>
                <span>
                  <b className="block text-sm text-slate-900">{t.name}</b>
                  <span className="text-xs text-slate-500">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
