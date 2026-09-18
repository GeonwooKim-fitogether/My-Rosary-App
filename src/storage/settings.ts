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
import { ENABLED_LANGUAGES, enabledLanguageFor, type LanguageKey } from '../i18n';
import { PRAYER_FONT_DEFAULT, asFontScaleIndex, type FontScaleIndex } from '../theme/prayerFont';
import { REGION_ORDER, type RegionKey } from '../theme/worldTokens';

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
  /**
   * 낮과 밤 (06-b §2-2).
   *
   * **설정 화면에서 고르는 자리는 W2 슬라이스 C 에서 끊겼다** — 결정 12-2 의 카드 F 가
   * 밤 벌을 접었기 때문이다. 값과 그 값을 읽는 코드(`src/theme/`)는 지우지 않고 그대로
   * 두었으므로, 밤 벌을 되살리기로 하면 설정에 줄 하나를 다시 놓는 것으로 돌아온다.
   */
  theme: ThemePreference;
  /**
   * 진동 (시안 설정의 `haptic` 토글).
   *
   * 끄면 기도 중의 모든 떨림이 멎는다. 실제로 막는 자리는 기기로 나가는 통로 하나이며
   * (`src/prayer/channels.ts` 의 `vibrate`), 이 값이 바뀌면 `appStore` 가 그 통로에 알린다.
   */
  haptic: boolean;
  /**
   * 움직임 줄이기 (시안 설정의 `reduceMotion` 토글).
   *
   * 기기 자체의 "동작 줄이기"와 **더해져서** 쓰인다 — 둘 중 하나만 켜져 있어도 움직임이
   * 멎는다(`src/prayer/useReduceMotion.ts`). 기기 설정을 끌 수 없는 사람에게 앱 안에서
   * 같은 것을 줄 수 있어야 하기 때문이고, 반대로 앱에서 끈다고 기기 설정을 무를 수는 없다.
   */
  reduceMotion: boolean;
  /**
   * 지역 (결정 11 의 새 시안). 색 벌과 성화 묶음이 이 값으로 갈린다.
   * 옛 기기에는 이 값이 없으므로 아래 파서가 한국으로 메운다.
   */
  region: RegionKey;
  /** 화면 문구의 언어. 기도문의 언어는 이것과 갈릴 수 있다 (`src/i18n` 의 `prayerLanguage`). */
  language: LanguageKey;
  /**
   * 앱 안 글자 크기 — 0 작게 · 1 보통 · 2 크게 · 3 아주 크게 (W1 §3-5 · FR-28).
   *
   * 다른 설정과 달리 **설정 화면이 아니라 기도 화면의 `Aa` 단추**가 바꾼다. 시안이 그
   * 손잡이를 기도 화면 머리에 두었기 때문이고, 글자 크기는 기도문을 보면서 고쳐야
   * 맞는지 알 수 있는 값이기 때문이다. 크기 넷의 실제 px 값과 기기 배율과의 관계는
   * `src/theme/prayerFont.ts` 가 정한다.
   */
  fontScale: FontScaleIndex;
}

/**
 * 고를 수 있는 것들의 **차례**만 여기 둔다 — 이름과 설명은 문구 표에 있다.
 *
 * 2026-09-18 에 갈라 두었다 (W4 슬라이스 E). 그전에는 이름과 설명이 이 파일에 한국어로 박혀
 * 있어서, 영어로 바꾼 설정 화면이 절반쯤 한국어로 떴다. 여기 남는 것은 **무엇이 있고 어느
 * 차례로 서는가**이고, 그것을 무엇이라 부르는가는 `src/i18n/appStrings.ts` 의
 * `rosaryName` · `rosaryNote` · `recitationName` 같은 열쇠가 갖는다. 저장된 값이 올바른지
 * 가리는 일(아래 `parseSettings`)에는 차례만 있으면 되므로 이 갈라짐이 그 일을 막지 않는다.
 */
export const ROSARY_KEYS: readonly RosaryKey[] = ['rose', 'wood', 'silver', 'gold'];

/** 낭송 방식 셋의 차례 — 06-screen-spec 화면 E 의 문구 표와 같은 순서다. */
export const RECITATION_KEYS: readonly RecitationMode[] = ['full', 'alternate', 'silent'];

/** 받는 사이 셋의 차례 — 06-screen-spec 시트 S2 와 같은 순서다. */
export const PACE_KEYS: readonly PaceKey[] = ['slow', 'normal', 'fast'];

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
  // 진동은 켜짐, 움직임 줄이기는 꺼짐 — 시안의 기본값 그대로다(`data.js` 의 `settings`).
  haptic: true,
  reduceMotion: false,
  region: 'korea',
  language: 'ko',
  fontScale: PRAYER_FONT_DEFAULT,
};

/** 읽어 들인 값에서 아는 것만 골라 쓴다. 모르는 값은 기본값으로 메운다. */
export function parseSettings(raw: string | null): AppSettings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const value = JSON.parse(raw) as Partial<AppSettings>;
    if (!value || typeof value !== 'object') return { ...DEFAULT_SETTINGS };
    return {
      recitation: RECITATION_KEYS.includes(value.recitation as RecitationMode)
        ? (value.recitation as RecitationMode)
        : DEFAULT_SETTINGS.recitation,
      pace: PACE_KEYS.includes(value.pace as PaceKey)
        ? (value.pace as PaceKey)
        : DEFAULT_SETTINGS.pace,
      handsFree: typeof value.handsFree === 'boolean' ? value.handsFree : DEFAULT_SETTINGS.handsFree,
      rosary: ROSARY_KEYS.includes(value.rosary as RosaryKey)
        ? (value.rosary as RosaryKey)
        : DEFAULT_SETTINGS.rosary,
      theme:
        value.theme === 'day' || value.theme === 'night' || value.theme === 'system'
          ? value.theme
          : DEFAULT_SETTINGS.theme,
      haptic: typeof value.haptic === 'boolean' ? value.haptic : DEFAULT_SETTINGS.haptic,
      reduceMotion:
        typeof value.reduceMotion === 'boolean'
          ? value.reduceMotion
          : DEFAULT_SETTINGS.reduceMotion,
      region: REGION_ORDER.includes(value.region as RegionKey)
        ? (value.region as RegionKey)
        : DEFAULT_SETTINGS.region,
      /*
        켜지지 않은 언어가 저장돼 있으면 **켜진 언어 하나로 조용히 되돌린다.**

        이 자리가 왜 필요한가. 지금은 지역·언어 화면이 꺼진 다섯을 잠가 두지만, 언어 일곱이
        모두 열려 있던 판(W0~W3)으로 앱을 쓰던 기기에는 이탈리아어나 스페인어가 저장돼
        있을 수 있다. 그 값을 그대로 믿으면 꺼진 언어로 앱이 서고, 앞으로 언어를 끄는 결정이
        한 번 더 나면 같은 일이 되풀이된다.

        **조용히 되돌리는 쪽을 택한 이유**는, 이것이 사용자가 잘못한 일이 아니기 때문이다.
        사람은 그때 열려 있던 목록에서 골랐을 뿐이므로 "당신의 언어를 더 쓸 수 없습니다"
        같은 알림으로 기도를 막을 까닭이 없다. 대신 지역·언어 화면이 그 언어를 `준비 중`
        으로 보여 주므로, 찾아보면 무슨 일이 일어났는지 알 수 있다.

        어느 언어로 떨어지는지는 `enabledLanguageFor` 가 정한다 — 지역의 기본 언어가 켜져
        있으면 그것, 아니면 켜진 목록의 첫 언어다.
      */
      language: ENABLED_LANGUAGES.includes(value.language as LanguageKey)
        ? (value.language as LanguageKey)
        : enabledLanguageFor(
            REGION_ORDER.includes(value.region as RegionKey)
              ? (value.region as RegionKey)
              : DEFAULT_SETTINGS.region,
          ),
      fontScale: asFontScaleIndex(value.fontScale),
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
