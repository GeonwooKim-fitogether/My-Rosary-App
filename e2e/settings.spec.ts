/**
 * 설정과 시트 e2e — 고른 것이 화면에 반영되고, 앱을 다시 열어도 남는가.
 *
 * 시트 일곱과 밤 벌은 v5 에 없어 M2 가 파생한 것이라(`decisions.md` Q-14) "만들었다"만으로는
 * 아무것도 증명하지 못한다. 그래서 여기서 **사용자가 하는 그대로** 확인한다 — 홈에서 설정을
 * 열고, 시트를 띄우고, 고르고, 화면이 바뀌는 것을 보고, 다시 열어 그대로인지 본다.
 */
import { expect, test } from '@playwright/test';
import { collectConsoleErrors, enterHome, openApp } from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 화면의 바탕색을 읽는다. 밤 벌로 바뀌었는지 눈이 아니라 값으로 확인하려는 것이다. */
async function background(page: import('@playwright/test').Page, testId: string) {
  return page
    .getByTestId(testId)
    .evaluate((element) => getComputedStyle(element as HTMLElement).backgroundColor);
}

test('설정에서 고른 것이 화면에 반영되고 다시 열어도 남는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);

  // 홈 오른쪽 위의 `설정` 으로 들어간다 (v5 의 배선 그대로).
  await page.getByTestId('home-settings').click();
  await expect(page.getByTestId('settings-screen')).toBeVisible();
  expect(await background(page, 'settings-screen')).toBe('rgb(237, 231, 216)'); // 낮 벌 한지

  // S2 받는 사이 — 시트에서 고르면 줄의 값이 바뀐다 (FR-07).
  await page.getByTestId('settings-pace').click();
  await expect(page.getByTestId('sheet-pace')).toBeVisible();
  await page.getByTestId('sheet-choice-slow').click();
  await expect(page.getByTestId('sheet-pace')).toBeHidden();
  await expect(page.getByTestId('settings-pace-value')).toHaveText('느리게 →');

  // 손 없이 조작은 시트 없이 그 자리에서 켜고 끈다 (FR-38).
  await expect(page.getByTestId('settings-handsfree-value')).toHaveText('켜짐');
  await page.getByTestId('settings-handsfree').click();
  await expect(page.getByTestId('settings-handsfree-value')).toHaveText('꺼짐');
  await expect(page.getByTestId('settings-handsfree-note')).toBeHidden();

  // 낮과 밤 — 밤 벌로 바꾸면 화면 전체가 쪽빛이 된다 (06-design-system §2-2).
  await page.getByTestId('settings-theme').click();
  await expect(page.getByTestId('sheet-theme')).toBeVisible();
  await page.getByTestId('sheet-choice-night').click();
  await expect(page.getByTestId('settings-theme-value')).toHaveText('밤 →');
  expect(await background(page, 'settings-screen')).toBe('rgb(16, 22, 31)'); // 밤 벌 쪽빛

  // 계정 삭제 확인 시트 — 애플 심사가 요구하는 앱 안 삭제 경로다 (FR-45).
  await page.getByTestId('settings-delete-account').click();
  await expect(page.getByTestId('sheet-delete-account')).toBeVisible();
  await expect(page.getByTestId('sheet-delete-account')).toContainText(
    '서버의 모든 기도와 기록이 지워집니다',
  );
  await page.getByTestId('sheet-cancel').click();
  await expect(page.getByTestId('sheet-delete-account')).toBeHidden();

  // S7 소개 — 08 검증 참가자가 이 빌드가 무엇을 묻는지 읽는 자리다.
  await page.getByTestId('settings-about').click();
  await expect(page.getByTestId('sheet-about')).toBeVisible();
  await page.getByTestId('sheet-close').click();

  // 다시 열어도 고른 것이 남아 있다 — 설정도 기기에 저장된다.
  await page.reload();
  await expect(page.getByTestId('settings-screen')).toBeVisible();
  await expect(page.getByTestId('settings-pace-value')).toHaveText('느리게 →');
  await expect(page.getByTestId('settings-theme-value')).toHaveText('밤 →');
  expect(await background(page, 'settings-screen')).toBe('rgb(16, 22, 31)');

  expect(errors).toEqual([]);
});

test('홈에서만 초대 코드 화면으로 들어간다 (Q-13)', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);

  // 로그인 화면에는 그 줄이 없다 — 계정이 필수라 로그인 전 합류가 성립하지 않는다.
  await expect(page.getByText('초대 코드로 들어가기')).toHaveCount(0);

  await enterHome(page);
  await page.getByTestId('home-invite').click();
  await expect(page.getByTestId('invite-screen')).toBeVisible();

  // 여섯 자리를 넣고 눌러 본다. 확인해 줄 서버가 아직 없으므로 못 찾았다고 답한다 (PRD §8).
  await page.getByTestId('invite-input').fill('k7m4ab');
  await page.getByTestId('invite-enter').click();
  await expect(page.getByTestId('invite-not-found')).toHaveText(
    '이 코드의 기도를 찾지 못했습니다.',
  );

  await page.getByTestId('invite-close').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();

  expect(errors).toEqual([]);
});
