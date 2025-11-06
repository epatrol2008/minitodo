const CACHE_NAME = 'todo-v1.4';
const CHECK_URL = 'http://www.a-34.ru/todo/todo.txt';
const CHECK_INTERVAL = 60000; // 1 минута в миллисекундах

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
  
  // Запускаем периодическую проверку сразу после активации
  event.waitUntil(startPeriodicCheck());
});


// Обработка сообщений от основного скрипта
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'manualCheck') {
    event.waitUntil(checkForUpdates());
  }
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

// Функция проверки файла
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
    
    const text = await response.text();
    const trimmedText = text.trim();
    
    if (trimmedText && trimmedText !== '') {
      await showNotification('Новая задача', trimmedText);
      console.log('Найдено новое сообщение:', trimmedText);
    }
  } catch (error) {
    console.error('Ошибка при проверке файла:', error);
  }
}

// Показ уведомления
async function showNotification(title, body) {
  const registration = await self.registration;
  
  // Проверяем разрешение на уведомления
  if (Notification.permission === 'granted') {
    await registration.showNotification(title, {
      body: body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'todo-update', // Группировка уведомлений
      requireInteraction: true, // Уведомление не скроется автоматически
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
    // Открываем приложение при клике на уведомление
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(windowClients => {
        // Проверяем, есть ли уже открытое окно
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Если нет открытого окна - открываем новое
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
    );
  }
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});