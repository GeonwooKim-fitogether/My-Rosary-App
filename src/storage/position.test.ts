/**
 * 자리 저장 시험 — 기기 없이 돈다. 저장소를 밖에서 받는 구조라서 가능한 일이다.
 */
import {
  createPositionStore,
  parsePosition,
  POSITION_KEY,
  type KeyValueStore,
  type PrayerPosition,
} from './position';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
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

const SAMPLE: PrayerPosition = {
  journeyId: 'j-1',
  dayIndex: 23,
  stepIndex: 40,
  decade: 3,
  bead: 4,
  mystery: 'sorrowful',
  savedAt: '2026-09-08T10:00:00.000Z',
  resumeCount: 1,
  elapsedMs: 620000,
  visited: [0, 1, 2, 40],
};

describe('자리 저장과 읽기', () => {
  it('남긴 자리를 그대로 다시 읽는다', async () => {
    const store = createPositionStore(memoryStore());
    await store.save(SAMPLE);
    expect(await store.load()).toEqual(SAMPLE);
  });

  it('저장된 것이 없으면 null 이다', async () => {
    const store = createPositionStore(memoryStore());
    expect(await store.load()).toBeNull();
  });

  it('여기서 끝내기 — 지우면 자리가 사라진다', async () => {
    const store = createPositionStore(memoryStore());
    await store.save(SAMPLE);
    await store.clear();
    expect(await store.load()).toBeNull();
  });

  it('정해진 열쇠 한 자리에만 쓴다', async () => {
    const memory = memoryStore();
    await createPositionStore(memory).save(SAMPLE);
    expect([...memory.data.keys()]).toEqual([POSITION_KEY]);
  });
});

describe('손상된 자리는 버린다 (PRD §8)', () => {
  it.each([
    ['빈 값', null],
    ['JSON 이 아닌 것', '{{{'],
    ['여정 없는 자리', '{"stepIndex":3,"mystery":"joyful"}'],
    ['자리 번호가 없는 것', '{"journeyId":"j","mystery":"joyful"}'],
    ['자리 번호가 음수', '{"journeyId":"j","stepIndex":-1,"mystery":"joyful"}'],
  ])('%s 은 읽지 않는다', (_label, raw) => {
    expect(parsePosition(raw)).toBeNull();
  });

  it('빠진 곁가지 값은 기본값으로 채워 살린다', () => {
    const parsed = parsePosition('{"journeyId":"j","stepIndex":5,"mystery":"joyful"}');
    expect(parsed).toMatchObject({ stepIndex: 5, resumeCount: 0, elapsedMs: 0, decade: null });
  });

  /*
   * 지나온 자리 목록은 2026-09-09 에 생긴 칸이다(`decisions.md` 결정 6). 옛 판으로 저장된
   * 자리를 읽을 때 이 칸이 없으므로, 없을 때 이어가기가 깨지지 않는 것이 중요하다.
   */
  it('지나온 자리 목록이 없던 옛 자리도 그대로 이어간다', () => {
    const parsed = parsePosition('{"journeyId":"j","stepIndex":5,"mystery":"joyful"}');
    expect(parsed?.visited).toEqual([]);
  });

  it('지나온 자리 목록에 섞여 들어온 쓰레기 값은 버린다', () => {
    const parsed = parsePosition(
      '{"journeyId":"j","stepIndex":5,"mystery":"joyful","visited":[0,"둘",-3,7,null]}',
    );
    expect(parsed?.visited).toEqual([0, 7]);
  });
});
