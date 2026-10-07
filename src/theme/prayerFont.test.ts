/**
 * 앱 안 글자 크기 넷의 시험 (W1 §3-5).
 *
 * 여기서 재는 것은 셋이다. 네 자리가 시안의 값 그대로인가, `Aa` 가 넷을 돌고 처음으로
 * 돌아오는가, 그리고 **기기 배율과 겹쳐 곱해질 때 상한이 실제로 걸리는가**.
 */
import {
  PRAYER_FONT_DEFAULT,
  PRAYER_FONT_MAX_PX,
  PRAYER_FONT_PX,
  PRAYER_LINE_RATIO,
  asFontScaleIndex,
  nextFontScale,
  prayerTextStyle,
  type FontScaleIndex,
} from './prayerFont';

describe('앱 안 글자 크기 넷', () => {
  it('네 크기는 시안의 17 · 20 · 23 · 27px 이고 기본값은 20px 이다', () => {
    expect(PRAYER_FONT_PX).toEqual([17, 20, 23, 27]);
    expect(PRAYER_FONT_PX[PRAYER_FONT_DEFAULT]).toBe(20);
  });

  it('Aa 를 누르면 한 칸씩 올라가고 넷째에서 처음으로 돌아온다', () => {
    expect(nextFontScale(0)).toBe(1);
    expect(nextFontScale(1)).toBe(2);
    expect(nextFontScale(2)).toBe(3);
    expect(nextFontScale(3)).toBe(0);
  });

  it('모르는 값은 기본값으로 떨어진다', () => {
    expect(asFontScaleIndex(2)).toBe(2);
    expect(asFontScaleIndex(4)).toBe(PRAYER_FONT_DEFAULT);
    expect(asFontScaleIndex('2')).toBe(PRAYER_FONT_DEFAULT);
    expect(asFontScaleIndex(undefined)).toBe(PRAYER_FONT_DEFAULT);
  });

  it('기기 배율이 1 이면 고른 크기가 그대로 나오고 줄 높이는 1.62 배다', () => {
    for (const index of [0, 1, 2, 3] as FontScaleIndex[]) {
      const style = prayerTextStyle(index, 1);
      expect(style.fontSize).toBe(PRAYER_FONT_PX[index]);
      expect(style.lineHeight / style.fontSize).toBeCloseTo(PRAYER_LINE_RATIO, 5);
    }
  });

  it('기기 배율과 겹쳐 곱해져도 52px 을 넘지 않는다', () => {
    // 기기 200% × 아주 크게(27px) = 54px → 상한 52px 에 걸린다.
    expect(prayerTextStyle(3, 2).fontSize).toBe(PRAYER_FONT_MAX_PX);
    // 기기 200% × 크게(23px) = 46px → 걸리지 않는다.
    expect(prayerTextStyle(2, 2).fontSize).toBe(46);
    // 기기 200% × 보통(20px) = 40px.
    expect(prayerTextStyle(1, 2).fontSize).toBe(40);
    // 상한에 걸려도 줄 높이의 비율은 그대로다 — 글자만 커지고 줄이 붙는 것이 FR-28 이
    // 막으려는 결함이므로, 잘라낸 뒤에도 비율을 다시 계산한다.
    const capped = prayerTextStyle(3, 2);
    expect(capped.lineHeight / capped.fontSize).toBeCloseTo(PRAYER_LINE_RATIO, 5);
  });

  it('React Native 가 스스로 키우는 플랫폼에 넘길 상한 배수를 함께 낸다', () => {
    // 27px 짜리 글은 52 ÷ 27 배까지만 커질 수 있다.
    expect(prayerTextStyle(3, 1).maxFontSizeMultiplier).toBeCloseTo(52 / 27, 5);
    expect(prayerTextStyle(1, 1).maxFontSizeMultiplier).toBeCloseTo(2.6, 5);
  });

  it('배율이 이상한 값이면 1 로 본다', () => {
    expect(prayerTextStyle(1, 0).fontSize).toBe(20);
    expect(prayerTextStyle(1, Number.NaN).fontSize).toBe(20);
  });
});
