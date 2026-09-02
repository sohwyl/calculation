import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ثبت Service Worker برای کارکرد آفلاین و نصب‌شدن روی گوشی (PWA).
// در صورت در دسترس نبودن فایل، بی‌صدا نادیده گرفته می‌شود.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* فایل SW سرو نشد؛ برنامه همچنان به‌صورت وب کار می‌کند */
    });
  });
}
