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
import { appStringsFor, type AppStrings } from './appStrings';
import en from './strings/en.json';
import es from './strings/es.json';
import fr from './strings/fr.json';
import it from './strings/it.json';
import ko from './strings/ko.json';
import pt from './strings/pt.json';
import tl from './strings/tl.json';

/** 데이터가 들어와 있는 언어 일곱. */
export type LanguageKey = 'ko' | 'en' | 'it' | 'fr' | 'es' | 'pt' | 'tl';

/**
 * 화면 문구 한 벌의 모양 — **두 표가 겹쳐 하나가 된다.**
 *
 * 앞의 것은 시안의 `UI` 표에서 기계로 뽑아 온 `strings/*.json` 이고, 뒤의 것은 이 저장소가
 * 손으로 쓰는 `appStrings.ts` 다. 둘을 나눠 둔 까닭은 그 파일의 머리글에 있다 — 짧게는,
 * 앞의 것이 도구가 덮어쓰는 파일이라 손으로 열쇠를 더하면 다음 실행에서 사라지기 때문이다.
 */
export type Strings = typeof ko & AppStrings;

const WORLD: Readonly<Record<LanguageKey, typeof ko>> = { ko, en, it, fr, es, pt, tl };

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
 * ★ 언어를 켜고 끄는 스위치 — 이 한 줄이 전부다 (결정 12-2 카드 C).
 *
 * 지금 고를 수 있는 언어는 한국어와 영어 둘이고, 나머지 다섯(이탈리아어 · 프랑스어 ·
 * 스페인어 · 포르투갈어 · 필리핀어)은 **지워지지 않은 채 꺼져 있다.** 문구 일곱 벌은
 * `strings/` 에 그대로 있으므로, 다섯을 다시 켜는 일은 **아래 배열에 그 언어 이름을 적어
 * 넣는 일 하나**다. 다른 파일은 손대지 않아도 된다 — 지역·언어 화면(`app/region.tsx`)도,
 * 기기에 저장된 값을 읽는 자리(`src/storage/settings.ts`)도 모두 이 배열만 본다.
 *
 * 켜기 전에 반드시 끝나야 하는 일이 하나 있다. **그 언어의 기도문을 사람이 공식 판본과
 * 대조하는 일**이다(아래 `PRAYER_VERIFIED`). 화면 문구는 틀려도 다시 쓰면 그만이지만
 * 기도문은 사람이 실제로 바치는 말이라, 확인되지 않은 것을 켜면 **틀린 기도문을 바치게
 * 하는 사고**가 된다(`docs/plan/roadmap-world.md` §7 · `decisions.md` D-4).
 *
 * 켜는 것과 확인된 것은 다른 이야기다. 한국어와 영어가 켜져 있는 것은 **화면 문구**를
 * 믿을 수 있기 때문이고, 두 언어의 기도문도 아직 대조가 끝나지 않았다. 그래서 기도문은
 * 켜진 언어와 무관하게 `PRAYER_READY` 가 따로 정한다.
 */
export const ENABLED_LANGUAGES: readonly LanguageKey[] = ['ko', 'en'];

/**
 * 그 언어의 기도문을 사람이 공식 판본과 대조했나 — **지금은 일곱 벌이 모두 `false` 다.**
 *
 * 로드맵 §7 의 위험 표가 "언어 일곱의 기도문이 틀렸을 수 있다"의 대비로 적어 둔 표시가
 * 이것이다. 표가 코드 안에 있어야 하는 이유는, 확인되지 않았다는 사실이 **문서에만 있으면
 * 다음 사람이 그것을 모른 채 언어를 켜기** 때문이다.
 *
 * 한국어까지 `false` 인 것은 실수가 아니다. 이 저장소의 한국어 기도문(`spec/prayers.ko.json`)
 * 은 `spec/README.md` 가 밝히듯 **임시 판본**이고, 교구 인가 판본과의 대조는 사람 몫으로
 * 남아 있다. 켜진 언어에까지 정직하게 `false` 를 적어 두는 편이, 켜진 것을 확인된 것으로
 * 읽게 두는 것보다 낫다.
 *
 * 어느 언어의 대조가 끝나면 그 줄을 `true` 로 고치고, 그 사실을 `decisions.md` 에 남긴다.
 */
export const PRAYER_VERIFIED: Readonly<Record<LanguageKey, boolean>> = {
  ko: false,
  en: false,
  it: false,
  fr: false,
  es: false,
  pt: false,
  tl: false,
};

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

/**
 * 이 지역에서 **켜져 있는** 언어 하나를 고른다. 꺼진 언어로 앱이 열리는 일을 막는 자리다.
 *
 * 왜 `REGION_DEFAULT_LANGUAGE` 를 그대로 쓰지 않나. 위 표는 **언어 일곱이 다 켜져 있을 때의
 * 기본값**이라 지금 꺼져 있는 언어를 가리키는 칸이 있다 — 남미의 기본 언어는 스페인어인데
 * 스페인어는 꺼져 있다. 기기에 저장된 언어가 꺼졌을 때 그 표로 곧장 떨어뜨리면 **꺼진 언어로
 * 앱이 서는** 일이 생긴다. 화면은 스페인어로 그려지는데 지역·언어 화면에서는 그 줄이
 * `준비 중` 으로 잠겨 있어, 사람이 자기 언어를 바꿀 수도 없는 막다른 자리가 된다.
 *
 * 그래서 지역의 기본 언어가 켜져 있으면 그것을 쓰고, 꺼져 있으면 **켜진 목록의 첫 언어**
 * (한국어 — 이 앱의 기본 언어)로 간다. 남미에서 한국어로 여는 것이 최선이라서가 아니라,
 * 이 자리는 **사람이 화면을 눌러서는 닿을 수 없는 상태**를 수습하는 자리이기 때문이다.
 * 언어를 더 켜면 이 함수는 저절로 더 나은 답을 낸다.
 */
export function enabledLanguageFor(region: RegionKey): LanguageKey {
  const byRegion = REGION_DEFAULT_LANGUAGE[region];
  return ENABLED_LANGUAGES.includes(byRegion) ? byRegion : ENABLED_LANGUAGES[0]!;
}

/**
 * 그 언어의 문구 한 벌. 모르는 언어가 오면 한국어로 떨어진다.
 *
 * 벌을 미리 겹쳐 두고 그것을 돌려준다. 부를 때마다 새 객체를 만들면 화면이 다시 그려질
 * 때마다 문구 객체가 새것이 되어, 그 객체를 의존성으로 보는 자리들이 불필요하게 다시 돈다.
 */
const STRINGS = Object.fromEntries(
  LANGUAGE_ORDER.map((language) => [
    language,
    { ...WORLD[language], ...appStringsFor(language) },
  ]),
) as Readonly<Record<LanguageKey, Strings>>;

export const stringsFor = (language: LanguageKey): Strings => STRINGS[language] ?? STRINGS.ko;

/**
 * 날짜·수를 그 언어의 관습으로 적을 때 쓰는 지역 표시 (BCP 47).
 *
 * 읽어 줄 때 쓰는 음성 코드(`LANGUAGES[…].voice`)와 같은 값이다. 둘은 뜻이 달라 언젠가
 * 갈릴 수 있으므로 이름을 따로 두되, 지금은 같은 값을 가리킨다.
 */
export const localeOf = (language: LanguageKey): string => LANGUAGES[language].voice;

/**
 * 문구에 값을 끼워 넣는다. `{n}` 같은 자리를 채우는 일이며, 시안의 `fmt` 와 같은 규칙이다.
 * 예: `fill('{d}일째 / {t}일', { d: 3, t: 54 })` → `3일째 / 54일`.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return String(template ?? '').replace(/\{(\w+)\}/g, (whole, key: string) =>
    values[key] === undefined || values[key] === null ? whole : String(values[key]),
  );
}
