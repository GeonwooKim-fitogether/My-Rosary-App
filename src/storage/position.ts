/**
 * 오늘의 자리 저장과 이어가기 (FR-02 · FR-03 · FR-17 · `spec/journey-rules.md` §3).
 *
 * 이 앱이 사용자에게 하는 약속 하나가 "오늘 어디까지 바쳤는지는 앱이 기억합니다"이고,
 * 그 약속을 지키는 것이 이 파일이다. **알을 넘길 때마다** 저장하므로 전화가 오든 앱이
 * 꺼지든 잃는 것은 바치던 기도 하나뿐이다.
 *
 * 저장 자리(AsyncStorage)를 직접 붙들지 않고 밖에서 받는다. 그래야 시험이 브라우저나
 * 기기 없이 돌고, 나중에 계정 동기화(M3)가 같은 규칙을 서버 쪽에 다시 쓰지 않아도 된다.
 */
import type { MysteryKey } from '../domain/types';

/** 저장되는 자리 한 벌. 담는 것은 `journey-rules.md` §3 의 "저장 내용"이 정한 그대로다. */
export interface PrayerPosition {
  journeyId: string;
  /** 며칠째인가. 날짜가 바뀌었는지 알아보는 데 쓴다. */
  dayIndex: number;
  /** 0~76. 이 값이 곧 이어가기가 여는 자리다. */
  stepIndex: number;
  /** 몇째 단인가. 시작 기도 구간이면 null. */
  decade: number | null;
  /** 몇 번째 알인가. 알에 걸리지 않는 단계면 null. */
  bead: number | null;
  /** 그날 무슨 신비로 바치고 있었나. 날짜가 바뀌어 오늘의 신비가 달라져도 이것으로 이어간다. */
  mystery: MysteryKey;
  /** 마지막으로 저장한 시각 (ISO 문자열). 두 기기가 부딪혔을 때 판단에 쓴다. */
  savedAt: string;
  /** 오늘 몇 번 이어서 바쳤나. 하루 완주 화면의 "이어서 N번". */
  resumeCount: number;
  /** 오늘 기도에 든 시간의 합. 멈춘 사이는 빼고 센다. */
  elapsedMs: number;
}

/** 아주 작은 저장소 인터페이스. AsyncStorage 도 브라우저의 localStorage 도 이 모양이다. */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** 저장 열쇠. 판이 바뀌면 뒤의 번호를 올려 옛 자리를 조용히 버린다. */
export const POSITION_KEY = 'myrosary.position.v1';

/** 읽어 들인 값이 정말 자리인가. 손상된 자리는 버린다 (PRD §8). */
export function parsePosition(raw: string | null): PrayerPosition | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<PrayerPosition>;
    if (typeof value?.journeyId !== 'string') return null;
    if (!Number.isInteger(value.stepIndex) || (value.stepIndex as number) < 0) return null;
    if (typeof value.mystery !== 'string') return null;
    return {
      journeyId: value.journeyId,
      dayIndex: Number.isInteger(value.dayIndex) ? (value.dayIndex as number) : 1,
      stepIndex: value.stepIndex as number,
      decade: typeof value.decade === 'number' ? value.decade : null,
      bead: typeof value.bead === 'number' ? value.bead : null,
      mystery: value.mystery as MysteryKey,
      savedAt: typeof value.savedAt === 'string' ? value.savedAt : new Date(0).toISOString(),
      resumeCount: Number.isInteger(value.resumeCount) ? (value.resumeCount as number) : 0,
      elapsedMs: Number.isFinite(value.elapsedMs) ? (value.elapsedMs as number) : 0,
    };
  } catch {
    return null;
  }
}

export interface PositionStore {
  /** 저장된 자리를 읽는다. 없거나 손상됐으면 null. */
  load(): Promise<PrayerPosition | null>;
  /** 자리를 남긴다. 알을 넘길 때마다 불린다. */
  save(position: PrayerPosition): Promise<void>;
  /** 오늘 자리를 지운다 — "여기서 끝내기"와 하루를 마쳤을 때. */
  clear(): Promise<void>;
}

/** 저장소 하나를 받아 자리 창고를 만든다. */
export function createPositionStore(store: KeyValueStore): PositionStore {
  return {
    async load() {
      try {
        return parsePosition(await store.getItem(POSITION_KEY));
      } catch {
        return null;
      }
    },
    async save(position) {
      try {
        await store.setItem(POSITION_KEY, JSON.stringify(position));
      } catch {
        // 저장에 실패해도 기도는 멈추지 않는다. 잃는 것은 이어가기뿐이다.
      }
    },
    async clear() {
      try {
        await store.removeItem(POSITION_KEY);
      } catch {
        // 위와 같다.
      }
    },
  };
}
