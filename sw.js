const CACHE_NAME = "grimmedex-v1";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest"
];

// Instalar y guardar los archivos principales
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

// Activar la nueva versión
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

// Servir archivos guardados cuando no haya internet
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.ok) {
          const copia = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, copia)
          );
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(response =>
          response || caches.match("./index.html")
        )
      )
  );
});