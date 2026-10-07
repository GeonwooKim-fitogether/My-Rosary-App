/**
 * 소개 시트 (S7) 의 e2e — W4 슬라이스 C.
 *
 * 08 검증에 들어온 사람이 이 앱을 **처음** 열었을 때, 무엇을 하는 앱인지 한 장으로 말한다.
 * 재는 것은 넷이다.
 *
 * 1. 처음 여는 기기에서 **저절로 뜬다.** 아무 단추도 누르지 않은 자리에서 떠야 한다.
 * 2. **건너뛸 수 있다.** 읽지 않고 곧바로 닫아도 되고, 닫으면 앱이 그대로 열린다 —
 *    기도하러 온 사람을 이 글로 막지 않는다.
 * 3. **다시 뜨지 않는다.** 닫은 사실이 기기에 남아, 앱을 다시 열어도 조용하다.
 * 4. **설정에서 다시 열린다.** 한 번 보고 사라지는 설명은 나중에 찾을 수 없으므로,
 *    설정의 `소개` 줄이 언제나 같은 글을 연다.
 *
 * 이 시험만 `openApp(page, { intro: true })` 로 연다. 다른 시험들은 기본값(이미 본 기기)으로
 * 열리며, 그러지 않으면 모든 시험이 이 시트에 막힌다(`e2e/support/harness.ts` 의
 * `markIntroSeen`).
 */
import { expect, test } from './support/harness';
import { collectConsoleErrors, enterHome, openApp, openSettings, reopenApp } from './support/harness';

test.use({ reducedMotion: 'reduce' });

test('처음 여는 사람에게 소개가 한 번 뜨고, 건너뛸 수 있고, 다시 뜨지 않는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page, { intro: true });

  // 1. 아무것도 누르지 않았는데 떠 있다.
  await expect(page.getByTestId('sheet-intro')).toBeVisible();
  await expect(page.getByTestId('sheet-intro')).toContainText('이 앱이 하는 일');
  await expect(page.getByTestId('sheet-intro')).toContainText('54일');
  // 검증 빌드라는 사실과 아직 아닌 것까지 한 장 안에 있다.
  await expect(page.getByTestId('sheet-intro')).toContainText('검증 빌드');
  await expect(page.getByTestId('sheet-intro')).toContainText('아직 아닌 것');

  // 2. 건너뛴다 — 머리의 `닫기` 한 번이면 된다.
  await page.getByTestId('sheet-close').click();
  await expect(page.getByTestId('sheet-intro')).toBeHidden();

  // 앱은 그대로 열려 있다. 기도하러 가는 길이 막히지 않았다.
  await enterHome(page);
  await expect(page.getByTestId('home-screen')).toBeVisible();

  // 3. 앱을 다시 열어도 조용하다.
  await reopenApp(page, { path: '/' });
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await expect(page.getByTestId('sheet-intro')).toBeHidden();

  expect(errors).toEqual([]);
});

test('맨 아래 `시작하기` 로도 닫히고, 설정에서 같은 글을 다시 연다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page, { intro: true });

  // 처음 여는 자리에서만 서는 단추다.
  await expect(page.getByTestId('intro-start')).toBeVisible();
  await page.getByTestId('intro-start').click();
  await expect(page.getByTestId('sheet-intro')).toBeHidden();

  // 설정 탭 → `소개` 줄. 사람이 누르는 길로만 간다.
  await enterHome(page);
  await openSettings(page);
  await page.getByTestId('settings-about').scrollIntoViewIfNeeded();
  await page.getByTestId('settings-about').click();

  // 같은 글이 열린다.
  await expect(page.getByTestId('sheet-about')).toBeVisible();
  await expect(page.getByTestId('sheet-about')).toContainText('이 앱이 하는 일');
  await expect(page.getByTestId('sheet-about')).toContainText('아직 아닌 것');

  // 설정에서 연 쪽에는 `시작하기` 단추가 없다 — 이미 앱을 쓰고 있는 자리이기 때문이다.
  await expect(page.getByTestId('intro-start')).toHaveCount(0);

  expect(errors).toEqual([]);
});
