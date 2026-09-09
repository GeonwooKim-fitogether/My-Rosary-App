/**
 * 여정 e2e — 새 기도를 만들어 첫날을 바치고, 홈과 여정 상세가 그 하루를 반영하는가,
 * 그리고 날짜를 돌려 쉰네 날째를 바치면 여정 완주 화면에 닿는가.
 *
 * 여기서 확인하는 것은 M2 의 뼈대 넷이다.
 *
 * 1. **빈 홈에서 시작해 여정을 만든다** — 저장된 여정이 없는 것이 처음의 정상 상태다.
 * 2. **저장된다** — 하루를 바친 뒤 홈으로 나오면 카드가 `오늘 바쳤습니다`로 바뀐다.
 * 3. **격자가 선다** — 여정 상세의 54칸과 통계가 실제 기록을 말한다.
 * 4. **끝이 있다** — 날짜를 쉰네 날째로 돌린 뒤 하루를 바치면 여정 완주 화면이 뜬다.
 */
import { expect, test } from '@playwright/test';
import {
  collectConsoleErrors,
  enterHome,
  enterPrayerFromHome,
  openApp,
  runUntilVisible,
} from './support/harness';

test.use({ reducedMotion: 'reduce' });

test('빈 홈에서 새 기도를 만들어 첫날을 바치면 홈과 여정 상세가 함께 바뀐다', async ({ page }) => {
  const errors = collectConsoleErrors(page);

  // 1. 여정이 하나도 없는 홈 — 06-screen-spec 이 "이것이 정상 상태다"라고 적은 그 화면이다.
  await openApp(page, { demo: false });
  await enterHome(page);
  await expect(page.getByTestId('home-empty')).toBeVisible();

  // 2. 새 기도 — 바람을 적고 형식을 고른다.
  await page.getByTestId('home-new').click();
  await expect(page.getByTestId('new-screen')).toBeVisible();

  // 바람 없이 시작하려 하면 시작되지 않는다 (FR-33).
  await page.getByTestId('new-start').click();
  await expect(page.getByTestId('new-missing-title')).toBeVisible();

  await page.getByTestId('new-intent').fill('아버지의 건강');
  // 형식 셋이 모두 눌린다 — 고른 것에 따라 마치는 날이 함께 바뀐다.
  await page.getByTestId('new-format-novena9').click();
  await expect(page.getByTestId('new-finish')).toHaveText('9월 13일에 마칩니다.');
  await page.getByTestId('new-format-fiftyfour').click();
  await expect(page.getByTestId('new-finish')).toHaveText('10월 28일에 마칩니다.');

  await page.getByTestId('new-start').click();

  // 3. 곧바로 기도다. 첫날이므로 1일째다.
  await expect(page.getByTestId('pray-title')).toContainText('아버지의 건강');
  await expect(page.getByTestId('pray-title')).toContainText('1일째 · 청원');

  // 4. 81단계를 스스로 지나 하루 완주로.
  await runUntilVisible(page, 'day-done-screen');
  await expect(page.getByTestId('day-done-head')).toHaveText('9월 5일 · 첫 번째 날');
  await expect(page.getByTestId('day-done-summary')).toHaveText(
    '54일 중 1일 바쳤습니다 · 남은 53일',
  );

  // 5. 홈으로 돌아오면 카드가 오늘을 말한다.
  await page.getByTestId('day-done-back').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await expect(page.getByTestId('home-card-title-0')).toHaveText('아버지의 건강');
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('1일째 · 청원');
  await expect(page.getByTestId('home-card-status-0')).toHaveText('오늘 바쳤습니다');

  // 6. 리본을 누르면 여정 상세 — 격자 쉰네 칸과 통계가 선다.
  await page.getByTestId('home-ribbon-0').click();
  await expect(page.getByTestId('journey-screen')).toBeVisible();
  await expect(page.getByTestId('journey-title')).toHaveText('아버지의 건강');
  await expect(page.getByTestId('journey-grid').locator('> div')).toHaveCount(54);
  await expect(page.getByTestId('journey-count')).toHaveText('54일 중 1일');
  await expect(page.getByTestId('journey-prayed')).toHaveText('1일');
  await expect(page.getByTestId('journey-missed')).toHaveText('0일');
  await expect(page.getByTestId('journey-hails')).toHaveText('53번');
  await expect(page.getByTestId('journey-finish')).toHaveText('10월 28일');

  expect(errors).toEqual([]);
});

test('날짜를 쉰네 날째로 돌린 뒤 하루를 바치면 여정 완주 화면에 닿는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);

  // 본보기 여정은 오늘이 23일째다(8월 14일 시작). 시계를 10월 6일로 옮기면 54일째가 된다.
  await openApp(page);
  await enterHome(page);
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('23일째 · 청원');

  await page.clock.setSystemTime(new Date('2026-10-06T09:00:00'));
  await page.reload();
  await expect(page.getByTestId('home-screen')).toBeVisible();
  // 안 켠 날들은 못 바친 날로 남고 오늘이 54일째다 (FR-35).
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('54일째 · 감사');

  await enterPrayerFromHome(page);
  await runUntilVisible(page, 'all-done-screen');

  await expect(page.getByTestId('all-done-screen')).toBeVisible();
  await expect(page.getByTestId('all-done-head')).toHaveText('쉰네 번째 날 · 10월 6일');
  await expect(page.getByTestId('all-done-title')).toContainText('쉰네 날을');
  // 스무 날 바치고 두 날 걸렀던 여정에, 오늘 하루가 더해져 스물한 날이다.
  await expect(page.getByTestId('all-done-note')).toHaveText('성모송 1,113번');

  // 목록으로 돌아오면 마친 여정으로 보인다.
  await page.getByTestId('all-done-home').click();
  await expect(page.getByTestId('home-card-status-0')).toHaveText('54일 중 21일을 바쳤습니다');

  expect(errors).toEqual([]);
});

test('여정 상세에서 오늘 처음부터 바치고, 여정을 그만둘 수 있다 (S3 · S6)', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);

  // 조금 바치다 멈춘다 — 그래야 `오늘 처음부터` 가 뜬다 (FR-18).
  await enterPrayerFromHome(page);
  await page.clock.runFor(40000);
  await expect(page.getByTestId('pray-step')).not.toHaveText('시작 기도 · 성호경');
  await page.getByTestId('pray-pause').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();

  // 리본으로 여정 상세에 들어가 오늘 자리를 지운다 (시트 S3).
  await page.getByTestId('home-ribbon-0').click();
  await page.getByTestId('journey-restart').click();
  await expect(page.getByTestId('sheet-restart')).toContainText(
    '오늘 자리를 지우고 처음부터 바칩니다.',
  );
  await page.getByTestId('sheet-confirm').click();
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 성호경');

  // 다시 상세로 돌아와 여정을 그만둔다 (시트 S6). 홈이 빈 홈으로 돌아간다.
  await page.getByTestId('pray-pause').click();
  await page.getByTestId('home-ribbon-0').click();
  await page.getByTestId('journey-quit').click();
  await expect(page.getByTestId('sheet-quit')).toContainText('이 기도를 지웁니다.');
  await page.getByTestId('sheet-confirm').click();
  await expect(page.getByTestId('home-empty')).toBeVisible();

  // 지운 것은 다시 열어도 지워져 있다.
  await page.reload();
  await expect(page.getByTestId('home-empty')).toBeVisible();

  expect(errors).toEqual([]);
});
