/**
 * 81단계 시퀀스가 PRD §1-3 · FR-10(2026-09-09 결정 7 로 개정)이 정한 구성 그대로인지
 * 확인한다. 값의 출처는 `spec/prayer-sequence.json` 이고, 이 테스트는 그 파일이 앞으로
 * 바뀌더라도 구성이 무너지지 않는지를 지킨다.
 *
 * 개수를 세는 시험과 **순서를 통째로 견주는 시험**을 함께 둔 이유가 있다. 2026-09-09 에
 * 드러난 결함은 "구원을 비는 기도 한 단계가 시작 기도에서 통째로 빠져 있다"였는데, 그런
 * 결함은 개수 시험으로는 잡히지 않는다 — 빠진 만큼 총수도 함께 줄어 앞뒤가 맞아 보이기
 * 때문이다. 그래서 아래 `표준 도해 34항목의 순서` 시험이 기도문 키의 배열 전체를 적어 둔다.
 */
import {
  STEPS,
  TOTAL_STEPS,
  OPENING_STEPS,
  CLOSING_STEPS,
  STEPS_PER_DECADE,
  DECADES,
  PRAYERS,
  stepAt,
  stepsOfDecade,
} from './sequence';

describe('81단계 시퀀스', () => {
  it('전체가 정확히 81단계다', () => {
    expect(TOTAL_STEPS).toBe(81);
    expect(STEPS).toHaveLength(81);
  });

  it('시작 기도 9 + 각 단 14 × 5 단 + 마침 기도 2 = 81 로 맞아떨어진다', () => {
    expect(OPENING_STEPS).toBe(9);
    expect(STEPS_PER_DECADE).toBe(14);
    expect(DECADES).toBe(5);
    expect(CLOSING_STEPS).toBe(2);
    expect(OPENING_STEPS + STEPS_PER_DECADE * DECADES + CLOSING_STEPS).toBe(TOTAL_STEPS);
  });

  it('index 가 0 부터 80 까지 빠짐없이 이어진다', () => {
    STEPS.forEach((step, i) => expect(step.index).toBe(i));
  });

  it('시작 기도는 성호경 · 입맞춤 · 사도신경 · 주님의 기도 · 성모송 셋 · 영광송 · 구원을 비는 기도 순서다', () => {
    const opening = STEPS.slice(0, OPENING_STEPS);
    expect(opening.map((s) => s.prayer)).toEqual([
      'sign',
      'kiss',
      'creed',
      'our',
      'hail',
      'hail',
      'hail',
      'glory',
      'save',
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

  it('마침 기도는 성모찬송과 성호경 둘이고 하루의 끝에 있다', () => {
    const closing = STEPS.slice(-CLOSING_STEPS);
    expect(closing.map((s) => s.prayer)).toEqual(['salve', 'sign']);
    expect(closing.every((s) => s.section === 'closing')).toBe(true);
    // 마침 기도에는 단 번호가 없다 — 다섯 단 바깥의 구간이기 때문이다.
    expect(closing.every((s) => s.decade === undefined)).toBe(true);
  });

  it('시작 기도와 마침 기도 사이는 전부 단(decade) 구간이다', () => {
    const middle = STEPS.slice(OPENING_STEPS, STEPS.length - CLOSING_STEPS);
    expect(middle).toHaveLength(STEPS_PER_DECADE * DECADES);
    expect(middle.every((s) => s.section === 'decade')).toBe(true);
  });

  it('모든 단계의 기도문 키가 기도문 표에 실제로 있다', () => {
    for (const step of STEPS) {
      expect(PRAYERS[step.prayer]).toBeDefined();
      expect(typeof PRAYERS[step.prayer].a).toBe('string');
    }
  });

  it('자리로 단계를 꺼내며, 범위를 벗어나면 undefined 다', () => {
    expect(stepAt(0)?.prayer).toBe('sign');
    expect(stepAt(80)?.prayer).toBe('sign');
    expect(stepAt(79)?.prayer).toBe('salve');
    expect(stepAt(81)).toBeUndefined();
    expect(stepAt(-1)).toBeUndefined();
  });
});

/**
 * 한국 천주교의 표준 「묵주기도 방법」 도해 34항목을, 앱이 실제로 지나가는 기도문 키의
 * 순서로 옮겨 적은 것이다. 도해의 한 항목이 앱의 한 단계와 일대일로 대응하지는 않는다 —
 * 도해 5번("성모송, 작은 알 셋")이 앱에서는 세 단계이고, 도해 10번("성모송, 열 알")이
 * 앱에서는 열 단계다. 나머지는 하나가 하나다.
 */
const 도해_34항목: readonly string[] = [
  // 1 성호경 · 2 십자가에 입맞춤 · 3 사도신경 · 4 주님의 기도
  'sign',
  'kiss',
  'creed',
  'our',
  // 5 성모송 셋
  'hail',
  'hail',
  'hail',
  // 6 영광송 · 7 구원을 비는 기도
  'glory',
  'save',
  // 8~32 — 다섯 단이 저마다 신비 선포 · 주님의 기도 · 성모송 열 · 영광송 · 구원을 비는 기도
  ...Array.from({ length: 5 }, () => [
    'decl',
    'our',
    ...Array<string>(10).fill('hail'),
    'glory',
    'save',
  ]).flat(),
  // 33 성모찬송 · 34 성호경
  'salve',
  'sign',
];

describe('표준 도해 34항목의 순서', () => {
  it('앱이 지나가는 기도문의 순서가 도해와 글자 하나까지 같다', () => {
    expect(STEPS.map((s) => s.prayer)).toEqual(도해_34항목);
  });

  it('도해를 그대로 옮기면 81단계가 된다', () => {
    expect(도해_34항목).toHaveLength(81);
  });

  it('성모송은 쉰세 번이다 — 시작 기도의 셋과 다섯 단의 쉰', () => {
    expect(도해_34항목.filter((key) => key === 'hail')).toHaveLength(53);
  });
});
