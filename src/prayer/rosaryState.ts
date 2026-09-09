/**
 * 묵주 그림의 알 배치 — 그림을 그리지 않고 "어느 알이 켜지는가"만 정하는 층.
 *
 * 그리는 일(`Rosary.tsx`)과 갈라 둔 이유는 이 판정이 화면 없이 시험할 수 있는 규칙이기
 * 때문이다. 알이 하나씩 밀려 켜지는 실수는 눈으로는 잘 안 보이고 시험으로는 바로 잡힌다.
 */

/** 한 단을 이루는 알 열 개의 자리. v5 의 `BEADS` 그대로다. */
export const BEAD_POSITIONS: readonly (readonly [number, number])[] = [
  [42, 128],
  [56, 93],
  [93, 74],
  [133, 65],
  [174, 61],
  [216, 61],
  [257, 65],
  [297, 74],
  [334, 93],
  [348, 128],
];

export interface RosaryPlacement {
  /** 이미 바친 알의 수 (0~10). */
  done: number;
  /** 지금 바치는 알 (0~9). 큰 알에 머무는 단계면 -1. */
  current: number;
}

/**
 * 지금 단계가 묵주 그림의 어디에 해당하는가.
 *
 * 시작 기도의 성모송 셋은 알을 켜지 않는다. 그 셋은 고리가 아니라 늘어진 줄에 달린
 * 알이고, 이 그림은 고리의 열 알만 그리기 때문이다 (v5 도 같다).
 */
export function rosaryStateFor(step: {
  section: string;
  prayer: string;
  bead: number | null;
  of?: number;
}): RosaryPlacement {
  const isDecadeBead = step.section === 'decade' && step.bead !== null && step.of === 10;
  if (isDecadeBead) return { done: step.bead! - 1, current: step.bead! - 1 };
  const afterBeads =
    step.section === 'decade' && (step.prayer === 'glory' || step.prayer === 'save');
  return { done: afterBeads ? BEAD_POSITIONS.length : 0, current: -1 };
}
