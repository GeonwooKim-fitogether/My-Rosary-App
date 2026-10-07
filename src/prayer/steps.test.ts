/**
 * 하루 큐 시험 — `spec/` 의 81단계에 `spec/` 의 문구가 제대로 붙는가.
 */
import { PRAYERS, TOTAL_STEPS } from '../domain/sequence';
import { MYSTERY_SETS } from '../domain/mysteries';
import { buildDayQueue, declarationText, hailCount, hailCountAmong } from './steps';

const QUEUE = buildDayQueue('sorrowful');

describe('하루 큐', () => {
  it('81단계다', () => {
    expect(QUEUE).toHaveLength(TOTAL_STEPS);
  });

  it('모든 단계에 읽을 앞 절이 있다', () => {
    for (const step of QUEUE) expect(step.a.length).toBeGreaterThan(0);
  });

  it('구간 이름은 v5 의 형식을 따른다 — 구간 · 기도문 이름', () => {
    expect(QUEUE[0]!.head).toBe('시작 기도 · 성호경');
    expect(QUEUE[4]!.head).toBe('시작 기도 · 성모송');
    const decadeHail = QUEUE.find((s) => s.decade === 3 && s.prayer === 'hail')!;
    expect(decadeHail.head).toBe('제3단 · 성모송');
  });

  it('마침 기도 구간도 같은 형식으로 적는다', () => {
    const closing = QUEUE.filter((s) => s.section === 'closing');
    expect(closing.map((s) => s.head)).toEqual(['마침 기도 · 성모찬송', '마침 기도 · 성호경']);
  });

  it('십자가에 입맞춤은 낭송할 기도문 대신 무엇을 하는지 알리는 한 줄이다', () => {
    const kiss = QUEUE.find((s) => s.prayer === 'kiss')!;
    expect(kiss.head).toBe('시작 기도 · 십자가에 입맞춤');
    expect(kiss.a).toBe('십자가에 입맞춥니다.');
    expect(kiss.b).toBe('');
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
    expect(QUEUE[4]!.b).toBe(PRAYERS.hail.b);
  });

  it('하루에 성모송은 쉰세 번이다 — 시작 기도 셋에 각 단 열씩', () => {
    expect(hailCount(QUEUE)).toBe(53);
  });
});

/**
 * 건너뛴 뒤의 셈 — `decisions.md` 결정 6.
 *
 * 단을 건너뛸 수 있게 되면서 "하루를 마쳤다"가 더는 "쉰세 번 바쳤다"를 뜻하지 않는다.
 * 바치지 않은 기도를 바쳤다고 적어 주면 그 화면이 하는 일이 무너지므로, 실제로 지나온
 * 단계만 센다.
 */
describe('실제로 지나온 성모송만 세기', () => {
  const all = QUEUE.map((_, i) => i);

  it('처음부터 끝까지 지나면 쉰셋 — 큐 전체를 센 것과 같다', () => {
    expect(hailCountAmong(QUEUE, all)).toBe(hailCount(QUEUE));
  });

  it('제5단만 바치면 열 번이다 (시작 기도의 셋도 건너뛰었으므로)', () => {
    const fifth = all.filter((i) => QUEUE[i]!.decade === 5);
    expect(hailCountAmong(QUEUE, fifth)).toBe(10);
  });

  it('시작 기도만 바치면 세 번이다', () => {
    const opening = all.filter((i) => QUEUE[i]!.section === 'opening');
    expect(hailCountAmong(QUEUE, opening)).toBe(3);
  });

  it('같은 알을 되짚어 두 번 지나도 한 번으로 센다', () => {
    // 11~13 은 제1단의 첫 세 성모송이다.
    const twice = [11, 12, 11, 12, 13];
    expect(hailCountAmong(QUEUE, twice)).toBe(3);
  });

  it('아무 데도 지나지 않았으면 영이다', () => {
    expect(hailCountAmong(QUEUE, [])).toBe(0);
  });
});
