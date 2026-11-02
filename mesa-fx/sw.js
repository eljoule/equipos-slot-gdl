// Service worker de Mesa FX. Sube CACHE_VERSION cada vez que cambies index.html.
const CACHE_VERSION = 'mesa-fx-v1';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(APP_SHELL))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Página y datos: primero red (siempre lo más nuevo); sin internet, la última copia guardada.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE_VERSION).then(c => c.put(req.url.split('?')[0] === req.url ? req : new Request(req.url.split('?')[0]), copy)); return res; })
    .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
