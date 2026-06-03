// ====================================================================
// Web Push Service Worker (完全修正版)
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

// --- プッシュ通知受信時の処理 ---
self.addEventListener("push", event => {
  console.log("SW: pushイベントを受信しました。");

  // デフォルトの通知設定（データが空だった場合のフォールバック）
  let title = "GAS x GitHub Pages Web Push";
  let message = "ペイロードが空、または解析できませんでした。";

  if (event.data) {
    try {
      // 💡 思考: GASから送られたAES-128-GCMの復号データをJSONとしてパース
      const data = event.data.json();
      console.log("SW: 復号およびJSONパースに成功しました:", data);
      
      if (data.title) title = data.title;
      if (data.body) message = data.body;
    } catch (err) {
      // JSONパースに失敗した場合は、通常のテキストとして処理
      console.warn("SW: JSONパースに失敗したため、テキストとして取得します:", err);
      message = event.data.text();
    }
  } else {
    console.warn("SW: pushイベントにデータ(event.data)が含まれていません。");
  }

  const targetUrl = "https://oreohasaikounoore.github.io/javascripttest/";

  // OSへ通知の表示を依頼
  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon: "https://www.gstatic.com/images/branding/product/2x/apps_script_64dp.png",
      badge: "https://www.gstatic.com/images/branding/product/2x/apps_script_64dp.png",
      data: {
        url: targetUrl
      }
    })
  );
});

// --- 通知クリック時の処理 (既存の優秀なロジックを維持) ---
self.addEventListener("notificationclick", event => {
  console.log("SW: 通知がクリックされました。");

  event.notification.close();

  const targetUrl =
    event.notification.data?.url ||
    "https://oreohasaikounoore.github.io/javascripttest/";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(clientList => {
      // すでに該当ページが開いているかチェックしてフォーカス
      for (const client of clientList) {
        try {
          const clientUrl = new URL(client.url);
          const target = new URL(targetUrl);

          if (
            clientUrl.origin === target.origin &&
            clientUrl.pathname.startsWith(target.pathname)
          ) {
            if ("focus" in client) {
              console.log("SW: 既存のタブが見つかったため、フォーカスします。");
              return client.focus();
            }
          }
        } catch (err) {
          console.error("SW: タブのURL比較中にエラーが発生しました:", err);
        }
      }

      // 開いていなければ新しくウィンドウを開く
      if (clients.openWindow) {
        console.log("SW: 該当タブがないため、新しくウィンドウを開きます。");
        return clients.openWindow(targetUrl);
      }
    })
  );
});
