/**
 * 언어를 둘로 좁힌 일의 e2e — W4 슬라이스 B (결정 12-2 카드 C).
 *
 * 이 시험이 지키는 것은 화면의 모양이 아니라 **사람이 바치는 말**이다. 시안이 들여온 언어
 * 일곱의 기도문은 공식 판본과 대조되지 않았고(`docs/plan/roadmap-world.md` §7 · `decisions.md`
 * D-4), 확인되지 않은 기도문이 화면에 서면 사람이 그것을 그대로 바친다. 그래서 확인이 끝난
 * 언어만 켜고, 꺼진 언어가 **어떤 길로도** 앱의 언어가 되지 않는 것을 여기서 붙든다.
 *
 * 재는 것은 셋이다.
 *
 * 1. 꺼진 다섯은 지역·언어 화면에서 고를 수 없다. 목록에서 지우지 않고 `준비 중` 으로
 *    보이되 눌리지 않는다 — 지우면 "이 앱은 일곱 언어를 목표로 한다"는 사실 자체가 화면에서
 *    사라지기 때문이다(`app/region.tsx` 머리글).
 * 2. **꺼진 언어가 기기에 저장돼 있어도 앱이 정상으로 열린다.** 언어 일곱이 모두 열려 있던
 *    판(W0~W3)으로 앱을 쓰던 기기가 실제로 그런 상태이며, 그 기기가 빈 화면이나 영어 열쇠
 *    문자열을 보이면 안 된다.
 * 3. 문서의 언어(`<html lang>`)가 앱의 언어를 따라온다. 화면 낭독기가 한국어 문장을 영어
 *    발음으로 읽으려 하는 것을 막는 자리다(`src/i18n/documentLanguage.ts`).
 */
import { expect, test } from '@playwright/test';
import {
  collectConsoleErrors,
  enterHome,
  openApp,
  openSettings,
  seedStoredSettings,
} from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 꺼져 있는 다섯. 이 목록이 늘거나 줄면 `src/i18n/index.ts` 의 `ENABLED_LANGUAGES` 가 바뀐 것이다. */
const OFF = ['it', 'fr', 'es', 'pt', 'tl'] as const;

/** 지금 문서가 스스로 말하는 언어. */
function documentLanguage(page: import('@playwright/test').Page): Promise<string> {
  return page.evaluate(() => document.documentElement.lang);
}

test('꺼진 다섯은 목록에 남아 있되 고를 수 없다 (카드 C)', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await openSettings(page);
  await page.getByTestId('settings-region').click();
  await expect(page.getByTestId('region-screen')).toBeVisible();

  // 켜진 둘은 눌린다.
  await expect(page.getByTestId('language-ko')).toBeEnabled();
  await expect(page.getByTestId('language-en')).toBeEnabled();

  for (const language of OFF) {
    // 줄은 그대로 있다 — 지우지 않았다.
    await expect(page.getByTestId(`language-${language}`)).toBeVisible();
    await expect(page.getByTestId(`language-${language}-tag`)).toHaveText('준비 중');
    await expect(page.getByTestId(`language-${language}`)).toBeDisabled();

    // 눌러도 언어가 바뀌지 않는다. 손가락이 실수로 닿는 일까지 재려고 힘으로 누른다.
    await page.getByTestId(`language-${language}`).click({ force: true });
    await expect(page.getByTestId('language-ko-tag')).toHaveText('지금');
  }

  expect(errors).toEqual([]);
});

test('꺼진 언어가 저장돼 있던 기기도 정상으로 열린다', async ({ page }) => {
  const errors = collectConsoleErrors(page);

  /*
    가장 나쁜 조합을 심는다 — 남미에 이탈리아어다.

    남미를 고른 이유가 있다. 남미의 기본 언어는 스페인어인데 스페인어도 꺼져 있어서,
    "꺼진 언어면 그 지역의 기본 언어로" 라고만 적으면 **또 다른 꺼진 언어**로 앱이 선다.
    그 자리를 `enabledLanguageFor`(`src/i18n/index.ts`)가 막는다.
  */
  await seedStoredSettings(page, { region: 'southamerica', language: 'it' });
  await openApp(page);

  // 1. 첫 화면이 그대로 뜬다. 빈 화면도 멈춤도 없다.
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await enterHome(page);
  await expect(page.getByTestId('home-screen')).toBeVisible();

  // 2. 화면 문구가 **사람의 말**이다 — 열쇠 문자열(`regionLang` 같은 것)이 새어 나오지 않는다.
  await expect(page.locator('[data-testid="tab-home"]:visible')).toContainText('홈');

  // 3. 지역은 저장된 그대로 남미이고, 언어만 켜진 것으로 되돌아왔다.
  await openSettings(page);
  await expect(page.getByTestId('settings-region-value')).toHaveText('남미 · 한국어');

  // 4. 지역·언어 화면에서 지금 언어가 한국어로 서 있고, 이탈리아어는 잠겨 있다.
  await page.getByTestId('settings-region').click();
  await expect(page.getByTestId('language-ko-tag')).toHaveText('지금');
  await expect(page.getByTestId('language-it-tag')).toHaveText('준비 중');

  expect(errors).toEqual([]);
});

test('문서의 언어가 앱의 언어를 따라온다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);

  // 앱이 켜지는 것만으로 문서가 한국어가 된다 — 미리 찍어 둔 껍데기의 기본값은 `en` 이다.
  await expect.poll(() => documentLanguage(page)).toBe('ko');

  await enterHome(page);
  await openSettings(page);
  await page.getByTestId('settings-region').click();
  await page.getByTestId('language-en').click();
  // 표시도 함께 영어가 된다 — 이 줄이 W4 슬라이스 E 뒤로 `지금` 이 아니라 `Now` 인 까닭이다.
  await expect(page.getByTestId('language-en-tag')).toHaveText('Now');

  // 언어를 바꾸면 문서도 따라 바뀐다.
  await expect.poll(() => documentLanguage(page)).toBe('en');

  expect(errors).toEqual([]);
});
