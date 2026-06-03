self.addEventListener("install", event => {
  console.log("SW install");
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("SW activate");
});

// プッシュ通知を受信したときのイベント
self.addEventListener("push", event => {
  let message = "Hello World";

  // 通知データがある場合は、そのテキストを取得
  if (event.data) {
    message = event.data.text();
  }

  // 通知を表示するまでサービスワーカーを待機させる
  event.waitUntil(
    self.registration.showNotification(
      "GAS x GitHub Pages Web Push",
      {
        body: message,
        icon: "https://www.gstatic.com/images/branding/product/2x/googleg_64dp.png",
        badge: "https://www.gstatic.com/images/branding/product/2x/googleg_64dp.png"
      }
    )
  );
});
