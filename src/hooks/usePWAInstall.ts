import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * مدیریت رویداد نصب PWA.
 * وقتی مرورگر آماده‌ی نصب اپ باشد، `installable=true` می‌شود و `promptInstall()`
 * دیالوگ نصب را نمایش می‌دهد. در پلتفرم‌هایی که از این رویداد پشتیبانی نمی‌کنند
 * (مثل iOS)، کاربر باید دستی «افزودن به صفحه اصلی» را بزند.
 */
export function usePWAInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBefore = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBefore as EventListener);
    window.addEventListener("appinstalled", onInstalled);
    // حالت اجرا به‌صورت standalone (همین حالا نصب‌شده)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferred) return false;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    return choice.outcome === "accepted";
  }

  return { installable: !!deferred && !installed, installed, promptInstall };
}
