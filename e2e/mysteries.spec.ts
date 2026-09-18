/**
 * 오늘의 신비 · 신비 해설 e2e — 두 화면에 **클릭만으로 닿는가**, 그리고 무엇을 보여 주는가
 * (W2 슬라이스 B).
 *
 * 화면을 만들었다는 사실은 아무것도 증명하지 못한다. 이 저장소가 겪은 사고가 정확히 그
 * 모양이었다 — 만들어 두고 부르는 곳이 없어 화면에 한 번도 나타나지 않는 것. 그래서 이
 * 시험은 **홈에서 출발해** 링크를 눌러 들어간다. 주소를 직접 치고 들어가면 배선이 없어도
 * 통과하므로 그렇게 하지 않는다.
 *
 * 함께 붙드는 것이 하나 더 있다. **오늘의 신비를 정하는 규칙이 시안의 것이 아니라 이
 * 저장소의 것인가.** 본보기 여정이 서 있는 2026년 9월 5일은 **토요일**이고, 시안이 아는
 * 요일 규칙대로면 그날은 `환희의 신비` 다. 그런데 이 앱의 54일 기도는 요일이 아니라
 * **며칠째인가**로 신비를 돌리고(FR-43), 23일째는 `고통의 신비` 다. 화면이 `고통의 신비`
 * 라고 말하면 규칙을 새로 쓰지 않고 이미 있는 엔진(`src/domain/mysteries.ts`)을 불렀다는
 * 뜻이고, `환희의 신비` 라고 말하면 시안의 규칙이 슬쩍 들어온 것이다.
 */
import { expect, test } from '@playwright/test';
import { collectConsoleErrors, enterHome, openApp } from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 2026-09-05 은 토요일이고, 본보기 여정은 그날 23일째다 (54일 순환에서 고통의 신비). */
const TODAY_SET = '고통의 신비';
/** 같은 날을 시안의 요일 규칙으로 읽으면 나오는 벌. 이것이 보이면 규칙이 바뀐 것이다. */
const WEEKDAY_SET = '환희의 신비';

test('홈에서 눌러 오늘의 신비로 들어가고, 거기서 신비 해설로 간다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);

  // 홈이 오늘의 신비로 무엇을 말하고 있나 — 아래 화면이 같은 것을 말해야 한다.
  await expect(page.getByTestId('home-today-set')).toHaveText(TODAY_SET);

  // ── 홈 → 오늘의 신비. 주소를 치지 않고 링크를 누른다. ──────────────────────
  await page.getByTestId('home-today-link').click();
  await expect(page.getByTestId('mystery-screen')).toBeVisible();

  await expect(page.getByTestId('mystery-label')).toHaveText('오늘의 신비');
  await expect(page.getByTestId('mystery-set')).toHaveText(TODAY_SET);
  await expect(page.getByTestId('mystery-set')).not.toHaveText(WEEKDAY_SET);
  await expect(page.getByTestId('mystery-date')).toHaveText('9월 5일 토요일');

  // 다섯 단이 번호와 성경 구절과 함께 선다.
  for (let n = 1; n <= 5; n++) {
    await expect(page.getByTestId(`mystery-row-${n}`)).toBeVisible();
  }
  await expect(page.getByTestId('mystery-row-1')).toContainText(
    '예수님께서 우리를 위하여 피땀 흘리심',
  );
  await expect(page.getByTestId('mystery-row-1')).toContainText('Lk 22:39-46');

  // 첫 단은 홈이 한 줄로 보여 주던 바로 그 글이다 — 두 화면이 같은 말을 한다.
  await expect(page.getByTestId('mystery-row-1')).toContainText(
    (await page.getByTestId('home-today-first').first().textContent()) ?? '',
  );

  // ── 오늘의 신비 → 신비 해설. 시안에는 없던 길이다 (시안의 해설 화면은 닿지 않는다). ──
  await page.getByTestId('mystery-guide-link').click();
  await expect(page.getByTestId('guide-screen')).toBeVisible();
  await expect(page.getByTestId('guide-label')).toHaveText('신비 해설');

  // 아무것도 고르지 않았으면 오늘의 벌이 펼쳐져 있다.
  await expect(page.getByTestId('guide-set')).toHaveText(TODAY_SET);
  await expect(page.getByTestId('guide-row-1')).toContainText('성경 · Lk 22:39-46');
  // 해설 한 문단이 실제로 붙어 온다 (빈 줄이면 화면은 조용히 빈 채로 그린다).
  await expect(page.getByTestId('guide-row-1')).toContainText(
    '겟세마니에서 땀이 피처럼 떨어질 때까지 기도하십니다',
  );

  // ── 뒤로 두 번이면 홈이다. ────────────────────────────────────────────────
  await page.getByTestId('guide-back').click();
  await expect(page.getByTestId('mystery-screen')).toBeVisible();
  await page.getByTestId('mystery-back').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();

  expect(errors).toEqual([]);
});

test('신비 해설에서 네 벌을 갈아 끼우고, 오늘과 다른 벌을 고르면 그 사실을 알려 준다', async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await page.getByTestId('home-today-link').click();
  await page.getByTestId('mystery-guide-link').click();
  await expect(page.getByTestId('guide-screen')).toBeVisible();

  // 오늘의 벌이 서 있는 동안에는 단추가 무엇을 여는지 되물을 것이 없다.
  await expect(page.getByTestId('guide-today-note')).toHaveCount(0);

  // 환희로 갈아 끼운다 — 제목·줄·성경 구절이 함께 바뀐다.
  await page.getByTestId('guide-tab-joyful').click();
  await expect(page.getByTestId('guide-set')).toHaveText('환희의 신비');
  await expect(page.getByTestId('guide-row-1')).toContainText('마리아님께서 예수님을 잉태하심');
  await expect(page.getByTestId('guide-row-1')).toContainText('성경 · Lk 1:26-38');

  /*
    이 한 줄이 이 시험의 핵심이다. 시안은 여정이 없는 앱이라 고른 벌을 그 자리에서 바치기
    시작하지만, 이 앱에서 하루의 신비는 여정의 형식이 정한다(FR-43). 그래서 단추는 오늘의
    기도로 들어가고, 고른 벌이 오늘의 벌과 다르면 그 사실을 밝힌다.
  */
  await expect(page.getByTestId('guide-today-note')).toHaveText(
    `오늘 바치는 것은 ${TODAY_SET}입니다.`,
  );

  // 영광 · 빛도 갈아 끼워진다.
  await page.getByTestId('guide-tab-glorious').click();
  await expect(page.getByTestId('guide-set')).toHaveText('영광의 신비');
  await page.getByTestId('guide-tab-luminous').click();
  await expect(page.getByTestId('guide-set')).toHaveText('빛의 신비');

  // 오늘의 벌로 돌아오면 알림이 사라진다.
  await page.getByTestId('guide-tab-sorrowful').click();
  await expect(page.getByTestId('guide-set')).toHaveText(TODAY_SET);
  await expect(page.getByTestId('guide-today-note')).toHaveCount(0);

  expect(errors).toEqual([]);
});

test('신비 해설의 `이 신비로 기도하기` 는 그 여정의 오늘 기도로 들어간다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await page.getByTestId('home-today-link').click();
  await page.getByTestId('mystery-guide-link').click();

  await expect(page.getByTestId('guide-pray')).toHaveText('이 신비로 기도하기');
  await page.getByTestId('guide-pray').click();

  // 본보기 여정의 오늘 기도다 — 머리에 그 여정의 바람과 며칠째가 선다.
  await expect(page.getByTestId('pray-title')).toContainText('어머니 병환 회복');
  await expect(page.getByTestId('pray-title')).toContainText('23일째');

  expect(errors).toEqual([]);
});

test('여정이 하나도 없으면 두 화면이 요일 규칙으로 서고 단추가 새 기도로 간다', async ({
  page,
}) => {
  const errors = collectConsoleErrors(page);
  await openApp(page, { demo: false });
  await enterHome(page);

  // 여정이 없으므로 54일 순환이 성립하지 않고, 요일 규칙이 대신 선다 (9월 5일은 토요일).
  await page.getByTestId('home-today-link').click();
  await expect(page.getByTestId('mystery-set')).toHaveText(WEEKDAY_SET);
  await expect(page.getByTestId('mystery-primary')).toHaveText('새 기도');

  await page.getByTestId('mystery-guide-link').click();
  await expect(page.getByTestId('guide-set')).toHaveText(WEEKDAY_SET);
  await expect(page.getByTestId('guide-pray')).toHaveText('새 기도');
  await page.getByTestId('guide-pray').click();
  await expect(page.getByTestId('new-screen')).toBeVisible();

  expect(errors).toEqual([]);
});
