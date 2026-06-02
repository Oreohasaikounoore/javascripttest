// 【未検証】（GASからの送信部分が未完成なため受信テストは未実施）
self.addEventListener('push', function(event) {
  let messageData = 'Hello World';
  
  if (event.data) {
    // ブラウザが自動で復号したテキストを取得
    messageData = event.data.text();
  }

  const title = 'GAS x GitHub Pages Web Push';
  const options = {
    body: messageData,
    icon: 'https://www.gstatic.com/images/branding/product/2x/apps_script_64dp.png',
    badge: 'https://www.gstatic.com/images/branding/product/2x/apps_script_64dp.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
