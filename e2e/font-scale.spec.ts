/**
 * 글자 확대 e2e (FR-28) — 시스템 글자 크기를 200% 로 키워도 줄 간격과 자간이 함께 커지고,
 * 기도문이 붙거나 잘리지 않는가.
 *
 * 이 요구는 경쟁 앱의 실제 결함에서 나왔다 — 굿뉴스 묵주기도는 글자를 키우면 줄 간격이 따라오지
 * 않아 글자가 붙는다(PRD 조사 02b). 그래서 여기서 재는 것은 "커졌는가"가 아니라 **비율이
 * 지켜졌는가**다. 100% 와 200% 두 번 열어, 글자 크기 · 줄 높이 · 자간을 값으로 읽어 비율을 견주고,
 * 기도문 상자가 글 전체를 담는지 본다. 사진은 `docs/plan/font-scale/` 에 남겨 사람이 본다.
 *
 * 웹에서 200% 를 흉내 내는 방법은 브라우저의 뿌리 글자 크기를 32px 로 두는 것이다
 * (`harness.ts` 의 `installFontScale`). 앱이 그 값을 배율로 읽는다.
 *
 * 기도 화면에 들어선 직후 시간을 멈춘다(`freezeClock`). 그래야 단추로 옮긴 자리가 재는 동안
 * 앱이 스스로 넘긴 자리와 섞이지 않는다.
 */
import { expect, test } from '@playwright/test';
import {
  collectConsoleErrors,
  enterHome,
  enterPrayerFromHome,
  freezeClock,
  openApp,
} from './support/harness';

const OUT = 'docs/plan/font-scale';

test.use({ reducedMotion: 'reduce' });

/** 글자 하나의 실제 크기 셋을 px 숫자로 읽는다. */
async function measure(page: import('@playwright/test').Page, testId: string) {
  return page.getByTestId(testId).evaluate((element) => {
    const style = getComputedStyle(element as HTMLElement);
    const px = (value: string) => (value === 'normal' ? 0 : parseFloat(value));
    return {
      fontSize: px(style.fontSize),
      lineHeight: px(style.lineHeight),
      letterSpacing: px(style.letterSpacing),
    };
  });
}

/** 기도문 상자가 글 전체를 담는가 — 넘친 줄이 잘려 나가면 거짓이다. */
async function prayerBoxFits(page: import('@playwright/test').Page) {
  const clipped = await page.getByTestId('pray-a').evaluate((element) => {
    const box = element.parentElement as HTMLElement;
    return box.scrollHeight > box.clientHeight + 2;
  });
  return !clipped;
}

test('100% 에서 기도문의 글자 크기와 줄 높이가 서체 계단의 값 그대로다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await freezeClock(page);

  // prayer-lg 26px / 1.7 · prayer-md 21px / 1.7 (06-design-system §3).
  const lead = await measure(page, 'pray-a');
  expect(lead.fontSize).toBeCloseTo(26, 1);
  expect(lead.lineHeight).toBeCloseTo(26 * 1.7, 1);

  // 사도신경 — 하루 중 가장 긴 기도문. 성호경에서 두 걸음이다.
  await page.getByTestId('pray-next-step').click();
  await page.getByTestId('pray-next-step').click();
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 사도신경');
  expect(await prayerBoxFits(page)).toBe(true);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/pray-100.png` });

  expect(errors).toEqual([]);
});

test('200% 에서 줄 높이와 자간이 글자와 같은 비율로 커지고 기도문이 잘리지 않는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page, { fontScale: 2 });
  await enterHome(page);
  await enterPrayerFromHome(page);
  await freezeClock(page);

  // 1. 앞 절 — 글자가 두 배고, 줄 높이 ÷ 글자 크기는 여전히 1.7 이다.
  const lead = await measure(page, 'pray-a');
  expect(lead.fontSize).toBeCloseTo(52, 1);
  expect(lead.lineHeight / lead.fontSize).toBeCloseTo(1.7, 2);

  // 2. 자간이 있는 글자 — 구간 라벨(10.5px · .16em). 자간도 두 배라 글자 대비 비율이 그대로다.
  const label = await measure(page, 'pray-step');
  expect(label.fontSize).toBeCloseTo(21, 1);
  expect(label.letterSpacing / label.fontSize).toBeCloseTo(0.16, 2);

  // 3. 첫 화면에서 기도문 상자가 글을 자르지 않는다.
  expect(await prayerBoxFits(page)).toBe(true);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/pray-200.png` });

  // 4. 가장 긴 기도문(사도신경)에서도 잘리지 않는다 — 200% 에서 가장 빠듯한 자리다.
  await page.getByTestId('pray-next-step').click();
  await page.getByTestId('pray-next-step').click();
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 사도신경');
  expect(await prayerBoxFits(page)).toBe(true);
  // 화면보다 길어진 만큼은 스크롤로 흐른다 — 잘린 것이 아니라 아래에 있다.
  const scrollable = await page.evaluate(() =>
    [...document.querySelectorAll('div')].some((element) => {
      const overflow = getComputedStyle(element).overflowY;
      return (
        (overflow === 'auto' || overflow === 'scroll') &&
        element.scrollHeight > element.clientHeight + 2
      );
    }),
  );
  expect(scrollable).toBe(true);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/pray-200-creed.png` });

  // 5. 뒷 절 — 사용자가 받는 부분(prayer-md 21px / 1.7). 성호경과 사도신경에는 뒷 절이 없어
  //    주님의 기도까지 한 걸음 더 간다.
  await page.getByTestId('pray-next-step').click();
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 주님의 기도');
  const response = await measure(page, 'pray-b');
  expect(response.fontSize).toBeCloseTo(42, 1);
  expect(response.lineHeight / response.fontSize).toBeCloseTo(1.7, 2);
  expect(await prayerBoxFits(page)).toBe(true);

  expect(errors).toEqual([]);
});
