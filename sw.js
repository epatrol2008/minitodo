const CACHE_NAME = 'todo-online-v1.0';
const API_BASE = '/todo/api/';
const CHECK_URL = API_BASE + 'check.php';
const TASKS_URL = API_BASE + 'tasks.php';
const CHECK_INTERVAL = 60000; // 1 минута

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Установка
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Активация
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
  
  // Запускаем периодическую проверку
  event.waitUntil(startPeriodicCheck());
});

// Фоновая проверка
async function startPeriodicCheck() {
  console.log('Запуск фоновой проверки...');
  
  // Проверяем сразу при запуске
  await checkForUpdates();
  
  // Устанавливаем интервал проверки
  setInterval(async () => {
    await checkForUpdates();
  }, CHECK_INTERVAL);
}

// Функция проверки обновлений
async function checkForUpdates() {
  try {
    const response = await fetch(CHECK_URL, {
      cache: 'no-cache',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.hasUpdate && result.message) {
      await showNotification('Новая задача', result.message);
      
      // Отправляем сообщение в основное приложение
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'newTaskFromServer',
          message: result.message
        });
      });
    }
  } catch (error) {
    console.error('Ошибка при проверке обновлений:', error);
  }
}

// Показ уведомления
async function showNotification(title, body) {
  const registration = await self.registration;
  
  if (Notification.permission === 'granted') {
    await registration.showNotification(title, {
      body: body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'todo-update',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Открыть'
        },
        {
          action: 'close', 
          title: 'Закрыть'
        }
      ]
    });
  }
}

// Обработка кликов по уведомлению
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
    );
  }
});

// Обработка сообщений от основного приложения
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'manualCheck') {
    event.waitUntil(checkForUpdates());
  }
});

// Fetch - кешируем статику, API пропускаем
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // API запросы не кешируем
  if (url.pathname.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Статику кешируем
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});