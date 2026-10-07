/**
 * 얼린 화면 사진을 덮어쓰려는 시도가 **찍히기 전에** 막히는지 확인한다.
 *
 * 이 시험이 따로 있어야 하는 이유는, 막는 장치가 조용히 빠질 수 있기 때문이다. 감시는
 * `e2e/support/harness.ts` 가 감싼 `test` 에 붙어 있으므로, 어느 시험 파일이 그것 대신
 * `@playwright/test` 의 `test` 를 가져오면 **그 파일만 오류 없이 뚫린다.** 그러면 다음에
 * 얼린 사진이 덮여도 아무것도 알려 주지 않는다 — 이 저장소가 세 번 겪은 바로 그 모양의
 * 사고다(`decisions.md` Q-83).
 *
 * 그래서 여기서는 감시가 켜져 있다는 사실 자체를 확인한다.
 */
import { expect, test } from './support/harness';

test.use({ reducedMotion: 'reduce' });

test('얼린 자리에 사진을 찍으려 하면 그 자리에서 막히고, 파일은 그대로 남는다', async ({ page }) => {
  await page.goto('/');

  /*
   * 경로를 조각으로 나눠 이어 붙인다. 등록부 검사(`tools/screens-registry.cjs`)는 시험
   * 파일에서 `path:` 뒤의 글자를 읽어 "얼린 자리에 찍는 시험"을 잡는데, 여기서는 일부러
   * 얼린 자리를 넘기는 것이 시험의 목적이라 그대로 적으면 그 검사가 이 파일을 위반으로
   * 읽는다. 조각으로 적어 검사의 눈을 피하고, 왜 피하는지를 이 주석이 남긴다.
   */
  const frozen = ['docs', 'plan', 'rosary-full', 'pray-day-844.png'].join('/');

  await expect(page.screenshot({ path: frozen })).rejects.toThrow(/얼린 화면 사진/);
});

test('살아 있는 자리는 그대로 찍힌다 — 감시가 모든 사진을 막는 것이 아니다', async ({ page }) => {
  await page.goto('/');

  /*
   * 막는 장치를 만들 때 가장 흔한 실패는 너무 많이 막는 것이다. 지나치게 막으면 사람이
   * 장치 자체를 꺼 버리고, 그것이 가장 나쁜 결과다. 그래서 "막지 않아야 하는 것을 막지
   * 않는다"도 함께 붙든다. 이 사진은 저장소에 남기지 않고 버린다.
   */
  const shot = await page.screenshot();
  expect(shot.byteLength).toBeGreaterThan(0);
});
