/**
 * 지역 다섯 벌의 색 시험 — 자리가 다 있는가, 그리고 읽히는가.
 *
 * 시안이 정한 색을 그대로 옮겼으므로 "보기에 그럴듯한가"는 물을 것이 없다. 물을 것은
 * **그 색으로 글자가 실제로 읽히는가**이고, 그것은 눈이 아니라 계산으로만 답할 수 있다.
 * 계산식은 낮·밤 두 벌을 재던 `tokens.test.ts` 의 것과 같은 WCAG 정의다.
 *
 * 이 시험은 두 가지를 갈라 한다. **지켜야 하는 기준**은 넘는지 확인하고, **지금 미달하는
 * 것**은 미달한다는 사실 자체를 값으로 붙들어 둔다. 미달을 조용히 고치면 시안의 얼굴이
 * 바뀌므로 그것은 사람이 정할 일이고, 시험이 할 수 있는 일은 "지금 이 값이다"를 못 박아
 * 누군가 모르고 바꾸면 곧바로 알려 주는 것이다.
 */
import {
  OFF_TURN_OPACITY,
  onScrim,
  REGION_ORDER,
  REGION_PALETTES,
  worldFonts,
  type WorldPalette,
} from './worldTokens';

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

/** 두 색의 대비비. 본문 글자는 4.5:1, 그림 요소는 3:1 이 기준이다 (`decisions.md` Q-43). */
function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high! + 0.05) / (low! + 0.05);
}

const palettes = REGION_ORDER.map((region) => [region, REGION_PALETTES[region]] as const);

describe('다섯 벌이 같은 자리를 갖는다', () => {
  const names = Object.keys(REGION_PALETTES.korea).sort();

  it.each(palettes)('%s 벌에 색 이름이 하나도 빠지지 않았다', (_region, palette: WorldPalette) => {
    expect(Object.keys(palette).sort()).toEqual(names);
  });

  it('지역은 다섯이고 차례가 정해져 있다', () => {
    expect(REGION_ORDER).toHaveLength(5);
    expect([...REGION_ORDER].sort()).toEqual(Object.keys(REGION_PALETTES).sort());
  });

  it('모든 색이 여섯 자리 색값이다 — 화면이 색을 못 읽고 검게 그리는 일을 막는다', () => {
    for (const [, palette] of palettes) {
      for (const value of Object.values(palette)) {
        expect(value).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });
});

describe('본문이 읽힌다 — 다섯 벌 모두 4.5:1 을 넘는다', () => {
  it.each(palettes)('%s — 본문 글자가 종이 위에서 읽힌다', (_region, palette: WorldPalette) => {
    expect(contrast(palette.ink, palette.paper)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(palettes)('%s — 흐린 글자도 읽힌다', (_region, palette: WorldPalette) => {
    expect(contrast(palette.muted, palette.paper)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(palettes)('%s — 어두운 층 위의 기도문이 읽힌다', (_region, palette: WorldPalette) => {
    expect(contrast(onScrim.ink, palette.scrim)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(palettes)('%s — 어두운 층 위의 강조가 읽힌다', (_region, palette: WorldPalette) => {
    expect(contrast(onScrim.accent, palette.scrim)).toBeGreaterThanOrEqual(4.5);
  });
});

/**
 * 강조색은 지금 기준에 미달한다 — 그 사실을 값으로 붙들어 둔다.
 *
 * 시안은 강조색을 작은 글자에 쓴다(머리의 12px 라벨, 13px 링크, 주 단추의 글자와 테).
 * 그런데 다섯 벌 모두 종이 위에서 2.26~2.94 로, 본문 기준 4.5:1 은 물론 그림 요소 기준
 * 3:1 에도 닿지 않는다. 「Classical」 체계의 설명문 자신이 "강조와 바탕의 짝은 3:1 로
 * 맞췄으니 본문 크기 글자에는 더 짙은 단계를 쓰라"고 적어 두었는데, 시안의 화면은 그
 * 권고를 따르지 않고 강조색을 그대로 작은 글자에 썼다.
 *
 * **이 시험은 그것을 고치지 않는다.** 강조색을 짙게 바꾸면 다섯 지역의 얼굴이 함께
 * 바뀌므로 사람이 정할 일이고(`decisions.md` 결정 큐 Q-51), 시험이 할 수 있는 일은
 * 지금 값을 붙들어 두어 누군가 모르고 건드리면 먼저 알려 주는 것이다. 값이 4.5 를
 * 넘도록 고쳐지면 이 시험이 실패하고, 그때 이 블록을 위의 정상 기준으로 옮기면 된다.
 */
describe('강조색의 현재 대비 — 기준 미달을 값으로 기록해 둔다 (Q-51)', () => {
  it.each(palettes)('%s — 강조색이 종이 위에서 3:1 에 닿지 않는다', (_region, palette: WorldPalette) => {
    const ratio = contrast(palette.accent, palette.paper);
    expect(ratio).toBeGreaterThan(2.2);
    expect(ratio).toBeLessThan(3.0);
  });

  it.each(palettes)('%s — 둘째 강조는 4:1 을 넘는다', (_region, palette: WorldPalette) => {
    expect(contrast(palette.accent2, palette.paper)).toBeGreaterThan(4.0);
  });
});

describe('글꼴 이름이 번들의 파일과 짝이다', () => {
  it('다섯 이름이 모두 있고 비어 있지 않다', () => {
    expect(Object.keys(worldFonts).sort()).toEqual(
      ['body', 'bodyBold', 'heading', 'headingBold', 'korean'].sort(),
    );
    for (const name of Object.values(worldFonts)) expect(name.length).toBeGreaterThan(0);
  });
});

/**
 * 물러난 절이 읽히는가 (W1 의 카드 E · `docs/plan/w1-work-order.md` §3-3).
 *
 * 기도 화면은 교대 낭송의 두 절을 위아래로 두고 지금 차례가 아닌 쪽을 흐리게 한다. 흐리게
 * 하는 것과 읽을 수 없게 하는 것은 한 끗 차이라, 그 경계를 눈이 아니라 값으로 못 박는다 —
 * 흐려진 글자가 지역 다섯의 덮개 위에서 본문 기준(4.5:1)을 지키는지 계산한다.
 *
 * 반투명한 글자가 화면에 실제로 나타나는 색은 바탕과 섞인 색이므로, 여기서도 섞은 뒤에 잰다.
 */
describe('물러난 절도 읽힌다 (카드 E)', () => {
  /** 짙기 o 로 그린 색이 바탕 위에서 실제로 나타나는 색. */
  const over = (color: string, background: string, o: number): string => {
    const parse = (hex: string) =>
      [0, 2, 4].map((at) => parseInt(hex.replace('#', '').slice(at, at + 2), 16));
    const [front, back] = [parse(color), parse(background)];
    const mixed = front.map((value, i) => Math.round(o * value + (1 - o) * back[i]!));
    return `#${mixed.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  };

  it('다섯 지역 모두에서 흐려진 앞 절과 뒷 절이 본문 기준 4.5:1 을 넘는다', () => {
    for (const region of REGION_ORDER) {
      const scrim = REGION_PALETTES[region].scrim;
      // 앞 절은 본문색, 뒷 절은 강조색으로 그린다 (`app/pray.tsx`).
      expect(contrast(over(onScrim.ink, scrim, OFF_TURN_OPACITY), scrim)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(over(onScrim.accent, scrim, OFF_TURN_OPACITY), scrim)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('물러난 글의 짙기는 시안이 쓰는 값 그대로다', () => {
    // 시안은 기도문 아래의 묵상 노트를 `opacity:.72` 로 물러나게 한다. 같은 뜻의 자리에
    // 같은 값을 쓴다 — 여기를 더 낮추면 위 시험이 먼저 걸린다.
    expect(OFF_TURN_OPACITY).toBe(0.72);
  });
});
