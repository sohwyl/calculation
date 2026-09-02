/* Service Worker — محاسبه‌گر تاسیسات یزد
 * کَش اپلیکیشن برای کارکرد آفلاین و نصب روی گوشی (PWA).
 * اگر فایل به‌درستی بارگذاری نشد، برنامه همچنان به‌صورت وب کار می‌کند.
 */
const CACHE = "tasisat-yazd-v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icons/app-icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((resp) => {
            const copy = resp.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy).catch(() => {}));
            return resp;
          })
          .catch(() => cached)
      );
    })
  );
});
