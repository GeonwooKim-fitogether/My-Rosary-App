/**
 * 홈 카드를 길게 눌러 여정을 지우는 e2e (FR-05 · 시트 S6).
 *
 * 요구사항은 여정을 지우는 길을 둘로 적었다 — 여정 상세의 단추와 **홈 카드 길게 누르기**.
 * 뒤의 길이 없었다. 여기서 확인하는 것은 넷이다. 첫째, 길게 누르면 확인 시트가 뜨고 기도로
 * 들어가지 않는가. 둘째, 그 시트가 여정 상세의 것과 같은 문구인가. 셋째, `두기` 를 누르면
 * 아무것도 지워지지 않는가. 넷째, `지우기` 를 누르면 지워지고 다시 열어도 지워져 있는가.
 * 그리고 짧게 누르기는 그대로 기도로 들어가야 한다.
 *
 * 길게 누르기는 마우스를 누른 채 기다리는 것으로 만든다. react-native-web 의 `Pressable` 은
 * 450ms 를 넘겨 누르면 길게 누른 것으로 보고 `onPress` 를 부르지 않는다.
 */
import { expect, test } from '@playwright/test';
import { collectConsoleErrors, enterHome, openApp } from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 카드를 길게 누른다 — 누른 채로 600ms. */
async function longPressCard(page: import('@playwright/test').Page, index = 0) {
  await page.getByTestId(`home-card-${index}`).click({ delay: 600 });
}

test('홈 카드를 길게 누르면 확인 시트가 뜨고, 지우기를 누르면 여정이 사라진다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await expect(page.getByTestId('home-card-title-0')).toBeVisible();

  // 1. 길게 누르면 시트 — 기도로 들어가지 않는다.
  await longPressCard(page);
  await expect(page.getByTestId('sheet-quit')).toBeVisible();
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await expect(page.getByTestId('pray-title')).toHaveCount(0);

  // 2. 여정 상세의 시트와 같은 문구다 (S6).
  await expect(page.getByTestId('sheet-quit')).toContainText('이 기도를 지웁니다. 기록도 함께 지워집니다.');
  await expect(page.getByTestId('sheet-confirm')).toHaveText('지우기');
  await expect(page.getByTestId('sheet-cancel')).toHaveText('두기');

  // 3. 두기 — 카드가 그대로 있다.
  await page.getByTestId('sheet-cancel').click();
  await expect(page.getByTestId('sheet-quit')).toBeHidden();
  await expect(page.getByTestId('home-card-title-0')).toBeVisible();

  // 4. 지우기 — 빈 홈이 되고, 다시 열어도 비어 있다.
  await longPressCard(page);
  await page.getByTestId('sheet-confirm').click();
  await expect(page.getByTestId('home-empty')).toBeVisible();
  // 다시 열어도 지워져 있다 — 홈 주소에서 새로 고치므로 첫 화면을 거치지 않고 홈이 바로 뜬다.
  await page.reload();
  await expect(page.getByTestId('home-empty')).toBeVisible();

  expect(errors).toEqual([]);
});

test('짧게 누르기는 그대로 기도로 들어간다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await page.getByTestId('home-card-0').click();
  await expect(page.getByTestId('pray-title')).toBeVisible();
  await expect(page.getByTestId('sheet-quit')).toHaveCount(0);
  expect(errors).toEqual([]);
});
