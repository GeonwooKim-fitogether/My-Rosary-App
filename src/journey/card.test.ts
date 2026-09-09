/**
 * 홈 카드 시험 — 카드가 오늘을 어떻게 말하는가.
 */
import { cardStatus, isResumable, resumeLine } from './card';
import type { Journey } from './session';
import type { PrayerPosition } from '../storage/position';

const TODAY = new Date(2026, 8, 8);

function journey(over: Partial<Journey> = {}): Journey {
  return {
    id: 'j1',
    title: '어머니 병환 회복',
    format: 'fiftyfour',
    startDate: new Date(2026, 8, 6), // 3일째
    days: ['prayed', 'missed', 'today'],
    kind: 'petition',
    recitation: 'alternate',
    ...over,
  };
}

function position(over: Partial<PrayerPosition> = {}): PrayerPosition {
  return {
    journeyId: 'j1',
    dayIndex: 3,
    stepIndex: 40,
    decade: 3,
    bead: 3,
    mystery: 'sorrowful',
    savedAt: new Date(2026, 8, 8, 21, 0).toISOString(),
    resumeCount: 0,
    elapsedMs: 0,
    ...over,
  };
}

describe('카드가 갈리는 다섯 갈래', () => {
  it('시작일이 아직 오지 않았으면 시작 전이다', () => {
    expect(cardStatus(journey({ startDate: new Date(2026, 8, 20) }), TODAY, null)).toBe('notStarted');
  });

  it('오늘 바쳤으면 오늘 바친 것으로 말한다', () => {
    expect(cardStatus(journey({ days: ['prayed', 'missed', 'prayed'] }), TODAY, null)).toBe(
      'prayedToday',
    );
  });

  it('오늘 바치던 자리가 있으면 이어가기다', () => {
    expect(cardStatus(journey(), TODAY, position())).toBe('resume');
  });

  it('자리가 없으면 아직이다', () => {
    expect(cardStatus(journey(), TODAY, null)).toBe('fresh');
  });

  it('마지막 날을 바쳤으면 마친 여정이다', () => {
    const days = Array.from({ length: 54 }, () => 'prayed' as const);
    expect(cardStatus(journey({ days }), TODAY, null)).toBe('ended');
  });
});

describe('어제 자리로는 이어가지 않는다', () => {
  it('날짜가 다른 자리는 이어가기가 아니다', () => {
    expect(isResumable(journey(), TODAY, position({ dayIndex: 2 }))).toBe(false);
  });

  it('다른 여정의 자리도 아니다', () => {
    expect(isResumable(journey(), TODAY, position({ journeyId: 'j2' }))).toBe(false);
  });

  it('아직 한 알도 넘기지 않았으면 이어갈 것이 없다', () => {
    expect(isResumable(journey(), TODAY, position({ stepIndex: 0 }))).toBe(false);
  });
});

describe('멈춘 자리를 말로 적는다', () => {
  it('알에 걸린 자리는 몇 단 몇 번째 알인지 적는다', () => {
    expect(resumeLine(position())).toBe('제3단 4번째 알부터 이어서');
  });

  it('알에 걸리지 않는 자리는 기도문 이름으로 적는다', () => {
    expect(resumeLine(position({ bead: null }), '영광송')).toBe('제3단 영광송부터 이어서');
  });

  it('시작 기도 구간이면 그렇게 적는다', () => {
    expect(resumeLine(position({ decade: null, bead: null }))).toBe('시작 기도부터 이어서');
  });
});
