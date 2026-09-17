/**
 * 짧은 화면 e2e — 기도 화면이 눌리지 않고 아래로 흐르는가.
 *
 * 이 시험은 실기기에서 나온 결함에서 태어났다(2026-09-09). 지금까지의 e2e 는 390×844
 * 한 크기만 봤는데, 실제 폰은 브라우저 주소창이 높이를 가져가 그보다 짧다. 그 짧아진
 * 만큼을 성화 띠가 혼자 떠안아 짜부라졌고 — 844 에서 267px 이던 띠가 640 에서 63px 이
 * 되어 묵주가 잘렸다 — 기도문은 고정 높이 상자를 넘쳐 윗줄이 잘려 나갔다.
 *
 * 그래서 여기서 재는 것은 "화면이 뜨는가"가 아니라 **세 가지 크기가 지켜지는가**다.
 * 눈으로 보는 검수는 사람이 하고, 이 시험은 그 사람이 없을 때를 지킨다.
 */
import { expect, test } from '@playwright/test';
import { collectConsoleErrors, enterHome, enterPrayerFromHome, openApp } from './support/harness';

/** 브라우저 주소창이 높이를 가져간 실제 폰에 가까운 크기. */
test.use({ viewport: { width: 390, height: 640 }, reducedMotion: 'reduce' });

/** 성화 띠가 844 에서 갖는 높이. 이보다 줄면 묵주가 잘린다. */
const STAGE_HEIGHT = 267;

test('짧은 화면에서도 성화 띠가 줄지 않고 기도문이 그림을 침범하지 않는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);

  const stage = await page.getByTestId('pray-stage').boundingBox();
  const prayer = await page.getByTestId('pray-a').boundingBox();
  expect(stage).not.toBeNull();
  expect(prayer).not.toBeNull();

  // 1. 성화 띠가 844 에서와 같은 높이를 지킨다.
  expect(stage!.height).toBeGreaterThanOrEqual(STAGE_HEIGHT);

  // 2. 기도문이 성화 띠 아래에서 시작한다 — 그림 위로 올라오지 않는다.
  expect(prayer!.y).toBeGreaterThanOrEqual(stage!.y + stage!.height - 1);

  // 3. 넘치는 만큼은 스크롤로 흐른다. 창보다 내용이 길어야 이 화면이 잘리지 않았다는 뜻이다.
  const scrollable = await page.evaluate(() =>
    [...document.querySelectorAll('div')].some((element) => {
      const overflow = getComputedStyle(element).overflowY;
      return (
        (overflow === 'auto' || overflow === 'scroll') &&
        element.scrollHeight > element.clientHeight + 2
      );
    }),
  );
  expect(scrollable).toBe(true);

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
