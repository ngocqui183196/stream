self.addEventListener('push', event => {
  console.log(event)
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body,
    // icon: 'assets/icons/icon-192x192.png',
    // badge: 'assets/icons/badge-72x72.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

