const cacheName = "news-v2";
const staticAssets = [
  './',
  './icono2.png',
  './index.html',
  './manifest.webmanifest',
  './app.css',
  './app.js',
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(staticAssets))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  // eliminar caches antiguas
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== cacheName).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Para solicitudes a nuestro origen: cache first
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req));
  } else {
    // Para externas (API): network first with cache fallback
    event.respondWith(networkAndCache(req));
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  return cached || fetch(req);
}

async function networkAndCache(req) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    // sólo cachear respuestas OK (evita guardar páginas de error)
    if (fresh && fresh.ok) {
      try {
        await cache.put(req, fresh.clone());
      } catch (err) {
        // algunos responses CORS/opaque no se pueden cachear; lo ignoramos
        console.warn('No se pudo cachear la respuesta externa:', err);
      }
    }
    return fresh;
  } catch (err) {
    const cached = await cache.match(req);
    return cached || new Response(null, { status: 504, statusText: 'Gateway Timeout' });
  }
}
