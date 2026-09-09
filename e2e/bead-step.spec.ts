/**
 * 한 알씩 넘기기 e2e — `decisions.md` 결정 6 이 만들고 결정 8 이 한 알씩으로 바꾼 줄.
 *
 * 여기서 확인하는 것은 셋이다. 첫째, 기도 화면에 들어서면 그 조작이 **이미 보이고**
 * 눌리는가. 둘째, 한 번 누를 때 정확히 **한 단계만** 움직이는가. 셋째, 옮긴 자리가 앱을
 * 닫았다 열어도 남는가.
 *
 * 이 파일의 옛 이름은 `decade-jump.spec.ts` 였고 내용도 "단을 통째로 뛴다"였다. 결정 8 이
 * 그 조작을 없애 화면에서 부를 수 있는 길이 사라졌으므로, 시험도 지금 화면이 실제로 하는
 * 일로 바꿨다. 단 단위로 뛰는 규칙 자체는 `src/prayer/sections.test.ts` 가 그대로 지킨다.
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

test('앞뒤 단추가 한 번에 한 단계씩 움직인다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  const step = page.getByTestId('pray-step');
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await expect(step).toHaveText('시작 기도 · 성호경');

  // 조작은 스크롤하지 않아도 처음부터 보인다.
  await expect(page.getByTestId('pray-step-nav')).toBeInViewport();

  // 첫 단계에서는 앞으로 갈 데가 없다 — 감추지 않고 흐리게 둔다.
  await expect(page.getByTestId('pray-previous-step')).toContainText('여기가 처음');

  // 단추는 갈 곳의 기도문 이름을 미리 적어 둔다. 성호경 다음은 십자가에 입맞춤이다.
  await expect(page.getByTestId('pray-next-step')).toContainText('십자가에 입맞춤');

  // 한 번 누르면 딱 한 단계. 시작 기도의 여덟 단계를 차례로 밟는다.
  const opening = [
    '시작 기도 · 십자가에 입맞춤',
    '시작 기도 · 사도신경',
    '시작 기도 · 주님의 기도',
    '시작 기도 · 성모송',
  ];
  for (const head of opening) {
    await page.getByTestId('pray-next-step').click();
    await expect(step).toHaveText(head);
  }

  // 되돌아가는 것도 한 단계씩이다.
  await page.getByTestId('pray-previous-step').click();
  await expect(step).toHaveText('시작 기도 · 주님의 기도');

  expect(errors).toEqual([]);
});

test('알을 옮긴 뒤 앱을 닫았다 열면 그 자리에서 이어진다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);

  for (let i = 0; i < 3; i++) await page.getByTestId('pray-next-step').click();
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 주님의 기도');

  // 앱을 닫았다 여는 것과 같다 — 첫 화면부터 다시 들어온다.
  await page.goto('/?demo=1');
  await enterHome(page);
  await enterPrayerFromHome(page);

  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 주님의 기도');
  expect(errors).toEqual([]);
});

test('앞뒤로 되짚어도 하루를 마칠 수 있다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);

  // 두 걸음 나아갔다 한 걸음 되짚는다 — 잘 못 들은 절을 다시 듣는 실제 사용이다.
  await page.getByTestId('pray-next-step').click();
  await page.getByTestId('pray-next-step').click();
  await page.getByTestId('pray-previous-step').click();
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 십자가에 입맞춤');

  await runUntilVisible(page, 'day-done-screen');
  await expect(page.getByTestId('day-done-screen')).toBeVisible();
  // 되짚어도 성모송은 실제로 바친 쉰셋 그대로다 (같은 자리를 두 번 세지 않는다).
  await expect(page.getByTestId('day-done-hails')).toHaveText('53번');

  expect(errors).toEqual([]);
});
