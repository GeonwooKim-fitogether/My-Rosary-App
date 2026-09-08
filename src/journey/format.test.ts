import { addDays, monthDayKo, objectParticle, ordinalKo } from './format';

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
