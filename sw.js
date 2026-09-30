// ====================================================================
// Web Push Service Worker
// ====================================================================

self.addEventListener("install", event => {
  console.log("SW: installイベント発生");

  self.skipWaiting();
});


self.addEventListener("activate", event => {
  console.log("SW: activateイベント発生");

  event.waitUntil(
    self.clients.claim()
  );
});


// ====================================================================
// Push受信
// ====================================================================

self.addEventListener("push", event => {

  console.log(
    "SW: pushイベントを受信しました。"
  );


  // ------------------------------------------------------------
  // デフォルト値
  // ------------------------------------------------------------

  let title =
    "GAS x GitHub Pages Web Push";

  let message =
    "ペイロードが空、または解析できませんでした。";

  let payload = {};


  // ------------------------------------------------------------
  // Push payload解析
  // ------------------------------------------------------------

  if (event.data) {

    try {

      payload =
        event.data.json();

      console.log(
        "SW: JSON:",
        payload
      );


      if (payload.title) {
        title = payload.title;
      }


      if (payload.body) {
        message = payload.body;
      }

    } catch (err) {

      console.warn(
        "SW: JSONパースに失敗:",
        err
      );


      try {

        message =
          event.data.text();

        payload = {
          raw: message
        };

      } catch (err2) {

        console.error(
          "SW: text取得にも失敗:",
          err2
        );

      }

    }

  } else {

    console.warn(
      "SW: event.dataがありません。"
    );

  }


  // =================================================================
  // Pythonへ送信
  // =================================================================

  const pythonPayload = {

    title: title,

    body: message,

    payload: payload,

    timestamp: Date.now()

  };


  const sendToPython =
    fetch(
      "http://127.0.0.1:8080/push",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            pythonPayload
          )
      }
    )
    .then(response => {

      if (!response.ok) {

        throw new Error(
          `Python HTTP ${response.status}`
        );

      }

      return response.text();

    })
    .then(result => {

      console.log(
        "SW: Python response:",
        result
      );

    })
    .catch(error => {

      console.error(
        "SW: Pythonへの送信に失敗:",
        error
      );

    });


  // =================================================================
  // 通知
  // =================================================================

  const targetUrl =
    "https://oreohasaikounoore.github.io/javascripttest/";


  const showNotification =
    self.registration.showNotification(
      title,
      {
        body: message,

        icon:
          "https://www.gstatic.com/images/branding/product/2x/apps_script_64dp.png",

        badge:
          "https://www.gstatic.com/images/branding/product/2x/apps_script_64dp.png",

        data: {
          url: targetUrl
        }
      }
    );


  // Python送信と通知表示の両方を待つ

  event.waitUntil(
    Promise.all([
      sendToPython,
      showNotification
    ])
  );

});


// ====================================================================
// 通知クリック
// ====================================================================

self.addEventListener(
  "notificationclick",
  event => {

    console.log(
      "SW: 通知がクリックされました。"
    );


    event.notification.close();


    const targetUrl =
      event.notification.data?.url ||
      "https://oreohasaikounoore.github.io/javascripttest/";


    event.waitUntil(

      clients.matchAll(
        {
          type: "window",
          includeUncontrolled: true
        }
      )

      .then(clientList => {

        // ----------------------------------------------------------
        // 既存タブを探す
        // ----------------------------------------------------------

        for (
          const client of clientList
        ) {

          try {

            const clientUrl =
              new URL(client.url);

            const target =
              new URL(targetUrl);


            if (
              clientUrl.origin ===
                target.origin &&

              clientUrl.pathname.startsWith(
                target.pathname
              )
            ) {

              if ("focus" in client) {

                console.log(
                  "SW: 既存タブをフォーカス"
                );

                return client.focus();

              }

            }

          } catch (err) {

            console.error(
              "SW: URL比較エラー:",
              err
            );

          }

        }


        // ----------------------------------------------------------
        // なければ新しいタブを開く
        // ----------------------------------------------------------

        if (clients.openWindow) {

          console.log(
            "SW: 新しいタブを開きます"
          );

          return clients.openWindow(
            targetUrl
          );

        }

      })

    );

  }
);
