/**
 * e2e 시험이 쓰는 받침대 — 기기 흉내와 기록.
 *
 * 이 컨테이너의 크로미움에는 한국어 음성도 진동 장치도 없다. 그래서 "소리가 났는가"는
 * 여기서 확인할 수 없고, 확인할 수 있는 것은 **앱이 기기에게 말을 걸었는가**다. 그래서
 * 브라우저 쪽 통로(`speechSynthesis` · `navigator.vibrate` · 미디어 세션)를 받아 적는
 * 것으로 바꿔 두고, 앱의 코드는 하나도 건드리지 않는다. 시험을 위해 앱에 손잡이를 다는
 * 대신 기기를 흉내 내는 쪽을 택한 것이다.
 */
import type { Page } from '@playwright/test';

export interface RecordedCalls {
  /** 앱이 읽어 달라고 넘긴 문장들. */
  speech: string[];
  /** 앱이 요청한 진동 패턴들. */
  vibrate: number[][];
  /** 앱이 걸어 둔 이어폰·미디어 단추 이름들. */
  media: string[];
}

/**
 * 화면을 열기 전에 기기를 흉내 내 둔다.
 *
 * - 한국어 음성이 하나 있는 기기인 척한다. 그래야 앱이 읽지 않기로 낮추지 않고
 *   실제로 소리를 요청하며, 그 요청을 셀 수 있다.
 * - 낭송은 요청되자마자 "다 읽었다"고 답한다. 시험이 사람의 낭송 속도를 기다릴 이유는 없다.
 * - 진동과 미디어 단추는 부른 사실만 적어 둔다.
 */
export async function installDeviceStubs(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const calls: RecordedCalls = { speech: [], vibrate: [], media: [] };
    const handlers: Record<string, (() => void) | null> = {};
    const target = window as unknown as {
      __mrCalls: RecordedCalls;
      __mrTriggerMedia: (action: string) => void;
    };
    target.__mrCalls = calls;
    target.__mrTriggerMedia = (action) => handlers[action]?.();

    const voice = {
      voiceURI: 'ko-KR-test',
      name: '시험용 한국어 음성',
      lang: 'ko-KR',
      localService: true,
      default: true,
    };

    const synth = window.speechSynthesis as unknown as {
      getVoices: () => unknown[];
      speak: (utterance: { text?: string; onend?: (event: unknown) => void }) => void;
      cancel: () => void;
    };
    if (synth) {
      synth.getVoices = () => [voice];
      synth.speak = (utterance) => {
        const text = String(utterance.text ?? '');
        // 공백뿐인 낭송은 기도문이 아니라 **소리 엔진을 깨우는 것**이다. 브라우저는 사용자가
        // 누른 조작에서 곧바로 이어진 소리만 내보내므로, 앱은 기도로 들어가는 단추를 누른
        // 자리에서 들리지 않는 낭송 하나를 먼저 내보내 자격을 얻는다(`primeSpeech`). 그것을
        // 낭송으로 세면 하루의 낭송 수가 한 번 더 세어져, 단계 하나가 두 번 낭송된 것처럼
        // 보인다. 실제로 그런 오진이 한 번 있었다.
        if (text.trim() !== '') calls.speech.push(text);
        setTimeout(() => utterance.onend?.({}), 0);
      };
      synth.cancel = () => {};
    }

    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: (pattern: number | number[]) => {
        calls.vibrate.push(Array.isArray(pattern) ? [...pattern] : [pattern]);
        return true;
      },
    });

    const session = ((navigator as unknown as { mediaSession?: object }).mediaSession ??
      {}) as {
      setActionHandler?: (action: string, handler: (() => void) | null) => void;
    };
    session.setActionHandler = (action, handler) => {
      calls.media.push(action);
      handlers[action] = handler;
    };
    Object.defineProperty(navigator, 'mediaSession', { configurable: true, value: session });
  });
}

/** 지금까지 기기가 받은 요청들을 읽어 온다. */
export async function readCalls(page: Page): Promise<RecordedCalls> {
  return page.evaluate(
    () => (window as unknown as { __mrCalls: RecordedCalls }).__mrCalls ?? {
      speech: [],
      vibrate: [],
      media: [],
    },
  );
}

/** 이어폰 단추를 눌렀다고 알린다. 앱이 걸어 둔 손잡이를 그대로 부른다. */
export async function pressMediaButton(page: Page, action: string): Promise<void> {
  await page.evaluate(
    (name) =>
      (window as unknown as { __mrTriggerMedia: (a: string) => void }).__mrTriggerMedia(name),
    action,
  );
}

/**
 * 폰을 흔들었다고 알린다.
 *
 * 웹의 움직임 센서는 `devicemotion` 사건으로 온다. 브라우저가 그 사건을 스스로 만들어
 * 주지 않으므로 시험이 직접 만들어 던진다.
 *
 * @param magnitude 세 축에 걸리는 가속도의 크기 (m/s²). 가만히 있으면 9.8 쯤이다.
 */
export async function shakeDevice(page: Page, magnitude = 30): Promise<void> {
  await page.evaluate((value) => {
    const axis = value / Math.sqrt(3);
    const event = new Event('devicemotion') as Event & {
      accelerationIncludingGravity?: unknown;
      acceleration?: unknown;
      rotationRate?: unknown;
      interval?: number;
    };
    event.accelerationIncludingGravity = { x: axis, y: axis, z: axis };
    event.acceleration = { x: axis, y: axis, z: axis };
    event.rotationRate = { alpha: 0, beta: 0, gamma: 0 };
    event.interval = 16;
    window.dispatchEvent(event);
  }, magnitude);
}

/** 콘솔에 오류가 찍히면 모아 둔다. 통과 조건 여섯 번째가 이 목록이 비어 있는 것이다. */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));
  return errors;
}

/* ── M2 가 더한 받침대 — 홈이 생기면서 "앱에 들어가는 길"이 길어졌다 ──────────────────
   M1 까지는 로그인 단추 하나를 누르면 곧바로 기도 화면이었다(`decisions.md` Q-17 의 임시
   배선). 이제 로그인 → 홈 → 여정 카드 → 기도로 간다. 시험마다 그 길을 다시 적지 않도록
   여기 한 번만 적는다. ───────────────────────────────────────────────────────────── */

/**
 * 시험이 서 있는 날 — 2026년 9월 5일.
 *
 * 이 날을 고른 이유가 있다. 본보기 여정(`src/journey/demo.ts`)은 **오늘이 23일째가 되도록**
 * 시작일을 잡는데, v5 시안이 못박은 대응이 "23일째 = 9월 5일"이다(`decisions.md` Q-24).
 * 시험의 오늘을 9월 5일로 세워 두면 화면에 뜨는 날짜가 시안의 값과 글자까지 같아진다.
 */
export const FIXED_TODAY = new Date('2026-09-05T09:00:00');

/**
 * 앱을 연다. 기기를 흉내 내고, 시계를 세우고, 첫 화면을 띄운다.
 *
 * @param demo 본보기 여정을 세울 것인가. 빈 홈에서 시작하는 시험은 false 로 부른다.
 * @param art 성화 뽑기의 씨앗 (`decisions.md` Q-57). 주면 **그림이 언제나 같아진다.**
 *   사진을 찍는 시험과, 그림이 바뀌는 것 자체를 재는 시험이 이것을 쓴다 — 뽑기가 난수인
 *   채로 두면 아무것도 고치지 않아도 사진이 달라지고, "지역이 바뀌어서 그림이 바뀐 것"과
 *   "그냥 다른 그림이 나온 것"을 가릴 수 없다.
 * @param intro 소개 시트를 **아직 보지 않은 기기**로 열 것인가 (W4 슬라이스 C). 기본은
 *   `false` — 이미 본 것으로 두고 연다. 까닭은 아래 `markIntroSeen` 이 적는다.
 */
export async function openApp(
  page: Page,
  options: { demo?: boolean; at?: Date; fontScale?: number; art?: number; intro?: boolean } = {},
): Promise<void> {
  await page.clock.install({ time: options.at ?? FIXED_TODAY });
  await installDeviceStubs(page);
  if (options.intro !== true) await markIntroSeen(page);
  if (options.fontScale && options.fontScale !== 1) await installFontScale(page, options.fontScale);
  const query = new URLSearchParams();
  if (options.demo !== false) query.set('demo', '1');
  if (options.art !== undefined) query.set('art', String(options.art));
  const search = query.toString();
  await page.goto(search === '' ? '/' : `/?${search}`);
}

/**
 * 시스템 글자 크기 확대를 흉내 낸다 (FR-28).
 *
 * 웹에는 기기의 글자 배율이 없고, 사용자가 손댈 수 있는 것은 브라우저의 뿌리 글자 크기다. 앱은
 * 그 값(`html` 의 `font-size`)을 16 으로 나누어 배율로 쓴다(`src/theme/fontScale.ts`). 그래서
 * 확대를 흉내 내는 가장 정직한 길은, 사용자가 브라우저 설정에서 글자를 "크게"로 바꾼 것처럼 뿌리
 * 글자 크기를 키워 두는 것이다 — 200% 면 32px.
 *
 * 앱의 묶음(bundle)이 뿌리 글자 크기를 읽는 시점은 그 묶음이 처음 실행될 때다. 초기화 스크립트가
 * 도는 순간에는 `<html>` 이 아직 없을 수 있어, 있으면 바로 적용하고 없으면 생기는 것을 지켜보다
 * 적용한다.
 */
export async function installFontScale(page: Page, fontScale: number): Promise<void> {
  await page.addInitScript((px: string) => {
    const apply = () => {
      const root = document.documentElement;
      if (root && root.style.fontSize !== px) root.style.fontSize = px;
    };
    apply();
    new MutationObserver(apply).observe(document, { childList: true });
    document.addEventListener('DOMContentLoaded', apply);
  }, `${16 * fontScale}px`);
}

/**
 * 소개 시트를 **이미 본 기기**로 만들어 둔다 (W4 슬라이스 C).
 *
 * `openApp` 이 기본으로 이것을 부른다. 왜 기본이 "이미 봤다" 인가. 소개는 앱을 **처음** 여는
 * 사람에게 한 번 뜨는 것이고, 시험은 매번 빈 브라우저에서 시작하므로 그냥 두면 **모든 시험이
 * 소개 시트에 막힌다.** 시험이 재려는 것은 기도와 여정과 설정이지 소개가 아니므로, 시험의
 * 기본 상태를 "이 앱을 두 번째로 여는 사람" 으로 둔다 — 실제 사용자도 첫 열기 뒤로는 줄곧
 * 그 상태다.
 *
 * 처음 여는 사람의 자리를 재는 시험은 `openApp(page, { intro: true })` 로 이것을 건너뛴다
 * (`e2e/intro.spec.ts`).
 */
export async function markIntroSeen(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem('myrosary.introSeen.v1', '1');
  });
}

/**
 * 기기에 이미 저장돼 있던 설정을 심어 둔다 (W4 슬라이스 B).
 *
 * **`openApp` 보다 먼저 부른다.** 화면이 뜬 뒤에 심으면 앱이 이미 옛 값을 읽은 뒤라서
 * 아무 일도 일어나지 않는다.
 *
 * 왜 이런 손잡이가 필요한가. 재려는 것이 **지금 화면으로는 만들 수 없는 상태**이기 때문이다 —
 * 언어 다섯이 꺼진 뒤로는 지역·언어 화면에서 그 다섯을 고를 수 없는데, 일곱이 모두 열려 있던
 * 판(W0~W3)으로 앱을 쓰던 기기에는 그 값이 저장돼 있을 수 있다. 그 기기가 어떻게 열리는지를
 * 재려면 저장된 값을 손으로 놓아 보는 수밖에 없다.
 *
 * 웹에서 앱의 저장소는 브라우저의 `localStorage` 다 — `@react-native-async-storage/async-storage`
 * 가 웹에서 그것을 그대로 쓴다(`lib/module/createAsyncStorage.js` 의 `LegacyAsyncStorageWebImpl`).
 * 그래서 앱의 저장 열쇠(`src/storage/settings.ts` 의 `SETTINGS_KEY`)에 값을 적어 두면 된다.
 */
export async function seedStoredSettings(
  page: Page,
  settings: Record<string, unknown>,
): Promise<void> {
  await page.addInitScript((raw: string) => {
    window.localStorage.setItem('myrosary.settings.v1', raw);
  }, JSON.stringify(settings));
}

/** 첫 화면의 단추를 눌러 홈으로 들어간다 (`decisions.md` Q-17 이 닫힌 배선). */
export async function enterHome(page: Page): Promise<void> {
  await page.getByTestId('login-google').click();
  await page.getByTestId('home-screen').waitFor();
}

/** 홈의 첫 카드를 눌러 기도로 들어간다 (FR-42). */
export async function enterPrayerFromHome(page: Page, index = 0): Promise<void> {
  await page.getByTestId(`home-card-${index}`).click();
  await page.getByTestId('pray-title').waitFor();
}

/**
 * 기도 화면에서 나간다 — 뒤로 화살표를 눌러 시트를 열고, 나가는 두 길 중 하나를 고른다.
 *
 * W1 에서 화면의 동작이 바뀌어 생긴 받침대다. 그전에는 머리의 단추 둘이 `잠시 멈춤` 과
 * `여기서 끝내기` 를 곧바로 했는데, 뒤의 것(오늘 바친 자리를 지운다)이 뒤로 화살표에
 * 걸려 있어 되돌아가려던 사람의 오늘이 한 번의 오조작으로 사라질 수 있었다. 지금은
 * 화살표가 시트를 열고 사람이 그 안에서 고른다(`src/ui/LeavePrayerSheet.tsx`).
 *
 * **이름표 둘(`pray-pause` · `pray-stop`)은 그대로다.** 두 줄이 하는 일도 그대로이고,
 * 누르기 전에 시트를 한 번 여는 것만 달라졌다. 그래서 시험들이 재는 것(자리가 남는가 ·
 * 지워지는가)은 한 줄도 바뀌지 않고, 여는 동작만 이 한 곳에 적어 둔다.
 */
export async function leavePrayer(page: Page, how: 'pause' | 'stop'): Promise<void> {
  await page.getByTestId('pray-back').click();
  await page.getByTestId(how === 'pause' ? 'pray-pause' : 'pray-stop').click();
}

/**
 * 지금 시각에서 시간을 멈춘다. 이 뒤로는 `page.clock.runFor` 로만 시간이 흐른다.
 *
 * `openApp` 이 세우는 가짜 시계는 **시각을 고정할 뿐 시간은 실시간으로 흐른다.** 그래서 기도
 * 화면에 들어선 뒤 몇 초만 지나도 앱이 스스로 알을 넘겨, "내가 누른 것 때문에 움직였나"를 가릴 수
 * 없어진다. 조작으로 만든 상태를 그대로 붙들고 재야 하는 시험은 화면에 들어선 직후 이것을 부른다.
 */
export async function freezeClock(page: Page): Promise<void> {
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 50);
}

/** 하루가 끝날 때까지 시계를 앞당긴다. 다 마치면 true. */
export async function runUntilVisible(
  page: Page,
  testId: string,
  { stepMs = 5000, times = 320 }: { stepMs?: number; times?: number } = {},
): Promise<boolean> {
  const target = page.getByTestId(testId);
  for (let i = 0; i < times; i++) {
    if (await target.isVisible()) return true;
    await page.clock.runFor(stepMs);
  }
  return target.isVisible();
}

/* ── W2 슬라이스 A 가 더한 받침대 — 홈의 머리가 아래 탭 바로 옮겨 갔다 ──────────────────
   M2 의 홈은 오른쪽 위에 `설정` 글자를 달고 있었고(`home-settings`), 시험들은 그것을 눌러
   설정으로 들어갔다. 새 시안의 홈에는 그 글자가 없고 설정은 **아래 탭 바**로 간다
   (`src/ui/WorldTabBar.tsx`). 시험마다 그 사실을 다시 적지 않도록 여는 동작을 여기 한 번만
   적는다 — W1 이 `leavePrayer` 를 여기 둔 것과 같은 까닭이다.

   **시험이 재던 것은 한 줄도 바뀌지 않았다.** 설정 화면이 무엇을 보여 주고 무엇을 저장하는지
   묻는 판정문은 그대로이고, 그 화면을 여는 손짓만 글자에서 탭으로 바뀌었다.
   ───────────────────────────────────────────────────────────────────────── */

/**
 * 탭 하나를 누른다.
 *
 * **왜 감싸개가 필요한가.** 화면은 쌓이고, 쌓인 화면은 사라지지 않고 아래에 남는다. 탭 바는
 * 화면마다 한 줄씩 서 있으므로 두 화면이 쌓이면 `tab-settings` 라는 이름표가 둘이 되고,
 * 시험은 "어느 쪽을 누를까"를 정하지 못해 멈춘다(2026-09-18 에 실제로 그렇게 걸렸다).
 * 사람이 실제로 누르는 것은 **지금 보이는** 탭 바 하나뿐이므로 그 하나만 고른다.
 */
export async function tapTab(
  page: Page,
  tab: 'home' | 'gallery' | 'journeys' | 'settings',
): Promise<void> {
  await page.locator(`[data-testid="tab-${tab}"]:visible`).click();
}

/** 아래 탭 바로 설정에 들어간다. */
export async function openSettings(page: Page): Promise<void> {
  await tapTab(page, 'settings');
  await page.getByTestId('settings-screen').waitFor();
}

/** 아래 탭 바로 홈에 돌아온다. */
export async function openHomeTab(page: Page): Promise<void> {
  await tapTab(page, 'home');
  await page.getByTestId('home-screen').waitFor();
}

/** 아래 탭 바로 여정 화면에 들어간다 (W3 슬라이스 A). */
export async function openJourneys(page: Page): Promise<void> {
  await tapTab(page, 'journeys');
  await page.getByTestId('journey-screen').waitFor();
}

/* ── W3 슬라이스 A 가 더한 받침대 — 화면을 새로 고칠 때 손잡이가 떨어지는 문제 ──────────
   `decisions.md` Q-57 의 **남은 한 장**이 여기서 닫혔다. 잰 결과를 그대로 적어 둔다.

   시험이 날짜를 돌린 뒤 `page.reload()` 로 앱을 다시 열면, 그때 주소창에 남아 있는 것은
   `/home` 뿐이다 — 처음 열 때 붙였던 손잡이 `?demo=1&art=<씨앗>` 이 화면을 옮기는 사이에
   떨어져 나가기 때문이다(실측: 다시 고친 뒤의 주소가 `http://127.0.0.1:8081/home` 이었다).
   씨앗이 없으면 성화 뽑기는 다시 난수가 되고, 그래서 **그 시험이 찍는 사진만** 돌릴 때마다
   그림이 달라졌다. 다시 고치지 않는 나머지 열한 장이 멀쩡했던 까닭도 같다.

   그래서 다시 고치는 대신 **손잡이를 붙인 같은 주소로 다시 연다.** 앱이 하는 일은
   똑같고(처음부터 다시 읽는다) 씨앗만 살아남는다.
   ───────────────────────────────────────────────────────────────────────── */

/**
 * 손잡이를 붙인 채 앱을 다시 연다. `page.reload()` 를 대신한다.
 *
 * @param at 다시 열기 전에 세워 둘 시각. 주면 가짜 시계를 그 시각으로 옮긴다.
 */
export async function reopenApp(
  page: Page,
  options: { demo?: boolean; at?: Date; art?: number; path?: string } = {},
): Promise<void> {
  if (options.at) await page.clock.setSystemTime(options.at);
  const query = new URLSearchParams();
  if (options.demo !== false) query.set('demo', '1');
  if (options.art !== undefined) query.set('art', String(options.art));
  const search = query.toString();
  const path = options.path ?? '/home';
  await page.goto(search === '' ? path : `${path}?${search}`);
}
