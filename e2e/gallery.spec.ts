/**
 * 성화 갤러리와 전체 화면 감상 e2e — W3 지시서 §3 의 통과 조건 3.
 *
 * 이 시험이 무엇을 지키는지 먼저 적는다. 갤러리는 **화면이 섰다는 사실만으로는 아무것도
 * 증명하지 못한다.** 격자가 보이는 것과, 하트를 눌러 담은 그림이 `즐겨찾기` 탭에 실제로
 * 모이는 것과, 감상 화면에서 고정한 그림이 **홈의 큰 그림으로 서는 것**은 서로 다른
 * 문제이고, 마지막 하나가 이 슬라이스에서 가장 멀리 배선된 자리다 — 갤러리에서 누른
 * 단추가 저장 자리를 거쳐 성화 뽑기를 다시 열고, 그 뽑기가 홈의 그림을 정한다.
 *
 * 그래서 시험은 **아래 탭 바를 눌러** 갤러리에 들어가고, 끝에는 홈으로 돌아와 그림이
 * 바뀐 것을 확인한다. 주소를 직접 열면 배선이 없어도 통과하므로 그렇게 하지 않는다.
 *
 * **어느 그림인가를 어떻게 재나.** 화면이 건 그림은 눈으로만 알 수 있으므로, 홈·갤러리·감상
 * 세 화면이 표식에 그림의 번호를 싣는다(`home-art-10` · `gallery-open-10` · `art-image-10`).
 * 시험은 그 번호를 읽어 세 화면이 같은 그림을 말하는지 대조한다.
 */
import { expect, test, type Page } from '@playwright/test';
import { collectConsoleErrors, enterHome, openApp, tapTab } from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 사진을 찍는 시험들과 같은 씨앗. 어느 그림이 어느 자리에 서는지가 매번 같아진다. */
const ART_SEED = 20260918;

/** 홈이 지금 걸고 있는 그림의 번호. 표식 `home-art-<번호>` 에서 읽는다. */
async function homePlateId(page: Page): Promise<string> {
  const testId = await page.locator('[data-testid^="home-art-1"], [data-testid^="home-art-0"]').first().getAttribute('data-testid');
  expect(testId).not.toBeNull();
  return testId!.replace('home-art-', '');
}

/** 갤러리 격자에 선 그림들의 번호. */
async function galleryPlateIds(page: Page): Promise<string[]> {
  const handles = page.locator('[data-testid^="gallery-open-"]');
  const count = await handles.count();
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const testId = await handles.nth(i).getAttribute('data-testid');
    if (testId) ids.push(testId.replace('gallery-open-', ''));
  }
  return ids;
}

test('갤러리의 탭 셋을 오가고, 하트로 담은 그림이 즐겨찾기 탭에 모인다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page, { art: ART_SEED });
  await enterHome(page);

  await tapTab(page, 'gallery');
  await expect(page.getByTestId('gallery-screen')).toBeVisible();

  /*
    지역 탭 — 기본 지역(한국)이 쓰는 일곱 장이다. 표가 정한 수와 같은지 세어,
    탭이 고르는 목록이 시안의 `galIds` 와 어긋나면 여기서 걸리게 한다.
  */
  await expect(page.getByTestId('gallery-tab-region')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-testid^="gallery-open-"]')).toHaveCount(7);

  // 모든 성화 탭 — 표에 오른 열여섯 장 전부.
  await page.getByTestId('gallery-tab-all').click();
  await expect(page.locator('[data-testid^="gallery-open-"]')).toHaveCount(16);

  // 즐겨찾기 탭 — 아직 아무것도 담지 않았으므로 격자 대신 한 줄이 선다 (시안에 없는 자리).
  await page.getByTestId('gallery-tab-favorites').click();
  await expect(page.getByTestId('gallery-grid')).toHaveCount(0);
  await expect(page.getByTestId('gallery-empty')).toBeVisible();

  // 지역 탭으로 돌아와 그림 하나를 담는다.
  await page.getByTestId('gallery-tab-region').click();
  await page.getByTestId('gallery-fav-12').click();
  await expect(page.getByTestId('gallery-fav-12')).toHaveAttribute('aria-pressed', 'true');

  // 담은 그 한 장이 즐겨찾기 탭에 모인다.
  await page.getByTestId('gallery-tab-favorites').click();
  await expect(page.getByTestId('gallery-empty')).toHaveCount(0);
  await expect(page.locator('[data-testid^="gallery-open-"]')).toHaveCount(1);
  await expect(page.getByTestId('gallery-title-12')).toHaveText('성모와 아기');

  // 하트를 한 번 더 누르면 빠지고, 탭은 다시 빈 상태로 돌아간다.
  await page.getByTestId('gallery-fav-12').click();
  await expect(page.getByTestId('gallery-empty')).toBeVisible();

  expect(errors).toEqual([]);
});

test('감상 화면에서 고정한 그림이 홈의 큰 그림이 된다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page, { art: ART_SEED });
  await enterHome(page);

  /*
    홈이 지금 걸고 있는 그림을 적어 둔다. 고정하려는 그림은 **그것이 아닌 다른 것**이어야
    한다 — 같은 그림을 고정하면 "바뀌었다"를 잴 수 없기 때문이다.
  */
  const before = await homePlateId(page);

  await tapTab(page, 'gallery');
  const ids = await galleryPlateIds(page);
  const target = ids.find((id) => id !== before);
  expect(target).toBeDefined();

  // 그림을 눌러 감상 화면으로 간다.
  await page.getByTestId(`gallery-open-${target}`).click();
  await expect(page.getByTestId('art-screen')).toBeVisible();
  await expect(page.getByTestId(`art-image-${target}`)).toBeVisible();
  await expect(page.getByTestId('art-pin')).toHaveText('고정');

  // 그림을 누르면 껍데기가 숨고, 한 번 더 누르면 돌아온다 (시안의 `toggleViewUi`).
  await page.getByTestId(`art-image-${target}`).click();
  await expect(page.getByTestId('art-close')).not.toBeVisible();
  await page.getByTestId(`art-image-${target}`).click();
  await expect(page.getByTestId('art-close')).toBeVisible();

  // 고정한다. 단추의 글자가 뒤집히고 아래 한 줄이 고정됐다고 말한다.
  await page.getByTestId('art-pin').click();
  await expect(page.getByTestId('art-pin')).toHaveText('고정 해제');
  await expect(page.getByTestId('art-meta')).toContainText('고정됨');

  // 닫으면 온 곳(갤러리)으로 돌아오고, 그 칸에 `고정됨` 표가 서 있다.
  await page.getByTestId('art-close').click();
  await expect(page.getByTestId('gallery-screen')).toBeVisible();
  await expect(page.getByTestId(`gallery-pinned-${target}`)).toBeVisible();

  /*
    **이 줄이 이 시험의 목적이다.** 갤러리에서 누른 단추가 저장 자리를 거쳐 성화 뽑기를
    다시 열었고, 홈이 그 뽑기에 물어 같은 그림을 건다. 하나라도 끊기면 여기서 걸린다.
  */
  await tapTab(page, 'home');
  await expect(page.getByTestId(`home-art-${target}`)).toBeVisible();

  expect(errors).toEqual([]);
});

test('홈의 전체 화면 단추가 지금 걸린 성화의 감상 화면을 연다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page, { art: ART_SEED });
  await enterHome(page);

  const id = await homePlateId(page);

  await page.getByTestId('home-art-view').click();
  await expect(page.getByTestId('art-screen')).toBeVisible();
  await expect(page.getByTestId(`art-image-${id}`)).toBeVisible();

  // 닫으면 홈으로 돌아온다 (쌓인 것을 한 장 걷어 낸다).
  await page.getByTestId('art-close').click();
  await expect(page.getByTestId('home-screen')).toBeVisible();

  expect(errors).toEqual([]);
});
