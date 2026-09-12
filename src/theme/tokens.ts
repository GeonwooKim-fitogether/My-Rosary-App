/**
 * 디자인 토큰 — v5 시안 낮 벌의 색과 서체 계단.
 *
 * 값의 출처는 `docs/design/v5/index.html` 하나다. v5 는 색·크기·간격을 스타일시트에
 * 한 줄도 두지 않고 각 화면의 인라인 스타일에 글자 그대로 박아 두었으므로, 여기 있는
 * 값은 전부 그 마크업에서 읽어 옮긴 것이다. **눈으로 어림한 값은 하나도 없다.**
 *
 * CSS 와 React Native 의 단위가 다른 곳이 둘 있어 옮기며 환산했다.
 * 첫째, CSS 의 줄 높이는 배수(`/1.8`)인데 React Native 의 `lineHeight` 는 픽셀이라
 * 글자 크기를 곱해 적었다. 둘째, CSS 의 자간은 `em`(`.24em`)인데 React Native 의
 * `letterSpacing` 은 픽셀이라 역시 글자 크기를 곱했다.
 *
 * **서체 계단(`type` · `type2`)은 시스템 글자 크기 확대를 따른다** (FR-28). 아래 표들은 100%
 * 기준값으로 적혀 있고, 내보낼 때 `fontScale.ts` 가 이 기기의 배율을 곱한다. 곱하는 방식이
 * 플랫폼마다 다른 이유(React Native 가 이미 키우는 것은 다시 곱지 않는다)는 그 파일 머리에 있다.
 * 줄 높이와 자간이 글자 크기에 곱해 적혀 있으므로, 셋에 같은 배율을 곱하면 비율이 그대로
 * 남는다 — 글자를 키워도 줄이 붙지 않는다는 것이 이 구조에서 나온다.
 *
 * **밤 벌은 아직 없다.** v5 가 낮 벌만 그렸기 때문이며, 만드는 방식은 `decisions.md`
 * Q-14 가 M2 로 정해 두었다. 그래서 색을 화면에 직접 쓰지 않고 반드시 이름으로 쓴다 —
 * 나중에 색표 한 벌을 더 끼워 넣으면 화면을 고치지 않고 밤 벌을 받을 수 있게 하려는 것이다.
 */

import { TEXT_SCALE, scaleTypeScale } from './fontScale';

/** 색의 이름들. 밤 벌이 생기면 같은 이름으로 값만 다른 표를 하나 더 만든다. */
export interface ColorTokens {
  /** 본문 먹빛. 글자와 채운 단추의 바탕에 쓴다. */
  ink: string;
  /** 보조 회색. 라벨·각주·비활성 글자에 쓴다. */
  inkMuted: string;
  /** 반전 글자. 먹빛 바탕 위의 글자다. */
  inverse: string;
  /** 화면 바탕. */
  background: string;
  /** 강조색(치자-d). 본문 대비 4.7:1 을 넘긴 값이다 (`decisions.md` Q-09). */
  accent: string;
  /** 괘선. 구획을 나누는 가는 선이다. */
  rule: string;
  /** 테두리만 있는 단추의 선. 괘선보다 진하다. */
  buttonBorder: string;
  /**
   * 면으로 칠하는 강조색(치자). 글자에 쓰는 `accent` 와 값이 다르다.
   *
   * 글자용 치자-d(`#82600F`)는 작은 글자가 바탕과 4.5:1 을 넘게 하려고 어둡게 조정한
   * 값이고(`decisions.md` Q-09), 묵주 알처럼 큰 면을 칠할 때는 그 조정이 필요 없다.
   * v5 시안이 묵주 알에 쓴 값이 이것이다.
   */
  accentFill: string;

  /* ── 아래 일곱은 M2 가 밤 벌을 만들면서 이름으로 갈라낸 자리다 ─────────────────
     M1 까지는 "채운 단추의 바탕"을 `ink` 로, "그 위의 글자"를 `inverse` 로 썼다.
     낮 벌에서는 글자색과 단추 바탕이 우연히 같은 값(먹빛)이라 문제가 없었지만, 밤 벌은
     둘이 갈린다 — 밤의 본문 글자는 한지빛이고, 그 값을 단추 바탕에 그대로 쓰면 80px
     짜리 크림색 덩어리가 어두운 방에서 눈을 찌른다. 그래서 역할마다 이름을 따로 두고,
     낮 벌의 값은 v5 가 쓰던 것과 글자 하나까지 같게 두었다. ───────────────────── */

  /** 카드·시트처럼 바탕에서 한 겹 떠오르는 면 (06-design-system §2-2 의 `--surface`). */
  surface: string;
  /** 채운 단추의 바탕. 낮은 먹빛, 밤은 표면 강조색이다. */
  fill: string;
  /** 채운 단추 위의 글자. */
  onFill: string;
  /** 채운 단추 위의 보조 글자 (v5 새 기도의 선택된 상자 안 작은 글자). */
  onFillMuted: string;
  /** 고르는 줄의 옅은 테두리 (v5 새 기도의 낭송 세 줄). */
  rowBorder: string;
  /** 앞세우지 않는 단추의 더 옅은 테두리 (v5 기도 화면의 `여기서 끝내기`). */
  quietBorder: string;
  /** 아직 채우지 않은 입력 칸의 테두리 (v5 초대 코드의 빈 칸). */
  inputBorder: string;
  /** 강조색을 아주 옅게 깐 면 (v5 초대 코드의 지금 칸 바탕 — 치자 6%). */
  accentWash: string;
  /** 시트가 뜰 때 화면을 덮는 그늘. */
  scrim: string;
  /** 이미 지나간 묵주 알. */
  beadDone: string;
  /** 지금 알(치자) 위에 적히는 숫자. */
  onAccentFill: string;
}

/** 낮 벌. v5 가 그린 유일한 벌이다. */
export const dayColors: ColorTokens = {
  ink: '#1F2530',
  inkMuted: '#5C6272',
  inverse: '#F5F1E6',
  background: '#EDE7D8',
  accent: '#82600F',
  rule: 'rgba(31,37,48,.16)',
  buttonBorder: 'rgba(31,37,48,.30)',
  accentFill: '#8A6516',
  surface: '#F5F1E6',
  fill: '#1F2530',
  onFill: '#F5F1E6',
  onFillMuted: '#C9C2B0',
  rowBorder: 'rgba(31,37,48,.18)',
  quietBorder: 'rgba(31,37,48,.14)',
  inputBorder: 'rgba(31,37,48,.22)',
  accentWash: 'rgba(130,96,15,.06)',
  scrim: 'rgba(31,37,48,.32)',
  beadDone: '#1F2530',
  onAccentFill: '#F5F1E6',
};

/**
 * 밤 벌 — 쪽빛. **v5 에 없어 M2 가 파생한 것이다** (`decisions.md` Q-14).
 *
 * 지어낸 값은 없다. 여덟 값은 `docs/product/06-design-system.md` §2-2 의 밤 팔레트가
 * 글자 그대로 정해 두었고, 이 표가 한 일은 그 값들을 낮 벌과 **같은 이름의 자리에**
 * 앉힌 것뿐이다. 어느 값이 어느 이름으로 갔는지 아래에 하나씩 적는다.
 *
 * | 이 표의 이름 | 밤 팔레트의 값 | 왜 그 자리인가 |
 * |---|---|---|
 * | `background` | `--ground` `#10161F` | 바탕. 검정이 아니라 쪽물이 가장 깊게 든 남색이다 |
 * | `surface` | `--surface` `#18202C` | 카드·시트 — 문서가 그 쓰임을 그대로 적어 두었다 |
 * | `fill` | `--surface-2` `#222C3B` | "선택된 것"의 면. 채운 단추가 그 화면에서 선택된 행동이다 |
 * | `ink` | `--hanji` `#F0EAD9` | 본문 글자 |
 * | `inkMuted` | `--dusk` `#8E93A3` | 보조 글자 |
 * | `accent`·`accentFill` | `--chija` `#D9AE4C` | 강조. 낮 벌은 글자용과 면용이 갈리는데(작은 글자의 대비 때문, Q-09) 밤에는 밝은 치자가 어두운 바탕 위에서 이미 대비를 넘어 하나로 족하다 |
 * | `beadDone` | `--ash` `#4A5262` | 지나간 알 — §2-1 이 "비활성·아직 오지 않은 알"로 적은 층이다 |
 * | `rule` | `--line` `rgba(240,234,217,.10)` | 괘선 |
 *
 * 문서에 값이 없어 규칙으로 파생한 것은 넷이고, 파생 규칙도 함께 적는다.
 *
 * 1. `buttonBorder`·`rowBorder`·`quietBorder`·`inputBorder` — 낮 벌의 네 테두리는 모두 본문
 *    글자색에 투명도를 준 값이다(30% · 18% · 14% · 22%). 같은 투명도를 밤의 본문 글자색(한지)에
 *    적용해 `rgba(240,234,217,...)` 넷이 됐다. 값이 아니라 규칙을 옮긴 것이다.
 * 2. `onFill`·`onFillMuted` — 채운 단추 위의 글자는 그 면에서 가장 밝아야 하므로
 *    한지빛과 땅거미빛을 그대로 쓴다.
 * 3. `onAccentFill` — 밝은 치자 알 위에 적히는 알 번호다. 낮 벌이 어두운 알 위에
 *    밝은 글자를 얹었으니 밤에는 뒤집어 바탕빛을 얹는다.
 * 4. `accentWash` — 낮 벌이 치자(`#82600F`)를 6% 로 깐 값이다. 밤 치자(`#D9AE4C`)에 같은
 *    6% 를 주어 얻었다.
 * 5. `scrim` — 시트가 뜰 때의 그늘. 바탕보다 더 어두운 값이어야 해서 쪽빛을 더 낮춘
 *    `rgba(6,10,15,.60)` 을 쓴다.
 *
 * **KimDesigner 검수 대상이다.** 파생이 창작이 아니라 적용이었음을 보이려고 위 표를
 * 남겼다 — 검수는 이 표의 각 행을 문서와 대조하는 일로 끝난다.
 */
export const nightColors: ColorTokens = {
  ink: '#F0EAD9',
  inkMuted: '#8E93A3',
  inverse: '#10161F',
  background: '#10161F',
  accent: '#D9AE4C',
  rule: 'rgba(240,234,217,.10)',
  buttonBorder: 'rgba(240,234,217,.30)',
  accentFill: '#D9AE4C',
  surface: '#18202C',
  fill: '#222C3B',
  onFill: '#F0EAD9',
  onFillMuted: '#8E93A3',
  rowBorder: 'rgba(240,234,217,.18)',
  quietBorder: 'rgba(240,234,217,.14)',
  inputBorder: 'rgba(240,234,217,.22)',
  accentWash: 'rgba(217,174,76,.06)',
  scrim: 'rgba(6,10,15,.60)',
  beadDone: '#4A5262',
  onAccentFill: '#10161F',
};

/** 낮과 밤 두 벌의 이름. 설정의 `낮과 밤` 이 고르는 값이기도 하다. */
export type ThemeMode = 'day' | 'night';

/** 이름으로 색표를 고른다. */
export const colorsFor = (mode: ThemeMode): ColorTokens =>
  mode === 'night' ? nightColors : dayColors;

/**
 * 기본 색표 — 낮 벌.
 *
 * 화면은 이것을 직접 쓰지 않고 `useTheme()` 이 주는 색표를 쓴다(그래야 밤 벌이 돈다).
 * 이 이름이 남아 있는 것은 화면 밖에서 색이 필요한 곳(테스트·기본값) 때문이다.
 */
export const colors: ColorTokens = dayColors;

/** 번들에 넣은 글꼴의 이름. `assets/fonts/` 의 파일과 짝이다. */
export const fonts = {
  serif: 'NotoSerifKR-Regular',
  sans: 'NotoSansKR-Regular',
  sansMedium: 'NotoSansKR-Medium',
} as const;

/**
 * 서체 계단의 100% 기준값. 이름은 쓰임새로 붙였고 값은 v5 로그인 화면에서 그대로 가져왔다.
 * 화면은 이 표를 직접 쓰지 않고 아래에서 배율을 곱한 `type` 을 쓴다.
 */
const baseType = {
  /** 10.5px · 자간 .24em · 회색. 화면 맨 위의 작은 라벨 ("54일 기도"). */
  label: {
    fontFamily: fonts.sans,
    fontSize: 10.5,
    lineHeight: 10.5, // CSS: /1
    letterSpacing: 10.5 * 0.24, // CSS: .24em
  },
  /** 38px 명조. 화면의 큰 제목 ("묵주"). */
  title: {
    fontFamily: fonts.serif,
    fontSize: 38,
    lineHeight: 38 * 1.25, // CSS: /1.25
  },
  /** 13.5px · 줄 높이 1.8. 본문 두 줄. */
  body: {
    fontFamily: fonts.sans,
    fontSize: 13.5,
    lineHeight: 13.5 * 1.8, // CSS: /1.8
  },
  /** 15px 중간 굵기. 단추 글자. */
  button: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    lineHeight: 15, // CSS: /1
  },
  /** 12.5px. 눌러도 되지만 앞세우지 않는 글자. */
  tertiary: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 12.5, // CSS: /1
  },
  /** 11px · 줄 높이 1.7 · 회색. 각주. */
  footnote: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 11 * 1.7, // CSS: /1.7
  },

  /* ── 아래 여덟은 M1 이 더한 것이다. 값의 출처는 v5 의 기도 화면(`s-pray`)과
     하루 완주 화면(`s-dayDone`) 마크업이고, 위와 같은 방식으로 CSS 의 배수 줄 높이와
     em 자간을 픽셀로 환산했다. ─────────────────────────────────────────────── */

  /** 12.5px · 줄 높이 1.4. 기도 화면 머리의 지향 한 줄. */
  heading: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    lineHeight: 12.5 * 1.4,
  },
  /** 10.5px · 자간 .16em. 지금 어느 구간인가 — 전례색으로 칠하는 유일한 글자다. */
  stepLabel: {
    fontFamily: fonts.sans,
    fontSize: 10.5,
    lineHeight: 10.5,
    letterSpacing: 10.5 * 0.16,
  },
  /** 26px 명조 · 줄 높이 1.7. 기도문의 앞 절 — 앱이 읽는 부분. */
  prayerLead: {
    fontFamily: fonts.serif,
    fontSize: 26,
    lineHeight: 26 * 1.7,
  },
  /** 21px 명조 · 줄 높이 1.7. 기도문의 뒷 절 — 사용자가 받는 부분. */
  prayerResponse: {
    fontFamily: fonts.serif,
    fontSize: 21,
    lineHeight: 21 * 1.7,
  },
  /** 14px 중간 굵기. 아래 단추의 첫 줄. */
  buttonCompact: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    lineHeight: 14,
  },
  /** 11px. 단추 아래 덧붙는 한 줄, 리본 아래 요약 한 줄. */
  caption: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 11,
  },
  /** 34px 명조 · 줄 높이 1.35. 하루 완주의 큰 글. */
  display: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 34 * 1.35,
  },
  /** 13px · 줄 높이 1.7. 하루 완주의 설명 두 줄. */
  bodySmall: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 13 * 1.7,
  },
  /** 13px. 통계 줄의 이름. */
  statLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 13,
  },
  /** 13px 중간 굵기. 통계 줄의 값. */
  statValue: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    lineHeight: 13,
  },
} as const;

/**
 * 서체 계단 — 이 기기의 글자 배율을 곱한 값 (FR-28). React Native 의 `TextStyle` 에 그대로
 * 펼쳐 쓸 수 있는 모양이다.
 */
export const type = scaleTypeScale(baseType, TEXT_SCALE);

/** 치수. 화면마다 다시 적지 않도록 여기 모은다. */
export const metrics = {
  /**
   * 단추 한 줄의 높이. v5 가 그린 값이자 팀이 확정한 값이다.
   *
   * 한때 88 로 올리자는 안이 있었으나(`decisions.md` Q-06b) 그 88 은 iOS 의
   * 44pt 를 2배 화면의 기기 픽셀로 환산해 나온 숫자였다. 이 파일의 단위는
   * 기기 픽셀이 아니라 React Native 의 논리 단위(iOS 의 pt, Android 의 dp)이고,
   * 그 단위에서 iOS 권고는 44, Android 권고는 48 이므로 80 이 이미 둘 다 넘는다.
   * 그래서 Q-16 이 80 유지로 정리했다.
   */
  touchTargetHeight: 80,
  /** 화면 좌우 여백. */
  screenPadding: 24,
  /** 모서리를 굴리지 않는다. */
  radius: 0,
} as const;

/**
 * 전례색 슬롯의 낮 벌 값 (FR-25 · 06-design-system §2-3 · `decisions.md` Q-10).
 *
 * 디자인 시스템 §2-3 은 전례색 넷을 **밤 팔레트 값으로만** 적어 두었고(자색 `#7A6699` ·
 * 녹색 `#7E8B6B` · 백색 `#E4DED0` · 홍색 `#9E4A57`), v5 시안은 넷 중 자색 하나만
 * 실제로 썼다 — 기도 화면의 구간 라벨(`pr-step`)에 박힌 `#63507F` 가 그것이다.
 * 그래서 나머지 셋의 낮 값이 어디에도 없었고, 이 표가 그 자리를 채운다.
 *
 * **어림으로 고르지 않고 규칙 하나로 파생했다.** 밤 값의 색상(hue)과 채도를 그대로 두고,
 * 낮 바탕(`#EDE7D8`) 위에서 본문 대비 4.5:1 을 넘길 때까지 명도만 낮춘다. 자색이 실제로
 * 그렇게 만들어졌다 — 밤 자색은 낮 바탕에서 대비가 4.06:1 로 모자라고, v5 가 고른
 * `#63507F` 는 같은 색상 계열을 어둡게 해 5.70:1 을 얻은 값이다.
 *
 * 백색만 예외다. 밝은 한지 바탕 위에서는 어떤 명도로도 "백색"이 백색으로 읽히지 않으므로
 * **빛깔을 더하지 않고 먹빛을 쓴다.** 색을 하나 지어내는 것보다 정직하다.
 *
 * 파생한 셋(녹색·백색·홍색)은 KimDesigner 검수 대상이다 — `decisions.md` 결정 큐 참조.
 */
export const seasonColors = {
  /** 대림·사순. v5 가 기도 화면에 박아 둔 값 그대로다. 대비 5.70:1. */
  violet: '#63507F',
  /** 연중. 밤 녹색 `#7E8B6B` 의 색상·채도를 유지하고 명도만 낮췄다. 대비 4.75:1. */
  green: '#5F6850',
  /** 부활·성탄·성모 축일. 빛깔을 더하지 않는다 — 본문 먹빛. 대비 12.47:1. */
  white: dayColors.ink,
  /** 성령강림·수난·순교. 밤 홍색이 낮 바탕에서 이미 4.77:1 이라 그대로 쓴다. */
  red: '#9E4A57',
} as const;

/**
 * 전례색 슬롯의 **밤 벌** 값 (FR-25 · 06-design-system §2-3).
 *
 * 문서의 밤 팔레트 표를 그대로 옮기려 했으나, 옮기고 나서 대비를 재 보니 **넷 중 둘이
 * 본문 기준(4.5:1)에 미달했다** — 자색 `#7A6699` 가 3.62:1, 홍색 `#9E4A57` 가 3.09:1 이다
 * (쪽빛 바탕 `#10161F` 위, `tokens.test.ts` 가 실제로 계산한다). 문서가 그 값들을 정할 때
 * 상정한 쓰임은 "신비 표시 · 단 구분선 · 진행 테두리" 같은 면과 선인데, v5 는 이 슬롯을
 * **10.5px 짜리 작은 글자**(기도 화면의 구간 라벨)에 썼다. 면에서는 넉넉하던 값이 글자에서
 * 모자라게 된 것이다.
 *
 * 그래서 `decisions.md` Q-18 이 낮 벌에 쓴 규칙을 **방향만 뒤집어** 적용했다 — 색상과 채도를
 * 그대로 두고 명도만 4.5:1 을 넘길 때까지 올린다. 자색은 `#8C7AA6`(4.71:1), 홍색은
 * `#BA6B77`(4.72:1) 이 됐다. 녹색(5.01:1)과 백색(13.54:1)은 문서 값 그대로다.
 *
 * **KimDesigner 검수 대상이자 결정 큐 항목이다** — 문서의 값을 고친 것이 아니라 문서의 값이
 * 글자에 쓰일 때의 파생값을 따로 둔 것이므로, 06-design-system §2-3 에 이 사실을 적을지는
 * 사람이 정한다.
 */
export const nightSeasonColors = {
  /** 대림·사순. 문서 값 `#7A6699` 를 글자용으로 밝힌 값. */
  violet: '#8C7AA6',
  /** 연중 (쑥빛). 문서 값 그대로 — 이미 5.01:1 이다. */
  green: '#7E8B6B',
  /** 부활·성탄·성모 축일. 문서 값 그대로. */
  white: '#E4DED0',
  /** 성령강림·수난·순교. 문서 값 `#9E4A57` 을 글자용으로 밝힌 값. */
  red: '#BA6B77',
} as const;

/** 전례색 한 벌의 모양. 낮·밤 두 표가 같은 키를 갖는다. */
export type SeasonColors = Record<keyof typeof seasonColors, string>;

/** 이름으로 전례색 표를 고른다. */
export const seasonColorsFor = (mode: ThemeMode): SeasonColors =>
  mode === 'night' ? nightSeasonColors : seasonColors;

/**
 * M2 가 더한 서체 계단의 100% 기준값.
 *
 * 위의 `baseType` 과 같은 방식으로 v5 마크업에서 글자 그대로 옮겼고, 어느 화면의 어느
 * 자리에서 왔는지 항목마다 적었다. CSS 의 배수 줄 높이와 em 자간은 픽셀로 환산했다.
 */
const baseType2 = {
  /** 24px 명조 · 줄 높이 1.3. 홈 카드의 바람 한 줄 (`s-home` 의 카드 제목). */
  cardTitle: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 24 * 1.3 },
  /** 12px 중간 굵기 · 자간 .06em. 홈 카드의 `23일째 · 청원` (`j0-meta`). */
  cardMeta: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 12 * 0.06,
  },
  /** 12.5px · 줄 높이 1.6. 홈 카드의 오늘 자리 두 줄 (`j0-resume`). */
  cardResume: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 12.5 * 1.6 },
  /** 10.5px. 리본 아래의 시작·마침 날짜 (`s-home`). 자간이 없는 쪽이다. */
  micro: { fontFamily: fonts.sans, fontSize: 10.5, lineHeight: 10.5 },
  /** 10.5px · 자간 .2em. 구역 이름 (`무엇을 위하여` · `기도` · `보기` · `계정`). */
  sectionLabel: {
    fontFamily: fonts.sans,
    fontSize: 10.5,
    lineHeight: 10.5,
    letterSpacing: 10.5 * 0.2,
  },
  /** 11px. 머리의 `닫기` · `돌아가기`. */
  navLabel: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 11 },
  /** 11px · 자간 .1em. 홈 머리의 `설정` — v5 는 이 한 자리에만 자간을 준다. */
  navLabelWide: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 11,
    letterSpacing: 11 * 0.1,
  },
  /** 23px 명조 · 줄 높이 1.3. 새 기도의 바람 입력 (`new-intent`). */
  intent: { fontFamily: fonts.serif, fontSize: 23, lineHeight: 23 * 1.3 },
  /** 11px · 줄 높이 1.6. 구역 아래 덧붙는 한 줄. */
  noteSmall: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 11 * 1.6 },
  /** 11px · 줄 높이 1.5. 고르는 줄의 설명 (`앞은 소리가 읽고 뒤는 내가 받습니다`). */
  rowSub: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 11 * 1.5 },
  /** 14px. 설정 항목의 이름 — 굵기가 없는 쪽이다 (`s-settings`). */
  rowLabel: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 14 },
  /** 13px. 설정 항목의 현재 값 (`가톨릭 기도서 →`). */
  rowValue: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 13 },
  /** 28px 명조 · 줄 높이 1.35. 여정 상세의 바람 (`s-journey`). */
  detailTitle: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 28 * 1.35 },
  /** 36px 명조 · 줄 높이 1.3. 여정 완주의 큰 글 (`s-allDone`). */
  finishTitle: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 36 * 1.3 },
  /** 28px 명조 · 줄 높이 1.4. 초대 코드 화면의 제목 (`s-invite`). */
  inviteTitle: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 28 * 1.4 },
  /** 28px 중간 굵기. 초대 코드의 여섯 칸에 들어가는 글자. */
  codeCell: { fontFamily: fonts.sansMedium, fontSize: 28, lineHeight: 28 },
  /** 12px · 줄 높이 1.7. 입력칸 아래 안내 한 줄. */
  hint: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 12 * 1.7 },
  /** 22px 명조 · 줄 높이 1.35. 초대 코드의 미리보기 카드 제목. */
  previewTitle: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 22 * 1.35 },
  /** 12.5px · 줄 높이 1.7. 미리보기 카드의 본문. */
  previewBody: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 12.5 * 1.7 },
  /** 26px 명조 · 줄 높이 1.4. 시트의 제목 — v5 `s-assign` 의 큰 글에서 왔다. */
  sheetTitle: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 26 * 1.4 },
  /** 11.5px · 줄 높이 1.7. 시트 아래 각주 — v5 `s-assign` 의 마지막 줄에서 왔다. */
  sheetNote: { fontFamily: fonts.sans, fontSize: 11.5, lineHeight: 11.5 * 1.7 },
} as const;

/** M2 서체 계단 — 이 기기의 글자 배율을 곱한 값 (FR-28). */
export const type2 = scaleTypeScale(baseType2, TEXT_SCALE);

/**
 * M2 가 쓰는 치수 몇 가지. v5 마크업에서 옮긴 값이다.
 */
export const metrics2 = {
  /** 화면 위 여백. v5 의 모든 안쪽 화면이 56 이다. */
  screenTop: 56,
  /** 화면 아래 여백. */
  screenBottom: 26,
  /** 홈 카드의 성화 썸네일 — v5 의 96×124. */
  thumbWidth: 96,
  thumbHeight: 124,
  /** 홈의 리본 한 칸 높이. */
  ribbonHome: 22,
  /** 하루 완주의 리본 한 칸 높이. */
  ribbonDay: 26,
  /** 여정 완주의 리본 한 칸 높이. */
  ribbonAll: 30,
  /** 여정 상세 격자의 열 수와 간격. */
  gridColumns: 9,
  gridGap: 5,
} as const;

/** 54칸 리본·격자의 칸 색. v5 의 `FILL` 표 그대로다. */
export const dayCellFill = {
  prayed: '#82600F',
  missed: 'rgba(31,37,48,.10)',
  future: 'rgba(31,37,48,.10)',
  today: '#1F2530',
} as const;

/**
 * 리본·격자의 **밤 벌** 칸 색 — 파생이다.
 *
 * 낮 벌은 "바친 날 = 치자, 못 바친 날·앞으로 = 먹빛 10%, 오늘 = 먹빛"이다. 그 세 역할을
 * 밤 팔레트의 같은 역할로 옮겼다 — 치자는 밤 치자(`#D9AE4C`), 먹빛 10% 자리는 밤의
 * 괘선과 같은 한지 10%, 오늘은 그 벌에서 가장 밝은 본문색(한지)이다. 낮에서 오늘이
 * 가장 어두운 칸이었던 것과 뒤집히는데, 두 벌 모두 **오늘이 가장 대비가 센 칸**이라는
 * 규칙은 같다 (06-design-system §2-1 — 위계는 명도로 만든다).
 */
export const nightCellFill = {
  prayed: '#D9AE4C',
  missed: 'rgba(240,234,217,.10)',
  future: 'rgba(240,234,217,.10)',
  today: '#F0EAD9',
} as const;

export type CellFill = Record<keyof typeof dayCellFill, string>;

/** 이름으로 칸 색표를 고른다. */
export const cellFillFor = (mode: ThemeMode): CellFill =>
  mode === 'night' ? nightCellFill : dayCellFill;
