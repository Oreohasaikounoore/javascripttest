log("プッシュサーバー(FCM等)に接続してエンドポイントを生成中...", "text");

try {

  const state = await reg.pushManager.permissionState({
    userVisibleOnly: true,
    applicationServerKey
  });

  log(`permissionState: ${state}`, "info");

  const existing =
    await reg.pushManager.getSubscription();

  if (existing) {

    log(
      "既存Subscription発見:",
      "info"
    );

    log(
      JSON.stringify(existing, null, 2),
      "info"
    );
  }

  const sub =
    await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

  log(
    "🎉 プッシュサーバーへの登録に成功しました！",
    "success"
  );

  log(
    "【取得した購読情報 (Subscription)】\n" +
    JSON.stringify(sub, null, 2),
    "info"
  );

} catch (err) {

  log(
    "===== Push Subscribe Error =====",
    "error"
  );

  log(
    `name: ${err.name}`,
    "error"
  );

  log(
    `message: ${err.message}`,
    "error"
  );

  if ("code" in err) {
    log(
      `code: ${err.code}`,
      "error"
    );
  }

  if (err.stack) {
    log(
      `stack:\n${err.stack}`,
      "error"
    );
  }

  log(
    `Notification.permission=${Notification.permission}`,
    "error"
  );

  log(
    `controller=${!!navigator.serviceWorker.controller}`,
    "error"
  );

  throw err;
}
