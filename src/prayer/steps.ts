/**
 * 하루의 기도 큐 — 77단계에 실제 문구를 채워 넣은 것.
 *
 * `src/domain/sequence.ts` 가 "몇 번째에 무슨 기도가 오는가"를 갖고 있고
 * `spec/prayers.ko.json` 이 그 기도의 문구를 갖고 있다. 둘을 합쳐 화면이 그대로 읽어
 * 쓸 수 있는 모양으로 만드는 것이 이 파일의 일이다. **M0 가 만들어 두고 아무도 부르지
 * 않던 `sequence.ts` 를 처음으로 부르는 자리가 여기다.**
 *
 * 신비 선포만 문구가 고정이 아니다. `spec/prayers.ko.json` 의 `decl.a` 는
 * `"{mystery}을 묵상합시다."` 라는 틀이고, `{mystery}` 자리에 그날 신비의 단 제목이
 * 들어간다 — 제3단이면 그 신비의 세 번째 제목이다.
 */
import { MYSTERY_SETS } from '../domain/mysteries';
import { PRAYERS, STEPS } from '../domain/sequence';
import type { MysteryKey, PrayerKey, PrayerStep } from '../domain/types';

/** 화면이 한 단계를 그리는 데 필요한 것 전부. */
export interface RunStep extends PrayerStep {
  /** 화면 오른쪽 위의 구간 이름. 예: `제3단 · 성모송`. */
  head: string;
  /** 앞 절 — 교대 낭송에서 앱이 읽는 부분. */
  a: string;
  /** 뒷 절 — 사용자가 받는 부분. 빈 문자열이면 나눠 받지 않는 기도다. */
  b: string;
}

/**
 * 구간 이름을 만든다.
 *
 * 형식은 v5 시안의 `head` 를 따랐다 — `시작 기도 · 성호경` · `제3단 · 성모송` 처럼
 * 구간과 기도문 이름을 가운뎃점으로 잇는다. 기도문 이름은 v5 의 줄임말(`묵상` ·
 * `구원송`)이 아니라 `spec/prayers.ko.json` 의 이름(`신비 선포` · `구원을 비는 기도`)을
 * 쓴다. 화면의 형식은 시안이, 기도문의 이름은 도메인 데이터가 정본이기 때문이다.
 */
function headFor(step: PrayerStep, prayerName: string): string {
  const section = step.section === 'opening' ? '시작 기도' : `제${step.decade}단`;
  return `${section} · ${prayerName}`;
}

/** 신비 선포 문구를 그날 신비의 그 단 제목으로 채운다. */
export function declarationText(mystery: MysteryKey, decade: number): string {
  const titles = MYSTERY_SETS[mystery].decades;
  const title = titles[decade - 1];
  if (!title) throw new RangeError(`단은 1~${titles.length} 여야 한다: ${decade}`);
  return PRAYERS.decl.a.replace('{mystery}', title);
}

/** 한 단계에 문구를 입힌다. */
function fill(step: PrayerStep, mystery: MysteryKey): RunStep {
  const prayer = PRAYERS[step.prayer as PrayerKey];
  const isDeclaration = step.prayer === 'decl';
  return {
    ...step,
    head: headFor(step, prayer.name),
    a: isDeclaration ? declarationText(mystery, step.decade ?? 1) : prayer.a,
    b: prayer.b,
  };
}

/**
 * 하루 77단계 전부. 개인 기도의 하루다 (`spec/journey-rules.md` §2).
 *
 * @param mystery 그날의 신비. `mysteryForDay()` 가 정한다.
 */
export function buildDayQueue(mystery: MysteryKey): RunStep[] {
  return STEPS.map((step) => fill(step, mystery));
}

/** 큐 안의 성모송 횟수. 하루 완주 화면의 통계에 쓴다. */
export function hailCount(queue: readonly RunStep[]): number {
  return queue.filter((s) => s.prayer === 'hail').length;
}

/**
 * 하루에 바치는 성모송의 수 — 개인 기도의 하루(77단계)에 든 성모송이다.
 *
 * 시작 기도의 셋과 다섯 단의 쉰을 더해 쉰셋이다. v5 시안의 하루 완주 화면은 50 이라고
 * 적었는데 그것은 시작 기도의 셋을 세지 않은 값이고, `decisions.md` Q-19 가 **실제로
 * 센 값을 보인다**로 판정했다. 여정 상세의 누적 성모송도 같은 값을 쓴다.
 */
export const HAILS_PER_DAY = hailCount(buildDayQueue('sorrowful'));
