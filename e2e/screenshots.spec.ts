/**
 * 화면 사진 — 사람이 눈으로 볼 수 있게 화면을 찍어 저장소에 남긴다.
 *
 * 크기는 390×844 다. v5 시안이 그 크기의 기기 틀로 그려졌기 때문이고, 화면 크기는
 * 브라우저 창 크기가 아니라 Playwright 의 `viewport` 로 정한다 — 헤드리스 크로미움의
 * `--window-size` 는 배치에 쓰이는 크기와 1대1로 맞지 않아 잘린 그림이 나오는 것을
 * 이 저장소에서 실측했다. 화소 배율은 2 로 두어 실제 폰과 같은 촘촘함으로 찍는다.
 * 두 값 모두 `playwright.config.ts` 가 정한다.
 *
 * M1 의 두 장은 `docs/plan/m1-screens/`, M2 의 화면들은 `docs/plan/m2-screens/` 로 간다.
 * 사진을 찍을 때는 본보기 여정을 세우고(`?demo=1`) 시계를 9월 5일에 세운다 — 그래야 화면의
 * 날짜가 v5 시안의 값과 글자까지 같아져 나란히 놓고 대조할 수 있다.
 */
import { expect, test } from '@playwright/test';
import {
  enterHome,
  enterPrayerFromHome,
  openApp,
  pressMediaButton,
  runUntilVisible,
} from './support/harness';

const M1 = 'docs/plan/m1-screens';
const M2 = 'docs/plan/m2-screens';
/** 알 쉰아홉과 단 넘기기 (`decisions.md` 결정 6) 를 찍어 두는 자리. */
const ROSARY_FULL = 'docs/plan/rosary-full';
/** 표준 도해에 맞춘 기도 순서 (`decisions.md` 결정 7) 를 찍어 두는 자리. */
const PRAYER_ORDER = 'docs/plan/prayer-order';
/** 늘어진 묵주 모양과 재질 넷 (`decisions.md` 결정 8·9) 을 찍어 두는 자리. */
const MATERIALS = 'docs/plan/rosary-materials';

/** 설정 화면에서 묵주를 골라 온다. 사용자가 하는 그대로다. */
async function chooseRosary(page: import('@playwright/test').Page, key: string) {
  await page.getByTestId('home-settings').click();
  await page.getByTestId('settings-rosary').click();
  await expect(page.getByTestId('sheet-rosary')).toBeVisible();
  await page.getByTestId(`sheet-choice-${key}`).click();
  await page.getByTestId('settings-close').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();
}

test.use({ reducedMotion: 'reduce' });

/**
 * 기도 화면을 v5 시안이 보여 주는 단계까지 옮긴다 — 제3단의 네 번째 알(81단계 중 43번째).
 * 시안이 그 단계를 그려 두었으므로 같은 단계를 찍어야 나란히 놓고 대조할 수 있다.
 */
async function moveToThirdDecadeFourthBead(page: import('@playwright/test').Page) {
  const beadNumber = page.locator('svg text').first();
  for (let i = 0; i < 60; i++) {
    const atTarget =
      (await page.getByTestId('pray-step').textContent()) === '제3단 · 성모송' &&
      (await beadNumber.count()) > 0 &&
      (await beadNumber.textContent()) === '4';
    if (atTarget) break;
    await pressMediaButton(page, 'nexttrack');
    await page.waitForTimeout(20);
  }
  await expect(page.getByTestId('pray-step')).toHaveText('제3단 · 성모송');
  await expect(beadNumber).toHaveText('4');
}

test('M1 · 기도 화면을 찍는다 — v5 시안과 같은 단계에서', async ({ page }) => {
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await expect(page.getByTestId('pray-a')).toContainText('성부와 성자와 성령의 이름으로');
  await moveToThirdDecadeFourthBead(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${M1}/pray.png` });
});

test('M1 · 하루 완주 화면을 찍는다', async ({ page }) => {
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await runUntilVisible(page, 'day-done-screen');
  await expect(page.getByTestId('day-done-screen')).toBeVisible();
  await page.screenshot({ path: `${M1}/day-done.png` });
});

test('M2 · 홈 · 여정 상세 · 새 기도 · 초대 코드 · 설정을 찍는다', async ({ page }) => {
  await openApp(page);
  await enterHome(page);

  // 홈 — 본보기 여정이 23일째에 서 있다.
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('23일째 · 청원');
  await page.screenshot({ path: `${M2}/home.png` });

  // 여정 상세 — 54칸 격자와 통계.
  await page.getByTestId('home-ribbon-0').click();
  await expect(page.getByTestId('journey-grid').locator('> div')).toHaveCount(54);
  await page.screenshot({ path: `${M2}/journey.png` });
  await page.getByTestId('journey-back').click();

  // 새 기도 — 바람을 한 줄 적은 상태로 찍는다. 빈 화면은 자리 글만 보인다.
  await page.getByTestId('home-new').click();
  await page.getByTestId('new-intent').fill('아버지의 건강');
  await expect(page.getByTestId('new-finish')).toBeVisible();
  await page.screenshot({ path: `${M2}/new.png` });
  await page.getByTestId('new-close').click();

  // 초대 코드 — 네 자리를 넣은 도중 상태.
  await page.getByTestId('home-invite').click();
  await page.getByTestId('invite-input').fill('k7m4');
  await page.screenshot({ path: `${M2}/invite.png` });
  await page.getByTestId('invite-close').click();

  // 설정 — 묶음 셋.
  await page.getByTestId('home-settings').click();
  await expect(page.getByTestId('settings-screen')).toBeVisible();
  await page.screenshot({ path: `${M2}/settings.png` });

  // 시트 — S2 받는 사이. 파생한 일곱 중 하나를 대표로 남긴다.
  await page.getByTestId('settings-pace').click();
  await expect(page.getByTestId('sheet-pace')).toBeVisible();
  await page.waitForTimeout(400); // 올라오는 움직임이 끝난 뒤에 찍는다
  await page.screenshot({ path: `${M2}/sheet-pace.png` });
});

test('M2 · 여정 완주 화면을 찍는다', async ({ page }) => {
  await openApp(page);
  await enterHome(page);
  await page.clock.setSystemTime(new Date('2026-10-06T09:00:00'));
  await page.reload();
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('54일째 · 감사');
  await enterPrayerFromHome(page);
  await runUntilVisible(page, 'all-done-screen');
  await expect(page.getByTestId('all-done-screen')).toBeVisible();
  await page.screenshot({ path: `${M2}/all-done.png` });
});

test('M2 · 밤 벌을 찍는다 — 홈 · 기도 · 시트', async ({ page }) => {
  await openApp(page);
  await enterHome(page);

  // 설정에서 밤으로 바꾼다. 사용자가 하는 그대로다.
  await page.getByTestId('home-settings').click();
  await page.getByTestId('settings-theme').click();
  await page.getByTestId('sheet-choice-night').click();
  await expect(page.getByTestId('settings-theme-value')).toHaveText('밤 →');
  await page.screenshot({ path: `${M2}/settings-night.png` });

  await page.getByTestId('settings-close').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await page.screenshot({ path: `${M2}/home-night.png` });

  // 밤에 실제로 오래 보게 되는 화면은 기도 화면이다.
  await enterPrayerFromHome(page);
  await moveToThirdDecadeFourthBead(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${M2}/pray-night.png` });
});

/**
 * 알 쉰아홉과 단 넘기기 — 네 장을 찍는다 (`decisions.md` 결정 6).
 *
 * 두 크기를 찍는 이유는 이 그림이 성화 띠(267) 안에 들어가야 하기 때문이다. 390×844 는
 * 시안의 크기이고, 390×640 은 브라우저 주소창이 높이를 가져간 실제 폰의 크기다 —
 * 짧은 쪽에서 묵주가 잘리지 않는지, 단 넘기는 줄이 스크롤 없이 보이는지가 여기서 갈린다.
 * 두 벌(낮·밤)을 다 찍는 것은 알의 빛과 그늘이 벌마다 다른 색에서 나오기 때문이다.
 */
test('결정 6 · 알 쉰아홉과 단 넘기기를 두 크기 두 벌로 찍는다', async ({ page }) => {
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await moveToThirdDecadeFourthBead(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${ROSARY_FULL}/pray-day-844.png` });

  await page.setViewportSize({ width: 390, height: 640 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${ROSARY_FULL}/pray-day-640.png` });

  // 설정에서 밤으로 바꾼다. 사용자가 하는 그대로다.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId('pray-pause').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await page.getByTestId('home-settings').click();
  await page.getByTestId('settings-theme').click();
  await page.getByTestId('sheet-choice-night').click();
  await expect(page.getByTestId('settings-theme-value')).toHaveText('밤 →');
  await page.getByTestId('settings-close').click();

  await enterPrayerFromHome(page);
  await moveToThirdDecadeFourthBead(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${ROSARY_FULL}/pray-night-844.png` });

  await page.setViewportSize({ width: 390, height: 640 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${ROSARY_FULL}/pray-night-640.png` });
});

/**
 * 결정 7 — 표준 「묵주기도 방법」 도해에 맞춘 순서를 눈으로 확인하는 넉 장.
 *
 * 여기서 확인하는 것은 넷이다. 첫째, 시작 기도에 구원을 비는 기도가 실제로 생겼는가
 * (도해 7번, 그전에는 없었다). 둘째, 제1단의 첫 성모송에서 지금 알이 고리의 **오른쪽**에
 * 있는가. 셋째, 제5단의 마지막 성모송에서 지금 알이 **왼쪽**에 있는가 — 둘을 합치면
 * 고리가 도해대로 오른쪽으로 돈다는 뜻이다. 넷째, 마침 기도의 성모찬송이 화면에 뜨는가
 * (도해 33번, 그전에는 없었다).
 *
 * 시계는 `openApp` 이 세워 두므로 앱이 스스로 알을 넘기지 않는다. 그래서 아래의 단추
 * 누름 수가 곧 지나간 단계 수이고, 사진이 언제 찍어도 같은 단계에서 나온다.
 */
test('결정 7 · 도해에 맞춘 기도 순서를 넉 장으로 찍는다', async ({ page }) => {
  const beadNumber = page.locator('svg text').first();
  const step = page.getByTestId('pray-step');

  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await expect(step).toHaveText('시작 기도 · 성호경');

  // 1. 시작 기도의 구원을 비는 기도 — 성호경에서 여덟 걸음이다
  //    (입맞춤 · 사도신경 · 주님의 기도 · 성모송 셋 · 영광송 · 구원을 비는 기도).
  for (let i = 0; i < 8; i++) await pressMediaButton(page, 'nexttrack');
  await expect(step).toHaveText('시작 기도 · 구원을 비는 기도');
  await expect(page.getByTestId('pray-a')).toContainText('저희를 지옥 불에서 구하시고');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${PRAYER_ORDER}/1-opening-save.png` });

  // 2. 제1단의 첫 성모송 — 지금 알이 고리의 오른쪽에 있어야 한다.
  //    구원을 비는 기도에서 세 걸음이다 (신비 선포 · 주님의 기도 · 첫 성모송).
  for (let i = 0; i < 3; i++) await pressMediaButton(page, 'nexttrack');
  await expect(step).toHaveText('제1단 · 성모송');
  await expect(beadNumber).toHaveText('1');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${PRAYER_ORDER}/2-decade1-first-bead.png` });

  // 3. 제5단의 마지막 성모송 — 지금 알이 왼쪽에 있어야 한다.
  //    제1단 첫 성모송에서 예순다섯 걸음이다 — 한 단이 열네 단계이므로 넉 단이 쉰여섯이고,
  //    거기에 제1단에서 남은 아홉(성모송 아홉)을 더한 값이다.
  for (let i = 0; i < 65; i++) await pressMediaButton(page, 'nexttrack');
  await expect(step).toHaveText('제5단 · 성모송');
  await expect(beadNumber).toHaveText('10');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${PRAYER_ORDER}/3-decade5-last-bead.png` });

  // 4. 마침 기도의 성모찬송 — 영광송과 구원을 비는 기도를 지나 세 걸음이다.
  for (let i = 0; i < 3; i++) await pressMediaButton(page, 'nexttrack');
  await expect(step).toHaveText('마침 기도 · 성모찬송');
  await expect(page.getByTestId('pray-a')).toContainText('여왕이시며 어머니시요');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${PRAYER_ORDER}/4-closing-salve.png` });
});

/**
 * 결정 8·9 — 늘어진 묵주 모양과 재질 넷을 눈으로 확인하는 여섯 장.
 *
 * 여기서 확인하는 것은 넷이다. 첫째, 고리가 타원이 아니라 아래 메달로 모이는 물방울인가.
 * 둘째, 알과 알 사이에 줄이 보이고 단과 단 사이만 한 칸 더 긴가. 셋째, 재질 넷이 실제로
 * 서로 달라 보이는가(같은 단계에서 넉 장을 찍으므로 나란히 놓고 견줄 수 있다). 넷째,
 * 고르는 시트에서 그 차이가 미리 보이는가.
 *
 * 다섯째로 밤 벌 한 장을 더 찍는다 — 금과 은은 밝은 한지에서, 나무와 장미는 어두운 쪽빛에서
 * 흐려지기 쉬워 두 벌을 다 봐야 판정이 선다.
 */
test('결정 8·9 · 늘어진 묵주 모양과 재질 넷을 여섯 장으로 찍는다', async ({ page }) => {
  await openApp(page);
  await enterHome(page);

  for (const key of ['rose', 'wood', 'silver', 'gold']) {
    await chooseRosary(page, key);
    await enterPrayerFromHome(page);
    await moveToThirdDecadeFourthBead(page);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${MATERIALS}/pray-${key}-day.png` });
    await page.getByTestId('pray-pause').click();
    await expect(page.getByTestId('home-screen')).toBeVisible();
  }

  // 밤 벌 — 기본값인 붉은 장미가 쪽빛 위에서도 읽히는지 본다.
  await chooseRosary(page, 'rose');
  await page.getByTestId('home-settings').click();
  await page.getByTestId('settings-theme').click();
  await page.getByTestId('sheet-choice-night').click();
  await expect(page.getByTestId('settings-theme-value')).toHaveText('밤 →');
  await page.getByTestId('settings-close').click();
  await enterPrayerFromHome(page);
  await moveToThirdDecadeFourthBead(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${MATERIALS}/pray-rose-night.png` });

  // 고르는 시트 — 미리보기가 보이는 상태. 낮으로 되돌려 찍는다.
  await page.getByTestId('pray-pause').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await page.getByTestId('home-settings').click();
  await page.getByTestId('settings-theme').click();
  await page.getByTestId('sheet-choice-day').click();
  await page.getByTestId('settings-rosary').click();
  await expect(page.getByTestId('rosary-preview')).toBeVisible();
  await page.waitForTimeout(400); // 올라오는 움직임이 끝난 뒤에 찍는다
  await page.screenshot({ path: `${MATERIALS}/sheet-rosary.png` });

  /*
   * 새 기도 화면의 묵주 줄. 이 줄은 첫 화면 밖에 있어 M2 사진에는 나오지 않으므로, 고른
   * 재질이 여기까지 닿았는지는 따로 찍어야 알 수 있다. 금으로 바꾼 뒤 그 줄까지 굴려
   * 내려가, 작은 묵주 표시가 금빛 사슬로 바뀌었는지 본다.
   */
  await page.getByTestId('sheet-choice-gold').click();
  await page.getByTestId('settings-close').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();
  await page.getByTestId('home-new').click();
  await page.getByTestId('new-rosary').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('new-rosary')).toContainText('금');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${MATERIALS}/new-rosary-row.png` });
});
