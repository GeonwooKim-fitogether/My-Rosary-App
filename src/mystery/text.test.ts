/**
 * 신비 다섯 줄을 만드는 규칙의 시험 (W2 슬라이스 B).
 *
 * 이 시험이 붙드는 것은 셋이다. 첫째, **한국어 제목이 이 저장소의 정본과 같은가** — 새 화면이
 * 시안의 다른 표기를 들여오면 같은 신비가 화면마다 다른 이름으로 불린다. 둘째, **성경 구절과
 * 해설이 실제로 붙어 오는가** — 데이터가 비어 있어도 화면은 조용히 빈 줄을 그릴 뿐이라
 * 눈으로는 알아채기 어렵다. 셋째, **해설이 없는 언어에서 영어로 떨어지는가** — 지어내지 않는
 * 규칙이 실제로 그렇게 도는지 확인한다.
 */
import { MYSTERY_SETS } from '../domain/mysteries';
import world from '../../spec/mysteries.world.json';
import { MYSTERY_SET_ORDER, mysteryRows, shortSetName, todayLabelKo } from './text';

describe('신비 다섯 줄', () => {
  it('네 벌이 시안과 같은 차례로 선다', () => {
    expect(MYSTERY_SET_ORDER).toEqual(['joyful', 'luminous', 'sorrowful', 'glorious']);
  });

  it('벌마다 다섯 줄이고 번호는 1 부터 센다', () => {
    for (const set of MYSTERY_SET_ORDER) {
      const rows = mysteryRows(set, 'ko');
      expect(rows).toHaveLength(5);
      expect(rows.map((row) => row.n)).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it('한국어 제목은 이 저장소의 정본(spec/mysteries.json)과 글자까지 같다', () => {
    for (const set of MYSTERY_SET_ORDER) {
      expect(mysteryRows(set, 'ko').map((row) => row.title)).toEqual(MYSTERY_SETS[set].decades);
    }
  });

  it('영어 제목은 시안의 이름을 쓴다', () => {
    expect(mysteryRows('joyful', 'en')[0]!.title).toBe('The Annunciation');
  });

  it('성경 구절과 해설이 빈 줄 없이 다 붙는다', () => {
    for (const set of MYSTERY_SET_ORDER) {
      for (const row of mysteryRows(set, 'ko')) {
        expect(row.ref).not.toBe('');
        expect(row.note).not.toBe('');
      }
    }
  });

  it('해설이 없는 언어는 지어내지 않고 영어를 그대로 쓴다', () => {
    // 지금 해설이 들어와 있는 언어는 한국어와 영어 둘뿐이다.
    expect(Object.keys(world.meditations)).toEqual(['ko', 'en']);
    const italian = mysteryRows('sorrowful', 'it');
    const english = mysteryRows('sorrowful', 'en');
    expect(italian.map((row) => row.note)).toEqual(english.map((row) => row.note));
  });

  it('탭에 적히는 짧은 이름은 첫 낱말만 남기고, 한국어는 관형격 조사까지 뗀다', () => {
    expect(shortSetName('환희의 신비')).toBe('환희');
    expect(shortSetName('Joyful Mysteries')).toBe('Joyful');
  });
});

describe('오늘 날짜 한 줄', () => {
  it('달·날·요일을 긴 이름으로 적는다', () => {
    expect(todayLabelKo(new Date('2026-09-05T09:00:00'))).toBe('9월 5일 토요일');
  });
});
