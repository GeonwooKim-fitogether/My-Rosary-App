/**
 * 여정 저장 시험 — 다시 열었을 때 그대로 있는가, 깨진 것은 버리는가.
 */
import {
  createJourneyStore,
  fromDateKey,
  JOURNEYS_KEY,
  parseJourney,
  parseJourneys,
  serializeJourney,
  toDateKey,
} from './journeys';
import type { KeyValueStore } from './position';
import type { Journey } from '../journey/session';

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

const sample: Journey = {
  id: 'j1',
  title: '어머니 병환 회복',
  format: 'fiftyfour',
  startDate: new Date(2026, 7, 14),
  days: ['prayed', 'missed', 'today'],
  kind: 'petition',
  recitation: 'alternate',
};

describe('날짜는 날짜로 적는다', () => {
  it('두 자리로 채워 적는다', () => {
    expect(toDateKey(new Date(2026, 8, 5))).toBe('2026-09-05');
  });

  it('적은 것을 그대로 되읽는다', () => {
    expect(fromDateKey('2026-09-05')).toEqual(new Date(2026, 8, 5));
  });

  it('날짜가 아닌 것은 되읽지 않는다', () => {
    expect(fromDateKey('2026-9-5')).toBeNull();
    expect(fromDateKey('어제')).toBeNull();
  });
});

describe('저장하고 되읽기', () => {
  it('저장한 여정이 그대로 돌아온다', async () => {
    const store = createJourneyStore(memoryStore());
    await store.save([sample]);
    const [loaded] = await store.load();
    expect(loaded).toEqual(sample);
  });

  it('아무것도 저장한 적이 없으면 빈 목록이다', async () => {
    expect(await createJourneyStore(memoryStore()).load()).toEqual([]);
  });

  it('저장 자리가 깨져 있으면 빈 목록으로 돌아간다 — 앱이 열리지 못하는 것보다 낫다', () => {
    expect(parseJourneys('{쓰레기')).toEqual([]);
    expect(parseJourneys('{"a":1}')).toEqual([]);
  });

  it('여정 하나가 깨져도 나머지는 살린다', () => {
    const good = serializeJourney(sample);
    const raw = JSON.stringify([good, { id: 'x' }, { ...good, id: 'j2' }]);
    const list = parseJourneys(raw);
    expect(list.map((j) => j.id)).toEqual(['j1', 'j2']);
  });

  it('모르는 칸 상태는 앞으로 올 날로 되돌린다', () => {
    const parsed = parseJourney({ ...serializeJourney(sample), days: ['prayed', '이상한값'] });
    expect(parsed?.days).toEqual(['prayed', 'future']);
  });

  it('형식이나 시작일이 없으면 그 여정은 버린다', () => {
    expect(parseJourney({ ...serializeJourney(sample), format: '없는형식' })).toBeNull();
    expect(parseJourney({ ...serializeJourney(sample), startDate: '' })).toBeNull();
  });

  it('저장 열쇠 하나에 목록 전부가 들어간다', async () => {
    const memory = memoryStore();
    await createJourneyStore(memory).save([sample]);
    expect([...memory.data.keys()]).toEqual([JOURNEYS_KEY]);
  });
});
