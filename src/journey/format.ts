/**
 * 여정의 날짜와 차례수를 우리말로 적는 법.
 *
 * v5 시안의 `ordKo` · `dateKo` 를 옮긴 것이다. 하루 완주 화면의 머리글이
 * `9월 5일 · 스물세 번째 날` 인데, 그 "스물세 번째"를 만들어 내는 규칙이 여기 있다.
 * 숫자를 그대로 쓰지 않고 우리말 차례수로 적는 것은 이 앱의 어투에 관한 결정이다 —
 * `23번째 날` 과 `스물세 번째 날` 은 같은 뜻이지만 다른 온도다.
 *
 * 우리말 차례수·셈은 한국어에만 뜻이 있으므로 이름에 `Ko` 를 달아 두고, 언어에 따라 갈리는
 * 날짜와 수는 아래의 `monthDay` · `monthDayWeekday` · `formatNumber` 가 맡는다. 부르는 쪽은
 * 우리말 꼴과 숫자를 함께 문구 표에 넘기고, 각 언어의 틀이 자기에게 필요한 것만 집어 간다
 * (`src/i18n/appStrings.ts` 머리글).
 */
import { fill, localeOf, type LanguageKey, type Strings } from '../i18n';

/** 한 자리 우리말 수. 0 은 쓰지 않으므로 빈 문자열이다. */
const ONES = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];

/** 열 자리 우리말 수. 54일 여정이라 쉰까지면 넉넉하다. */
const TENS = ['', '열', '스물', '서른', '마흔', '쉰'];

/**
 * 우리말 차례수 — `첫 번째` · `스물세 번째` · `쉰네 번째`.
 *
 * 1 만 예외로 `한 번째` 가 아니라 `첫 번째` 다.
 */
export function ordinalKo(n: number): string {
  if (!Number.isInteger(n) || n < 1) throw new RangeError(`차례수는 1 이상의 정수여야 한다: ${n}`);
  if (n === 1) return '첫 번째';
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${TENS[tens] ?? ''}${ones ? ONES[ones] : ''} 번째`;
}

/**
 * 뒤에 이름이 오는 자리의 우리말 수 — `쉰네 날` · `아홉 날` · `스물일곱 날`.
 *
 * `ordinalKo` 와 같은 낱말을 쓰되 `번째` 가 붙지 않는 꼴이다. 여정 완주 화면의
 * `쉰네 날을 다 바쳤습니다` 가 이 꼴을 쓴다.
 */
export function nativeCountKo(n: number): string {
  if (!Number.isInteger(n) || n < 1) throw new RangeError(`셈은 1 이상의 정수여야 한다: ${n}`);
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${TENS[tens] ?? ''}${ones ? ONES[ones] : ''}`;
}

/** `9월 5일` 꼴로 적는다. */
export function monthDayKo(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/**
 * 날짜를 그 언어의 관습으로 적는다 — `9월 5일` · `September 5`.
 *
 * **날짜는 번역할 문장이 아니라 만드는 방식이 언어마다 다른 값이다.** 영어에서 `9월 5일` 을
 * 글자만 바꿔 `9 month 5 day` 로 적을 수는 없다. 그래서 문구 표에 넣지 않고 여기서 가른다.
 *
 * 규칙은 시안이 이미 정해 두었다 — 시안의 `todayLabel` 이
 * `toLocaleDateString(locale, { month: 'long', day: 'numeric', weekday: 'long' })` 를 쓴다
 * (`docs/design/world/MyRosary World.dc.html` 526 행). 이 앱도 같은 규칙을 쓰되 **한국어만은
 * 위의 손으로 쓴 꼴을 그대로 쓴다.** 까닭 둘이다. 첫째, 한국어 화면의 글자가 한 자도 달라지지
 * 않아야 이번 일이 문구를 옮긴 일로 남는다. 둘째, 기기의 자바스크립트 엔진(Hermes)이 어느
 * 언어의 날짜 자료를 갖고 있는지는 기기마다 다른데, 이 앱의 기본 언어가 그 불확실함 위에
 * 서게 둘 이유가 없다. 영어는 어느 엔진에서도 있는 언어다.
 */
export function monthDay(date: Date, language: LanguageKey): string {
  if (language === 'ko') return monthDayKo(date);
  return date.toLocaleDateString(localeOf(language), { month: 'long', day: 'numeric' });
}

/** `9월 5일 토요일` · `Saturday, September 5` — 요일까지 붙는 꼴. */
export function monthDayWeekday(date: Date, language: LanguageKey): string {
  if (language === 'ko') return `${monthDayKo(date)} ${WEEKDAY_KO[date.getDay()]}요일`;
  return date.toLocaleDateString(localeOf(language), {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

/** 요일 이름. `Date#getDay()` 와 같은 차례로 0 이 일요일이다. */
const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 수를 그 언어의 관습으로 적는다 — 천 단위 쉼표가 언어마다 다르다. */
export function formatNumber(value: number, language: LanguageKey): string {
  return value.toLocaleString(localeOf(language));
}

/** 날짜에 며칠을 더한다. 시각은 자정으로 맞춰 서머타임에 흔들리지 않게 한다. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/**
 * 목적격 조사 — `을` 인가 `를` 인가.
 *
 * 하루 완주 화면의 첫 줄이 `{바람}을 위하여` 인데, 바람은 사용자가 적는 말이라 받침이
 * 있을 수도 없을 수도 있다. v5 는 예시 문구 하나("어머니 병환 회복")를 박아 두어 이
 * 문제를 만나지 않았지만, 실제로 쓰는 순간 `평화를` 이 `평화을` 로 나온다.
 *
 * 한글 음절의 코드는 `가` 부터 11172자가 규칙적으로 늘어서 있고, 그 안에서 받침은
 * 28가지가 한 묶음으로 돈다. 그래서 (코드 − `가`) 를 28로 나눈 나머지가 0 이면 받침이
 * 없다는 뜻이다.
 */
export function objectParticle(word: string): '을' | '를' {
  const last = word.trim().slice(-1);
  if (!last) return '을';
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return '을'; // 한글 음절이 아니면 기본값
  return (code - 0xac00) % 28 === 0 ? '를' : '을';
}

/** 하나부터 열까지의 우리말 수. v5 홈 머리의 `내 기도 · 둘` 이 이 꼴이다. */
const CARDINALS = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];

/** 세는 수를 우리말로. 열을 넘으면 숫자로 적는다 — `열하나`부터는 읽기가 더 어렵다. */
export function countKo(n: number): string {
  if (!Number.isInteger(n) || n < 1) return '0';
  return CARDINALS[n] ?? String(n);
}

/** 하루를 넷으로 나눈 이름. `어제 저녁` 의 뒷말이 여기서 나온다. */
function partOfDayKo(hour: number): string {
  if (hour < 5) return '밤';
  if (hour < 11) return '아침';
  if (hour < 17) return '낮';
  if (hour < 22) return '저녁';
  return '밤';
}

/** 하루를 넷으로 나눈 이름의 열쇠 — 문구 표의 `partOfDay` 가 그 언어의 말을 갖고 있다. */
function partOfDayKey(hour: number): 'night' | 'morning' | 'afternoon' | 'evening' {
  if (hour < 5) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
}

/**
 * 마지막으로 바친 때를 상대 표기로 — `방금` · `12분 전` · `어제 저녁` (06-screen-spec 화면 A).
 *
 * 시각을 그대로 적지 않는 것은 홈 카드가 답해야 하는 질문이 "몇 시였나"가 아니라
 * "얼마나 됐나"이기 때문이다. 명세가 든 예 셋(`방금` · `{N}분 전` · `어제 저녁`)이 각각
 * 분 단위 · 시간 단위 · 날짜 단위를 대표하므로 그 셋을 뼈대로 다섯 갈래를 만들었다.
 */
export function relativeTimeKo(savedAt: Date, now: Date): string {
  const diffMs = now.getTime() - savedAt.getTime();
  if (diffMs < 60_000) return '방금';
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}분 전`;

  const dayDiff = Math.round(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(savedAt.getFullYear(), savedAt.getMonth(), savedAt.getDate()).getTime()) /
      86_400_000,
  );
  if (dayDiff <= 0) return `${Math.floor(diffMs / 3_600_000)}시간 전`;
  if (dayDiff === 1) return `어제 ${partOfDayKo(savedAt.getHours())}`;
  return `${dayDiff}일 전`;
}

/**
 * 위와 같은 다섯 갈래를 그 언어의 말로 적는다. 한국어에서는 위와 글자 하나까지 같은 글이
 * 나오며, 그것을 `format.test.ts` 가 나란히 놓고 잰다.
 */
export function relativeTime(savedAt: Date, now: Date, strings: Strings): string {
  const diffMs = now.getTime() - savedAt.getTime();
  if (diffMs < 60_000) return strings.justNow;
  if (diffMs < 3_600_000) return fill(strings.minutesAgo, { n: Math.floor(diffMs / 60_000) });

  const dayDiff = Math.round(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(savedAt.getFullYear(), savedAt.getMonth(), savedAt.getDate()).getTime()) /
      86_400_000,
  );
  if (dayDiff <= 0) return fill(strings.hoursAgo, { n: Math.floor(diffMs / 3_600_000) });
  if (dayDiff === 1) {
    return fill(strings.yesterdayAt, { part: strings.partOfDay[partOfDayKey(savedAt.getHours())] });
  }
  return fill(strings.daysAgo, { n: dayDiff });
}
