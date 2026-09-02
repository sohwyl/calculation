import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { Bolt, Shield, Layers } from "./Icons";
import { useIsPro } from "../hooks/useLicense";
import { requestActivation } from "../lib/license";
import { usePWAInstall } from "../hooks/usePWAInstall";

const links = [
  { href: "#calculator", label: "محاسبه" },
  { href: "#pricing", label: "تعرفه" },
  { href: "#features", label: "امکانات" },
  { href: "#faq", label: "سوالات" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isPro = useIsPro();
  const { installable, installed, promptInstall } = usePWAInstall();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-2.5" : "py-4"
      )}
    >
      <nav
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl px-4 transition-all duration-500 sm:px-6",
          scrolled
            ? "glass shadow-[0_8px_40px_-12px_rgba(15,118,110,0.35)] py-2.5"
            : "bg-transparent py-3"
        )}
      >
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-teal-600 to-sky-500 text-white shadow-lg shadow-teal-500/30 transition-transform duration-300 group-hover:rotate-6">
            <Bolt className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-extrabold text-slate-900">محاسبه‌گر تاسیسات یزد</span>
            <span className="block text-[11px] font-medium text-teal-700">ساده، دقیق و رایگان</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="relative rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-teal-700"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {isPro ? (
            <button
              onClick={requestActivation}
              className="hidden items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-2.5 text-xs font-bold text-amber-700 transition-all duration-300 hover:-translate-y-0.5 sm:inline-flex"
            >
              <Shield className="h-4 w-4" />
              نسخه تخصصی
            </button>
          ) : (
            <button
              onClick={requestActivation}
              className="hidden items-center gap-1.5 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 sm:inline-flex"
            >
              <Bolt className="h-4 w-4" />
              فعال‌سازی تخصصی
            </button>
          )}
          {installed ? (
            <span className="hidden items-center gap-1.5 rounded-xl bg-teal-100 px-3 py-2.5 text-xs font-bold text-teal-700 sm:inline-flex">
              <Shield className="h-4 w-4" />
              نصب‌شده
            </span>
          ) : installable ? (
            <button
              onClick={promptInstall}
              className="hidden items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-teal-600/30 sm:inline-flex"
            >
              <Layers className="h-4 w-4" />
              نصب اپ
            </button>
          ) : (
            <a
              href="#download"
              className="hidden rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-teal-600/30 sm:inline-flex"
            >
              دریافت برنامه
            </a>
          )}
          <button
            aria-label="منو"
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/70 text-slate-700 lg:hidden"
          >
            <span className="relative block h-4 w-5">
              <span className={cn("absolute right-0 block h-0.5 w-5 bg-current transition-all", open ? "top-2 rotate-45" : "top-0")} />
              <span className={cn("absolute right-0 top-2 block h-0.5 w-5 bg-current transition-all", open && "opacity-0")} />
              <span className={cn("absolute right-0 block h-0.5 w-5 bg-current transition-all", open ? "top-2 -rotate-45" : "top-4")} />
            </span>
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "mx-auto max-w-7xl overflow-hidden px-4 transition-all duration-500 lg:hidden",
          open ? "mt-2 max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="glass space-y-1 rounded-2xl p-3 shadow-xl">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-700"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#download"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              دریافت برنامه
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
