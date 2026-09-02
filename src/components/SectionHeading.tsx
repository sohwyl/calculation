export default function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <span className="reveal inline-block rounded-full bg-teal-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-teal-700">
        {eyebrow}
      </span>
      <h2 className="reveal mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl" data-delay="80">
        {title}
      </h2>
      {desc && (
        <p className="reveal mt-4 text-base leading-8 text-slate-600" data-delay="160">
          {desc}
        </p>
      )}
    </div>
  );
}
