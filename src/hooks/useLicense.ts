import { useSyncExternalStore } from "react";
import { readLicense, CHANGE_EVENT, OPEN_EVENT } from "../lib/license";

/**
 * اشتراک reactive به وضعیت لایسنس.
 * وقتی لایسنس فعال یا پاک شود، همه‌ی کامپوننت‌ها به‌صورت خودکار به‌روز می‌شوند.
 */
export function useIsPro(): boolean {
  return (
    useSyncExternalStore(
      (onChange) => {
        const h = () => onChange();
        window.addEventListener(CHANGE_EVENT, h);
        window.addEventListener("storage", h);
        return () => {
          window.removeEventListener(CHANGE_EVENT, h);
          window.removeEventListener("storage", h);
        };
      },
      () => (readLicense().pro ? "1" : "0"),
      () => "0"
    ) === "1"
  );
}

/** اجرای callback هنگام درخواست باز شدن پنجره‌ی فعال‌سازی */
export function onActivationRequest(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
