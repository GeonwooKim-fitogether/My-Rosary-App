/**
 * 받는 사이 공식 (FR-07 · `spec/journey-rules.md` §4).
 *
 *     (900ms + 사용자 몫 글자수 × 132ms) ÷ 속도계수
 *
 * 신비 선포 뒤만 이 공식을 쓰지 않고 고정 2200ms 다.
 */
import {
  BASE_GAP_MS,
  DECLARATION_GAP_MS,
  HAPTIC_PATTERNS,
  MS_PER_CHAR,
  PACE_FACTORS,
  TTS_RATE,
  gapForPrayer,
  gapMs,
  userShareLength,
} from './pacing';
import { PRAYERS } from './sequence';

describe('공식의 상수', () => {
  it('기본 사이 900ms, 한 글자 132ms, 선포 뒤 고정 2200ms 다', () => {
    expect(BASE_GAP_MS).toBe(900);
    expect(MS_PER_CHAR).toBe(132);
    expect(DECLARATION_GAP_MS).toBe(2200);
  });

  it('속도계수는 느리게 0.75 · 보통 1 · 빠르게 1.35 다', () => {
    expect(PACE_FACTORS).toEqual({ slow: 0.75, normal: 1, fast: 1.35 });
  });

  it('음성 속도는 0.92 다', () => {
    expect(TTS_RATE).toBe(0.92);
  });
});

describe('사용자 몫 글자수 L', () => {
  const text = { a: '앞절다섯', b: '뒷절셋' }; // a 는 4자, b 는 3자

  it('전부 소리로 읽으면 사용자 몫이 없다 (L = 0)', () => {
    expect(userShareLength('full', text)).toBe(0);
  });

  it('교대로 읽으면 뒷 절 글자수만 센다', () => {
    expect(userShareLength('alternate', text)).toBe(3);
  });

  it('읽지 않기면 앞 절과 뒷 절을 합해 센다', () => {
    expect(userShareLength('silent', text)).toBe(7);
  });

  it('실제 성모송에 대해서도 방식마다 몫이 갈린다', () => {
    const hail = PRAYERS.hail;
    expect(userShareLength('full', hail)).toBe(0);
    expect(userShareLength('alternate', hail)).toBe(hail.b.length);
    expect(userShareLength('silent', hail)).toBe(hail.a.length + hail.b.length);
    // 읽지 않기는 언제나 교대보다 몫이 크다 — 앞 절까지 사용자가 바치기 때문이다.
    expect(userShareLength('silent', hail)).toBeGreaterThan(userShareLength('alternate', hail));
  });
});

describe('받는 사이 계산', () => {
  it('글자수가 0 이고 보통 속도면 기본 사이 900ms 그대로다', () => {
    expect(gapMs(0, 'normal')).toBe(900);
  });

  it('글자수 10, 보통 속도면 900 + 10 × 132 = 2220ms 다', () => {
    expect(gapMs(10, 'normal')).toBe(2220);
  });

  it('느리게는 0.75 로 나누어 사이가 길어진다', () => {
    expect(gapMs(0, 'slow')).toBe(1200); // 900 / 0.75
    expect(gapMs(10, 'slow')).toBe(2960); // 2220 / 0.75
  });

  it('빠르게는 1.35 로 나누어 사이가 짧아진다', () => {
    expect(gapMs(0, 'fast')).toBeCloseTo(666.667, 3); // 900 / 1.35
    expect(gapMs(10, 'fast')).toBeCloseTo(1644.444, 3); // 2220 / 1.35
  });

  it('속도가 빠를수록 사이가 짧다', () => {
    expect(gapMs(10, 'slow')).toBeGreaterThan(gapMs(10, 'normal'));
    expect(gapMs(10, 'normal')).toBeGreaterThan(gapMs(10, 'fast'));
  });

  it('글자수가 음수면 거부한다', () => {
    expect(() => gapMs(-1, 'normal')).toThrow(RangeError);
  });
});

describe('신비 선포만 공식을 쓰지 않는다', () => {
  it('선포 뒤는 낭송 방식과 속도가 무엇이든 언제나 2200ms 다', () => {
    for (const mode of ['full', 'alternate', 'silent'] as const) {
      for (const pace of ['slow', 'normal', 'fast'] as const) {
        expect(gapForPrayer('decl', mode, pace)).toBe(DECLARATION_GAP_MS);
      }
    }
  });

  it('선포가 아닌 기도는 공식을 따른다', () => {
    const hail = PRAYERS.hail;
    const expected = (BASE_GAP_MS + hail.b.length * MS_PER_CHAR) / 1;
    expect(gapForPrayer('hail', 'alternate', 'normal')).toBe(expected);
  });

  it('전부 소리로 읽으면 어떤 기도든 기본 사이만 남는다', () => {
    expect(gapForPrayer('hail', 'full', 'normal')).toBe(BASE_GAP_MS);
    expect(gapForPrayer('our', 'full', 'normal')).toBe(BASE_GAP_MS);
  });
});

describe('진동 사전', () => {
  it('네 가지 패턴이 `spec/journey-rules.md` §5 그대로다', () => {
    expect(HAPTIC_PATTERNS.beadAdvance).toEqual([18]);
    expect(HAPTIC_PATTERNS.decadeChange).toEqual([28, 60, 28, 60, 28]);
    expect(HAPTIC_PATTERNS.silentModeOn).toEqual([20, 50, 20]);
    expect(HAPTIC_PATTERNS.dayComplete).toEqual([200]);
  });
});
