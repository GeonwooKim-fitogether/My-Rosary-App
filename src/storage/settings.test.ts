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
import { ENABLED_LANGUAGES } from '../i18n';
import { REGION_ORDER } from '../theme/worldTokens';

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

describe('지역과 언어 (결정 11 의 새 시안)', () => {
  it('기본값은 한국·한국어다', () => {
    expect(DEFAULT_SETTINGS.region).toBe('korea');
    expect(DEFAULT_SETTINGS.language).toBe('ko');
  });

  it('두 값이 없던 옛 기기도 그대로 열린다 — 없으면 기본값으로 메운다', () => {
    const parsed = parseSettings(JSON.stringify({ recitation: 'silent', theme: 'day' }));
    expect(parsed.recitation).toBe('silent');
    expect(parsed.region).toBe('korea');
    expect(parsed.language).toBe('ko');
  });

  it('아는 지역과 켜진 언어는 그대로 돌아온다', () => {
    const parsed = parseSettings(JSON.stringify({ region: 'europe', language: 'en' }));
    expect(parsed.region).toBe('europe');
    expect(parsed.language).toBe('en');
  });

  it('모르는 지역은 한국으로 떨어진다', () => {
    expect(parseSettings(JSON.stringify({ region: '남극' })).region).toBe('korea');
  });

  it('켜지지 않은 언어가 저장돼 있으면 그 지역의 기본 언어로 떨어진다', () => {
    // 이탈리아어는 데이터는 들어와 있으나 아직 켜지지 않았다 (기도문 대조 전 — D-4).
    const parsed = parseSettings(JSON.stringify({ region: 'europe', language: 'it' }));
    expect(parsed.language).toBe('en');
  });

  /*
    남미가 이 시험의 요점이다. 남미의 기본 언어는 스페인어인데 스페인어는 꺼져 있으므로,
    "꺼진 언어 → 그 지역의 기본 언어" 로만 떨어뜨리면 **또 다른 꺼진 언어**로 앱이 선다.
    다섯 지역을 한꺼번에 돌려, 어느 지역에서든 떨어지는 자리가 켜진 언어인지 확인한다.
  */
  it.each(REGION_ORDER)('%s 에서 꺼진 언어가 저장돼 있으면 켜진 언어로 떨어진다', (region) => {
    const parsed = parseSettings(JSON.stringify({ region, language: 'it' }));
    expect(ENABLED_LANGUAGES).toContain(parsed.language);
    expect(parsed.region).toBe(region);
  });

  it('지역도 언어도 모르는 값이면 한국·한국어다', () => {
    const parsed = parseSettings(JSON.stringify({ region: 'mars', language: 'tl' }));
    expect(parsed.region).toBe('korea');
    expect(parsed.language).toBe('ko');
  });

  it('저장한 지역과 언어가 그대로 돌아온다', async () => {
    const store = createSettingsStore(memoryStore());
    await store.save({ ...DEFAULT_SETTINGS, region: 'asia', language: 'en' });
    const loaded = await store.load();
    expect(loaded.region).toBe('asia');
    expect(loaded.language).toBe('en');
  });

  /* ── 앱 안 글자 크기 (W1 §3-5) ──────────────────────────────────────────────── */

  it('앱 안 글자 크기의 기본값은 보통(1)이다', () => {
    expect(DEFAULT_SETTINGS.fontScale).toBe(1);
  });

  it('글자 크기가 없던 옛 기기는 보통으로 열린다', () => {
    expect(parseSettings(JSON.stringify({ recitation: 'silent' })).fontScale).toBe(1);
  });

  it('아는 자리 넷은 그대로 돌아오고, 범위를 벗어난 값은 보통으로 떨어진다', () => {
    expect(parseSettings(JSON.stringify({ fontScale: 0 })).fontScale).toBe(0);
    expect(parseSettings(JSON.stringify({ fontScale: 3 })).fontScale).toBe(3);
    expect(parseSettings(JSON.stringify({ fontScale: 7 })).fontScale).toBe(1);
    expect(parseSettings(JSON.stringify({ fontScale: '2' })).fontScale).toBe(1);
  });

  it('저장한 글자 크기가 그대로 돌아온다', async () => {
    const store = createSettingsStore(memoryStore());
    await store.save({ ...DEFAULT_SETTINGS, fontScale: 3 });
    expect((await store.load()).fontScale).toBe(3);
  });

  /* ── 진동과 움직임 줄이기 (W2 슬라이스 C — 시안 설정의 토글 둘) ─────────────── */

  it('진동은 켜짐, 움직임 줄이기는 꺼짐으로 시작한다 (시안의 기본값)', () => {
    expect(DEFAULT_SETTINGS.haptic).toBe(true);
    expect(DEFAULT_SETTINGS.reduceMotion).toBe(false);
  });

  it('둘이 없던 옛 기기는 기본값으로 열린다', () => {
    const parsed = parseSettings(JSON.stringify({ recitation: 'silent' }));
    expect(parsed.haptic).toBe(true);
    expect(parsed.reduceMotion).toBe(false);
  });

  it('참·거짓이 아닌 값이 저장돼 있으면 기본값으로 떨어진다', () => {
    const parsed = parseSettings(JSON.stringify({ haptic: '아니오', reduceMotion: 1 }));
    expect(parsed.haptic).toBe(true);
    expect(parsed.reduceMotion).toBe(false);
  });

  it('저장한 진동과 움직임 줄이기가 그대로 돌아온다', async () => {
    const store = createSettingsStore(memoryStore());
    await store.save({ ...DEFAULT_SETTINGS, haptic: false, reduceMotion: true });
    const loaded = await store.load();
    expect(loaded.haptic).toBe(false);
    expect(loaded.reduceMotion).toBe(true);
  });
});
