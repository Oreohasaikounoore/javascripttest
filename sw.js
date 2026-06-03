self.addEventListener("install", event => {
  console.log("SW install");
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("SW activate");

  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener("push", event => {

  let message = "Hello World";

  if (event.data) {
    try {
      message = event.data.text();
    } catch (err) {
      console.error("Push data parse error:", err);
    }
  }

  const targetUrl =
    "https://oreohasaikounoore.github.io/javascripttest/";

  event.waitUntil(
    self.registration.showNotification(
      "GAS x GitHub Pages Web Push",
      {
        body: message,
        icon: "https://www.gstatic.com/images/branding/product/2x/apps_script_64dp.png",
        badge: "https://www.gstatic.com/images/branding/product/2x/apps_script_64dp.png",
        data: {
          url: targetUrl
        }
      }
    )
  );
});

self.addEventListener("notificationclick", event => {

  console.log("Notification clicked");

  event.notification.close();

  const targetUrl =
    event.notification.data?.url ||
    "https://oreohasaikounoore.github.io/javascripttest/";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(clientList => {

      for (const client of clientList) {

        try {

          const clientUrl =
            new URL(client.url);

          const target =
            new URL(targetUrl);

          if (
            clientUrl.origin === target.origin &&
            clientUrl.pathname.startsWith(target.pathname)
          ) {

            if ("focus" in client) {
              return client.focus();
            }

          }

        } catch (err) {
          console.error(err);
        }

      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

    })
  );
});
