/*
 * 설치형 웹앱의 서비스 워커 — 비행기 모드에서도 앱이 열리게 한다 (W4 슬라이스 A).
 *
 * 서비스 워커(service worker)는 브라우저가 이 주소를 위해 따로 돌려 주는 작은 프로그램이다.
 * 화면이 무엇인가를 내려받으려 할 때마다 그 요청이 먼저 이곳을 지나므로, 여기서 받아 둔 것을
 * 대신 내주면 네트워크가 없어도 화면이 선다.
 *
 * ── 무엇을 담고 무엇을 담지 않나 ───────────────────────────────────────────────
 *
 * | 무엇 | 언제 담나 | 왜 그렇게 정했나 |
 * |---|---|---|
 * | 들머리 한 장(`/`)과 그 안이 이름 대는 묶음(js) | **설치할 때 미리** (1.5MB 쯤) | 이 둘이 없으면 앱이 아예 켜지지 않는다. 처음 연 그 자리에서 곧바로 비행기 모드가 되어도 열리게 하려면 미리 받아 두는 수밖에 없다 |
 * | 글꼴 일곱과 성화 열여섯 | **한 번 쓴 것만** (담는 데 27MB + 4.7MB) | 미리 다 받게 하면 처음 여는 사람이 30MB 를 셀룰러로 내려받는다. 글꼴이 없어도 글은 기기 글꼴로 읽히므로 앱이 못 쓰게 되지는 않는다 |
 * | 다른 주소의 것 · GET 이 아닌 요청 | **담지 않는다** | 이 앱은 바깥 서버를 부르지 않는다. 담지 않는 것을 분명히 해 두면 나중에 서버가 생겨도 조용히 옛 답이 나오지 않는다 |
 *
 * ── 어떤 순서로 내주나 ─────────────────────────────────────────────────────────
 *
 * 1. **화면을 여는 요청(navigate)은 네트워크를 먼저 본다.** 화면 파일(html)에는 이름에 지문이
 *    붙어 있지 않아, 담아 둔 것을 먼저 내주면 새 판을 올려도 옛 화면이 계속 뜬다. 네트워크가
 *    없을 때만 담아 둔 것을 내주고, 그마저 없으면 들머리 한 장을 내준다.
 * 2. **그 밖의 것은 담아 둔 것을 먼저 본다.** 묶음·글꼴·성화는 이름에 지문(예:
 *    `entry-66c7c9….js`)이 붙어 있어 내용이 바뀌면 이름이 바뀐다. 그래서 같은 이름이면
 *    같은 내용이고, 담아 둔 것을 내주는 것이 언제나 옳다. 없을 때만 받아서 담는다.
 *
 * ── 판을 올릴 때 옛 것을 어떻게 버리나 ─────────────────────────────────────────
 *
 * 아래 `VERSION` 을 올리면 담는 자리의 이름이 통째로 바뀌고, `activate` 에서 `myrosary-` 로
 * 시작하는 **다른 이름의 자리를 모두 지운다.** 즉 판을 올리는 일은 이 한 글자를 고치는 일이다.
 * 자리 이름에 판을 넣지 않고 안의 것을 하나씩 지우려 들면 무엇이 남았는지 아무도 모르게 된다.
 *
 * 다만 판을 올리지 않아도 앱이 낡은 채로 굳지는 않는다 — 화면 파일은 언제나 네트워크를 먼저
 * 보고(위 1), 묶음은 내용이 바뀌면 이름이 바뀌어 담아 둔 것에 걸리지 않기 때문이다. `VERSION`
 * 을 올리는 것은 **쓰지 않게 된 옛 것을 치우는 일**이지 새것을 보이게 하는 일이 아니다.
 */

const VERSION = 'v1';
const SHELL = `myrosary-shell-${VERSION}`;
const RUNTIME = `myrosary-runtime-${VERSION}`;
const ENTRY = '/';

/**
 * 들머리 한 장이 이름 대는 묶음(js)들을 찾아낸다.
 *
 * 묶음의 이름에는 내용에서 뽑은 지문이 붙어 있어 빌드마다 달라진다(`entry-66c7c9….js`).
 * 그래서 이 파일에 이름을 적어 둘 수 없고, 적어 두면 다음 빌드에서 조용히 어긋난다. 대신
 * 화면 파일을 한 번 읽어 그 안에 적힌 이름을 그대로 쓴다 — 빌드가 무엇을 만들든 따라간다.
 */
function scriptUrlsIn(html) {
  const urls = [];
  const pattern = /<script[^>]+src="(\/[^"]+)"/g;
  let match;
  while ((match = pattern.exec(html)) !== null) urls.push(match[1]);
  return urls;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // `cache: 'reload'` — 브라우저가 이미 갖고 있는 옛 답이 아니라 서버의 지금 것을 받는다.
      const response = await fetch(ENTRY, { cache: 'reload' });
      if (!response.ok) return;
      await cache.put(ENTRY, response.clone());
      const scripts = scriptUrlsIn(await response.text());
      // 하나가 실패해도 나머지는 담는다 — 다 갖추지 못한 채라도 없는 것보다 낫다.
      await Promise.all(scripts.map((url) => cache.add(url).catch(() => undefined)));
    })(),
  );
  // 기다리지 않고 곧바로 일을 넘겨받는다. 처음 연 사람이 화면을 한 번 더 열지 않아도 된다.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('myrosary-') && name !== SHELL && name !== RUNTIME)
          .map((name) => caches.delete(name)),
      );
      // 이미 열려 있는 화면까지 이 워커가 맡는다.
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(serveDocument(request));
    return;
  }
  event.respondWith(serveAsset(request));
});

/** 화면을 여는 요청 — 네트워크를 먼저 보고, 없으면 담아 둔 것, 그것도 없으면 들머리. */
async function serveDocument(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    /*
      `ignoreSearch` 를 켜는 까닭. 시험과 앱이 여는 주소에는 손잡이가 붙는다(`/?demo=1`).
      물음표 뒤가 다르다고 다른 화면인 것은 아니므로, 물음표 앞이 같으면 같은 것으로 본다.
    */
    const hit = await caches.match(request, { ignoreSearch: true });
    if (hit) return hit;
    const entry = await caches.match(ENTRY);
    if (entry) return entry;
    throw error;
  }
}

/** 묶음·글꼴·성화 — 담아 둔 것을 먼저 보고, 없으면 받아서 담는다. */
async function serveAsset(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME);
    await cache.put(request, response.clone());
  }
  return response;
}
