self.addEventListener('push', function (event) {
    if (!event.data) return;

    try {
        const payload = event.data.json();
        const title = payload.title || 'Nueva Notificación';
        const options = {
            body: payload.body || 'Tienes un nuevo mensaje.',
            icon: payload.icon || '/pdp-logo.png', // Assuming logo is in public folder
            badge: '/pdp-logo.png',
            data: {
                url: payload.url || '/'
            }
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
        console.error("Error al parsear el payload de Push", err);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    // Try to open the URL provided by the push payload
    const urlToOpen = event.notification.data.url;

    if (urlToOpen) {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
                // Encontrar pestaña que ya está en el dominio
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url === urlToOpen && "focus" in client) {
                        return client.focus();
                    }
                }
                // Si no hay ninguna abrir nueva
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
        );
    }
});
