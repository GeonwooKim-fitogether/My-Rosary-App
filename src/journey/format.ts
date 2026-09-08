/**
 * 여정의 날짜와 차례수를 우리말로 적는 법.
 *
 * v5 시안의 `ordKo` · `dateKo` 를 옮긴 것이다. 하루 완주 화면의 머리글이
 * `9월 5일 · 스물세 번째 날` 인데, 그 "스물세 번째"를 만들어 내는 규칙이 여기 있다.
 * 숫자를 그대로 쓰지 않고 우리말 차례수로 적는 것은 이 앱의 어투에 관한 결정이다 —
 * `23번째 날` 과 `스물세 번째 날` 은 같은 뜻이지만 다른 온도다.
 */

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

/** `9월 5일` 꼴로 적는다. */
export function monthDayKo(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
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
