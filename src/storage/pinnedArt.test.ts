/**
 * 고정한 성화 저장 시험 (W1 §3-6).
 *
 * 재는 것은 셋이다. 고정한 이름이 그대로 돌아오는가, 고정을 풀면 없어지는가, 그리고
 * 저장 자리가 손상돼 있어도 앱이 멈추지 않고 "고정 없음"으로 읽는가.
 */
import type { KeyValueStore } from './position';
import { PINNED_ART_KEY, createPinnedArtStore, parsePinnedArt } from './pinnedArt';

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

describe('고정한 성화', () => {
  it('아무것도 저장돼 있지 않으면 고정이 없다', async () => {
    expect(parsePinnedArt(null)).toBeNull();
    expect(parsePinnedArt('   ')).toBeNull();
    expect(await createPinnedArtStore(memoryStore().store).load()).toBeNull();
  });

  it('고정한 성화의 파일 이름이 그대로 돌아온다', async () => {
    const { store, data } = memoryStore();
    const pinned = createPinnedArtStore(store);
    await pinned.save('02_Mary_and_Child');
    expect(data.get(PINNED_ART_KEY)).toBe('02_Mary_and_Child');
    expect(await pinned.load()).toBe('02_Mary_and_Child');
  });

  it('고정을 풀면 저장 자리에서 사라진다', async () => {
    const { store, data } = memoryStore();
    const pinned = createPinnedArtStore(store);
    await pinned.save('04_Cross');
    await pinned.save(null);
    expect(data.has(PINNED_ART_KEY)).toBe(false);
    expect(await pinned.load()).toBeNull();
  });

  it('저장 자리를 읽다 넘어져도 고정 없음으로 읽는다', async () => {
    const broken: KeyValueStore = {
      async getItem() {
        throw new Error('저장 자리가 없다');
      },
      async setItem() {},
      async removeItem() {},
    };
    expect(await createPinnedArtStore(broken).load()).toBeNull();
  });
});
