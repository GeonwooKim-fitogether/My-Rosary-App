/**
 * 「MyRosary World」 시안의 디자인 토큰 — 지역 다섯의 색 벌과 「Classical」 체계.
 *
 * **한지 벌(`tokens.ts` 의 `dayColors`·`nightColors`)을 대신하지 않고 나란히 선다.** 기존
 * 화면 여덟이 아직 한지 값으로 서 있고, 새 시안으로 옮기는 일은 W1 부터이기 때문이다
 * (`docs/plan/roadmap-world.md`). 그래서 파일을 따로 두어 두 벌이 섞이지 않게 했다.
 *
 * 값의 출처는 둘이다. 지역 다섯의 색 여섯은 `docs/design/world/data.js` 의 `REGIONS` 에서,
 * 간격·반지름·그림자·서체는 그 시안이 쓰는 디자인 체계
 * `docs/design/world/_ds/` 아래 `classical-…` 폴더의 `styles.css` 의 `:root` 선언에서 왔다. 둘 다
 * `tools/w0/extract-world-data.mjs` 가 기계로 뽑아 `spec/regions.world.json` 에 적어 둔
 * 것과 같은 값이며, **옮기는 사람이 고른 값은 하나도 없다.**
 */
import { TEXT_SCALE, scaleTypeScale } from './fontScale';
import { fonts } from './tokens';

/** 지역 다섯. 색 벌과 성화 묶음과 기본 언어가 이 이름으로 갈린다. */
export type RegionKey = 'europe' | 'northamerica' | 'southamerica' | 'asia' | 'korea';

/** 지역 하나의 색 여섯. 시안은 이 여섯으로 화면 전체를 칠한다. */
export interface WorldPalette {
  /** 바탕. 종이색이다. */
  paper: string;
  /** 본문 글자. */
  ink: string;
  /** 강조. 단추의 테와 작은 표시에 쓴다 — 면을 채우는 색이 아니다. */
  accent: string;
  /** 둘째 강조. 지우기처럼 되돌리기 어려운 조작에 쓴다. */
  accent2: string;
  /** 성화 위에 덮는 어두운 층. 기도 화면의 바탕이기도 하다. */
  scrim: string;
  /** 흐린 글자. 보조 설명과 날짜에 쓴다. */
  muted: string;
}

/**
 * 지역 다섯의 색 벌.
 *
 * 다섯이 같은 구조를 갖고 값만 다르므로, 화면은 지역을 모르고 이 여섯 이름만 안다.
 * 대비는 눈이 아니라 `worldTokens.test.ts` 가 다섯 벌 전부에 대해 계산해 지킨다.
 */
export const REGION_PALETTES: Readonly<Record<RegionKey, WorldPalette>> = {
  europe: {
    paper: '#f4efe4',
    ink: '#1c2333',
    accent: '#b68235',
    accent2: '#6e2a35',
    scrim: '#141a2a',
    muted: '#6b6a66',
  },
  northamerica: {
    paper: '#f2f3f4',
    ink: '#14233a',
    accent: '#c19a4f',
    accent2: '#5a6b7d',
    scrim: '#0f1a2b',
    muted: '#66707c',
  },
  southamerica: {
    paper: '#f7efe2',
    ink: '#1f3a2e',
    accent: '#c98f2b',
    accent2: '#b4553a',
    scrim: '#1c2a24',
    muted: '#6d6558',
  },
  asia: {
    paper: '#f5f2ec',
    ink: '#23272a',
    accent: '#b9a06a',
    accent2: '#4f7f6f',
    scrim: '#1b1f22',
    muted: '#6a6c6a',
  },
  korea: {
    paper: '#f3ede2',
    ink: '#2a2622',
    accent: '#b68235',
    accent2: '#2f4a7a',
    scrim: '#1e1b18',
    muted: '#6b645a',
  },
};

/** 지역의 차례. 지역 고르기 화면이 이 순서로 보여 준다. */
export const REGION_ORDER: readonly RegionKey[] = [
  'europe',
  'northamerica',
  'southamerica',
  'asia',
  'korea',
];

/** 이름으로 색 벌을 고른다. */
export const paletteFor = (region: RegionKey): WorldPalette => REGION_PALETTES[region];

/**
 * 기도 화면처럼 어두운 층 위에 글자를 얹는 자리의 색.
 *
 * 시안은 성화 위에 그 지역의 `scrim` 을 덮고 그 위에 밝은 글자를 얹는다. 이 값들은
 * 지역에 따라 달라지지 않는 것들이라 한 곳에 모았다 — 시안의 기도 화면 마크업에서
 * 글자 그대로 왔다.
 */
export const onScrim = {
  /** 기도문과 제목. */
  ink: '#f4ecdc',
  /** 강조 — 단의 이름, 성모송 수, 다음 단추의 테. */
  accent: '#e9c877',
  /** 지금 알의 빛무리. */
  glow: '#f2c96a',
  /** 지금 알 자신. */
  bead: '#fff6dc',
  /** 지금 알을 두르는 테 — 숨을 쉬는 것이 이 테다 (시안의 `stroke="#fff1c9"`). */
  beadRing: '#fff1c9',
  /** 지금 알의 가장자리 (시안의 `stroke="#fff"`). */
  beadEdge: '#ffffff',
  /** 바친 알. */
  beadDone: '#d6b25e',
  /** 아직 바치지 않은 알의 테. */
  beadPending: 'rgba(255,255,255,.72)',
} as const;

/**
 * 지금 차례가 아닌 절이 물러나는 정도 (`docs/plan/roadmap-world.md` §3 의 카드 E).
 *
 * 시안은 기도문을 한 덩어리로 보여 주지만 이 앱은 앞 절(앱이 읽는다)과 뒷 절(사용자가
 * 받는다)로 나뉜다. 두 절을 위아래로 두고 **지금 차례가 아닌 쪽을 흐리게** 하면, 한 덩어리
 * 라는 인상을 지키면서 교대가 보인다.
 *
 * 값을 0.72 로 잡은 이유가 둘이다. 첫째, 시안이 **물러난 글**에 쓰는 값이 그것이다
 * (기도문 아래의 묵상 노트가 `opacity:.72`). 둘째, 더 흐리게 하면 글자가 읽을 수 없어진다 —
 * 0.45 로 두었더니 지역 다섯의 덮개 위에서 본문 대비가 3.77:1 까지 떨어져 디자인 시스템 §7
 * 의 본문 기준(4.5:1)을 밑돌았다. 0.72 에서는 앞 절이 7.30:1, 뒷 절이 5.51:1 이다.
 * 이 계산은 `worldTokens.test.ts` 가 다섯 벌 전부에 대해 매번 다시 한다.
 */
export const OFF_TURN_OPACITY = 0.72;

/**
 * 간격. 「Classical」 은 1.15 배 계단을 쓰며, 그래서 값이 정수가 아니다.
 * 소수를 그대로 두는 이유는 반올림하면 계단의 비율이 깨지기 때문이다.
 */
export const worldSpace = {
  s1: 4.6,
  s2: 9.2,
  s3: 13.8,
  s4: 18.4,
  s6: 27.6,
  s8: 36.8,
} as const;

/** 모서리. 「Classical」 은 거의 각진 체계라 값이 작다. */
export const worldRadius = {
  sm: 2,
  md: 4,
  lg: 7,
} as const;

/**
 * 그림자 셋. CSS 의 `--shadow-*` 를 React Native 의 그림자 속성으로 옮긴 것이다.
 * 색과 짙기와 흐림 반경은 그대로이고, 안드로이드가 쓰는 `elevation` 만 세 단계로 더했다.
 */
export const worldShadow = {
  sm: { shadowColor: '#2d2b2b', shadowOpacity: 0.14, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  md: { shadowColor: '#2d2b2b', shadowOpacity: 0.16, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  lg: { shadowColor: '#2d2b2b', shadowOpacity: 0.22, shadowRadius: 32, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
} as const;

/**
 * 글꼴 이름. `assets/fonts/` 의 파일과 짝이며 `app/_layout.tsx` 가 같은 이름으로 싣는다.
 *
 * 시안은 제목에 Cormorant Garamond, 본문에 Lora 를 쓰고 한글은 Noto Serif KR 로 받는다.
 * 라틴 글꼴 둘은 한글 글리프가 없으므로 **한국어 화면에서는 한글 글꼴이 앞에 와야 한다** —
 * 그 순서를 여기서 정해 두고 화면은 `worldFontStack` 만 쓴다.
 */
export const worldFonts = {
  /** 제목용 라틴 — 기본 굵기(400). */
  heading: 'CormorantGaramond-Regular',
  /** 제목용 라틴 — 굵게(600). 「Classical」 이 제목에 허용한 가장 굵은 단계다. */
  headingBold: 'CormorantGaramond-SemiBold',
  /** 본문용 라틴(400). */
  body: 'Lora-Regular',
  /** 본문용 라틴 — 굵게(600). */
  bodyBold: 'Lora-SemiBold',
  /** 한글. 이미 번들에 있던 것을 그대로 쓴다. */
  korean: 'NotoSerifKR-Regular',
} as const;

/**
 * 굵기가 둘뿐인 이유. 시안이 부르는 글꼴은 400 과 600 둘이고(`styles.css` 의 `@import`),
 * 화면 마크업이 더러 쓰는 `font-weight:500` 은 브라우저에서 400 으로 떨어진다. 그래서
 * 실제로 쓰이는 굵기만 번들에 넣었다 — 한글 글꼴 하나가 14MB 라 라틴까지 다 넣으면
 * 앱이 무거워진다.
 */

/** 언어에 맞는 글꼴 이름을 고른다. 한국어면 한글 글꼴, 그 밖에는 라틴 글꼴이다. */
export function worldFontStack(role: 'heading' | 'body', isKorean: boolean): string {
  if (isKorean) return worldFonts.korean;
  return role === 'heading' ? worldFonts.heading : worldFonts.body;
}

/**
 * 「Classical」 의 기본 서체 계단 (`styles.css` 의 `h1`~`h6` 와 본문).
 *
 * **화면의 값이 이것보다 우선한다.** 시안은 화면마다 크기를 인라인으로 정해 두었고
 * (예: 홈의 제목은 `clamp(34px, 10vw, 44px)`), 그 값이 그 화면의 정본이다. 이 계단은
 * 시안이 값을 정하지 않은 자리의 기본값이자, 화면들이 어떤 비율 위에 서 있는지를
 * 읽기 위한 것이다.
 */
export const worldType = {
  h1: { fontSize: 42, lineHeight: 42 * 1.12, letterSpacing: 42 * -0.015 },
  h2: { fontSize: 32, lineHeight: 32 * 1.12, letterSpacing: 32 * -0.015 },
  h3: { fontSize: 25, lineHeight: 25 * 1.12, letterSpacing: 25 * -0.015 },
  h4: { fontSize: 20, lineHeight: 20 * 1.12, letterSpacing: 20 * -0.015 },
  h5: { fontSize: 16, lineHeight: 16 * 1.12, letterSpacing: 16 * -0.015 },
  h6: { fontSize: 13, lineHeight: 13 * 1.12, letterSpacing: 13 * 0.08 },
  body: { fontSize: 15, lineHeight: 15 * 1.55, letterSpacing: 0 },
} as const;

/**
 * 기도 화면(W1)의 서체 — 「MyRosary World」 시안의 `data-screen-label="Prayer"` 블록에
 * 인라인으로 적혀 있던 크기와 자간을 그대로 옮긴 것이다.
 *
 * **위의 `worldType` 과 갈라 둔 이유.** `worldType` 은 디자인 체계가 정한 기본 계단이고,
 * 이것은 **그 화면이 직접 정한 값**이다. 시안은 화면마다 크기를 인라인으로 정해 두었고 그
 * 값이 그 화면의 정본이므로(위 `worldType` 의 주석), 화면의 값은 화면 이름으로 모은다.
 *
 * **여기 없는 것 셋도 적어 둔다.** 구간 이름(`pray-step`)과 기도문의 앞 절·뒷 절은 이
 * 저장소의 서체 계단(`type.stepLabel` · `type.prayerLead` · `type.prayerResponse`)을 그대로
 * 쓴다. 시안의 값(기도문 20px)으로 옮기는 일은 앱 안 글자 크기 넷과 함께 해야 하는데
 * (`docs/plan/w1-work-order.md` §3-5), 그것은 다음 슬라이스의 일이기 때문이다.
 *
 * 라틴 글꼴 대신 한글 글꼴을 쓰는 자리가 있다. 시안의 제목 글꼴(Cormorant Garamond)에는
 * 한글 글리프가 없어 `성모송` 같은 제목이 네모로 나온다. 그래서 제목은 이 저장소의
 * 한글 명조를 쓴다 — `worldFontStack('heading', true)` 가 고르는 것과 같은 글꼴이다.
 */
export const worldPrayType = scaleTypeScale(
  {
    /** 12px · 자간 .12em. 머리 가운데의 첫 줄 (시안의 `prayHeader`). */
    header: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.25,
      letterSpacing: 12 * 0.12,
    },
    /** 11px. 머리의 `n / 81` (시안의 `stepLabel`). */
    count: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 11 * 1.25 },
    /** 22px 명조. 기도문의 제목 (시안의 `prayerTitle`). */
    title: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 22 * 1.25 },
    /** 13px · 자간 .06em. 제목 옆의 세는 줄 (시안의 `prayerCounter`). */
    counter: {
      fontFamily: fonts.sans,
      fontSize: 13,
      lineHeight: 13 * 1.25,
      letterSpacing: 13 * 0.06,
    },
    /** 13px · 줄 높이 1.5. 지금 단의 신비 한 줄 (시안의 `mysteryLine`). */
    mystery: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 13 * 1.5 },
    /** 13.5px. 앞·뒤 단추의 글자 (시안의 `prevName` · `nextName`). */
    button: { fontFamily: fonts.sans, fontSize: 13.5, lineHeight: 13.5 * 1.25 },
    /** 11px · 자간 .06em · 줄 높이 1.3. 맨 아래 안내 한 줄 (시안의 `hintText`). */
    hint: {
      fontFamily: fonts.sans,
      fontSize: 11,
      lineHeight: 11 * 1.3,
      letterSpacing: 11 * 0.06,
    },
  },
  TEXT_SCALE,
);
