/**
 * 홈 카드가 무엇을 말할지 정하는 규칙 (06-screen-spec 화면 A · FR-02·03·36·42).
 *
 * 카드 한 장이 답해야 하는 질문은 하나다 — **"오늘 이 기도는 어디까지 왔나."** 그 답이
 * 다섯 갈래로 갈리고, 갈래마다 다른 말을 한다. 화면이 아니라 여기서 갈래를 정하는 것은
 * 그래야 갈래를 시험할 수 있기 때문이다.
 */
import type { PrayerPosition } from '../storage/position';
import { dayIndexOn, hasEnded, prayedTodayAlready } from './rules';
import type { Journey } from './session';

export type CardStatus =
  /** 시작일이 아직 오지 않았다. 흐린 카드이고 기도로 들어가지 않는다 (FR-36 · 06-e 결함 8). */
  | 'notStarted'
  /** 여정이 끝났다. 목록 아래에 놓이고 탭하면 여정 상세로 간다. */
  | 'ended'
  /** 오늘 다 바쳤다. */
  | 'prayedToday'
  /** 오늘 바치다 멈춘 자리가 있다. */
  | 'resume'
  /** 오늘 아직 시작하지 않았다. */
  | 'fresh';

export function cardStatus(
  journey: Journey,
  today: Date,
  position: PrayerPosition | null,
): CardStatus {
  if (dayIndexOn(journey.startDate, today) < 1) return 'notStarted';
  if (hasEnded(journey, today)) return 'ended';
  if (prayedTodayAlready(journey, today)) return 'prayedToday';
  if (isResumable(journey, today, position)) return 'resume';
  return 'fresh';
}

/** 저장된 자리가 이 여정의 오늘 것인가. 어제 것이면 이어가지 않는다. */
export function isResumable(
  journey: Journey,
  today: Date,
  position: PrayerPosition | null,
): boolean {
  if (!position || position.journeyId !== journey.id) return false;
  if (position.dayIndex !== dayIndexOn(journey.startDate, today)) return false;
  return position.stepIndex > 0;
}

/**
 * `제3단 4번째 알부터 이어서` — 멈춘 자리를 말로 적는다 (v5 홈 카드의 `j0-resume` 둘째 줄).
 *
 * @param prayerName 알에 걸리지 않는 자리에서 쓸 기도문 이름 (예: `영광송`).
 */
export function resumeLine(position: PrayerPosition, prayerName?: string): string {
  if (position.decade && position.bead !== null) {
    return `제${position.decade}단 ${position.bead + 1}번째 알부터 이어서`;
  }
  if (position.decade) {
    return prayerName
      ? `제${position.decade}단 ${prayerName}부터 이어서`
      : `제${position.decade}단부터 이어서`;
  }
  return '시작 기도부터 이어서';
}
