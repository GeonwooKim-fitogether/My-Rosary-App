// MyRosary World — offline cache. Sacred images + prayer data are cached on first use;
// the app shell falls back to the cache when the network is unavailable.
const CACHE = 'myrosary-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('myrosary-') && k !== CACHE).map(k => caches.delete(k))))); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const cacheable = /\/img\//.test(url.pathname) || /data\.js$|\.dc\.html$|manifest\.webmanifest$|styles\.css$|_ds_bundle\.js$/.test(url.pathname);
  if (!cacheable) return;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    try { const res = await fetch(e.request); if (res.ok) cache.put(e.request, res.clone()); return res; }
    catch (err) { const hit = await cache.match(e.request); if (hit) return hit; throw err; }
  }));
});
