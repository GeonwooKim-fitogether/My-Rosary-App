/**
 * 설정과 시트 e2e — 고른 것이 화면에 반영되고, 앱을 다시 열어도 남는가.
 *
 * 시트 일곱과 설정 줄들은 시안에 없거나 시안과 다른 것들이라(`decisions.md` Q-14 ·
 * 결정 12-2 카드 E) "만들었다"만으로는 아무것도 증명하지 못한다. 그래서 여기서
 * **사용자가 하는 그대로** 확인한다 — 홈에서 설정을 열고, 시트를 띄우고, 고르고,
 * 화면이 바뀌는 것을 보고, 다시 열어 그대로인지 본다.
 *
 * ── 이 파일이 2026-09-18 (W2 슬라이스 C) 에 어떻게 달라졌나 ────────────────────
 *
 * 재던 것 둘이 **화면에서 사라졌다.** 밤 벌(쪽빛)은 결정 12-2 의 카드 F 가 접었고,
 * 계정 삭제는 카드 A 가 계정을 V1.5 로 미루면서 함께 내려갔다. 결정이 없앤 것을 계속
 * 재는 시험은 결정을 되돌리라는 요구가 되므로, 두 자리 대신 **그 자리에 새로 선 것**을
 * 잰다 — 지역의 종이색, 지역·언어 화면으로 가는 줄, 진동과 움직임 줄이기 토글, 글자 크기.
 */
import { expect, test } from '@playwright/test';
import { collectConsoleErrors, enterHome, openApp, openSettings } from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 화면의 바탕색을 읽는다. 어느 벌로 서 있는지 눈이 아니라 값으로 확인하려는 것이다. */
async function background(page: import('@playwright/test').Page, testId: string) {
  return page
    .getByTestId(testId)
    .evaluate((element) => getComputedStyle(element as HTMLElement).backgroundColor);
}

test('설정에서 고른 것이 화면에 반영되고 다시 열어도 남는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);

  // 아래 탭 바의 `설정` 탭으로 들어간다 (W2 에서 홈 머리의 `설정` 글자가 탭으로 옮겨 갔다).
  await openSettings(page);
  await expect(page.getByTestId('settings-screen')).toBeVisible();
  // 한국 지역의 종이색 `#f3ede2`. 이 화면이 새 시안의 색 벌로 섰다는 증거다.
  expect(await background(page, 'settings-screen')).toBe('rgb(243, 237, 226)');

  // 맨 위 줄은 지역·언어 화면으로 가는 길이고, 지금 고른 둘을 함께 말한다.
  await expect(page.getByTestId('settings-region-value')).toHaveText('한국 · 한국어');

  // S2 받는 사이 — 시트에서 고르면 줄의 값이 바뀐다 (FR-07).
  await page.getByTestId('settings-pace').click();
  await expect(page.getByTestId('sheet-pace')).toBeVisible();
  await page.getByTestId('sheet-choice-slow').click();
  await expect(page.getByTestId('sheet-pace')).toBeHidden();
  await expect(page.getByTestId('settings-pace-value')).toHaveText('느리게');

  // 손 없이 조작은 시트 없이 그 자리에서 켜고 끈다 (FR-38).
  await expect(page.getByTestId('settings-handsfree')).toHaveAttribute('aria-checked', 'true');
  await page.getByTestId('settings-handsfree').click();
  await expect(page.getByTestId('settings-handsfree')).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByTestId('settings-handsfree-note')).toBeHidden();

  // 진동과 움직임 줄이기 — 시안의 토글 둘이 그대로 남은 자리다 (카드 E).
  await expect(page.getByTestId('settings-haptic')).toHaveAttribute('aria-checked', 'true');
  await page.getByTestId('settings-haptic').click();
  await expect(page.getByTestId('settings-haptic')).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByTestId('settings-reduce-motion')).toHaveAttribute('aria-checked', 'false');
  await page.getByTestId('settings-reduce-motion').click();
  await expect(page.getByTestId('settings-reduce-motion')).toHaveAttribute('aria-checked', 'true');

  // 글자 크기 넉 칸 — 기도 화면의 `Aa` 단추와 같은 값을 여기서도 고친다 (FR-28).
  await page.getByTestId('settings-font-3').click();
  await expect(page.getByTestId('settings-font-3')).toHaveAttribute('aria-selected', 'true');

  // S7 소개 — 08 검증 참가자가 이 빌드가 무엇을 묻는지 읽는 자리다.
  await page.getByTestId('settings-about').click();
  await expect(page.getByTestId('sheet-about')).toBeVisible();
  await expect(page.getByTestId('sheet-about')).toContainText('이 앱이 지금 묻는 것');
  await page.getByTestId('sheet-close').click();
  await expect(page.getByTestId('sheet-about')).toBeHidden();

  // 다시 열어도 고른 것이 남아 있다 — 설정도 기기에 저장된다.
  await page.reload();
  await expect(page.getByTestId('settings-screen')).toBeVisible();
  await expect(page.getByTestId('settings-pace-value')).toHaveText('느리게');
  await expect(page.getByTestId('settings-haptic')).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByTestId('settings-reduce-motion')).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('settings-font-3')).toHaveAttribute('aria-selected', 'true');

  expect(errors).toEqual([]);
});

/**
 * **V1 에서는 정상 경로로 초대 코드 화면에 닿을 수 없다** (`decisions.md` Q-59 ·
 * 결정 12-2 카드 A · 앞선 판정은 Q-13).
 *
 * 이 시험은 원래 "홈에서만 초대 코드 화면으로 들어간다"를 재던 것이다. 결정 12-2 의 카드 A 가
 * 계정·조 기도·초대 코드를 V1.5 로 미루면서, 그 코드를 확인해 줄 서버가 V1 에 없어졌다 —
 * 남겨 두면 언제 눌러도 "찾지 못했습니다"만 답하는 줄이 첫 화면에 서 있게 된다. 같은 카드가
 * 처방까지 적어 두었다: **"로그인 화면과 초대 코드 화면은 지우지 않고 진입점만 끊어 두었다가
 * 되살릴 때 잇는다."**
 *
 * 그래서 이 시험의 뜻을 뒤집었다. 그전에는 "그 줄이 홈에만 있다"를 지켰고, 지금은 **"그 줄이
 * 어디에도 없다"** 를 지킨다. 지우지 않고 뜻을 바꾼 까닭이 있다 — 되살릴 때 이 시험이 먼저
 * 빨간불을 켜서 "여기 잇는 것을 잊지 말라"고 알려 주기 때문이다. 화면 자체(`app/invite.tsx`)는
 * 그대로 있으므로 마지막에 그것도 함께 확인한다.
 */
test('V1 에서는 정상 경로로 초대 코드 화면에 닿을 수 없다 (Q-59 · 결정 12-2 카드 A)', async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);

  // 로그인 화면에 그 줄이 없다 — 앞선 판정(Q-13)이 이미 끊어 둔 자리다.
  await expect(page.getByText('초대 코드로 들어가기')).toHaveCount(0);

  // 홈에도 없다 — 슬라이스 C 가 끊은 자리다.
  await enterHome(page);
  await expect(page.getByTestId('home-invite')).toHaveCount(0);
  await expect(page.getByText('초대 코드로 들어가기')).toHaveCount(0);

  // 설정에도 없다 — 옮겨 간 것이 아니라 끊긴 것임을 못 박는다.
  await openSettings(page);
  await expect(page.getByText('초대 코드로 들어가기')).toHaveCount(0);

  /*
    **화면 자체는 살아 있다.** 카드 A 가 "지우지 않고 진입점만 끊는다"고 적었으므로, 그
    화면이 아직 서는지까지 확인해야 처방이 지켜졌다고 말할 수 있다. 여기서만은 주소를
    직접 여는데, 이것은 사용자의 길이 아니라 **사용자의 길이 없다는 것을 보인 뒤에 남은
    것을 세어 보는 일**이다 — 되살릴 때 무엇을 다시 이으면 되는지가 이 두 줄에 적혀 있다.
  */
  await page.goto('/invite');
  await expect(page.getByTestId('invite-screen')).toBeVisible();

  expect(errors).toEqual([]);
});
