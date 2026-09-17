/**
 * 설정을 기기에 저장하고 읽어 오는 곳 (화면 E · FR-06·07·34·38·39 · 06-b §2-2).
 *
 * 설정은 **새로 만드는 여정의 기본값**이라는 점이 중요하다. 낭송 방식과 판본은 여정마다
 * 고정되므로(FR-34 · 결정 1-2), 여기서 값을 바꿔도 진행 중인 여정의 문구와 낭송은 바뀌지
 * 않는다. 바뀌는 것은 앞으로 만드는 여정과, 여정에 매이지 않는 것들(받는 사이 · 손 없이
 * 조작 · 묵주 · 낮과 밤)뿐이다.
 */
import type { PaceKey, RecitationMode } from '../domain/types';
import type { KeyValueStore } from './position';

/** 저장 열쇠. */
export const SETTINGS_KEY = 'myrosary.settings.v1';

/** 낮과 밤 — 기기 설정을 따를 수도 있다 (v5 설정의 `기기 설정 따름`). */
export type ThemePreference = 'system' | 'day' | 'night';

/**
 * 묵주 넷. 이름은 재질로 짓는다 (06-screen-spec S5).
 *
 * 2026-09-09 에 목록이 바뀌었다(`decisions.md` 결정 9). 그전의 셋(`wood` · `pearl` ·
 * `glass`)은 화면 명세가 예로 든 이름이었을 뿐 실제로 그려진 적이 없었고, 공방장이 보낸
 * 실제 묵주 사진 넉 장이 그 자리를 대신했다. 요구사항 FR-39 가 요구하는 것은 "서로 확실히
 * 다른 **셋 이상**"이므로 넷은 그 요구 안이다.
 *
 * 옛 값(`pearl` · `glass`)이 기기에 저장돼 있을 수 있는데, 아래 `parseSettings` 가 모르는
 * 값을 기본값으로 떨어뜨리므로 그런 기기는 조용히 붉은 장미로 열린다.
 */
export type RosaryKey = 'rose' | 'wood' | 'silver' | 'gold';

export interface AppSettings {
  /** 낭송 방식의 기본값 (FR-06). */
  recitation: RecitationMode;
  /** 받는 사이 — 느리게 · 보통 · 빠르게 (FR-07 · S2). */
  pace: PaceKey;
  /** 손 없이 조작 (FR-38). */
  handsFree: boolean;
  /** 묵주 (FR-39 · S5). */
  rosary: RosaryKey;
  /** 낮과 밤 (06-b §2-2). */
  theme: ThemePreference;
}

/** 묵주의 우리말 이름. */
export const ROSARY_NAMES: Record<RosaryKey, string> = {
  rose: '붉은 장미',
  wood: '나무',
  silver: '은',
  gold: '금',
};

/**
 * 묵주 고르기 시트(S5)의 줄 넷. 설명은 사진에서 실제로 보이는 것을 한 줄로 적었다.
 *
 * 설명을 붙인 이유는 이름만으로는 무엇이 다른지 알 수 없기 때문이다. 미리보기가 위에
 * 함께 서 있지만, 화면 낭독기를 쓰는 사람에게는 그림이 닿지 않으므로 말로도 남긴다.
 */
export const ROSARY_CHOICES: ReadonlyArray<{ key: RosaryKey; name: string; note: string }> = [
  { key: 'rose', name: '붉은 장미', note: '장미꽃으로 조각한 알과 검은 끈' },
  { key: 'wood', name: '나무', note: '짙은 나무 알, 주님의 기도만 밝은 살구빛' },
  { key: 'silver', name: '은', note: '은빛 구슬과 은 사슬' },
  { key: 'gold', name: '금', note: '금빛 구슬과 금 사슬' },
];

/** 낭송 방식의 이름과 설명 — 06-screen-spec 화면 E 의 문구 표 그대로다. */
export const RECITATION_CHOICES: ReadonlyArray<{
  key: RecitationMode;
  name: string;
  note: string;
}> = [
  { key: 'full', name: '전부 읽기', note: '앱이 처음부터 끝까지 읽습니다' },
  { key: 'alternate', name: '교대', note: '앞 절은 앱이, 뒷 절은 직접 바칩니다' },
  { key: 'silent', name: '읽지 않기', note: '소리 없이 진동으로만 넘어갑니다' },
];

/** 받는 사이의 이름과 설명 — 06-screen-spec 시트 S2 의 문구 그대로다. */
export const PACE_CHOICES: ReadonlyArray<{ key: PaceKey; name: string; note: string }> = [
  { key: 'slow', name: '느리게', note: '천천히 바침' },
  { key: 'normal', name: '보통', note: '기본' },
  { key: 'fast', name: '빠르게', note: '익숙한 분' },
];

/** 받는 사이의 짧은 이름 — 설정 줄의 오른쪽에 적힌다. */
export const PACE_NAMES: Record<PaceKey, string> = {
  slow: '느리게',
  normal: '보통',
  fast: '빠르게',
};

/** 낭송 방식의 짧은 이름 — v5 는 `교대로` 로 적는다. */
export const RECITATION_NAMES: Record<RecitationMode, string> = {
  full: '전부 소리로',
  alternate: '교대로',
  silent: '소리 없이',
};

/**
 * 기본값.
 *
 * **낮과 밤은 낮(한지)으로 고정한다.** PRD D-2 는 "기기 설정 따름"으로 두고 08 검증에서
 * 정하기로 했으나, 2026-09-09 에 공방장이 낮으로 정했다(`decisions.md` 결정 5). 그
 * 전까지는 폰이 어둡게로 맞춰진 사람에게 시안이 그린 적 없는 밤 벌이 첫 화면으로 떴고,
 * 그것이 이 앱의 얼굴로 오해될 수 있었다. 사용자가 밤을 고르는 자리는 설정에 그대로 있다.
 *
 * **손 없이 조작도 PRD 의 기본값(꺼짐)과 다르다.** 08 검증의 중심 질문이 "화면을 보지 않고
 * 손을 쓰지 않고도 다섯 단을 끝까지"(DQ-05)인데, 그 입력이 꺼진 채로 배포되면 검증할 것이
 * 없기 때문이다. `decisions.md` Q-21 이 M1 에 대해 같은 판단을 이미 내렸고, 이 값은 그
 * 판단을 검증 빌드까지 이어 놓은 것이다. 끄는 자리는 설정에 있다.
 */
export const DEFAULT_SETTINGS: AppSettings = {
  recitation: 'alternate',
  pace: 'normal',
  handsFree: true,
  rosary: 'rose',
  theme: 'day',
};

/** 읽어 들인 값에서 아는 것만 골라 쓴다. 모르는 값은 기본값으로 메운다. */
export function parseSettings(raw: string | null): AppSettings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const value = JSON.parse(raw) as Partial<AppSettings>;
    if (!value || typeof value !== 'object') return { ...DEFAULT_SETTINGS };
    return {
      recitation: RECITATION_CHOICES.some((c) => c.key === value.recitation)
        ? (value.recitation as RecitationMode)
        : DEFAULT_SETTINGS.recitation,
      pace: PACE_CHOICES.some((c) => c.key === value.pace)
        ? (value.pace as PaceKey)
        : DEFAULT_SETTINGS.pace,
      handsFree: typeof value.handsFree === 'boolean' ? value.handsFree : DEFAULT_SETTINGS.handsFree,
      rosary: value.rosary && value.rosary in ROSARY_NAMES ? value.rosary : DEFAULT_SETTINGS.rosary,
      theme:
        value.theme === 'day' || value.theme === 'night' || value.theme === 'system'
          ? value.theme
          : DEFAULT_SETTINGS.theme,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export interface SettingsStore {
  load(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<void>;
}

export function createSettingsStore(store: KeyValueStore): SettingsStore {
  return {
    async load() {
      try {
        return parseSettings(await store.getItem(SETTINGS_KEY));
      } catch {
        return { ...DEFAULT_SETTINGS };
      }
    },
    async save(settings) {
      try {
        await store.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch {
        // 저장에 실패해도 앱은 그대로 돈다. 다음 변경에서 다시 시도된다.
      }
    },
  };
}
