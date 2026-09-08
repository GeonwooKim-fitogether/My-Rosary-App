/**
 * 성화 표와 뽑기 규칙을 확인한다.
 *
 * 표 자체(열여섯 장과 좌표)는 v5 시안에서 기계로 추출해 옮긴 값이라, 여기서는
 * "옮기다가 빠지거나 어긋나지 않았는가"와 "뽑기 규칙 셋이 실제로 지켜지는가"를 본다.
 */
import {
  ART_PLATES,
  JOURNEY_SLOTS,
  SLOT_GEOMETRY,
  createArtSession,
  fitsSlot,
  type ArtSlot,
} from './index';

const ALL_SLOTS: ArtSlot[] = ['login', 'thumb', 'prayer', 'finish'];

describe('성화 표', () => {
  it('열여섯 장이다', () => {
    expect(ART_PLATES).toHaveLength(16);
  });

  it('파일 이름이 겹치지 않는다', () => {
    const names = ART_PLATES.map((p) => p.file);
    expect(new Set(names).size).toBe(names.length);
  });

  it('모든 그림이 네 슬롯의 초점 좌표를 빠짐없이 갖는다', () => {
    for (const plate of ART_PLATES) {
      for (const slot of ALL_SLOTS) {
        expect(plate.focus[slot]).toBeDefined();
        expect(plate.focus[slot].x).toMatch(/^\d+%$/);
        expect(plate.focus[slot].y).toMatch(/^\d+%$/);
      }
    }
  });

  it('그림마다 번들에 들어갈 실제 파일이 붙어 있다', () => {
    for (const plate of ART_PLATES) {
      expect(plate.source).toBeDefined();
    }
  });

  it('기도 배경에서 빠지는 셋이 v5 가 정한 그대로다', () => {
    const excluded = ART_PLATES.filter((p) => !fitsSlot(p, 'prayer')).map((p) => p.file);
    expect(excluded.sort()).toEqual([
      '06_Side_Jesus',
      '11_Mary_Rosary_White_Gold',
      '12_Mary_Child_Neutral',
    ]);
  });

  it('빠지는 슬롯은 기도 배경뿐이다 — 나머지 세 슬롯은 열여섯 장 모두 쓸 수 있다', () => {
    for (const slot of ['login', 'thumb', 'finish'] as ArtSlot[]) {
      expect(ART_PLATES.filter((p) => fitsSlot(p, slot))).toHaveLength(16);
    }
    expect(ART_PLATES.filter((p) => fitsSlot(p, 'prayer'))).toHaveLength(13);
  });

  it('네 슬롯의 기하가 v5 가 렌더해 확인한 값 그대로다', () => {
    expect(SLOT_GEOMETRY.login).toEqual({ width: 390, height: 340 });
    expect(SLOT_GEOMETRY.thumb).toEqual({ width: 96, height: 124 });
    expect(SLOT_GEOMETRY.prayer).toEqual({ width: 390, height: 148 });
    expect(SLOT_GEOMETRY.finish).toEqual({ width: 390, height: 248 });
  });
});

describe('뽑기 규칙', () => {
  it('여정용으로 뽑힌 그림은 세 슬롯 어디에서도 걸리지 않는다', () => {
    // 씨앗을 바꿔 가며 여러 번 뽑아도 한 번도 어겨지지 않아야 한다.
    for (let seed = 0; seed < 40; seed++) {
      const session = createArtSession({ seed });
      const plate = session.forJourney(`journey-${seed}`);
      expect(plate).not.toBeNull();
      for (const slot of JOURNEY_SLOTS) {
        expect(fitsSlot(plate!, slot)).toBe(true);
      }
    }
  });

  it('같은 세션에서 같은 여정을 두 번 물으면 같은 그림이 돌아온다', () => {
    const session = createArtSession({ seed: 7 });
    const first = session.forJourney('journey-a');
    const second = session.forJourney('journey-a');
    expect(second).toBe(first);
  });

  it('연달아 뽑으면 서로 다른 그림이 나온다 (비복원 추출)', () => {
    const session = createArtSession({ seed: 7 });
    const drawn = [
      session.forJourney('journey-a'),
      session.forJourney('journey-b'),
      session.forJourney('journey-c'),
    ];
    expect(new Set(drawn).size).toBe(3);
  });

  it('같은 씨앗은 언제나 같은 순서를 낸다 (재현 가능)', () => {
    const a = createArtSession({ seed: 42 }).order().map((p) => p.file);
    const b = createArtSession({ seed: 42 }).order().map((p) => p.file);
    expect(a).toEqual(b);
  });

  it('씨앗이 다르면 순서가 달라진다', () => {
    const a = createArtSession({ seed: 1 }).order().map((p) => p.file);
    const b = createArtSession({ seed: 2 }).order().map((p) => p.file);
    expect(a).not.toEqual(b);
  });

  it('진단용 손잡이로 앞자리를 고정할 수 있다', () => {
    const session = createArtSession({ seed: 3, forced: ['01', '02', '07'] });
    expect(session.order().slice(0, 3).map((p) => p.file)).toEqual([
      '01_Mary_Single',
      '02_Mary_and_Child',
      '07_Relief_Holy_Family',
    ]);
    // 고정해도 열여섯 장이 그대로 남고 겹치지 않는다.
    expect(session.order()).toHaveLength(16);
    expect(new Set(session.order()).size).toBe(16);
  });

  it('풀이 바닥나도 터지지 않고 null 을 돌려준다', () => {
    const session = createArtSession({ seed: 5 });
    const drawn = [];
    for (let i = 0; i < 20; i++) drawn.push(session.take(['login']));
    expect(drawn.slice(0, 16).every((p) => p !== null)).toBe(true);
    expect(drawn.slice(16).every((p) => p === null)).toBe(true);
  });

  it('기도 배경은 열셋까지만 뽑히고 그 뒤로는 null 이다', () => {
    const session = createArtSession({ seed: 5 });
    const drawn = [];
    for (let i = 0; i < 15; i++) drawn.push(session.take(['prayer']));
    expect(drawn.filter((p) => p !== null)).toHaveLength(13);
    expect(drawn.slice(13).every((p) => p === null)).toBe(true);
  });

  it('바닥난 뒤 같은 키로 물어도 터지지 않는다', () => {
    const session = createArtSession({ seed: 5, plates: [] });
    expect(session.forJourney('journey-a')).toBeNull();
    expect(session.forJourney('journey-a')).toBeNull();
  });
});
