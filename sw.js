
const CACHE_NAME = 'moneyfest-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  // You might need to add other assets here if they are not in the build output
  // but for vite, the build output is hashed and handled by a more advanced SW strategy
  // this is a simple cache-first strategy for basic offline support
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
