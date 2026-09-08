/**
 * 전례 시기·전례색 시험 (Q-10).
 *
 * 여기서 확인하는 것은 두 가지다. 첫째, 부활 날짜가 공개된 전례력과 같은가 —
 * 이 값이 틀리면 사순·부활 전체가 함께 어긋난다. 둘째, 축일이 시기를 이기는가 —
 * 연중 시기 한복판의 순교자 대축일이 녹색이 아니라 홍색으로 나와야 한다.
 */
import {
  adventStart,
  baptismOfTheLord,
  easterSunday,
  liturgicalDay,
  seasonOf,
  SEASON_NAMES,
} from './liturgy';

/** 현지 시각 자정의 Date. 이 파일의 모든 시험이 이 함수로 날짜를 만든다. */
function d(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

describe('부활 날짜 (그레고리력)', () => {
  it.each([
    [2024, 3, 31],
    [2025, 4, 20],
    [2026, 4, 5],
    [2027, 3, 28],
    [2030, 4, 21],
  ])('%i년 부활 대축일은 %i월 %i일이다', (year, month, day) => {
    expect(easterSunday(year)).toEqual({ month, day });
  });

  it('정수가 아닌 연도는 거절한다', () => {
    expect(() => easterSunday(2026.5)).toThrow(RangeError);
  });
});

describe('대림 제1주일', () => {
  it('2026년은 11월 29일이다 (성탄이 금요일이라 그 앞 주일이 12월 20일)', () => {
    expect(new Date(adventStart(2026)).toISOString().slice(0, 10)).toBe('2026-11-29');
  });

  it('성탄이 주일인 해(2022)는 11월 27일이다', () => {
    expect(new Date(adventStart(2022)).toISOString().slice(0, 10)).toBe('2022-11-27');
  });
});

describe('주님 세례 축일 — 공현(1월 6일) 다음 첫 주일', () => {
  it('2026년은 1월 11일이다', () => {
    expect(new Date(baptismOfTheLord(2026)).toISOString().slice(0, 10)).toBe('2026-01-11');
  });
});

describe('시기 판정', () => {
  it.each([
    ['2026-01-05 성탄 시기 안', d(2026, 1, 5), 'christmas'],
    ['2026-01-12 세례 축일 다음 날은 연중', d(2026, 1, 12), 'ordinary'],
    ['2026-02-18 재의 수요일', d(2026, 2, 18), 'lent'],
    ['2026-04-04 성토요일은 아직 사순', d(2026, 4, 4), 'lent'],
    ['2026-04-05 부활 대축일', d(2026, 4, 5), 'easter'],
    ['2026-05-24 성령 강림까지 부활 시기', d(2026, 5, 24), 'easter'],
    ['2026-05-25 성령 강림 다음 날은 연중', d(2026, 5, 25), 'ordinary'],
    ['2026-09-08 한여름은 연중', d(2026, 9, 8), 'ordinary'],
    ['2026-11-29 대림 제1주일', d(2026, 11, 29), 'advent'],
    ['2026-12-24 성탄 전날까지 대림', d(2026, 12, 24), 'advent'],
    ['2026-12-25 성탄 대축일', d(2026, 12, 25), 'christmas'],
  ])('%s', (_label, date, season) => {
    expect(seasonOf(date)).toBe(season);
  });

  it('시기마다 한국어 이름이 있다', () => {
    expect(SEASON_NAMES[seasonOf(d(2026, 9, 8))]).toBe('연중 시기');
  });
});

describe('전례색', () => {
  it('연중 시기의 평일은 녹색이다', () => {
    expect(liturgicalDay(d(2026, 9, 10))).toEqual({ season: 'ordinary', color: 'green' });
  });

  it('축일이 시기를 이긴다 — 9월 8일은 연중이지만 성모 탄생 축일이라 백색이다', () => {
    // 이 시험은 실제로 한 번 걸렸다. 처음에 9월 8일을 "연중 평일"의 예로 삼았는데
    // 그날이 고정 축일 표에 있어 백색이 나왔다. 표가 시기를 이긴다는 뜻이므로 그대로 남긴다.
    expect(liturgicalDay(d(2026, 9, 8)).color).toBe('white');
  });

  it('사순 시기는 자색이다', () => {
    expect(liturgicalDay(d(2026, 3, 4)).color).toBe('violet');
  });

  it('대림 시기는 자색이다', () => {
    expect(liturgicalDay(d(2026, 12, 1)).color).toBe('violet');
  });

  it('부활 시기는 백색이다', () => {
    expect(liturgicalDay(d(2026, 4, 12)).color).toBe('white');
  });

  it('성탄 시기는 백색이다', () => {
    expect(liturgicalDay(d(2026, 12, 26)).color).toBe('white');
  });

  it('성지 주일은 사순 한복판이지만 홍색이다', () => {
    const day = liturgicalDay(d(2026, 3, 29));
    expect(day.season).toBe('lent');
    expect(day.color).toBe('red');
    expect(day.feast).toBe('주님 수난 성지 주일');
  });

  it('성금요일은 홍색이다', () => {
    expect(liturgicalDay(d(2026, 4, 3)).color).toBe('red');
  });

  it('성령 강림 대축일은 부활 시기의 마지막 날이면서 홍색이다', () => {
    const day = liturgicalDay(d(2026, 5, 24));
    expect(day.season).toBe('easter');
    expect(day.color).toBe('red');
  });

  it('성모 승천 대축일은 연중 한복판이지만 백색이다', () => {
    const day = liturgicalDay(d(2026, 8, 15));
    expect(day.season).toBe('ordinary');
    expect(day.color).toBe('white');
    expect(day.feast).toBe('성모 승천 대축일');
  });

  it('한국 순교자 대축일은 연중 한복판이지만 홍색이다', () => {
    const day = liturgicalDay(d(2026, 9, 20));
    expect(day.season).toBe('ordinary');
    expect(day.color).toBe('red');
  });

  it('묵주 기도의 동정 마리아 기념일은 백색이다', () => {
    expect(liturgicalDay(d(2026, 10, 7)).color).toBe('white');
  });
});
