/**
 * 묵주 재질 시험 — 넷이 자리를 다 갖췄는가, 서로 다른가, 그리고 두 벌에서 읽히는가.
 *
 * 재질은 "보기에 그럴듯한가"만으로는 판단할 수 없다. 금과 은은 밝은 한지 위에서 흐려지고
 * 나무는 어두운 쪽빛 위에서 묻히는데, 그 흐려짐은 눈으로는 "조금 연하네" 정도로만 보이기
 * 때문이다. 그래서 `src/theme/tokens.test.ts` 가 색표에 하는 것과 같은 방식으로, 여기서도
 * 대비를 **계산해서** 못 박는다.
 *
 * ── 무엇을 몇 대 몇으로 재는가 ────────────────────────────────────────────────
 *
 * 본문 글자의 기준은 4.5:1 이다(디자인 시스템 §7). 그런데 알은 글자가 아니라 **그림 요소**다.
 * 접근성 기준도 이 둘을 갈라 두고 있어, 글자가 아닌 요소는 3:1 을 요구한다. 그래서 이
 * 시험은 이렇게 나눈다.
 *
 * 1. **알·줄·금속은 바탕과 3:1 을 넘긴다.** 알을 알로 알아볼 수 있어야 한다는 요구다.
 * 2. **지금 알 위에 적히는 숫자는 4.5:1 을 넘긴다.** 이쪽은 실제로 글자이므로 본문 기준을
 *    그대로 받는다. 그 짝(치자 알과 그 위의 숫자)은 재질이 바꾸지 않으므로
 *    `tokens.test.ts` 가 이미 재고 있고, 여기서는 **재질이 그 짝을 건드리지 않았는지**를 본다.
 *
 * 반투명하게 그리면 화면에 나타나는 색이 바탕과 섞여 표의 값과 달라지므로, 알은 아직 안
 * 바친 것도 이미 바친 것도 온전한 짙기로 그린다(`BEAD_OPACITY`). 그래서 여기서 재는 값이
 * 곧 화면에 나타나는 값이다.
 *
 * ── 2026-09-10 에 더해진 것 — 빛이 진행을 말한다 (`decisions.md` 결정 10) ────────
 *
 * 알의 상태를 말하는 수단이 **채우기에서 빛으로** 바뀌면서, 이 시험이 재야 할 것이 하나
 * 늘었다. 그전에는 "채웠는가 테만 둘렀는가"가 갈랐으므로 잴 것이 없었다 — 눈으로 봐도
 * 흑백처럼 갈리는 차이였기 때문이다. 이제는 정도의 차이가 갈리므로, **정말 밝아지는
 * 방향인가**를 값으로 못 박아야 한다. 아래 마지막 묶음이 그 일을 한다.
 */
import { dayColors, nightColors } from '../theme/tokens';
import { ROSARY_CHOICES, ROSARY_NAMES, DEFAULT_SETTINGS, parseSettings } from '../storage/settings';
import {
  BEAD_GLOW,
  BEAD_OPACITY,
  BEAD_SHADING,
  ROSARY_MATERIALS,
  materialFor,
} from './rosaryMaterials';

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

/** 두 색의 대비비. */
function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high! + 0.05) / (low! + 0.05);
}

/**
 * 두 색이 얼마나 떨어져 있나 — 세 통로(빨강·초록·파랑)의 거리.
 *
 * 재질끼리 견줄 때는 대비비를 쓰지 않는다. 대비비는 **밝기**만 재므로, 밝기가 비슷하고
 * 색만 다른 짝(밤 벌의 은과 금)을 "같다"고 말해 버린다. 사람이 보는 것은 밝기만이 아니라
 * 색 자체이므로, 세 통로의 거리로 잰다. 0 이면 같은 색이고 441 이 검정과 흰색이다.
 */
function distance(a: string, b: string): number {
  const parse = (hex: string) => {
    const value = hex.replace('#', '');
    return [0, 2, 4].map((at) => parseInt(value.slice(at, at + 2), 16));
  };
  const [x, y] = [parse(a), parse(b)];
  return Math.hypot(x[0]! - y[0]!, x[1]! - y[1]!, x[2]! - y[2]!);
}

const VELS = [
  ['낮', dayColors.background],
  ['밤', nightColors.background],
] as const;

describe('재질 넷이 자리를 다 갖췄다', () => {
  it('두 벌이 같은 재질 넷을 갖는다', () => {
    expect(Object.keys(ROSARY_MATERIALS.day).sort()).toEqual(Object.keys(ROSARY_MATERIALS.night).sort());
    expect(Object.keys(ROSARY_MATERIALS.day).sort()).toEqual(Object.keys(ROSARY_NAMES).sort());
  });

  it('고르기 시트의 줄 넷이 재질 넷과 하나씩 짝을 이룬다', () => {
    expect(ROSARY_CHOICES.map((choice) => choice.key).sort()).toEqual(Object.keys(ROSARY_NAMES).sort());
    for (const choice of ROSARY_CHOICES) {
      expect(choice.name).toBe(ROSARY_NAMES[choice.key]);
      expect(choice.note.length).toBeGreaterThan(0);
    }
  });

  it('기본값은 붉은 장미다 (결정 9)', () => {
    expect(DEFAULT_SETTINGS.rosary).toBe('rose');
  });

  it('옛 값(진주 · 유리)이 저장돼 있으면 기본값으로 떨어진다', () => {
    expect(parseSettings(JSON.stringify({ rosary: 'pearl' })).rosary).toBe('rose');
    expect(parseSettings(JSON.stringify({ rosary: 'glass' })).rosary).toBe('rose');
    // 아는 값은 그대로 산다.
    expect(parseSettings(JSON.stringify({ rosary: 'gold' })).rosary).toBe('gold');
  });
});

describe('재질 넷이 서로 확실히 다르다 (FR-39 · 디자인 시스템 §9-3 의 22번)', () => {
  for (const [name, background] of VELS) {
    it(`${name} 벌: 알 빛깔이 넷 다 다르다`, () => {
      const beads = Object.values(ROSARY_MATERIALS[name === '낮' ? 'day' : 'night']).map(
        (material) => material.bead,
      );
      expect(new Set(beads).size).toBe(beads.length);
      // 서로 다른 값이라는 것만으로는 부족하다 — 나란히 놓았을 때 갈라져 보여야 한다.
      for (let i = 0; i < beads.length; i++) {
        for (let j = i + 1; j < beads.length; j++) {
          expect(distance(beads[i]!, beads[j]!)).toBeGreaterThan(60);
        }
      }
      expect(background).toBeTruthy();
    });
  }

  it('줄의 생김새도 갈린다 — 나무와 장미는 끈, 은과 금은 사슬이다', () => {
    expect(materialFor('day', 'rose').link).toBe('cord');
    expect(materialFor('day', 'wood').link).toBe('cord');
    expect(materialFor('day', 'silver').link).toBe('chain');
    expect(materialFor('day', 'gold').link).toBe('chain');
  });

  it('나무만 큰 알이 작은 알보다 밝다 — 사진의 살구빛 주님의 기도 알이다', () => {
    for (const mode of ['day', 'night'] as const) {
      const wood = materialFor(mode, 'wood');
      expect(luminance(wood.bigBead)).toBeGreaterThan(luminance(wood.bead));
    }
  });
});

describe('넷 다 두 벌에서 읽힌다', () => {
  for (const [name, background] of VELS) {
    const mode = name === '낮' ? 'day' : 'night';
    it(`${name} 벌: 알 · 줄 · 금속이 바탕과 3:1 을 넘는다`, () => {
      for (const key of Object.keys(ROSARY_NAMES) as (keyof typeof ROSARY_NAMES)[]) {
        const material = materialFor(mode, key);
        for (const color of [material.bead, material.bigBead, material.thread, material.metal]) {
          expect(contrast(color, background)).toBeGreaterThanOrEqual(3);
        }
      }
    });
  }

  it('알을 반투명하게 그리지 않는다 — 재는 값과 보이는 값이 같아야 한다', () => {
    expect(BEAD_OPACITY.pending).toBe(1);
    expect(BEAD_OPACITY.done).toBe(1);
  });

  it('지금 알의 치자색과 그 위의 숫자는 재질이 건드리지 않는다', () => {
    // 어느 재질에도 치자색이 들어 있지 않다는 것이 곧 "상태의 색을 덮어쓰지 않았다"이다.
    for (const mode of ['day', 'night'] as const) {
      const colors = mode === 'day' ? dayColors : nightColors;
      for (const key of Object.keys(ROSARY_NAMES) as (keyof typeof ROSARY_NAMES)[]) {
        const material = materialFor(mode, key);
        expect(material.bead).not.toBe(colors.accentFill);
        expect(material.bigBead).not.toBe(colors.accentFill);
      }
      expect(contrast(colors.onAccentFill, colors.accentFill)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('이미 바친 알은 채우기가 아니라 빛으로 갈린다 (결정 10 · FR-15)', () => {
  it('빛무리의 색이 그 벌의 바탕보다 밝다 — 이것이 "환해진다"가 성립하는 조건이다', () => {
    for (const [name, background] of VELS) {
      const mode = name === '낮' ? 'day' : 'night';
      const glow = BEAD_GLOW[mode];
      // 바탕보다 어두운 빛은 빛이 아니라 그늘이다.
      expect(luminance(glow.color)).toBeGreaterThan(luminance(background));
      // 짙기와 크기가 0 이면 빛무리를 그리지 않는 것과 같다.
      expect(glow.opacity).toBeGreaterThan(0);
      expect(glow.radius).toBeGreaterThan(1);
    }
  });

  it('밝은 한지 위에서 쓸 수 있는 가장 밝은 빛에 가깝다 — 낮이 어려운 쪽이다', () => {
    // 한지(#EDE7D8)와 흰빛의 밝기 차는 작아, 낮 벌의 빛은 흰빛에 바짝 붙어 있어야 한다.
    // 이 값이 아래로 내려가면 낮 벌에서 경계가 먼저 사라진다.
    const day = BEAD_GLOW.day;
    expect(luminance(day.color)).toBeGreaterThanOrEqual(0.95);
    // 밝기 차가 작은 만큼 낮이 밤보다 더 두껍게 발라야 같은 만큼 보인다.
    expect(day.opacity).toBeGreaterThan(BEAD_GLOW.night.opacity);
  });

  it('바친 알이 안 바친 알보다 실제로 밝아진다 — 빛은 세게, 그늘과 테는 옅게', () => {
    const { lit, unlit } = BEAD_SHADING;
    expect(lit.light).toBeGreaterThan(unlit.light);
    expect(lit.shade).toBeLessThan(unlit.shade);
    expect(lit.rim).toBeLessThan(unlit.rim);
    expect(lit.contact).toBeLessThanOrEqual(unlit.contact);
  });

  it('알을 밝히는 일이 색을 씻어 낼 만큼 세지는 않다', () => {
    // 빛을 1 에 가깝게 얹으면 알이 하얗게 떠 재질의 빛깔을 잃는다. 렌더해 보고 정한 상한이다.
    expect(BEAD_SHADING.lit.light).toBeLessThanOrEqual(0.7);
  });

  it('지금 바치는 알의 값은 결정 9 에서 맞춰 놓은 그대로다', () => {
    // 지금 알은 치자색과 큰 크기와 숨쉬기로 이미 따로 서 있다. 여기에 손을 대면
    // 금 묵주에서 겨우 맞춰 놓은 균형(결정 9 의 9-4)이 흔들린다.
    expect(BEAD_SHADING.current).toEqual({ light: 0.26, shade: 0.24, rim: 0.45, contact: 0.1 });
  });
});
