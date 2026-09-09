/**
 * 단 넘기기 e2e — `decisions.md` 결정 6.
 *
 * 여기서 확인하는 것은 셋이다. 첫째, 기도 화면에 들어서면 단을 넘기는 조작이 **이미
 * 보이고** 눌리는가. 둘째, 넘긴 자리가 앱을 닫았다 열어도 남는가. 셋째, 건너뛴 채로도
 * 하루를 마칠 수 있고 그때 성모송 수가 **실제로 바친 만큼**으로 적히는가.
 *
 * 시계는 세워 둔다. 시간이 흐르면 앱이 스스로도 알을 넘기므로 "무엇 때문에 옮겨졌는지"를
 * 가릴 수 없기 때문이다.
 */
import { expect, test } from '@playwright/test';
import {
  collectConsoleErrors,
  enterHome,
  enterPrayerFromHome,
  openApp,
  runUntilVisible,
} from './support/harness';

test.use({ reducedMotion: 'reduce' });

test('시작 기도에서도 제5단에서도 구간을 넘길 수 있다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 성호경');

  // 조작은 스크롤하지 않아도 처음부터 보인다.
  await expect(page.getByTestId('pray-decade-nav')).toBeInViewport();

  // 시작 기도에서는 앞으로 갈 데가 없다 — 감추지 않고 흐리게 둔다.
  await expect(page.getByTestId('pray-previous-decade')).toContainText('여기가 처음');

  // 한 번 누르면 제1단의 첫 단계, 곧 신비 선포로 간다.
  await page.getByTestId('pray-next-decade').click();
  await expect(page.getByTestId('pray-step')).toHaveText('제1단 · 신비 선포');

  // 네 번 더 누르면 제5단이다.
  for (const decade of [2, 3, 4, 5]) {
    await page.getByTestId('pray-next-decade').click();
    await expect(page.getByTestId('pray-step')).toHaveText(`제${decade}단 · 신비 선포`);
  }

  // 제5단 다음은 마침 기도다 — 결정 7 로 구간이 여섯에서 일곱이 됐다. 거기가 끝이다.
  await page.getByTestId('pray-next-decade').click();
  await expect(page.getByTestId('pray-step')).toHaveText('마침 기도 · 성모찬송');
  await expect(page.getByTestId('pray-next-decade')).toContainText('여기가 끝');

  // 되돌아가는 것도 같다.
  await page.getByTestId('pray-previous-decade').click();
  await expect(page.getByTestId('pray-step')).toHaveText('제5단 · 신비 선포');

  expect(errors).toEqual([]);
});

test('단을 넘긴 뒤 앱을 닫았다 열면 그 단에서 이어진다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);

  await page.getByTestId('pray-next-decade').click();
  await page.getByTestId('pray-next-decade').click();
  await expect(page.getByTestId('pray-step')).toHaveText('제2단 · 신비 선포');

  // 앱을 닫았다 여는 것과 같다 — 첫 화면부터 다시 들어온다.
  await page.goto('/?demo=1');
  await enterHome(page);
  await enterPrayerFromHome(page);

  await expect(page.getByTestId('pray-step')).toHaveText('제2단 · 신비 선포');
  expect(errors).toEqual([]);
});

test('건너뛴 채로도 하루를 마치고, 성모송은 실제로 바친 만큼만 적힌다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);

  // 시작 기도와 앞의 네 단을 건너뛰고 제5단만 바친다.
  for (let i = 0; i < 5; i++) await page.getByTestId('pray-next-decade').click();
  await expect(page.getByTestId('pray-step')).toHaveText('제5단 · 신비 선포');

  await runUntilVisible(page, 'day-done-screen');
  await expect(page.getByTestId('day-done-screen')).toBeVisible();

  // 제5단의 성모송 열 번만 바쳤다. 쉰세 번이라고 적으면 앱이 거짓을 말하는 것이다.
  await expect(page.getByTestId('day-done-hails')).toHaveText('10번');

  expect(errors).toEqual([]);
});
