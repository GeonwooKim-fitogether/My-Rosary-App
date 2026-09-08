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
 * **밤 벌은 아직 없다.** v5 가 낮 벌만 그렸기 때문이며, 만드는 방식은 `decisions.md`
 * Q-14 가 M2 로 정해 두었다. 그래서 색을 화면에 직접 쓰지 않고 반드시 이름으로 쓴다 —
 * 나중에 색표 한 벌을 더 끼워 넣으면 화면을 고치지 않고 밤 벌을 받을 수 있게 하려는 것이다.
 */

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
};

/** 지금 쓰는 색표. M0 에서는 낮 벌 하나뿐이다. */
export const colors: ColorTokens = dayColors;

/** 번들에 넣은 글꼴의 이름. `assets/fonts/` 의 파일과 짝이다. */
export const fonts = {
  serif: 'NotoSerifKR-Regular',
  sans: 'NotoSansKR-Regular',
  sansMedium: 'NotoSansKR-Medium',
} as const;

/**
 * 서체 계단. 이름은 쓰임새로 붙였고 값은 v5 로그인 화면에서 그대로 가져왔다.
 * React Native 의 `TextStyle` 에 그대로 펼쳐 쓸 수 있는 모양이다.
 */
export const type = {
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
