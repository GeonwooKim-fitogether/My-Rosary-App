/**
 * 지역별 성화 뽑기 시험 (W2 슬라이스 C).
 *
 * 재는 것은 둘이다. **표를 모양만 바꿔 옮겼는가**(초점이 시안의 값과 같은가, 기도 배경만
 * 시안의 식대로 아래로 내려갔는가), 그리고 **뽑기 규칙 셋이 실제로 지켜지는가**(열 때마다
 * 다르되 바로 앞의 것이 이어 나오지 않고, 고정한 것이 있으면 그것이며, 씨앗을 물리면
 * 언제나 같은 순서인가).
 *
 * 규칙 셋 중 셋째("기도 중에는 바뀌지 않는다")는 여기서 재지 않는다. 그것은 뽑기의
 * 성질이 아니라 **뽑기를 다시 여는 자리가 기도 화면 밖에만 있다**는 배선의 성질이라,
 * 재는 자리가 코드가 아니라 호출부다(`src/state/appStore.ts` 의 `reopenArt` 를 부르는 셋).
 */
import { REGION_PLATES, WORLD_PLATES } from './worldPlates';
import { createArtSession } from './session';
import { artSession, configureArtSession } from './current';
import { prayerFocalY, regionArtPlates, worldArtPlate } from './worldSession';

describe('새 시안의 그림을 뽑기의 모양으로 감싼다', () => {
  it('로그인·썸네일·완주 세 자리는 시안의 초점을 그대로 쓴다', () => {
    const plate = worldArtPlate(WORLD_PLATES['01']!);
    expect(plate.focus.login).toEqual({ x: '50%', y: '22%' });
    expect(plate.focus.thumb).toEqual({ x: '50%', y: '22%' });
    expect(plate.focus.finish).toEqual({ x: '50%', y: '22%' });
  });

  it('기도 배경만 세로 초점을 14% 내린다 (시안의 식)', () => {
    expect(prayerFocalY('22%')).toBe('36%');
    expect(worldArtPlate(WORLD_PLATES['01']!).focus.prayer).toEqual({ x: '50%', y: '36%' });
  });

  it('기도 배경의 세로 초점은 60% 를 넘지 않는다 (시안의 상한)', () => {
    expect(prayerFocalY('55%')).toBe('60%');
    expect(prayerFocalY('45%')).toBe('59%');
  });

  it('파일 이름은 새 시안의 것이다 — 고정한 이름을 다시 찾는 열쇠다', () => {
    expect(worldArtPlate(WORLD_PLATES['01']!).file).toBe('01-mary-single.jpg');
  });

  it('쓸 수 없는 자리를 지어 넣지 않는다', () => {
    for (const plate of regionArtPlates('korea')) expect(plate.excludedSlots).toEqual([]);
  });
});

describe('지역마다 쓰는 그림', () => {
  it('다섯 지역 모두 시안이 적어 둔 차례 그대로 온다', () => {
    for (const region of ['europe', 'northamerica', 'southamerica', 'asia', 'korea'] as const) {
      const files = regionArtPlates(region).map((plate) => plate.file);
      expect(files).toEqual(REGION_PLATES[region].map((id) => WORLD_PLATES[id]!.file));
    }
  });

  it('지역이 다르면 묶음도 다르다', () => {
    const korea = regionArtPlates('korea').map((p) => p.file);
    const europe = regionArtPlates('europe').map((p) => p.file);
    expect(korea).not.toEqual(europe);
  });

  it('고정한 그림이 그 지역 묶음에 없어도 목록에 들어온다', () => {
    const outsider = WORLD_PLATES['14']!.file; // 14 는 남미 묶음에만 있다
    expect(regionArtPlates('korea').map((p) => p.file)).not.toContain(outsider);
    expect(regionArtPlates('korea', [outsider]).map((p) => p.file)).toContain(outsider);
  });

  it('이미 그 지역에 있는 그림을 더해도 두 번 들어가지 않는다', () => {
    const inside = WORLD_PLATES['01']!.file; // 01 은 한국 묶음의 첫 그림이다
    const files = regionArtPlates('korea', [inside]).map((p) => p.file);
    expect(files.filter((file) => file === inside)).toHaveLength(1);
  });
});

describe('뽑기 규칙', () => {
  it('바로 앞에 보여 준 그림은 이어서 맨 앞에 서지 않는다', () => {
    const plates = regionArtPlates('korea');
    // 씨앗을 고정해 두고, 그 씨앗이 처음 집는 그림을 그대로 `avoid` 로 되돌려 준다.
    const first = createArtSession({ plates, seed: 7 }).order()[0]!;
    const again = createArtSession({ plates, seed: 7, avoid: first.file }).order()[0]!;
    expect(again.file).not.toBe(first.file);
  });

  it('고정한 그림은 `avoid` 를 이긴다 — 사람이 직접 고른 것이기 때문이다', () => {
    const plates = regionArtPlates('korea');
    const pinned = plates[2]!.file;
    const order = createArtSession({ plates, seed: 7, forced: [pinned], avoid: pinned }).order();
    expect(order[0]!.file).toBe(pinned);
  });

  it('씨앗이 같으면 순서가 언제나 같다 (Q-57)', () => {
    const plates = regionArtPlates('europe');
    const one = createArtSession({ plates, seed: 42 }).order().map((p) => p.file);
    const two = createArtSession({ plates, seed: 42 }).order().map((p) => p.file);
    expect(one).toEqual(two);
  });
});

describe('화면들이 들고 있는 껍데기', () => {
  it('지역을 갈아 끼우면 같은 이름이 새 지역의 그림을 내어 준다', () => {
    configureArtSession({ region: 'korea', seed: 1 });
    const inKorea = artSession.forJourney('j1')!;
    expect(REGION_PLATES.korea.map((id) => WORLD_PLATES[id]!.file)).toContain(inKorea.file);

    configureArtSession({ region: 'southamerica', seed: 1 });
    const inSouth = artSession.forJourney('j1')!;
    expect(REGION_PLATES.southamerica.map((id) => WORLD_PLATES[id]!.file)).toContain(inSouth.file);
  });

  it('고정한 그림이 있으면 그것이 나온다 (W1 이 저장만 해 두었던 값)', () => {
    const pinned = WORLD_PLATES['14']!.file; // 한국 묶음에 없는 그림을 일부러 고른다
    configureArtSession({ region: 'korea', pinned, seed: 1 });
    expect(artSession.forJourney('j1')!.file).toBe(pinned);
  });

  it('다시 열기 전까지 같은 여정에는 같은 그림이 따라붙는다', () => {
    configureArtSession({ region: 'korea', seed: 3 });
    const once = artSession.forJourney('j1')!;
    expect(artSession.forJourney('j1')).toBe(once);
  });

  it('맨 먼저 집히는 그림을 돌려주어, 부르는 쪽이 그 이름을 기억할 수 있다', () => {
    const first = configureArtSession({ region: 'asia', seed: 5 })!;
    expect(artSession.forJourney('j1')!.file).toBe(first.file);
  });
});
