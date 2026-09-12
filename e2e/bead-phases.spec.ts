/**
 * 지금 알의 다섯 상태 e2e (FR-15 · 06-screen-spec 화면 B · `src/prayer/phase.ts`).
 *
 * 묵주 그림이 "지금 무슨 일이 벌어지고 있나"를 실제로 말하는지 확인하고, 그 모습을 사진으로
 * 남긴다. 상태는 눈이 아니라 값으로 잰다 — 기도 화면이 묵주 상자에 붙이는 낭독기용 이름
 * (`pray-rosary` 의 `aria-label`)이 상태마다 다르므로 그것을 읽는다. 사진은 사람이 본다.
 *
 * **시계를 실제로 멈춘다.** `openApp` 이 세우는 가짜 시계는 시각을 고정할 뿐 시간은 실시간으로
 * 흐른다 — 그래서 시험의 소리 통로가 "다 읽었다"를 알리는 0ms 타이머가 곧바로 도착해, 읽는 중은
 * 눈 깜짝할 사이에 내 차례로 넘어간다. 기도 화면에 들어선 뒤 `pauseAt` 으로 시간을 멈추면
 * 그 뒤로 상태를 바꾸는 것은 이 시험의 조작과 `runFor` 만이다.
 *
 * - **읽는 중**: 알을 옮기면 진행기가 그 자리의 절을 읽기 시작한다. 시험의 소리 통로는 "다
 *   읽었다"를 타이머로 알리고 시계가 서 있으니, 옮긴 직후는 언제나 읽는 중이다.
 * - **내 차례**: 시계를 조금 흘리면 "다 읽었다"가 도착하고 받는 사이가 시작된다.
 * - **멈춤**: 이어폰의 재생/일시정지 단추가 잠시 멈춤이다. 화면의 `잠시 멈춤` 은 홈으로
 *   나가 버리므로 화면 안에서 멈춘 모습을 보려면 이 길뿐이다.
 * - **단 전환**: 단의 경계를 넘는 순간 진행기가 알리고, 세션이 맥동 시간만큼 붙든다. 시계가
 *   서 있으니 그 순간이 그대로 남는다.
 * - **소리 없이 진행**: 낭송 방식이 읽지 않기인 여정을 새로 만들어 들어간다.
 *
 * 이 시험은 다른 시험들과 같이 동작 줄이기를 켜고 돈다. 그래서 여기 찍히는 사진은 움직임이
 * 아니라 **정지된 모양의 차이**로 다섯 상태가 갈리는지를 보여 준다 — 동작 줄이기를 켠 기기의
 * 사용자가 실제로 보는 모습이다.
 */
import { expect, test } from '@playwright/test';
import {
  collectConsoleErrors,
  enterHome,
  enterPrayerFromHome,
  openApp,
  pressMediaButton,
} from './support/harness';

const OUT = 'docs/plan/bead-phases';

test.use({ reducedMotion: 'reduce' });

/** 지금 시각에서 시간을 멈춘다. 이 뒤로는 `runFor` 로만 시간이 흐른다. */
async function freezeClock(page: import('@playwright/test').Page) {
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 50);
}

/** 알을 하나 옮긴다 — 이어폰의 다음 단추. 화면 단추와 같은 길(`advance`)이다. */
async function nextBead(page: import('@playwright/test').Page, times = 1) {
  for (let i = 0; i < times; i++) {
    await pressMediaButton(page, 'nexttrack');
    await page.waitForTimeout(20);
  }
}

test('교대 낭송에서 읽는 중 · 내 차례 · 멈춤 · 단 전환이 서로 다른 모양으로 보인다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const rosary = page.getByTestId('pray-rosary');
  const step = page.getByTestId('pray-step');

  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await expect(step).toHaveText('시작 기도 · 성호경');
  await freezeClock(page);

  // 제1단의 첫 성모송으로 — 성호경에서 열한 걸음이다 (도해 2~11번).
  // 시작 기도에서 제1단으로 넘는 걸음에서 단 전환이 붙들리므로, 맥동 시간을 흘려 풀어 준다.
  await nextBead(page, 11);
  await expect(step).toHaveText('제1단 · 성모송');
  await page.clock.runFor(500);
  // 그 사이 "다 읽었다"가 도착해 받는 사이가 시작됐다 — 내 차례다.
  await expect(rosary).toHaveAttribute('aria-label', '지금 알: 내가 받을 차례');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/2-response.png` });

  // 한 알 더 — 옮긴 직후는 새 절을 읽는 중이다. 알 바깥에 테두리가 선다.
  await nextBead(page);
  await expect(page.locator('svg text').first()).toHaveText('2');
  await expect(rosary).toHaveAttribute('aria-label', '지금 알: 앱이 읽는 중');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/1-reading.png` });

  // 이어폰의 일시정지 — 화면 안에서 멈춘다. 빛무리가 꺼지고 알이 흐려진다.
  await pressMediaButton(page, 'pause');
  await expect(rosary).toHaveAttribute('aria-label', '지금 알: 멈춤');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/3-paused.png` });

  // 멈춘 채로 알을 옮겨도 멈춤이다 — 멈춤은 알림이 아니라 "돌고 있지 않다"는 사실이다.
  await nextBead(page);
  await expect(page.locator('svg text').first()).toHaveText('3');
  await expect(rosary).toHaveAttribute('aria-label', '지금 알: 멈춤');

  // 다시 이어서. 옮긴 자리의 절부터 읽는다.
  await pressMediaButton(page, 'play');
  await expect(rosary).toHaveAttribute('aria-label', '지금 알: 앱이 읽는 중');

  // 제2단으로 넘어가는 순간 — 셋째 성모송에서 아홉 걸음이다 (성모송 일곱 · 영광송 · 구원을
  // 비는 기도), 그다음 한 걸음이 제2단의 신비 선포다. 그 자리는 큰 알이고 단 전환이 붙든다.
  await nextBead(page, 9);
  await expect(step).toHaveText('제1단 · 구원을 비는 기도');
  await nextBead(page);
  await expect(step).toHaveText('제2단 · 신비 선포');
  await expect(rosary).toHaveAttribute('aria-label', '지금 알: 단이 바뀌었습니다');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/4-decade.png` });

  // 맥동 시간이 지나면 붙들어 둔 다음 상태가 넘어온다.
  await page.clock.runFor(500);
  await expect(rosary).toHaveAttribute('aria-label', '지금 알: 내가 받을 차례');

  expect(errors).toEqual([]);
});

test('읽지 않기 여정에서는 소리 없이 진행 중으로 보인다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const rosary = page.getByTestId('pray-rosary');

  // 빈 홈에서 읽지 않기 여정을 만든다 — 사용자가 하는 그대로.
  await openApp(page, { demo: false });
  await enterHome(page);
  await page.getByTestId('home-new').click();
  await page.getByTestId('new-intent').fill('어머니의 평안');
  await page.getByTestId('new-recitation-silent').click();
  await page.getByTestId('new-start').click();
  await expect(page.getByTestId('pray-title')).toContainText('어머니의 평안');
  await freezeClock(page);

  // 소리가 없으니 읽는 중이 없다 — 들어선 순간부터 소리 없는 진행이다.
  await expect(rosary).toHaveAttribute('aria-label', '지금 알: 소리 없이 진행 중');

  // 제1단의 첫 성모송으로 옮긴 뒤 단 전환의 붙듦을 풀고 찍는다.
  await nextBead(page, 11);
  await expect(page.getByTestId('pray-step')).toHaveText('제1단 · 성모송');
  await page.clock.runFor(500);
  await expect(rosary).toHaveAttribute('aria-label', '지금 알: 소리 없이 진행 중');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/5-silent.png` });

  expect(errors).toEqual([]);
});
