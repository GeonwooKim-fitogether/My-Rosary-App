/**
 * 구간(단) 넘기기 시험 — `decisions.md` 결정 6 이 정한 "어떤 상황에서든 단을 넘긴다".
 *
 * 여기서 지키려는 것은 셋이다. 첫째, 어디에 서 있든 앞뒤 구간을 찾아낸다. 둘째, 옮겨
 * 가는 자리는 언제나 **그 구간의 첫 단계**(단이면 신비 선포, 마침 기도면 성모찬송)다.
 * 셋째, 양 끝에서는 갈 데가 없다고 정직하게 답한다 — 있지도 않은 구간으로 뛰지 않는다.
 *
 * 2026-09-09 의 결정 7 로 마침 기도가 구간 하나로 들어와, 구간이 여섯에서 일곱이 됐다.
 */
import { mysteryForFiftyfourDay } from '../domain/mysteries';
import {
  CLOSING_SECTION,
  sectionLabel,
  sectionMoves,
  sectionOf,
  sectionStart,
  sectionsOf,
} from './sections';
import { buildDayQueue } from './steps';

const QUEUE = buildDayQueue(mysteryForFiftyfourDay(23));

describe('구간 나누기', () => {
  it('하루는 시작 기도와 다섯 단과 마침 기도, 모두 일곱 구간이다', () => {
    expect(sectionsOf(QUEUE)).toEqual([0, 1, 2, 3, 4, 5, CLOSING_SECTION]);
  });

  it('구간 이름은 시작 기도와 제N단과 마침 기도다', () => {
    expect(sectionLabel(0)).toBe('시작 기도');
    expect(sectionLabel(3)).toBe('제3단');
    expect(sectionLabel(CLOSING_SECTION)).toBe('마침 기도');
  });

  it('구간의 첫 단계는 시작 기도의 성호경과 각 단의 신비 선포, 마침 기도의 성모찬송이다', () => {
    expect(sectionStart(QUEUE, 0)).toBe(0);
    expect(QUEUE[sectionStart(QUEUE, 0)]!.prayer).toBe('sign');
    for (const decade of [1, 2, 3, 4, 5]) {
      const start = sectionStart(QUEUE, decade);
      expect(QUEUE[start]!.prayer).toBe('decl');
      expect(QUEUE[start]!.decade).toBe(decade);
      expect(sectionOf(QUEUE[start]!)).toBe(decade);
    }
    const closing = sectionStart(QUEUE, CLOSING_SECTION);
    expect(QUEUE[closing]!.prayer).toBe('salve');
    expect(sectionOf(QUEUE[closing]!)).toBe(CLOSING_SECTION);
  });
});

describe('앞 단·다음 단으로 옮길 곳', () => {
  it('시작 기도 어디에 서 있어도 다음은 제1단이고, 앞은 갈 데가 없다', () => {
    const firstDecl = sectionStart(QUEUE, 1);
    for (let at = 0; at < 9; at++) {
      const moves = sectionMoves(QUEUE, at);
      expect(moves.previous).toBeNull();
      expect(moves.next).toEqual({ section: 1, index: firstDecl, label: '제1단' });
    }
  });

  it('제3단 어디에 서 있어도 앞은 제2단, 다음은 제4단이며 둘 다 그 단의 첫 단계다', () => {
    const third = QUEUE.map((step, i) => (step.decade === 3 ? i : -1)).filter((i) => i >= 0);
    expect(third).toHaveLength(14);
    for (const at of third) {
      const moves = sectionMoves(QUEUE, at);
      expect(moves.previous?.label).toBe('제2단');
      expect(moves.next?.label).toBe('제4단');
      expect(QUEUE[moves.previous!.index]!.prayer).toBe('decl');
      expect(QUEUE[moves.next!.index]!.prayer).toBe('decl');
    }
  });

  it('제5단의 다음은 마침 기도다', () => {
    const fifth = QUEUE.map((step, i) => (step.decade === 5 ? i : -1)).filter((i) => i >= 0);
    for (const at of fifth) {
      const moves = sectionMoves(QUEUE, at);
      expect(moves.next?.label).toBe('마침 기도');
      expect(QUEUE[moves.next!.index]!.prayer).toBe('salve');
    }
  });

  it('마침 기도에서는 다음이 없다 — 없는 구간으로 뛰거나 하루를 끝내지 않는다', () => {
    const last = QUEUE.length - 1;
    const moves = sectionMoves(QUEUE, last);
    expect(moves.next).toBeNull();
    expect(moves.previous?.label).toBe('제5단');
  });

  it('구간을 일곱 번 옮기면 시작 기도에서 마침 기도까지 한 칸씩 간다', () => {
    let at = 0;
    const visited: string[] = ['시작 기도'];
    for (;;) {
      const next = sectionMoves(QUEUE, at).next;
      if (!next) break;
      at = next.index;
      visited.push(next.label);
    }
    expect(visited).toEqual([
      '시작 기도',
      '제1단',
      '제2단',
      '제3단',
      '제4단',
      '제5단',
      '마침 기도',
    ]);
  });
});
