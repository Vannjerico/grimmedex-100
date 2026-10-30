
const CACHE_NAME = "grimmedex-v2";

const ARCHIVOS_INICIALES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS_INICIALES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);

      if (response && (response.ok || response.type === "opaque")) {
        const copy = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(request, copy))
          .catch(() => {});
      }

      return response;
    } catch (error) {
      const cached = await caches.match(request);

      if (cached) return cached;

      if (request.mode === "navigate") {
        return (await caches.match("./index.html")) || Response.error();
      }

      return Response.error();
    }
  })());
});
