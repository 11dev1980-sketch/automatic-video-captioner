const CACHE = 'avt-cache-v8';

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker, cache version:', CACHE);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker, cache version:', CACHE);
  event.waitUntil(
    caches.keys().then((keys) => {
      console.log('[SW] Cleaning up old caches:', keys);
      return Promise.all(keys.filter((k) => k !== CACHE).map((k) => {
        console.log('[SW] Deleting old cache:', k);
        return caches.delete(k);
      }));
    }).then(() => {
      console.log('[SW] Cache cleanup complete, claiming clients');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle share target
  if (event.request.method === 'POST' && url.pathname === '/share') {
    event.respondWith((async () => {
      try {
        const form = await event.request.formData();
        const shared = (form.get('url') || form.get('text') || '').toString();
        const target = '/?url=' + encodeURIComponent(shared || '');
        return Response.redirect(target, 303);
      } catch (e) {
        return Response.redirect('/', 303);
      }
    })());
    return;
  }
  
  if (event.request.method !== 'GET') return;
  
  const req = event.request;
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  
  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          const copy = response.clone();
          if (response.ok) {
            caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(req))
    );
    return;
  }
  
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((response) => {
          const copy = response.clone();
          if (response.ok) {
            caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
