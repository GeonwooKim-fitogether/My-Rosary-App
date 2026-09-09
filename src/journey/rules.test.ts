/**
 * 달력 규칙 시험 — 며칠째가 달력에서 오고, 안 켠 날이 못 바친 날로 남는가.
 */
import {
  countDays,
  dayIndexOn,
  dayLabelOn,
  finishDateOf,
  hasEnded,
  journeyLength,
  notStartedLabel,
  phaseOn,
  prayedTodayAlready,
  rolledDays,
  withTodayPrayed,
} from './rules';
import type { DayState, Journey } from './session';
import type { JourneyFormat } from '../domain/types';

function journey(over: Partial<Journey> = {}): Journey {
  return {
    id: 'j1',
    title: '어머니 병환 회복',
    format: 'fiftyfour',
    startDate: new Date(2026, 8, 1), // 9월 1일
    days: [],
    kind: 'petition',
    recitation: 'alternate',
    ...over,
  };
}

describe('형식 셋', () => {
  it('길이가 54 · 9 · 끝없음이다', () => {
    expect(journeyLength('fiftyfour')).toBe(54);
    expect(journeyLength('novena9')).toBe(9);
    expect(journeyLength('daily')).toBeNull();
  });

  it('마치는 날은 시작일 + (길이 − 1) 이고 날마다는 없다', () => {
    expect(finishDateOf(journey())).toEqual(new Date(2026, 9, 24)); // 9월 1일 + 53일 = 10월 24일
    expect(finishDateOf(journey({ format: 'novena9' }))).toEqual(new Date(2026, 8, 9));
    expect(finishDateOf(journey({ format: 'daily' }))).toBeNull();
  });

  it('9일 기도는 아홉 칸, 54일 기도는 쉰네 칸이다', () => {
    const formats: Array<[JourneyFormat, number]> = [
      ['fiftyfour', 54],
      ['novena9', 9],
    ];
    for (const [format, length] of formats) {
      expect(rolledDays(journey({ format }), new Date(2026, 8, 1))).toHaveLength(length);
    }
  });

  it('날마다는 오늘까지 칸이 자란다', () => {
    const days = rolledDays(journey({ format: 'daily' }), new Date(2026, 8, 5));
    expect(days).toHaveLength(5);
    expect(days[4]).toBe('today');
  });
});

describe('며칠째는 달력에서 온다', () => {
  it('시작일 당일이 1일째다', () => {
    expect(dayIndexOn(new Date(2026, 8, 1), new Date(2026, 8, 1))).toBe(1);
  });

  it('스무 날이 지나면 21일째다', () => {
    expect(dayIndexOn(new Date(2026, 8, 1), new Date(2026, 8, 21))).toBe(21);
  });

  it('시작일이 미래면 0 이하다 — 홈에서 흐린 카드가 되는 조건이다 (FR-36)', () => {
    expect(dayIndexOn(new Date(2026, 8, 10), new Date(2026, 8, 8))).toBe(-1);
    expect(notStartedLabel(journey({ startDate: new Date(2026, 8, 10) }), new Date(2026, 8, 8))).toBe(
      '2일 뒤에 시작합니다 · 9월 10일',
    );
  });

  it('시각이 달라도 같은 날이면 같은 날짜다', () => {
    const start = new Date(2026, 8, 1, 23, 30);
    expect(dayIndexOn(start, new Date(2026, 8, 1, 0, 10))).toBe(1);
  });
});

describe('앱을 안 켠 날은 못 바친 날로 남는다 (FR-35)', () => {
  it('바치지 않고 나흘이 지나면 앞의 사흘이 못 바친 날이 되고 오늘 칸이 오늘로 온다', () => {
    const days = rolledDays(journey(), new Date(2026, 8, 4)); // 4일째
    expect(days.slice(0, 5)).toEqual<DayState[]>(['missed', 'missed', 'missed', 'today', 'future']);
  });

  it('이미 바친 날은 그대로 둔다', () => {
    const before: DayState[] = ['prayed', 'future', 'future'];
    const days = rolledDays(journey({ days: before }), new Date(2026, 8, 3));
    expect(days[0]).toBe('prayed');
    expect(days[1]).toBe('missed');
    expect(days[2]).toBe('today');
  });

  it('오늘을 바치고 나면 오늘 칸은 `today` 가 아니라 바친 칸이다', () => {
    const { days, ended } = withTodayPrayed(journey(), new Date(2026, 8, 3));
    expect(days[2]).toBe('prayed');
    expect(days.includes('today')).toBe(false);
    expect(ended).toBe(false);
  });

  it('마지막 날을 바치면 여정이 끝난다', () => {
    const today = new Date(2026, 9, 24); // 54일째
    const { ended, days } = withTodayPrayed(journey(), today);
    expect(ended).toBe(true);
    expect(hasEnded({ ...journey(), days }, today)).toBe(true);
  });

  it('날마다는 끝나지 않는다', () => {
    const daily = journey({ format: 'daily' });
    const today = new Date(2027, 0, 1);
    expect(withTodayPrayed(daily, today).ended).toBe(false);
    expect(hasEnded(daily, today)).toBe(false);
  });
});

describe('셈과 오늘 여부', () => {
  it('오늘 칸은 아직 바치지 않은 날이므로 남은 쪽으로 센다', () => {
    const days: DayState[] = ['prayed', 'missed', 'today', 'future'];
    expect(countDays(days)).toEqual({ prayed: 1, missed: 1, remaining: 2 });
  });

  it('오늘 바쳤는지는 달력 자리로 본다', () => {
    const today = new Date(2026, 8, 3);
    const before = journey({ days: ['prayed', 'missed', 'future'] });
    expect(prayedTodayAlready(before, today)).toBe(false);
    const after = { ...before, days: withTodayPrayed(before, today).days };
    expect(prayedTodayAlready(after, today)).toBe(true);
  });
});

describe('청원과 감사 (FR-35 · v5 새 기도의 구역 ②)', () => {
  it('청원으로 시작하면 27일까지 청원, 28일부터 감사다', () => {
    const j = journey();
    expect(phaseOn(j, 27)).toBe('petition');
    expect(phaseOn(j, 28)).toBe('thanksgiving');
    expect(dayLabelOn(j, 23)).toBe('23일째 · 청원');
  });

  it('감사로 시작하면 쉰네 날 내내 감사다', () => {
    const j = journey({ kind: 'thanksgiving' });
    expect(phaseOn(j, 1)).toBe('thanksgiving');
    expect(dayLabelOn(j, 1)).toBe('1일째 · 감사');
  });

  it('9일 기도와 날마다에는 국면이 없다', () => {
    expect(phaseOn(journey({ format: 'novena9' }), 3)).toBeNull();
    expect(dayLabelOn(journey({ format: 'daily' }), 3)).toBe('3일째');
  });
});
