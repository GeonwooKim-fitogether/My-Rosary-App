/**
 * 즐겨찾기 성화 저장 시험 (W3 슬라이스 B · 지시서 §1-3).
 *
 * 재는 것은 다섯이다. 아무것도 없을 때 빈 목록인가, 담은 차례가 그대로 돌아오는가,
 * 하트를 두 번 누르면 목록에서 빠지는가, **저장 자리가 깨져 있어도 앱이 멈추지 않는가**,
 * 그리고 목록 안에 이름 아닌 것이 섞여 있어도 읽을 수 있는 것만 남기는가.
 *
 * 넷째와 다섯째가 이 시험의 핵심이다. 고정은 이름 하나라 깨질 모양이 적지만 즐겨찾기는
 * 목록이라 많다 — 글이 JSON 이 아닐 수도, 목록이 아닐 수도, 목록 안이 섞여 있을 수도 있다.
 */
import {
  FAVORITE_ART_KEY,
  createFavoriteArtStore,
  parseFavoriteArt,
  toggleFavorite,
} from './favoriteArt';
import type { KeyValueStore } from './position';

function memoryStore(): { store: KeyValueStore; data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    store: {
      async getItem(key) {
        return data.get(key) ?? null;
      },
      async setItem(key, value) {
        data.set(key, value);
      },
      async removeItem(key) {
        data.delete(key);
      },
    },
  };
}

describe('즐겨찾기 성화', () => {
  it('아무것도 저장돼 있지 않으면 빈 목록이다', async () => {
    expect(parseFavoriteArt(null)).toEqual([]);
    expect(await createFavoriteArtStore(memoryStore().store).load()).toEqual([]);
  });

  it('담은 차례가 그대로 돌아온다', async () => {
    const { store, data } = memoryStore();
    const favorites = createFavoriteArtStore(store);
    await favorites.save(['10-blue-mary.jpg', '04-cross.jpg']);
    expect(data.get(FAVORITE_ART_KEY)).toBe('["10-blue-mary.jpg","04-cross.jpg"]');
    expect(await favorites.load()).toEqual(['10-blue-mary.jpg', '04-cross.jpg']);
  });

  it('하트를 한 번 누르면 담기고 한 번 더 누르면 빠진다', () => {
    const once = toggleFavorite([], '13.jpg');
    expect(once).toEqual(['13.jpg']);
    expect(toggleFavorite(once, '13.jpg')).toEqual([]);
    // 목록을 제자리에서 고치지 않는다 — 리액트가 같음 비교로 바뀜을 판단하기 때문이다.
    expect(once).toEqual(['13.jpg']);
  });

  it('저장된 글이 깨져 있어도 빈 목록으로 읽는다', () => {
    expect(parseFavoriteArt('{')).toEqual([]);
    expect(parseFavoriteArt('7')).toEqual([]);
    expect(parseFavoriteArt('"01-mary-single.jpg"')).toEqual([]);
    expect(parseFavoriteArt('null')).toEqual([]);
  });

  it('목록 안에 이름 아닌 것이 섞여 있으면 읽을 수 있는 것만 남긴다', () => {
    expect(parseFavoriteArt('["04-cross.jpg", 3, null, "  ", "04-cross.jpg", "13.jpg"]')).toEqual([
      '04-cross.jpg',
      '13.jpg',
    ]);
  });

  it('저장 자리를 읽다 넘어져도 빈 목록으로 읽는다', async () => {
    const broken: KeyValueStore = {
      async getItem() {
        throw new Error('저장 자리가 없다');
      },
      async setItem() {},
      async removeItem() {},
    };
    expect(await createFavoriteArtStore(broken).load()).toEqual([]);
  });
});
