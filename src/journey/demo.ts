/**
 * 본보기 여정 — 화면을 v5 시안과 나란히 놓고 대조하기 위한 자리.
 *
 * 앱을 처음 열면 여정이 하나도 없는 것이 **정상 상태**다(06-screen-spec 화면 A: "로그인
 * 직후 = 여정 없음. 이것이 정상 상태다"). 그런데 그 빈 홈으로는 카드·리본·격자가 v5 와
 * 같은지 볼 수가 없다. 그래서 v5 가 그린 여정을 오늘 날짜에 맞춰 세워 주는 손잡이를
 * 하나 둔다 — 웹 주소에 `?demo=1` 을 붙이면 이 여정이 들어온다.
 *
 * v5 에도 같은 성격의 진단용 손잡이가 있었다(`?art=01,02` 로 성화 뽑기를 고정하는 것).
 * 이것을 실제 사용자가 만날 일은 없다. 사진을 찍는 시험과 시안 대조에만 쓴다.
 *
 * 시작일만 v5 와 다르다. v5 는 23일째를 9월 5일로 못박았지만(`decisions.md` Q-24) 이제
 * 며칠째는 달력에서 오므로, **오늘이 23일째가 되도록** 시작일을 거꾸로 잡는다. 그래야
 * 시안이 보여 주는 그 상태(스무 날 바치고 두 날 걸러 스물세 번째 날에 선 사람)가 화면에
 * 그대로 선다.
 */
import { addDays } from './format';
import { currentJourney, type Journey } from './session';

/** v5 시안이 보여 주는 그 날 — 스물세 번째 날. */
export const DEMO_DAY_INDEX = 23;

export const DEMO_JOURNEY_ID = 'demo-fiftyfour';

/** 오늘이 23일째가 되도록 세운 본보기 여정 한 벌. */
export function demoJourney(today: Date): Journey {
  return {
    ...currentJourney,
    id: DEMO_JOURNEY_ID,
    startDate: addDays(today, -(DEMO_DAY_INDEX - 1)),
    days: [...currentJourney.days],
  };
}
