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
 * **W1 에서 기준값이 바뀌었다.** 기도문이 이 저장소의 옛 서체 계단(앞 절 26px · 뒷 절 21px ·
 * 줄 높이 1.7)에서 시안의 값(넷 중 고르고 기본 20px · 줄 높이 1.62)으로 옮겨 갔기 때문이다.
 * **재는 뜻은 그대로다** — 여전히 "커졌는가"가 아니라 **비율이 지켜졌는가**를 재고, 기도문
 * 상자가 글 전체를 담는지 본다. 바뀐 것은 견주는 숫자뿐이다.
 *
 * 그리고 시험이 하나 늘었다. 기기 배율과 별개로 **앱 안에서 고르는 글자 크기 넷**이 W1 에서
 * 생겼으므로(§3-5), 가장 큰 자리(`아주 크게`)에서도 가장 긴 기도문이 잘리지 않는지를 본다 —
 * W1 통과 조건 5 의 뒷부분이다.
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
  leavePrayer,
  openApp,
} from './support/harness';

const OUT = 'docs/plan/font-scale';
/** 앱 안 글자 크기 넷은 W1 이 만든 것이므로 그 사진은 W1 폴더로 간다. */
const W1 = 'docs/plan/w1-screens';

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

test('100% 에서 기도문의 글자 크기와 줄 높이가 시안의 값 그대로다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await freezeClock(page);

  // 시안의 기본 기도문 크기 20px · 줄 높이 1.62 (W1 §3-5 · `src/theme/prayerFont.ts`).
  const lead = await measure(page, 'pray-a');
  expect(lead.fontSize).toBeCloseTo(20, 1);
  expect(lead.lineHeight).toBeCloseTo(20 * 1.62, 1);

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

  // 1. 앞 절 — 글자가 두 배(20 → 40)고, 줄 높이 ÷ 글자 크기는 여전히 1.62 다.
  //    40px 은 겹쳐 곱하기의 상한(52px)에 닿지 않으므로 두 배가 그대로 나온다.
  const lead = await measure(page, 'pray-a');
  expect(lead.fontSize).toBeCloseTo(40, 1);
  expect(lead.lineHeight / lead.fontSize).toBeCloseTo(1.62, 2);

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
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/pray-200-creed.png` });

  /*
   * 4-2. 두 배율이 **겹쳐 곱해지는** 가장 빠듯한 자리 — 기기 200% 에 앱 안 `아주 크게`(27px)
   *      까지 얹으면 54px 이 되는데, 상한이 52px 에서 잘라 준다 (W1 §3-5).
   *
   *      이 자리에서 "화면보다 길어진 만큼은 스크롤로 흐른다 — 잘린 것이 아니라 아래에
   *      있다"를 잰다. W1 전에는 기기 200% 만으로도 기도문이 화면을 넘겨 위의 4 번에서
   *      함께 쟀는데, 기도문이 시안의 크기(20px 기준)로 작아지면서 그 자리에서는 더 이상
   *      넘치지 않는다. **재는 뜻을 살리려면 실제로 넘치는 자리로 옮겨야 하므로** 여기로
   *      옮겼고, 덤으로 상한이 실제로 걸리는 것까지 함께 본다.
   */
  const aa = page.getByTestId('pray-font');
  await aa.click();
  await aa.click();
  await expect(aa).toHaveAttribute('aria-label', '글자 크기, 아주 크게');
  expect((await measure(page, 'pray-a')).fontSize).toBeCloseTo(52, 1);
  expect(await prayerBoxFits(page)).toBe(true);
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

  // 다음 자리를 재기 전에 글자 크기를 보통으로 되돌린다 — 뒷 절의 크기를 기기 배율만으로
  // 재야 하기 때문이다. 아주 크게에서 두 번 더 누르면 작게를 지나 보통이다.
  await aa.click();
  await aa.click();
  await expect(aa).toHaveAttribute('aria-label', '글자 크기, 보통');

  // 5. 뒷 절 — 사용자가 받는 부분. 성호경과 사도신경에는 뒷 절이 없어 주님의 기도까지 한
  //    걸음 더 간다. W1 에서 앞 절과 **같은 크기**가 됐다 — 시안의 기도문은 크기 하나짜리
  //    한 덩어리이고, 이 앱이 더한 교대는 색과 흐림으로만 갈리기 때문이다.
  await page.getByTestId('pray-next-step').click();
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 주님의 기도');
  const response = await measure(page, 'pray-b');
  expect(response.fontSize).toBeCloseTo(40, 1);
  expect(response.lineHeight / response.fontSize).toBeCloseTo(1.62, 2);
  expect(await prayerBoxFits(page)).toBe(true);

  expect(errors).toEqual([]);
});

/**
 * 앱 안 글자 크기 넷 (W1 §3-5 · 통과 조건 5 의 뒷부분).
 *
 * 앞의 두 시험이 재는 것은 **기기 배율**이고, 이 시험이 재는 것은 그와 별개로 **앱 안에서
 * 고르는 크기**다. 기도 화면 머리의 `Aa` 단추가 한 번 누를 때마다 한 칸 올리고 넷째에서
 * 처음으로 돌아오는지, 그리고 가장 큰 자리에서도 가장 긴 기도문이 잘리지 않는지를 본다.
 *
 * 어느 자리에 서 있는지는 단추의 낭독 이름으로 읽는다. 화면에 보이는 글자는 언제나 `Aa`
 * 라 눈으로는 자리를 알 수 없고, 화면 낭독기를 쓰는 사람이 실제로 듣는 것이 그 이름이다.
 */
test('Aa 단추가 글자 크기 넷을 돌고, 아주 크게에서도 사도신경이 잘리지 않는다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await freezeClock(page);

  const aa = page.getByTestId('pray-font');

  // 1. 처음은 보통(20px)이다.
  await expect(aa).toHaveAttribute('aria-label', '글자 크기, 보통');
  expect((await measure(page, 'pray-a')).fontSize).toBeCloseTo(20, 1);

  // 2. 두 번 누르면 크게(23px)를 지나 아주 크게(27px)다.
  await aa.click();
  await expect(aa).toHaveAttribute('aria-label', '글자 크기, 크게');
  expect((await measure(page, 'pray-a')).fontSize).toBeCloseTo(23, 1);
  await aa.click();
  await expect(aa).toHaveAttribute('aria-label', '글자 크기, 아주 크게');
  const xlarge = await measure(page, 'pray-a');
  expect(xlarge.fontSize).toBeCloseTo(27, 1);
  expect(xlarge.lineHeight / xlarge.fontSize).toBeCloseTo(1.62, 2);

  // 3. 아주 크게에서 가장 긴 기도문(사도신경)이 잘리지 않는다. 성호경에서 두 걸음이다.
  await page.getByTestId('pray-next-step').click();
  await page.getByTestId('pray-next-step').click();
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 사도신경');
  expect(await prayerBoxFits(page)).toBe(true);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${W1}/pray-xlarge.png` });

  // 4. 한 번 더 누르면 처음으로 돌아온다 — 넷째 다음은 작게(17px)다.
  await aa.click();
  await expect(aa).toHaveAttribute('aria-label', '글자 크기, 작게');
  expect((await measure(page, 'pray-a')).fontSize).toBeCloseTo(17, 1);

  /*
   * 5. 고른 크기는 화면을 나갔다 다시 들어와도 남는다.
   *
   *    여기서 재는 것은 **화면을 다시 세워도 고른 값을 읽어 온다**는 것까지다. 앱을 아예
   *    껐다 켜도 남는가(기기에 저장되는가)는 이 시험이 아니라 단위 시험이 잰다
   *    (`src/storage/settings.test.ts` 의 `저장한 글자 크기가 그대로 돌아온다`) — 브라우저를
   *    다시 띄우려면 멈춰 둔 시계를 풀어야 하는데, 그러면 앱이 스스로 알을 넘겨 이 시험이
   *    붙들고 있던 자리가 흔들린다.
   */
  await leavePrayer(page, 'pause');
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await enterPrayerFromHome(page);
  await expect(page.getByTestId('pray-font')).toHaveAttribute('aria-label', '글자 크기, 작게');

  expect(errors).toEqual([]);
});
