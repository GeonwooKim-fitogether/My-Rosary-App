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
  freezeClock,
  leavePrayer,
  openApp,
  openJourneys,
  openSettings,
  pressMediaButton,
  reopenApp,
  runUntilVisible,
  tapTab,
} from './support/harness';

/**
 * 성화 뽑기의 씨앗 (`decisions.md` Q-57).
 *
 * 이 한 줄이 있기 전에는 **아무것도 고치지 않고 e2e 를 다시 돌려도 사진의 그림이 달라졌다.**
 * 뽑기가 난수였기 때문이고, 그래서 사진 커밋마다 뜻 없는 변경이 섞여 사람이 손으로 되돌려야
 * 했다. 씨앗을 물리면 순서가 언제나 같아지므로, 사진이 달라졌다는 것은 **화면이 달라졌다는
 * 뜻**이 된다 — 그때 비로소 사진이 대조의 근거가 된다.
 *
 * 값 자체에는 뜻이 없다. 이 사진들을 처음 찍은 날(2026-09-18)을 적어 두었을 뿐이며, 바꾸면
 * 모든 사진의 그림이 한 번 바뀌므로 까닭 없이 바꾸지 않는다.
 */
const ART_SEED = 20260918;

const M1 = 'docs/plan/m1-screens';
const M2 = 'docs/plan/m2-screens';
/** 새 시안의 어법으로 다시 세운 기도 화면 (W1) 을 찍어 두는 자리. */
const W1 = 'docs/plan/w1-screens';
/** 새 시안의 어법으로 다시 세운 홈과 탭 바 (W2) 를 찍어 두는 자리. */
const W2 = 'docs/plan/w2-screens';
/** 새 시안의 어법으로 다시 세운 여정 화면과 여정 완주 (W3) 를 찍어 두는 자리. */
const W3 = 'docs/plan/w3-screens';


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
  await openApp(page, { art: ART_SEED });
  await enterHome(page);
  await enterPrayerFromHome(page);
  await runUntilVisible(page, 'day-done-screen');
  await expect(page.getByTestId('day-done-screen')).toBeVisible();
  await page.screenshot({ path: `${M1}/day-done.png` });
});

test('M2 · 홈 · 여정 상세 · 새 기도 · 초대 코드 · 설정을 찍는다', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);

  /*
    홈 — 본보기 여정이 23일째에 서 있다.

    **여기서 `m2-screens/home.png` 를 더 찍지 않는다.** 그 한 장은 v5 어법의 홈(카드 목록)을
    담은 M2 의 기록이고, W2 가 홈을 새 시안의 어법으로 다시 세웠으므로 같은 자리에 다시
    찍으면 M2 의 기록이 W2 의 화면으로 덮인다. W1 이 묵주 사진 스무 장에서 겪은 일과 같은
    모양이다(이 파일 가운데의 은퇴 주석). 새 홈의 사진은 아래 `W2 · …` 시험이
    `docs/plan/w2-screens/` 에 찍는다. 재던 판정문은 그대로 둔다.
  */
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('23일째 · 청원');

  /*
    **여기서 `m2-screens/journey.png` 와 `m2-screens/new.png` 를 더 찍지 않는다.**

    두 장은 v5 어법의 **여정 상세**와 **새 기도** 화면을 담은 M2 의 기록이고, W3 슬라이스 A 가
    그 둘을 하나로 합쳐 새 시안의 여정 화면으로 다시 세웠다(`docs/plan/w3-work-order.md`
    §1-2). 같은 자리에 다시 찍으면 M2 의 기록이 W3 의 화면으로 덮인다 — 홈·설정·나가기 시트
    에서 이미 세 번 내린 같은 판정이며 처방도 같다. **재던 판정문은 그대로 두고 사진만 내린다.**

    새 여정 화면의 사진은 이 파일 끝의 `W3 · …` 시험들이 `docs/plan/w3-screens/` 에 찍는다.
    옛 `새 기도` 화면(`app/new.tsx`)은 지우지 않았지만 진입점이 끊겨 사람이 닿지 않으므로,
    닿지 않는 화면을 계속 찍지 않는다 — 초대 코드 화면에 쓴 판단과 같다.
  */
  await page.getByTestId('home-ribbon-0').click();
  await expect(page.getByTestId('journey-grid-0').locator('> div')).toHaveCount(54);

  /*
    초대 코드 — 여기서 `m2-screens/invite.png` 를 더 찍지 않는다.

    찍을 수가 없어졌다. 그 사진을 찍으려면 홈의 `초대 코드로 들어가기` 를 눌러 들어가야
    하는데, 결정 12-2 의 카드 A 가 조 기도를 V1.5 로 미루면서 **그 줄이 홈에서 사라졌다**
    (`decisions.md` Q-59). 화면 자체는 지우지 않았으므로 주소로는 열리지만, 사진은 "사람이
    닿을 수 있다"의 증거이기도 하므로 닿지 않는 화면을 계속 찍지 않는다. 옛 사진은 그
    자리에 그대로 두어 V1.5 에서 되살릴 때의 기준으로 쓴다.

    이 시험의 이름에 남아 있는 `초대 코드` 와 `설정` 은 지우지 않았다. 이름표가 바뀌면
    지휘하는 쪽이 세던 수가 흔들리기 때문이고, 두 자리에서 무엇이 왜 내려갔는지는 이
    주석과 바로 아래 주석이 적는다.
  */

  /*
    설정 — 여기서 `m2-screens/settings.png` 를 더 찍지 않는다.

    그 한 장은 **v5 어법의 설정**(묶음 셋 · 높이 80 줄 · 한지 벌)을 담은 M2 의 기록이고,
    W2 슬라이스 C 가 그 화면을 새 시안의 어법으로 다시 세웠으므로 같은 자리에 다시 찍으면
    M2 의 기록이 W2 의 화면으로 덮인다. 같은 일을 이 파일이 홈(`m2-screens/home.png`)에서
    이미 한 번 판정했고 같은 처방을 쓴다 — **재던 판정문은 그대로 두고 사진만 내린다.**
    새 설정 화면의 사진은 이 파일 끝의 `W2 슬라이스 C · …` 시험이 찍는다.
  */
  await openSettings(page);
  await expect(page.getByTestId('settings-screen')).toBeVisible();

  // 시트 — S2 받는 사이. 파생한 일곱 중 하나를 대표로 남긴다.
  await page.getByTestId('settings-pace').click();
  await expect(page.getByTestId('sheet-pace')).toBeVisible();
  await page.waitForTimeout(400); // 올라오는 움직임이 끝난 뒤에 찍는다
  await page.screenshot({ path: `${M2}/sheet-pace.png` });
});

/**
 * M2 — 여정 완주 화면. **여기서 `m2-screens/all-done.png` 를 더 찍지 않는다.**
 *
 * 그 한 장은 v5 어법의 여정 완주 화면을 담은 M2 의 기록이고, W3 슬라이스 A 가 그 화면을
 * 새 시안의 어법(성화 배경과 어두운 덮개, 아래에서 위로 쌓는 글)으로 다시 세웠다. 같은
 * 자리에 다시 찍으면 M2 의 기록이 덮인다. 새 화면의 사진은 아래 `W3 · …` 시험이 찍는다.
 *
 * **이 한 장이 `decisions.md` Q-57 의 남은 자리였다.** 원인은 W3 에서 재서 밝혔다 — 아래
 * `reopenApp` 이 `page.reload()` 를 대신하는 까닭이 그것이며, 잰 내용은
 * `e2e/support/harness.ts` 의 그 함수 위에 적어 두었다. 요약하면, 화면을 다시 고칠 때
 * 주소에서 성화 씨앗 손잡이가 떨어져 뽑기가 다시 난수가 되고 있었다.
 */
test('M2 · 여정 완주에 닿는 길이 그대로인지 확인한다', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);
  await reopenApp(page, { at: new Date('2026-10-06T09:00:00'), art: ART_SEED });
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('54일째 · 감사');
  await enterPrayerFromHome(page);
  await runUntilVisible(page, 'all-done-screen');
  await expect(page.getByTestId('all-done-screen')).toBeVisible();
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
  await openApp(page, { art: ART_SEED });
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
  await openApp(page, { art: ART_SEED });
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
  await openApp(page, { art: ART_SEED });
  await enterHome(page);
  await enterPrayerFromHome(page);

  await page.getByTestId('pray-back').click();
  await expect(page.getByTestId('sheet-leave')).toBeVisible();
  await expect(page.getByTestId('pray-pause')).toContainText('자리가 남습니다');
  await expect(page.getByTestId('pray-stop')).toContainText('오늘 처음부터');
  /*
    **`w1-screens/pray-leave.png` 을 더 찍지 않는다** (W2 슬라이스 C 에서 닫은 자리).

    그 한 장은 시트를 **고치기 전**의 기록이다 — 어두운 기도 화면 위에 옛 한지 벌의 밝은
    판이 올라와 겉돌던 그 상태이고, 그것이 결정 큐 Q-56 이 태어난 자리다. 슬라이스 B 가
    시트 부품을 새 어법으로 옮긴 뒤로는 이 시험을 돌릴 때마다 그 기록이 **고친 뒤의 모습**
    으로 덮였고, 앞 슬라이스는 그 파일을 매번 손으로 되돌려 지켰다. 사람이 손으로 하는 일은
    언젠가 빠지므로 여기서 닫는다 — 홈과 설정 사진에 쓴 처방과 같다. 고친 뒤의 모습은
    `w2-screens/sheet-leave.png` 에 있고, 두 장을 나란히 놓으면 무엇이 바뀌었는지 보인다.

    **재던 판정문은 위 세 줄에 그대로 있다.** 이 시험이 지키는 것(화살표가 곧바로 지우지
    않고 묻는다)은 한 줄도 줄지 않았다.
  */
});


/**
 * W2 — 새 시안의 어법으로 다시 세운 홈을 찍는다 (통과 조건 6).
 *
 * 두 가지 상태를 찍는다. 여정이 서 있는 홈과 여정이 하나도 없는 홈(아래 시험)이다.
 * 빈 홈을 함께 찍는 이유는 그것이 **처음 설치한 사람이 보는 화면**이기 때문이다 —
 * 여정이 있는 홈만 찍으면 그 첫인상을 아무도 보지 못한다.
 *
 * **갤러리 한 장은 2026-09-18 에 이 시험에서 빠졌다.** 그때 찍던 것은 "곧 만들어집니다"
 * 한 줄뿐인 자리 지킴이였고, W3 슬라이스 B 가 그 자리를 시안의 갤러리로 채웠다. 계속
 * 찍으면 `w2-screens/gallery.png` 가 덮여 **자리 지킴이가 어떻게 생겼었는지의 기록이
 * 사라지므로**, 그 한 장은 얼리고 새 갤러리의 사진은 `docs/plan/w3-screens/` 에 둔다.
 * 홈 한 장을 M2 에서 W2 로 옮길 때와 같은 판단이다.
 */
test('W2 · 새 홈을 찍는다', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);

  // 본보기 여정이 23일째에 서 있는 홈.
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('23일째 · 청원');
  await expect(page.getByTestId('home-today-set')).toBeVisible();
  await page.waitForTimeout(400); // 성화가 떠오르는 움직임이 끝난 뒤에 찍는다
  await page.screenshot({ path: `${W2}/home.png` });
});

test('W2 · 여정이 하나도 없는 홈을 찍는다', async ({ page }) => {
  await openApp(page, { demo: false, art: ART_SEED });
  await enterHome(page);
  await expect(page.getByTestId('home-empty')).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${W2}/home-empty.png` });
});

/**
 * W2 — 이어서 바치는 홈과, `다시 바치기` 가 여는 확인 시트를 찍는다 (시안 결함 10).
 *
 * 이 두 장이 있어야 하는 이유가 있다. 시안의 홈은 `다시 바치기` 를 누르면 **아무것도 묻지
 * 않고** 오늘 바치던 자리를 지운다. 이 저장소가 그 앞에 확인 한 장을 세웠다는 것은 글로만
 * 적으면 확인할 수 없고, 사진은 그 단추가 이제 **묻기만 한다**는 것을 보여 준다.
 */
test('W2 · 이어서 바치는 홈과 다시 바치기 확인 시트를 찍는다', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);
  await enterPrayerFromHome(page);
  await page.clock.runFor(40000);
  await freezeClock(page);
  await leavePrayer(page, 'pause');

  await expect(page.getByTestId('home-session-where')).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${W2}/home-resume.png` });

  await page.getByTestId('home-again').click();
  await expect(page.getByTestId('sheet-again')).toBeVisible();
  await page.waitForTimeout(400); // 올라오는 움직임이 끝난 뒤에 찍는다
  await page.screenshot({ path: `${W2}/home-again-sheet.png` });
});

/**
 * W2 슬라이스 B — 오늘의 신비와 신비 해설, 그리고 새 어법으로 옮긴 시트.
 *
 * 세 장 모두 **홈에서 눌러 들어간 자리에서** 찍는다. 주소를 직접 열고 찍으면 배선이 없어도
 * 사진이 나오므로, 사진 자체가 "닿을 수 있다"의 증거가 되게 하려는 것이다.
 *
 * 셋째 장(`sheet-leave.png`)이 여기 있는 까닭을 적어 둔다. W1 이 남긴
 * `docs/plan/w1-screens/pray-leave.png` 은 **옛 한지 벌의 시트**가 어두운 기도 화면 위에
 * 겉돌던 그 상태의 기록이고(그것이 Q-56 이 태어난 자리다), 그 자리를 다시 찍으면 W1 의
 * 기록이 덮인다. 그래서 고친 뒤의 모습은 이 폴더에 따로 남긴다 — 두 장을 나란히 놓으면
 * 무엇이 바뀌었는지 한눈에 보인다.
 */
test('W2 · 오늘의 신비와 신비 해설을 찍는다', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);

  // 오늘의 신비 — 홈의 `오늘의 신비 보기` 를 눌러 들어간다.
  await page.getByTestId('home-today-link').click();
  await expect(page.getByTestId('mystery-set')).toHaveText('고통의 신비');
  await page.waitForTimeout(400); // 성화가 떠오르는 움직임이 끝난 뒤에 찍는다
  await page.screenshot({ path: `${W2}/mystery.png` });

  // 신비 해설 — 그 화면의 링크를 눌러 들어간다.
  await page.getByTestId('mystery-guide-link').click();
  await expect(page.getByTestId('guide-set')).toHaveText('고통의 신비');
  await page.screenshot({ path: `${W2}/guide.png` });
});

test('W2 · 새 어법으로 옮긴 시트를 기도 화면 위에서 찍는다', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);
  await enterPrayerFromHome(page);

  await page.getByTestId('pray-back').click();
  await expect(page.getByTestId('sheet-leave')).toBeVisible();
  await page.waitForTimeout(400); // 올라오는 움직임이 끝난 뒤에 찍는다
  await page.screenshot({ path: `${W2}/sheet-leave.png` });
});


/**
 * W2 슬라이스 C — 새 어법으로 옮긴 설정과, 새로 세운 지역·언어 화면.
 *
 * 세 장 모두 **아래 탭 바와 줄을 눌러 들어간 자리에서** 찍는다. 주소를 직접 열고 찍으면
 * 배선이 없어도 사진이 나오므로, 사진 자체가 "닿을 수 있다"의 증거가 되게 하려는 것이다.
 *
 * 셋째 장(`region-southamerica.png`)이 있는 까닭을 적어 둔다. 지역을 고르는 일은 **앱의
 * 얼굴을 통째로 바꾸는 일**인데, 한 지역만 찍으면 그 사실이 사진에 담기지 않는다. 남미를
 * 고른 뒤의 같은 화면을 한 장 더 두면 종이색·강조색·대표 성화가 함께 옮겨 간 것이 보이고,
 * 동시에 **언어 줄이 그대로 `한국어` 에 서 있는 것**(시안의 결함 9 를 고친 자리)도 보인다.
 */
test('W2 슬라이스 C · 설정과 지역·언어 화면을 찍는다', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);

  /*
    설정 — 아래 탭 바로 들어간다.

    **여기서 사진은 더 찍지 않는다 (2026-09-18, W3 슬라이스 C 에서 얼렸다).** `w2-screens/settings.png`
    은 W2 가 세운 설정 화면의 기록인데, 슬라이스 C 가 그 화면 아래쪽에 줄 둘(기록 내보내기 ·
    들여오기)을 더하면서 계속 찍으면 그 기록이 덮인다 — 실제로 한 번 덮여 화면 맨 아래에 새 줄이
    걸쳐 나왔다. 재던 판정문은 그대로 두고 **사진을 남기는 줄만 뺐다.** 이 폴더가 `gallery.png` 과
    `pray-leave.png` 에 이미 쓴 처방과 같으며, 새 두 줄이 선 설정의 사진은 `w3-screens/settings-backup.png`
    에 있다.
  */
  await openSettings(page);
  await expect(page.getByTestId('settings-region-value')).toHaveText('한국 · 한국어');

  // 지역·언어 — 설정의 맨 위 줄을 눌러 들어간다.
  await page.getByTestId('settings-region').click();
  await expect(page.getByTestId('region-screen')).toBeVisible();
  await page.waitForTimeout(400); // 대표 성화 다섯이 다 뜬 뒤에 찍는다
  await page.screenshot({ path: `${W2}/region.png` });

  // 남미를 고른 뒤의 같은 화면 — 색 벌이 옮겨 가고 언어는 그대로다.
  await page.getByTestId('region-southamerica').click();
  await expect(page.getByTestId('language-ko-tag')).toHaveText('지금');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${W2}/region-southamerica.png` });
});


/**
 * W3 슬라이스 A — 새 시안의 어법으로 다시 세운 여정 화면 (통과 조건 4).
 *
 * 넉 장을 찍는다. 줄이 **접힌** 목록, 줄이 **펴진** 목록을 **390 과 320 두 너비**에서, 그리고
 * 여정이 하나도 없을 때의 화면이다.
 *
 * **두 너비를 찍는 까닭**이 날짜 격자에 있다. 시안은 27칸이 넘는 격자를 열여덟 열로 그리는데
 * 320px 에서는 칸 하나가 11.33px 이 되어 칠해진 칸·오늘 칸·빈 칸을 가를 수 없다. 그래서 이
 * 저장소는 아홉 열로 통일했고(`docs/plan/w3-work-order.md` §1-1), 두 너비의 사진이 나란히
 * 있어야 그 판단이 옳았는지를 사람이 눈으로 확인할 수 있다.
 *
 * 모두 **아래 탭 바를 눌러 들어간 자리에서** 찍는다. 주소를 직접 열고 찍으면 배선이 없어도
 * 사진이 나오므로, 사진 자체가 "닿을 수 있다"의 증거가 되게 하려는 것이다.
 */
test('W3 · 여정 화면을 접힌 것과 펴진 것으로, 두 너비에서 찍는다', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);

  // 접힌 목록 — 줄 하나, 진행선, 그리고 아래쪽의 `새 여정 시작` 이 한 화면에 든다.
  await openJourneys(page);
  await expect(page.getByTestId('journey-title-0')).toHaveText('어머니 병환 회복');
  await expect(page.getByTestId('journey-grid-0')).toHaveCount(0);
  await page.screenshot({ path: `${W3}/journeys.png` });

  // 펴진 줄 — 54칸 격자가 아홉 열 여섯 줄로 선다.
  await page.getByTestId('journey-row-0').click();
  await expect(page.getByTestId('journey-grid-0').locator('> div')).toHaveCount(54);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${W3}/journeys-open-390.png` });

  // 같은 격자를 시안이 요구하는 최소 너비에서 한 번 더.
  await page.setViewportSize({ width: 320, height: 844 });
  await page.waitForTimeout(300);
  await expect(page.getByTestId('journey-grid-0').locator('> div')).toHaveCount(54);
  await page.screenshot({ path: `${W3}/journeys-open-320.png` });
});

test('W3 · 여정이 하나도 없는 여정 화면을 찍는다', async ({ page }) => {
  await openApp(page, { demo: false, art: ART_SEED });
  await enterHome(page);
  await openJourneys(page);
  await expect(page.getByTestId('journey-empty')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${W3}/journeys-empty.png` });
});

/**
 * W3 슬라이스 A — 새 어법으로 옮긴 여정 완주 화면.
 *
 * `page.reload()` 가 아니라 `reopenApp` 을 쓰는 까닭은 `decisions.md` Q-57 이다 — 다시
 * 고치면 주소에서 성화 씨앗 손잡이가 떨어져 뽑기가 난수로 돌아가고, 그래서 이 한 장만
 * 돌릴 때마다 그림이 달라졌다. 잰 내용은 `e2e/support/harness.ts` 의 그 함수 위에 있다.
 */
test('W3 · 여정 완주 화면을 찍는다', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);
  await reopenApp(page, { at: new Date('2026-10-06T09:00:00'), art: ART_SEED });
  await expect(page.getByTestId('home-card-meta-0')).toHaveText('54일째 · 감사');
  await enterPrayerFromHome(page);
  await runUntilVisible(page, 'all-done-screen');
  await expect(page.getByTestId('all-done-screen')).toBeVisible();
  await page.waitForTimeout(400); // 성화가 떠오르는 움직임이 끝난 뒤에 찍는다
  await page.screenshot({ path: `${W3}/all-done.png` });
});

/**
 * W3 슬라이스 B — 성화 갤러리 석 장.
 *
 * 탭 셋 중 둘(지역 · 모든 성화)과 아무것도 담지 않은 즐겨찾기 탭을 찍는다. 셋째 장이
 * 필요한 이유는 **시안이 그 상태를 그리지 않았기** 때문이다 — 빈 화면을 그냥 두면 고장으로
 * 읽히므로 이 저장소가 한 줄을 파생했고, 그 판단은 글이 아니라 사진으로 확인돼야 한다.
 *
 * 모두 **아래 탭 바를 눌러 들어간 자리에서** 찍는다. 주소를 직접 열고 찍으면 배선이 없어도
 * 사진이 나오므로, 사진 자체가 "닿을 수 있다"의 증거가 되게 하려는 것이다.
 */
test('W3 · 성화 갤러리를 탭 셋 중 둘과 빈 즐겨찾기로 찍는다', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);

  await tapTab(page, 'gallery');
  await expect(page.getByTestId('gallery-screen')).toBeVisible();

  // 지역 탭 — 한국이 쓰는 일곱 장이 2열 격자에 선다.
  await expect(page.getByTestId('gallery-tab-region')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-testid^="gallery-open-"]')).toHaveCount(7);
  await page.waitForTimeout(400); // 그림이 떠오르는 움직임이 끝난 뒤에 찍는다
  await page.screenshot({ path: `${W3}/gallery-region.png` });

  // 모든 성화 탭 — 표에 오른 열여섯 장 전부.
  await page.getByTestId('gallery-tab-all').click();
  await expect(page.locator('[data-testid^="gallery-open-"]')).toHaveCount(16);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${W3}/gallery-all.png` });

  // 즐겨찾기 탭 — 아직 비어 있다 (시안에 없는 자리).
  await page.getByTestId('gallery-tab-favorites').click();
  await expect(page.getByTestId('gallery-empty')).toBeVisible();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${W3}/gallery-favorites-empty.png` });
});

/**
 * W3 슬라이스 B — 전체 화면 감상 두 장.
 *
 * 껍데기가 **보일 때**와 **사라졌을 때**를 나란히 남긴다. 두 장이 함께 있어야 "그림을
 * 누르면 껍데기가 사라진다"(시안의 `toggleViewUi`)가 눈으로 확인되고, 사라진 쪽에서
 * 그림이 조금도 달라지지 않은 것도 함께 보인다.
 *
 * 갤러리에서 그림을 눌러 들어간다 — 탭 바로 갤러리에 닿고 거기서 한 번 더 누르는 길이
 * 사람이 실제로 지나는 길이기 때문이다.
 */
test('W3 · 전체 화면 감상을 껍데기가 보일 때와 사라졌을 때로 찍는다', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);

  await tapTab(page, 'gallery');
  const first = page.locator('[data-testid^="gallery-open-"]').first();
  const testId = await first.getAttribute('data-testid');
  const id = testId!.replace('gallery-open-', '');
  await first.click();

  await expect(page.getByTestId('art-screen')).toBeVisible();
  await expect(page.getByTestId('art-title')).toBeVisible();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${W3}/art-view.png` });

  // 그림을 누르면 닫기 단추와 아래 띠가 사라진다.
  await page.getByTestId(`art-image-${id}`).click();
  await expect(page.getByTestId('art-close')).toHaveCount(0);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${W3}/art-view-bare.png` });
});

/**
 * W3 슬라이스 C — 설정에 선 기록 내보내기·들여오기 두 줄과, 들여오기 확인 시트.
 *
 * 두 장을 찍는다. 설정 화면의 두 줄이 보이는 자리와, 파일을 고른 뒤에 뜨는 확인 시트다.
 *
 * **둘째 장이 이 슬라이스의 핵심 증거다.** 들여오기는 되돌릴 수 없는 조작인데, 그 앞에 관문을
 * 세웠다는 것은 글로만 적으면 확인할 수 없다. 사진에는 시트가 잃을 것과 얻을 것을 **수로**
 * 말하는 것이 그대로 찍히므로, 이 앱이 "정말 하시겠습니까" 로 묻지 않는다는 것이 보인다.
 *
 * **아래 탭 바의 `설정` 을 눌러 들어간 자리에서 찍는다.** 주소를 직접 열고 찍으면 배선이
 * 없어도 사진이 나오므로, 사진 자체가 "닿을 수 있다"의 증거가 되게 하려는 것이다.
 */
test('W3 슬라이스 C · 기록 내보내기·들여오기 두 줄과 확인 시트를 찍는다', async ({ page }) => {
  await openApp(page, { art: ART_SEED });
  await enterHome(page);
  await openSettings(page);

  /*
    두 줄은 설정의 아래쪽에 있어 첫 화면에 들어오지 않는다. 사람이 하는 그대로 굴려 내린 뒤에
    찍는다 — 사진이 담아야 하는 것은 화면의 맨 위가 아니라 이번에 세운 두 줄이다.

    굴려 내리는 목표를 두 줄이 아니라 **맨 아래 줄(`소개`)** 로 잡은 까닭이 있다. 첫 줄만
    보이게 굴리면 그 줄이 화면의 맨 아래에 걸쳐 서고 둘째 줄은 잘려 나간다 — 실제로 처음
    찍은 사진이 그랬다. 마지막 줄까지 굴리면 두 줄이 함께 화면 안에 들어오므로, 찍기 전에
    둘 다 화면 안에 있는지를 `toBeInViewport` 로 못 박는다.
  */
  await page.getByTestId('settings-about').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('settings-export')).toBeInViewport();
  await expect(page.getByTestId('settings-import')).toBeInViewport();
  await expect(page.getByTestId('settings-export')).toContainText('여정 1개와 설정을 파일 하나로');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${W3}/settings-backup.png` });

  // 확인 시트 — 파일을 하나 골라 준 뒤에 뜬다.
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('settings-import').click();
  const file = {
    kind: 'myrosary.backup',
    version: 1,
    exportedAt: '2026-09-05T00:00:00.000Z',
    journeys: [
      {
        id: 'j1',
        title: '어머니 병환 회복',
        format: 'fiftyfour',
        startDate: '2026-08-14',
        days: ['prayed'],
        kind: 'petition',
        recitation: 'alternate',
      },
      {
        id: 'j2',
        title: '아버지를 위하여',
        format: 'novena9',
        startDate: '2026-09-01',
        days: ['prayed'],
        kind: 'petition',
        recitation: 'alternate',
      },
    ],
    settings: {},
    pinnedArt: null,
    favoriteArt: [],
  };
  await (
    await chooser
  ).setFiles({
    name: 'myrosary-backup-2026-09-05.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(file), 'utf-8'),
  });

  await expect(page.getByTestId('sheet-import')).toBeVisible();
  await page.waitForTimeout(400); // 올라오는 움직임이 끝난 뒤에 찍는다
  await page.screenshot({ path: `${W3}/settings-import-sheet.png` });
});
