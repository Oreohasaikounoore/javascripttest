self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("push", e => {
  let data = "no payload";

  if (e.data) {
    try {
      data = e.data.text();
    } catch {}
  }

  e.waitUntil(
    self.registration.showNotification("WebPush Test", {
      body: data,
      icon: "https://www.gstatic.com/images/branding/product/2x/apps_script_64dp.png",
      data: {
        url: "https://example.com"
      }
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();

  e.waitUntil(
    clients.openWindow(e.notification.data.url)
  );
});
