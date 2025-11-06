const CACHE_NAME = 'todo-v1.2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Установка
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Активация - очистка старых кешей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch - стратегия: Cache First
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кеш если есть, иначе запрашиваем сеть
        return response || fetch(event.request);
      })
  );
});