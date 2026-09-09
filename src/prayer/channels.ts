/**
 * 비화면 채널 — 소리와 진동을 실제 기기에 내보내는 층.
 *
 * `runner.ts` 는 이 파일을 모른다. 진행기는 "읽어 달라 · 떨어 달라"고 말할 뿐이고,
 * 그 말을 기기의 말로 옮기는 것이 여기다. 그렇게 갈라 둔 덕분에 진행기는 브라우저
 * 없이 시험할 수 있고, 여기서 기기마다 다른 사정(음성이 없다 · 진동이 없다)을 혼자
 * 감당할 수 있다.
 *
 * 기기 사정을 감당하는 방식은 하나로 정해져 있다 — **없으면 조용히 넘어간다.**
 * 음성이 없다고, 진동이 없다고 기도를 멈춰 세우지 않는다 (`spec/journey-rules.md` §5·§8).
 */
import * as Speech from 'expo-speech';
import { Platform, Vibration } from 'react-native';
import { TTS_RATE } from '../domain/pacing';
import type { RunnerChannels } from './runner';

/** 읽는 언어. 기기의 한국어 음성을 고르는 열쇠다. */
export const SPEECH_LANGUAGE = 'ko-KR';

/**
 * 소리가 얼마나 걸릴지 어림한다.
 *
 * 기기가 "다 읽었다"를 알려 주지 않는 경우가 있어(웹의 일부 브라우저, 음성이 없는 기기)
 * 그때 진행이 영원히 멈추지 않도록 하는 안전망이다. 값은 v5 시안이 쓰던 어림식
 * `380ms + 글자수 × 66ms`(최대 4200ms)를 그대로 옮겼다.
 */
export function estimateSpeechMs(text: string): number {
  return Math.min(4200, 380 + text.length * 66);
}

/** 안전망이 깨우기까지의 시간. 실제 낭송이 어림보다 느려도 잘리지 않을 만큼 넉넉히 둔다. */
function guardMs(text: string): number {
  return estimateSpeechMs(text) * 2 + 2000;
}

/**
 * 이 기기에 한국어 음성이 있는가.
 *
 * 없으면 PRD §8 에 따라 읽지 않기로 진행한다. 목록을 얻는 데 시간이 걸리거나 아예
 * 돌아오지 않는 기기가 있어 정해진 시간만 기다리고 포기한다 — 기다리다 화면이 뜨지
 * 않는 것이 음성이 없는 것보다 나쁘다.
 */
export async function hasKoreanVoice(timeoutMs = 1500): Promise<boolean> {
  try {
    const voices = await Promise.race([
      Speech.getAvailableVoicesAsync(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    if (!voices) return false;
    return voices.some((voice) => /^ko/i.test(voice.language ?? ''));
  } catch {
    return false;
  }
}

/** 진동. 패턴은 `spec/journey-rules.md` §5 의 진동 사전에서 온다. */
export function vibrate(pattern: readonly number[]): void {
  try {
    if (pattern.length === 0) return;
    if (pattern.length === 1) {
      Vibration.vibrate(pattern[0]!);
      return;
    }
    // 안드로이드의 패턴은 "기다림 → 떨림 → 기다림 …" 순서로 읽히므로 맨 앞에 0 을 붙여
    // 곧바로 떨리게 한다. 웹과 iOS 는 앞의 0 이 필요 없다.
    Vibration.vibrate(Platform.OS === 'android' ? [0, ...pattern] : [...pattern]);
  } catch {
    // 진동을 지원하지 않는 기기 — 사이만으로 진행하고 오류를 내지 않는다.
  }
}

/**
 * 실제 기기로 나가는 통로 한 벌을 만든다.
 *
 * 낭송 하나에 약속(Promise) 하나가 걸리고, 그 약속은 셋 중 먼저 오는 것으로 풀린다 —
 * 기기가 다 읽었다고 알려 주거나, 바깥에서 멈추라고 하거나, 안전망 시간이 다 되거나.
 */
export function createDeviceChannels(): RunnerChannels {
  let settle: (() => void) | null = null;
  let guard: ReturnType<typeof setTimeout> | null = null;

  function finish(): void {
    if (guard !== null) {
      clearTimeout(guard);
      guard = null;
    }
    if (settle) {
      const resolve = settle;
      settle = null;
      resolve();
    }
  }

  return {
    speak(text: string): Promise<void> {
      finish(); // 앞의 낭송이 아직 걸려 있으면 먼저 풀어 준다.
      return new Promise<void>((resolve) => {
        settle = resolve;
        guard = setTimeout(finish, guardMs(text));
        try {
          Speech.speak(text, {
            language: SPEECH_LANGUAGE,
            rate: TTS_RATE,
            onDone: finish,
            onStopped: finish,
            onError: finish,
          });
        } catch {
          // 음성을 아예 지원하지 않는 기기. 안전망이 사이를 채우고 진행은 이어진다.
          finish();
        }
      });
    },

    stopSpeaking(): void {
      try {
        void Speech.stop();
      } catch {
        // 멈출 것이 없으면 그만이다.
      }
      finish();
    },

    vibrate,
  };
}
