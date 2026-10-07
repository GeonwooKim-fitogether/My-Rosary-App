/**
 * 웹 빌드(`dist/`)를 **파일 하나짜리 HTML**로 묶는다.
 *
 * 왜 필요한가. 개발자 계정이 승인되기 전에는 폰에 앱을 설치할 수 없다. 그런데 이 앱이
 * 답해야 하는 질문("잠자기 전에 손대지 않고 끝까지 가는가")은 폰에서만 답이 나온다.
 * 그래서 웹 빌드를 파일 하나로 묶어, 폰의 브라우저에서 주소 하나로 열어 볼 수 있게 한다.
 * 설치본을 대신하는 것이 아니라 그 앞에 두는 임시 통로다.
 *
 * 무엇을 하나.
 *  1. `dist/index.html` 의 뼈대를 읽는다.
 *  2. 성화 열여섯 장을 data URI 로 자바스크립트 번들 안에 박는다.
 *  3. 글꼴은 박지 않는다 — 한국어 글꼴 세 벌이 26MB 라 파일 하나로 담을 수 없다.
 *     대신 같은 글꼴을 Google Fonts 에서 받도록 `@font-face` 를 다시 쓴다. 거기서 오는
 *     것은 글자 범위별로 잘게 나뉜 woff2 라, 브라우저가 실제로 쓰는 조각만 내려받는다.
 *  4. 번들을 HTML 안에 넣는다.
 *
 * 쓰는 법: `node tools/pack/pack-single-html.mjs [나갈 파일 경로]`
 * 먼저 `npm run build:web` 으로 `dist/` 가 있어야 한다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(ROOT, 'dist');
const OUT = process.argv[2] ?? join(ROOT, 'dist-single', 'myrosary.html');

/** 앱이 쓰는 글꼴 이름을 Google Fonts 의 이름·굵기로 잇는 표. */
const FONT_MAP = [
  { app: 'NotoSerifKR-Regular', google: 'Noto Serif KR', weight: '400' },
  { app: 'NotoSansKR-Regular', google: 'Noto Sans KR', weight: '400' },
  { app: 'NotoSansKR-Medium', google: 'Noto Sans KR', weight: '500' },
];

const GOOGLE_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500' +
  '&family=Noto+Serif+KR:wght@400&display=swap';

/** 브라우저인 척해야 woff2 를 준다. ttf 를 주면 파일이 몇 배로 커진다. */
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };

function fail(message) {
  console.error('묶기 실패 — ' + message);
  process.exit(1);
}

/** Google Fonts 의 `@font-face` 들을 앱이 쓰는 글꼴 이름으로 고쳐 쓴다. */
async function fontFaces() {
  const res = await fetch(GOOGLE_CSS_URL, { headers: { 'User-Agent': BROWSER_UA } });
  if (!res.ok) fail(`글꼴 CSS 를 받지 못했다 (HTTP ${res.status})`);
  const css = await res.text();
  if (!css.includes('woff2')) fail('글꼴 CSS 에 woff2 가 없다 — 사용자 에이전트를 확인할 것');

  const blocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
  const out = [];
  for (const block of blocks) {
    const family = /font-family:\s*'([^']+)'/.exec(block)?.[1];
    const weight = /font-weight:\s*(\d+)/.exec(block)?.[1];
    for (const m of FONT_MAP) {
      if (m.google === family && m.weight === weight) {
        out.push(block.replace(/font-family:\s*'[^']+'/, `font-family:'${m.app}'`));
      }
    }
  }
  if (out.length === 0) fail('앱 글꼴에 이어 붙일 @font-face 를 하나도 찾지 못했다');
  return out.join('\n');
}

const html = existsSync(join(DIST, 'index.html'))
  ? readFileSync(join(DIST, 'index.html'), 'utf8')
  : fail('dist/index.html 이 없다. 먼저 npm run build:web 을 실행할 것');

/** 번들 파일 경로를 index.html 에서 읽어 온다 (이름에 해시가 붙어 매번 달라진다). */
const bundlePath = /<script src="([^"]+entry-[^"]+\.js)"/.exec(html)?.[1];
if (!bundlePath) fail('index.html 에서 번들 스크립트를 찾지 못했다');

let bundle = readFileSync(join(DIST, bundlePath.replace(/^\//, '')), 'utf8');

/** 자산을 data URI 로 바꿔 넣는다. 바꾸지 못한 것이 있으면 그대로 멈춘다. */
let inlined = 0;
bundle = bundle.replace(/\/assets\/assets\/[A-Za-z0-9_./-]+/g, (path) => {
  const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
  const mime = MIME[ext];
  if (!mime) return path; // 글꼴은 건드리지 않는다 — Google Fonts 가 대신한다
  const file = join(DIST, path.replace(/^\//, ''));
  if (!existsSync(file)) fail(`자산을 찾지 못했다: ${path}`);
  inlined += 1;
  return `data:${mime};base64,${readFileSync(file).toString('base64')}`;
});
if (inlined === 0) fail('성화를 하나도 넣지 못했다 — 자산 경로 형식이 바뀌었는지 확인할 것');

/** HTML 안에 넣을 때 `</script` 가 스크립트를 일찍 닫는 것을 막는다. */
const safeBundle = bundle.replace(/<\/script/gi, '<\\/script');

const styles = [...html.matchAll(/<style id="([^"]+)"[^>]*>([\s\S]*?)<\/style>/g)];
if (styles.length === 0) fail('index.html 에서 스타일 블록을 찾지 못했다');

const body = /<body>([\s\S]*?)<script src="[^"]+entry-/.exec(html)?.[1]
  ?? fail('index.html 에서 본문을 찾지 못했다');

const faces = await fontFaces();

const parts = ['<title>묵주</title>'];
for (const [, id, css] of styles) {
  // 글꼴 블록만 Google Fonts 판으로 갈아 끼운다. 나머지 둘은 그대로 쓴다.
  parts.push(`<style id="${id}">${id === 'expo-generated-fonts' ? faces : css}</style>`);
}
parts.push(body);
// 미리 그려 둔 화면에 이어 붙이지 않고(hydrate) 처음부터 다시 그리게 한다.
//
// 원본 웹 빌드는 서버에서 미리 그린 첫 화면 위에 앱을 이어 붙인다. 그런데 이 파일은
// 어느 주소에 올라갈지 알 수 없고, 깊은 주소에 올라가면 앱이 첫 화면 대신 `+not-found`
// 를 그리려 한다. 미리 그려 둔 것(첫 화면)과 어긋나 React 가 하이드레이션 오류를 낸다.
// 파일 하나짜리 판에서 이어 붙이기가 버는 것은 첫 그림 몇 밀리초뿐이라, 끄는 편이 낫다.
//
// 순서도 함께 고쳐 둔다. 원본은 이 표시를 module 스크립트에 두고 번들에 defer 를 걸어
// 순서를 맞추는데, 한 파일로 묶으면 번들이 defer 없는 보통 스크립트가 되어 module 보다
// 먼저 돈다. 그래서 표시도 보통 스크립트로 두어 번들 앞에 확실히 놓는다.
parts.push('<script>globalThis.__EXPO_ROUTER_HYDRATE__=false;</script>');
parts.push(`<script>${safeBundle}</script>`);

const out = parts.join('\n');
writeFileSync(OUT, out);
console.log(
  `묶었다 → ${OUT}\n` +
    `  성화 ${inlined}장을 파일 안에 넣었다\n` +
    `  글꼴 @font-face ${faces.split('@font-face').length - 1}개를 Google Fonts 로 이었다\n` +
    `  크기 ${(out.length / 1024 / 1024).toFixed(2)} MB`,
);
