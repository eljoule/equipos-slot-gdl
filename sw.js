// Service worker del Generador de Equipos - Club Slot GDL
// Sube este número cada vez que subas una versión nueva del index.html a GitHub,
// así el navegador de los pilotos descarga la versión nueva en vez de quedarse
// con una copia vieja guardada en caché.
const CACHE_VERSION = 'slot-gdl-v2';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// La página principal siempre se pide primero a la red (para que las actualizaciones
// lleguen rápido); si no hay internet, se sirve la última copia guardada.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode === 'navigate' || req.url.endsWith('index.html') || req.url.endsWith('/')) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
