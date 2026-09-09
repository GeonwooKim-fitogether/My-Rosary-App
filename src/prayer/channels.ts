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

/** 기기에 한국어 음성이 있는지에 대한 답. 셋인 것이 핵심이다. */
export type VoiceStatus = 'yes' | 'no' | 'unknown';

/** 음성 목록을 한 번 물어본다. 정해진 시간 안에 답이 없으면 null 이다. */
async function voicesOnce(
  waitMs: number,
): Promise<Awaited<ReturnType<typeof Speech.getAvailableVoicesAsync>> | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Speech.getAvailableVoicesAsync(),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), waitMs);
      }),
    ]);
  } finally {
    // 먼저 답이 왔으면 기다림은 쓸모가 없다. 남겨 두면 타이머가 계속 살아 있는다.
    if (timer !== undefined) clearTimeout(timer);
  }
}

/**
 * 이 기기에 한국어 음성이 있는가 — **모르면 모른다고 답한다.**
 *
 * 예전에는 있다·없다 둘로만 답했는데, 그것이 웹에서 소리를 통째로 잠재우는 결함이었다.
 * 브라우저는 음성 목록을 페이지가 열린 뒤에 뒤늦게 채우기 때문에 처음 물으면 **빈 목록**이
 * 돌아오고, 특히 iOS 사파리가 그렇다. 빈 목록을 "음성이 없다"로 읽으면 앱은 멀쩡한
 * 기기에서 스스로 읽지 않기로 낮추고, 쓰는 사람에게는 그냥 소리가 나지 않는 것으로 보인다.
 *
 * 그래서 답을 셋으로 나눈다. 목록을 받았고 그 안에 한국어가 있으면 `yes` 이고, 목록을
 * 받았는데 한국어가 없으면 `no` 이며, **목록 자체를 끝내 받지 못했으면 `unknown`** 이다.
 * 부르는 쪽은 `no` 일 때만 낮추고 `unknown` 이면 일단 읽어 본다 — 읽어 보고 실패하는
 * 편이, 읽을 수 있는데 잠자코 있는 것보다 낫다.
 *
 * 빈 목록이 오면 곧바로 포기하지 않고 짧은 사이를 두고 몇 번 더 묻는다. 브라우저가
 * 목록을 채우는 데 걸리는 시간이 그 정도이기 때문이다.
 */
export async function koreanVoiceStatus(timeoutMs = 2000): Promise<VoiceStatus> {
  const deadline = Date.now() + timeoutMs;
  try {
    do {
      const voices = await voicesOnce(Math.max(200, deadline - Date.now()));
      if (voices && voices.length > 0) {
        return voices.some((voice) => /^ko/i.test(voice.language ?? '')) ? 'yes' : 'no';
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    } while (Date.now() < deadline);
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * 소리 엔진을 깨운다 — **사용자가 누르는 그 순간에** 불러야 한다.
 *
 * 브라우저는 사용자가 누른 조작에서 곧바로 이어진 소리만 내보낸다. 그런데 기도 화면은
 * 뜬 뒤에 저장된 자리를 읽고 음성 목록을 묻느라 기다림이 두 번 끼고, 그 사이에 "사용자가
 * 눌러서 난 소리"라는 자격이 끊긴다. 그러면 브라우저는 오류 한 줄 없이 소리를 삼킨다.
 *
 * 그래서 기도로 들어가는 단추를 누른 **그 자리에서** 들리지 않는 낭송 하나를 먼저 내보내
 * 자격을 얻어 둔다. 한 번 얻으면 그 페이지가 살아 있는 동안 유지되므로, 그 뒤의 낭송은
 * 기다림을 사이에 두고 일어나도 소리가 난다. 웹이 아닌 기기에는 이런 제약이 없으므로
 * 아무 일도 하지 않는다.
 */
export function primeSpeech(): void {
  if (Platform.OS !== 'web') return;
  try {
    // 빈 문자열은 브라우저가 무시하는 경우가 있어 공백 한 칸을 읽힌다. 들리지 않는다.
    Speech.speak(' ', { language: SPEECH_LANGUAGE });
  } catch {
    // 음성을 지원하지 않는 브라우저 — 깨울 것이 없으면 그만이다.
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
