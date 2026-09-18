/**
 * 아래 탭 바 e2e — 네 화면을 오갈 수 있는가 (W2 지시서 §5 의 통과 조건 2).
 *
 * 탭 바는 **만들었다는 사실만으로는 아무것도 증명하지 못한다.** 탭이 화면에 보이는 것과
 * 그것을 눌러 실제로 그 화면에 닿는 것은 다른 문제이고, 특히 이 저장소는 화면이 쌓이는
 * 구조(스택)라 "오갈 수 있는가"에 숨은 함정이 둘 있다.
 *
 * 1. **탭을 누를 때마다 화면이 쌓이면** 홈·설정·홈·설정… 이 끝없이 포개진다. 눈으로는
 *    보이지 않는다 — 맨 위 한 장만 보이기 때문이다. 그래서 오간 뒤 홈이 **한 장뿐인지**
 *    세어 확인한다.
 * 2. **갤러리 탭은 아직 만들지 않은 화면으로 간다.** 눌러도 아무 일이 없으면 고장으로
 *    읽히므로, "곧 만들어집니다" 한 줄이 실제로 보이는지 본다.
 */
import { expect, test } from '@playwright/test';
import { collectConsoleErrors, enterHome, openApp, tapTab } from './support/harness';

test.use({ reducedMotion: 'reduce' });

test('아래 탭 바로 홈 · 갤러리 · 여정 · 설정을 오간다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);

  // 홈에 서 있는 동안 탭 바가 보인다.
  await expect(page.getByTestId('tab-bar')).toBeVisible();

  // 갤러리 — W3 의 화면이라 아직 한 줄뿐이지만, 눌러서 닿는다.
  await tapTab(page, 'gallery');
  await expect(page.getByTestId('gallery-screen')).toBeVisible();
  await expect(page.getByTestId('gallery-soon')).toHaveText('곧 만들어집니다.');

  // 여정 — W3 슬라이스 A 가 새 시안의 어법으로 다시 세운 여정 목록 화면이다.
  await tapTab(page, 'journeys');
  await expect(page.getByTestId('journey-screen')).toBeVisible();
  await expect(page.getByTestId('journey-title-0')).toHaveText('어머니 병환 회복');

  // 설정 — M2 에서 홈 머리의 `설정` 글자가 하던 일을 탭이 이어받았다.
  await tapTab(page, 'settings');
  await expect(page.getByTestId('settings-screen')).toBeVisible();

  // 홈으로 돌아온다.
  await tapTab(page, 'home');
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await expect(page.getByTestId('home-today-set')).toBeVisible();

  expect(errors).toEqual([]);
});

test('탭을 여러 번 오가도 같은 화면이 포개지지 않는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);

  for (let round = 0; round < 3; round++) {
    await tapTab(page, 'settings');
    await expect(page.getByTestId('settings-screen')).toBeVisible();
    await tapTab(page, 'home');
    await expect(page.getByTestId('home-screen')).toBeVisible();
  }

  /*
    세 번을 오갔는데 홈은 한 장뿐이다. 쌓였다면 여기서 둘 이상이 세어진다 — 실제로
    `router.navigate` 를 쓰던 첫 판이 여기서 둘로 세어져 걸렸다(2026-09-18).

    설정이 **0 장**인 것도 함께 못 박는다. 홈으로 돌아올 때 설정 한 장을 걷어 냈다는 뜻이고,
    걷어 내지 않고 뒤에 남겨 두면 그것이 곧 쌓이는 길이기 때문이다.
  */
  await expect(page.getByTestId('home-screen')).toHaveCount(1);
  await expect(page.getByTestId('settings-screen')).toHaveCount(0);

  expect(errors).toEqual([]);
});
