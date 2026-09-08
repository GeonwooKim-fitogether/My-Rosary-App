/**
 * 77단계 시퀀스가 PRD §1-3 · FR-10 이 정한 구성 그대로인지 확인한다.
 * 값의 출처는 `spec/prayer-sequence.json` 이고, 이 테스트는 그 파일이 앞으로
 * 바뀌더라도 구성이 무너지지 않는지를 지킨다.
 */
import {
  STEPS,
  TOTAL_STEPS,
  OPENING_STEPS,
  STEPS_PER_DECADE,
  DECADES,
  PRAYERS,
  stepAt,
  stepsOfDecade,
} from './sequence';

describe('77단계 시퀀스', () => {
  it('전체가 정확히 77단계다', () => {
    expect(TOTAL_STEPS).toBe(77);
    expect(STEPS).toHaveLength(77);
  });

  it('시작 기도 7 + 각 단 14 × 5 단 = 77 로 맞아떨어진다', () => {
    expect(OPENING_STEPS).toBe(7);
    expect(STEPS_PER_DECADE).toBe(14);
    expect(DECADES).toBe(5);
    expect(OPENING_STEPS + STEPS_PER_DECADE * DECADES).toBe(TOTAL_STEPS);
  });

  it('index 가 0 부터 76 까지 빠짐없이 이어진다', () => {
    STEPS.forEach((step, i) => expect(step.index).toBe(i));
  });

  it('시작 기도는 성호경 · 사도신경 · 주님의 기도 · 성모송 셋 · 영광송 순서다', () => {
    const opening = STEPS.slice(0, OPENING_STEPS);
    expect(opening.map((s) => s.prayer)).toEqual([
      'sign',
      'creed',
      'our',
      'hail',
      'hail',
      'hail',
      'glory',
    ]);
    expect(opening.every((s) => s.section === 'opening')).toBe(true);
    // 시작 기도의 성모송은 셋이다 — 알 번호가 1,2,3 이고 묶음 크기가 3 이다.
    const hails = opening.filter((s) => s.prayer === 'hail');
    expect(hails.map((s) => s.bead)).toEqual([1, 2, 3]);
    expect(hails.every((s) => s.of === 3)).toBe(true);
  });

  it('다섯 단이 저마다 신비 선포 · 주님의 기도 · 성모송 열 · 영광송 · 구원을 비는 기도로 이뤄진다', () => {
    for (let decade = 1; decade <= DECADES; decade++) {
      const steps = stepsOfDecade(decade);
      expect(steps).toHaveLength(STEPS_PER_DECADE);
      expect(steps.map((s) => s.prayer)).toEqual([
        'decl',
        'our',
        ...Array<string>(10).fill('hail'),
        'glory',
        'save',
      ]);
      // 성모송은 열이고 알 번호가 1 부터 10 까지 이어진다.
      const hails = steps.filter((s) => s.prayer === 'hail');
      expect(hails.map((s) => s.bead)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(hails.every((s) => s.of === 10)).toBe(true);
      // 주님의 기도는 묵주의 큰 알이다.
      expect(steps.find((s) => s.prayer === 'our')?.big).toBe(true);
    }
  });

  it('시작 기도 구간 뒤로는 전부 단(decade) 구간이다', () => {
    expect(STEPS.slice(OPENING_STEPS).every((s) => s.section === 'decade')).toBe(true);
  });

  it('모든 단계의 기도문 키가 기도문 표에 실제로 있다', () => {
    for (const step of STEPS) {
      expect(PRAYERS[step.prayer]).toBeDefined();
      expect(typeof PRAYERS[step.prayer].a).toBe('string');
    }
  });

  it('자리로 단계를 꺼내며, 범위를 벗어나면 undefined 다', () => {
    expect(stepAt(0)?.prayer).toBe('sign');
    expect(stepAt(76)?.prayer).toBe('save');
    expect(stepAt(77)).toBeUndefined();
    expect(stepAt(-1)).toBeUndefined();
  });
});
