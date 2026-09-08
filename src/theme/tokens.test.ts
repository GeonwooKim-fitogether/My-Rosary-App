/**
 * 색표 시험 — 밤 벌이 낮 벌과 같은 자리를 다 갖는가, 그리고 읽히는가.
 *
 * 밤 벌은 M2 가 파생한 것이라(`decisions.md` Q-14) "보기에 그럴듯한가"만으로는 판단할 수
 * 없다. 그래서 두 가지를 기계로 잰다.
 *
 * 1. **자리 빠짐이 없는가** — 낮 벌에 있는 이름이 밤 벌에도 다 있어야 한다. 하나라도 없으면
 *    그 화면은 밤에 색이 비어 그려진다.
 * 2. **읽히는가** — 06-design-system §7 이 요구하는 본문 대비 4.5:1 을 두 벌 모두 넘는지
 *    실제로 계산한다. 눈으로 "어두우니 괜찮겠지" 하고 넘어가지 않으려는 것이다.
 */
import { dayCellFill, dayColors, nightCellFill, nightColors, seasonColors, nightSeasonColors } from './tokens';

/** sRGB 한 통로의 선형 값 (WCAG 정의). */
function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** 상대 휘도. `#RRGGBB` 만 받는다. */
function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** 두 색의 대비비. 4.5:1 이 본문 기준이다. */
function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high! + 0.05) / (low! + 0.05);
}

describe('두 벌이 같은 자리를 갖는다', () => {
  it('색 이름이 하나도 빠지지 않았다', () => {
    expect(Object.keys(nightColors).sort()).toEqual(Object.keys(dayColors).sort());
  });

  it('전례색 넷과 칸 색 넷도 두 벌 모두 있다', () => {
    expect(Object.keys(nightSeasonColors).sort()).toEqual(Object.keys(seasonColors).sort());
    expect(Object.keys(nightCellFill).sort()).toEqual(Object.keys(dayCellFill).sort());
  });

  it('밤 벌의 값은 06-design-system §2-2 의 밤 팔레트다', () => {
    expect(nightColors.background).toBe('#10161F'); // --ground
    expect(nightColors.surface).toBe('#18202C'); // --surface
    expect(nightColors.fill).toBe('#222C3B'); // --surface-2
    expect(nightColors.ink).toBe('#F0EAD9'); // --hanji
    expect(nightColors.inkMuted).toBe('#8E93A3'); // --dusk
    expect(nightColors.accent).toBe('#D9AE4C'); // --chija
    expect(nightColors.beadDone).toBe('#4A5262'); // --ash
  });
});

describe('본문이 읽힌다 — 두 벌 모두 4.5:1 을 넘는다 (06-design-system §7)', () => {
  const vels = [
    ['낮', dayColors],
    ['밤', nightColors],
  ] as const;

  for (const [name, colors] of vels) {
    it(`${name} 벌: 본문 · 보조 글자 · 강조색이 바탕과 4.5:1 을 넘는다`, () => {
      expect(contrast(colors.ink, colors.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(colors.inkMuted, colors.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(colors.accent, colors.background)).toBeGreaterThanOrEqual(4.5);
    });

    it(`${name} 벌: 채운 단추 위의 글자가 그 바탕과 4.5:1 을 넘는다`, () => {
      expect(contrast(colors.onFill, colors.fill)).toBeGreaterThanOrEqual(4.5);
    });

    it(`${name} 벌: 지금 알 위의 숫자가 알과 4.5:1 을 넘는다`, () => {
      expect(contrast(colors.onAccentFill, colors.accentFill)).toBeGreaterThanOrEqual(4.5);
    });
  }

  it('낮 벌의 전례색 넷이 모두 바탕과 4.5:1 을 넘는다 (Q-18 이 파생한 값들)', () => {
    for (const color of Object.values(seasonColors)) {
      expect(contrast(color, dayColors.background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('밤 벌의 전례색 넷도 마찬가지다 — 문서 값 둘은 글자에서 모자라 밝혔다', () => {
    for (const color of Object.values(nightSeasonColors)) {
      expect(contrast(color, nightColors.background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('문서의 밤 자색·홍색을 그대로 쓰면 실제로 모자란다 — 밝힌 근거를 남긴다', () => {
    // 이 두 줄이 위 파생의 근거다. 문서 값이 언젠가 바뀌면 이 시험이 먼저 알려 준다.
    expect(contrast('#7A6699', nightColors.background)).toBeLessThan(4.5);
    expect(contrast('#9E4A57', nightColors.background)).toBeLessThan(4.5);
  });
});
