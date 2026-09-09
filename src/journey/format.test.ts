import { addDays, countKo, monthDayKo, nativeCountKo, objectParticle, ordinalKo, relativeTimeKo } from './format';

describe('우리말 차례수', () => {
  it.each([
    [1, '첫 번째'],
    [2, '두 번째'],
    [10, '열 번째'],
    [23, '스물세 번째'],
    [30, '서른 번째'],
    [54, '쉰네 번째'],
  ])('%i 일째는 %s', (n, expected) => {
    expect(ordinalKo(n)).toBe(expected);
  });

  it('0 이나 음수는 차례수가 아니다', () => {
    expect(() => ordinalKo(0)).toThrow(RangeError);
  });
});

describe('날짜 적기', () => {
  it('9월 5일 꼴로 적는다', () => {
    expect(monthDayKo(new Date(2026, 8, 5))).toBe('9월 5일');
  });

  it('달을 넘겨 더할 수 있다', () => {
    expect(monthDayKo(addDays(new Date(2026, 7, 14), 22))).toBe('9월 5일');
  });
});

describe('목적격 조사', () => {
  it.each([
    ['어머니 병환 회복', '을'],
    ['아버지 세례', '를'],
    ['평화', '를'],
    ['건강', '을'],
    ['', '을'],
  ])('%s 뒤에는 %s 가 붙는다', (word, particle) => {
    expect(objectParticle(word)).toBe(particle);
  });
});

describe('세는 수와 상대 시각 (M2 가 더한 것)', () => {
  it('하나부터 열까지는 우리말로, 그 위는 숫자로 센다', () => {
    expect(countKo(1)).toBe('하나');
    expect(countKo(2)).toBe('둘');
    expect(countKo(10)).toBe('열');
    expect(countKo(11)).toBe('11');
  });

  it('뒤에 이름이 오는 자리는 `쉰네` 처럼 적는다', () => {
    expect(nativeCountKo(54)).toBe('쉰네');
    expect(nativeCountKo(27)).toBe('스물일곱');
    expect(nativeCountKo(9)).toBe('아홉');
  });

  it('마지막으로 바친 때를 상대 표기로 적는다', () => {
    const now = new Date(2026, 8, 8, 21, 30);
    expect(relativeTimeKo(new Date(2026, 8, 8, 21, 29, 40), now)).toBe('방금');
    expect(relativeTimeKo(new Date(2026, 8, 8, 21, 10), now)).toBe('20분 전');
    expect(relativeTimeKo(new Date(2026, 8, 8, 9, 30), now)).toBe('12시간 전');
    expect(relativeTimeKo(new Date(2026, 8, 7, 20, 0), now)).toBe('어제 저녁');
    expect(relativeTimeKo(new Date(2026, 8, 5, 20, 0), now)).toBe('3일 전');
  });
});
