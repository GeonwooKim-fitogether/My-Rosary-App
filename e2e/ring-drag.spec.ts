/**
 * 고리 돌리기 e2e — 손가락으로 묵주를 돌려 알을 옮길 수 있는가 (W1 §3-4 · 통과 조건 2).
 *
 * 이 조작은 새 시안이 더한 것이고, 화면 단추를 거치지 않는 유일한 이동 수단이다. 그래서
 * 단위 시험으로는 절반밖에 못 잰다 — `rosaryState.test.ts` 가 "각도를 주면 몇 번 알인가"를
 * 재고, 여기서는 **손가락을 실제로 끌었을 때 그 알의 첫 기도로 옮겨지는가**를 잰다.
 *
 * ── 손가락 자리를 어떻게 계산하나 ────────────────────────────────────────────
 *
 * 묵주 칸(`pray-stage`)은 가로로 가운데 정렬이고 세로로는 칸을 꽉 채우며, 그림의 좌표계는
 * 240×324 에 고리가 (120, 118, 96)이다. 그래서 칸의 크기만 알면 고리의 중심과 반지름을
 * 곧바로 얻는다 — 화면이 이 계산을 하는 방식(`app/pray.tsx` 의 `ringHit`)과 같은 식을
 * 시험도 쓴다. 두 식이 어긋나면 이 시험이 먼저 걸린다.
 *
 * **시계를 멈추되, 손가락을 옮길 때마다 1밀리초씩만 흘린다.** 두 가지를 함께 지켜야 해서다.
 *
 * 1. 시계를 멈추지 않으면 앱이 스스로 알을 넘겨, 옮겨진 것이 내 손가락 때문인지 시간
 *    때문인지 가릴 수 없다.
 * 2. 그런데 **완전히 멈추면 끌기가 아예 재지지 않는다.** React Native 의 `PanResponder` 는
 *    같은 시각의 움직임을 두 번 세지 않으려고 "마지막으로 센 시각과 지금 사건의 시각이
 *    같으면 건너뛴다"는 가드를 갖고 있는데(`PanResponder` 의 `_accountsForMovesUpTo`),
 *    시계를 멈추면 브라우저가 만드는 사건의 시각이 전부 같은 값이 되어 **첫 움직임 하나만**
 *    전해진다. 이 컨테이너에서 실측해 확인한 사실이다(2026-09-17, 시각이 스물한 번 모두 558).
 *
 * 그래서 움직임 하나마다 `clock.runFor(1)` 로 1밀리초를 흘린다. 스물한 번을 다 해도 21밀리초라
 * 앱이 스스로 알을 넘기기에는 턱없이 짧고, 사건의 시각은 매번 달라져 끌기가 그대로 전해진다.
 * **실기기에서는 이런 일이 없다** — 시계가 멈추지 않으므로 가드에 걸리지 않는다.
 */
import type { Page } from '@playwright/test';
import { expect, test } from './support/harness';
import {
  collectConsoleErrors,
  enterHome,
  enterPrayerFromHome,
  freezeClock,
  openApp,
} from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 그림의 좌표계 — `src/prayer/rosaryState.ts` 의 `VIEWBOX` · `LOOP` · `LOOP_SLOTS` 와 같다. */
const VIEW = { width: 240, height: 324 };
const LOOP = { cx: 120, cy: 118, r: 96 };
const SLOTS = 56;

/** 묵주 칸의 화면 좌표에서 고리의 중심과 반지름을 얻는다. */
async function ringOf(page: Page) {
  const box = (await page.getByTestId('pray-stage').boundingBox())!;
  expect(box).not.toBeNull();
  return {
    cx: box.x + box.width / 2,
    cy: box.y + box.height * (LOOP.cy / VIEW.height),
    r: box.height * (LOOP.r / VIEW.height),
  };
}

/** 고리의 k 번째 알이 화면의 어디에 있나. 알은 k+1 번째 칸에 앉는다. */
function beadPoint(ring: { cx: number; cy: number; r: number }, k: number) {
  const angle = ((k + 1) * 2 * Math.PI) / SLOTS;
  return { x: ring.cx + ring.r * Math.sin(angle), y: ring.cy + ring.r * Math.cos(angle) };
}

test('고리를 손가락으로 끌면 그 알의 첫 기도로 옮겨진다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const step = page.getByTestId('pray-step');

  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await expect(step).toHaveText('시작 기도 · 성호경');
  await freezeClock(page);

  const ring = await ringOf(page);

  /*
   * 고리의 열째 알에서 서른째 알까지 끈다.
   *
   * 자리 번호로 옮기면 `BEADS` 의 15 번과 35 번이고, 시작 기도의 알 넷을 뺀 뒤 한 단(열한
   * 알)으로 나누면 각각 제2단의 첫 알(신비 선포)과 제3단의 아홉째 성모송이다. 두 자리를
   * 고른 이유는 하나가 큰 알이고 하나가 작은 알이며, 사이에 단 경계가 하나 있어 **여러 알을
   * 지나 끌었을 때도 마지막 자리 하나만 남는지**를 함께 볼 수 있기 때문이다.
   */
  const from = beadPoint(ring, 10);
  const to = beadPoint(ring, 30);

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  // 여러 마디로 나눠 끈다 — 실제 손가락처럼 중간 알들을 지나며 지나가게 하려는 것이다.
  // 마디마다 1밀리초를 흘리는 이유는 파일 머리에 적었다.
  for (let i = 1; i <= 20; i++) {
    const at = beadPoint(ring, 10 + i);
    await page.clock.runFor(1);
    await page.mouse.move(at.x, at.y);
  }
  await page.clock.runFor(1);
  await page.mouse.move(to.x, to.y);
  await page.mouse.up();

  // 끌어다 놓은 알의 첫 기도에 서 있다.
  await expect(step).toHaveText('제3단 · 성모송');
  await expect(page.getByTestId('pray-counter')).toHaveText('9 / 10');

  expect(errors).toEqual([]);
});

test('끌지 않고 알 하나를 누르면 그 알로 한 번 옮겨진다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const step = page.getByTestId('pray-step');

  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await expect(step).toHaveText('시작 기도 · 성호경');
  await freezeClock(page);

  const ring = await ringOf(page);
  // 고리의 첫 알 — 자리 번호 5 이고, 제1단의 첫 성모송이다.
  const first = beadPoint(ring, 0);
  await page.mouse.move(first.x, first.y);
  await page.mouse.down();
  await page.mouse.up();

  await expect(step).toHaveText('제1단 · 성모송');
  await expect(page.getByTestId('pray-counter')).toHaveText('1 / 10');

  expect(errors).toEqual([]);
});

test('고리 가운데를 누르면 다음 기도로 한 걸음 간다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const step = page.getByTestId('pray-step');

  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await expect(step).toHaveText('시작 기도 · 성호경');
  await freezeClock(page);

  const ring = await ringOf(page);
  await page.mouse.move(ring.cx, ring.cy);
  await page.mouse.down();
  await page.mouse.up();

  // 성호경 다음은 십자가에 입맞춤이다. 한 번 누르면 딱 한 걸음이다.
  await expect(step).toHaveText('시작 기도 · 십자가에 입맞춤');

  expect(errors).toEqual([]);
});

test('고리 바깥(꼬리와 단추의 자리)을 눌러도 알이 움직이지 않는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const step = page.getByTestId('pray-step');

  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await expect(step).toHaveText('시작 기도 · 성호경');
  await freezeClock(page);

  const ring = await ringOf(page);
  // 반지름의 1.45 배 밖 — 화면은 여기를 고리로 보지 않는다 (`RING_GRAB.outer`).
  await page.mouse.move(ring.cx, ring.cy - ring.r * 1.6);
  await page.mouse.down();
  await page.mouse.up();

  await expect(step).toHaveText('시작 기도 · 성호경');

  expect(errors).toEqual([]);
});
