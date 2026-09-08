/**
 * 여정의 달력 규칙 — 형식 셋과 "오늘이 며칠째인가" (`spec/journey-rules.md` §1 · FR-33·35).
 *
 * M1 까지 여정은 화면 하나를 그리기 위한 시드였고, 며칠째인가는 54칸 배열에서 `today`
 * 칸이 앉은 자리로 정해졌다(`session.ts`). M2 에서 여정이 실제로 저장되면서 그 방식만으로는
 * 모자라게 됐다 — **앱을 안 켠 날에도 날짜는 흐르기 때문이다.** 그래서 며칠째는 언제나
 * 달력에서 오고(`dayIndexOn`), 칸 배열은 그 달력에 맞춰 다시 칠해진다(`rolledDays`).
 *
 * 칸의 뜻은 이렇게 정해진다. 이 규칙이 이 파일의 전부라 해도 좋다.
 *
 * | 그 날이 | 칸의 상태 |
 * |---|---|
 * | 바친 날 | `prayed` |
 * | 오늘보다 앞인데 바치지 않은 날 | `missed` — 빈 칸으로 남는다. 처음부터 다시 하라고 하지 않는다 (FR-35) |
 * | 오늘인데 아직 안 바친 날 | `today` |
 * | 오늘보다 뒤 | `future` |
 *
 * **오늘을 바치고 나면 그 칸은 `today` 가 아니라 `prayed` 가 된다.** v5 시안은 하루를
 * 마치면 `today` 표시를 다음 칸으로 옮겼는데, 그것은 날짜가 흐르지 않는 시제품이라
 * 가능했던 것이고 달력을 쓰는 순간 "오늘 표시가 내일에 붙는" 어긋남이 된다. 실제로 그
 * 어긋남 때문에 하루 완주 화면의 셈이 하루 틀어진 적이 있다(`decisions.md` Q-20).
 */
import type { JourneyFormat, JourneyPhase } from '../domain/types';
import { FIFTYFOUR_LENGTH, FIFTYFOUR_PETITION_DAYS } from '../domain/mysteries';
import type { DayState, Journey } from './session';
import { addDays, monthDayKo } from './format';

/** 9일 기도의 길이. */
export const NOVENA_LENGTH = 9;

/** 형식마다의 길이. `날마다`는 끝이 없어 null 이다 (`journey-rules.md` §1). */
export function journeyLength(format: JourneyFormat): number | null {
  if (format === 'fiftyfour') return FIFTYFOUR_LENGTH;
  if (format === 'novena9') return NOVENA_LENGTH;
  return null;
}

/** 형식의 이름 — 화면에 그대로 적는다. */
export function formatName(format: JourneyFormat): string {
  if (format === 'fiftyfour') return '54일 기도';
  if (format === 'novena9') return '9일 기도';
  return '날마다';
}

/** 자정으로 맞춘 사본. 시각이 섞이면 하루 차이가 들쭉날쭉해진다. */
export function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * 며칠째인가 — `(오늘 − 시작일) + 1`, 기기 현지 날짜 기준 (`journey-rules.md` §1).
 *
 * 시작일이 미래면 0 이하가 나온다. 그 여정은 홈에서 흐린 카드로 보이고 기도로 들어가지
 * 않는다 (FR-36 · 06-e 결함 8).
 */
export function dayIndexOn(startDate: Date, today: Date): number {
  const from = atMidnight(startDate).getTime();
  const to = atMidnight(today).getTime();
  return Math.round((to - from) / 86_400_000) + 1;
}

/** 마치는 날. 54일이면 시작일 + 53일, 9일이면 + 8일. `날마다`는 없다. */
export function finishDateOf(journey: Journey): Date | null {
  const length = journeyLength(journey.format);
  return length === null ? null : addDays(journey.startDate, length - 1);
}

/**
 * 달력에 맞춰 칸을 다시 칠한다. 바친 날은 그대로 두고 나머지만 오늘을 기준으로 정한다.
 *
 * `날마다`는 끝이 없으므로 칸이 오늘까지 자란다. 형식에 길이가 있으면 그 길이를 넘지 않는다.
 */
export function rolledDays(journey: Journey, today: Date): DayState[] {
  const dayIndex = dayIndexOn(journey.startDate, today);
  const fixed = journeyLength(journey.format);
  const length =
    fixed ?? Math.max(1, Math.max(journey.days.length, dayIndex > 0 ? dayIndex : 1));

  const days: DayState[] = [];
  for (let i = 0; i < length; i++) {
    const n = i + 1;
    if (journey.days[i] === 'prayed') days.push('prayed');
    else if (n < dayIndex) days.push('missed');
    else if (n === dayIndex) days.push('today');
    else days.push('future');
  }
  return days;
}

/** 바친 날·못 바친 날·남은 날. 오늘 칸은 아직 바치지 않은 날이므로 남은 쪽으로 센다. */
export function countDays(days: readonly DayState[]): {
  prayed: number;
  missed: number;
  remaining: number;
} {
  let prayed = 0;
  let missed = 0;
  let remaining = 0;
  for (const state of days) {
    if (state === 'prayed') prayed++;
    else if (state === 'missed') missed++;
    else remaining++;
  }
  return { prayed, missed, remaining };
}

/** 오늘 바쳤나. */
export function prayedTodayAlready(journey: Journey, today: Date): boolean {
  const dayIndex = dayIndexOn(journey.startDate, today);
  return dayIndex >= 1 && journey.days[dayIndex - 1] === 'prayed';
}

/**
 * 여정이 끝났나 — 마지막 날을 바쳤거나, 마지막 날이 지나갔거나.
 * `날마다`는 끝이 없으므로 언제나 false 다.
 */
export function hasEnded(journey: Journey, today: Date): boolean {
  const length = journeyLength(journey.format);
  if (length === null) return false;
  if (journey.days[length - 1] === 'prayed') return true;
  return dayIndexOn(journey.startDate, today) > length;
}

/**
 * 오늘을 바친 것으로 새긴다. 달력에 맞춰 칸을 다시 칠한 뒤 오늘 칸만 바친 칸으로 바꾼다.
 *
 * @returns 새 칸 배열과, 이것으로 여정이 끝났는지.
 */
export function withTodayPrayed(
  journey: Journey,
  today: Date,
): { days: DayState[]; ended: boolean } {
  const days = rolledDays(journey, today);
  const dayIndex = dayIndexOn(journey.startDate, today);
  if (dayIndex >= 1 && dayIndex <= days.length) days[dayIndex - 1] = 'prayed';

  const length = journeyLength(journey.format);
  const ended = length !== null && dayIndex >= length;
  return { days, ended };
}

/**
 * 그 날의 국면 — 청원인가 감사인가 (FR-35 · v5 새 기도의 구역 ②).
 *
 * 54일 기도만 국면을 갖는다. 여정을 만들 때 `청원`을 고르면 앞의 27일이 청원, 뒤의
 * 27일이 감사이고(`27일 + 27일`), `감사`를 고르면 쉰네 날 내내 감사다 — 두 문구 모두
 * v5 시안이 그 구역에 적어 둔 것이다.
 */
export function phaseOn(journey: Journey, dayIndex: number): JourneyPhase | null {
  if (journey.format !== 'fiftyfour') return null;
  if (journey.kind === 'thanksgiving') return 'thanksgiving';
  return dayIndex <= FIFTYFOUR_PETITION_DAYS ? 'petition' : 'thanksgiving';
}

/** 국면의 우리말 이름. */
export function phaseName(phase: JourneyPhase): string {
  return phase === 'petition' ? '청원' : '감사';
}

/**
 * 홈 카드와 기도 화면 머리에 붙는 한 줄 — `23일째 · 청원` · `4일째` · `6일째 · 함께 바치기`.
 *
 * 형식마다 뒤에 붙는 것이 다르다. 54일은 국면이 붙고, 9일과 날마다는 붙지 않는다
 * (`06-screen-spec.md` 화면 A 의 문구 표).
 */
export function dayLabelOn(journey: Journey, dayIndex: number): string {
  const phase = phaseOn(journey, dayIndex);
  return phase ? `${dayIndex}일째 · ${phaseName(phase)}` : `${dayIndex}일째`;
}

/** 시작 전 카드의 한 줄 — `{N}일 뒤에 시작합니다 · {시작일}` (06-e 결함 8). */
export function notStartedLabel(journey: Journey, today: Date): string {
  const days = 1 - dayIndexOn(journey.startDate, today);
  return `${days}일 뒤에 시작합니다 · ${monthDayKo(journey.startDate)}`;
}
