/**
 * 영어로 바꾼 화면에 한글이 남아 있지 않은가 — W4 슬라이스 E.
 *
 * ── 왜 이 시험이 있나 ────────────────────────────────────────────────────────
 *
 * 슬라이스 B 가 영어 화면을 처음 찍었을 때, 설정 화면의 **절반이 한국어**였다
 * (`docs/plan/w4-screens/en-settings.png` 의 그때 모습 — `낭송 방식` · `받는 사이` ·
 * `묵주` · `손 없이 조작` · `진동` · `기록 내보내기` · `기록 들여오기`). 문구가 언어 표를
 * 거치지 않고 화면 파일에 그대로 박혀 있었기 때문이다.
 *
 * 그 결함은 **눈으로만 잡혔다.** 그런데 사람의 눈은 다음번에 놓친다 — 화면 하나에 줄이
 * 스물이면 한 줄이 한국어로 남아도 알아보기 어렵고, 새 화면이 늘 때마다 같은 일이
 * 되풀이된다. 그래서 기계가 재게 한다. **화면의 글을 통째로 읽어 한글 음절이 하나라도
 * 있으면 걸린다.**
 *
 * ── 재지 않는 것 두 가지 ─────────────────────────────────────────────────────
 *
 * 1. **기도문과 신비의 글.** 바치는 말은 언어 표의 일이 아니다. 시안이 들여온 기도문 일곱
 *    벌은 공식 판본과 대조되지 않았으므로(`src/i18n/index.ts` 의 `PRAYER_VERIFIED`), 화면
 *    문구가 영어가 되어도 바치는 말은 한국어 정본을 쓴다(`prayerLanguage` · 결정 12-2 카드
 *    C). 그래서 **기도 화면은 이 시험이 보지 않는다.**
 * 2. **사람이 적은 글.** 여정의 바람(`어머니 병환 회복` 같은 것)은 사용자가 쓴 말이라
 *    번역 대상이 아니다. 그래서 여정 줄의 제목은 아래에서 덜어 내고 잰다.
 *
 * ── 어떻게 들어가나 ──────────────────────────────────────────────────────────
 *
 * 사람이 하는 그대로 — 아래 탭 바의 설정으로 들어가 지역·언어에서 English 를 고르고,
 * 탭 바로 화면들을 돈다. 주소를 직접 열지 않는다.
 */
import type { Page } from '@playwright/test';
import { expect, test } from './support/harness';
import {
  collectConsoleErrors,
  enterHome,
  openApp,
  openJourneys,
  openSettings,
  tapTab,
} from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 한글 음절 한 글자라도 있으면 참. */
const HANGUL = /[가-힣]/;

/**
 * 지금 화면에 보이는 글을 모아 온다.
 *
 * `innerText` 를 쓰는 까닭은 **보이지 않는 것을 세지 않기** 위해서다. 이 앱은 탭으로 오가는
 * 화면들을 모두 문서 안에 두고 보이는 것만 드러내므로, `textContent` 로 읽으면 지금 보고
 * 있지 않은 화면의 글까지 딸려 온다.
 *
 * @param exclude 덜어 낼 이름표들. 사람이 적은 글(여정의 바람)이 여기 해당한다.
 */
async function visibleText(page: Page, exclude: string[] = []): Promise<string> {
  return page.evaluate((drop) => {
    const roots = [...document.querySelectorAll<HTMLElement>('[data-testid$="-screen"]')].filter(
      (element) => element.offsetParent !== null || element.getClientRects().length > 0,
    );
    return roots
      .map((root) => {
        const clone = root.cloneNode(true) as HTMLElement;
        for (const selector of drop) {
          for (const node of clone.querySelectorAll(selector)) node.remove();
        }
        return clone.innerText ?? '';
      })
      .join('\n');
  }, exclude);
}

/**
 * 그 화면의 글에 한글이 없음을 재되, **정말 글을 읽었는지도 함께 잰다.**
 *
 * 이 한 줄이 없으면 시험이 조용히 속는다 — 화면을 잘못 집어 빈 글을 읽어도 "한글이 없다"는
 * 참이 되어 통과하기 때문이다. 그래서 그 화면에 반드시 있어야 할 영어 한 마디를 함께 대조해,
 * **읽은 것이 실제로 그 화면이었다**는 사실을 시험 자신이 증명하게 한다.
 */
async function expectEnglishOnly(
  page: Page,
  mustContain: string,
  exclude: string[] = [],
): Promise<void> {
  const text = await visibleText(page, exclude);
  expect(text).toContain(mustContain);
  expect(text).not.toMatch(HANGUL);
}

/** 사람이 적은 글 — 여정의 바람. 화면마다 이름표가 다르므로 한자리에 모아 둔다. */
const USER_WRITTEN = [
  '[data-testid^="home-card-title-"]',
  '[data-testid^="journey-title-"]',
  '[data-testid="journey-intent"]',
];

test('영어로 바꾸면 홈 · 갤러리 · 여정 · 설정에 한글이 남지 않는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);

  // 사람이 하는 그대로 — 설정 탭 → 지역·언어 → English.
  await openSettings(page);

  /*
    **재는 자가 눈이 있는지 먼저 확인한다.** 아직 한국어인 설정 화면에서 한글이 잡히지
    않는다면, 아래의 "한글이 없다" 는 판정은 화면을 제대로 읽어서가 아니라 아무것도 읽지
    못해서 참이 된 것이다. 이 한 줄이 그 조용한 통과를 막는다.
  */
  await expect(page.getByTestId('settings-screen')).toBeVisible();
  expect(await visibleText(page)).toMatch(HANGUL);

  await page.getByTestId('settings-region').click();
  await expect(page.getByTestId('region-screen')).toBeVisible();
  await page.getByTestId('language-en').click();
  await expect(page.getByTestId('language-en-tag')).toHaveText('Now');

  /*
    지역·언어 화면부터 잰다. 이 화면에는 언어 일곱의 **제 나라 이름**(`한국어` · `Italiano`)
    이 줄마다 서 있는데, 그것은 번역되지 않는 것이 옳다 — 자기 언어를 찾는 사람에게는 자기
    글자로 적힌 이름이 유일한 표지이기 때문이다. 그래서 이 화면만은 그 줄들을 덜어 내고 잰다.
  */
  await expectEnglishOnly(page, 'Region & Language', [
    '[data-testid^="language-"] > :first-child',
  ]);

  await page.getByTestId('region-back').click();
  await expect(page.getByTestId('settings-screen')).toBeVisible();
  await expectEnglishOnly(page, 'Settings');

  // 설정의 시트 셋도 연다 — 화면에 값만 보이고 이름과 설명은 시트 안에 있기 때문이다.
  for (const [row, sheet] of [
    ['settings-recitation', 'sheet-recitation'],
    ['settings-pace', 'sheet-pace'],
    ['settings-rosary', 'sheet-rosary'],
    ['settings-about', 'sheet-about'],
  ] as const) {
    await page.getByTestId(row).click();
    await expect(page.getByTestId(sheet)).toBeVisible();
    const inside = await page.getByTestId(sheet).innerText();
    expect(inside.trim().length).toBeGreaterThan(10);
    expect(inside).not.toMatch(HANGUL);
    await page.getByTestId('sheet-close').click();
  }

  await tapTab(page, 'home');
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await expectEnglishOnly(page, "Today's Mystery", USER_WRITTEN);

  await tapTab(page, 'gallery');
  await expect(page.getByTestId('gallery-screen')).toBeVisible();
  await expectEnglishOnly(page, 'Sacred Art');

  await openJourneys(page);
  await expect(page.getByTestId('journey-screen')).toBeVisible();
  await expectEnglishOnly(page, 'Journeys', USER_WRITTEN);

  expect(errors).toEqual([]);
});
