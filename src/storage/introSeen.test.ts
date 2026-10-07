/**
 * 소개를 본 적이 있는지 기억하는 자리의 시험 (W4 슬라이스 C).
 *
 * 가장 중요한 판정은 **값이 없을 때 "아직 보지 않았다" 로 읽히는가**이다. 그 한 줄이
 * 뒤집히면 처음 앱을 여는 사람에게 소개가 한 번도 뜨지 않고, 그것은 오류 없이 조용히
 * 일어난다.
 */
import { createIntroSeenStore, INTRO_SEEN_KEY, parseIntroSeen } from './introSeen';
import type { KeyValueStore } from './position';

function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    async getItem(key) {
      return data.get(key) ?? null;
    },
    async setItem(key, value) {
      data.set(key, value);
    },
    async removeItem(key) {
      data.delete(key);
    },
  };
}

describe('읽어 들이기', () => {
  it('아무것도 적혀 있지 않으면 아직 보지 않은 것이다 — 처음 여는 기기가 이 상태다', () => {
    expect(parseIntroSeen(null)).toBe(false);
  });

  it('적혀 있던 값이 `1` 일 때만 본 것으로 친다', () => {
    expect(parseIntroSeen('1')).toBe(true);
    expect(parseIntroSeen('0')).toBe(false);
    expect(parseIntroSeen('true')).toBe(false);
    expect(parseIntroSeen('')).toBe(false);
  });
});

describe('적고 다시 읽기', () => {
  it('본 것으로 적으면 다음에 열 때 본 것으로 읽힌다', async () => {
    const store = createIntroSeenStore(memoryStore());
    expect(await store.load()).toBe(false);
    await store.markSeen();
    expect(await store.load()).toBe(true);
  });

  it('앱의 설정과 다른 열쇠에 적는다 — 남의 기록 파일을 들여와도 이 기기의 소개는 그대로다', () => {
    expect(INTRO_SEEN_KEY).toBe('myrosary.introSeen.v1');
    expect(INTRO_SEEN_KEY).not.toBe('myrosary.settings.v1');
  });

  it('읽기가 터져도 아직 보지 않은 것으로 떨어진다 — 못 본 사람이 영영 못 보는 쪽을 피한다', async () => {
    const store = createIntroSeenStore({
      async getItem() {
        throw new Error('기기 저장소가 막혔다');
      },
      async setItem() {},
      async removeItem() {},
    });
    expect(await store.load()).toBe(false);
  });

  it('적는 데 실패해도 앱은 멈추지 않는다', async () => {
    const store = createIntroSeenStore({
      async getItem() {
        return null;
      },
      async setItem() {
        throw new Error('기기 저장소가 막혔다');
      },
      async removeItem() {},
    });
    await expect(store.markSeen()).resolves.toBeUndefined();
  });
});
