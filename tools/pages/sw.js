/*
 * 검수용 설치형 웹앱의 서비스 워커.
 *
 * 앱 본체가 파일 한 장(index.html)에 전부 들어 있으므로 담을 것이 아주 적다 —
 * 그 한 장과 아이콘 셋뿐이고, 그래서 설치 즉시 비행기 모드에서도 열린다.
 * 저장소의 `public/sw.js` 와 달리 주소를 `./` 로 적는다. GitHub Pages 는 저장소
 * 이름이 붙은 하위 경로로 서비스되므로, 절대 주소(`/`)로 적으면 남의 자리를 가리킨다.
 */
const VERSION = 'review-1';
const CACHE = 'myrosary-' + VERSION;
const PRECACHE = ['./', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n.startsWith('myrosary-') && n !== CACHE).map((n) => caches.delete(n)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // 화면을 여는 요청은 네트워크를 먼저 본다 — 새 판을 올렸을 때 옛 화면이 남지 않게.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./').then((hit) => hit || Response.error())),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    })),
  );
});
