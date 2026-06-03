const APP_URL =
"https://oreohasaikounoore.github.io/javascripttest/";

self.addEventListener("notificationclick", event => {

event.notification.close();

event.waitUntil(
clients.matchAll({
type: "window",
includeUncontrolled: true
}).then(clientList => {

```
  for (const client of clientList) {

    if (
      client.url.startsWith(APP_URL)
    ) {

      if ("focus" in client) {
        return client.focus();
      }

    }

  }

  if (clients.openWindow) {
    return clients.openWindow(APP_URL);
  }

})
```

);

});
