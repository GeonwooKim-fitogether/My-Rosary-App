/**
 * 자리 저장과 이어가기 e2e (FR-02 · FR-17 · FR-18).
 *
 * 이 앱이 사용자에게 하는 약속이 "오늘 어디까지 바쳤는지는 앱이 기억합니다"이므로,
 * 그 약속을 화면에서 직접 확인한다. 저장된 값을 들여다보는 대신 사용자가 하는 그대로
 * 한다 — 조금 바치다 멈추고, 나갔다가, 다시 들어와서 같은 자리인지 본다.
 */
import { expect, test } from './support/harness';
import {
  collectConsoleErrors,
  enterHome,
  enterPrayerFromHome,
  freezeClock,
  leavePrayer,
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
  // 여기서 시간을 멈춘다. `openApp` 이 세우는 가짜 시계는 시각만 고정할 뿐 시간은 실시간으로
  // 흐르므로, 멈추지 않으면 자리를 읽은 뒤 멈춤을 누르기까지의 몇십 밀리초 사이에 앱이 알을
  // 하나 더 넘겨 버린다. 그러면 저장된 자리가 방금 읽은 자리보다 앞서고, 다시 들어왔을 때
  // 두 값이 어긋나 시험이 실패한다 — 실제로 여섯 번에 한 번 그렇게 실패했다(2026-09-17).
  await freezeClock(page);
  const stoppedAt = await page.getByTestId('pray-step').textContent();
  const stoppedText = await page.getByTestId('pray-a').textContent();
  expect(stoppedAt).not.toBe('시작 기도 · 성호경');

  // 잠시 멈춤 — 자리가 남는다. 나가는 곳은 홈이다. (뒤로 화살표가 나가는 방법을 먼저 묻는다.)
  await leavePrayer(page, 'pause');
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
  // 같은 이유로 시간을 멈춘다 — 다시 들어온 뒤 "처음부터"를 재는 동안 앱이 스스로 알을
  // 넘기면 그 판정도 흔들린다.
  await freezeClock(page);
  await expect(page.getByTestId('pray-step')).not.toHaveText('시작 기도 · 성호경');

  await leavePrayer(page, 'stop');
  await expect(page.getByTestId('home-screen')).toBeVisible();

  await enterPrayerFromHome(page);
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 성호경');

  expect(errors).toEqual([]);
});
