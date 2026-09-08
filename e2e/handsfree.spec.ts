/**
 * 손 없이 조작 e2e — 이어폰 단추와 흔들기가 실제로 알을 넘기는가 (FR-38).
 *
 * 시계를 세워 두고 시험한다. 시간이 흐르면 앱이 스스로도 알을 넘기므로 "무엇 때문에
 * 넘어갔는지"를 가릴 수 없기 때문이다. 시계가 서 있으면 알이 움직인 이유는 하나뿐이다.
 */
import { expect, test } from '@playwright/test';
import {
  collectConsoleErrors,
  installDeviceStubs,
  pressMediaButton,
  shakeDevice,
} from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 첫 화면에서 눌러 기도 화면까지 간 뒤, 시간을 세운 채로 돌려준다. */
async function enterPrayer(page: import('@playwright/test').Page) {
  await page.clock.install();
  await installDeviceStubs(page);
  await page.goto('/');
  await page.getByTestId('login-google').click();
  await expect(page.getByTestId('pray-screen')).toBeVisible();
  await expect(page.getByTestId('pray-a')).toContainText('성부와 성자와 성령의 이름으로');
}

test('이어폰의 다음·이전 단추가 알을 하나씩 옮긴다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await enterPrayer(page);

  await pressMediaButton(page, 'nexttrack');
  await expect(page.getByTestId('pray-a')).toContainText('전능하신 천주 성부');
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 사도신경');

  await pressMediaButton(page, 'previoustrack');
  await expect(page.getByTestId('pray-a')).toContainText('성부와 성자와 성령의 이름으로');

  expect(errors).toEqual([]);
});

test('폰을 흔들면 다음 알로 넘어간다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await enterPrayer(page);

  // 첫 번째 흔들림은 브라우저가 "이 기기에 움직임 센서가 있다"고 판정하는 데 쓰인다.
  // 그다음 흔들림부터 앱이 받는다.
  for (let i = 0; i < 4; i++) {
    await shakeDevice(page);
    await page.waitForTimeout(120);
  }

  await expect(page.getByTestId('pray-a')).toContainText('전능하신 천주 성부');
  expect(errors).toEqual([]);
});
