/**
 * 홈의 `다시 바치기` e2e — **시안의 결함 10 번을 고친 자리가 실제로 그렇게 도는가.**
 *
 * 무엇이 결함이었나. 「MyRosary World」 시안의 홈은 진행선 옆에 `다시 바치기` 를 두고,
 * 그것을 누르면 아무것도 묻지 않고 오늘 바치던 자리를 지우고 처음으로 되돌린다. 스무 단을
 * 바치다 잘못 누른 사람은 그 자리를 되찾을 길이 없다.
 *
 * 그래서 여기서 세 가지를 잰다.
 *
 * 1. **묻는가** — 누르면 곧바로 지우지 않고 확인 시트가 뜬다.
 * 2. **아니라고 하면 자리가 남는가** — `아니요, 이어서` 를 누른 뒤에도 홈이 여전히 멈춘
 *    자리를 말한다. 이것이 가장 중요한 판정이다. 시트만 띄우고 뒤에서 이미 지워 버렸다면
 *    묻는 시늉만 한 것이기 때문이다.
 * 3. **그렇다고 하면 처음부터 가는가** — `처음부터` 를 누르면 기도 화면이 첫 단계에 선다.
 *
 * 주 단추의 글자도 함께 본다. 시안은 멈춘 자리가 있으면 `이어서 기도하기`, 없으면
 * `오늘의 기도 시작` 이라고 적는데, 그 갈림이 실제로 갈리는지 눈이 아니라 글자로 확인한다.
 */
import { expect, test } from '@playwright/test';
import {
  collectConsoleErrors,
  enterHome,
  enterPrayerFromHome,
  freezeClock,
  leavePrayer,
  openApp,
} from './support/harness';

test.use({ reducedMotion: 'reduce' });

test('다시 바치기는 확인을 거친 뒤에만 오늘 자리를 지운다 (시안 결함 10)', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);

  // 아직 오늘을 시작하지 않았으므로 주 단추는 `오늘의 기도 시작` 이고 진행선이 없다.
  await expect(page.getByTestId('home-primary')).toHaveText('오늘의 기도 시작');
  await expect(page.getByTestId('home-again')).toHaveCount(0);

  // 조금 바치다 멈춘다 — 그래야 진행선과 `다시 바치기` 가 선다.
  await enterPrayerFromHome(page);
  await page.clock.runFor(40000);
  // 멈춰 세우지 않으면 홈에서 자리를 읽는 동안 앱이 스스로 알을 넘겨 판정이 흔들린다
  // (`resume.spec.ts` 가 같은 이유로 같은 것을 부른다).
  await freezeClock(page);
  await expect(page.getByTestId('pray-step')).not.toHaveText('시작 기도 · 성호경');
  await leavePrayer(page, 'pause');

  // 홈이 멈춘 자리를 말하고, 주 단추의 글자가 바뀌었다.
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await expect(page.getByTestId('home-primary')).toHaveText('이어서 기도하기');
  await expect(page.getByTestId('home-session-where')).toContainText('이어서');

  // 1. 누르면 곧바로 지우지 않고 묻는다.
  await page.getByTestId('home-again').click();
  await expect(page.getByTestId('sheet-again')).toBeVisible();
  await expect(page.getByTestId('sheet-again')).toContainText(
    '오늘 자리를 지우고 처음부터 바칩니다.',
  );
  await expect(page.getByTestId('sheet-confirm')).toHaveText('처음부터');
  await expect(page.getByTestId('sheet-cancel')).toHaveText('아니요, 이어서');

  // 2. 아니라고 하면 자리가 그대로 남는다 — 묻는 시늉만 한 것이 아니다.
  await page.getByTestId('sheet-cancel').click();
  await expect(page.getByTestId('sheet-again')).toBeHidden();
  await expect(page.getByTestId('home-primary')).toHaveText('이어서 기도하기');
  await expect(page.getByTestId('home-card-status-0')).toContainText('이어서');

  // 3. 그렇다고 하면 오늘 자리를 지우고 처음부터 간다.
  await page.getByTestId('home-again').click();
  await page.getByTestId('sheet-confirm').click();
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 성호경');

  expect(errors).toEqual([]);
});
