/**
 * 하루 큐 시험 — `spec/` 의 77단계에 `spec/` 의 문구가 제대로 붙는가.
 */
import { PRAYERS, TOTAL_STEPS } from '../domain/sequence';
import { MYSTERY_SETS } from '../domain/mysteries';
import { buildDayQueue, declarationText, hailCount } from './steps';

const QUEUE = buildDayQueue('sorrowful');

describe('하루 큐', () => {
  it('77단계다', () => {
    expect(QUEUE).toHaveLength(TOTAL_STEPS);
  });

  it('모든 단계에 읽을 앞 절이 있다', () => {
    for (const step of QUEUE) expect(step.a.length).toBeGreaterThan(0);
  });

  it('구간 이름은 v5 의 형식을 따른다 — 구간 · 기도문 이름', () => {
    expect(QUEUE[0]!.head).toBe('시작 기도 · 성호경');
    expect(QUEUE[3]!.head).toBe('시작 기도 · 성모송');
    const decadeHail = QUEUE.find((s) => s.decade === 3 && s.prayer === 'hail')!;
    expect(decadeHail.head).toBe('제3단 · 성모송');
  });

  it('신비 선포에는 그 단의 신비 제목이 들어간다', () => {
    const decl = QUEUE.find((s) => s.decade === 2 && s.prayer === 'decl')!;
    expect(decl.a).toBe(`${MYSTERY_SETS.sorrowful.decades[1]}을 묵상합시다.`);
    expect(decl.a).not.toContain('{mystery}');
  });

  it('신비가 바뀌면 선포 문구도 바뀐다', () => {
    expect(declarationText('joyful', 1)).toContain(MYSTERY_SETS.joyful.decades[0]!);
    expect(declarationText('glorious', 5)).toContain(MYSTERY_SETS.glorious.decades[4]!);
  });

  it('없는 단은 거절한다', () => {
    expect(() => declarationText('joyful', 6)).toThrow(RangeError);
  });

  it('성호경처럼 받는 절이 없는 기도는 뒷 절이 빈 문자열이다', () => {
    expect(QUEUE[0]!.b).toBe('');
    expect(QUEUE[3]!.b).toBe(PRAYERS.hail.b);
  });

  it('하루에 성모송은 쉰세 번이다 — 시작 기도 셋에 각 단 열씩', () => {
    expect(hailCount(QUEUE)).toBe(53);
  });
});
