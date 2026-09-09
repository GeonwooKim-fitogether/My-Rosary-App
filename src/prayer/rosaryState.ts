/**
 * 묵주 그림의 알 배치 — 그림을 그리지 않고 "알이 어디 있고 어느 알이 켜지는가"만 정하는 층.
 *
 * 그리는 일(`Rosary.tsx`)과 갈라 둔 이유는 이 판정이 화면 없이 시험할 수 있는 규칙이기
 * 때문이다. 알이 하나씩 밀려 켜지는 실수는 눈으로는 잘 안 보이고 시험으로는 바로 잡힌다.
 *
 * ── 알 쉰아홉 (2026-09-09, `decisions.md` 결정 6) ────────────────────────────────
 *
 * 여기까지는 고리의 **열 알만** 그렸다. v5 시안이 "쉰아홉 알을 한 화면에 다 그리면 지금
 * 어느 알인지가 보이지 않는다"고 판정했기 때문인데, 공방장이 그 판정을 뒤집었다 —
 * "묵주가 모든 알이 다 반영되게 해줘". 그래서 실제 묵주와 같은 쉰아홉 알을 다 그린다.
 *
 * 81단계와 실제 묵주는 정확히 맞아떨어진다.
 *
 * | 묵주의 자리 | 81단계의 어디 | 알 수 |
 * |---|---|---|
 * | 십자가 | 성호경 · 십자가에 입맞춤 · 사도신경 | — (알이 아니다) |
 * | 늘어진 줄의 큰 알 | 시작 기도의 주님의 기도 | 1 |
 * | 늘어진 줄의 작은 알 셋 | 시작 기도의 성모송 셋 | 3 |
 * | 중심 메달 | 시작 기도의 영광송과 구원을 비는 기도, 그리고 마침 기도 둘 | — (알이 아니다) |
 * | 고리의 큰 알 다섯 | 각 단의 신비 선포·주님의 기도 | 5 |
 * | 고리의 작은 알 쉰 | 각 단의 성모송 열 | 50 |
 *
 * 합이 쉰아홉이고 이것이 실제 묵주의 알 수다.
 *
 * **알에 머물지 않는 단계를 어디에 두었나.** 성호경과 십자가에 입맞춤과 사도신경은
 * 십자가에서 하는 것이므로 십자가가 빛난다. 시작 기도의 영광송과 구원을 비는 기도는 세
 * 알을 지나 고리로 들어서는 자리인 중심 메달에서 빛난다 — 표준 「묵주기도 방법」 도해가
 * 그 둘(6번과 7번)을 같은 자리에 그렸기 때문이다. 각 단의 영광송과 구원을 비는 기도는
 * **그 단의 열째 알에 머문다** — 실제로 그 두 기도는 열째 알을 쥔 채 바치고, 다음 큰 알로
 * 손을 옮기는 것은 다음 단을 시작할 때이기 때문이다. 앞으로 나아간 척하지 않는 쪽이
 * "지금 어디까지 왔나"에 정직하다. 마침 기도의 성모찬송과 성호경도 중심 메달에서 빛나되,
 * 그때는 알 쉰아홉을 모두 바친 뒤이므로 이미 바친 알의 수가 쉰아홉이다.
 *
 * **좌표를 손으로 적지 않고 계산하는 이유.** 쉰다섯 자리를 손으로 적으면 한 자리만
 * 틀려도 고리가 일그러지고, 고쳐야 할 때 쉰다섯 줄을 다시 적어야 한다. 타원 둘레를
 * **길이로 고르게 나눠** 자리를 얻으면 값 넷(중심·두 반지름)만 고치면 된다.
 */

/** 그림의 좌표계. v5 의 `viewBox="0 0 390 281"` 를 그대로 쓴다. */
export const VIEWBOX = { width: 390, height: 281 } as const;

/**
 * 고리(타원)의 자리.
 *
 * 위쪽 여백 30 은 우연이 아니다. 지금 알은 크게 부풀고(반지름 17) 그 둘레에 빛무리가
 * 번지는데(28.9), 고리의 맨 위 알이 지금 알이 되면 그 빛무리가 그림 밖으로 잘린다.
 * 30 은 잘리지 않는 가장 위쪽 자리다. 좌우(30·360)도 같은 이유로 잡았다.
 */
export const LOOP = { cx: 195, cy: 103, rx: 165, ry: 73 } as const;

/** 중심 메달 — 고리의 맨 아래, 늘어진 줄이 시작되는 자리. */
export const MEDAL = { x: LOOP.cx, y: LOOP.cy + LOOP.ry } as const;

/** 십자가가 차지하는 자리 (그리는 일은 `Rosary.tsx` 가 한다). */
export const CROSS = { x: 195, top: 254, bottom: 280 } as const;

/** 늘어진 줄에 달린 알 넷의 y 좌표. 위에서부터 성모송 셋, 그 아래가 주님의 기도 큰 알이다. */
const PENDANT_Y = { hails: [190, 204, 218], big: 236 } as const;

/** 한 단이 차지하는 알 — 큰 알 하나와 작은 알 열. */
const BEADS_PER_DECADE = 11;
/** 고리에 놓이는 알의 수 — 다섯 단 × 열한 알. */
const LOOP_BEADS = BEADS_PER_DECADE * 5;
/** 늘어진 줄의 알 수 — 큰 알 하나와 작은 알 셋. */
const PENDANT_BEADS = 4;

/** 알 하나의 자리와 크기. */
export interface BeadSpot {
  readonly x: number;
  readonly y: number;
  /** 큰 알(주님의 기도)인가. */
  readonly big: boolean;
}

/**
 * 타원 위의 한 점. 매개변수 t 가 0 이면 맨 아래(메달 자리)이고, t 가 커지면 오른쪽으로,
 * 이어서 위로, 그다음 왼쪽으로 돈다. **실제 묵주가 도는 방향이 이쪽이다** — 한국 천주교의
 * 표준 「묵주기도 방법」 도해는 "묵주기도는 십자가를 쥐고 오른쪽 방향으로 진행됩니다"라고
 * 적고, 제1단을 고리의 오른쪽에 제5단을 왼쪽에 그린다.
 *
 * 2026-09-09 이전에는 반대(왼쪽)로 돌았다. 그때의 근거는 v5 시안이 열 알을 왼쪽에서
 * 오른쪽으로 한 줄에 늘어놓았다는 것이었는데, 그 값은 알 열 개를 한 줄로 폈을 때의 읽기
 * 순서였을 뿐 고리의 회전 방향이 아니었다. 결정 6 으로 진짜 고리를 그리게 된 지금은
 * 실제 묵주의 진행 방향이 정본이다 (결정 7).
 */
function pointAt(t: number): { x: number; y: number } {
  return { x: LOOP.cx + LOOP.rx * Math.sin(t), y: LOOP.cy + LOOP.ry * Math.cos(t) };
}

/**
 * 고리 위에 알 쉰다섯을 **둘레 길이로 고르게** 놓는다.
 *
 * 매개변수 t 를 고르게 나누면 안 된다 — 타원에서 t 는 각도가 아니라서, 그렇게 놓으면
 * 납작한 쪽(좌우 끝)에 알이 몰리고 긴 쪽(위아래)이 성기어진다. 그래서 둘레를 잘게 재
 * 누적 길이를 만들고, 그 길이를 고르게 잘라 자리를 얻는다.
 *
 * 자리는 쉰여섯 칸으로 나눈다 — 메달이 한 칸을 차지하기 때문이다. 그래서 첫 알과
 * 마지막 알이 메달을 사이에 두고 나란히 앉는다.
 */
function loopSpots(): { x: number; y: number }[] {
  const SAMPLES = 4000;
  const cumulative: number[] = [0];
  let previous = pointAt(0);
  for (let i = 1; i <= SAMPLES; i++) {
    const point = pointAt((i * 2 * Math.PI) / SAMPLES);
    cumulative.push(cumulative[i - 1]! + Math.hypot(point.x - previous.x, point.y - previous.y));
    previous = point;
  }
  const total = cumulative[SAMPLES]!;
  const slots = LOOP_BEADS + 1;

  const spots: { x: number; y: number }[] = [];
  let cursor = 1;
  for (let k = 1; k <= LOOP_BEADS; k++) {
    const target = (k * total) / slots;
    while (cursor < SAMPLES && cumulative[cursor]! < target) cursor++;
    // 두 표본 사이를 길이로 갈라 끼워 넣는다. 표본 하나만큼의 어긋남(0.2 안팎)을 없앤다.
    const before = cumulative[cursor - 1]!;
    const after = cumulative[cursor]!;
    const ratio = after > before ? (target - before) / (after - before) : 0;
    const t = ((cursor - 1 + ratio) * 2 * Math.PI) / SAMPLES;
    const point = pointAt(t);
    spots.push({ x: round(point.x), y: round(point.y) });
  }
  return spots;
}

/** 좌표는 소수 둘째 자리까지만 쓴다. 시험에서 값을 견주기 좋고 그림은 달라지지 않는다. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * 알 쉰아홉 — **기도하는 순서 그대로** 늘어놓은 것이다.
 *
 * 0 번이 늘어진 줄의 큰 알(시작 기도의 주님의 기도)이고, 1~3 번이 그 위의 작은 알 셋,
 * 4 번부터가 고리다. 이 순서가 곧 "몇 알이나 바쳤나"의 순서이므로, 자리 번호 하나로
 * 이미 바친 알과 아직 안 바친 알이 갈린다.
 */
export const BEADS: readonly BeadSpot[] = [
  { x: MEDAL.x, y: PENDANT_Y.big, big: true },
  ...PENDANT_Y.hails
    .slice()
    .reverse() // 십자가에서 멀어지는 순서 = 바치는 순서. 메달에 가장 가까운 알이 셋째다.
    .map((y) => ({ x: MEDAL.x, y, big: false })),
  ...loopSpots().map((spot, i) => ({ ...spot, big: i % BEADS_PER_DECADE === 0 })),
];

/** 알의 총수 — 쉰아홉. 실제 묵주와 같다. */
export const BEAD_COUNT = PENDANT_BEADS + LOOP_BEADS;

/** 지금 빛나는 것이 무엇인가. 알이 아닌 자리가 둘 있어 이름으로 갈라 둔다. */
export type RosaryFocus = 'cross' | 'medal' | 'bead';

export interface RosaryPlacement {
  /** 이미 바친 알의 수 (0~59). 이 수보다 앞선 자리의 알은 채워 그린다. */
  done: number;
  /** 지금 바치는 알의 자리 (0~58). 십자가나 메달에 머물면 -1. */
  current: number;
  /** 지금 빛나는 것 — 십자가 · 중심 메달 · 알 하나. */
  focus: RosaryFocus;
  /** 지금 알 안에 적을 숫자 (성모송의 몇째 알인가). 적지 않으면 null. */
  label: number | null;
}

/** 제 d 단의 큰 알이 몇 번째 자리인가. */
function decadeBigIndex(decade: number): number {
  return PENDANT_BEADS + (decade - 1) * BEADS_PER_DECADE;
}

/**
 * 지금 단계가 묵주 그림의 어디에 해당하는가.
 *
 * 단을 건너뛰어도 이 함수는 달라지지 않는다 — 지금 단계 하나만 보고 자리를 정하므로,
 * 제3단으로 뛰어들면 앞의 알들은 "바친 것"으로 채워진다. 실제로 바친 알만 세는 일은
 * 이 그림이 아니라 `usePrayerSession` 이 따로 맡는다(하루 완주 화면의 성모송 수).
 */
export function rosaryStateFor(step: {
  section: string;
  prayer: string;
  decade?: number | null;
  bead: number | null;
  of?: number;
}): RosaryPlacement {
  const at = (current: number, label: number | null = null): RosaryPlacement => ({
    done: current,
    current,
    focus: 'bead',
    label,
  });

  // 마침 기도는 알을 다 바친 뒤 중심 메달로 돌아와 바친다 (도해 33·34번).
  if (step.section === 'closing') {
    return { done: BEAD_COUNT, current: -1, focus: 'medal', label: null };
  }

  if (step.section === 'opening') {
    if (step.prayer === 'our') return at(0);
    if (step.prayer === 'hail' && step.bead !== null) return at(step.bead, step.bead);
    // 영광송과 구원을 비는 기도는 세 알을 지나 선 중심 메달에서 바친다 (도해 6·7번).
    if (step.prayer === 'glory' || step.prayer === 'save') {
      return { done: PENDANT_BEADS, current: -1, focus: 'medal', label: null };
    }
    // 남은 것은 성호경·십자가에 입맞춤·사도신경이고, 셋 다 십자가에서 한다.
    return { done: 0, current: -1, focus: 'cross', label: null };
  }

  const decade = step.decade ?? 1;
  const big = decadeBigIndex(decade);
  if (step.prayer === 'hail' && step.bead !== null) return at(big + step.bead, step.bead);
  // 영광송과 구원을 비는 기도는 그 단의 열째 알을 쥔 채 바친다.
  if (step.prayer === 'glory' || step.prayer === 'save') return at(big + 10);
  // 신비 선포와 주님의 기도는 그 단의 큰 알에서.
  return at(big);
}
