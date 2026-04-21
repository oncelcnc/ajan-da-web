// empty service worker
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'AJAN-DA', {
      body: data.body || 'Ajandanı güncelle!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});