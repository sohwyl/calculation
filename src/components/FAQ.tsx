import { useState } from "react";
import SectionHeading from "./SectionHeading";
import { Plus } from "./Icons";

const faqs = [
  {
    q: "این محاسبات بر چه اساسی انجام می‌شوند؟",
    a: "منطق برنامه از برآوردهای رایج بار حرارتی و برودتی، اصول متداول طراحی تاسیسات مکانیکی، تجربه بازار ایران و اثر عایق و پنجره الهام می‌گیرد. خروجی نهایی هم روی سایزهای واقعی قابل خرید در بازار ایران رند می‌شود.",
  },
  {
    q: "چرا فقط چند سؤال ساده از کاربر می‌پرسید؟",
    a: "چون کاربر عمومی معمولاً اطلاعات تخصصی مثل ضریب انتقال حرارت، سطح پنجره، حجم دقیق هوا یا بار نهان را نمی‌داند. ما این پیچیدگی‌ها را پشت صحنه نگه داشته‌ایم و آن‌ها را به چند سؤال قابل فهم تبدیل کرده‌ایم تا خطای کاربر کمتر شود.",
  },
  {
    q: "آیا این برنامه برای شهرهای ایران مناسب است؟",
    a: "بله. منطق برنامه برای اقلیم‌های رایج ایران ساده‌سازی شده است؛ از شهرهای گرم‌وخشک مانند یزد تا شهرهای معتدل و سرد. تفاوت اقلیم، طبقه و آفتاب‌گیری در نتیجه تاثیر داده می‌شود.",
  },
  {
    q: "چرا طبقه آخر یا همکف مهم است؟",
    a: "چون واحدهای زیر پشت‌بام یا در تماس بیشتر با بیرون، در زمستان پرت حرارتی بیشتری دارند و در تابستان نیز از سقف و دیوارها گرمای بیشتری می‌گیرند. به همین دلیل ظرفیت پیشنهادی این واحدها معمولاً بیشتر از واحدهای میانی است.",
  },
  {
    q: "اگر پنجره دوجداره داشته باشم نتیجه فرق می‌کند؟",
    a: "بله. کیفیت پنجره و عایق مستقیماً روی پرت انرژی اثر دارد. در ساختمان‌هایی با پنجره بهتر و عایق مناسب، معمولاً ظرفیت مورد نیاز کمتر از ساختمان‌های قدیمی با پرت بالا خواهد بود.",
  },
  {
    q: "آیا این خروجی برای خرید کافی است یا باید کارشناس هم ببیند؟",
    a: "برای تصمیم‌گیری اولیه خرید خانگی و فروشگاهی، این خروجی بسیار کاربردی است. اما برای پروژه‌های خاص، دوبلکس‌های پیچیده، چندواحدی‌ها، سالن‌های بزرگ یا طراحی اجرایی کامل، بررسی کارشناس و نسخه دقیق‌تر برنامه توصیه می‌شود.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="سوالات متداول"
          title={<>پاسخ به <span className="text-gradient">پرسش‌های مهم شما</span></>}
        />

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="reveal overflow-hidden rounded-2xl border border-slate-200/70 bg-white transition-all duration-300 hover:border-teal-200"
                data-delay={`${i * 60}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-slate-900 sm:text-base">{f.q}</span>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-white transition-all duration-300 ${
                      isOpen ? "rotate-45 bg-teal-600" : "bg-slate-300"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <div
                  className="grid transition-all duration-400 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-7 text-slate-600">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
