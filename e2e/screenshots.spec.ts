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

test.use({ reducedMotion: 'reduce' });

/**
 * 기도 화면을 v5 시안이 보여 주는 단계까지 옮긴다 — 제3단의 네 번째 알(77단계 중 41번째).
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
