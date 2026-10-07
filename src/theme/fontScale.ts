/**
 * 시스템 글자 크기 확대를 서체 계단에 옮기는 자리 (FR-28 · 06-design-system §3·§7).
 *
 * 요구는 하나다 — **글자를 키우면 줄 간격과 자간이 함께 커지고, 200% 확대에서도 글이 붙거나
 * 잘리지 않는다.** 경쟁 앱(굿뉴스 묵주기도)이 글자만 키우고 줄 간격을 따라 늘리지 않아 시니어가
 * 못 쓰게 된 자리이고(PRD 조사 02b), 우리가 같은 결함을 가지면 그 차별점은 없는 것이다.
 *
 * 구현하기 전에 React Native 가 실제로 무엇을 키우고 무엇을 두는지 소스에서 확인했다. 플랫폼마다
 * 다르고, 그 차이가 이 파일의 모양을 정했다.
 *
 * | 플랫폼 | `fontSize` | `lineHeight` | `letterSpacing` | 근거 |
 * |---|---|---|---|---|
 * | iOS | 시스템 배율로 키운다 | **키운다** — 배율을 곱한다 | **그대로 둔다** | `RCTAttributedTextUtils.mm` 230행은 `lineHeight × multiplier`, 192행은 `letterSpacing` 을 그대로 넘긴다 |
 * | Android | 키운다 (sp) | 키운다 (sp) | 키운다 (sp) | `TextAttributeProps.kt` 42·147·168행 — `allowFontScaling` 이면 셋 다 `toPixelFromSP` |
 * | 웹 | 그대로 | 그대로 | 그대로 | `react-native-web` 은 `fontScale` 을 언제나 1 로 둔다 (`Dimensions`). 시스템 글자 크기라는 개념이 없다 |
 *
 * 그래서 "줄 높이에 배율을 곱한다"를 모든 플랫폼에 똑같이 하면 **iOS 와 Android 에서는 두 번
 * 곱해져** 줄이 오히려 벌어진다. 이 파일은 플랫폼마다 **React Native 가 하지 않는 것만** 한다.
 *
 * - **웹**: 셋 다 이 파일이 키운다. 배율은 브라우저의 뿌리 글자 크기(`html` 의 `font-size`) 를
 *   16px 로 나눈 값이다 — 디자인 시스템 §3 이 "웹에서는 `rem` 기준"이라고 적은 그것이며, 사용자가
 *   브라우저 설정에서 글자 크기를 "크게"로 바꾸면 이 값이 커진다.
 * - **iOS**: 자간만 이 파일이 키운다. 글자와 줄 높이는 React Native 가 이미 같은 배율로 키운다.
 * - **Android**: 아무것도 하지 않는다. 셋 다 React Native 가 sp 단위로 키운다.
 *
 * 배율은 **앱이 뜰 때 한 번** 읽는다. 기기의 글자 크기를 바꾸면 React Native 가 키우는 부분은
 * 곧바로 따라오고, 이 파일이 키우는 부분(웹 전부 · iOS 자간)은 앱을 다시 열어야 따라온다.
 */
import { PixelRatio, Platform } from 'react-native';

/** 웹의 뿌리 글자 크기 기본값. `rem` 의 1 이 이 값이다. */
export const WEB_ROOT_FONT_PX = 16;

/** 서체 계단의 세 값에 각각 곱할 배율. 1 은 "React Native 가 이미 한다"는 뜻이다. */
export interface TextScale {
  font: number;
  line: number;
  spacing: number;
}

/** 배율이 닿는 글자 스타일의 모양. 서체 계단의 항목이 이 모양이다. */
export interface ScalableText {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

/** 아무것도 키우지 않는 배율. Android 와 시험에서 쓴다. */
export const UNIT_SCALE: TextScale = { font: 1, line: 1, spacing: 1 };

/**
 * 웹의 뿌리 글자 크기(px)를 배율로 바꾼다. 값이 없거나 이상하면 1 이다 — 확대를 못 읽었다고
 * 글자를 0 으로 만들 수는 없다.
 */
export function webFontScale(rootFontSizePx: number | null | undefined): number {
  if (typeof rootFontSizePx !== 'number' || !Number.isFinite(rootFontSizePx) || rootFontSizePx <= 0) {
    return 1;
  }
  return rootFontSizePx / WEB_ROOT_FONT_PX;
}

/** 플랫폼과 시스템 배율에서, 이 파일이 실제로 곱해야 하는 배율 셋을 정한다 (파일 머리의 표). */
export function textScaleFor(os: string, fontScale: number): TextScale {
  const scale = Number.isFinite(fontScale) && fontScale > 0 ? fontScale : 1;
  if (os === 'web') return { font: scale, line: scale, spacing: scale };
  if (os === 'ios') return { font: 1, line: 1, spacing: scale };
  return UNIT_SCALE;
}

/** 브라우저의 뿌리 글자 크기를 읽는다. 문서가 없는 곳(서버 렌더 · 시험)에서는 null 이다. */
function readRootFontSizePx(): number | null {
  const doc = (globalThis as { document?: Document }).document;
  if (!doc?.documentElement || typeof getComputedStyle !== 'function') return null;
  const value = parseFloat(getComputedStyle(doc.documentElement).fontSize);
  return Number.isFinite(value) ? value : null;
}

/** 지금 이 기기의 시스템 글자 배율. 웹은 뿌리 글자 크기에서, 기기는 React Native 에서 읽는다. */
export function readFontScale(): number {
  if (Platform.OS === 'web') return webFontScale(readRootFontSizePx());
  const scale = PixelRatio.getFontScale();
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

/** 글자 스타일 하나에 배율을 곱한다. 자간이 없는 항목은 자간이 없는 채로 둔다. */
export function scaleTextStyle<T extends ScalableText>(style: T, scale: TextScale): T {
  const scaled: ScalableText = {
    ...style,
    fontSize: style.fontSize * scale.font,
    lineHeight: style.lineHeight * scale.line,
  };
  if (typeof style.letterSpacing === 'number') {
    scaled.letterSpacing = style.letterSpacing * scale.spacing;
  }
  return scaled as T;
}

/** 서체 계단 표 전체에 배율을 곱한다. 항목의 이름은 그대로다. */
export function scaleTypeScale<T extends Record<string, ScalableText>>(
  table: T,
  scale: TextScale,
): { [K in keyof T]: ScalableText } {
  const out = {} as { [K in keyof T]: ScalableText };
  for (const key of Object.keys(table) as (keyof T)[]) {
    out[key] = scaleTextStyle(table[key], scale);
  }
  return out;
}

/** 이 기기에서 서체 계단에 곱하는 배율. 앱이 뜰 때 한 번 정해진다. */
export const TEXT_SCALE: TextScale = textScaleFor(Platform.OS, readFontScale());
