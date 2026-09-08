/**
 * 여정 시드 시험 — v5 가 그려 둔 값이 코드에서도 같은 값으로 나오는가.
 */
import {
  completeToday,
  currentJourney,
  dateOfDay,
  dayLabel,
  dayNumber,
  mysteryOf,
  tally,
  tallyAfterFinishing,
  type Journey,
} from './session';
import { monthDayKo } from './format';

function freshJourney(): Journey {
  return { ...currentJourney, days: [...currentJourney.days] };
}

describe('v5 가 그린 여정이 그대로 선다', () => {
  it('23일째다', () => {
    expect(dayNumber(freshJourney())).toBe(23);
  });

  it('23일째는 9월 5일이다 — v5 의 dateKo 가 못박은 대응', () => {
    const journey = freshJourney();
    expect(monthDayKo(dateOfDay(journey, 23))).toBe('9월 5일');
  });

  it('54일 중 21일 바쳤고 남은 31일이다 — v5 화면의 문구 그대로', () => {
    expect(tally(freshJourney())).toEqual({ done: 21, missed: 2, left: 31 });
  });

  it('23일째는 청원 국면이다 (1~27일)', () => {
    expect(dayLabel(freshJourney())).toBe('23일째 · 청원');
  });

  it('23일째의 신비는 고통의 신비다 — v5 가 SORROW 를 쓴 것과 같다', () => {
    expect(mysteryOf(freshJourney())).toBe('sorrowful');
  });
});

describe('하루를 마치면', () => {
  it('오늘 칸이 바친 칸이 되고 다음 칸이 오늘이 된다', () => {
    const journey = freshJourney();
    const finished = completeToday(journey);

    expect(finished).toBe(false);
    expect(dayNumber(journey)).toBe(24);
    expect(tally(journey)).toEqual({ done: 22, missed: 2, left: 30 });
  });

  it('하루 완주 화면의 셈은 내일을 바친 것으로 세지 않는다', () => {
    // `tally` 는 `today` 를 바친 쪽으로 세는데, 하루를 마친 직후에는 그 `today` 가
    // 이미 내일 칸이다. 그대로 쓰면 스물세 번째 날을 바친 사람에게 "스물두 날
    // 바쳤다"고 말하게 된다. 하루 완주 화면은 `tallyAfterFinishing` 을 써서
    // 실제로 지나온 만큼만 말한다.
    const journey = freshJourney();
    completeToday(journey);

    expect(tallyAfterFinishing(journey)).toEqual({ done: 21, missed: 2, left: 31 });
    const { done, missed, left } = tallyAfterFinishing(journey);
    expect(done + missed + left).toBe(54);
  });

  it('마지막 칸을 마치면 여정이 끝난다', () => {
    const journey = freshJourney();
    journey.days = journey.days.map(() => 'prayed');
    journey.days[53] = 'today';

    expect(completeToday(journey)).toBe(true);
  });

  it('28일째부터는 감사 국면이다', () => {
    const journey = freshJourney();
    journey.days = journey.days.map((_, i) => (i < 27 ? 'prayed' : i === 27 ? 'today' : 'future'));
    expect(dayLabel(journey)).toBe('28일째 · 감사');
  });
});
