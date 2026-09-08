/**
 * 여정을 기기에 저장하고 읽어 오는 곳 (FR-04 · PRD §7 · `spec/journey-rules.md` §3).
 *
 * M1 까지 여정은 앱이 살아 있는 동안만 있었다 — 앱을 다시 열면 시드 여정이 늘 23일째로
 * 돌아왔다. 여기서 그것이 실제 기억이 된다. 저장 자리(AsyncStorage)를 직접 붙들지 않고
 * 밖에서 받는 것은 `position.ts` 와 같은 이유다: 시험이 브라우저나 기기 없이 돌고,
 * 계정 동기화(M3)가 같은 규칙을 서버 쪽에 다시 쓰지 않아도 된다.
 *
 * **날짜는 `2026-09-08` 같은 날짜 문자열로 저장한다.** 시각이 붙은 형식(ISO)으로 저장하면
 * 기기의 시간대가 바뀌었을 때 같은 날이 하루 앞뒤로 밀린다. 여정의 시작일은 시각이 아니라
 * 날짜이므로 날짜만 적는다.
 */
import type { JourneyFormat, JourneyPhase, RecitationMode } from '../domain/types';
import type { DayState, Journey } from '../journey/session';
import type { KeyValueStore } from './position';

/** 저장 열쇠. 판이 바뀌면 뒤의 번호를 올려 옛 자리를 조용히 버린다. */
export const JOURNEYS_KEY = 'myrosary.journeys.v1';

/** 저장되는 여정 한 벌 — `Journey` 에서 날짜만 문자열로 바뀐 모양이다. */
export interface StoredJourney {
  id: string;
  title: string;
  format: JourneyFormat;
  /** `YYYY-MM-DD`. */
  startDate: string;
  days: DayState[];
  kind: JourneyPhase;
  recitation: RecitationMode;
}

const DAY_STATES: readonly DayState[] = ['prayed', 'missed', 'today', 'future'];
const FORMATS: readonly JourneyFormat[] = ['fiftyfour', 'novena9', 'daily'];
const RECITATIONS: readonly RecitationMode[] = ['full', 'alternate', 'silent'];

/** `2026-09-08` 꼴로 적는다. 기기 현지 날짜다. */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** 날짜 문자열을 그 날 자정으로 되돌린다. 형식이 아니면 null. */
export function fromDateKey(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function serializeJourney(journey: Journey): StoredJourney {
  return {
    id: journey.id,
    title: journey.title,
    format: journey.format,
    startDate: toDateKey(journey.startDate),
    days: [...journey.days],
    kind: journey.kind,
    recitation: journey.recitation,
  };
}

/**
 * 읽어 들인 값이 정말 여정인가. 손상된 것은 버린다 (PRD §8).
 *
 * 하나가 손상됐다고 나머지까지 잃지 않도록 여정 하나하나를 따로 본다 — 여기가 사용자의
 * 기도 기록이라 잃는 것의 값이 크다.
 */
export function parseJourney(value: unknown): Journey | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<StoredJourney>;
  if (typeof raw.id !== 'string' || !raw.id) return null;
  if (typeof raw.title !== 'string') return null;
  if (!FORMATS.includes(raw.format as JourneyFormat)) return null;
  if (typeof raw.startDate !== 'string') return null;
  const startDate = fromDateKey(raw.startDate);
  if (!startDate) return null;
  if (!Array.isArray(raw.days)) return null;

  return {
    id: raw.id,
    title: raw.title,
    format: raw.format as JourneyFormat,
    startDate,
    days: raw.days.map((state) => (DAY_STATES.includes(state) ? state : 'future')),
    kind: raw.kind === 'thanksgiving' ? 'thanksgiving' : 'petition',
    recitation: RECITATIONS.includes(raw.recitation as RecitationMode)
      ? (raw.recitation as RecitationMode)
      : 'alternate',
  };
}

/** 저장된 문자열을 여정 목록으로. 아무것도 없거나 통째로 깨졌으면 빈 목록이다. */
export function parseJourneys(raw: string | null): Journey[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.map(parseJourney).filter((j): j is Journey => j !== null);
  } catch {
    return [];
  }
}

export interface JourneyStore {
  load(): Promise<Journey[]>;
  save(journeys: readonly Journey[]): Promise<void>;
}

export function createJourneyStore(store: KeyValueStore): JourneyStore {
  return {
    async load() {
      try {
        return parseJourneys(await store.getItem(JOURNEYS_KEY));
      } catch {
        return [];
      }
    },
    async save(journeys) {
      try {
        await store.setItem(JOURNEYS_KEY, JSON.stringify(journeys.map(serializeJourney)));
      } catch {
        // 저장에 실패해도 기도는 멈추지 않는다. 다음 저장에서 다시 시도된다.
      }
    },
  };
}
