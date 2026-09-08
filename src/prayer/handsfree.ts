/**
 * 손 없이 조작 (FR-38 · `spec/journey-rules.md` §6).
 *
 * 이 앱의 중심 질문은 "화면을 보지 않고 손을 쓰지 않고도 다섯 단을 끝까지 갈 수 있나"다
 * (DQ-05). 그 질문에 답하는 입력이 둘이고, 이 파일이 그 둘을 화면에 붙인다.
 *
 * | 입력 | 무엇을 하나 | 어디서 오나 |
 * |---|---|---|
 * | 폰을 한 번 흔든다 | 다음 알 (사이가 남아 있어도 즉시) | 가속도 센서 |
 * | 이어폰의 재생·다음·이전 단추 | 잠시 멈춤·이어서 · 다음 알 · 이전 알 | 미디어 세션 |
 *
 * **한 번의 조작은 한 알만 움직인다.** 배속도 건너뛰기도 아니다 (PRD §9).
 *
 * 흔들기는 `expo-sensors` 의 `DeviceMotion` 을 쓴다. 같은 꾸러미의 `Accelerometer` 를
 * 쓰지 않은 이유가 있다 — 웹에서 `Accelerometer` 는 기기의 기울기(각도, 라디안)를
 * 가속도인 척 내보내기 때문에, 가속도 문턱으로 판정하면 폰을 기울이기만 해도 알이
 * 넘어간다. `DeviceMotion` 은 세 플랫폼 모두에서 중력을 포함한 가속도(m/s²)를 준다.
 *
 * 두 입력의 구현 성숙도가 다르다는 것을 숨기지 않고 적어 둔다. 흔들기는 iOS·Android·웹
 * 어디서나 같은 코드로 동작한다. 이어폰 단추는 **웹에서만** 붙어 있다 — 브라우저의
 * 미디어 세션에 손잡이를 걸어 두는 방식이다. iOS·Android 에서 이어폰 단추를 받으려면
 * 앱이 "지금 무언가를 재생 중"인 오디오 세션을 잡고 있어야 하는데, 그것은 낭송을
 * 무음 트랙 위에 얹는 별도의 작업이라 이번 범위에 넣지 않았다 (개발 계획 §11 의 위험
 * 항목이 예고한 그것이다). 실기기의 이어폰 단추는 아직 동작하지 않는다.
 */
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { DeviceMotion } from 'expo-sensors';

/**
 * 흔들었다고 판정하는 가속도 (m/s²).
 *
 * 가만히 든 폰에도 중력 9.8 이 걸리므로 그 위에 얹히는 힘이 있어야 흔든 것이다.
 * 중력의 1.8배를 문턱으로 잡았다 — 걷거나 손을 옮기는 정도로는 넘지 않고, 손목을
 * 한 번 튕기면 넘는 값이다.
 */
export const SHAKE_THRESHOLD = DeviceMotion.Gravity * 1.8;

/** 한 번 흔든 뒤 다시 받아들이기까지의 시간. 한 번 흔들어 두 알이 넘어가지 않게 한다. */
export const SHAKE_COOLDOWN_MS = 900;

/** 센서를 얼마나 자주 읽을 것인가. */
const SENSOR_INTERVAL_MS = 120;

/**
 * 폰을 흔들면 다음 알로 넘어가게 한다.
 *
 * @param enabled 설정의 "손 없이 조작"이 켜져 있는가. 꺼져 있으면 센서를 아예 열지 않는다.
 */
export function useShakeToAdvance(enabled: boolean, onShake: () => void): void {
  const latest = useRef(onShake);
  latest.current = onShake;

  useEffect(() => {
    if (!enabled) return;
    let subscription: { remove: () => void } | null = null;
    let cancelled = false;
    let lastAt = 0;

    async function open(): Promise<void> {
      try {
        const available = await DeviceMotion.isAvailableAsync();
        if (!available || cancelled) return;
        // 웹에는 갱신 주기를 정하는 손잡이가 없어 부르면 경고만 남는다. 그래서 기기에서만 부른다.
        if (Platform.OS !== 'web') DeviceMotion.setUpdateInterval(SENSOR_INTERVAL_MS);
        subscription = DeviceMotion.addListener(({ accelerationIncludingGravity }) => {
          if (!accelerationIncludingGravity) return;
          const { x, y, z } = accelerationIncludingGravity;
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          if (magnitude < SHAKE_THRESHOLD) return;
          const now = Date.now();
          if (now - lastAt < SHAKE_COOLDOWN_MS) return;
          lastAt = now;
          latest.current();
        });
      } catch {
        // 움직임 센서가 없는 기기 — 흔들기만 없을 뿐 기도는 그대로 진행된다.
      }
    }

    void open();
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);
}

/** 이어폰·미디어 단추가 걸리는 자리. */
export interface RemoteHandlers {
  /** 재생·일시정지 단추 — 잠시 멈춤과 이어서. */
  onToggle: () => void;
  /** 다음 곡 단추 — 다음 알. */
  onNext: () => void;
  /** 이전 곡 단추 — 이전 알. */
  onPrevious: () => void;
}

/** 브라우저의 미디어 세션. 없으면 null 이다. */
interface MediaSessionLike {
  setActionHandler(action: string, handler: (() => void) | null): void;
}

function mediaSession(): MediaSessionLike | null {
  if (Platform.OS !== 'web') return null;
  const nav = (globalThis as { navigator?: { mediaSession?: MediaSessionLike } }).navigator;
  return nav?.mediaSession ?? null;
}

/**
 * 이어폰 단추를 기도 진행에 건다.
 *
 * 웹에서는 브라우저의 미디어 세션에 손잡이를 걸어 둔다. 브라우저가 이 앱을 "재생 중"으로
 * 볼 때에만 실제 이어폰 단추가 이 손잡이로 들어오므로, 손잡이가 걸렸다는 것과 실기기에서
 * 눌린다는 것은 다른 말이다. 그 차이를 알면서 걸어 두는 것은, 손잡이가 있어야 소리가
 * 붙는 다음 작업에서 곧바로 이어지기 때문이다.
 */
export function useRemoteCommands(enabled: boolean, handlers: RemoteHandlers): void {
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    if (!enabled) return;
    const session = mediaSession();
    if (!session) return;

    const bindings: [string, () => void][] = [
      ['play', () => latest.current.onToggle()],
      ['pause', () => latest.current.onToggle()],
      ['nexttrack', () => latest.current.onNext()],
      ['previoustrack', () => latest.current.onPrevious()],
    ];

    try {
      for (const [action, handler] of bindings) session.setActionHandler(action, handler);
    } catch {
      // 이 손잡이를 모르는 브라우저 — 흔들기만으로 진행한다.
    }

    return () => {
      try {
        for (const [action] of bindings) session.setActionHandler(action, null);
      } catch {
        // 걸지 못했으면 풀 것도 없다.
      }
    };
  }, [enabled]);
}
