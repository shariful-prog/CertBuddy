// CertBuddy service worker.
// Its main job is to make the site an installable PWA on Android Chrome
// (which requires a registered SW with a fetch handler) and to give the
// app a lightweight offline fallback via a network-first cache.

const CACHE = "certbuddy-v2";
const OFFLINE_URLS = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Network-first for navigations, falling back to cache when offline.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept build output or other cache-busted assets. Next.js serves
  // these under content-hashed URLs, so caching them here only serves stale
  // chunks after a rebuild — which causes hydration mismatches. Let the browser
  // fetch them normally (they're already immutable-cached by their hashed URL).
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/") || url.pathname === "/sw.js")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/"))
        )
    );
    return;
  }

  // Cache-first for same-origin static assets (icons, manifest, etc.).
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
  }
});
