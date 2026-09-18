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
 *
 * **예외가 2026-09-18 에 하나 생겼다 — 일곱 번째 색 `accentText`.** 시안의 색표에 없고
 * 이 저장소가 시안의 `accent` 에서 파생한 값이며, 왜 파생해야 했는지는 아래
 * `WorldPalette.accentText` 의 설명에 전부 적어 두었다(`decisions.md` Q-51). 파생한 값은
 * 이 하나뿐이고, 나머지 여섯은 여전히 시안에서 글자 그대로 왔다.
 */
import { Platform } from 'react-native';
import { TEXT_SCALE, scaleTypeScale } from './fontScale';
import { fonts } from './tokens';

/** 지역 다섯. 색 벌과 성화 묶음과 기본 언어가 이 이름으로 갈린다. */
export type RegionKey = 'europe' | 'northamerica' | 'southamerica' | 'asia' | 'korea';

/**
 * 지역 하나의 색 일곱 — 시안에서 온 여섯과, 이 저장소가 파생한 `accentText` 하나.
 * 시안은 여섯으로 화면 전체를 칠하고, 일곱째는 그중 강조색이 글자로 쓰일 때를 위한 짙은 짝이다.
 */
export interface WorldPalette {
  /** 바탕. 종이색이다. */
  paper: string;
  /** 본문 글자. */
  ink: string;
  /** 강조. 단추의 테와 작은 표시에 쓴다 — 면을 채우는 색이 아니다. */
  accent: string;
  /**
   * **밝은 종이 위의 글자에 쓰는 강조색** (`decisions.md` Q-51 · `docs/plan/w2-work-order.md` §1).
   *
   * 이 하나만 시안의 색표에서 그대로 오지 않고 **파생됐다.** 왜 파생해야 했는지를 적어 둔다.
   * 시안은 위의 `accent` 를 12px 라벨과 13px 링크 같은 작은 글자에 쓰는데, 그 색은 다섯 지역
   * 전부에서 종이색과의 대비가 2.26~2.94 에 그쳐 본문 기준 4.5:1 은 물론 그림 요소 기준
   * 3:1 에도 닿지 않는다. 그런데 「Classical」 디자인 체계의 설명문 자신이 "강조와 바탕의
   * 짝은 3:1 로 맞췄으니 **본문 크기 글자에는 더 짙은 단계를 쓰라**"고 적어 두었다. 즉 이것은
   * 우리가 시안을 뒤집는 것이 아니라, **시안이 자기 체계의 규칙을 화면에서 지키지 않은 자리**를
   * 그 체계의 규칙대로 되돌리는 일이다.
   *
   * 파생 규칙은 이 저장소가 전례색에서 이미 쓴 것과 같다(Q-18) — **색상과 채도는 그대로 두고
   * 명도만 4.5:1 을 넘길 때까지 낮춘다.** 그래서 지역의 얼굴(따뜻한 금빛·모래빛)은 그대로이고
   * 글자만 읽히게 된다. 계산된 값 다섯은 아래 표에 있고, 그 값이 실제로 4.5:1 을 넘는지는
   * `worldTokens.test.ts` 가 매번 다시 계산한다.
   *
   * **어디에 무엇을 쓰나.** 둘을 가르는 기준은 글자인가 아닌가이다.
   *
   * | 이 색(`accentText`)을 쓰는 자리 | `accent` 를 그대로 쓰는 자리 |
   * |---|---|
   * | 밝은 종이 위의 모든 글자 — 작은 라벨, 링크, 여정 줄의 날짜 수, 설정의 고른 값 | 글자가 아닌 것 — 진행선의 채워진 부분, 테두리, 켜진 토글의 바탕 |
   * | | 어두운 덮개 위의 글자 (그 자리는 `onScrim.accent` 가 따로 있다) |
   */
  accentText: string;
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
 * 다섯이 같은 구조를 갖고 값만 다르므로, 화면은 지역을 모르고 이 일곱 이름만 안다.
 * 대비는 눈이 아니라 `worldTokens.test.ts` 가 다섯 벌 전부에 대해 계산해 지킨다.
 */
export const REGION_PALETTES: Readonly<Record<RegionKey, WorldPalette>> = {
  europe: {
    paper: '#f4efe4',
    ink: '#1c2333',
    accent: '#b68235',
    accentText: '#8e6529', // europe 위에서 4.53:1
    accent2: '#6e2a35',
    scrim: '#141a2a',
    muted: '#6b6a66',
  },
  northamerica: {
    paper: '#f2f3f4',
    ink: '#14233a',
    accent: '#c19a4f',
    accentText: '#886a30', // northamerica 위에서 4.55:1
    accent2: '#5a6b7d',
    scrim: '#0f1a2b',
    muted: '#66707c',
  },
  southamerica: {
    paper: '#f7efe2',
    ink: '#1f3a2e',
    accent: '#c98f2b',
    accentText: '#8f661f', // southamerica 위에서 4.50:1
    accent2: '#b4553a',
    scrim: '#1c2a24',
    muted: '#6d6558',
  },
  asia: {
    paper: '#f5f2ec',
    ink: '#23272a',
    accent: '#b9a06a',
    accentText: '#826c3d', // asia 위에서 4.52:1
    accent2: '#4f7f6f',
    scrim: '#1b1f22',
    muted: '#6a6c6a',
  },
  korea: {
    paper: '#f3ede2',
    ink: '#2a2622',
    accent: '#b68235',
    accentText: '#8c6429', // korea 위에서 4.54:1
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
 * 지역에 따라 달라지지 않는 것들이라 한 곳에 모았다 — 시안의 기도 화면과 하루 완주
 * 화면 마크업에서 글자 그대로 왔다.
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
  /** 강조 테를 두른 단추의 글자 — 하루 완주의 `홈으로` (시안의 `color:#fff3d3`). */
  buttonInk: '#fff3d3',
  /** 강조가 아닌 단추의 테 (시안의 `border:1px solid rgba(255,255,255,.35)`). */
  quietBorder: 'rgba(255,255,255,.35)',
  /** 괘선 — 숫자 줄 위의 가는 선 (시안의 `border-top:1px solid rgba(255,255,255,.2)`). */
  rule: 'rgba(255,255,255,.2)',
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
 * **여기 없는 것 둘도 적어 둔다.** 첫째, 구간 이름(`pray-step`)은 이 저장소의 서체 계단
 * (`type.stepLabel`)을 그대로 쓴다 — 시안의 같은 자리와 크기가 가깝고, 전례색을 입히는
 * 유일한 글자라 계단 쪽이 정본이다. 둘째, **기도문의 크기는 고정값이 아니라서** 여기 없다.
 * 사람이 화면에서 넷 중 고르는 값이고(`docs/plan/w1-work-order.md` §3-5), 그 넷과 기기
 * 배율의 관계는 `src/theme/prayerFont.ts` 가 정한다.
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
    /** 20px 명조. 머리 오른쪽의 `Aa` 단추 (시안의 `cycleFont` 단추). */
    fontButton: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 20 * 1.25 },
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

/**
 * 하루 완주 화면(W1 §3-6)의 서체 — 시안의 `data-screen-label="Complete"` 블록에 인라인으로
 * 적혀 있던 크기와 자간을 그대로 옮긴 것이다. 기도 화면의 `worldPrayType` 과 같은 이유로
 * 화면 이름으로 모았다 — 시안은 화면마다 크기를 직접 정하고, 그 값이 그 화면의 정본이다.
 *
 * **큰 제목만 여기 없다.** 시안이 `clamp(32px, 9vw, 42px)` 로 적어 화면 너비에 따라 달라지기
 * 때문이며, 화면이 너비를 재서 계산한다(`app/day-done.tsx` 의 `titleSizeFor`).
 *
 * 제목 글꼴 자리에 한글 명조를 쓰는 것도 기도 화면과 같다 — 시안의 라틴 제목 글꼴
 * (Cormorant Garamond)에는 한글 글리프가 없어 `오늘의 묵주기도를 마쳤습니다` 가 네모로 나온다.
 */
export const worldDoneType = scaleTypeScale(
  {
    /** 12px · 자간 .14em. 맨 위의 작은 라벨 (시안의 `doneSetName`). */
    label: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.25,
      letterSpacing: 12 * 0.14,
    },
    /** 15px. 괘선 위의 숫자 줄 (시안의 `doneHail` · `doneMinutes`). */
    stat: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 15 * 1.25 },
    /** 14px. 여정 줄 (시안의 `journeyLine` · `journeyDay`). */
    journey: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 14 * 1.4 },
    /** 19px 명조. 강조 단추의 글자 (시안의 `t.toHome`). */
    button: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 19 * 1.25 },
    /** 14px. 조용한 단추의 글자 (시안의 `pinDoneLabel`). */
    quietButton: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 14 * 1.25 },
  },
  TEXT_SCALE,
);

/** 하루 완주의 큰 제목 크기 — 시안의 `clamp(32px, 9vw, 42px)`. */
export function doneTitleSizeFor(width: number): number {
  return Math.min(42, Math.max(32, width * 0.09));
}

/**
 * 홈 화면(W2 §2 슬라이스 A)의 서체 — 시안의 `data-screen-label="Home"` 블록에 인라인으로
 * 적혀 있던 크기와 자간을 그대로 옮긴 것이다. 기도 화면의 `worldPrayType`, 하루 완주의
 * `worldDoneType` 과 같은 이유로 화면 이름으로 모았다 — 시안은 화면마다 크기를 직접 정하고,
 * 그 값이 그 화면의 정본이다.
 *
 * **여기 없는 것 하나.** 큰 제목(오늘의 신비 이름)의 크기는 시안이 `clamp(34px, 10vw, 44px)`
 * 로 적어 화면 너비에 따라 달라지므로 고정값이 아니다. 아래 `homeTitleSizeFor` 가 그 식을 쓴다.
 *
 * 제목 자리에 한글 명조를 쓰는 것은 기도 화면·하루 완주와 같은 이유다. 시안의 제목 글꼴
 * (Cormorant Garamond)에는 한글 글리프가 없어 `환희의 신비` 가 네모로 나온다.
 */
export const worldHomeType = scaleTypeScale(
  {
    /**
     * 13px · 자간 .18em · 대문자. 성화 위 왼쪽의 앱 이름 (시안의 `t.appName`).
     * 시안이 이 자리에 제목용 라틴 글꼴을 쓰고, 앱 이름은 어느 언어에서나 라틴이라 그대로 쓴다.
     */
    brand: {
      fontFamily: worldFonts.heading,
      fontSize: 13,
      lineHeight: 13 * 1.25,
      letterSpacing: 13 * 0.18,
    },
    /** 12px · 자간 .08em. 성화 위 오른쪽의 지역 표시 (시안의 `regionShort`). */
    region: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.25,
      letterSpacing: 12 * 0.08,
    },
    /** 12px · 자간 .14em. 큰 제목 위의 작은 라벨 (시안의 `t.today · todayLabel`). */
    todayLabel: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.25,
      letterSpacing: 12 * 0.14,
    },
    /** 15px · 줄 높이 1.6. 오늘 신비의 첫 단 한 줄 (시안의 `todayFirstMystery`). */
    todayFirst: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 15 * 1.6 },
    /** 19px 명조 · 자간 .01em. 주 단추의 글자 (시안의 `primaryLabel`). */
    primary: {
      fontFamily: fonts.serif,
      fontSize: 19,
      lineHeight: 19 * 1.25,
      letterSpacing: 19 * 0.01,
    },
    /**
     * 14px 명조. 둘째 단추(`새 기도`)의 글자.
     *
     * 시안의 홈에는 이 단추가 없으므로 값을 화면에서 가져올 수 없다. 대신 「Classical」
     * 체계가 정한 단추의 기본값(`styles.css` 의 `.btn` — 제목 글꼴 14px, 줄 높이 1.2)을
     * 그대로 쓴다. 테두리 색만 `.btn-secondary` 를 따라 괘선 색이다.
     */
    secondary: { fontFamily: fonts.serif, fontSize: 14, lineHeight: 14 * 1.2 },
    /**
     * 13px · 자간 .04em. 오늘의 신비 화면으로 가는 링크 (시안의 `goMystery` 단추).
     * 시안은 이 자리에 `신비 해설 →` 이라 적고 오늘의 신비 화면으로 보낸다 — 글자만
     * 가는 곳의 이름으로 바로잡았고 크기·자간·밑줄은 시안 그대로다 (`app/home.tsx` 머리 5).
     */
    todayLink: {
      fontFamily: fonts.sans,
      fontSize: 13,
      lineHeight: 13 * 1.3,
      letterSpacing: 13 * 0.04,
    },
    /** 12.5px. 진행선 옆의 자리 표시와 `다시 바치기` (시안의 `sessionWhere` · `t.again`). */
    session: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 12.5 * 1.3 },
    /** 11.5px · 자간 .12em. 여정 목록 위의 작은 라벨 (시안의 `t.journeys`). */
    listLabel: {
      fontFamily: fonts.sans,
      fontSize: 11.5,
      lineHeight: 11.5 * 1.25,
      letterSpacing: 11.5 * 0.12,
    },
    /** 14.5px · 줄 높이 1.35. 여정 줄의 바람 한 줄 (시안의 `hj.intention`). */
    rowTitle: { fontFamily: fonts.sans, fontSize: 14.5, lineHeight: 14.5 * 1.35 },
    /** 11.5px. 여정 줄의 상태 (시안의 `hj.state`). */
    rowState: { fontFamily: fonts.sans, fontSize: 11.5, lineHeight: 11.5 * 1.4 },
    /** 12px · 자간 .06em. 여정 줄 오른쪽의 며칠째 (시안의 `hj.day`). */
    rowDay: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.25,
      letterSpacing: 12 * 0.06,
    },
  },
  TEXT_SCALE,
);

/**
 * 홈 큰 제목의 크기 — 시안의 `clamp(34px, 10vw, 44px)`.
 * 하루 완주의 `doneTitleSizeFor` 와 같은 모양이며, 계수만 그 화면의 값이다.
 */
export function homeTitleSizeFor(width: number): number {
  return Math.min(44, Math.max(34, width * 0.1));
}

/**
 * 성화 큰 그림의 높이 — 시안의 `min(52dvh, 470px)`.
 * `dvh` 는 브라우저 주소창을 뺀 실제 화면 높이라, React Native 에서는 창 높이가 그 값이다.
 */
export function homeArtHeightFor(windowHeight: number): number {
  return Math.min(470, windowHeight * 0.52);
}

/**
 * 한국어 제목이 낱말 가운데에서 끊기지 않게 하는 스타일 — **웹에서만 쓰인다.**
 *
 * 브라우저는 한국어를 낱말이 아니라 **글자 단위로** 끊으므로, 그냥 두면 큰 제목이
 * `예수님께서 우리를 위하여 십자 / 가 지심` 처럼 갈라진다. `keep-all` 은 띄어쓰기에서만
 * 끊으라는 뜻이고, iOS·안드로이드는 원래 그렇게 끊으므로 웹에만 준다.
 *
 * **왜 화면마다 적지 않고 여기 두나.** 같은 결함을 2026-09-18 에 하루 완주 화면에서 한 번
 * 고쳤는데, 신비 해설 화면이 서면서 같은 자리에서 다시 났다. 화면이 늘 때마다 되풀이될
 * 성질이므로 고치는 자리를 하나로 모은다 — 새 화면을 만드는 사람은 제목에 이것을 펴 넣기만
 * 하면 된다.
 *
 * 시안은 같은 일을 `text-wrap: balance` 로 하는데 React Native 에는 그 속성이 없다.
 */
export const koWordBreak = Platform.select({
  web: { wordBreak: 'keep-all' as const },
  default: {},
});

/**
 * 오늘의 신비 화면(W2 슬라이스 B)의 서체 — 시안의 `data-screen-label="Today's Mystery"`
 * 블록에 인라인으로 적혀 있던 크기와 자간을 그대로 옮긴 것이다. 기도 화면의 `worldPrayType`,
 * 홈의 `worldHomeType` 과 같은 이유로 화면 이름으로 모았다.
 *
 * **여기 없는 것 하나.** 큰 제목(신비 이름)의 크기는 시안이 `clamp(32px, 9vw, 42px)` 로 적어
 * 화면 너비에 따라 달라지므로 고정값이 아니다. 아래 `mysteryTitleSizeFor` 가 그 식을 쓴다.
 */
export const worldMysteryType = scaleTypeScale(
  {
    /** 12px · 자간 .14em. 머리의 작은 라벨 (시안의 `t.today`). */
    label: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.25,
      letterSpacing: 12 * 0.14,
    },
    /** 13px. 큰 제목 아래의 날짜 한 줄 (시안의 `todayLabel`). */
    date: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 13 * 1.4 },
    /** 24px 명조. 줄 왼쪽의 단 번호 (시안의 `m.n`). */
    rowNumber: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 24 },
    /** 16px · 줄 높이 1.45. 단의 제목 (시안의 `m.title`). */
    rowTitle: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 16 * 1.45 },
    /** 12px. 단 아래의 성경 구절 (시안의 `m.ref`). */
    rowRef: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 12 * 1.35 },
    /**
     * 13px · 자간 .04em. 신비 해설로 가는 링크.
     *
     * 시안의 이 화면에는 그 링크가 없다(시안에서 해설 화면은 아무 데서도 닿지 않는다).
     * 값은 시안이 **홈에서 같은 성격의 링크**에 쓴 것을 그대로 가져왔다 — `font-size:13px;
     * letter-spacing:.04em;text-decoration:underline;min-height:44px`.
     */
    link: {
      fontFamily: fonts.sans,
      fontSize: 13,
      lineHeight: 13 * 1.3,
      letterSpacing: 13 * 0.04,
    },
    /** 19px 명조. 맨 아래 주 단추의 글자 (시안의 `primaryLabel`). */
    primary: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 19 * 1.25 },
  },
  TEXT_SCALE,
);

/** 오늘의 신비 큰 제목의 크기 — 시안의 `clamp(32px, 9vw, 42px)`. */
export function mysteryTitleSizeFor(width: number): number {
  return Math.min(42, Math.max(32, width * 0.09));
}

/**
 * 신비 해설 화면(W2 슬라이스 B)의 서체 — 시안의 `data-screen-label="Mysteries Guide"`
 * 블록에 인라인으로 적혀 있던 크기와 자간을 그대로 옮긴 것이다.
 *
 * 큰 제목은 시안이 `clamp(30px, 8vw, 38px)` 로 적어 아래 `guideTitleSizeFor` 가 계산한다.
 */
export const worldGuideType = scaleTypeScale(
  {
    /** 12px · 자간 .14em. 머리의 작은 라벨 (시안의 `t.mysteryGuide`). */
    label: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.25,
      letterSpacing: 12 * 0.14,
    },
    /** 12px · 줄 높이 1.2. 네 벌을 고르는 칸의 글자 (시안의 `s.short`). */
    tab: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 12 * 1.2 },
    /** 28px 명조. 줄 왼쪽의 단 번호 (시안의 `m.n`). */
    rowNumber: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 28 },
    /** 21px 명조 · 줄 높이 1.25. 단의 제목 (시안의 `m.title`). */
    rowTitle: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 21 * 1.25 },
    /** 12px · 자간 .06em. `성경 · Lk 1:26-38` 한 줄 (시안의 `t.scripture · m.ref`). */
    rowRef: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.35,
      letterSpacing: 12 * 0.06,
    },
    /** 15px · 줄 높이 1.6. 해설 한 문단 (시안의 `m.note`). */
    rowNote: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 15 * 1.6 },
    /** 17px 명조. 맨 아래 주 단추의 글자 (시안의 `t.prayThis`). */
    primary: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 17 * 1.25 },
  },
  TEXT_SCALE,
);

/** 신비 해설 큰 제목의 크기 — 시안의 `clamp(30px, 8vw, 38px)`. */
export function guideTitleSizeFor(width: number): number {
  return Math.min(38, Math.max(30, width * 0.08));
}

/**
 * 바텀 시트 일곱의 서체 (W2 §3 · `decisions.md` Q-56).
 *
 * **시안에는 시트가 한 장도 없다.** 그래서 이 계단은 시안의 시트에서 옮겨 온 것이 아니라,
 * 시안이 **화면들에서 같은 성격의 자리에 이미 쓰고 있는 값**을 모아 온 것이다. 어느 자리에서
 * 가져왔는지를 칸마다 적어 두어, 나중에 보는 사람이 "이 값은 어디서 왔나"를 되묻지 않게 한다.
 * 파생이 창작이 아니라 적용이었음을 보이는 방식은 이 저장소가 M2 에서 시트를 처음 세울 때
 * 쓴 것과 같다(`src/ui/Sheet.tsx` 머리의 표).
 */
export const worldSheetType = scaleTypeScale(
  {
    /** 12px · 자간 .14em. 시트 머리의 라벨 — 시안이 화면 머리마다 쓰는 작은 라벨과 같다. */
    label: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.25,
      letterSpacing: 12 * 0.14,
    },
    /** 13px · 자간 .04em. 머리 오른쪽의 `닫기` — 시안이 홈의 링크에 쓰는 값이다. */
    action: {
      fontFamily: fonts.sans,
      fontSize: 13,
      lineHeight: 13 * 1.3,
      letterSpacing: 13 * 0.04,
    },
    /** 15px · 줄 높이 1.6. 확인 시트의 묻는 문장 — 시안의 본문 문단 값이다. */
    message: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 15 * 1.6 },
    /** 16px · 줄 높이 1.45. 고르는 줄의 이름 — 시안의 목록 줄 제목 값이다. */
    rowName: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 16 * 1.45 },
    /** 12px. 고르는 줄의 설명 — 시안의 목록 줄 보조 글 값이다. */
    rowNote: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 12 * 1.35 },
    /** 17px 명조. 확인 단추의 글자 — 시안의 신비 해설 주 단추 값이다. */
    confirm: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 17 * 1.25 },
    /** 14px 명조. 물러나는 단추의 글자 — 「Classical」 `.btn` 의 기본값이다. */
    cancel: { fontFamily: fonts.serif, fontSize: 14, lineHeight: 14 * 1.2 },
  },
  TEXT_SCALE,
);

/**
 * 시트가 쓰는 크기와 선 (위 서체와 같은 출처).
 *
 * `scrimOpacity` 하나만 설명이 필요하다. 시트는 어느 화면 위에 뜨든 그 지역의 종이색을 쓰는데
 * (W2 §3), 기도 화면은 같은 지역의 **덮개색**으로 어둡게 칠해져 있어 밝은 종이 판이 그 위에
 * 그대로 올라오면 경계가 서지 않는다. 그래서 판 아래의 덮개를 그 지역의 덮개색으로 깔고
 * 이 값만큼 짙게 한다 — 새 색을 만들지 않고 지역의 색 벌 안에서 해결한 것이다.
 */
export const worldSheetMetrics = {
  /** 판의 좌우 여백. 시안이 모든 화면에 쓰는 값이다. */
  padding: 24,
  /** 판의 위·아래 여백. */
  paddingVertical: 22,
  /** 판의 위쪽 두 모서리. 「Classical」 은 거의 각진 체계라 `--radius-md` 하나다. */
  radius: worldRadius.md,
  /** 괘선 — 시안이 화면마다 쓰는 `rgba(0,0,0,.14)`. */
  rule: 'rgba(0,0,0,.14)',
  /** 고르는 줄 사이의 옅은 선 — 시안의 여정 줄이 쓰는 `rgba(0,0,0,.09)`. */
  ruleSoft: 'rgba(0,0,0,.09)',
  /** 고르는 줄과 단추의 높이. 「Classical」 의 주 단추(56)와 같은 계단이다. */
  rowHeight: 68,
  /**
   * 판 아래 덮개의 짙기.
   *
   * 값은 시안에서 왔다 — 시안이 **한 걸음 물러난 것**에 쓰는 짙기가 `opacity:.72` 이고
   * (기도문 아래의 묵상 노트), 이 저장소는 이미 같은 값을 같은 뜻으로 쓰고 있다
   * (`OFF_TURN_OPACITY` — 지금 차례가 아닌 절이 물러나는 정도). 시트가 떠 있는 동안
   * 아래 화면이 하는 일이 바로 그 "한 걸음 물러남"이라 같은 값을 쓴다.
   */
  scrimOpacity: 0.72,
} as const;

/**
 * 설정 화면(W2 슬라이스 C)의 서체 — 시안의 `data-screen-label="Settings"` 블록에
 * 인라인으로 적혀 있던 크기와 자간을 그대로 옮긴 것이다.
 *
 * 큰 제목은 시안이 `clamp(30px, 8vw, 38px)` 로 적었고, 그 식은 신비 해설 화면과 같으므로
 * 이미 있는 `guideTitleSizeFor` 를 그대로 쓴다 — 같은 식을 두 번 적지 않는다.
 */
export const worldSettingsType = scaleTypeScale(
  {
    /** 12px · 자간 .14em · 대문자. 큰 제목 위의 앱 이름 (시안의 `t.appName`). */
    brand: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.25,
      letterSpacing: 12 * 0.14,
    },
    /** 15px. 줄의 이름 (시안의 모든 설정 줄이 쓰는 크기). */
    rowLabel: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 15 * 1.35 },
    /** 12.5px. 줄 이름 아래의 작은 글 (시안의 `regionName · langName` 과 `historyLine`). */
    rowNote: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 12.5 * 1.4 },
    /**
     * 13px. 줄 오른쪽에 적는 고른 값.
     *
     * 시안의 설정 줄에는 이 글이 없다 — 시안의 항목은 전부 켬/끔 토글이라 값을 적을 일이
     * 없었다. 이 앱의 낭송 방식·받는 사이·묵주는 셋 또는 넷 중 하나를 고르는 것이라 토글로
     * 담을 수 없고(결정 12-2 카드 E), 그래서 값 글자가 필요해졌다. 크기는 시안이 같은
     * 성격의 자리(홈의 링크)에 쓰는 13px 을 가져왔다.
     */
    rowValue: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 13 * 1.35 },
    /** 28px 명조. 완주 기록의 수 (시안의 `historyCount`). */
    count: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 28 },
  },
  TEXT_SCALE,
);

/**
 * 설정 화면의 글자 크기 고르개 넉 칸이 쓰는 글자 크기 — 시안의 `fontOpts` 가 칸마다
 * 다른 크기를 준다(`px: [12, 14, 16, 19]`). 고르개 자체가 "작게·보통·크게·아주 크게"를
 * 글자의 크기로 보여 주는 장치이므로, 이 넷은 앱 안 글자 크기 배율을 **곱하지 않는다** —
 * 곱하면 넷의 간격이 배율만큼 벌어져 한 줄에 서지 못한다.
 */
export const FONT_SEG_PX: readonly number[] = [12, 14, 16, 19];

/**
 * 지역·언어 화면(W2 슬라이스 C)의 서체 — 시안의 `data-screen-label="Region & Language"`
 * 블록에 인라인으로 적혀 있던 크기와 자간을 그대로 옮긴 것이다.
 *
 * 큰 제목(`지역`)은 설정 화면과 같은 `clamp(30px, 8vw, 38px)` 이라 `guideTitleSizeFor` 를 쓴다.
 */
export const worldRegionType = scaleTypeScale(
  {
    /** 12px · 자간 .14em. 머리의 작은 라벨 (시안의 `t.regionLang`). */
    label: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.25,
      letterSpacing: 12 * 0.14,
    },
    /** 26px 명조. 가운데 제목 `언어` (시안의 `t.language`). */
    section: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 26 * 1.12 },
    /** 22px 명조 · 줄 높이 1.15. 지역의 이름 (시안의 `r.name`). */
    regionName: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 22 * 1.15 },
    /** 12.5px · 줄 높이 1.4. 지역의 한 줄 설명 (시안의 `r.desc`). */
    regionDesc: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 12.5 * 1.4 },
    /** 16px. 언어의 이름 (시안의 `l.name`). */
    langName: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 16 * 1.35 },
    /** 11px · 자간 .1em · 대문자. 언어 줄 오른쪽의 짧은 표시 (시안의 `l.tag`). */
    langTag: {
      fontFamily: fonts.sans,
      fontSize: 11,
      lineHeight: 11 * 1.25,
      letterSpacing: 11 * 0.1,
    },
  },
  TEXT_SCALE,
);

/**
 * 여정 화면(W3 슬라이스 A)의 서체 — 시안의 `data-screen-label="Journeys"` 블록에
 * 인라인으로 적혀 있던 크기와 자간을 그대로 옮긴 것이다. 앞선 화면들과 같은 이유로 화면
 * 이름으로 모았다: 시안은 화면마다 크기를 직접 정하고, 그 값이 그 화면의 정본이다.
 *
 * **여기 없는 것 하나.** 큰 제목(`기도 여정`)의 크기는 시안이 `clamp(30px, 8vw, 38px)` 로
 * 적었고, 그 식은 신비 해설·설정 화면과 같으므로 이미 있는 `guideTitleSizeFor` 를 그대로
 * 쓴다 — 같은 식을 두 번 적지 않는다.
 *
 * 제목 자리에 한글 명조를 쓰는 것은 앞선 화면들과 같은 이유다. 시안의 제목 글꼴
 * (Cormorant Garamond)에는 한글 글리프가 없어 `어머니 병환 회복` 이 네모로 나온다.
 */
export const worldJourneyType = scaleTypeScale(
  {
    /** 12px · 자간 .14em · 대문자. 큰 제목 위의 작은 라벨 (시안의 `todayLabel`). */
    label: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.25,
      letterSpacing: 12 * 0.14,
    },
    /** 14px. 여정이 하나도 없을 때의 한 줄 (시안의 `t.noJourney`). */
    empty: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 14 * 1.4 },
    /** 11.5px · 자간 .1em · 대문자. 줄 위의 작은 라벨 (시안의 `j.kicker`). */
    kicker: {
      fontFamily: fonts.sans,
      fontSize: 11.5,
      lineHeight: 11.5 * 1.25,
      letterSpacing: 11.5 * 0.1,
    },
    /** 21px 명조 · 줄 높이 1.25. 줄의 바람 한 줄 (시안의 `j.intention`). */
    intention: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 21 * 1.25 },
    /** 12.5px. 줄 오른쪽의 며칠째 (시안의 `j.dayLabel`). */
    dayLabel: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 12.5 * 1.25 },
    /** 12.5px. 펴진 자리 아래의 상태 한 줄과 `지우기` (시안의 `j.footer` · `t.delete`). */
    footer: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 12.5 * 1.35 },
    /** 16px 명조. 펴진 자리의 주 단추 (시안의 `j.prayLabel`). */
    rowButton: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 16 * 1.2 },
    /** 22px 명조. 아래쪽 `새 여정 시작` 제목 (시안의 `t.newJourney`). */
    newTitle: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 22 * 1.15 },
    /** 13px. 형식 셋을 고르는 띠의 글자 (「Classical」 의 `.seg-opt`). */
    segLabel: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 13 * 1.3 },
    /** 12px. 입력칸 위의 이름 (「Classical」 의 `.field > label`). */
    fieldLabel: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 12 * 1.3 },
    /** 16px. 지향을 적는 입력칸 (시안이 `.input` 에 덧쓴 `font-size:16px`). */
    input: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 16 * 1.35 },
    /** 17px 명조. `기도 시작` 단추의 글자 (시안의 `t.startJourney`). */
    startLabel: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 17 * 1.2 },
  },
  TEXT_SCALE,
);

/**
 * 날짜 격자의 칸 수 — **언제나 아홉의 배수**다 (`docs/plan/w3-work-order.md` §1-1).
 *
 * 시안은 54일 여정의 격자를 열여덟 열로 그리는데, 시안 자신이 요구하는 최소 너비 320px
 * 에서 칸 하나가 11.33px 이 된다. 그 격자에서 **오늘 칸은 바탕이 아니라 1px 테두리 하나로만
 * 구별되므로**, 테두리가 네모 넓이의 18% 를 차지해 칠해진 칸·오늘 칸·빈 칸 셋을 눈으로
 * 가를 수 없다. 그래서 이 저장소는 아홉 열로 통일했다 — 9일 여정은 한 줄, 54일 여정은
 * 여섯 줄, 날마다 여정은 아홉 칸씩 늘어나는 줄이 된다.
 *
 * 날마다 여정의 칸 수를 아홉의 배수로 키우는 식(`max(9, ceil(며칠째/9)*9)`)은 시안의 것을
 * 그대로 쓴다 — 시안도 같은 식으로 아홉의 배수를 만든다.
 */
export const GRID_COLUMNS = 9;

/** 날마다 여정의 칸 수 — 시안의 `Math.max(9, Math.ceil(day / 9) * 9)`. */
export function openEndedGridSize(dayIndex: number): number {
  return Math.max(GRID_COLUMNS, Math.ceil(Math.max(1, dayIndex) / GRID_COLUMNS) * GRID_COLUMNS);
}

/**
 * 성화 갤러리(W3 슬라이스 B)의 서체 — 시안의 `data-screen-label="Gallery"` 블록에
 * 인라인으로 적혀 있던 크기와 자간을 그대로 옮긴 것이다. 앞선 화면들과 같은 이유로
 * 화면 이름으로 모았다: 시안은 화면마다 크기를 직접 정하고, 그 값이 그 화면의 정본이다.
 *
 * **여기 없는 것 하나.** 큰 제목(`성화 갤러리`)의 크기는 시안이 `clamp(30px, 8vw, 38px)` 로
 * 적었고, 그 식은 신비 해설·설정·여정 화면과 같으므로 이미 있는 `guideTitleSizeFor` 를
 * 그대로 쓴다 — 같은 식을 두 번 적지 않는다.
 */
export const worldGalleryType = scaleTypeScale(
  {
    /** 12px · 자간 .14em · 대문자. 큰 제목 위의 지역 이름 (시안의 `regionName`). */
    label: {
      fontFamily: fonts.sans,
      fontSize: 12,
      lineHeight: 12 * 1.25,
      letterSpacing: 12 * 0.14,
    },
    /** 12.5px. 탭 셋의 글자 (시안이 `.seg-opt` 에 덧쓴 `font-size:12.5px`). */
    segLabel: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 12.5 * 1.3 },
    /** 13px · 줄 높이 1.3. 그림 아래의 제목 (시안의 `g.alt`). */
    caption: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 13 * 1.3 },
    /** 10px · 자간 .1em · 대문자. 그림 왼쪽 위의 `고정됨` 표 (시안의 `t.pinned`). */
    badge: {
      fontFamily: fonts.sans,
      fontSize: 10,
      lineHeight: 10 * 1.25,
      letterSpacing: 10 * 0.1,
    },
    /**
     * 14px. **즐겨찾기 탭이 비었을 때의 한 줄** — 시안에 없어 이 저장소가 파생한 자리다.
     * 여정이 하나도 없을 때의 한 줄(`worldJourneyType.empty`)과 같은 크기로 맞췄다.
     */
    empty: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 14 * 1.5 },
  },
  TEXT_SCALE,
);

/**
 * 전체 화면 감상(W3 슬라이스 B)의 서체 — 시안의 `data-screen-label="Art View"` 블록에서 왔다.
 *
 * 제목에 한글 명조를 쓰는 것은 앞선 화면들과 같은 이유다. 시안의 제목 글꼴(Cormorant
 * Garamond)에는 한글 글리프가 없어 `빛 가운데 서신 성모` 가 네모로 나온다.
 */
export const worldArtViewType = scaleTypeScale(
  {
    /** 20px 명조 · 줄 높이 1.2. 아래 띠 왼쪽의 그림 이름 (시안의 `viewImg.alt`). */
    title: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 20 * 1.2 },
    /** 12px. 그 아래 한 줄 설명 (시안의 `viewMeta`). */
    meta: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 12 * 1.35 },
    /** 13px. `고정하기` 단추의 글자 (시안의 `viewPinLabel`). */
    pinLabel: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 13 * 1.2 },
  },
  TEXT_SCALE,
);

/**
 * 전체 화면 감상 화면의 색 — 지역에 따라 달라지지 않는 것들이다.
 * 시안의 `Art View` 블록에서 글자 그대로 왔다.
 */
export const artViewColors = {
  /** 바탕. 지역의 `scrim` 보다 짙은 검정이며 시안이 이 화면에만 쓴다. */
  backdrop: '#0d0c0b',
  /** 글자. 기도 화면과 같은 밝은 상아색이다. */
  ink: '#f4ecdc',
  /** 켜진 하트와 고정된 단추의 글자 (시안의 `#e9c877`). */
  on: '#e9c877',
  /** 닫기 단추의 바탕. */
  closeFill: 'rgba(0,0,0,.45)',
  /** 아래 띠 단추들의 바탕. */
  buttonFill: 'rgba(0,0,0,.35)',
  /** 아래 띠 단추들의 테. */
  buttonBorder: 'rgba(255,255,255,.35)',
} as const;
