/**
 * 묵주 알 배치 시험 — 81단계를 훑으며 알이 하나씩 밀리지 않는지 본다.
 *
 * 2026-09-09 에 그림이 열 알에서 **쉰아홉 알**로 바뀌면서(`decisions.md` 결정 6) 이
 * 시험도 함께 바뀌었다. 옛 시험은 "고리의 열 알 중 몇째인가"를 물었고, 지금 시험은
 * "실제 묵주 쉰아홉 알 중 몇째인가"를 묻는다.
 *
 * 2026-09-17 에 한 번 더 바뀌었다(`decisions.md` 결정 12-2 의 카드 D). 고리가 물방울에서
 * **정원**으로 바뀌면서 좌표를 재는 시험들이 옛 모양을 재고 있었기 때문이다. 바뀐 것은
 * **좌표를 재는 시험뿐이고**, 어느 단계가 어느 알에 대응하는가를 재는 아래쪽 묶음
 * (`어느 알이 켜지는가`)과 알의 수를 세는 시험은 한 줄도 손대지 않았다 — 기하가 바뀌어도
 * 그 대응은 바뀌지 않아야 하고, 그것이 이 판의 통과 조건이었다.
 */
import { mysteryForFiftyfourDay } from '../domain/mysteries';
import {
  BEADS,
  BEAD_COUNT,
  BEAD_RADIUS,
  LOOP,
  LOOP_PATH,
  LOOP_RING_BEADS,
  LOOP_SLOTS,
  MEDAL,
  TAIL_BEADS,
  VIEWBOX,
  loopBeadAtAngle,
  loopBeadIndex,
  ringAngleDeg,
  rosaryStateFor,
} from './rosaryState';
import { buildDayQueue } from './steps';

const QUEUE = buildDayQueue(mysteryForFiftyfourDay(23));

describe('알 쉰아홉의 자리', () => {
  it('실제 묵주와 같은 쉰아홉 알이다 — 꼬리 다섯과 고리 쉰넷', () => {
    expect(BEADS).toHaveLength(BEAD_COUNT);
    expect(BEAD_COUNT).toBe(59);
    expect(BEADS.filter((bead) => bead.big)).toHaveLength(6); // 늘어진 줄 하나 + 단마다 하나
  });

  it('꼬리에 다섯 알이 한 줄로 서고, 제1단의 주님의 기도가 메달 바로 아래다 (카드 D)', () => {
    // 시안의 `tailPos` 그대로다. 위에서 아래로 236 · 250 · 261 · 272 · 286 이고,
    // 바치는 순서는 아래에서 위로 올라가므로 자리 번호 0 이 맨 아래(286)다.
    expect(BEADS.slice(0, TAIL_BEADS).map((bead) => bead.y)).toEqual([286, 272, 261, 250, 236]);
    for (const bead of BEADS.slice(0, TAIL_BEADS)) expect(bead.x).toBe(MEDAL.x);

    // 꼬리의 큰 알은 양 끝 둘이다 — 맨 아래가 시작 기도의 주님의 기도, 맨 위가 제1단의 것.
    expect(BEADS.slice(0, TAIL_BEADS).map((bead) => bead.big)).toEqual([
      true,
      false,
      false,
      false,
      true,
    ]);
    // 그 맨 위 알이 실제로 제1단의 주님의 기도 자리다 (대응은 아래 묶음이 다시 잰다).
    const decadeOne = rosaryStateFor(QUEUE.find((s) => s.decade === 1 && s.prayer === 'our')!);
    expect(decadeOne.current).toBe(TAIL_BEADS - 1);
  });

  it('고리는 물방울이 아니라 정원이다 — 알 쉰넷이 원둘레에 고르게 앉는다 (카드 D)', () => {
    const ring = BEADS.slice(TAIL_BEADS);
    expect(ring).toHaveLength(LOOP_RING_BEADS);

    // 1. 모든 알이 중심에서 같은 거리(반지름 96)에 있다. 좁힘이 남아 있으면 여기서 갈린다.
    for (const bead of ring) {
      expect(Math.hypot(bead.x - LOOP.cx, bead.y - LOOP.cy)).toBeCloseTo(LOOP.r, 1);
    }

    // 2. 이웃한 알 사이의 거리가 모두 같다 — 쉰여섯 칸을 고르게 나눈 결과다.
    const gaps: number[] = [];
    for (let i = 0; i < ring.length - 1; i++) {
      gaps.push(Math.hypot(ring[i + 1]!.x - ring[i]!.x, ring[i + 1]!.y - ring[i]!.y));
    }
    const slotChord = 2 * LOOP.r * Math.sin(Math.PI / LOOP_SLOTS);
    for (const gap of gaps) expect(gap).toBeCloseTo(slotChord, 1);

    // 3. 알이 없는 두 칸은 맨 아래에 있다 — 그 틈에 꼬리와 메달이 붙는다.
    expect(ring[0]!.y).toBeGreaterThan(LOOP.cy);
    expect(ring[LOOP_RING_BEADS - 1]!.y).toBeGreaterThan(LOOP.cy);
  });

  it('알끼리 겹치지 않는다 — 사이마다 줄이 보인다', () => {
    const ring = BEADS.slice(TAIL_BEADS);
    for (let i = 0; i < ring.length - 1; i++) {
      const distance = Math.hypot(ring[i + 1]!.x - ring[i]!.x, ring[i + 1]!.y - ring[i]!.y);
      const touching =
        (ring[i]!.big ? BEAD_RADIUS.big : BEAD_RADIUS.small) +
        (ring[i + 1]!.big ? BEAD_RADIUS.big : BEAD_RADIUS.small);
      /*
       * 알 둘의 반지름을 더한 것보다 사이가 멀어야 그 틈으로 줄이 보인다. 가장 빠듯한 짝은
       * 큰 알과 그 이웃 작은 알이고, 그 틈이 1.26 이다 — 칸 하나의 현(10.76)에서 두 반지름
       * (5.8 + 3.7)을 뺀 값이다. 옛 물방울 판은 단 경계의 줄을 1.6 배로 늘려 이 틈이 더
       * 넓었는데, 정원에서는 칸이 고르므로 시안이 정한 반지름이 그대로 이 값을 정한다.
       */
      expect(distance - touching).toBeGreaterThan(1.2);
    }
  });

  it('고리는 메달에서 출발해 오른쪽으로 돈다 — 실제 묵주가 도는 방향이다', () => {
    // 표준 「묵주기도 방법」 도해는 제1단을 고리의 오른쪽에, 제5단을 왼쪽에 그린다.
    const first = rosaryStateFor(QUEUE.find((s) => s.decade === 1 && s.prayer === 'hail')!);
    expect(BEADS[first.current]!.x).toBeGreaterThan(LOOP.cx);

    const last = rosaryStateFor(
      QUEUE.find((s) => s.decade === 5 && s.prayer === 'hail' && s.bead === 10)!,
    );
    expect(BEADS[last.current]!.x).toBeLessThan(LOOP.cx);

    // 고리로 들어서는 첫 알도 메달의 오른쪽에 앉는다. 옛 판에서는 그 알이 자리 번호 4
    // (제1단의 주님의 기도)였는데, 시안이 그 알을 꼬리로 옮겨 이제 5 번이 고리의 첫 알이다.
    expect(BEADS[TAIL_BEADS]!.x).toBeGreaterThan(MEDAL.x);
  });

  it('어떤 알도 그림 밖으로 나가지 않는다', () => {
    for (const bead of BEADS) {
      expect(bead.x).toBeGreaterThanOrEqual(0);
      expect(bead.x).toBeLessThanOrEqual(VIEWBOX.width);
      expect(bead.y).toBeGreaterThanOrEqual(0);
      expect(bead.y).toBeLessThanOrEqual(VIEWBOX.height);
    }
    // 지금 알의 빛무리(알 반지름 + 6)까지 담을 자리가 고리의 맨 위에 있다. 고리의 꼭대기는
    // y = 118 − 96 = 22 이고, 가장 큰 빛무리는 큰 알의 5.8 + 6 = 11.8 이다.
    expect(LOOP.cy - LOOP.r).toBeGreaterThanOrEqual(BEAD_RADIUS.big + 6);
    // 십자가의 아래 끝(320)도 그림 안이다.
    expect(VIEWBOX.height).toBeGreaterThanOrEqual(320);
  });

  it('줄을 그리는 경로가 알을 놓는 곡선과 같다 — 알이 줄에서 뜨지 않는다', () => {
    // 경로의 마디마다 가장 가까운 알까지의 거리를 재는 대신, 알마다 경로 위에 그 알을
    // 지나는 마디가 있는지를 본다. 둘이 다른 곡선에서 나왔다면 여기서 벌어진다.
    const points = LOOP_PATH.split(/[ML]/)
      .filter(Boolean)
      .map((pair) => {
        const [x, y] = pair.trim().split(' ').map(Number);
        return { x: x!, y: y! };
      });
    for (const bead of BEADS.slice(TAIL_BEADS)) {
      const nearest = Math.min(...points.map((p) => Math.hypot(p.x - bead.x, p.y - bead.y)));
      // 마디 사이가 이 크기에서 2.65 이므로, 알은 언제나 그 절반 안쪽에 있다.
      expect(nearest).toBeLessThan(1.4);
    }
    // 줄은 닫힌 고리가 아니라 **열린 호**다 — 맨 아래 두 칸을 비워 꼬리가 들어설 틈을 낸다.
    expect(LOOP_PATH.endsWith('Z')).toBe(false);
  });
});

describe('손가락이 고리의 어느 알 위에 있는가 (§3-4)', () => {
  it('알의 자리에서 잰 각도가 그 알의 번호로 되돌아온다', () => {
    // 각도를 재는 식과 알을 놓는 식이 어긋나면 한 칸씩 밀려 엉뚱한 기도로 뛴다.
    for (let k = 0; k < LOOP_RING_BEADS; k++) {
      const bead = BEADS[loopBeadIndex(k)]!;
      const degrees = ringAngleDeg(bead.x - LOOP.cx, bead.y - LOOP.cy);
      expect(loopBeadAtAngle(degrees)).toBe(k);
    }
  });

  it('알이 없는 맨 아래 두 칸을 가리키면 양 끝 알로 잘린다', () => {
    // 맨 아래(0도)는 빈 칸이다. 첫 알에 붙어 있게 해야 손가락이 틈을 지날 때 알이 사라지지 않는다.
    expect(loopBeadAtAngle(0)).toBe(0);
    expect(loopBeadAtAngle(359)).toBe(LOOP_RING_BEADS - 1);
  });

  it('고리의 첫 알은 오른쪽 아래, 마지막 알은 왼쪽 아래다 (결정 7 과 같은 방향)', () => {
    expect(BEADS[loopBeadIndex(0)]!.x).toBeGreaterThan(LOOP.cx);
    expect(BEADS[loopBeadIndex(LOOP_RING_BEADS - 1)]!.x).toBeLessThan(LOOP.cx);
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
