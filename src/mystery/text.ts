/**
 * 신비 한 벌을 화면에 적을 수 있는 다섯 줄로 만든다 — 번호 · 제목 · 성경 구절 · 해설.
 *
 * W2 의 슬라이스 B 가 세우는 두 화면(오늘의 신비 · 신비 해설)이 같은 다섯 줄을 쓰므로,
 * 줄을 만드는 규칙을 화면 밖에 한 번만 적어 둔다. 화면마다 다시 적으면 두 화면이 같은
 * 신비를 다른 글로 말하게 된다.
 *
 * ── 값이 어디서 오나 (셋이 갈린다) ───────────────────────────────────────────
 *
 * | 칸 | 어디서 오나 | 왜 거기인가 |
 * |---|---|---|
 * | 제목 | 한국어는 `spec/mysteries.json`, 그 밖의 언어는 `spec/mysteries.world.json` 의 `names` | 아래 설명 |
 * | 성경 구절 | `spec/mysteries.world.json` 의 `scripture` | 이 저장소에 없던 값이라 시안이 유일한 출처다 |
 * | 해설 한 문단 | `spec/mysteries.world.json` 의 `meditations` | 같다. 없으면 영어로 떨어진다 |
 *
 * **왜 한국어 제목만 시안이 아니라 이 저장소의 정본을 쓰나.** 두 곳의 글이 다르기 때문이다.
 * 이 저장소의 정본(`spec/mysteries.json`)은 `마리아님께서 예수님을 잉태하심` 이라 적고,
 * 시안은 `마리아께서 예수님을 잉태하심을 묵상합시다.` 라 적는다. 홈 화면과 기도 화면이
 * 이미 앞의 것을 보여 주고 있으므로, 새 화면이 뒤의 것을 보여 주면 **같은 신비가 화면마다
 * 다른 이름으로 불린다.** 로드맵 §2 의 원칙 2 도 값이 어긋나면 `spec/` 이 이긴다고 정해 두었다.
 *
 * **해설이 한국어로 없으면 영어를 그대로 둔다.** 지어내지 않는다 — 이 저장소는 기도문과
 * 해설을 기억에 기대어 넣지 않는다. 시안의 `mysteriesOf` 도 같은 순서로 떨어진다
 * (`docs/design/world/MyRosary World.dc.html` 571 행).
 *
 * 세 벌 모두 `tools/w0/extract-world-data.mjs` 가 시안에서 기계로 뽑아 앉힌 것이며,
 * 손으로 옮겨 적은 글자는 하나도 없다.
 */
import world from '../../spec/mysteries.world.json';
import { MYSTERY_SETS } from '../domain/mysteries';
import { monthDayWeekday } from '../journey/format';
import type { MysteryKey } from '../domain/types';
import type { LanguageKey } from '../i18n';

/** 신비 네 벌의 차례. 해설 화면의 탭이 이 순서로 선다 (시안의 `MYSTERY_SETS`). */
export const MYSTERY_SET_ORDER = world.sets as readonly MysteryKey[];

/** 화면에 적히는 한 단. */
export interface MysteryRow {
  /** 몇째 단인가. 1 부터 센다. */
  n: number;
  /** 그 단의 제목. */
  title: string;
  /** 성경 구절 표기 (예: `Lk 1:26-38`). */
  ref: string;
  /** 해설 한 문단. 그 언어에 없으면 영어, 영어에도 없으면 빈 글이다. */
  note: string;
}

type ByLanguage = Readonly<Record<string, Readonly<Record<string, readonly string[]>>>>;

const NAMES = world.names as ByLanguage;
const MEDITATIONS = world.meditations as ByLanguage;
const SCRIPTURE = world.scripture as Readonly<Record<string, readonly string[]>>;

/** 그 언어의 제목 — 한국어는 이 저장소의 정본이 이긴다 (위 표의 설명). */
function titleFor(set: MysteryKey, language: LanguageKey, index: number): string {
  const canonical = MYSTERY_SETS[set].decades[index] ?? '';
  if (language === 'ko') return canonical;
  return NAMES[language]?.[set]?.[index] ?? NAMES.en?.[set]?.[index] ?? canonical;
}

/** 그 언어의 해설 — 없으면 영어를 그대로 둔다. 지어내지 않는다. */
function noteFor(set: MysteryKey, language: LanguageKey, index: number): string {
  return MEDITATIONS[language]?.[set]?.[index] ?? MEDITATIONS.en?.[set]?.[index] ?? '';
}

/** 신비 한 벌의 다섯 줄. */
export function mysteryRows(set: MysteryKey, language: LanguageKey): MysteryRow[] {
  return MYSTERY_SETS[set].decades.map((_, index) => ({
    n: index + 1,
    title: titleFor(set, language, index),
    ref: SCRIPTURE[set]?.[index] ?? '',
    note: noteFor(set, language, index),
  }));
}

/**
 * 탭에 적히는 짧은 이름 — `환희의 신비` 에서 `환희` 만 떼어 낸다.
 *
 * 바탕은 시안의 규칙이다 (`setShort` — 첫 빈칸이나 가운뎃점 앞까지). 네 탭이 한 줄에
 * 나란히 서야 해서 긴 이름이 들어가지 않기 때문이다.
 *
 * **한국어에서 한 걸음 더 간다.** 시안의 규칙을 `환희의 신비` 에 그대로 쓰면 `환희의` 라는
 * 끊긴 말이 남는다 — 관형격 조사 `의` 가 뒤에 올 말을 기다리는 모양이라, 탭 하나에 홀로
 * 서면 문장이 잘린 것처럼 읽힌다. 그래서 한국어에서는 그 조사 한 글자를 함께 뗀다.
 * 영어(`Joyful Mysteries` → `Joyful`)는 시안의 규칙 그대로다.
 */
export function shortSetName(fullName: string): string {
  const head = fullName.split(/[ \u00b7]/)[0] ?? fullName;
  return head.length > 1 && head.endsWith('의') ? head.slice(0, -1) : head;
}

/**
 * `9월 5일 금요일` · `Friday, September 5` — 시안의 `todayLabel`(달·날·요일을 긴 이름으로).
 *
 * 홈과 오늘의 신비 화면이 같은 날짜를 같은 모양으로 적어야 해서 여기 모았다.
 * 언어에 따라 날짜를 만드는 방식이 갈리는 규칙은 `src/journey/format.ts` 의
 * `monthDayWeekday` 가 갖는다.
 */
export function todayLabel(today: Date, language: LanguageKey): string {
  return monthDayWeekday(today, language);
}
