/**
 * 전례 시기와 전례색 (FR-25 · `spec/journey-rules.md` §8 · `decisions.md` Q-10).
 *
 * PRD 는 "부 강조색은 전례 시기에 따라 갈아 끼우는 슬롯"이라고만 정했고, **어느 날이
 * 어느 시기인가를 계산하는 규칙은 정하지 않았다.** 프로토타입 v4 는 월(月)로 근사했다.
 * 결정 큐 Q-10 이 그 공백을 이렇게 메웠다 — 부활 날짜 산출과 대림·사순·부활·성탄의
 * 시기 규칙은 코드로 넣고, 성모 축일·순교자 기념일은 연도 무관 고정 날짜 표로 둔다.
 * 이 파일이 그 결정의 구현이다.
 *
 * 판단 순서가 이 파일의 뼈대다.
 *
 * 1. 그날이 **움직이는 축일**(성지주일·성금요일·성령강림)인가 — 맞으면 홍색.
 * 2. 그날이 **고정 축일 표**에 있는가 — 맞으면 그 표의 색(성모 축일 백색·순교 홍색).
 * 3. 둘 다 아니면 **시기**로 정한다 — 대림·사순은 자색, 부활·성탄은 백색, 나머지는 연중 녹색.
 *
 * 축일이 시기를 이기는 이유는 전례색의 뜻 자체가 그렇기 때문이다. 연중 시기 한복판의
 * 순교자 대축일은 녹색이 아니라 홍색으로 지낸다.
 */

/** 전례 시기 다섯. */
export type LiturgicalSeason = 'advent' | 'christmas' | 'lent' | 'easter' | 'ordinary';

/** 전례색 넷 (06-design-system §2-3). */
export type LiturgicalColor = 'violet' | 'green' | 'white' | 'red';

/** 어떤 날의 전례 정보. */
export interface LiturgicalDay {
  season: LiturgicalSeason;
  color: LiturgicalColor;
  /** 그날이 축일이라 색이 시기와 달라졌으면 그 축일의 이름. 아니면 undefined. */
  feast?: string;
}

/** 시기의 한국어 이름. 화면에 시기를 적을 일이 생기면 여기서 가져다 쓴다. */
export const SEASON_NAMES: Readonly<Record<LiturgicalSeason, string>> = {
  advent: '대림 시기',
  christmas: '성탄 시기',
  lent: '사순 시기',
  easter: '부활 시기',
  ordinary: '연중 시기',
};

/** 하루를 밀리초로. 날짜 셈을 UTC 자정 기준으로 해 서머타임의 영향을 받지 않게 한다. */
const DAY_MS = 86400000;

/** 현지 날짜의 연·월·일만 뽑아 UTC 자정으로 바꾼다. 이 파일의 모든 셈이 이 값으로 돈다. */
function utcMidnight(year: number, month1to12: number, day: number): number {
  return Date.UTC(year, month1to12 - 1, day);
}

/** 밀리초 값에서 요일을 얻는다. 0 이 일요일이다. */
function weekdayOf(ms: number): number {
  return new Date(ms).getUTCDay();
}

/**
 * 그해 부활 대축일의 날짜 (그레고리력).
 *
 * 계산법은 공개된 표준 알고리즘(Meeus/Jones/Butcher)이다. 부활은 춘분 뒤 첫 보름 다음
 * 일요일이라는 규칙을 정수 나눗셈으로 푼 것이며, 여기서 새로 만든 규칙은 없다.
 *
 * @returns `{ month: 1~12, day: 1~31 }`
 */
export function easterSunday(year: number): { month: number; day: number } {
  if (!Number.isInteger(year)) throw new RangeError(`연도는 정수여야 한다: ${year}`);
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

/**
 * 그해 대림 제1주일 (대림 시기의 첫날).
 *
 * 규칙은 "성탄 앞의 네 번째 주일"이다. 성탄 바로 앞 주일을 찾아 3주(21일)를 뺀다.
 * 성탄이 주일이면 그 앞 주일은 이레 전이다.
 */
export function adventStart(year: number): number {
  const christmas = utcMidnight(year, 12, 25);
  const w = weekdayOf(christmas);
  const sundayBefore = christmas - (w === 0 ? 7 : w) * DAY_MS;
  return sundayBefore - 21 * DAY_MS;
}

/**
 * 성탄 시기의 마지막 날 — 주님 세례 축일. 주님 공현(1월 6일) 다음 첫 주일로 잡는다.
 *
 * **알아 두어야 할 단순화 하나.** 한국 교회는 공현을 1월 2~8일 사이의 주일로 옮겨
 * 지내고 그 때문에 세례 축일이 월요일로 밀리는 해가 있다. 여기서는 그 예외를 넣지
 * 않았다 — 전례색이 하루 어긋나는 차이이고, 정확한 한국 전례력 반영은 사제 자문이
 * 필요한 항목이 아니라 자료 확인 항목이라 판본 확정(D-4) 때 함께 손보는 편이 낫다.
 */
export function baptismOfTheLord(year: number): number {
  const epiphany = utcMidnight(year, 1, 6);
  const w = weekdayOf(epiphany);
  return epiphany + (7 - w) * DAY_MS;
}

/**
 * 고정 축일 표 — 연도와 무관하게 같은 날짜에 오는 축일만 담는다 (Q-10).
 *
 * 성모 축일은 백색, 순교자 축일은 홍색이다. 움직이는 축일(성지주일·성금요일·성령강림)은
 * 부활 날짜에 매여 있으므로 이 표가 아니라 아래 `liturgicalDay` 가 직접 계산한다.
 *
 * 담은 것은 로마 전례력과 한국 교회 전례력에 공통으로 있는 대축일·축일이다. 목록을
 * 늘리거나 줄이는 일은 이 배열 하나만 고치면 된다.
 */
export const FIXED_FEASTS: readonly {
  month: number;
  day: number;
  name: string;
  color: LiturgicalColor;
}[] = [
  { month: 1, day: 1, name: '천주의 성모 마리아 대축일', color: 'white' },
  { month: 2, day: 11, name: '루르드의 복되신 동정 마리아', color: 'white' },
  { month: 3, day: 25, name: '주님 탄생 예고 대축일', color: 'white' },
  { month: 5, day: 13, name: '파티마의 복되신 동정 마리아', color: 'white' },
  { month: 5, day: 31, name: '복되신 동정 마리아의 방문 축일', color: 'white' },
  { month: 6, day: 29, name: '성 베드로와 성 바오로 사도 대축일', color: 'red' },
  { month: 7, day: 16, name: '가르멜 산의 복되신 동정 마리아', color: 'white' },
  { month: 8, day: 15, name: '성모 승천 대축일', color: 'white' },
  { month: 9, day: 8, name: '복되신 동정 마리아 탄생 축일', color: 'white' },
  { month: 9, day: 15, name: '고통의 성모 마리아', color: 'white' },
  {
    month: 9,
    day: 20,
    name: '성 김대건 안드레아와 성 정하상 바오로와 동료 순교자들 대축일',
    color: 'red',
  },
  { month: 10, day: 7, name: '묵주 기도의 복되신 동정 마리아', color: 'white' },
  { month: 11, day: 21, name: '복되신 동정 마리아의 자헌', color: 'white' },
  { month: 12, day: 8, name: '원죄 없이 잉태되신 복되신 동정 마리아 대축일', color: 'white' },
];

/** 시기가 저 혼자 정하는 색. 축일이 없을 때 쓰인다. */
const SEASON_COLORS: Readonly<Record<LiturgicalSeason, LiturgicalColor>> = {
  advent: 'violet',
  lent: 'violet',
  easter: 'white',
  christmas: 'white',
  ordinary: 'green',
};

/** 어느 시기인가만 정한다. 축일은 보지 않는다. */
export function seasonOf(date: Date): LiturgicalSeason {
  const year = date.getFullYear();
  const today = utcMidnight(year, date.getMonth() + 1, date.getDate());

  const easter = easterSunday(year);
  const easterMs = utcMidnight(year, easter.month, easter.day);
  const ashWednesday = easterMs - 46 * DAY_MS;
  const pentecost = easterMs + 49 * DAY_MS;

  // 사순: 재의 수요일부터 부활 전날(성토요일)까지.
  if (today >= ashWednesday && today < easterMs) return 'lent';
  // 부활: 부활 대축일부터 성령 강림 대축일까지.
  if (today >= easterMs && today <= pentecost) return 'easter';
  // 성탄: 12월 25일부터 그해 12월 31일까지, 그리고 이듬해 주님 세례 축일까지.
  if (today >= utcMidnight(year, 12, 25)) return 'christmas';
  if (today <= baptismOfTheLord(year)) return 'christmas';
  // 대림: 대림 제1주일부터 12월 24일까지.
  if (today >= adventStart(year)) return 'advent';
  return 'ordinary';
}

/**
 * 그날의 전례 시기와 전례색을 함께 정한다. 화면이 부르는 것은 이 함수 하나다.
 *
 * @param date 기기 현지 날짜. 시각은 무시하고 연·월·일만 본다.
 */
export function liturgicalDay(date: Date): LiturgicalDay {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const today = utcMidnight(year, month, day);
  const season = seasonOf(date);

  const easter = easterSunday(year);
  const easterMs = utcMidnight(year, easter.month, easter.day);

  // 1. 움직이는 축일 — 수난과 성령 강림은 홍색이다.
  const movingRed: { at: number; name: string }[] = [
    { at: easterMs - 7 * DAY_MS, name: '주님 수난 성지 주일' },
    { at: easterMs - 2 * DAY_MS, name: '주님 수난 성금요일' },
    { at: easterMs + 49 * DAY_MS, name: '성령 강림 대축일' },
  ];
  const moving = movingRed.find((f) => f.at === today);
  if (moving) return { season, color: 'red', feast: moving.name };

  // 2. 고정 축일 표.
  const fixed = FIXED_FEASTS.find((f) => f.month === month && f.day === day);
  if (fixed) return { season, color: fixed.color, feast: fixed.name };

  // 3. 시기의 색.
  return { season, color: SEASON_COLORS[season] };
}
