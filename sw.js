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
// プッシュ通知受信時の処理
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
  // Push payloadの解析
  // ------------------------------------------------------------

  if (event.data) {

    try {

      const data =
        event.data.json();

      console.log(
        "SW: 復号およびJSONパースに成功しました:",
        data
      );

      payload = data;


      if (data.title) {
        title = data.title;
      }

      if (data.body) {
        message = data.body;
      }

    } catch (err) {

      console.warn(
        "SW: JSONパースに失敗したため、テキストとして取得します:",
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
          "SW: テキスト取得にも失敗しました:",
          err2
        );

      }

    }

  } else {

    console.warn(
      "SW: pushイベントにデータ(event.data)が含まれていません。"
    );

  }


  // ==================================================================
  // Pythonへ送信
  // ==================================================================

  const pythonData = {
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

        mode: "cors",

        // 127.0.0.1 はloopback
        targetAddressSpace: "loopback",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(pythonData)

      }
    )
    .then(response => {

      console.log(
        "SW: Python HTTP status:",
        response.status
      );

      if (!response.ok) {

        throw new Error(
          "Python HTTPエラー: " +
          response.status
        );

      }

      return response.text();

    })
    .then(result => {

      console.log(
        "SW: Pythonからの応答:",
        result
      );

    })
    .catch(error => {

      console.error(
        "SW: Pythonへの送信に失敗しました:",
        error
      );

    });


  // ==================================================================
  // 通知表示
  // ==================================================================

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


  // ==================================================================
  // Service Workerを終了させずに
  // Python送信 + 通知表示を完了させる
  // ==================================================================

  event.waitUntil(
    Promise.all([
      sendToPython,
      showNotification
    ])
  );

});


// ====================================================================
// 通知クリック時の処理
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

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      })

      .then(clientList => {

        // ------------------------------------------------------------
        // 既に対象ページが開いているか確認
        // ------------------------------------------------------------

        for (
          const client of clientList
        ) {

          try {

            const clientUrl =
              new URL(client.url);

            const target =
              new URL(targetUrl);


            if (
              clientUrl.origin === target.origin &&
              clientUrl.pathname.startsWith(
                target.pathname
              )
            ) {

              if ("focus" in client) {

                console.log(
                  "SW: 既存のタブが見つかったため、フォーカスします。"
                );

                return client.focus();

              }

            }

          } catch (err) {

            console.error(
              "SW: タブのURL比較中にエラーが発生しました:",
              err
            );

          }

        }


        // ------------------------------------------------------------
        // 対象タブが存在しなければ新規に開く
        // ------------------------------------------------------------

        if (clients.openWindow) {

          console.log(
            "SW: 該当タブがないため、新しくウィンドウを開きます。"
          );

          return clients.openWindow(
            targetUrl
          );

        }

      })

    );

  }
);
