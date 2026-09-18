/**
 * 지역·언어 화면 e2e — W2 통과 조건 3 과 4.
 *
 * 재는 것은 셋이다.
 *
 * 1. **지역을 바꾸면 색 벌과 성화 묶음이 함께 바뀐다.** 색은 화면의 바탕색으로, 성화는
 *    홈에 뜬 그림의 파일 이름으로 잰다 — 빌드가 파일 이름을 주소 앞부분에 그대로 남기므로
 *    (`/assets/assets/art/world/15.<해시>.jpg`) 어느 묶음에서 왔는지 값으로 확인된다.
 * 2. **지역을 바꿔도 언어는 그대로다.** 시안의 결함 9 번을 이 시험이 붙든다 — 시안은 고른
 *    지역이 쓰지 않는 언어를 보고 있었으면 언어까지 바꿔 버린다(`app/region.tsx` 머리).
 * 3. **언어를 바꾸면 화면 문구가 바뀌고, 기도문은 한국어 그대로다** (결정 12-2 카드 C ·
 *    `src/i18n/index.ts` 의 `prayerLanguage`). 확인되지 않은 기도문을 사람이 바치게 되는
 *    일을 막는 장치이므로, 화면 문구만 바뀌는 것까지가 한 벌이다.
 */
import { expect, test } from '@playwright/test';
import { collectConsoleErrors, enterHome, openApp, openHomeTab, openSettings } from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 화면의 바탕색을 읽는다. 지역의 종이색으로 섰는지 눈이 아니라 값으로 확인하려는 것이다. */
async function background(page: import('@playwright/test').Page, testId: string) {
  return page
    .getByTestId(testId)
    .evaluate((element) => getComputedStyle(element as HTMLElement).backgroundColor);
}

/**
 * 홈에 떠 있는 성화의 파일 이름을 읽는다 (`15.<해시>.jpg` → `15`).
 *
 * 첫 번째 그림을 고르는 이유는 홈의 맨 위 큰 성화가 그 화면의 유일한 그림이기 때문이다.
 */
async function homeArtName(page: import('@playwright/test').Page): Promise<string> {
  const source = await page.locator('[data-testid="home-screen"] img').first().getAttribute('src');
  const file = decodeURIComponent(String(source)).split('/').pop() ?? '';
  return file.replace(/\.[0-9a-f]{8,}\.(jpg|png|jpeg)$/i, '');
}

/** 다섯 지역이 쓰는 그림들 — `src/art/worldPlates.ts` 의 `REGION_PLATES` 와 같아야 한다. */
const REGION_FILES: Record<string, string[]> = {
  korea: ['01-mary-single', '12-mary-child-neutral', '10-blue-mary', '02-mary-child', '11-prayer-rosary', '08-mary-profile', '07-relief-holy-family'],
  southamerica: ['15', '14', '17', '02-mary-child', '13', '05-jesus-sheep'],
};

test('지역을 바꾸면 색 벌과 성화 묶음이 바뀌고, 언어는 그대로다 (시안 결함 9)', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  // 씨앗을 물려 성화 뽑기를 붙들어 둔다 — 그러지 않으면 같은 지역 안에서도 그림이 달라져
  // "지역이 바뀌어서 그림이 바뀐 것"인지 알 수 없다 (`decisions.md` Q-57).
  await openApp(page, { art: 11 });
  await enterHome(page);

  // 처음은 한국 — 종이색도 성화도 한국의 것이다.
  expect(await background(page, 'home-screen')).toBe('rgb(243, 237, 226)');
  expect(REGION_FILES.korea).toContain(await homeArtName(page));

  // 설정 → 지역·언어로 들어간다. 주소를 직접 열지 않고 사람이 누르는 길로만 간다.
  await openSettings(page);
  await page.getByTestId('settings-region').click();
  await expect(page.getByTestId('region-screen')).toBeVisible();
  await expect(page.getByTestId('language-ko-tag')).toHaveText('지금');

  // 남미를 고른다.
  await page.getByTestId('region-southamerica').click();

  // 1. 색 벌이 바뀐다 — 남미의 종이색 `#f7efe2`.
  await expect
    .poll(() => background(page, 'region-screen'))
    .toBe('rgb(247, 239, 226)');

  // 2. **언어는 그대로다.** 남미의 기본 언어는 스페인어인데(시안은 여기서 언어를 바꾼다)
  //    이 앱은 사람이 직접 고르기 전까지 한국어를 지킨다.
  await expect(page.getByTestId('language-ko-tag')).toHaveText('지금');
  await expect(page.getByTestId('region-label')).toHaveText('지역 및 언어');

  // 3. 성화 묶음이 바뀐다 — 홈으로 돌아가 뜬 그림이 남미의 것인지 본다.
  await page.getByTestId('region-back').click();
  await expect(page.getByTestId('settings-region-value')).toHaveText('남미 · 한국어');
  await openHomeTab(page);
  expect(await background(page, 'home-screen')).toBe('rgb(247, 239, 226)');
  const after = await homeArtName(page);
  expect(REGION_FILES.southamerica).toContain(after);

  expect(errors).toEqual([]);
});

test('언어를 바꾸면 화면 문구가 바뀌고, 기도문은 한국어 그대로다 (카드 C)', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);

  await openSettings(page);
  await page.getByTestId('settings-region').click();
  await expect(page.getByTestId('region-screen')).toBeVisible();

  // 켜지지 않은 다섯은 `준비 중` 으로 보이되 눌리지 않는다 (카드 C).
  await expect(page.getByTestId('language-it-tag')).toHaveText('준비 중');
  await expect(page.getByTestId('language-it')).toBeDisabled();
  await page.getByTestId('language-it').click({ force: true });
  await expect(page.getByTestId('language-ko-tag')).toHaveText('지금');

  // 켜진 둘 중 영어를 고른다.
  await page.getByTestId('language-en').click();
  await expect(page.getByTestId('language-en-tag')).toHaveText('지금');

  // 1. 화면 문구가 영어로 바뀐다 — 머리 라벨과 큰 제목이 함께 옮겨 간다.
  await expect(page.getByTestId('region-label')).toHaveText('Region & Language');
  await page.getByTestId('region-back').click();
  await expect(page.getByTestId('settings-region-value')).toHaveText('Korea · English');

  // 아래 탭 바의 글자도 함께 바뀐다 — 문구 한 벌이 화면 전체에 걸린다는 증거다.
  await expect(page.locator('[data-testid="tab-home"]:visible')).toContainText('Home');

  // 2. **기도문은 한국어 그대로다.** 다른 언어의 기도문이 공식 문구인지 아직 확인되지
  //    않았으므로, 화면 문구만 옮겨 가고 바치는 말은 한국어 정본을 쓴다.
  await openHomeTab(page);
  await page.getByTestId('home-card-0').click();
  // 구간 이름과 기도문이 모두 한국어다. 이 둘은 `spec/` 의 정본에서 오고 화면 문구 표와
  // 갈라져 있으므로, 화면이 영어로 서 있는 동안에도 바치는 말은 한국어로 남는다.
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 성호경');
  await expect(page.getByTestId('pray-a')).toContainText('성부와');

  expect(errors).toEqual([]);
});
