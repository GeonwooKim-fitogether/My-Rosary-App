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
/** 새 시안의 어법으로 다시 세운 기도 화면 (W1) 을 찍어 두는 자리. */
const W1 = 'docs/plan/w1-screens';


test.use({ reducedMotion: 'reduce' });

/**
 * 기도 화면을 v5 시안이 보여 주는 단계까지 옮긴다 — 제3단의 네 번째 알(81단계 중 43번째).
 * 시안이 그 단계를 그려 두었으므로 같은 단계를 찍어야 나란히 놓고 대조할 수 있다.
 */
async function moveToThirdDecadeFourthBead(page: import('@playwright/test').Page) {
  // 몇째 알인지는 기도문 제목 옆의 세는 줄이 말한다. W1 에서 지금 알이 본래 크기로
  // 돌아가면서, 알 안에 적던 숫자가 이 자리로 옮겼다 (`app/pray.tsx` 의 `pray-counter`).
  const counter = page.getByTestId('pray-counter');
  for (let i = 0; i < 60; i++) {
    const atTarget =
      (await page.getByTestId('pray-step').textContent()) === '제3단 · 성모송' &&
      (await counter.textContent()) === '4 / 10';
    if (atTarget) break;
    await pressMediaButton(page, 'nexttrack');
    await page.waitForTimeout(20);
  }
  await expect(page.getByTestId('pray-step')).toHaveText('제3단 · 성모송');
  await expect(counter).toHaveText('4 / 10');
}


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






/*
 * ── 여기 있던 시험 여섯을 은퇴시켰다 (2026-09-18, W1) ─────────────────────────
 *
 * 기도 화면을 찍던 여섯 — `M1 · 기도 화면` · `M2 · 밤 벌` · `결정 6` · `결정 7` ·
 * `결정 8·9` · `결정 10` — 이 그것이다. 지운 이유는 시험이 틀려서가 아니라, 그 시험들이
 * **지금은 없는 묵주의 사진을 자꾸 다시 찍어 기록을 덮었기** 때문이다.
 *
 * 무슨 일이 있었는지 정확히 적는다. 그 여섯이 찍던 사진 스무 장은 `decisions.md` 의
 * 결정 6·7·8·9·10 이 무엇을 정했는지를 보여 주는 증거였고, 그 결정들은 **늘어진 물방울
 * 고리**를 그린 옛 화면 위에서 내려졌다. 2026-09-17 의 결정 12-2(카드 D)가 그 기하를
 * 시안의 원형 고리로 뒤집었으므로, 같은 시험을 그대로 돌리면 스무 장이 전부 새 묵주로
 * 바뀐다. 결정문은 물방울 고리를 말하는데 사진은 원형 고리를 보여 주는 상태가 되고,
 * 그러면 **결정문이 가리키는 증거가 사라진다.**
 *
 * 그래서 사진 스무 장은 그 자리에 그대로 얼려 두고(각 폴더의 `README.md` 가 그 사실을
 * 적는다), 그것을 다시 찍던 시험은 여기서 내렸다. 새 화면의 사진은 이 파일 끝의
 * `W1 · …` 두 시험이 `docs/plan/w1-screens/` 에 찍는다.
 *
 * 되살리고 싶다면 git 이력에서 꺼내면 된다. 다만 되살리기 전에 **어느 폴더에 찍을지**를
 * 먼저 정해야 한다 — 옛 폴더에 찍으면 같은 일이 되풀이된다.
 */

/**
 * W1 — 새 시안의 어법으로 다시 세운 기도 화면을 네 너비로 찍는다 (통과 조건 4).
 *
 * 네 너비를 고른 이유는 이 화면의 크기가 **화면 크기에서 계산되기** 때문이다. 묵주 칸의
 * 높이가 `min(38dvh, 66vw × 1.35, 400px)` 이라, 좁은 기기에서는 가로가 높이를 정하고 넓은
 * 기기에서는 세로가 정한다 — 320 과 375 는 가로가 정하는 쪽이고, 390 과 430 은 세로가
 * 정하는 쪽이다. 두 갈래를 다 찍어야 "묵주와 기도문이 겹치지 않는가"가 판정된다.
 *
 * 네 장 모두 같은 단계(제3단의 넷째 성모송)에서 찍는다. 다른 사진들과 같은 단계라
 * 옛 화면과 나란히 놓고 대조할 수 있다.
 */
test('W1 · 새 기도 화면을 네 너비로 찍는다', async ({ page }) => {
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await moveToThirdDecadeFourthBead(page);

  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.waitForTimeout(400);
    // 묵주 칸과 기도문 칸이 서로를 침범하지 않는지는 눈으로 보기 전에 값으로도 못 박는다.
    const stage = (await page.getByTestId('pray-stage').boundingBox())!;
    const prayer = (await page.getByTestId('pray-a').boundingBox())!;
    expect(prayer.y).toBeGreaterThanOrEqual(stage.y + stage.height - 1);
    expect(stage.height).toBeCloseTo(Math.min(0.38 * 844, 0.66 * width * 1.35, 400), 0);
    await page.screenshot({ path: `${W1}/pray-${width}.png` });
  }
});

/**
 * W1 — 지금 알의 다섯 상태 중 둘을 새 화면에서 다시 찍는다.
 *
 * 다섯 상태의 정본 사진은 `docs/plan/bead-phases/` 에 있고 그쪽 시험이 그대로 찍는다.
 * 여기서 두 장을 더 찍는 것은 **알이 부풀지 않게 된 뒤에도** 지금 자리가 눈에 띄는지를
 * 새 화면에서 한 번 보기 위해서다 — 옛 화면은 지금 알을 반지름 17 로 키워 눈을 끌었고,
 * 새 화면은 알을 제자리에 두고 빛무리와 테로만 말한다(결정 12-2 의 카드 D).
 */
test('W1 · 알이 부풀지 않는 새 화면에서 지금 자리가 보이는지 두 장으로 찍는다', async ({ page }) => {
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);

  // 1. 십자가에 머무는 단계 — 알이 아닌 자리도 같은 방식으로 빛나는가.
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 성호경');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${W1}/pray-cross.png` });

  // 2. 고리 위의 알 — 바친 구간의 빛이 띠를 이루고 그 끝이 지금 알인가.
  await moveToThirdDecadeFourthBead(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${W1}/pray-bead.png` });
});

/**
 * W1 — 기도 화면을 나가는 방법을 묻는 시트 (§4-2 의 3번).
 *
 * 이 한 장이 있어야 하는 이유가 있다. 그전에는 머리의 뒤로 화살표를 한 번 누르면 **오늘
 * 바친 자리가 곧바로 지워졌다.** 되돌아가려고 누른 사람이 오늘을 잃는 자리였고, 그것이
 * 화면에서 실제로 어떻게 바뀌었는지는 글로만 적으면 확인할 수 없다. 사진은 화살표가
 * 이제 **묻기만 한다**는 것을 보여 준다.
 */
test('W1 · 기도 화면을 나가는 방법을 묻는 시트를 찍는다', async ({ page }) => {
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);

  await page.getByTestId('pray-back').click();
  await expect(page.getByTestId('sheet-leave')).toBeVisible();
  await expect(page.getByTestId('pray-pause')).toContainText('자리가 남습니다');
  await expect(page.getByTestId('pray-stop')).toContainText('오늘 처음부터');
  await page.waitForTimeout(400); // 올라오는 움직임이 끝난 뒤에 찍는다
  await page.screenshot({ path: `${W1}/pray-leave.png` });
});
