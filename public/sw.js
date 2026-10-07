const CACHE_NAME = 'docbook-v2.1.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/doctors.html',
  '/appointment-slip.html',
  '/prescription-slip.html',
  '/tv-display.html',
  '/css/tokens.css',
  '/css/main.css',
  '/css/components.css',
  '/js/api.js',
  '/js/navbar.js',
  '/js/theme.js',
  '/js/toast.js',
  '/js/icons.js',
  '/js/animations.js',
  '/js/i18n.js',
  '/images/docbook-logo.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip API and non-GET requests
  if (url.pathname.startsWith('/api/') || request.method !== 'GET') {
    return;
  }

  // Network-first with cache fallback for documents, cache-first for static assets
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then(res => res || caches.match('/index.html')))
    );
  } else {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background
          fetch(request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && request.url.startsWith('http')) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
  }
});
