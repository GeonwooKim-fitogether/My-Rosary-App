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
        calls.speech.push(String(utterance.text ?? ''));
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
