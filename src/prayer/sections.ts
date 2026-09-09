/**
 * 구간 — 하루 81단계를 사람이 옮겨 다닐 수 있는 일곱 덩어리로 본다.
 *
 * `decisions.md` 결정 6 이 "어떤 상황에서든 단을 마음대로 넘길 수 있어야 한다"를 정했고,
 * 그 "단"이 실제로 무엇인지를 여기서 정한다. 하루는 이렇게 나뉜다.
 *
 * | 구간 번호 | 이름 | 단계 |
 * |---|---|---|
 * | 0 | 시작 기도 | 0~8 (성호경 · 십자가에 입맞춤 · 사도신경 · 주님의 기도 · 성모송 셋 · 영광송 · 구원을 비는 기도) |
 * | 1~5 | 제1단~제5단 | 각 14 단계 (신비 선포 · 주님의 기도 · 성모송 열 · 영광송 · 구원을 비는 기도) |
 * | 6 | 마침 기도 | 79~80 (성모찬송 · 성호경) |
 *
 * 마침 기도가 구간 하나로 들어온 것은 2026-09-09 의 결정 7 때문이다. 그래서 단 넘기기
 * 줄의 다음 단추가 제5단에서 마침 기도로도 뛴다. 마침 기도도 사람이 건너뛰거나 되돌아올
 * 수 있어야 하는 덩어리이므로, 다섯 단과 같은 자격으로 다룬다.
 *
 * 화면(`app/pray.tsx`)이 아니라 여기에 둔 이유는 `rosaryState.ts` 와 같다 — 이 판정은
 * 화면 없이 시험할 수 있는 규칙이고, 한 칸 밀려 뛰는 실수는 눈으로 잘 안 보인다.
 *
 * ── 지금은 화면이 이 규칙을 쓰지 않는다 (2026-09-09, `decisions.md` 결정 8) ────────
 *
 * 기도 화면의 앞뒤 단추가 **한 단씩에서 한 알씩으로** 바뀌면서, 아래 `sectionMoves` 와
 * 그것을 부르던 `usePrayerSession.goToSection` 을 화면에서 부르는 자리가 없어졌다.
 * 그래도 지우지 않았다 — 먼 단으로 뛰는 길이 다시 필요해질 수 있고(결정 큐 Q-41), 이
 * 규칙과 그 시험은 그때 그대로 쓸 수 있다. 지금 이 파일에서 화면이 실제로 쓰는 것은
 * `sectionOf` 와 `sectionLabel`(구간 이름을 짓는 `steps.ts`)뿐이다.
 */

/** 구간 하나. 0 은 시작 기도, 1~5 는 그 번호의 단, 6 은 마침 기도다. */
export type SectionNumber = number;

/** 마침 기도의 구간 번호. 다섯 단 뒤에 오므로 6 이다. */
export const CLOSING_SECTION = 6;

/** 구간을 가진 단계라면 어느 구간인가. */
export function sectionOf(step: { section: string; decade?: number | null }): SectionNumber {
  if (step.section === 'decade') return step.decade ?? 1;
  if (step.section === 'closing') return CLOSING_SECTION;
  return 0;
}

/** 화면에 적는 구간 이름. 형식은 v5 의 구간 라벨과 같다. */
export function sectionLabel(section: SectionNumber): string {
  if (section === 0) return '시작 기도';
  if (section === CLOSING_SECTION) return '마침 기도';
  return `제${section}단`;
}

/**
 * 그 구간이 시작되는 단계의 자리.
 *
 * **구간의 첫 단계로 간다** — 제3단이면 신비 선포이고, 마침 기도면 성모찬송이다. 단에서
 * 주님의 기도가 아니라 신비 선포를 고른 이유는 둘이다. 첫째, 81단계에서 실제로 그 단의
 * 첫 단계가 신비 선포다. 둘째, 단을 건너뛴 사람에게 가장 먼저 필요한 것이 "지금 무엇을
 * 묵상하는가"이고 그것을 말해 주는 단계가 신비 선포다. 뛰어든 자리에서 묵상할 것을 모른
 * 채 주님의 기도부터 시작하면, 건너뛰기가 기도를 탐색으로 만들어 버린다.
 *
 * 찾지 못하면 -1 을 돌려준다 (그런 구간이 없다는 뜻).
 */
export function sectionStart(
  queue: readonly { section: string; decade?: number | null }[],
  section: SectionNumber,
): number {
  return queue.findIndex((step) => sectionOf(step) === section);
}

/** 큐에 실제로 들어 있는 구간 번호들, 앞에서 뒤로. */
export function sectionsOf(
  queue: readonly { section: string; decade?: number | null }[],
): SectionNumber[] {
  const seen: SectionNumber[] = [];
  for (const step of queue) {
    const section = sectionOf(step);
    if (!seen.includes(section)) seen.push(section);
  }
  return seen;
}

/** 앞 구간·다음 구간으로 옮길 자리. 옮길 데가 없으면 null. */
export interface SectionMove {
  /** 옮겨 갈 구간 번호. */
  section: SectionNumber;
  /** 그 구간의 첫 단계 자리. */
  index: number;
  /** 화면에 적을 이름. */
  label: string;
}

/**
 * 지금 자리에서 앞·뒤 구간으로 옮길 곳을 알려 준다.
 *
 * 지금 구간의 **첫 단계로 되감지 않는다** — 음악 재생기의 이전 단추처럼 "먼저 이 곡의
 * 처음으로, 한 번 더 누르면 앞 곡으로" 하는 방식도 있지만, 같은 단추가 상황에 따라 다른
 * 일을 하면 기도 중에 그것을 헤아리게 된다. 앞 단추는 언제나 앞 구간, 다음 단추는 언제나
 * 다음 구간이다. 양 끝에서는 갈 데가 없으므로 null 이고, 화면은 그 단추를 흐리게 둔다.
 */
export function sectionMoves(
  queue: readonly { section: string; decade?: number | null }[],
  index: number,
): { previous: SectionMove | null; next: SectionMove | null } {
  const step = queue[index];
  if (!step) return { previous: null, next: null };
  const sections = sectionsOf(queue);
  const at = sections.indexOf(sectionOf(step));

  const moveTo = (position: number): SectionMove | null => {
    const section = sections[position];
    if (section === undefined) return null;
    const start = sectionStart(queue, section);
    if (start < 0) return null;
    return { section, index: start, label: sectionLabel(section) };
  };

  return { previous: moveTo(at - 1), next: moveTo(at + 1) };
}
