/**
 * 여정 e2e — 새 시안의 어법으로 다시 세운 여정 화면이 실제로 도는가 (W3 슬라이스 A).
 *
 * 여기서 확인하는 것은 다섯이다.
 *
 * 1. **여정을 만드는 자리가 여정 화면 하나다** — 홈의 `새 기도` 를 눌러 닿는 곳이 이제 이
 *    화면이고, 그 아래쪽에서 형식을 고르고 바람을 적어 시작한다
 *    (`docs/plan/w3-work-order.md` §1-2).
 * 2. **격자가 아홉 열이다** — 54일 여정이면 칸이 54개이고, 첫날을 바치면 그중 한 칸이 칠해진다
 *    (§1-1). 칸 수는 세어서 확인하고, 칠해진 칸은 색으로 확인한다.
 * 3. **줄이 펴지고 접힌다** — 새 시안에는 여정 상세 화면이 없고 목록의 줄이 아코디언처럼
 *    펴진다. 접힌 동안에는 격자도 단추도 없다.
 * 4. **날짜를 돌려 쉰네 날째를 바치면 여정 완주 화면에 닿는다** — 그 사이에 시기가 28일째에
 *    청원에서 감사로 바뀌고 신비가 환희·고통·영광으로 도는 것을 함께 본다 (FR-35 · FR-43).
 * 5. **지우기는 확인을 거친다** — 시안은 묻지 않고 지우지만 이 저장소는 묻는다 (FR-05 · S6).
 */
import { expect, test } from '@playwright/test';
import {
  collectConsoleErrors,
  enterHome,
  enterPrayerFromHome,
  leavePrayer,
  openApp,
  openJourneys,
  reopenApp,
  runUntilVisible,
} from './support/harness';

test.use({ reducedMotion: 'reduce' });

test('여정 화면에서 새 여정을 만들어 첫날을 바치면 격자에 칸 하나가 칠해진다', async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);

  // 1. 여정이 하나도 없는 홈 — 06-screen-spec 이 "이것이 정상 상태다"라고 적은 그 화면이다.
  await openApp(page, { demo: false });
  await enterHome(page);
  await expect(page.getByTestId('home-empty')).toBeVisible();

  // 2. `새 기도` 가 닿는 곳이 여정 화면이다 (§1-2 — 옛 `새 기도` 화면이 아니다).
  await page.getByTestId('home-new').click();
  await expect(page.getByTestId('journey-screen')).toBeVisible();
  await expect(page.getByTestId('journey-empty')).toBeVisible();

  // 3. 바람 없이 시작하려 하면 시작되지 않는다 (FR-33).
  await page.getByTestId('journey-start').click();
  await expect(page.getByTestId('journey-missing-title')).toBeVisible();

  // 4. 형식 셋이 모두 눌린다. 고른 것이 격자의 칸 수를 정한다.
  await page.getByTestId('journey-format-novena9').click();
  await expect(page.getByTestId('journey-format-novena9')).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.getByTestId('journey-format-fiftyfour').click();
  await expect(page.getByTestId('journey-format-fiftyfour')).toHaveAttribute(
    'aria-selected',
    'true',
  );

  await page.getByTestId('journey-intent').fill('아버지의 건강');
  await page.getByTestId('journey-start').click();

  // 5. 곧바로 기도다. 첫날이므로 1일째다.
  await expect(page.getByTestId('pray-title')).toContainText('아버지의 건강');
  await expect(page.getByTestId('pray-title')).toContainText('1일째 · 청원');

  // 6. 81단계를 스스로 지나 하루 완주로.
  await runUntilVisible(page, 'day-done-screen');
  await expect(page.getByTestId('day-done-head')).toHaveText('9월 5일 · 첫 번째 날');
  await expect(page.getByTestId('day-done-summary')).toHaveText(
    '54일 중 1일 바쳤습니다 · 남은 53일',
  );

  // 7. 홈으로 돌아오면 줄이 오늘을 말한다.
  await page.getByTestId('day-done-back').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await expect(page.getByTestId('home-card-title-0')).toHaveText('아버지의 건강');
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('1일째 · 청원');
  await expect(page.getByTestId('home-card-status-0')).toHaveText('오늘 바쳤습니다');

  // 8. 아래 탭 바로 여정 화면에 들어간다. 줄은 접혀 있어 격자가 아직 없다.
  await openJourneys(page);
  await expect(page.getByTestId('journey-title-0')).toHaveText('아버지의 건강');
  await expect(page.getByTestId('journey-kicker-0')).toHaveText('54일 기도 · 청원');
  await expect(page.getByTestId('journey-day-0')).toHaveText('1일째 / 54일');
  await expect(page.getByTestId('journey-grid-0')).toHaveCount(0);

  // 9. 줄을 누르면 펴진다 — 격자 쉰네 칸(아홉 열 여섯 줄)과 단추와 상태 한 줄이 나온다.
  await page.getByTestId('journey-row-0').click();
  const grid = page.getByTestId('journey-grid-0');
  await expect(grid).toBeVisible();
  await expect(grid.locator('> div')).toHaveCount(54);
  await expect(page.getByTestId('journey-footer-0')).toContainText('오늘 바침');
  await expect(page.getByTestId('journey-footer-0')).toContainText('완료 예정 10월 28일');

  /*
    10. 격자의 첫 칸만 칠해졌는가.

    칠해진 칸은 바탕이 강조색이고 나머지는 투명하다. 칸의 뜻을 눈이 아니라 **값**으로 재려고
    바탕색이 투명하지 않은 칸의 수를 센다 — 사진은 사람이 보는 것이고, 이 줄은 기계가 보는
    것이다. 아홉 열 여섯 줄이라는 사실도 첫 칸과 열째 칸의 왼쪽 자리가 같은지로 잰다.
  */
  const painted = await grid.locator('> div > div').evaluateAll((nodes) =>
    nodes.filter((node) => {
      const background = getComputedStyle(node).backgroundColor;
      return background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent';
    }).length,
  );
  expect(painted).toBe(1);

  const first = (await grid.locator('> div').nth(0).boundingBox())!;
  const tenth = (await grid.locator('> div').nth(9).boundingBox())!;
  expect(tenth.x).toBeCloseTo(first.x, 0);
  expect(tenth.y).toBeGreaterThan(first.y);

  // 11. 다시 누르면 접힌다.
  await page.getByTestId('journey-row-0').click();
  await expect(page.getByTestId('journey-grid-0')).toHaveCount(0);

  expect(errors).toEqual([]);
});

test('날짜를 쉰네 날째로 돌린 뒤 하루를 바치면 여정 완주 화면에 닿는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);

  // 본보기 여정은 오늘이 23일째다(8월 14일 시작). 시계를 옮기며 시기와 신비를 함께 본다.
  await openApp(page);
  await enterHome(page);
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('23일째 · 청원');

  /*
    28일째에 시기가 청원에서 감사로 바뀐다 (FR-35 — 1~27일이 청원이다). 27일째와 28일째를
    나란히 재서 **경계가 어디인지**를 못 박는다. 한쪽만 보면 "감사로 바뀌긴 했다"까지만
    확인되고 하루 어긋난 경계는 지나간다.
  */
  await reopenApp(page, { at: new Date('2026-09-09T09:00:00') });
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('27일째 · 청원');
  await reopenApp(page, { at: new Date('2026-09-10T09:00:00') });
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('28일째 · 감사');

  /*
    신비는 며칠째인가로 환희·고통·영광을 하루씩 돈다 (FR-43 · `mysteryForFiftyfourDay`).
    28·29·30일째를 이어서 재면 셋이 한 바퀴 도는 것이 보인다 — 규칙이
    `(며칠째 - 1) % 3` 이므로 28일째는 그 셋 중 첫째인 환희다.
  */
  await expect(page.getByTestId('home-today-set')).toHaveText('환희의 신비');
  await reopenApp(page, { at: new Date('2026-09-11T09:00:00') });
  await expect(page.getByTestId('home-today-set')).toHaveText('고통의 신비');
  await reopenApp(page, { at: new Date('2026-09-12T09:00:00') });
  await expect(page.getByTestId('home-today-set')).toHaveText('영광의 신비');

  // 10월 6일이 54일째다.
  await reopenApp(page, { at: new Date('2026-10-06T09:00:00') });
  // 안 켠 날들은 못 바친 날로 남고 오늘이 54일째다 (FR-35).
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('54일째 · 감사');

  await enterPrayerFromHome(page);
  await runUntilVisible(page, 'all-done-screen');

  await expect(page.getByTestId('all-done-screen')).toBeVisible();
  await expect(page.getByTestId('all-done-head')).toHaveText('쉰네 번째 날 · 10월 6일');
  await expect(page.getByTestId('all-done-title')).toContainText('쉰네 날을');
  // 스무 날 바치고 두 날 걸렀던 여정에, 오늘 하루가 더해져 스물한 날이다.
  await expect(page.getByTestId('all-done-note')).toHaveText('성모송 1,113번');
  await expect(page.getByTestId('all-done-summary')).toHaveText('54일 중 21일을 바쳤습니다');

  // 목록으로 돌아오면 마친 여정으로 보인다.
  await page.getByTestId('all-done-home').click();
  await expect(page.getByTestId('home-card-status-0')).toHaveText('54일 중 21일을 바쳤습니다');

  expect(errors).toEqual([]);
});

test('여정 화면에서 여정을 지울 때는 확인을 거친다 (시트 S6)', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);

  /*
    홈의 며칠째를 누르면 **그 여정의 줄이 펴진 채로** 여정 화면이 열린다 (FR-37).
    옛 화면에서는 같은 길이 여정 하나짜리 상세 화면으로 갔는데, 새 시안에는 상세가 없다.
  */
  await page.getByTestId('home-ribbon-0').click();
  await expect(page.getByTestId('journey-screen')).toBeVisible();
  await expect(page.getByTestId('journey-grid-0')).toBeVisible();

  // 지우기는 곧바로 지우지 않고 묻는다.
  await page.getByTestId('journey-remove-0').click();
  await expect(page.getByTestId('sheet-quit')).toContainText('이 기도를 지웁니다.');

  // 아니라고 하면 그대로 남는다 — 묻는 시늉만 한 것이 아니다.
  await page.getByTestId('sheet-cancel').click();
  await expect(page.getByTestId('journey-title-0')).toHaveText('어머니 병환 회복');

  // 그렇다고 하면 지워지고, 다시 열어도 지워져 있다.
  await page.getByTestId('journey-remove-0').click();
  await page.getByTestId('sheet-confirm').click();
  await expect(page.getByTestId('journey-empty')).toBeVisible();
  // **`demo: false` 가 중요하다.** 손잡이 `?demo=1` 을 붙인 채 다시 열면 여정이 하나도
  // 없는 것을 보고 본보기 여정을 다시 세워, 방금 지운 것이 되살아난 것처럼 보인다.
  await reopenApp(page, { path: '/journey', demo: false });
  await expect(page.getByTestId('journey-empty')).toBeVisible();

  expect(errors).toEqual([]);
});

test('오늘 바치다 멈추면 여정 줄의 단추가 이어서 기도하기로 바뀐다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);

  // 아직 오늘을 시작하지 않았으므로 단추는 `이 지향으로 기도하기` 다.
  await openJourneys(page);
  await page.getByTestId('journey-row-0').click();
  await expect(page.getByTestId('journey-pray-0')).toHaveText('이 지향으로 기도하기');

  // 조금 바치다 멈춘다.
  await page.getByTestId('journey-pray-0').click();
  await expect(page.getByTestId('pray-title')).toBeVisible();
  await page.clock.runFor(40000);
  await leavePrayer(page, 'pause');
  await expect(page.getByTestId('home-screen')).toBeVisible();

  // 이제 같은 자리가 `이어서 기도하기` 라고 적힌다.
  await openJourneys(page);
  await page.getByTestId('journey-row-0').click();
  await expect(page.getByTestId('journey-pray-0')).toHaveText('이어서 기도하기');

  expect(errors).toEqual([]);
});
