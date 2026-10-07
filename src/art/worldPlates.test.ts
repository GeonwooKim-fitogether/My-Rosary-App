/**
 * 성화 표의 시험 — 표가 가리키는 그림이 실제로 있는가.
 *
 * 이 시험이 잡으려는 결함은 조용하다. 표에 적힌 파일 이름이 한 글자만 틀려도 코드는
 * 그대로 컴파일되고, 그 그림이 뽑히는 지역·그 화면에서만 빈 자리가 된다. 한국 지역만
 * 열어 보는 사람은 유럽 지역의 빠진 그림을 영원히 보지 못한다. 그래서 파일이 실제로
 * 디스크에 있는지를 이름 하나하나 확인한다.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { MARKED_PLATES, REGION_PLATES, WORLD_PLATE_IDS, WORLD_PLATES } from './worldPlates';
import { REGION_ORDER } from '../theme/worldTokens';

const ART_DIR = resolve(__dirname, '../../assets/art/world');

describe('표와 파일이 맞는다', () => {
  it('표에 성화 열여섯 장이 있다', () => {
    expect(Object.keys(WORLD_PLATES)).toHaveLength(16);
    expect(WORLD_PLATE_IDS).toHaveLength(16);
  });

  it.each(Object.values(WORLD_PLATES))('$id — 그림 파일이 실제로 있다', (plate) => {
    expect(existsSync(resolve(ART_DIR, plate.file))).toBe(true);
  });

  it('번호와 표의 열쇠가 서로 어긋나지 않는다', () => {
    for (const id of WORLD_PLATE_IDS) expect(WORLD_PLATES[id]?.id).toBe(id);
    expect([...WORLD_PLATE_IDS].sort()).toEqual(Object.keys(WORLD_PLATES).sort());
  });

  it('장마다 초점과 두 언어의 이름과 밝기가 있다', () => {
    for (const plate of Object.values(WORLD_PLATES)) {
      expect(plate.focal.x).toMatch(/^\d+%$/);
      expect(plate.focal.y).toMatch(/^\d+%$/);
      expect(plate.title.ko.length).toBeGreaterThan(0);
      expect(plate.title.en.length).toBeGreaterThan(0);
      expect(['light', 'mid', 'dark']).toContain(plate.tone);
    }
  });
});

describe('지역이 가리키는 그림이 표에 있다', () => {
  it.each(REGION_ORDER)('%s 가 쓰는 그림이 모두 표에 있다', (region) => {
    const ids = REGION_PLATES[region];
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) expect(WORLD_PLATES[id]).toBeDefined();
  });

  it('한 지역 안에서 같은 그림이 두 번 들어가지 않는다 — 들어가면 그 그림만 자주 뽑힌다', () => {
    for (const region of REGION_ORDER) {
      const ids = REGION_PLATES[region];
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('어느 지역에서도 뽑히지 않는 그림이 없다 — 번들에 실려 놓고 안 쓰는 그림을 막는다', () => {
    const used = new Set(REGION_ORDER.flatMap((region) => [...REGION_PLATES[region]]));
    expect([...used].sort()).toEqual([...WORLD_PLATE_IDS].sort());
  });
});

/**
 * 서명·워터마크가 있는 그림.
 *
 * 2026-09-18 에 열일곱 장의 **네 귀퉁이와 그림 전체**를 모두 눈으로 확인해 여섯을 찾았다.
 * 넷(`02`·`04`·`11`·`13`)은 오른쪽 아래에 있고 둘(`01`·`12`)은 왼쪽 아래에 있다. 다섯은
 * 스튜디오 두 곳의 로고이고 하나(`13`)는 그림 안에 붓으로 그려진 서명이다. 표에서 빠져
 * 있는 한 장(`09-color-jesus.jpg`)은 Adobe Stock 워터마크가 화면 전체에 반복돼 시안이
 * 이미 뺐다.
 *
 * 이 수가 넷에서 다섯으로, 다시 여섯으로 늘어난 것은 그림이 바뀌었기 때문이 아니라
 * **훑는 방법이 바뀌었기 때문**이다. 처음 두 번은 오른쪽 아래만 보았고(Q-50 · Q-71),
 * 그래서 왼쪽 아래에 있던 둘을 놓쳤다. 훑기의 절차와 장마다의 판정은
 * `docs/plan/art-watermark-audit.md` 에 있다.
 *
 * 이 시험은 그 여섯을 붙들어 둔다. 정식 자산으로 교체할 때(D-1) 무엇을 교체해야 하는지가
 * 이 목록이고, 목록이 줄거나 늘면 시험이 먼저 알려 준다.
 */
describe('작가 서명·워터마크가 있는 그림을 놓치지 않는다 (D-1 · Q-50 · Q-71)', () => {
  it('여섯이고, 그 여섯이 이것들이다', () => {
    expect([...MARKED_PLATES].sort()).toEqual(['01', '02', '04', '11', '12', '13']);
  });

  it('오른쪽 아래 넷과 왼쪽 아래 둘로 갈린다 — 한 귀퉁이만 보는 훑기를 막는 기록이다', () => {
    const rightBottom = MARKED_PLATES.filter((id) => WORLD_PLATES[id]?.mark?.includes('오른쪽 아래'));
    const leftBottom = MARKED_PLATES.filter((id) => WORLD_PLATES[id]?.mark?.includes('왼쪽 아래'));
    expect([...rightBottom].sort()).toEqual(['02', '04', '11', '13']);
    expect([...leftBottom].sort()).toEqual(['01', '12']);
  });

  it('표시된 그림마다 무엇이 보이는지 적혀 있다', () => {
    for (const id of MARKED_PLATES) {
      expect(WORLD_PLATES[id]?.mark?.length ?? 0).toBeGreaterThan(10);
    }
  });
});
