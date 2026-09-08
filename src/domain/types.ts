/**
 * 기도 도메인의 타입 정의.
 *
 * `spec/` 의 JSON 파일들은 프레임워크와 무관한 도메인 정본이고(`spec/README.md`),
 * 앱은 그것을 복사하지 않고 그대로 import 해서 쓴다. JSON 자체에는 타입이 없으므로
 * 여기서 타입을 선언하고 import 한 값을 그 타입으로 좁혀 쓴다 — 그래야 키 이름의
 * 오타가 실행 시점이 아니라 타입 검사에서 잡힌다.
 */

/** 기도문 키. `spec/prayers.ko.json` 의 `prayers` 키와 같다. */
export type PrayerKey = 'sign' | 'creed' | 'our' | 'hail' | 'glory' | 'save' | 'decl';

/** 77단계 중 한 단계. `spec/prayer-sequence.json` 의 `steps` 한 원소. */
export interface PrayerStep {
  /** 시작 기도 구간인지, 다섯 단 중 하나인지. */
  section: 'opening' | 'decade';
  /** 몇째 단인가 (1~5). 시작 기도 구간에는 없다. */
  decade?: number;
  prayer: PrayerKey;
  /** 화면에 보이는 구간 이름 (예: "제1단 · 성모송"). */
  label: string;
  /** 묵주 그림에서 몇 번째 알인가. 알에 걸리지 않는 단계는 null. */
  bead: number | null;
  /** 그 묶음의 알이 모두 몇 개인가 (성모송 셋 또는 열). */
  of?: number;
  /** 묵주의 큰 알(주님의 기도)인가. */
  big?: boolean;
  /** 0부터 76까지. 자리 저장이 가리키는 값이다 (FR-03). */
  index: number;
}

/** 신비 4종의 키. `spec/mysteries.json` 의 `sets` 키와 같다. */
export type MysteryKey = 'joyful' | 'luminous' | 'sorrowful' | 'glorious';

/** 신비 한 벌 — 이름과 다섯 단의 제목. */
export interface MysterySet {
  name: string;
  decades: string[];
}

/** 여정의 형식 셋 (`spec/journey-rules.md` §1 · FR-33). */
export type JourneyFormat = 'fiftyfour' | 'novena9' | 'daily';

/** 54일 여정의 국면 — 1~27일은 청원, 28~54일은 감사 (FR-35). */
export type JourneyPhase = 'petition' | 'thanksgiving';

/** 낭송 방식 셋 (`spec/journey-rules.md` §4 · FR-06). */
export type RecitationMode = 'full' | 'alternate' | 'silent';

/** 낭송 속도 셋 (FR-07). */
export type PaceKey = 'slow' | 'normal' | 'fast';
