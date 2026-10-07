/**
 * 스토어에 올릴 화면 사진 — 사람에게 보여 줄 다섯 장씩, 한국어와 영어 (W5 준비 슬라이스 D).
 *
 * ── 이 파일이 `screenshots.spec.ts` 와 다른 점 ─────────────────────────────────
 *
 * 저장소에 이미 화면 사진이 서른 몇 장 있지만, 그것들은 **대조용**이다 — 시안과 나란히
 * 놓고 "값이 맞는가"를 재려고 390×844 로 찍고, 일부러 빈 화면이나 확인 시트처럼 사람에게
 * 자랑할 것이 못 되는 자리도 찍는다. 스토어 사진은 고르는 기준이 다르다. **처음 보는 사람이
 * 이 앱이 무엇인지 알아보게 하는 다섯 장**이어야 하므로 자리도 크기도 따로 정한다.
 *
 * 그래서 두 벌을 섞지 않고 폴더를 가른다 — 이 파일이 찍는 것은 `docs/plan/store-screenshots/`
 * 로만 간다.
 *
 * ── 왜 430×932 인가 ────────────────────────────────────────────────────────────
 *
 * 화소 배율 3 을 곱하면 **1290×2796** 이 되고, 이것이 애플이 요구하는 6.7·6.9인치 아이폰
 * 화면 사진의 정확한 크기다. 구글 플레이는 짧은 변 320px 이상·긴 변 3840px 이하면 받으므로
 * 같은 사진을 그대로 쓸 수 있다. 다른 크기로 찍어 두면 제출할 때 사람이 손으로 늘리거나
 * 잘라야 하고, 그러면 글자가 뭉개진다.
 *
 * 430 이라는 너비는 이 앱이 이미 확인한 너비이기도 하다 — W1 이 320·375·390·430 네 너비에서
 * 묵주와 기도문이 겹치지 않는 것을 사진으로 남겼다(`docs/plan/w1-screens/`).
 *
 * ── 정직하게 적어 둘 한계 ──────────────────────────────────────────────────────
 *
 * 이 사진은 **실기기가 아니라 웹 빌드를 폰 크기로 띄워 찍은 것**이다. 이 컨테이너에 맥도
 * 폰도 없기 때문이며, 그래서 상태 표시줄(시각·배터리)이 없고 기기 테두리도 없다. 두 스토어
 * 모두 그런 사진을 받지만, 실기기 사진으로 바꿀지는 제출 전에 사람이 정한다.
 */
import { expect, test } from './support/harness';
import {
  enterHome,
  enterPrayerFromHome,
  freezeClock,
  openApp,
  openJourneys,
  openSettings,
  runUntilVisible,
  tapTab,
} from './support/harness';

/** 스토어 사진이 가는 자리. 대조용 사진과 섞지 않는다. */
const STORE = 'docs/plan/store-screenshots';

/**
 * 성화 뽑기의 씨앗. `screenshots.spec.ts` 와 **같은 값**을 쓴다 — 두 곳의 사진에 서로 다른
 * 그림이 뽑히면 "같은 화면인데 왜 그림이 다른가"를 사람이 매번 되물어야 한다.
 */
const ART_SEED = 20260918;

/** 애플이 요구하는 6.7·6.9인치 크기(1290×2796)가 되는 조합이다. */
test.use({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 3,
  reducedMotion: 'reduce',
});

/**
 * 다섯 장을 차례로 찍는다.
 *
 * **모두 사람이 실제로 지나는 길로 들어가 찍는다** — 첫 화면에서 홈으로, 홈에서 기도로,
 * 아래 탭 바로 여정과 갤러리로. 주소를 직접 열고 찍으면 배선이 끊겨 있어도 사진이 나오므로,
 * 사진 자체가 "닿을 수 있다"의 증거가 되게 하려는 것이다.
 *
 * @param prefix 파일 이름 앞에 붙는 말 — `ko` 또는 `en`.
 */
async function shootFive(page: import('@playwright/test').Page, prefix: string): Promise<void> {
  // 1. 홈 — 큰 성화와 오늘의 신비, 진행 중인 여정. 이 앱의 얼굴이다.
  await tapTab(page, 'home');
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${STORE}/${prefix}-1-home.png` });

  // 2. 여정 — 54일 격자. "며칠째인가"가 이 앱의 중심이라는 것을 한 장으로 말한다.
  await openJourneys(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${STORE}/${prefix}-2-journeys.png` });

  // 3. 성화 갤러리 — 지역 탭.
  await tapTab(page, 'gallery');
  await expect(page.getByTestId('gallery-screen')).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${STORE}/${prefix}-3-gallery.png` });

  // 4. 기도 화면 — 원형 묵주 위에서 지금 알 하나가 밝다. 홈의 첫 카드를 눌러 들어간다.
  await tapTab(page, 'home');
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await enterPrayerFromHome(page);
  await freezeClock(page);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${STORE}/${prefix}-4-pray.png` });

  // 5. 하루 완주 — 성모송 수와 든 시간, 여정 며칠째.
  await runUntilVisible(page, 'day-done-screen');
  await expect(page.getByTestId('day-done-screen')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${STORE}/${prefix}-5-day-done.png` });
}

test('스토어 사진 · 한국어 다섯 장', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);
  await shootFive(page, 'ko');
});

/**
 * 영어 다섯 장.
 *
 * 언어는 **사람이 하는 그대로** 바꾼다 — 설정 탭에서 지역·언어로 들어가 English 를 고른다.
 * 기도 화면의 기도문이 한국어로 남는 것은 결함이 아니라 결정이다: 확인되지 않은 기도문을
 * 사람이 바치지 않게 하려고 화면 문구만 옮기고 바치는 말은 한국어 정본을 쓴다
 * (`src/i18n/index.ts` 의 `prayerLanguage` · 결정 12-2 카드 C). **그래서 영어 스토어에
 * 기도 화면 사진을 그대로 올릴지는 사람이 정해야 한다** — 이 한계는
 * `docs/plan/store-screenshots/README.md` 가 적는다.
 */
test('스토어 사진 · 영어 다섯 장', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);

  await openSettings(page);
  await page.getByTestId('settings-region').click();
  await expect(page.getByTestId('region-screen')).toBeVisible();
  await page.getByTestId('language-en').click();
  await expect(page.getByTestId('language-en-tag')).toHaveText('Now');
  await page.getByTestId('region-back').click();
  await expect(page.getByTestId('settings-screen')).toBeVisible();

  await shootFive(page, 'en');
});
