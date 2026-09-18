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
 * ── 옛 물방울 기하는 어디로 갔나 (2026-09-17, `decisions.md` 결정 12-2 의 카드 D) ──
 *
 * 2026-09-09 의 결정 8 은 실제 묵주 사진 넉 장을 근거로 고리를 **아래 메달로 모이는
 * 물방울(하트) 모양**으로 그리게 했다. 그 모양을 만들던 장치가 이 파일에 있었다 —
 * 타원의 가로 폭에 매끄럼 계단(smoothstep)으로 좁힘을 곱하던 `pointAt`, 곡선의 길이를
 * 4000 마디로 재던 `CUMULATIVE` 와 `PERIMETER`, 단 경계의 줄만 1.6 배로 늘리던
 * `linkWeights`, 그 길이를 잘라 알 쉰다섯의 자리를 얻던 `loopSpots` 가 그것이다.
 *
 * **그 장치들은 이 판에서 전부 사라졌다.** 2026-09-17 에 시안 정본이
 * 「MyRosary World」(`docs/design/world/`)로 바뀌면서(결정 11), 결정 12-2 의 카드 D 가
 * 결정 8 을 명시적으로 뒤집고 **시안의 원형 고리 기하**를 채택했기 때문이다. 고리는 이제
 * 좁힘도 길이 재기도 없는 **정원(正圓)** 이고, 알은 원둘레를 쉰여섯 칸으로 고르게 나눈
 * 자리에 그대로 앉는다. 길이를 재서 자리를 얻던 일이 없어졌으므로 이 파일은 4000 마디
 * 표를 만들지 않고, 대신 각도 하나로 자리를 곧장 계산한다.
 *
 * 함께 뒤집히지 않고 **살아남은 결정 셋**도 적어 둔다. 결정 6(알 쉰아홉을 다 그린다)과
 * 결정 7(고리는 오른쪽으로 돈다)과 결정 10(진행을 채우기가 아니라 빛으로 말한다)은
 * 그대로다 — 시안의 기하가 그 셋을 모두 지키기 때문이며, 카드 D 가 그 사실을 적고 있다.
 *
 * ── 시안과 이 저장소에서 알 한 자리가 갈린다 ────────────────────────────────────
 *
 * 알의 총수(쉰아홉)와 기도하는 순서는 시안과 이 저장소가 같고, 다른 것은 **한 알의
 * 자리**뿐이다. 시안은 제1단의 주님의 기도 알을 꼬리(메달 바로 아래)에 두어 고리에 쉰넷을
 * 남기고, 이 저장소는 그 알을 고리의 첫 자리에 두어 고리에 쉰다섯을 두었다. 이 판에서는
 * **시안의 자리를 따른다** — 꼬리가 다섯 알, 고리가 쉰넷이다.
 *
 * 그래서 아래 `BEADS` 배열의 **순서와 길이(쉰아홉)와 `rosaryStateFor()` 의 판정은 한 줄도
 * 바뀌지 않았다.** 바뀐 것은 자리 번호 4번 알(제1단의 주님의 기도)이 그려지는 좌표뿐이다.
 */

/** 그림의 좌표계. 시안의 `viewBox="0 0 240 324"` 를 그대로 쓴다. */
export const VIEWBOX = { width: 240, height: 324 } as const;

/**
 * 고리 — 시안의 `cx="120" cy="118" r="96"`.
 *
 * 타원이 아니라 정원이라 반지름이 하나다. 옛 판의 `rx`·`ry` 는 물방울을 만들려고 가로와
 * 세로를 따로 두었던 것이고, 좁힘이 사라지면서 함께 없어졌다.
 */
export const LOOP = { cx: 120, cy: 118, r: 96 } as const;

/**
 * 고리를 몇 칸으로 나누는가 — **쉰여섯**.
 *
 * 알은 쉰넷이 놓이고 두 칸이 빈다. 그 빈 두 칸이 맨 아래에 생기는 틈이며, 꼬리와 중심
 * 메달이 그 틈에 붙는다. 시안의 `(k + 1) * 2 * Math.PI / 56` 이 이 수다.
 *
 * 손가락이 고리의 어느 알 위에 있는지를 읽을 때도 같은 수를 쓴다(`loopBeadAtAngle`).
 * 그리는 쪽과 읽는 쪽이 같은 수를 보게 한 칸에 둔 것이다.
 */
export const LOOP_SLOTS = 56;

/** 고리에 실제로 놓이는 알의 수 — 쉰넷. 쉰여섯 칸에서 빈 두 칸을 뺀 값이다. */
export const LOOP_RING_BEADS = 54;

/** 중심 메달 — 고리와 꼬리가 만나는 패. 시안의 `cx="120" cy="219" rx="6.5" ry="8.5"`. */
export const MEDAL = { x: 120, y: 219, rx: 6.5, ry: 8.5 } as const;

/**
 * 십자가가 차지하는 자리 (그리는 일은 `Rosary.tsx` 가 한다).
 *
 * 시안의 십자가 경로 `M117.6 296h4.8v8h8.4v4.8h-8.4v11.2h-4.8v-11.2h-8.4v-4.8h8.4z` 는
 * 세로 296 에서 시작해 320 에서 끝난다. 그 두 값을 여기 적어 두고, 그리는 층이 자기
 * 십자가를 그 자리에 맞춘다.
 */
export const CROSS = { x: 120, top: 296, bottom: 320 } as const;

/** 꼬리를 잇는 줄. 시안의 `<line x1="120" y1="212" x2="120" y2="296">`. */
export const TAIL_LINE = { x: 120, top: 212, bottom: 296 } as const;

/**
 * 꼬리에 달린 알 다섯의 세로 자리. 위에서 아래로 적었고, 값은 시안의 `tailPos` 그대로다.
 *
 * 위에서부터 제1단의 주님의 기도(메달 바로 아래) · 시작 기도의 성모송 셋 · 시작 기도의
 * 주님의 기도(십자가 바로 위)다. **바치는 순서는 아래에서 위로** 올라간다 — 십자가를 쥐고
 * 시작해 메달로 올라가기 때문이며, 그 순서가 아래 `BEADS` 의 자리 번호 순서다.
 */
const TAIL_Y = { decadeOur: 236, hails: [250, 261, 272], openingOur: 286 } as const;

/** 꼬리 알의 가로 자리. 다섯이 모두 줄 위에 한 줄로 선다. */
const TAIL_X = TAIL_LINE.x;

/** 한 단이 차지하는 알 — 큰 알 하나와 작은 알 열. */
const BEADS_PER_DECADE = 11;
/**
 * 시작 기도가 차지하는 알의 수 — 넷.
 *
 * 이 값은 `rosaryStateFor` 가 단의 큰 알 자리를 세는 데 쓴다(`decadeBigIndex`). 꼬리에
 * 그려지는 알은 다섯이지만(제1단의 주님의 기도가 꼬리에 앉으므로) **세는 값은 넷 그대로**다 —
 * 다섯째 꼬리 알은 시작 기도의 알이 아니라 제1단의 첫 알이기 때문이다.
 */
const OPENING_BEADS = 4;
/** 시작 기도 뒤에 오는 알의 수 — 다섯 단 × 열한 알. */
const DECADE_BEADS = BEADS_PER_DECADE * 5;
/** 꼬리에 **그려지는** 알의 수 — 다섯. 자리 번호 0~4 가 여기 앉는다. */
export const TAIL_BEADS = 5;

/**
 * 알의 반지름. 값은 시안의 `r: id[0] === 'L' ? 5.8 : 3.7` 과 꼬리 표에서 왔다.
 *
 * 자리와 크기는 **묵주 재질 넷이 모두 같이 쓴다** — 재질은 칠하기만 하고 배치는 이 층이
 * 정한다(`decisions.md` 결정 9). 그래서 크기도 그리는 층이 아니라 여기 있다.
 *
 * **지금 바치는 알을 부풀리지 않는다**는 점이 옛 판과 다르다. 옛 판은 지금 알만 반지름
 * 17 로 키워 눈이 갈 곳을 만들었는데, 시안은 알을 제자리에 두고 **빛만 옮긴다**(결정 12-2
 * 카드 D 의 "알은 고정되고 빛만 옮겨 간다"). 그래서 지금 알의 크기는 그 알 본래의 크기이고,
 * 그 위에 빛무리와 테가 얹힌다 — 아래 `FOCUS_OFFSET` 이 그 두 반지름을 정한다.
 */
export const BEAD_RADIUS = { small: 3.7, big: 5.8 } as const;

/**
 * 지금 알을 두르는 빛무리와 테의 반지름 — 알 반지름에 이만큼을 더한다.
 *
 * 시안의 `rGlow: rr + 6, rRing: rr + 3` 그대로다.
 */
export const FOCUS_OFFSET = { glow: 6, ring: 3 } as const;

/** 알 하나의 자리와 크기. */
export interface BeadSpot {
  readonly x: number;
  readonly y: number;
  /** 큰 알(주님의 기도)인가. */
  readonly big: boolean;
}

/** 지금 빛나는 자리의 그림값 — 알 자신·빛무리·테의 반지름. */
export interface FocusSpot {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly glow: number;
  readonly ring: number;
}

/**
 * 중심 메달에 머물 때 빛나는 자리. 시안의 `{ cx:120, cy:219, r:7.5, rGlow:13, rRing:10.5 }`.
 * 메달은 알이 아니라 패라 알 반지름 규칙(+6·+3)을 따르지 않고 시안이 값을 따로 주었다.
 */
export const MEDAL_FOCUS: FocusSpot = { x: 120, y: 219, r: 7.5, glow: 13, ring: 10.5 } as const;

/**
 * 십자가에 머물 때 빛나는 자리. 시안의 `{ cx:120, cy:308, r:9, rGlow:15, rRing:12 }` 에서
 * 알 반지름만 0 이다 — 십자가는 경로로 그리므로 그 위에 동그라미를 겹쳐 그리지 않고
 * 빛무리와 테만 두른다(시안도 `if (st.bead === 'cross') curPos.r = 0` 으로 같게 한다).
 */
export const CROSS_FOCUS: FocusSpot = { x: 120, y: 308, r: 0, glow: 15, ring: 12 } as const;

/**
 * 고리를 손가락으로 잡았다고 볼 거리 — 중심에서 반지름의 이 배수 사이일 때만이다.
 *
 * 시안의 `if (d < c.R * 0.6 || d > c.R * 1.45) return;` 그대로다. 안쪽은 가운데 누르기
 * (다음 기도로)이고 바깥쪽은 꼬리와 화면 단추의 자리다. **실기기에서 손가락으로 돌려 본
 * 뒤 조정할 값**이라 이름을 붙여 한 자리에 두었다 (`docs/plan/roadmap-world.md` §7).
 */
export const RING_GRAB = { inner: 0.6, outer: 1.45 } as const;

/**
 * 누른 자리에서 각도가 이만큼(도) 넘게 움직여야 "끌고 있다"로 본다.
 *
 * 시안의 `if (Math.abs(this.drag.acc) > 3) this.drag.moved = true;` 그대로다. 이 문턱이
 * 없으면 누르기만 해도 손가락의 미세한 흔들림이 알을 옮긴다. 위 `RING_GRAB` 과 같은
 * 이유로 실기기 회신 뒤 조정을 전제로 둔 값이다.
 */
export const DRAG_THRESHOLD_DEG = 3;

/** 좌표는 소수 둘째 자리까지만 쓴다. 시험에서 값을 견주기 좋고 그림은 달라지지 않는다. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** 고리의 k 번째 칸이 놓이는 각도(라디안). 0 이 맨 아래이고, 커지면 오른쪽으로 돈다. */
function slotAngle(slot: number): number {
  return (slot * 2 * Math.PI) / LOOP_SLOTS;
}

/**
 * 고리 위의 한 점. 각도 0 이 맨 아래(메달 쪽)이고, 각도가 커지면 **오른쪽으로** 돈다.
 *
 * **실제 묵주가 도는 방향이 이쪽이다** — 한국 천주교의 표준 「묵주기도 방법」 도해는
 * "묵주기도는 십자가를 쥐고 오른쪽 방향으로 진행됩니다"라고 적고, 제1단을 고리의 오른쪽에
 * 제5단을 왼쪽에 그린다 (`decisions.md` 결정 7). 시안의 고리도 같은 방향으로 돌아,
 * 방향에 관해서는 시안과 이 저장소가 이미 같은 답이었다.
 */
function pointAt(angle: number): { x: number; y: number } {
  return {
    x: round(LOOP.cx + LOOP.r * Math.sin(angle)),
    y: round(LOOP.cy + LOOP.r * Math.cos(angle)),
  };
}

/**
 * 고리 위에 알 쉰넷을 놓는다. k 번째 알은 k+1 번째 칸에 앉는다 — 0 번 칸은 맨 아래의
 * 빈 자리이므로 첫 알이 그 옆 칸에서 시작한다(시안의 `(k + 1) * 2π / 56`).
 */
function loopSpots(): { x: number; y: number }[] {
  const spots: { x: number; y: number }[] = [];
  for (let k = 0; k < LOOP_RING_BEADS; k++) spots.push(pointAt(slotAngle(k + 1)));
  return spots;
}

/**
 * 고리 줄을 그리는 SVG 경로 — 맨 아래에 틈 두 칸을 남긴 열린 호(弧)다.
 *
 * **알을 놓는 데 쓴 각도 그 자체**로 마디를 찍는다. 줄을 다른 식(예: 원 도형)으로 그리면
 * 알이 줄에서 떠 보일 수 있으므로, 두 층이 같은 식을 쓰게 묶어 둔 것이다.
 *
 * 시안은 원 하나를 그리고 점선(`stroke-dasharray`)으로 틈을 냈는데 여기서는 호를 직접
 * 그린다. 이유가 둘이다. 첫째, 은·금 묵주는 줄이 사슬이라 **점선을 이미 쓰고 있어**
 * 틈까지 점선으로 내면 두 쓰임이 부딪힌다. 둘째, 원 도형에 점선을 걸었을 때 어디서부터
 * 끊기는지는 그리는 쪽(웹·iOS·안드로이드)의 구현에 기대게 되는데, 호를 직접 그리면 세
 * 곳에서 같은 모양이 나온다.
 *
 * 틈의 **길이**는 시안 그대로 두 칸이고, 틈의 **한가운데**만 시안과 반 칸 다르다. 시안의
 * `dashoffset` 은 틈을 맨 아래 칸(0번)에 맞추는데, 알이 1번 칸부터 54번 칸까지 앉으므로
 * 그렇게 하면 첫 알 쪽에 줄이 한 칸 짧고 마지막 알 쪽에 한 칸 길어 좌우가 어긋난다.
 * 여기서는 틈의 한가운데를 첫 알과 마지막 알의 한가운데(55.5번 칸)에 맞춰, 양쪽에 반
 * 칸씩 고르게 남겼다.
 */
export const LOOP_PATH: string = (() => {
  const STEPS = 220;
  const from = slotAngle(0.5);
  const to = slotAngle(LOOP_RING_BEADS + 0.5);
  const parts: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const point = pointAt(from + ((to - from) * i) / STEPS);
    parts.push(`${i === 0 ? 'M' : 'L'}${point.x} ${point.y}`);
  }
  return parts.join(' ');
})();

/**
 * 알 쉰아홉 — **기도하는 순서 그대로** 늘어놓은 것이다.
 *
 * 0 번이 꼬리 맨 아래의 큰 알(시작 기도의 주님의 기도)이고, 1~3 번이 그 위의 작은 알 셋,
 * 4 번이 메달 바로 아래의 큰 알(제1단의 주님의 기도), 5 번부터가 고리다. 이 순서가 곧
 * "몇 알이나 바쳤나"의 순서이므로, 자리 번호 하나로 이미 바친 알과 아직 안 바친 알이 갈린다.
 */
export const BEADS: readonly BeadSpot[] = [
  { x: TAIL_X, y: TAIL_Y.openingOur, big: true },
  ...[...TAIL_Y.hails]
    .reverse() // 십자가에서 멀어지는 순서 = 바치는 순서. 메달에 가장 가까운 알이 셋째다.
    .map((y) => ({ x: TAIL_X, y, big: false })),
  { x: TAIL_X, y: TAIL_Y.decadeOur, big: true },
  // 고리의 큰 알은 각 단의 열한 알 중 첫 알이다. 제1단의 첫 알은 꼬리로 갔으므로, 고리에서
  // 큰 알이 되는 것은 열한 알마다 돌아오는 열째 자리(제2단~제5단의 주님의 기도)다.
  ...loopSpots().map((spot, i) => ({ ...spot, big: i % BEADS_PER_DECADE === 10 })),
];

/** 알의 총수 — 쉰아홉. 실제 묵주와 같다. */
export const BEAD_COUNT = OPENING_BEADS + DECADE_BEADS;

/** 고리의 k 번째 알이 `BEADS` 의 몇 번 자리인가. 꼬리 다섯을 지난 다음부터가 고리다. */
export function loopBeadIndex(k: number): number {
  return TAIL_BEADS + k;
}

/**
 * 손가락이 고리 중심에서 (dx, dy) 만큼 떨어져 있을 때의 각도(도).
 *
 * 맨 아래가 0 이고 오른쪽으로 돌수록 커진다 — 알을 놓는 각도와 같은 기준이다.
 * 시안의 `Math.atan2(dx, dy)` 와 같으며, 화면 좌표는 아래가 양수이므로 dy 를 앞이 아니라
 * 뒤에 넣는 것이 그대로 "맨 아래에서 시작"이 된다.
 */
export function ringAngleDeg(dx: number, dy: number): number {
  const degrees = (Math.atan2(dx, dy) * 180) / Math.PI;
  return degrees < 0 ? degrees + 360 : degrees;
}

/**
 * 그 각도에 놓인 고리 알은 몇 번째인가 (0~53).
 *
 * 시안의 `Math.max(0, Math.min(53, Math.round(deg * 56 / 360) - 1))` 그대로다. 알이 없는
 * 맨 아래 두 칸을 가리키면 양 끝 알로 잘린다 — 틈을 지나 손가락이 넘어가도 알이 사라지지
 * 않고 첫 알이나 마지막 알에 붙어 있게 하려는 것이다.
 */
export function loopBeadAtAngle(degrees: number): number {
  const slot = Math.round((degrees * LOOP_SLOTS) / 360) - 1;
  return Math.max(0, Math.min(LOOP_RING_BEADS - 1, slot));
}

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
  return OPENING_BEADS + (decade - 1) * BEADS_PER_DECADE;
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
      return { done: OPENING_BEADS, current: -1, focus: 'medal', label: null };
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
