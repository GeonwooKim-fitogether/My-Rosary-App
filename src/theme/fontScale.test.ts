/**
 * 글자 확대 시험 (FR-28) — 글자를 키우면 줄 간격과 자간이 같은 비율로 따라오는가.
 *
 * 여기서 재는 것은 셋이다. 첫째, 플랫폼마다 React Native 가 이미 하는 일을 이 층이 다시 하지
 * 않는가(두 번 곱하면 줄이 벌어진다). 둘째, 배율을 곱한 뒤에도 줄 높이와 글자 크기의 비율,
 * 자간과 글자 크기의 비율이 그대로인가 — 이것이 "붙지 않는다"의 값 수준 근거다. 셋째, 실제
 * 서체 계단 표 전체가 그 규칙을 통과하는가.
 */
import {
  UNIT_SCALE,
  scaleTextStyle,
  scaleTypeScale,
  textScaleFor,
  webFontScale,
  type ScalableText,
} from './fontScale';
import { type, type2 } from './tokens';

describe('배율을 읽는다', () => {
  it('웹은 뿌리 글자 크기를 16 으로 나눈다 — 32px 이면 200% 다', () => {
    expect(webFontScale(16)).toBe(1);
    expect(webFontScale(32)).toBe(2);
    expect(webFontScale(24)).toBe(1.5);
  });

  it('뿌리 글자 크기를 읽지 못하면 1 이다 — 글자를 0 으로 만들지 않는다', () => {
    expect(webFontScale(null)).toBe(1);
    expect(webFontScale(undefined)).toBe(1);
    expect(webFontScale(0)).toBe(1);
    expect(webFontScale(Number.NaN)).toBe(1);
  });
});

describe('플랫폼마다 React Native 가 하지 않는 것만 한다', () => {
  it('웹은 셋 다 이 층이 키운다', () => {
    expect(textScaleFor('web', 2)).toEqual({ font: 2, line: 2, spacing: 2 });
  });

  it('iOS 는 자간만 키운다 — 글자와 줄 높이는 React Native 가 이미 키운다', () => {
    expect(textScaleFor('ios', 2)).toEqual({ font: 1, line: 1, spacing: 2 });
  });

  it('Android 는 아무것도 하지 않는다 — 셋 다 sp 로 키워진다', () => {
    expect(textScaleFor('android', 2)).toEqual(UNIT_SCALE);
  });

  it('이상한 배율은 1 로 본다', () => {
    expect(textScaleFor('web', 0)).toEqual(UNIT_SCALE);
    expect(textScaleFor('web', Number.NaN)).toEqual(UNIT_SCALE);
  });
});

describe('비율이 지켜진다', () => {
  const sample: ScalableText = {
    fontFamily: 'NotoSerifKR-Regular',
    fontSize: 26,
    lineHeight: 26 * 1.7,
    letterSpacing: 26 * 0.1,
  };

  it('200% 로 키우면 글자·줄 높이·자간이 모두 두 배고, 비율은 그대로다', () => {
    const scaled = scaleTextStyle(sample, { font: 2, line: 2, spacing: 2 });
    expect(scaled.fontSize).toBe(52);
    expect(scaled.lineHeight).toBeCloseTo(52 * 1.7);
    expect(scaled.letterSpacing).toBeCloseTo(52 * 0.1);
    expect(scaled.lineHeight / scaled.fontSize).toBeCloseTo(sample.lineHeight / sample.fontSize);
  });

  it('자간이 없는 항목은 자간이 없는 채로 남는다', () => {
    const { letterSpacing: _unused, ...plain } = sample;
    const scaled = scaleTextStyle(plain, { font: 2, line: 2, spacing: 2 });
    expect('letterSpacing' in scaled).toBe(false);
  });

  it('서체 계단 표 전체를 200% 로 키워도 모든 항목의 비율이 그대로다', () => {
    const tables: ReadonlyArray<Record<string, ScalableText>> = [type, type2];
    for (const table of tables) {
      const scaled = scaleTypeScale(table, { font: 2, line: 2, spacing: 2 });
      for (const [key, before] of Object.entries(table)) {
        const after = scaled[key]!;
        expect(after.fontSize).toBeCloseTo(before.fontSize * 2);
        expect(after.lineHeight / after.fontSize).toBeCloseTo(before.lineHeight / before.fontSize);
        if (typeof before.letterSpacing === 'number') {
          expect(after.letterSpacing! / after.fontSize).toBeCloseTo(
            before.letterSpacing / before.fontSize,
          );
        }
      }
    }
  });

  it('서체 계단의 어느 항목도 줄 높이가 글자 크기보다 작지 않다', () => {
    const tables: ReadonlyArray<Record<string, ScalableText>> = [type, type2];
    for (const table of tables) {
      for (const entry of Object.values(table)) {
        expect(entry.lineHeight).toBeGreaterThanOrEqual(entry.fontSize);
      }
    }
  });
});
