const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.webmanifest',
];

const CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting()),
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cache) => {
        if (cache !== CACHE_NAME && cache !== DATA_CACHE_NAME) {
          console.log('Removing chace data', cache);
          return caches.delete(cache);
        }
      }),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            cache.put(event.request.url, response.clone());
          }

          return response;
        })
        .catch(() => cache.match(event.request)))
        .catch((err) => console.log(err)),
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request)),
  );
});
