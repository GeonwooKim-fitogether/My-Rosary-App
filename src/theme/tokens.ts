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
