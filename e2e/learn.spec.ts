/**
 * 배우기 두 화면 e2e — 묵주기도 입문과 배경 지식에 **클릭만으로 닿는가**, 그리고 그 안에
 * 실제로 글이 서 있는가.
 *
 * 이 시험이 무엇을 막는지 정확히 적어 둔다. 화면 파일을 만들고 글을 `spec/learn.json` 에
 * 적어 두면 "만들었다" 고 말하고 싶어지지만, 그 화면을 부르는 곳이 없으면 사람은 그 글에
 * 평생 닿지 못한다. 이 저장소가 겪은 사고가 정확히 그 모양이었고(`communication.md` 7-2),
 * 게다가 이 앱의 시안 자신이 같은 구멍을 갖고 있었다 — 신비 해설 화면이 그려져만 있고
 * 어느 화면에서도 닿지 않았다.
 *
 * 그래서 이 시험은 **주소를 직접 치지 않는다.** 언제나 홈에서 출발해 사람이 누를 수 있는
 * 것만 눌러 들어간다. 두 길을 다 밟는 까닭도 같다 — 두 길 가운데 하나만 살아 있어도
 * 나머지 하나가 죽은 것을 아무도 모르기 때문이다.
 */
import { expect, test } from './support/harness';
import { collectConsoleErrors, enterHome, openApp, openSettings } from './support/harness';

test.use({ reducedMotion: 'reduce' });

test('오늘의 신비에서 눌러 묵주기도 입문과 배경 지식으로 들어간다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);

  // ── 홈 → 오늘의 신비 ──────────────────────────────────────────────────────
  await page.getByTestId('home-today-link').click();
  await expect(page.getByTestId('mystery-screen')).toBeVisible();

  // ── 오늘의 신비 → 묵주기도 입문 ───────────────────────────────────────────
  await page.getByTestId('mystery-learn-link').click();
  await expect(page.getByTestId('learn-screen')).toBeVisible();
  await expect(page.getByTestId('learn-screen-label')).toHaveText('묵주기도 입문');
  await expect(page.getByTestId('learn-screen-title')).toHaveText('묵주기도, 처음이신가요');

  // 일곱 절이 다 선다. 수를 세는 까닭은, 글 파일에서 한 절이 빠져도 화면은 오류 없이
  // 조용히 그리기 때문이다.
  for (let n = 1; n <= 7; n++) {
    await expect(page.getByTestId(`learn-screen-section-${n}`)).toBeAttached();
  }
  // 번호 차례가 실제로 아홉 줄인지 — 한 번 바치는 순서가 이 글의 뼈대다.
  await expect(page.getByTestId('learn-screen-section-3')).toContainText('성호경');
  await expect(page.getByTestId('learn-screen-section-3')).toContainText('성모찬송');

  await page.getByTestId('learn-screen-back').click();
  await expect(page.getByTestId('mystery-screen')).toBeVisible();

  // ── 오늘의 신비 → 배경 지식 ───────────────────────────────────────────────
  await page.getByTestId('mystery-background-link').click();
  await expect(page.getByTestId('background-screen')).toBeVisible();
  await expect(page.getByTestId('background-screen-label')).toHaveText('배경 지식');
  await expect(page.getByTestId('background-screen-title')).toHaveText('묵주기도의 배경');
  for (let n = 1; n <= 8; n++) {
    await expect(page.getByTestId(`background-screen-section-${n}`)).toBeAttached();
  }
  // 쉰네 날이 무엇인지가 이 글의 한가운데다 — 앱의 기둥을 설명하는 자리이기 때문이다.
  await expect(page.getByTestId('background-screen-section-5')).toContainText('스물일곱');

  // ── 뒤로 두 번이면 홈이다. ────────────────────────────────────────────────
  await page.getByTestId('background-screen-back').click();
  await expect(page.getByTestId('mystery-screen')).toBeVisible();
  await page.getByTestId('mystery-back').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();

  expect(errors).toEqual([]);
});

test('설정에서도 같은 두 화면으로 들어간다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await openSettings(page);

  await page.getByTestId('settings-learn-basics').click();
  await expect(page.getByTestId('learn-screen-title')).toHaveText('묵주기도, 처음이신가요');
  await page.getByTestId('learn-screen-back').click();
  await expect(page.getByTestId('settings-screen')).toBeVisible();

  await page.getByTestId('settings-learn-background').click();
  await expect(page.getByTestId('background-screen-title')).toHaveText('묵주기도의 배경');
  await page.getByTestId('background-screen-back').click();
  await expect(page.getByTestId('settings-screen')).toBeVisible();

  expect(errors).toEqual([]);
});
