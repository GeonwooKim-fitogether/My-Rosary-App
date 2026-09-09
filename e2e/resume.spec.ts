/**
 * 자리 저장과 이어가기 e2e (FR-02 · FR-17 · FR-18).
 *
 * 이 앱이 사용자에게 하는 약속이 "오늘 어디까지 바쳤는지는 앱이 기억합니다"이므로,
 * 그 약속을 화면에서 직접 확인한다. 저장된 값을 들여다보는 대신 사용자가 하는 그대로
 * 한다 — 조금 바치다 멈추고, 나갔다가, 다시 들어와서 같은 자리인지 본다.
 */
import { expect, test } from '@playwright/test';
import {
  collectConsoleErrors,
  enterHome,
  enterPrayerFromHome,
  openApp,
} from './support/harness';

test.use({ reducedMotion: 'reduce' });

test('잠시 멈추고 나갔다 들어오면 멈춘 자리에서 이어진다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await expect(page.getByTestId('pray-screen')).toBeVisible();

  // 얼마쯤 바친다. 시작 기도를 지나 제1단 안으로 들어갈 만큼.
  await page.clock.runFor(40000);
  const stoppedAt = await page.getByTestId('pray-step').textContent();
  const stoppedText = await page.getByTestId('pray-a').textContent();
  expect(stoppedAt).not.toBe('시작 기도 · 성호경');

  // 잠시 멈춤 — 자리가 남는다. 나가는 곳은 홈이다.
  await page.getByTestId('pray-pause').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();
  // 홈 카드가 멈춘 자리를 말한다 (FR-02 · 06-screen-spec 화면 A).
  await expect(page.getByTestId('home-card-status-0')).toContainText('이어서');

  // 다시 들어오면 멈춘 그 자리다.
  await enterPrayerFromHome(page);
  await expect(page.getByTestId('pray-screen')).toBeVisible();
  await expect(page.getByTestId('pray-step')).toHaveText(stoppedAt ?? '');
  await expect(page.getByTestId('pray-a')).toHaveText(stoppedText ?? '');

  expect(errors).toEqual([]);
});

test('여기서 끝내기를 누르면 다음에 오늘 처음부터 시작한다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await page.clock.runFor(40000);
  await expect(page.getByTestId('pray-step')).not.toHaveText('시작 기도 · 성호경');

  await page.getByTestId('pray-stop').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();

  await enterPrayerFromHome(page);
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 성호경');

  expect(errors).toEqual([]);
});
