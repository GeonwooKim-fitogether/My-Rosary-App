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
 * 틀려도 고리가 일그러지고, 고쳐야 할 때 쉰다섯 줄을 다시 적어야 한다. 곡선의 길이를
 * 재서 자리를 얻으면 값 몇 개만 고쳐도 모양이 다시 잡힌다.
 *
 * ── 늘어진 묵주의 모양 (2026-09-09, `decisions.md` 결정 8) ────────────────────────
 *
 * 여기까지 고리는 **납작한 타원**이었다. 공방장이 실제 묵주 사진 넉 장을 보내며 그 판정을
 * 뒤집었다 — 사진의 묵주는 어느 것도 타원이 아니고, 넷 다 같은 모양을 하고 있다.
 *
 * 1. 고리가 **아래 중심 메달로 모이는 물방울(하트) 모양**이다. 위쪽에서 두 어깨가 넓게
 *    벌어지고, 아래로 내려오면서 좁아져 메달 한 점에서 만난다.
 * 2. 알과 알 사이에 **줄이 보인다.** 알이 서로 붙어 있지 않다.
 * 3. **단과 단 사이의 줄이 한 칸 더 길다.** 그래서 다섯 단이 눈으로 갈라져 보이고, 각
 *    단의 경계에서 큰 알 하나가 긴 줄 두 도막 사이에 홀로 놓인다.
 *
 * 셋을 각각 어떻게 만들었는지는 아래 `pointAt` 과 `loopSpots` 의 주석에 적었다. 알의
 * 수와 기도와의 대응은 하나도 바뀌지 않았다 — 바뀐 것은 알이 놓이는 **자리**뿐이다.
 */

/** 그림의 좌표계. v5 의 `viewBox="0 0 390 281"` 를 그대로 쓴다. */
export const VIEWBOX = { width: 390, height: 281 } as const;

/**
 * 고리를 감싸는 상자.
 *
 * `rx` 는 고리가 가장 넓은 자리의 반너비가 아니라 **모양을 만드는 데 쓰는 기준값**이다.
 * 아래 `pointAt` 이 그 값에 좁힘(taper)을 곱하므로, 그림에서 실제로 닿는 가장 바깥 자리는
 * `rx` 보다 조금 안쪽이다(실측 x 44~346).
 *
 * 가로세로 비율이 여기서 정해진다. 폭 302 · 높이 164 로 잡은 것은 사진의 묵주가 옆으로
 * 퍼진 타원이 아니라 세로로 선 물방울에 가깝기 때문이다. 처음 판(폭 330 · 높이 146)은
 * 너무 납작해 좁힘을 넣어도 달걀로 보였다.
 *
 * 위쪽 여백 24 는 지금 알(반지름 17)과 그 빛무리가 그림 밖으로 밀려나지 않는 자리다.
 * 빛무리의 바깥 테두리(반지름 28.9)는 완전히 투명해지는 구간이라 잘려도 눈에 보이지
 * 않고, 실제로 보이는 부분은 알에서 22 안쪽까지다.
 */
export const LOOP = { cx: 195, cy: 106, rx: 152, ry: 82 } as const;

/**
 * 좁힘이 끝나는 자리 — 맨 아래(0)에서 맨 위(1) 사이의 어디까지 좁히는가.
 *
 * 이 값보다 위쪽은 타원 그대로 온전한 너비를 갖고(두 어깨), 아래쪽만 메달을 향해 좁아진다.
 * 0.6 은 고리의 아래 60% 가 좁아진다는 뜻이며, 그렇게 하면 가장 넓은 자리가 고리의
 * 한가운데보다 위로 올라가 사진의 어깨 모양이 된다. 0.5 로 두었더니 가장 넓은 자리가
 * 정확히 한가운데에 와서 물방울이 아니라 눕힌 타원으로 보였다.
 */
const TAPER_UNTIL = 0.6;

/** 중심 메달 — 고리의 맨 아래, 늘어진 줄이 시작되는 자리. */
export const MEDAL = { x: LOOP.cx, y: LOOP.cy + LOOP.ry } as const;

/** 십자가가 차지하는 자리 (그리는 일은 `Rosary.tsx` 가 한다). */
export const CROSS = { x: 195, top: 250, bottom: 280 } as const;

/**
 * 늘어진 줄에 달린 알 넷의 y 좌표. 위에서부터 성모송 셋, 그 아래가 주님의 기도 큰 알이다.
 *
 * 사이를 13~16 으로 벌린 것은 고리와 같은 이유다 — 알과 알 사이에 줄이 보여야 하고,
 * 큰 알은 이웃에서 한 칸 더 떨어져 홀로 놓여야 한다.
 */
const PENDANT_Y = { hails: [202, 213, 224], big: 238 } as const;

/** 한 단이 차지하는 알 — 큰 알 하나와 작은 알 열. */
const BEADS_PER_DECADE = 11;
/** 고리에 놓이는 알의 수 — 다섯 단 × 열한 알. */
const LOOP_BEADS = BEADS_PER_DECADE * 5;
/** 늘어진 줄의 알 수 — 큰 알 하나와 작은 알 셋. */
const PENDANT_BEADS = 4;

/**
 * 알의 반지름.
 *
 * 자리와 크기는 **묵주 재질 넷이 모두 같이 쓴다** — 재질은 칠하기만 하고 배치는 이 층이
 * 정한다(`decisions.md` 결정 9). 그래서 크기도 그리는 층이 아니라 여기 있다: 알 사이에
 * 줄이 얼마나 보이는가는 자리(아래 `LONG_LINK` 계산)와 크기가 함께 정하는 값이라, 둘이
 * 떨어져 있으면 한쪽만 고쳤을 때 알이 서로 겹쳐 버린다.
 *
 * | | 반지름 | 화면에서의 지름 | 화면 폭(390) 대비 |
 * |---|---|---|---|
 * | 작은 알 | 4.4 | 8.4px | 2.1% |
 * | 큰 알 | 6.1 | 11.6px | 3.0% |
 * | **지금 알** | **17** | **32.3px** | **8.3%** — 디자인 시스템 §9-3 의 13번을 넘긴다 |
 *
 * 작은 알이 5.8 에서 4.4 로 준 것은 줄을 보이게 하려고 치른 값이다. 둘레는 761 로 거의
 * 정해져 있는데(고리가 viewBox 안에 들어가야 한다) 거기에 알 쉰다섯과 줄 쉰여섯 도막이
 * 함께 들어가야 하므로, 알을 줄이지 않으면 줄이 설 자리가 없다. 지금 알만은 그대로
 * 17 이라 "지금 어디인가"를 말하는 힘은 줄지 않았다.
 */
export const BEAD_RADIUS = { small: 4.4, big: 6.1, current: 17 } as const;

/**
 * 단 경계의 줄이 보통 줄의 몇 배인가.
 *
 * 사진에서 각 단의 경계는 큰 알 하나가 긴 줄 두 도막 사이에 홀로 놓인 모습이다. 그래서
 * 큰 알에 닿는 줄 도막과 메달에 닿는 줄 도막만 이 배수만큼 길게 준다.
 */
const LONG_LINK = 1.6;

/** 알 하나의 자리와 크기. */
export interface BeadSpot {
  readonly x: number;
  readonly y: number;
  /** 큰 알(주님의 기도)인가. */
  readonly big: boolean;
}

/**
 * 고리 위의 한 점. 매개변수 t 가 0 이면 맨 아래(메달 자리)이고, t 가 커지면 오른쪽으로,
 * 이어서 위로, 그다음 왼쪽으로 돈다. **실제 묵주가 도는 방향이 이쪽이다** — 한국 천주교의
 * 표준 「묵주기도 방법」 도해는 "묵주기도는 십자가를 쥐고 오른쪽 방향으로 진행됩니다"라고
 * 적고, 제1단을 고리의 오른쪽에 제5단을 왼쪽에 그린다 (`decisions.md` 결정 7).
 *
 * **왜 타원이 아닌가.** 타원은 맨 아래가 가장 넓다. 그래서 알들이 메달 옆으로 넓게
 * 벌어지고, 실제 묵주가 메달 한 점에서 두 가닥으로 갈라지는 모습이 나오지 않는다.
 * 여기서는 타원의 가로 폭에 **좁힘(taper)** 을 곱한다. 좁힘은 맨 아래에서 0 이고 위로
 * 갈수록 1 에 가까워지므로, 위쪽은 타원 그대로 넓게 남고 아래쪽만 메달로 모인다.
 *
 * 좁힘의 식으로 **매끄럼 계단(smoothstep, `3q² − 2q³`)** 을 쓴다. 여기서 `s` 는 맨 아래를
 * 0, 맨 위를 1 로 둔 값이고 `q` 는 그 `s` 를 `TAPER_UNTIL` 로 나눈 것이다. 이 식을 고른
 * 이유는 **메달에서 나가는 각도** 때문이다. 맨 아래에서 이 식은 `q²` 처럼 움직이는데,
 * 세로로 내려오는 값은 그보다 느리게 움직이므로 두 가닥이 메달에서 거의 **곧게 서서**
 * 갈라져 올라간다(실측 84도). 좁힘을 `1 − (1 − s)^n` 같은 식으로 잡으면 반대로 눕는다 —
 * 처음 판에서 실제로 그렇게 나와, 고리가 물방울이 아니라 납작한 달걀로 보였다.
 */
function pointAt(t: number): { x: number; y: number } {
  const s = 1 - Math.abs(t - Math.PI) / Math.PI;
  const q = Math.min(1, s / TAPER_UNTIL);
  const taper = q * q * (3 - 2 * q);
  return { x: LOOP.cx + LOOP.rx * Math.sin(t) * taper, y: LOOP.cy + LOOP.ry * Math.cos(t) };
}

/** 곡선을 잘게 재어 만든 누적 길이표. 자리를 얻는 일과 실을 그리는 일이 함께 쓴다. */
const SAMPLES = 4000;
const CUMULATIVE: number[] = (() => {
  const table = [0];
  let previous = pointAt(0);
  for (let i = 1; i <= SAMPLES; i++) {
    const point = pointAt((i * 2 * Math.PI) / SAMPLES);
    table.push(table[i - 1]! + Math.hypot(point.x - previous.x, point.y - previous.y));
    previous = point;
  }
  return table;
})();

/** 고리의 둘레 전체 길이. */
const PERIMETER = CUMULATIVE[SAMPLES]!;

/** 메달에서 이만큼 걸어간 자리의 점. */
function pointAtLength(length: number): { x: number; y: number } {
  let cursor = 1;
  while (cursor < SAMPLES && CUMULATIVE[cursor]! < length) cursor++;
  // 두 표본 사이를 길이로 갈라 끼워 넣는다. 표본 하나만큼의 어긋남(0.2 안팎)을 없앤다.
  const before = CUMULATIVE[cursor - 1]!;
  const after = CUMULATIVE[cursor]!;
  const ratio = after > before ? (length - before) / (after - before) : 0;
  return pointAt(((cursor - 1 + ratio) * 2 * Math.PI) / SAMPLES);
}

/**
 * 줄 도막 쉰여섯의 길이 비율.
 *
 * 메달과 알 쉰다섯을 잇는 도막은 쉰여섯이다(메달에서 첫 알, 알에서 알 쉰넷, 마지막
 * 알에서 다시 메달). 여기까지는 쉰여섯을 **똑같이** 나눴는데, 그러면 다섯 단이 한 줄로
 * 이어져 보여 사진과 달랐다. 그래서 **큰 알이나 메달에 닿는 도막만** 길게 준다.
 *
 * 그런 도막은 열하나다 — 큰 알 다섯의 양옆으로 열, 그리고 마지막 알에서 메달로 돌아오는
 * 하나(메달에서 첫 알로 나가는 도막은 이미 첫 큰 알의 것으로 세어졌다). 나머지 마흔다섯은
 * 성모송 알 사이의 보통 도막이다.
 */
function linkWeights(): number[] {
  const isEnd = (node: number) => node < 0 || node >= LOOP_BEADS || node % BEADS_PER_DECADE === 0;
  const weights: number[] = [];
  for (let link = 0; link <= LOOP_BEADS; link++) {
    weights.push(isEnd(link - 1) || isEnd(link) ? LONG_LINK : 1);
  }
  return weights;
}

/**
 * 고리 위에 알 쉰다섯을 놓는다.
 *
 * 길이로 재서 놓는 것이 핵심이다. 매개변수 t 를 고르게 나누면 안 된다 — t 는 각도가
 * 아니라서, 그렇게 놓으면 굽은 쪽에 알이 몰리고 편 쪽이 성기어진다. 그래서 둘레를 잘게
 * 재 누적 길이를 만들고(`CUMULATIVE`), 위 `linkWeights` 가 정한 비율대로 잘라 자리를 얻는다.
 */
function loopSpots(): { x: number; y: number }[] {
  const weights = linkWeights();
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const spots: { x: number; y: number }[] = [];
  let walked = 0;
  for (let k = 0; k < LOOP_BEADS; k++) {
    walked += weights[k]!;
    const point = pointAtLength((walked / total) * PERIMETER);
    spots.push({ x: round(point.x), y: round(point.y) });
  }
  return spots;
}

/** 좌표는 소수 둘째 자리까지만 쓴다. 시험에서 값을 견주기 좋고 그림은 달라지지 않는다. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * 고리를 그리는 SVG 경로.
 *
 * **알을 놓는 데 쓴 곡선 그 자체**를 잘게 이어 그린다. 실을 다른 식(예: 타원 도형)으로
 * 그리면 알이 실에서 떠 보이므로, 두 층이 같은 `pointAt` 을 쓰게 묶어 둔 것이다.
 * 마디 200 이면 이 크기에서 꺾인 자리가 눈에 보이지 않는다.
 */
export const LOOP_PATH: string = (() => {
  const STEPS = 200;
  const parts: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    // 마디를 **길이로** 고르게 나눈다. 매개변수 t 로 나누면 굽은 쪽에 마디가 몰려,
    // 사슬로 그릴 때(은·금) 마디의 길이가 자리마다 달라진다.
    const point = pointAtLength((i / STEPS) * PERIMETER);
    parts.push(`${i === 0 ? 'M' : 'L'}${round(point.x)} ${round(point.y)}`);
  }
  return `${parts.join(' ')} Z`;
})();

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
