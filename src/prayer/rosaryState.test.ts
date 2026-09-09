/**
 * 묵주 알 배치 시험 — 81단계를 훑으며 알이 하나씩 밀리지 않는지 본다.
 *
 * 2026-09-09 에 그림이 열 알에서 **쉰아홉 알**로 바뀌면서(`decisions.md` 결정 6) 이
 * 시험도 함께 바뀌었다. 옛 시험은 "고리의 열 알 중 몇째인가"를 물었고, 지금 시험은
 * "실제 묵주 쉰아홉 알 중 몇째인가"를 묻는다.
 */
import { mysteryForFiftyfourDay } from '../domain/mysteries';
import { BEADS, BEAD_COUNT, LOOP, MEDAL, VIEWBOX, rosaryStateFor } from './rosaryState';
import { buildDayQueue } from './steps';

const QUEUE = buildDayQueue(mysteryForFiftyfourDay(23));

describe('알 쉰아홉의 자리', () => {
  it('실제 묵주와 같은 쉰아홉 알이다 — 늘어진 줄 넷과 고리 쉰다섯', () => {
    expect(BEADS).toHaveLength(BEAD_COUNT);
    expect(BEAD_COUNT).toBe(59);
    expect(BEADS.filter((bead) => bead.big)).toHaveLength(6); // 늘어진 줄 하나 + 단마다 하나
  });

  it('고리의 알은 둘레를 따라 고르게 놓인다 — 몰리거나 성기는 데가 없다', () => {
    const loop = BEADS.slice(4);
    const gaps = loop
      .slice(1)
      .map((bead, i) => Math.hypot(bead.x - loop[i]!.x, bead.y - loop[i]!.y));
    const smallest = Math.min(...gaps);
    const largest = Math.max(...gaps);
    // 가장 좁은 사이와 가장 넓은 사이의 차이가 2% 안이면 눈에는 고르게 보인다.
    expect(largest / smallest).toBeLessThan(1.02);
    // 메달 양옆의 첫 알과 마지막 알도 같은 간격으로 앉는다.
    const toMedal = (bead: { x: number; y: number }) =>
      Math.hypot(bead.x - MEDAL.x, bead.y - MEDAL.y);
    expect(Math.abs(toMedal(loop[0]!) - toMedal(loop[54]!))).toBeLessThan(0.1);
  });

  it('고리는 메달에서 출발해 오른쪽으로 돈다 — 실제 묵주가 도는 방향이다', () => {
    // 표준 「묵주기도 방법」 도해는 제1단을 고리의 오른쪽에, 제5단을 왼쪽에 그린다.
    const first = rosaryStateFor(QUEUE.find((s) => s.decade === 1 && s.prayer === 'hail')!);
    expect(BEADS[first.current]!.x).toBeGreaterThan(LOOP.cx);

    const last = rosaryStateFor(
      QUEUE.find((s) => s.decade === 5 && s.prayer === 'hail' && s.bead === 10)!,
    );
    expect(BEADS[last.current]!.x).toBeLessThan(LOOP.cx);

    // 고리로 들어서는 첫 알도 메달의 오른쪽에 앉는다.
    expect(BEADS[4]!.x).toBeGreaterThan(MEDAL.x);
  });

  it('어떤 알도 그림 밖으로 나가지 않는다', () => {
    for (const bead of BEADS) {
      expect(bead.x).toBeGreaterThanOrEqual(0);
      expect(bead.x).toBeLessThanOrEqual(VIEWBOX.width);
      expect(bead.y).toBeGreaterThanOrEqual(0);
      expect(bead.y).toBeLessThanOrEqual(VIEWBOX.height);
    }
    // 부푼 지금 알(반지름 17)과 그 빛무리(28.9)까지 담을 자리가 고리 위쪽에 있다.
    expect(LOOP.cy - LOOP.ry).toBeGreaterThanOrEqual(17 * 1.7);
  });
});

describe('어느 알이 켜지는가', () => {
  it('성호경과 십자가에 입맞춤과 사도신경은 십자가에서 한다', () => {
    for (const prayer of ['sign', 'kiss', 'creed']) {
      const step = QUEUE.find((s) => s.section === 'opening' && s.prayer === prayer)!;
      expect(rosaryStateFor(step)).toEqual({ done: 0, current: -1, focus: 'cross', label: null });
    }
  });

  it('시작 기도는 늘어진 줄의 큰 알과 작은 알 셋을 차례로 지나 중심 메달에 선다', () => {
    const our = QUEUE.find((s) => s.section === 'opening' && s.prayer === 'our')!;
    expect(rosaryStateFor(our)).toEqual({ done: 0, current: 0, focus: 'bead', label: null });

    const hails = QUEUE.filter((s) => s.section === 'opening' && s.prayer === 'hail');
    expect(hails).toHaveLength(3);
    hails.forEach((step, i) => {
      expect(rosaryStateFor(step)).toEqual({
        done: i + 1,
        current: i + 1,
        focus: 'bead',
        label: i + 1,
      });
    });

    // 영광송과 구원을 비는 기도는 둘 다 중심 메달에서 바친다 (도해 6·7번).
    for (const prayer of ['glory', 'save']) {
      const step = QUEUE.find((s) => s.section === 'opening' && s.prayer === prayer)!;
      expect(rosaryStateFor(step)).toEqual({ done: 4, current: -1, focus: 'medal', label: null });
    }
  });

  it('마침 기도는 알을 다 바친 뒤 중심 메달로 돌아와 바친다', () => {
    const closing = QUEUE.filter((s) => s.section === 'closing');
    expect(closing.map((s) => s.prayer)).toEqual(['salve', 'sign']);
    for (const step of closing) {
      expect(rosaryStateFor(step)).toEqual({
        done: BEAD_COUNT,
        current: -1,
        focus: 'medal',
        label: null,
      });
    }
  });

  it('신비 선포와 주님의 기도는 그 단의 큰 알에서 바친다', () => {
    for (const decade of [1, 2, 3, 4, 5]) {
      const decl = QUEUE.find((s) => s.decade === decade && s.prayer === 'decl')!;
      const our = QUEUE.find((s) => s.decade === decade && s.prayer === 'our')!;
      expect(rosaryStateFor(decl).current).toBe(rosaryStateFor(our).current);
      expect(BEADS[rosaryStateFor(our).current]!.big).toBe(true);
    }
  });

  it('성모송 열 알이 그 단의 큰 알 다음부터 차례로 켜진다', () => {
    const hails = QUEUE.filter((s) => s.decade === 2 && s.prayer === 'hail');
    const big = rosaryStateFor(QUEUE.find((s) => s.decade === 2 && s.prayer === 'our')!).current;
    expect(hails).toHaveLength(10);
    hails.forEach((step, i) => {
      expect(rosaryStateFor(step)).toEqual({
        done: big + i + 1,
        current: big + i + 1,
        focus: 'bead',
        label: i + 1,
      });
    });
  });

  it('영광송과 구원을 비는 기도는 그 단의 열째 알에 머문다', () => {
    const tenth = rosaryStateFor(
      QUEUE.find((s) => s.decade === 3 && s.prayer === 'hail' && s.bead === 10)!,
    );
    for (const prayer of ['glory', 'save']) {
      const step = QUEUE.find((s) => s.decade === 3 && s.prayer === prayer)!;
      expect(rosaryStateFor(step).current).toBe(tenth.current);
      expect(rosaryStateFor(step).label).toBeNull();
    }
  });

  it('하루를 처음부터 끝까지 지나면 알을 하나도 건너뛰지 않고 쉰아홉을 다 밟는다', () => {
    const touched = new Set<number>();
    let previous = -1;
    for (const step of QUEUE) {
      const placement = rosaryStateFor(step);
      expect(placement.current).toBeGreaterThanOrEqual(-1);
      expect(placement.current).toBeLessThan(BEAD_COUNT);
      expect(placement.done).toBeGreaterThanOrEqual(0);
      expect(placement.done).toBeLessThanOrEqual(BEAD_COUNT);
      if (placement.current < 0) continue;
      // 자리는 앞으로만 간다. 뒤로 밀리면 그림이 되감긴 것처럼 보인다.
      expect(placement.current).toBeGreaterThanOrEqual(previous);
      previous = placement.current;
      touched.add(placement.current);
    }
    expect(touched.size).toBe(BEAD_COUNT);
  });
});
