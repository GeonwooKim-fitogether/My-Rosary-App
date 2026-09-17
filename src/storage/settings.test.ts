/**
 * 설정 저장 시험 — 기본값이 무엇이고, 모르는 값이 들어오면 어떻게 되는가.
 */
import {
  createSettingsStore,
  DEFAULT_SETTINGS,
  parseSettings,
  RECITATION_CHOICES,
  PACE_CHOICES,
} from './settings';
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

describe('기본값', () => {
  it('낭송은 교대, 받는 사이는 보통, 낮과 밤은 기기 설정 따름이다', () => {
    expect(DEFAULT_SETTINGS.recitation).toBe('alternate');
    expect(DEFAULT_SETTINGS.pace).toBe('normal');
    // 낮(한지)으로 고정한다 — decisions.md 결정 5. 밤은 설정에서 고른다.
    expect(DEFAULT_SETTINGS.theme).toBe('day');
  });

  it('손 없이 조작은 켜져 있다 — 08 검증의 중심 질문이 그 입력을 요구한다 (Q-21)', () => {
    expect(DEFAULT_SETTINGS.handsFree).toBe(true);
  });

  it('고를 수 있는 것은 낭송 셋과 받는 사이 셋이다', () => {
    expect(RECITATION_CHOICES.map((c) => c.key)).toEqual(['full', 'alternate', 'silent']);
    expect(PACE_CHOICES.map((c) => c.key)).toEqual(['slow', 'normal', 'fast']);
  });
});

describe('읽어 들이기', () => {
  it('저장된 적이 없으면 기본값이다', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it('모르는 값은 기본값으로 메운다 — 설정 하나가 이상해도 나머지는 산다', () => {
    const parsed = parseSettings(JSON.stringify({ recitation: '노래로', theme: 'night' }));
    expect(parsed.recitation).toBe('alternate');
    expect(parsed.theme).toBe('night');
  });

  it('깨진 자리는 통째로 기본값이다', () => {
    expect(parseSettings('{어쩌고')).toEqual(DEFAULT_SETTINGS);
  });

  it('저장한 것이 그대로 돌아온다', async () => {
    const store = createSettingsStore(memoryStore());
    await store.save({ ...DEFAULT_SETTINGS, theme: 'night', pace: 'slow', handsFree: false });
    const loaded = await store.load();
    expect(loaded.theme).toBe('night');
    expect(loaded.pace).toBe('slow');
    expect(loaded.handsFree).toBe(false);
  });
});
