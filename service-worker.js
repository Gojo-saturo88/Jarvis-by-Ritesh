const CACHE_NAME = "jarvis-2-shell-v8";
const SHELL = ["/", "/index.html", "/style.css", "/extras.css", "/glassmorphism.css", "/app.js", "/extras.js", "/manifest.json"];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL.map(url => new Request(url, { cache: "reload" })).filter(Boolean).slice(0, 8).map(r => r.url));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("jarvis-2-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  const isAsset = /\.(?:css|js|html|json|svg|png|webp|ico)$/i.test(url.pathname) || url.pathname === "/";
  if (isAsset) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request, { cache: "no-store" });
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, fresh.clone()).catch(() => {});
        }
        return fresh;
      } catch {
        return (await caches.match(request)) || (await caches.match("/index.html")) || Response.error();
      }
    })());
  }
});
