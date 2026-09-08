/**
 * 받는 사이 — 앱이 앞 절을 읽고 나서 사용자가 뒷 절을 바칠 수 있게 기다리는 시간
 * (FR-07 · `spec/journey-rules.md` §4 · 06-d 화면 B 비화면 채널).
 *
 * 공식은 하나다.
 *
 *     (900ms + 사용자 몫 글자수 × 132ms) ÷ 속도계수
 *
 * 여기에 예외가 하나 있다. 신비 선포 뒤는 이 공식을 쓰지 않고 고정 2200ms 를 기다린다.
 * 선포는 사용자가 받아 바치는 기도가 아니라 다음 단을 여는 안내라서, 글자수에 비례해
 * 기다리면 오히려 흐름이 끊기기 때문이다.
 */
import type { PaceKey, RecitationMode } from './types';
import { PRAYERS } from './sequence';
import type { PrayerKey } from './types';

/** 공식의 기본 사이 — 글자수와 무관하게 언제나 깔리는 900ms. */
export const BASE_GAP_MS = 900;

/** 사용자 몫 한 글자에 얹는 시간 — 132ms. */
export const MS_PER_CHAR = 132;

/** 신비 선포 뒤의 고정 사이 — 2200ms. 공식을 쓰지 않는다. */
export const DECLARATION_GAP_MS = 2200;

/** 음성 속도(TTS rate) — 0.92. `spec/journey-rules.md` §4. */
export const TTS_RATE = 0.92;

/** 속도계수 (FR-07). 느리게일수록 계수가 작아 사이가 길어진다. */
export const PACE_FACTORS: Readonly<Record<PaceKey, number>> = {
  slow: 0.75,
  normal: 1,
  fast: 1.35,
};

/**
 * 낭송 방식에 따른 "사용자 몫 글자수" L 을 센다.
 *
 * 방식마다 앱이 읽는 부분이 달라서 사용자가 받아 바치는 분량도 달라진다.
 * 교대는 뒷 절만, 전부 소리로는 앱이 다 읽으므로 0, 읽지 않기는 앞 절과 뒷 절 전부다.
 */
export function userShareLength(
  mode: RecitationMode,
  text: { a: string; b: string },
): number {
  if (mode === 'full') return 0;
  if (mode === 'alternate') return text.b.length;
  return text.a.length + text.b.length;
}

/**
 * 받는 사이를 밀리초로 계산한다.
 *
 * @param userShareChars 사용자 몫 글자수 L.
 * @param pace 낭송 속도.
 */
export function gapMs(userShareChars: number, pace: PaceKey): number {
  if (userShareChars < 0) throw new RangeError(`글자수는 음수일 수 없다: ${userShareChars}`);
  return (BASE_GAP_MS + userShareChars * MS_PER_CHAR) / PACE_FACTORS[pace];
}

/**
 * 어떤 기도문 한 단계의 받는 사이를 계산한다.
 *
 * 신비 선포(`decl`)만 공식을 건너뛰고 고정 2200ms 를 돌려준다.
 */
export function gapForPrayer(
  prayer: PrayerKey,
  mode: RecitationMode,
  pace: PaceKey,
): number {
  if (prayer === 'decl') return DECLARATION_GAP_MS;
  const text = PRAYERS[prayer];
  return gapMs(userShareLength(mode, text), pace);
}

/** 진동 사전 (`spec/journey-rules.md` §5 · 06-d 화면 B). 값은 밀리초 패턴이다. */
export const HAPTIC_PATTERNS = {
  /** 알 넘어감 — 읽지 않기일 때만 울린다. */
  beadAdvance: [18],
  /** 단 전환. */
  decadeChange: [28, 60, 28, 60, 28],
  /** 설정에서 읽지 않기를 켤 때. */
  silentModeOn: [20, 50, 20],
  /** 하루 완주 (FR-27). */
  dayComplete: [200],
} as const;
