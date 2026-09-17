/**
 * 언어 일곱과 화면 문구.
 *
 * 문구의 정본은 `strings/<언어>.json` 이고, 그 파일들은 시안의 `UI` 표를
 * `tools/w0/extract-world-data.mjs` 가 기계로 쏟아 만든 것이다 — 손으로 옮겨 적으면
 * 일곱 벌 중 한 벌에서 한 글자가 틀리고, 틀린 것을 아무도 못 본다.
 *
 * **켜진 언어와 들어와 있는 언어는 다르다.** 데이터는 일곱 벌이 다 들어와 있지만
 * 고를 수 있는 것은 `ENABLED_LANGUAGES` 에 적힌 것뿐이다. 나머지는 기도문이 공식
 * 문구인지 확인되지 않았고 앞 절·뒷 절로 나뉘지도 않아, 켜면 사람들이 확인되지 않은
 * 기도문을 바치게 된다 (`docs/plan/roadmap-world.md` §3 카드 C · `decisions.md` D-4).
 * 확인이 끝난 언어를 켜는 일은 아래 목록에 한 줄을 더하는 일이다.
 */
import type { RegionKey } from '../theme/worldTokens';
import en from './strings/en.json';
import es from './strings/es.json';
import fr from './strings/fr.json';
import it from './strings/it.json';
import ko from './strings/ko.json';
import pt from './strings/pt.json';
import tl from './strings/tl.json';

/** 데이터가 들어와 있는 언어 일곱. */
export type LanguageKey = 'ko' | 'en' | 'it' | 'fr' | 'es' | 'pt' | 'tl';

/** 화면 문구 한 벌의 모양. 한국어 벌이 그 기준이다. */
export type Strings = typeof ko;

const STRINGS: Readonly<Record<LanguageKey, Strings>> = { ko, en, it, fr, es, pt, tl };

/** 언어의 이름과, 읽어 줄 때 쓰는 음성 코드. */
export const LANGUAGES: Readonly<Record<LanguageKey, { name: string; voice: string }>> = {
  ko: { name: '한국어', voice: 'ko-KR' },
  en: { name: 'English', voice: 'en-US' },
  it: { name: 'Italiano', voice: 'it-IT' },
  fr: { name: 'Français', voice: 'fr-FR' },
  es: { name: 'Español', voice: 'es-ES' },
  pt: { name: 'Português', voice: 'pt-BR' },
  tl: { name: 'Filipino', voice: 'fil-PH' },
};

/** 언어의 차례. 언어 고르기 화면이 이 순서로 보여 준다. */
export const LANGUAGE_ORDER: readonly LanguageKey[] = ['ko', 'en', 'it', 'fr', 'es', 'pt', 'tl'];

/**
 * 지금 고를 수 있는 언어.
 *
 * 한국어는 이 저장소의 정본 기도문(`spec/prayers.ko.json`)이 있어 켜져 있고, 영어는
 * 로드맵 카드 C 의 추천이 먼저 켜라고 한 언어다. **영어를 실제로 켜기 전에 기도문
 * 대조(D-4)가 끝나야 한다** — 그때까지 영어 화면은 문구만 영어이고 기도문은 아직
 * 한국어 정본을 쓴다(`prayerLanguage` 가 그것을 정한다).
 */
export const ENABLED_LANGUAGES: readonly LanguageKey[] = ['ko', 'en'];

/**
 * 기도문을 어느 언어로 바칠 것인가.
 *
 * 화면 문구와 기도문의 언어가 갈리는 이유는 하나다 — 화면 문구는 틀려도 다시 쓰면
 * 그만이지만, 기도문은 사람이 실제로 바치는 말이라 확인되지 않은 것을 내보낼 수 없다.
 * 그래서 확인된 기도문이 있는 언어만 여기서 자기 언어를 돌려받고, 나머지는 한국어
 * 정본으로 떨어진다. 언어 하나가 확인되면 이 표에 한 줄이 늘어난다.
 */
const PRAYER_READY: readonly LanguageKey[] = ['ko'];

/** 기도문을 실제로 읽을 언어를 고른다. */
export const prayerLanguage = (language: LanguageKey): LanguageKey =>
  PRAYER_READY.includes(language) ? language : 'ko';

/** 지역마다 시안이 정해 둔 언어들. 지역을 바꿔도 언어는 사용자가 바꾸기 전까지 그대로다. */
export const REGION_LANGUAGES: Readonly<Record<RegionKey, readonly LanguageKey[]>> = {
  europe: ['en', 'it', 'fr'],
  northamerica: ['en', 'es'],
  southamerica: ['es', 'pt'],
  asia: ['en', 'tl'],
  korea: ['ko'],
};

/** 지역의 기본 언어. 그 지역을 처음 고르는 사람이 만나는 언어다. */
export const REGION_DEFAULT_LANGUAGE: Readonly<Record<RegionKey, LanguageKey>> = {
  europe: 'en',
  northamerica: 'en',
  southamerica: 'es',
  asia: 'en',
  korea: 'ko',
};

/** 그 언어의 문구 한 벌. 모르는 언어가 오면 한국어로 떨어진다. */
export const stringsFor = (language: LanguageKey): Strings => STRINGS[language] ?? ko;

/**
 * 문구에 값을 끼워 넣는다. `{n}` 같은 자리를 채우는 일이며, 시안의 `fmt` 와 같은 규칙이다.
 * 예: `fill('{d}일째 / {t}일', { d: 3, t: 54 })` → `3일째 / 54일`.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return String(template ?? '').replace(/\{(\w+)\}/g, (whole, key: string) =>
    values[key] === undefined || values[key] === null ? whole : String(values[key]),
  );
}
