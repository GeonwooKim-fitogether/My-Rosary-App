/**
 * 받을 절이 화면 밖에 있지 않은가 (W1 둘째 슬라이스 · FR-11 의 실제 사용).
 *
 * 이 앱의 차별점이 교대 낭송이다 — 앞 절은 앱이 읽고 뒷 절은 사람이 받는다. 그런데 앞 절이
 * 길면(주님의 기도 · 성모송 · 사도신경) **내 차례가 됐을 때 받아야 할 뒷 절이 스크롤 아래에
 * 있다.** 받을 글이 안 보이면 그 차별점이 그 자리에서 무너지므로, 차례가 넘어오는 순간
 * 기도문 칸이 스스로 뒷 절까지 굴러가게 했다(`app/pray.tsx`).
 *
 * 여기서 재는 것은 둘이다. 내 차례가 되기 전에는 기도문이 맨 위에서 시작하는가, 그리고
 * 차례가 넘어온 뒤에는 **받을 절이 실제로 눈에 들어오는 자리에 있는가.**
 *
 * 글자 크기를 `아주 크게`(27px)로 올려 두고 잰다. 기본 크기(20px)에서는 주님의 기도가 화면에
 * 다 들어와 굴릴 것이 없고, 그러면 이 시험이 아무것도 재지 못한 채 통과한다.
 */
import { expect, test } from './support/harness';
import {
  collectConsoleErrors,
  enterHome,
  enterPrayerFromHome,
  freezeClock,
  openApp,
} from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 기도문이 흐르는 칸의 지금 상태 — 얼마나 내려와 있고, 내려갈 데가 남아 있는가. */
async function scrollBox(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    let node = document.querySelector('[data-testid="pray-a"]')?.parentElement ?? null;
    while (node) {
      const overflow = getComputedStyle(node).overflowY;
      if (overflow === 'auto' || overflow === 'scroll') {
        return { top: node.scrollTop, scrollHeight: node.scrollHeight, clientHeight: node.clientHeight };
      }
      node = node.parentElement;
    }
    return null;
  });
}

/**
 * 받을 절이 지금 **통째로** 눈에 들어오는가.
 *
 * 첫 글자가 보이는 것으로는 부족하다 — 받아 바치는 사람에게 필요한 것은 문장 전체이고,
 * 굴러가기 전에도 뒷 절의 첫 줄은 이미 칸의 맨 아래에 걸쳐 있기 때문이다. 그래서 위 끝과
 * 아래 끝이 **둘 다** 칸 안에 있을 때만 보인다고 본다.
 */
async function responseIsVisible(page: import('@playwright/test').Page) {
  const box = await page.getByTestId('pray-b').boundingBox();
  const scroller = await page.getByTestId('pray-a').evaluate((element) => {
    let node = element.parentElement;
    while (node) {
      const overflow = getComputedStyle(node).overflowY;
      if (overflow === 'auto' || overflow === 'scroll') {
        const rect = node.getBoundingClientRect();
        return { y: rect.y, bottom: rect.bottom };
      }
      node = node.parentElement;
    }
    return null;
  });
  if (!box || !scroller) return false;
  return box.y >= scroller.y - 1 && box.y + box.height <= scroller.bottom + 1;
}

test('내 차례가 되면 기도문 칸이 받을 절까지 스스로 굴러간다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await enterPrayerFromHome(page);
  await freezeClock(page);

  // 글자를 가장 크게 — 그래야 주님의 기도가 한 화면에 들어가지 않는다.
  const aa = page.getByTestId('pray-font');
  await aa.click();
  await aa.click();
  await expect(aa).toHaveAttribute('aria-label', '글자 크기, 아주 크게');

  // 앞 절도 뒷 절도 긴 기도문으로 옮긴다. 성호경에서 세 걸음이다.
  for (let i = 0; i < 3; i++) await page.getByTestId('pray-next-step').click();
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 주님의 기도');

  // 1. 옮겨 온 직후에는 맨 위에서 시작하고, 아래로 내려갈 것이 남아 있다.
  const before = await scrollBox(page);
  expect(before).not.toBeNull();
  expect(before!.top).toBe(0);
  expect(before!.scrollHeight).toBeGreaterThan(before!.clientHeight + 2);
  // 이 자리에서는 받을 절이 아직 화면 밖이다 — 그래서 굴릴 일이 생긴다.
  expect(await responseIsVisible(page)).toBe(false);

  // 2. 시간을 흘려 내 차례(받는 사이)가 되기를 기다린다. 앱이 앞 절을 다 읽으면 넘어온다.
  const rosary = page.getByTestId('pray-rosary');
  for (let i = 0; i < 40; i++) {
    if ((await rosary.getAttribute('aria-label')) === '지금 알: 내가 받을 차례') break;
    await page.clock.runFor(100);
  }
  await expect(rosary).toHaveAttribute('aria-label', '지금 알: 내가 받을 차례');
  // 아직 같은 기도문이다 — 앱이 다음 알로 넘어가 버렸다면 위의 판정이 딴 자리를 잰 것이다.
  await expect(page.getByTestId('pray-step')).toHaveText('시작 기도 · 주님의 기도');

  // 3. 칸이 내려갔고, 받을 절이 눈에 들어온다.
  const after = await scrollBox(page);
  expect(after!.top).toBeGreaterThan(0);
  expect(await responseIsVisible(page)).toBe(true);

  expect(errors).toEqual([]);
});
