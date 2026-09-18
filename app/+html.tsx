/**
 * 웹으로 내보낼 때 감싸는 바깥 문서 — 설치형 웹앱의 선언 넷이 여기 선다 (W4 슬라이스 A).
 *
 * 이 파일은 **웹 빌드에서만 읽힌다.** expo-router 는 `+html` 이라는 이름의 파일을 화면
 * 목록에서 빼고(`node_modules/expo-router/_ctx.js` 의 거르개), 정적 내보내기가 화면마다
 * html 을 찍을 때 바깥 껍데기로만 쓴다. iOS·안드로이드 앱은 html 자체가 없으므로 이 파일이
 * 하는 말은 그쪽에 닿지 않는다.
 *
 * ── 왜 이 파일이 필요했나 ──────────────────────────────────────────────────────
 *
 * 폰 브라우저가 어떤 주소를 "홈 화면에 놓을 수 있는 앱" 으로 알아보려면 그 화면의 머리에
 * 두 가지가 적혀 있어야 한다 — **설명서 한 장**(`manifest.webmanifest`, 이름·아이콘·어떤
 * 모양으로 열지)과 **서비스 워커 하나**(네트워크가 없을 때 대신 답하는 작은 프로그램). 파일
 * 둘은 `public/` 에 있고 빌드가 `dist/` 로 그대로 옮겨 주지만, **화면이 그 둘을 가리키지
 * 않으면 아무도 찾아가지 않는다.** 그 가리키는 줄을 놓는 자리가 여기다.
 *
 * ── 기본 껍데기를 그대로 베껴 왔다 ─────────────────────────────────────────────
 *
 * 이 파일이 없을 때 쓰이는 기본 껍데기가
 * `node_modules/expo/node_modules/@expo/cli/node_modules/@expo/router-server/build/static/html.js`
 * 에 있다. 이 파일을 두는 순간 그 기본은 통째로 쓰이지 않으므로, **거기 있던 것을 하나도
 * 빠뜨리지 않고 옮긴 뒤 우리 것을 더했다.** 옮겨 온 것은 글자 인코딩·호환 모드·화면 너비
 * 선언 셋과 `ScrollViewStyleReset`(웹에서 화면 전체를 쓰는 앱이 필요로 하는 바탕 스타일),
 * 그리고 `useServerDocumentContext` 가 내주는 네 자리(제목·미리 불러오기 같은 머리 조각과
 * `html`·`body` 의 속성)다. 이 네 자리를 빠뜨리면 글꼴 미리 불러오기가 사라진다.
 *
 * ── 더한 것 셋 ─────────────────────────────────────────────────────────────────
 *
 * 1. **설명서를 가리키는 줄** — `<link rel="manifest">`.
 * 2. **색과 아이콘** — 안드로이드는 `theme-color` 로 위쪽 띠를 칠하고, iOS 는 설명서를 읽지
 *    않으므로 `apple-touch-icon` 과 `apple-mobile-web-app-*` 을 따로 본다. 그래서 같은 말을
 *    두 벌 적는다.
 * 3. **서비스 워커를 등록하는 짧은 글** — 화면이 다 뜬 뒤에 등록한다. 처음 여는 사람의 첫
 *    화면이 늦어지지 않게 하려는 것이다. 실패하면 **조용히 넘어간다** — 서비스 워커는 안전한
 *    주소(https 나 localhost)에서만 도는데, 그렇지 않은 자리에서 앱이 못 쓰게 될 이유는 없다.
 *    앱은 서비스 워커가 없어도 그냥 온라인 앱으로 멀쩡히 돈다.
 *
 * ── 문서의 언어(`lang`)를 건드리지 않은 까닭 — 실제로 재 보고 물러섰다 ────────────
 *
 * 처음에는 이 줄을 `lang="ko"` 로 바꿨다. 한국어 앱이니 당연해 보였기 때문이다. 그런데 바꾼
 * 뒤 화면 사진을 다시 찍어 보니 **지금까지 찍어 둔 사진 스물여덟 장이 모두 달라졌다** —
 * 크로미움이 문서의 언어에 따라 글자를 고르고 줄을 끊는 방식을 바꾸기 때문이다. `lang="en"`
 * 으로 되돌리자 사진이 한 점의 차이도 없이 예전 것과 같아졌다(2026-09-18 실측).
 *
 * 되돌린 판단의 근거는 사진이 아니라 **이 값이 애초에 한 글자로 정해질 수 없다**는 데 있다.
 * 이 앱의 언어는 설정에서 바뀌는 값이고(일곱 벌), 웹 빌드는 화면을 **미리 한 번 찍어 두므로**
 * 그 자리에서는 사람이 무슨 언어를 고를지 알 수 없다. `ko` 로 못박으면 영어를 고른 사람의
 * 문서가 한국어라고 말하게 된다. 바르게 하려면 설정이 바뀔 때마다 브라우저에서
 * `document.documentElement.lang` 을 함께 고쳐야 하고, 그것은 **언어를 다루는 슬라이스 B 의
 * 일**이지 설치형 웹앱을 세우는 이 슬라이스의 일이 아니다.
 *
 * 그래서 기본값(`en`)을 그대로 두되, **지금 문서의 언어가 앱의 언어와 묶여 있지 않다**는
 * 사실을 여기 적어 둔다 — 화면 낭독기가 한국어 문장을 영어로 읽으려 할 수 있다는 뜻이며,
 * 이것은 고쳐야 할 자리이지 고치기로 한 자리가 아니다.
 */
import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * 서비스 워커를 등록하는 글. 화면 안에서 곧바로 도는 짧은 글이라 파일로 빼지 않는다 —
 * 파일로 빼면 그 파일을 받아 오는 동안 등록이 늦어지고, 받아 오지 못하면 아예 등록되지 않는다.
 */
const REGISTER_SERVICE_WORKER = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}
`;

export default function Document({ children }: PropsWithChildren) {
  const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } = useServerDocumentContext();
  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* ── 설치형 웹앱 (W4 슬라이스 A) ───────────────────────────────── */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#EDE7D8" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="묵주" />

        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
        <script dangerouslySetInnerHTML={{ __html: REGISTER_SERVICE_WORKER }} />
      </body>
    </html>
  );
}
