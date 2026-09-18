/**
 * 앱 안 글자 크기 넷 — 기도문을 얼마나 크게 보여 줄 것인가 (W1 지시서 §3-5 · FR-28).
 *
 * 이 파일이 따로 있는 이유는, 기도 화면의 글자 크기가 **두 배율의 곱**이기 때문이다.
 *
 * 1. **기기 배율** — 사람이 폰(또는 브라우저)의 설정에서 글자를 키운 값. 이것은
 *    `fontScale.ts` 가 이미 다루고 있고, 앱은 거기에 손대지 않는다.
 * 2. **앱 안 배율** — 기도 화면 머리의 `Aa` 단추로 고르는 넷(작게 · 보통 · 크게 · 아주
 *    크게). 시안이 기도 화면에만 둔 손잡이이며, 이 파일이 그 값을 정한다.
 *
 * 둘이 곱해지므로 **겹쳐 커지는 자리**가 생긴다. 기기에서 200% 를 쓰는 사람이 앱에서도
 * `아주 크게` 를 고르면 27 × 2 = 54px 이 되고, 390 너비에서 한 줄에 여섯 자도 들어가지
 * 않아 가장 긴 기도문이 화면 두 장을 넘긴다. 그래서 상한을 건다 — **기본값(20px)의
 * 2.6배인 52px** 이고, 390 너비에서 한글 일곱 자가 한 줄에 서는 크기다.
 *
 * 상한을 거는 방법이 플랫폼마다 다르다는 점을 적어 둔다. 웹에서는 이 파일이 기기 배율을
 * 직접 곱하므로(`fontScale.ts` 의 표) 곱한 값을 여기서 잘라내면 되고, iOS·Android 에서는
 * React Native 가 스스로 곱하므로 우리가 자를 수 없다 — 대신 `<Text>` 의
 * `maxFontSizeMultiplier` 로 **React Native 에게 상한을 알려 준다.** 그래서 이 파일은
 * 두 값을 함께 내보낸다.
 */

/** 앱 안 글자 크기의 자리 — 0 작게 · 1 보통 · 2 크게 · 3 아주 크게. */
export type FontScaleIndex = 0 | 1 | 2 | 3;

/** 시안(`MyRosary World`)이 `cycleFont` 에 쓰는 네 크기(px). */
export const PRAYER_FONT_PX = [17, 20, 23, 27] as const;

/** 기본값. 시안의 기본 기도문 크기(20px)다. */
export const PRAYER_FONT_DEFAULT: FontScaleIndex = 1;

/** 기도문의 줄 높이 배수. 시안의 `line-height:1.62`. */
export const PRAYER_LINE_RATIO = 1.62;

/**
 * 기기 배율까지 곱한 뒤의 상한(px). 기본값의 2.6배다.
 *
 * 값을 조용히 삼키지 않기 위해 적어 둔다 — 기기 200% × 아주 크게(27px)는 54px 이라 이
 * 상한에 걸려 52px 로 잘린다. 기기 200% × 크게(23px)는 46px 이라 걸리지 않는다.
 */
export const PRAYER_FONT_MAX_PX = PRAYER_FONT_PX[PRAYER_FONT_DEFAULT] * 2.6;

/** 설정 화면과 `Aa` 단추가 읽어 주는 이름. `src/i18n` 의 문구 열쇠와 같은 순서다. */
export const FONT_SCALE_LABEL_KEYS = ['small', 'normal', 'large', 'xlarge'] as const;

/** 아는 값만 자리로 받아들인다. 모르는 값은 기본값이다. */
export function asFontScaleIndex(value: unknown): FontScaleIndex {
  return value === 0 || value === 1 || value === 2 || value === 3 ? value : PRAYER_FONT_DEFAULT;
}

/** `Aa` 를 한 번 누른 뒤의 자리. 넷째에서 처음으로 돌아온다. */
export function nextFontScale(index: FontScaleIndex): FontScaleIndex {
  return (((index + 1) % PRAYER_FONT_PX.length) as FontScaleIndex);
}

/**
 * 기도문 한 줄의 실제 글자 크기와 줄 높이.
 *
 * @param index 앱 안에서 고른 자리 넷 중 하나.
 * @param deviceScale 이 파일이 직접 곱해야 하는 기기 배율. 웹은 1 이 아닌 값이 오고,
 *                    iOS·Android 는 React Native 가 스스로 곱하므로 언제나 1 이 온다.
 */
export function prayerTextStyle(
  index: FontScaleIndex,
  deviceScale: number,
): { fontSize: number; lineHeight: number; maxFontSizeMultiplier: number } {
  const base = PRAYER_FONT_PX[index];
  const scale = Number.isFinite(deviceScale) && deviceScale > 0 ? deviceScale : 1;
  const fontSize = Math.min(base * scale, PRAYER_FONT_MAX_PX);
  return {
    fontSize,
    lineHeight: fontSize * PRAYER_LINE_RATIO,
    // React Native 가 스스로 곱하는 플랫폼에서 같은 상한을 걸게 한다. 웹에서는 위에서
    // 이미 잘랐으므로 이 값이 쓰이지 않는다.
    maxFontSizeMultiplier: PRAYER_FONT_MAX_PX / base,
  };
}
