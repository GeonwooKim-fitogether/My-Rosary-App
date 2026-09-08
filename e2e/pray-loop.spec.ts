/**
 * 기도 루프 e2e — 웹 빌드를 실제 브라우저로 열어 77단계를 끝까지 바치게 한다.
 *
 * 여기서 확인하는 것은 넷이다.
 *
 * 1. **닿는가** — 앱의 첫 화면에서 눌러서 기도 화면까지 간다. 주소를 직접 치지 않는다.
 * 2. **끝까지 가는가** — 아무도 손대지 않아도 77단계를 스스로 지나 하루 완주 화면에 닿는다.
 * 3. **기기에 말을 거는가** — 소리와 진동이 실제로 나는지가 아니라 요청되었는지를 센다.
 * 4. **조용한가** — 콘솔에 오류가 하나도 없다.
 */
import { expect, test } from '@playwright/test';
import { collectConsoleErrors, installDeviceStubs, readCalls } from './support/harness';

/* 숨쉬는 알의 움직임을 끈다. 가짜 시계로 시간을 크게 앞당길 때 애니메이션이 매 프레임
   깨어나면 시험이 하염없이 느려진다. v5 시안도 이 설정을 켠 기기에서는 숨쉬기를 멈춘다. */
test.use({ reducedMotion: 'reduce' });

test('로그인 화면에서 눌러 들어가 하루 77단계를 스스로 완주한다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.clock.install();
  await installDeviceStubs(page);

  await page.goto('/');
  await expect(page.getByTestId('login-google')).toBeVisible();

  // 1. 닿는가 — 첫 화면의 단추를 눌러 기도 화면으로.
  await page.getByTestId('login-google').click();
  await expect(page.getByTestId('pray-screen')).toBeVisible();
  await expect(page.getByTestId('pray-title')).toContainText('어머니 병환 회복');
  await expect(page.getByTestId('pray-title')).toContainText('23일째');
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 성호경');

  // 2. 끝까지 가는가 — 시간을 앞당기며 하루 완주 화면이 뜨기를 기다린다.
  const dayDone = page.getByTestId('day-done-screen');
  for (let i = 0; i < 300; i++) {
    if (await dayDone.isVisible()) break;
    await page.clock.runFor(5000);
  }
  await expect(dayDone).toBeVisible();
  await expect(page.getByTestId('day-done-head')).toHaveText('9월 5일 · 스물세 번째 날');
  await expect(page.getByTestId('day-done-summary')).toHaveText(
    '54일 중 22일 바쳤습니다 · 남은 30일',
  );

  // 3. 기기에 말을 거는가.
  const calls = await readCalls(page);
  expect(calls.speech.length).toBe(77); // 교대 낭송이므로 단계마다 앞 절 하나씩
  expect(calls.speech[0]).toContain('성부와 성자와 성령의 이름으로');
  // 마지막 단계는 제5단의 구원을 비는 기도. 교대 낭송이라 앱이 읽는 것은 앞 절이고,
  // 뒷 절("연옥 영혼을 도우시며…")은 사용자 몫이라 앱이 읽지 않는다.
  expect(calls.speech.at(-1)).toContain('저희를 지옥 불에서 구하시고');
  expect(calls.speech).not.toContain('연옥 영혼을 도우시며 가장 버림받은 영혼을 구원하소서.');
  // 단이 바뀔 때 다섯 번, 하루를 마칠 때 한 번.
  expect(calls.vibrate.filter((pattern) => pattern.length === 5)).toHaveLength(5);
  expect(calls.vibrate.filter((pattern) => pattern.length === 1 && pattern[0] === 200)).toHaveLength(1);
  // 이어폰 단추 넷이 걸려 있다.
  expect(new Set(calls.media)).toEqual(new Set(['play', 'pause', 'nexttrack', 'previoustrack']));

  // 4. 조용한가.
  expect(errors).toEqual([]);
});
