self.addEventListener("notificationclick", event => {

  event.notification.close();

  const targetUrl =
    "https://oreohasaikounoore.github.io/javascripttest/";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(clientList => {

      for (const client of clientList) {

        // 既に対象サイトが開いている場合はそのタブを再利用
        if (client.url.startsWith(targetUrl)) {

          if ("focus" in client) {
            return client.focus();
          }

          return client;
        }
      }

      // 開いていなければ新規タブで開く
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );

});
