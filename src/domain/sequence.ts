/**
 * 한 번의 묵주기도 81단계 (PRD §1-3 · FR-10, 2026-09-09 결정 7 로 개정).
 *
 * 값의 정본은 `spec/prayer-sequence.json` 이다. 이 파일은 그 JSON 을 복사하지 않고
 * import 해서 타입만 입힌다 — 두 벌이 생기면 기도 규칙이 바뀌었을 때 어느 쪽이
 * 정본인지 화면만 보고는 알 수 없게 되기 때문이다.
 */
import sequenceJson from '../../spec/prayer-sequence.json';
import prayersJson from '../../spec/prayers.ko.json';
import type { PrayerKey, PrayerStep } from './types';

/** 81단계 전체. 배열의 자리(0~80)가 곧 `index` 값이다. */
export const STEPS: readonly PrayerStep[] = sequenceJson.steps as PrayerStep[];

/** 한 번의 기도가 몇 단계인가 — 81. */
export const TOTAL_STEPS = sequenceJson.total;

/** 시작 기도 구간의 길이 — 9단계. */
export const OPENING_STEPS = sequenceJson.opening_steps;

/** 마침 기도 구간의 길이 — 2단계 (성모찬송과 성호경). */
export const CLOSING_STEPS = sequenceJson.closing_steps;

/** 한 단의 길이 — 14단계. */
export const STEPS_PER_DECADE = sequenceJson.steps_per_decade;

/** 단의 수 — 5. */
export const DECADES = sequenceJson.decades;

/** 기도문 한 벌 — 앞 절(a)과 뒷 절(b). b 가 빈 문자열이면 나눠 받지 않는 기도다 (FR-11). */
export interface PrayerText {
  name: string;
  a: string;
  b: string;
}

/** 기도문 표. 판본은 아직 미확정이다 (PRD D-4 · `spec/prayers.ko.json` 의 version). */
export const PRAYERS: Readonly<Record<PrayerKey, PrayerText>> = prayersJson.prayers as Record<
  PrayerKey,
  PrayerText
>;

/** 자리(0~80)로 단계를 얻는다. 범위를 벗어나면 undefined. */
export function stepAt(index: number): PrayerStep | undefined {
  return STEPS[index];
}

/** 몇째 단(1~5)에 속한 단계들만 추린다. */
export function stepsOfDecade(decade: number): PrayerStep[] {
  return STEPS.filter((s) => s.section === 'decade' && s.decade === decade);
}
