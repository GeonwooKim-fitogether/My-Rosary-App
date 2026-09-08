/**
 * 화면 사진 — 사람이 눈으로 볼 수 있게 두 화면을 찍어 저장소에 남긴다.
 *
 * 크기는 390×844 다. v5 시안이 그 크기의 기기 틀로 그려졌기 때문이고, 화면 크기는
 * 브라우저 창 크기가 아니라 Playwright 의 `viewport` 로 정한다 — 헤드리스 크로미움의
 * `--window-size` 는 배치에 쓰이는 크기와 1대1로 맞지 않아 잘린 그림이 나오는 것을
 * 이 저장소에서 실측했다. 화소 배율은 2 로 두어 실제 폰과 같은 촘촘함으로 찍는다.
 */
import { expect, test } from '@playwright/test';
import { installDeviceStubs, pressMediaButton } from './support/harness';

const SHOTS = 'docs/plan/m1-screens';

/**
 * 기도 화면은 **v5 시안이 보여 주는 것과 같은 단계**에서 찍는다 — 제3단의 네 번째 알
 * (77단계 중 41번째, 자리 번호 40). 시안이 그 단계를 그려 두었으므로 같은 단계를 찍어야
 * 나란히 놓고 대조할 수 있다. 거기까지는 이어폰 다음 단추를 눌러 빠르게 옮긴다.
 */
test('기도 화면을 찍는다 — v5 시안과 같은 단계에서', async ({ page }) => {
  await installDeviceStubs(page);
  await page.goto('/');
  await page.getByTestId('login-google').click();
  await expect(page.getByTestId('pray-screen')).toBeVisible();
  await expect(page.getByTestId('pray-a')).toContainText('성부와 성자와 성령의 이름으로');

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

  // 알이 한 번 숨을 쉬는 사이. 사진이 숨의 중간쯤에 걸리게 한다.
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${SHOTS}/pray.png` });
});

test.describe('하루 완주 화면', () => {
  // 77단계를 실제로 다 지나야 닿는 화면이라 시간을 앞당겨 돌린다. 그 동안 알이 매
  // 프레임 숨을 쉬면 시험이 하염없이 느려지므로 움직임을 끈다. 이 화면 자체에는
  // 움직이는 것이 없어 사진은 달라지지 않는다.
  test.use({ reducedMotion: 'reduce' });

  test('하루 완주 화면을 찍는다', async ({ page }) => {
    await page.clock.install();
    await installDeviceStubs(page);
    await page.goto('/');
    await page.getByTestId('login-google').click();
    await expect(page.getByTestId('pray-screen')).toBeVisible();

    const dayDone = page.getByTestId('day-done-screen');
    for (let i = 0; i < 300; i++) {
      if (await dayDone.isVisible()) break;
      await page.clock.runFor(5000);
    }
    await expect(dayDone).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/day-done.png` });
  });
});
