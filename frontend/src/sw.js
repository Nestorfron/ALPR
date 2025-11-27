// --- PUSH EVENT ---
self.addEventListener("push", (event) => {
    event.waitUntil((async () => {
      let data = { title: "Notificación", body: "" };
  
      if (event.data) {
        try {
          data = event.data.json();
        } catch {
          data.body = await event.data.text();
        }
      }
  
      const allClients = await clients.matchAll({
        includeUncontrolled: true,
        type: "window",
      });
  
      allClients.forEach((client) =>
        client.postMessage({
          type: "PUSH_RECEIVED",
          payload: data,
        })
      );
  
      await self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        vibrate: [100, 50, 100],
        data,
      });
    })());
  });
  