const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/manifest.webmanifest",
  ];
  
  
  const CACHE_NAME = "static-cache-v1";
  const DATA_CACHE_NAME = "data-cache-v2";
  
  self.addEventListener("install", event => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
  });
  
  // The activate handler takes care of cleaning up old caches.
  self.addEventListener("activate", event => {
    const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      }).then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          return caches.delete(cacheToDelete);
        }));
      }).then(() => self.clients.claim())
    );
  });
  
  self.addEventListener("fetch", event => {
    if (event.request.url.startsWith(self.location.origin)) {
      event.respondWith(
        caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
  
          return caches.open(DATA_CACHE_NAME).then(cache => {
            return fetch(event.request).then(response => {
              return cache.put(event.request, response.clone()).then(() => {
                return response;
              });
            });
          });
        })
      );
    }
  });