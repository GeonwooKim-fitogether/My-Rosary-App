/**
 * 신비 4종과 오늘의 신비를 정하는 규칙 (FR-43).
 *
 * 규칙이 둘로 갈린다는 점이 이 파일의 핵심이다. 날마다 기도와 9일 기도는 **요일**로
 * 신비를 정하고, 54일 기도는 요일과 무관하게 **며칠째인가**로 환희·고통·영광을
 * 하루씩 돌린다. 54일 기도에는 빛의 신비가 들어가지 않는다.
 *
 * 값의 정본은 `spec/mysteries.json` 이며 여기서는 import 해서 타입만 입힌다.
 */
import mysteriesJson from '../../spec/mysteries.json';
import type { JourneyFormat, JourneyPhase, MysteryKey, MysterySet } from './types';

/** 신비 4종 × 5단. */
export const MYSTERY_SETS: Readonly<Record<MysteryKey, MysterySet>> =
  mysteriesJson.sets as Record<MysteryKey, MysterySet>;

/**
 * 요일 규칙 — 인덱스 0 이 일요일이다.
 * 일 영광 · 월 환희 · 화 고통 · 수 영광 · 목 빛 · 금 고통 · 토 환희.
 */
export const WEEKDAY_MYSTERIES: readonly MysteryKey[] = mysteriesJson.rules.weekday
  .by_weekday as MysteryKey[];

/** 54일 순환 — 환희, 고통, 영광 셋을 하루씩 돈다. 빛의 신비는 들어가지 않는다. */
export const FIFTYFOUR_CYCLE: readonly MysteryKey[] = mysteriesJson.rules.fiftyfour
  .cycle as MysteryKey[];

/** 54일 여정의 길이. */
export const FIFTYFOUR_LENGTH = 54;

/** 54일 여정에서 청원이 끝나고 감사가 시작되는 경계. 1~27 청원, 28~54 감사. */
export const FIFTYFOUR_PETITION_DAYS = 27;

/**
 * 요일로 오늘의 신비를 정한다 (날마다 기도 · 9일 기도).
 *
 * @param weekday `Date#getDay()` 와 같은 값 — 0 이 일요일이고 6 이 토요일이다.
 */
export function mysteryForWeekday(weekday: number): MysteryKey {
  const set = WEEKDAY_MYSTERIES[weekday];
  if (!set) throw new RangeError(`요일은 0~6 이어야 한다: ${weekday}`);
  return set;
}

/**
 * 며칠째인가로 54일 기도의 오늘의 신비를 정한다.
 *
 * @param dayIndex 1 부터 센다. `cycle[(dayIndex - 1) % 3]`.
 */
export function mysteryForFiftyfourDay(dayIndex: number): MysteryKey {
  if (!Number.isInteger(dayIndex) || dayIndex < 1) {
    throw new RangeError(`며칠째는 1 이상의 정수여야 한다: ${dayIndex}`);
  }
  return FIFTYFOUR_CYCLE[(dayIndex - 1) % FIFTYFOUR_CYCLE.length]!;
}

/**
 * 여정의 형식에 맞는 오늘의 신비를 정한다.
 *
 * 54일 기도만 며칠째를 보고, 나머지 둘은 요일을 본다. 이 갈래가 FR-43 의 핵심이라
 * 형식을 받아 한 곳에서 가른다 — 화면마다 갈래를 다시 쓰면 어긋나기 때문이다.
 */
export function mysteryForDay(
  format: JourneyFormat,
  params: { dayIndex: number; weekday: number },
): MysteryKey {
  return format === 'fiftyfour'
    ? mysteryForFiftyfourDay(params.dayIndex)
    : mysteryForWeekday(params.weekday);
}

/**
 * 54일 여정의 국면 — 1~27일은 청원, 28~54일은 감사 (FR-35).
 * 화면 표기는 "{N}일째 · 청원" 또는 "{N}일째 · 감사".
 */
export function phaseForFiftyfourDay(dayIndex: number): JourneyPhase {
  if (!Number.isInteger(dayIndex) || dayIndex < 1 || dayIndex > FIFTYFOUR_LENGTH) {
    throw new RangeError(`54일 여정의 며칠째는 1~54 여야 한다: ${dayIndex}`);
  }
  return dayIndex <= FIFTYFOUR_PETITION_DAYS ? 'petition' : 'thanksgiving';
}
