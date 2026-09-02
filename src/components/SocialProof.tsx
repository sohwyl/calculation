import { useRef } from "react";
import { useCountUp } from "../hooks/useReveal";

const brands = [
  "بوتان", "ایران رادیاتور", "لورچ", "گلدیران", "آزمایش", "شوفاژکار", "نیک‌کالا", "دماوند",
];

function Stat({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useCountUp(ref, target);
  return (
    <div className="text-center">
      <div className="flex items-baseline justify-center gap-1">
        <span ref={ref} className="text-4xl font-extrabold text-gradient sm:text-5xl">۰</span>
        <span className="text-2xl font-extrabold text-teal-600">{suffix}</span>
      </div>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

export default function SocialProof() {
  return (
    <section className="relative border-y border-slate-200/60 bg-white/50 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal grid grid-cols-2 gap-8 md:grid-cols-4">
          <Stat target={24} suffix="هزار+" label="محاسبه انجام‌شده" />
          <Stat target={98} suffix="٪" label="دقت نتایج" />
          <Stat target={12} suffix="ابزار" label="ماژول محاسباتی" />
          <Stat target={4} suffix="ثانیه" label="میانگین محاسبه" />
        </div>

        <div className="mt-12 reveal" data-delay="120">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            سازگار با محصولات برندهای معتبر بازار
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
            <div className="flex w-max animate-marquee gap-4">
              {[...brands, ...brands].map((b, i) => (
                <span
                  key={i}
                  className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-500"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
