/**
 * 짧은 화면 e2e — 기도 화면이 짧은 기기에서도 눌리거나 잘리지 않는가.
 *
 * 이 시험은 실기기에서 나온 결함에서 태어났다(2026-09-09). 지금까지의 e2e 는 390×844
 * 한 크기만 봤는데, 실제 폰은 브라우저 주소창이 높이를 가져가 그보다 짧다. 그 짧아진
 * 만큼을 성화 띠가 혼자 떠안아 짜부라졌고 — 844 에서 267px 이던 띠가 640 에서 63px 이
 * 되어 묵주가 잘렸다 — 기도문은 고정 높이 상자를 넘쳐 윗줄이 잘려 나갔다.
 *
 * ── 2026-09-17 (W1) 에 재는 값이 바뀌었다 ─────────────────────────────────────
 *
 * 화면이 새 시안의 어법으로 다시 서면서 넘침을 다루는 방식이 통째로 바뀌었기 때문이다.
 *
 * | | 옛 화면 (v5) | 이 화면 (World) |
 * |---|---|---|
 * | 성화 | 높이 267 을 바닥으로 깐 띠 | 화면 전체를 덮는 배경이라 줄어들 높이가 없다 |
 * | 묵주 칸 | 그 띠 안에 들어간다 | 화면 크기가 정한다 — `min(38dvh, 66vw×1.35, 400px)` |
 * | 넘침 | 화면 전체가 아래로 흐른다 | 화면은 고정이고 **기도문만** 그 칸 안에서 흐른다 |
 *
 * 그래서 "띠가 267 이상인가"는 이제 잴 것이 없는 값이 됐고, 대신 **묵주 칸이 시안의 식대로
 * 정해지는가**를 잰다 — 고정값과 견주는 것보다 식과 견주는 쪽이 화면 크기가 달라져도 산다.
 * 나머지 둘(기도문이 묵주를 침범하지 않는가, 잘리지 않고 흐르는가)은 뜻이 그대로다.
 */
import { expect, test } from './support/harness';
import { collectConsoleErrors, enterHome, enterPrayerFromHome, openApp } from './support/harness';

/** 브라우저 주소창이 높이를 가져간 실제 폰에 가까운 크기. */
test.use({ viewport: { width: 390, height: 640 }, reducedMotion: 'reduce' });

/** 시안이 정한 묵주 칸의 높이 — `min(38dvh, calc(66vw * 1.35), 400px)`. */
function expectedRosaryHeight(width: number, height: number): number {
  return Math.min(0.38 * height, 0.66 * width * 1.35, 400);
}

test('짧은 화면에서도 묵주 칸이 시안의 크기를 지키고 기도문이 그림을 침범하지 않는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);

  const stage = await page.getByTestId('pray-stage').boundingBox();
  const prayer = await page.getByTestId('pray-a').boundingBox();
  expect(stage).not.toBeNull();
  expect(prayer).not.toBeNull();

  // 1. 묵주 칸의 높이가 시안의 식 그대로다 (390×640 에서 243.2).
  const viewport = page.viewportSize()!;
  expect(stage!.height).toBeCloseTo(expectedRosaryHeight(viewport.width, viewport.height), 0);

  // 2. 기도문이 묵주 칸 아래에서 시작한다 — 그림 위로 올라오지 않는다.
  expect(prayer!.y).toBeGreaterThanOrEqual(stage!.y + stage!.height - 1);

  // 3. 앞·뒤 단추가 스크롤 없이 보인다. 화면이 고정이므로 아래가 잘리면 여기서 걸린다.
  await expect(page.getByTestId('pray-step-nav')).toBeInViewport();

  // 4. 넘치는 것은 기도문뿐이고, 그 칸이 스스로 흐른다.
  const prayerScrolls = await page.getByTestId('pray-a').evaluate((element) => {
    let node = element.parentElement;
    while (node) {
      const overflow = getComputedStyle(node).overflowY;
      if (overflow === 'auto' || overflow === 'scroll') return true;
      node = node.parentElement;
    }
    return false;
  });
  expect(prayerScrolls).toBe(true);

  expect(errors).toEqual([]);
});

test('가장 긴 기도문(주님의 기도)에서도 글이 잘리지 않는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);

  // 하루의 시작 기도에 주님의 기도가 있다. 그때까지 시계를 앞당긴다.
  const step = page.getByTestId('pray-step');
  for (let i = 0; i < 60; i++) {
    if ((await step.textContent())?.includes('주님의 기도')) break;
    await page.clock.runFor(2000);
  }
  await expect(step).toContainText('주님의 기도');

  // 기도문 상자가 글 전체를 담는다 — 넘친 윗줄이 잘려 나가지 않는다.
  const clipped = await page.getByTestId('pray-a').evaluate((element) => {
    const box = element.parentElement as HTMLElement;
    return box.scrollHeight > box.clientHeight + 2;
  });
  expect(clipped).toBe(false);

  expect(errors).toEqual([]);
});
