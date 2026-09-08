/**
 * M1 이 기도할 여정 하나 — v5 시안이 그려 둔 그 여정이다.
 *
 * **이것은 임시 자리다.** 여정을 만들고 고르는 화면(홈 · 새 기도 · 여정 상세)은 M2 의
 * 일이고, 그때 이 파일은 실제 저장소에서 여정을 읽어 오는 것으로 바뀐다. 그런데 기도
 * 화면은 "무엇을 위하여 · 며칠째 · 어느 신비" 없이는 그릴 수가 없다. 그래서 v5 가 시안에
 * 넣어 둔 값을 그대로 세워 두었다 — 지어낸 값은 하나도 없다.
 *
 * v5 에서 가져온 값은 이렇다 (`docs/design/v5/index.html` 의 `J[0]` 과 `seedDays`).
 *
 * | 무엇 | 값 | v5 의 어디 |
 * |---|---|---|
 * | 지향 | 어머니 병환 회복 | `J[0].title` |
 * | 국면 | 청원 | `J[0].kind` |
 * | 며칠째 | 23일째 | `seedDays()` 의 `today` 자리(23번째 칸) |
 * | 그날 날짜 | 9월 5일 | `dateKo()` 가 못박은 대응 (23일째 = 2026-09-05) |
 * | 54칸의 모양 | 스무 칸 바침 · 두 칸 거름 · 23번째가 오늘 | `seedDays()` |
 *
 * v5 의 여정 상세 화면에는 `7월 14일 시작` 이라는 글자가 따로 박혀 있는데, 그 값은
 * `dateKo()` 가 계산하는 날짜와 맞지 않는다(23일째를 9월 5일로 놓으면 시작일은 8월
 * 14일이다). 시안 안에서 어긋난 두 값 중 **계산에 쓰이던 쪽**을 따랐다. 여정 상세는
 * M2 의 화면이므로 그때 다시 확인한다.
 */
import { mysteryForDay, phaseForFiftyfourDay, FIFTYFOUR_LENGTH } from '../domain/mysteries';
import type { JourneyFormat, MysteryKey } from '../domain/types';
import { addDays } from './format';

/** 54칸 하나하나의 상태. v5 의 `FILL` 표와 같은 낱말을 쓴다. */
export type DayState = 'prayed' | 'missed' | 'today' | 'future';

export interface Journey {
  id: string;
  /** 무엇을 위하여 바치는가 — 바람 한 줄. */
  title: string;
  format: JourneyFormat;
  /** 여정의 첫날. 며칠째와 날짜를 잇는 기준이다. */
  startDate: Date;
  /** 54칸. 배열의 자리 + 1 이 며칠째다. */
  days: DayState[];
}

/** v5 의 `seedDays()` — 스무 칸을 바쳤고 두 칸을 걸렀으며 23번째 칸이 오늘이다. */
function seedDays(): DayState[] {
  const days: DayState[] = Array.from({ length: FIFTYFOUR_LENGTH }, () => 'future');
  const prayed = [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21];
  for (const k of prayed) days[k] = 'prayed';
  days[7] = 'missed';
  days[15] = 'missed';
  days[22] = 'today';
  return days;
}

/** 23일째가 2026년 9월 5일이 되도록 잡은 시작일. */
const SEED_START_DATE = new Date(2026, 7, 14);

/** 지금 앱이 들고 있는 여정. M2 에서 실제 저장소가 이 자리를 대신한다. */
export const currentJourney: Journey = {
  id: 'seed-fiftyfour',
  title: '어머니 병환 회복',
  format: 'fiftyfour',
  startDate: SEED_START_DATE,
  days: seedDays(),
};

/** 며칠째인가 — 54칸에서 `today` 가 앉은 자리로 센다 (v5 의 `dayNo`). */
export function dayNumber(journey: Journey): number {
  const at = journey.days.indexOf('today');
  return at < 0 ? journey.days.length : at + 1;
}

/** 며칠째의 날짜. */
export function dateOfDay(journey: Journey, dayIndex: number): Date {
  return addDays(journey.startDate, dayIndex - 1);
}

/**
 * 바친 날·거른 날·남은 날 (v5 의 `tally`). `today` 는 바친 쪽으로 센다.
 *
 * 오늘을 아직 바치지 않은 화면(기도 화면·홈)에서 쓴다. **하루를 막 마친 뒤에는 쓰지
 * 않는다** — 그때는 `today` 가 이미 내일 칸으로 옮겨 가 있어서, 내일을 바친 것으로
 * 세게 된다. 그 자리에는 아래 `tallyAfterFinishing` 을 쓴다.
 */
export function tally(journey: Journey): { done: number; missed: number; left: number } {
  let done = 0;
  let missed = 0;
  let left = 0;
  for (const state of journey.days) {
    if (state === 'prayed' || state === 'today') done++;
    else if (state === 'missed') missed++;
    else left++;
  }
  return { done, missed, left };
}

/**
 * 하루를 막 마친 직후의 셈 — 하루 완주 화면이 쓴다.
 *
 * `completeToday` 가 오늘 칸을 `prayed` 로 바꾸고 `today` 를 다음 칸으로 옮긴 뒤에
 * 불린다. 그래서 여기서는 **`prayed` 만 바친 날로 세고, 새로 놓인 `today` 는 남은
 * 날로 센다.** 그렇게 해야 방금 스물세 번째 날을 바친 사람에게 "스물한 날 바쳤고
 * 서른한 날 남았다"고, 곧 실제로 지나온 만큼만 말하게 된다.
 *
 * 이 구분이 필요한 이유는 v5 가 남긴 주석이 말해 준다 — 날짜 번호와 리본이 따로 놀아
 * "리본은 24일째를 가리키는데 머리글은 스물세 번째 날이라고 말하는" 어긋남이 실제로
 * 있었다. 머리글을 방금 바친 날로 되돌린 이상, 셈도 같은 시점을 가리켜야 한다.
 */
export function tallyAfterFinishing(journey: Journey): {
  done: number;
  missed: number;
  left: number;
} {
  let done = 0;
  let missed = 0;
  let left = 0;
  for (const state of journey.days) {
    if (state === 'prayed') done++;
    else if (state === 'missed') missed++;
    else left++;
  }
  return { done, missed, left };
}

/** 오늘의 신비. 54일 기도는 며칠째로, 나머지는 요일로 정한다 (FR-43). */
export function mysteryOf(journey: Journey, today: Date = new Date()): MysteryKey {
  return mysteryForDay(journey.format, {
    dayIndex: dayNumber(journey),
    weekday: today.getDay(),
  });
}

/** `23일째 · 청원` 처럼 화면 머리에 붙는 한 줄 (FR-35). */
export function dayLabel(journey: Journey): string {
  const n = dayNumber(journey);
  if (journey.format !== 'fiftyfour') return `${n}일째`;
  return `${n}일째 · ${phaseForFiftyfourDay(n) === 'petition' ? '청원' : '감사'}`;
}

/**
 * 오늘을 바친 것으로 표시하고 다음 날로 넘긴다 (v5 의 `finishDay`).
 *
 * **기억은 앱이 살아 있는 동안만 남는다.** 여정을 저장하는 일은 M2 의 몫이고, M1 이
 * 저장하는 것은 오늘 어디까지 바쳤는가(자리)뿐이다. 앱을 다시 열면 이 여정은 다시
 * 23일째로 돌아온다.
 *
 * @returns 여정을 다 마쳤으면 true.
 */
export function completeToday(journey: Journey): boolean {
  const at = journey.days.indexOf('today');
  if (at < 0) return true;
  journey.days[at] = 'prayed';
  if (at + 1 < journey.days.length) {
    journey.days[at + 1] = 'today';
    return false;
  }
  return true;
}
