self.addEventListener("install", event => {
console.log("SW install");
self.skipWaiting();
});

self.addEventListener("activate", event => {
console.log("SW activate");
});

self.addEventListener("push", event => {

```
let message =
    "Hello World";

if (event.data) {
    message =
        event.data.text();
}

event.waitUntil(
    self.registration.showNotification(
        "GAS x GitHub Pages Web Push",
        {
            body: message,
            icon:
                "https://www.gstatic.com/images/branding/product/2x/apps_script_64dp.png",
            badge:
                "https://www.gstatic.com/images/branding/product/2x/apps_script_64dp.png"
        }
    )
);
```

});
