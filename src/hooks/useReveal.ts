import { useEffect } from "react";

/**
 * Attaches an IntersectionObserver to every element with the `.reveal` class
 * and toggles `.is-visible` when it scrolls into view. Supports staggering via
 * the `data-delay` attribute (ms).
 */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.delay ?? "0";
            el.style.transitionDelay = `${delay}ms`;
            el.classList.add("is-visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px 160px 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/** Counts up to a target number when the element enters view. */
export function useCountUp(
  ref: React.RefObject<HTMLElement | null>,
  target: number,
  duration = 1600
) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const value = Math.floor(eased * target);
            node.textContent = value.toLocaleString("fa-IR");
            if (p < 1) requestAnimationFrame(tick);
            else node.textContent = target.toLocaleString("fa-IR");
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, target, duration]);
}
