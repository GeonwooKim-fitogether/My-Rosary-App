/**
 * 비행기 모드 e2e — 인터넷을 끊고도 앱이 열리고 기도 화면까지 가는가 (W4 슬라이스 A).
 *
 * ── 이 시험이 실제로 재는 것 ───────────────────────────────────────────────────
 *
 * 설치형 웹앱의 값은 "홈 화면에 아이콘이 놓인다" 가 아니라 **"네트워크가 없어도 열린다"** 다.
 * 그 일을 하는 것은 서비스 워커(`public/sw.js`) 하나이고, 그것이 실제로 돌고 있는지는
 * 단위 시험으로 잴 수 없다 — 브라우저가 따로 돌려 주는 프로그램이기 때문이다. 그래서 이
 * 시험은 진짜 브라우저에서 진짜로 네트워크를 끊는다.
 *
 * **캐시가 되지 않으면 이 시험은 반드시 깨진다.** 인터넷이 끊긴 채 여는 화면 요청은 서버에
 * 닿지 못하므로, 서비스 워커가 담아 둔 것을 내주지 않으면 화면이 아예 뜨지 않는다.
 *
 * ── 왜 두 번 열고 나서 끊나 ────────────────────────────────────────────────────
 *
 * 서비스 워커는 **자기가 설치된 그 화면의 요청은 이미 지나간 뒤에 일을 넘겨받는다.** 그래서
 * 처음 여는 화면이 받아 온 글꼴과 성화는 워커의 손을 거치지 않아 담기지 않는다. 두 번째로
 * 열 때부터 모든 요청이 워커를 지나므로, 여기서도 한 번 열어 기도까지 가 본 뒤(담는 회차)
 * 인터넷을 끊고 다시 연다. 사람으로 치면 **"한 번 써 본 사람이 비행기에서 다시 여는"** 일이다.
 *
 * ── 인터넷이 정말 끊겼는지도 함께 잰다 ─────────────────────────────────────────
 *
 * 끊기가 듣지 않으면 이 시험은 아무것도 재지 않으면서 초록으로 지나간다. 그래서 끊은 직후
 * **담아 둔 적이 없는 주소**를 한 번 불러 보고, 그것이 실패하는 것을 확인한 뒤에 본 판정으로
 * 들어간다.
 */
import { expect, test } from '@playwright/test';
import { enterHome, enterPrayerFromHome, openApp, reopenApp } from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 성화 뽑기의 씨앗. 회차마다 같은 그림이 나와야 담아 둔 그림을 다시 쓰는지 잴 수 있다. */
const ART_SEED = 20260918;

test('인터넷을 끊어도 앱이 열리고 기도 화면까지 간다', async ({ page, context }) => {
  // ── 첫 회차: 서비스 워커가 설치된다 ─────────────────────────────────────────
  await openApp(page, { art: ART_SEED });
  await enterHome(page);
  await enterPrayerFromHome(page);

  // 워커가 일을 넘겨받았다(`clients.claim`). 이때부터 이 화면의 요청은 워커를 지난다.
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, {
    timeout: 30_000,
  });

  // ── 둘째 회차: 화면·묶음·글꼴·성화가 워커를 지나며 담긴다 ───────────────────
  await reopenApp(page, { path: '/', art: ART_SEED });
  await enterHome(page);
  await enterPrayerFromHome(page);

  // ── 인터넷을 끊는다 ─────────────────────────────────────────────────────────
  await context.setOffline(true);

  // 끊기가 정말 들었는가. 담아 둔 적이 없는 주소는 이제 실패해야 한다.
  const reachedNetwork = await page.evaluate(async () => {
    try {
      await fetch(`/__offline-probe-${Date.now()}.json`, { cache: 'no-store' });
      return true;
    } catch {
      return false;
    }
  });
  expect(reachedNetwork).toBe(false);

  // ── 본 판정: 끊긴 채로 앱을 다시 열어 기도까지 간다 ─────────────────────────
  await reopenApp(page, { path: '/', art: ART_SEED });
  await expect(page.getByTestId('login-google')).toBeVisible();

  await enterHome(page);
  await enterPrayerFromHome(page);
  await expect(page.getByTestId('pray-title')).toBeVisible();

  // 끊긴 화면을 내준 것이 네트워크가 아니라 서비스 워커였다는 것을 못 박는다.
  const controlled = await page.evaluate(() => navigator.serviceWorker.controller !== null);
  expect(controlled).toBe(true);

  /*
    사진 한 장을 여기서 찍는다 (`docs/plan/w4-screens/offline-pray.png`).

    다른 사진들은 `e2e/screenshots.spec.ts` 에 모여 있는데 이 한 장만 여기 있는 까닭은,
    **인터넷을 끊은 상태여야 찍을 수 있는 사진**이기 때문이다. 그 상태를 만드는 받침대가
    전부 이 파일에 있으므로 옮기면 같은 것을 두 번 짓게 된다.

    성화가 그대로 보이는 것이 이 사진의 핵심이다 — 글자만 남고 그림이 비면 "열리기는 했지만
    앱 같지는 않다" 는 뜻이고, 그림까지 살아 있어야 담아 두기가 제 몫을 한 것이다.
  */
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'docs/plan/w4-screens/offline-pray.png' });
});
