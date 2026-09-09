/**
 * 오늘의 신비를 정하는 두 규칙(FR-43)과 54일 여정의 청원·감사 구분(FR-35)을 확인한다.
 *
 * 이 테스트가 지키는 핵심은 "규칙이 둘로 갈린다"는 사실이다. 54일 기도는 며칠째인가로
 * 정하고 나머지 둘은 요일로 정하며, 54일 기도에는 빛의 신비가 들어가지 않는다.
 */
import {
  FIFTYFOUR_CYCLE,
  FIFTYFOUR_LENGTH,
  MYSTERY_SETS,
  WEEKDAY_MYSTERIES,
  mysteryForDay,
  mysteryForFiftyfourDay,
  mysteryForWeekday,
  phaseForFiftyfourDay,
} from './mysteries';

describe('신비 4종', () => {
  it('네 벌이 있고 저마다 다섯 단을 갖는다', () => {
    expect(Object.keys(MYSTERY_SETS).sort()).toEqual([
      'glorious',
      'joyful',
      'luminous',
      'sorrowful',
    ]);
    for (const set of Object.values(MYSTERY_SETS)) {
      expect(set.decades).toHaveLength(5);
      expect(set.name.length).toBeGreaterThan(0);
    }
  });
});

describe('54일 기도의 신비 순환', () => {
  it('환희 · 고통 · 영광 셋만 돌고 빛의 신비는 들어가지 않는다', () => {
    expect(FIFTYFOUR_CYCLE).toEqual(['joyful', 'sorrowful', 'glorious']);
    expect(FIFTYFOUR_CYCLE).not.toContain('luminous');
  });

  // 경계값을 이름으로 적어 둔다 — 순환의 첫날, 한 바퀴의 끝과 다음 바퀴의 첫날,
  // 청원의 마지막 날과 감사의 첫날, 그리고 여정의 마지막 날.
  it.each([
    [1, 'joyful'],
    [2, 'sorrowful'],
    [3, 'glorious'],
    [4, 'joyful'],
    [27, 'glorious'],
    [28, 'joyful'],
    [54, 'glorious'],
  ])('%i일째의 신비는 %s 다', (dayIndex, expected) => {
    expect(mysteryForFiftyfourDay(dayIndex as number)).toBe(expected);
  });

  it('54일 어느 날에도 빛의 신비가 나오지 않는다', () => {
    for (let day = 1; day <= FIFTYFOUR_LENGTH; day++) {
      expect(mysteryForFiftyfourDay(day)).not.toBe('luminous');
    }
  });

  it('며칠째가 1 보다 작거나 정수가 아니면 거부한다', () => {
    expect(() => mysteryForFiftyfourDay(0)).toThrow(RangeError);
    expect(() => mysteryForFiftyfourDay(-1)).toThrow(RangeError);
    expect(() => mysteryForFiftyfourDay(1.5)).toThrow(RangeError);
  });
});

describe('54일 여정의 청원과 감사', () => {
  it.each([
    [1, 'petition'],
    [27, 'petition'],
    [28, 'thanksgiving'],
    [54, 'thanksgiving'],
  ])('%i일째는 %s 다', (dayIndex, expected) => {
    expect(phaseForFiftyfourDay(dayIndex as number)).toBe(expected);
  });

  it('1~27 은 청원, 28~54 는 감사로 빠짐없이 갈린다', () => {
    for (let day = 1; day <= 27; day++) expect(phaseForFiftyfourDay(day)).toBe('petition');
    for (let day = 28; day <= 54; day++) expect(phaseForFiftyfourDay(day)).toBe('thanksgiving');
  });

  it('여정 밖의 날은 거부한다', () => {
    expect(() => phaseForFiftyfourDay(0)).toThrow(RangeError);
    expect(() => phaseForFiftyfourDay(55)).toThrow(RangeError);
  });
});

describe('요일 규칙 (날마다 기도 · 9일 기도)', () => {
  it('인덱스 0 이 일요일이고 순서는 영광 · 환희 · 고통 · 영광 · 빛 · 고통 · 환희다', () => {
    expect(WEEKDAY_MYSTERIES).toEqual([
      'glorious',
      'joyful',
      'sorrowful',
      'glorious',
      'luminous',
      'sorrowful',
      'joyful',
    ]);
  });

  it.each([
    [0, 'glorious'],
    [1, 'joyful'],
    [2, 'sorrowful'],
    [3, 'glorious'],
    [4, 'luminous'],
    [5, 'sorrowful'],
    [6, 'joyful'],
  ])('요일 %i 의 신비는 %s 다', (weekday, expected) => {
    expect(mysteryForWeekday(weekday as number)).toBe(expected);
  });

  it('요일이 0~6 을 벗어나면 거부한다', () => {
    expect(() => mysteryForWeekday(7)).toThrow(RangeError);
    expect(() => mysteryForWeekday(-1)).toThrow(RangeError);
  });
});

describe('형식에 따라 규칙이 갈린다', () => {
  it('54일 기도는 며칠째만 보고 요일을 무시한다', () => {
    // 같은 1일째를 서로 다른 요일로 물어도 답이 같아야 한다.
    for (let weekday = 0; weekday <= 6; weekday++) {
      expect(mysteryForDay('fiftyfour', { dayIndex: 1, weekday })).toBe('joyful');
    }
  });

  it('날마다 기도와 9일 기도는 요일만 보고 며칠째를 무시한다', () => {
    // 목요일(4)은 빛의 신비다 — 며칠째가 무엇이든 바뀌지 않는다.
    expect(mysteryForDay('daily', { dayIndex: 1, weekday: 4 })).toBe('luminous');
    expect(mysteryForDay('daily', { dayIndex: 99, weekday: 4 })).toBe('luminous');
    expect(mysteryForDay('novena9', { dayIndex: 3, weekday: 4 })).toBe('luminous');
  });

  it('빛의 신비는 요일 규칙에서만 나온다 — 54일 기도에서는 나오지 않는다', () => {
    expect(mysteryForDay('daily', { dayIndex: 1, weekday: 4 })).toBe('luminous');
    for (let day = 1; day <= FIFTYFOUR_LENGTH; day++) {
      expect(mysteryForDay('fiftyfour', { dayIndex: day, weekday: 4 })).not.toBe('luminous');
    }
  });
});
