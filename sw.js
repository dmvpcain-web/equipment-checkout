// Equipment Checkout Service Worker
// Note: use relative URLs so GitHub Pages repo sites (/<repo>/...) work correctly.

const CACHE_NAME = 'equipment-checkout-v5';

const CORE_ASSETS = [
  './equipment-checkout.html',
  './manifest.json'
];

// Optional asset: if this fails to cache (network, blocked CDN), we don't want install to fail.
const OPTIONAL_ASSETS = [
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);

    // Best-effort cache for optional assets
    await Promise.all(
      OPTIONAL_ASSETS.map((url) => cache.add(url).catch(() => null))
    );
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith('equipment-checkout-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const resp = await fetch(event.request);
      return resp;
    } catch (err) {
      // If offline and not cached, just fail normally.
      throw err;
    }
  })());
});
