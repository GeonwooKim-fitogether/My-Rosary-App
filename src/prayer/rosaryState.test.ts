/**
 * 묵주 알 배치 시험 — 77단계를 훑으며 알이 하나씩 밀리지 않는지 본다.
 */
import { mysteryForFiftyfourDay } from '../domain/mysteries';
import { rosaryStateFor } from './rosaryState';
import { buildDayQueue } from './steps';

const QUEUE = buildDayQueue(mysteryForFiftyfourDay(23));

describe('알 배치', () => {
  it('시작 기도에서는 큰 알에 머물고 고리의 알은 하나도 켜지 않는다', () => {
    for (const step of QUEUE.filter((s) => s.section === 'opening')) {
      expect(rosaryStateFor(step)).toEqual({ done: 0, current: -1 });
    }
  });

  it('신비 선포와 주님의 기도도 큰 알에 머문다', () => {
    const first = QUEUE.find((s) => s.decade === 1 && s.prayer === 'decl')!;
    const our = QUEUE.find((s) => s.decade === 1 && s.prayer === 'our')!;
    expect(rosaryStateFor(first).current).toBe(-1);
    expect(rosaryStateFor(our).current).toBe(-1);
  });

  it('성모송 열 알이 첫 알부터 열째 알까지 차례로 켜진다', () => {
    const hails = QUEUE.filter((s) => s.decade === 2 && s.prayer === 'hail');
    expect(hails).toHaveLength(10);
    hails.forEach((step, i) => {
      expect(rosaryStateFor(step)).toEqual({ done: i, current: i });
    });
  });

  it('영광송과 구원을 비는 기도에서는 열 알이 모두 채워지고 큰 알로 돌아온다', () => {
    const glory = QUEUE.find((s) => s.decade === 3 && s.prayer === 'glory')!;
    const save = QUEUE.find((s) => s.decade === 3 && s.prayer === 'save')!;
    expect(rosaryStateFor(glory)).toEqual({ done: 10, current: -1 });
    expect(rosaryStateFor(save)).toEqual({ done: 10, current: -1 });
  });

  it('어느 단계에서도 알 번호가 그림 밖으로 나가지 않는다', () => {
    for (const step of QUEUE) {
      const placement = rosaryStateFor(step);
      expect(placement.current).toBeGreaterThanOrEqual(-1);
      expect(placement.current).toBeLessThanOrEqual(9);
      expect(placement.done).toBeGreaterThanOrEqual(0);
      expect(placement.done).toBeLessThanOrEqual(10);
    }
  });
});
