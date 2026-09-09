/**
 * 묵주 그림 — v5 시안의 `rosary()` 에서 자라 나온 것.
 *
 * v5 는 실(곡선 셋), 십자가, 큰 알 하나, 그리고 **한 단을 이루는 알 열 개**만 그렸다.
 * 나머지 다섯 단의 알을 실선으로만 암시한 것은 시안의 판정이었다 — 쉰아홉 알을 한
 * 화면에 다 그리면 지금 어느 알인지가 보이지 않는다는 것이다. 2026-09-09 에 공방장이
 * 그 판정을 뒤집었다("묵주가 모든 알이 다 반영되게 해줘", `decisions.md` 결정 6).
 *
 * 그래서 이 그림은 **실제 묵주와 같은 쉰아홉 알**을 다 그린다. 알이 어디에 있는지는
 * 이 파일이 정하지 않는다 — `rosaryState.ts` 가 타원 둘레를 길이로 고르게 나눠 계산하고,
 * 여기서는 받아 그리기만 한다.
 *
 * ── 시안이 걱정한 것을 어떻게 풀었나 ────────────────────────────────────────────
 *
 * 알이 열에서 쉰아홉으로 늘면 알 하나가 작아진다(지름 11.6 → 화면에서 11px). 그러면
 * 시안의 걱정이 그대로 일어나고, 디자인 시스템 §9-3 의 13번("알의 지름이 화면 폭의
 * 8% 이상")도 지킬 수 없다. 그래서 **지금 바치는 알 하나만 크게 부풀린다.**
 *
 * | | 반지름 | 화면에서의 지름 | 화면 폭(390) 대비 |
 * |---|---|---|---|
 * | 작은 알 | 5.8 | 11.0px | 2.8% |
 * | 큰 알 | 7.8 | 14.8px | 3.8% |
 * | **지금 알** | **17** | **32.3px** | **8.3%** |
 *
 * 지금 알이 이웃보다 세 배 가까이 크고 치자색으로 차 있으며 빛무리를 두르고 숨까지
 * 쉬므로, 알이 늘어도 눈이 갈 곳은 하나다. 전체는 "얼마나 남았나"를, 부푼 알 하나는
 * "지금 어디인가"를 말한다. 부푼 알이 양옆 이웃을 한 알씩 덮는데, 그것은 잃는 것이
 * 아니라 **초점이 거기 있다는 표시**로 읽힌다(빛무리가 이미 그만큼 번져 있다).
 *
 * ── 알의 상태는 넷이다 ──────────────────────────────────────────────────────────
 *
 * 1. **이미 바친 알** — 먹빛으로 채운다.
 * 2. **지금 바치는 알** — 치자색으로 채우고 부풀리고 4초 주기로 숨을 쉰다.
 * 3. **아직 안 바친 알** — 테두리로 그린다.
 * 4. **알이 아닌 자리** — 성호경·사도신경은 십자가가, 시작 기도의 영광송은 중심 메달이
 *    같은 방식으로 빛난다. 알에 머물지 않는 기도를 아무 데도 표시하지 않으면 그 사이에
 *    그림이 죽어 버린다.
 *
 * 숨쉬기는 v5 의 `@keyframes bre`(4초 주기로 크기 1 → 1.12, 투명도 .42 → 1)를 옮겼다.
 * 시안은 CSS 의 `transform: scale()` 로 키웠지만 여기서는 반지름을 직접 키운다 —
 * React Native 에는 SVG 도형 자신을 중심으로 삼는 `transform-box: fill-box` 가 없어서,
 * 크기를 키우면 뷰박스 원점을 기준으로 자리가 함께 밀리기 때문이다. 반지름을 키우면
 * 중심이 그대로 있으므로 눈에는 같은 움직임으로 보인다.
 *
 * 시안과 마찬가지로 **동작 줄이기(reduce motion)를 켠 기기에서는 숨쉬지 않는다.**
 *
 * ── 사실감에 대하여 (2026-09-09) ────────────────────────────────────────────────
 *
 * 처음 옮겼을 때 이 그림은 평평한 원과 가는 민선이었다. 알에 두께가 없어 종이에 뚫린
 * 구멍처럼 보였고, 겹친 알 둘이 한 덩어리로 뭉쳤으며, 십자가는 선 두 개였다. 그래서
 * **재료 두 가지**를 정하고 그것만으로 입체를 만들었다.
 *
 * 1. **빛은 한지빛**이다. 낮 벌이든 밤 벌이든 알을 비추는 빛의 색은 한지색 하나다.
 * 2. **그늘은 그 벌의 가장 깊은 먹빛**이다. 낮은 본문 먹빛, 밤은 쪽빛 바탕이다.
 *
 * 빛은 언제나 **왼쪽 위**에서 온다. 알 쉰아홉이 모두 같은 방향으로 밝고 어두워야 한 벌의
 * 구슬로 보이기 때문이다. 광택점(하이라이트 흰 점)은 찍지 않았고, 흐림 필터도 쓰지
 * 않았다 — 번들거리는 3D 렌더가 아니라 **정성껏 그린 그림** 쪽에 선을 그은 것이다.
 * 그 선의 실제 내용은 셋이다. 첫째, 반사광은 넓고 부드럽게 한 겹만 얹는다. 둘째,
 * 알마다 **가늘게 테를 두른다** — 화가가 형태를 잡을 때 하는 일이고, 겹친 알을 갈라
 * 주는 실제 효과가 있다. 셋째, 알 아래에 **아주 옅은 그림자**를 깔아 실 위에 얹힌
 * 느낌을 준다. 셋 다 새 색을 들이지 않고 위의 두 재료만 쓴다.
 *
 * 알이 작아지면서 이 셋의 **비율**을 알 크기에 매달았다. 반지름 18.4 에 맞춰 적어 둔
 * 그림자 거리(1.6 · 2.2)와 테 굵기(0.9)를 반지름 5.8 짜리 알에 그대로 쓰면, 그림자가
 * 알만큼 커지고 테가 알을 삼킨다.
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { fonts, useTheme } from '../theme';
import { BEADS, CROSS, LOOP, MEDAL, VIEWBOX, type RosaryPlacement } from './rosaryState';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * 그림의 바깥 크기.
 *
 * v5 는 340×245 였다. 알이 쉰아홉으로 늘면서 그 안에서는 알 하나가 너무 작아져, 성화
 * 띠(높이 267)가 허락하는 데까지 키웠다 — 266.5 는 267 에 닿는 가장 큰 값이다. 좌표계
 * (viewBox)는 v5 그대로 두었으므로 시안에서 옮겨 온 값들(십자가·실 굵기)이 그대로 산다.
 */
const SVG_WIDTH = 370;
const SVG_HEIGHT = (SVG_WIDTH * VIEWBOX.height) / VIEWBOX.width; // 266.5

/** 알의 반지름. 지금 알만 부풀린다 — 왜 그런지는 파일 머리의 표에 있다. */
const RADIUS = { small: 5.8, big: 7.8, current: 17 } as const;
/** 지금 알을 두르는 빛무리의 반지름. 고리의 맨 위에서도 잘리지 않는 크기다. */
const HALO_RADIUS = RADIUS.current * 1.7;
/** 중심 메달 — 알이 아니라 패(牌)이므로 세로로 긴 타원이다. */
const MEDAL_SIZE = { rx: 6.2, ry: 8.4 } as const;
/** 숨쉬기의 크기 폭. v5 의 `scale(1.12)`. */
const BREATH_SCALE = 1.12;
/** 숨 한 번의 길이. v5 의 `4s`. */
const BREATH_MS = 4000;
/** 지금 알을 두르는 후광의 짙기. v5 의 `opacity=".14"`. */
const HALO_OPACITY = 0.14;

/**
 * 실·십자가·아직 안 바친 알의 선. v5 는 이 넷을 먹빛에 투명도를 준 값으로 그렸다
 * (22% · 40% · 30% · 34%). 밤 벌은 같은 투명도를 그 벌의 본문색(한지)에 준다 —
 * 색표의 파생 규칙과 같다(`src/theme/tokens.ts` 의 `nightColors` 주석).
 */
const STROKES = {
  day: {
    thread: 'rgba(31,37,48,.22)',
    cross: 'rgba(31,37,48,.40)',
  },
  night: {
    thread: 'rgba(240,234,217,.22)',
    cross: 'rgba(240,234,217,.40)',
  },
} as const;

/**
 * 알을 입체로 보이게 하는 재료 두 가지. 벌마다 값이 다르되 **규칙은 하나**다 —
 * 빛은 그 벌의 한지빛, 그늘은 그 벌에서 가장 깊은 색이다. 지어낸 색은 없다.
 *
 * | 벌 | 빛 | 그 값의 출처 | 그늘 | 그 값의 출처 |
 * |---|---|---|---|---|
 * | 낮 | `#F5F1E6` | `dayColors.inverse` (한지) | `#1F2530` | `dayColors.ink` (먹빛) |
 * | 밤 | `#F0EAD9` | `nightColors.ink` (한지) | `#10161F` | `nightColors.background` (쪽빛) |
 *
 * 두 벌 모두 빛은 한지색이라는 점이 우연이 아니다 — 이 앱의 세계에서 종이가 빛이다.
 */
const MATERIAL = {
  day: { light: '#F5F1E6', shade: '#1F2530' },
  night: { light: '#F0EAD9', shade: '#10161F' },
} as const;

/** 그러데이션 이름. 한 화면에 묵주는 하나뿐이라 고정 이름으로 족하다. */
const LIGHT_ID = 'rosaryBeadLight';
const SHADE_ID = 'rosaryBeadShade';
const RIM_ID = 'rosaryBeadRim';
const HALO_ID = 'rosaryBeadHalo';

/**
 * 상태마다 빛과 그늘을 얼마나 얹는가.
 *
 * 세 상태가 한눈에 갈라지는 것이 이 그림의 일이므로, 입체를 주되 상태의 차이를
 * 잡아먹지 않는 선에서 멈춘다.
 */
const SHADING = {
  done: { light: 0.22, shade: 0.4, rim: 0.5, contact: 0.1 },
  current: { light: 0.26, shade: 0.24, rim: 0.3, contact: 0.1 },
} as const;

/**
 * 아직 안 바친 알의 테두리 짙기.
 *
 * v5 의 값(작은 알 30% · 큰 알 34%)을 **테 한 줄 안에서 다시 나눈** 것이다. 빛이 닿는
 * 왼쪽 위는 옅고 등지는 오른쪽 아래는 짙어, 테 하나만으로 알이 둥글게 보인다. 평균이
 * 원래 값과 같도록 잡았으므로 그림 전체의 무게는 그대로다. **채움은 두지 않았다** —
 * 옅게라도 채우면 알이 유리처럼 뿌옇게 되고(디자인 시스템 §9-3 의 14번), 성화가 알
 * 뒤로 비쳐 보이게 하려던 v5 의 뜻도 함께 사라진다.
 */
const PENDING_RIM = { small: 0.42, big: 0.48 } as const;

/**
 * 알 크기에 매달린 비율들. 반지름 18.4 짜리 알에 맞춰 적혀 있던 값을 그 반지름으로
 * 나눠 얻은 것이라, 알이 커지든 작아지든 같은 그림이 나온다.
 */
const RATIO = {
  /** 알 아래 그림자가 밀리는 거리. 빛이 왼쪽 위에서 오므로 오른쪽 아래로 밀린다. */
  contactX: 1.6 / 18.4,
  contactY: 2.2 / 18.4,
  /** 채워진 알에 두르는 테의 굵기. */
  rim: 0.9 / 18.4,
  /** 아직 안 바친 알의 테 굵기. */
  pendingRim: 1.6 / 18.4,
} as const;

/** 아주 작은 알에서도 테가 사라지지 않게 하는 바닥값. */
function strokeWidthFor(radius: number, ratio: number, floor: number): number {
  return Math.max(floor, radius * ratio);
}

type Shading = (typeof SHADING)[keyof typeof SHADING];
/** 숨 쉬는 알은 반지름이 애니메이션 값이라 숫자와 애니메이션 값을 모두 받는다. */
type Radius = number | Animated.AnimatedInterpolation<number>;

/**
 * 숨 — 4초 주기의 값 하나. 지금 알과 십자가·메달이 함께 쓴다.
 *
 * 동작 줄이기를 켠 기기에서는 애니메이션을 아예 걸지 않고 `still` 로 알린다.
 */
function useBreath(): { still: boolean; breath: Animated.Value } {
  const breath = useRef(new Animated.Value(0)).current;
  const [still, setStill] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) {
        setStill(true);
        return;
      }
      Animated.loop(
        Animated.sequence([
          Animated.timing(breath, {
            toValue: 1,
            duration: BREATH_MS / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(breath, {
            toValue: 0,
            duration: BREATH_MS / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ).start();
    });
    return () => {
      cancelled = true;
      breath.stopAnimation();
    };
  }, [breath]);

  return { still, breath };
}

/**
 * 알 하나에 얹는 빛·그늘·테. 알의 채움 위에 겹쳐 그린다.
 *
 * SVG 필터(`feGaussianBlur`)를 쓰지 않는 것은 웹과 네이티브에서 지원이 갈리기 때문이다.
 * 흐림이 필요한 자리는 전부 투명도를 달리한 도형을 겹쳐 만들었다.
 */
function BeadShading({
  cx,
  cy,
  r,
  base,
  shading,
  shade,
}: {
  cx: number;
  cy: number;
  r: Radius;
  /** 비율을 재는 기준이 되는 반지름. 숨 쉬는 알은 반지름이 값이 아니라 흐름이라 따로 받는다. */
  base: number;
  shading: Shading;
  shade: string;
}) {
  return (
    <>
      <AnimatedCircle cx={cx} cy={cy} r={r} fill={`url(#${LIGHT_ID})`} opacity={shading.light} />
      <AnimatedCircle cx={cx} cy={cy} r={r} fill={`url(#${SHADE_ID})`} opacity={shading.shade} />
      {shading.rim > 0 ? (
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={shade}
          strokeWidth={strokeWidthFor(base, RATIO.rim, 0.35)}
          opacity={shading.rim}
        />
      ) : null}
    </>
  );
}

/** 알이 실 위에 얹혀 있다는 것을 알리는 아주 옅은 그림자. */
function BeadContact({
  cx,
  cy,
  r,
  base,
  shading,
  shade,
}: {
  cx: number;
  cy: number;
  r: Radius;
  base: number;
  shading: Shading;
  shade: string;
}) {
  if (shading.contact <= 0) return null;
  return (
    <AnimatedCircle
      cx={cx + base * RATIO.contactX}
      cy={cy + base * RATIO.contactY}
      r={r}
      fill={shade}
      opacity={shading.contact}
    />
  );
}

/** 숨 쉬는 알 — 지금 바치는 알 하나에만 붙는다. */
function BreathingBead({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const { colors, mode } = useTheme();
  const { shade } = MATERIAL[mode];
  const { still, breath } = useBreath();

  if (still) {
    return (
      <>
        <Circle cx={cx} cy={cy} r={HALO_RADIUS} fill={`url(#${HALO_ID})`} opacity={HALO_OPACITY} />
        <BeadContact cx={cx} cy={cy} r={r} base={r} shading={SHADING.current} shade={shade} />
        <Circle cx={cx} cy={cy} r={r} fill={colors.accentFill} />
        <BeadShading cx={cx} cy={cy} r={r} base={r} shading={SHADING.current} shade={shade} />
      </>
    );
  }

  const opacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.42, 1] });
  const haloRadius = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [HALO_RADIUS, HALO_RADIUS * BREATH_SCALE],
  });
  const beadRadius = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [r, r * BREATH_SCALE],
  });

  /*
   * 숨의 투명도는 무리 전체에 한 번만 건다. 이렇게 하지 않으면 후광이 자기 몫의
   * 14% 를 잃고 42~100% 로 칠해져, 지금 알이 치자색 덩어리가 된다
   * (v5 는 후광에 14% 와 숨 두 가지를 함께 건다).
   */
  return (
    <AnimatedG opacity={opacity}>
      <AnimatedCircle
        cx={cx}
        cy={cy}
        r={haloRadius}
        fill={`url(#${HALO_ID})`}
        opacity={HALO_OPACITY}
      />
      <BeadContact cx={cx} cy={cy} r={beadRadius} base={r} shading={SHADING.current} shade={shade} />
      <AnimatedCircle cx={cx} cy={cy} r={beadRadius} fill={colors.accentFill} />
      <BeadShading cx={cx} cy={cy} r={beadRadius} base={r} shading={SHADING.current} shade={shade} />
    </AnimatedG>
  );
}

/**
 * 알이 아닌 자리(십자가·중심 메달)를 감싸는 빛무리.
 *
 * 알처럼 부풀릴 수가 없다 — 십자가는 원이 아니고 메달은 세로로 긴 타원이라 크기를
 * 키우면 모양이 무너진다. 그래서 **빛무리만 숨을 쉬게** 하고 형태는 가만히 둔다.
 * 사용자가 받는 신호(4초 주기로 밝아졌다 어두워진다)는 알과 같다.
 */
function BreathingGlow({
  cx,
  cy,
  rx,
  ry,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}) {
  const { still, breath } = useBreath();
  if (still) {
    return <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${HALO_ID})`} opacity={HALO_OPACITY} />;
  }
  const opacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.42, 1] });
  return (
    <AnimatedG opacity={opacity}>
      <AnimatedEllipse
        cx={cx}
        cy={cy}
        rx={breath.interpolate({ inputRange: [0, 1], outputRange: [rx, rx * BREATH_SCALE] })}
        ry={breath.interpolate({ inputRange: [0, 1], outputRange: [ry, ry * BREATH_SCALE] })}
        fill={`url(#${HALO_ID})`}
        opacity={HALO_OPACITY}
      />
    </AnimatedG>
  );
}

export function Rosary({ done, current, focus, label }: RosaryPlacement) {
  const { colors, mode } = useTheme();
  const stroke = STROKES[mode];
  const { light, shade } = MATERIAL[mode];
  const onCross = focus === 'cross';
  const onMedal = focus === 'medal';
  const spot = current >= 0 ? BEADS[current] : undefined;

  return (
    <Svg
      width={SVG_WIDTH}
      height={SVG_HEIGHT}
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      testID="rosary"
    >
      <Defs>
        {/* 왼쪽 위에서 오는 빛. 넓고 부드럽게 한 겹만 — 광택점은 찍지 않는다. */}
        <RadialGradient id={LIGHT_ID} cx="32%" cy="26%" r="78%">
          <Stop offset="0" stopColor={light} stopOpacity={1} />
          <Stop offset="0.5" stopColor={light} stopOpacity={0.28} />
          <Stop offset="1" stopColor={light} stopOpacity={0} />
        </RadialGradient>
        {/* 그 반대쪽에 지는 그늘. 알의 아래 오른쪽이 말려 들어가 보이게 한다. */}
        <RadialGradient id={SHADE_ID} cx="74%" cy="78%" r="82%">
          <Stop offset="0" stopColor={shade} stopOpacity={1} />
          <Stop offset="0.55" stopColor={shade} stopOpacity={0.22} />
          <Stop offset="1" stopColor={shade} stopOpacity={0} />
        </RadialGradient>
        {/*
          아직 안 바친 알의 테. 같은 왼쪽 위 빛을 테 한 줄에 담는다.
          낮 벌은 테가 먹빛이라 빛이 닿는 쪽이 **옅어야** 하고, 밤 벌은 테가 한지빛이라
          빛이 닿는 쪽이 **짙어야** 한다. 그래서 두 벌의 방향이 뒤집혀 있다.
        */}
        <LinearGradient id={RIM_ID} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.ink} stopOpacity={mode === 'night' ? 1 : 0.35} />
          <Stop offset="0.5" stopColor={colors.ink} stopOpacity={0.75} />
          <Stop offset="1" stopColor={colors.ink} stopOpacity={mode === 'night' ? 0.35 : 1} />
        </LinearGradient>
        {/*
          지금 알을 두르는 후광. v5 는 지름 68 짜리 원을 14% 로 통째 칠했는데, 그러면
          후광의 가장자리가 칼로 자른 듯 끊긴다. 같은 14% 를 알의 가장자리에서 바깥으로
          **번지게** 바꿨다 — 흐림 필터 없이 빛무리를 만드는 방법이다.
        */}
        <RadialGradient id={HALO_ID} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={colors.accentFill} stopOpacity={1} />
          <Stop offset="0.56" stopColor={colors.accentFill} stopOpacity={1} />
          <Stop offset="0.8" stopColor={colors.accentFill} stopOpacity={0.52} />
          <Stop offset="1" stopColor={colors.accentFill} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/*
        실 — 알을 꿴 고리와 아래로 늘어진 줄. v5 는 고리를 곡선 셋으로 그렸지만, 이제
        알이 그 위에 쉰다섯 개 앉으므로 **알을 놓는 데 쓴 타원 그 자체**를 그린다.
        둘이 다른 식으로 그려지면 알이 실에서 떠 보인다.

        굵기는 v5 처럼 두 겹으로 나눴다. 넓고 옅은 겹이 실의 바깥 결을, 가는 겹이 심을
        이룬다. 민선 하나보다 부드럽다.
      */}
      <G>
        <Ellipse
          cx={LOOP.cx}
          cy={LOOP.cy}
          rx={LOOP.rx}
          ry={LOOP.ry}
          fill="none"
          stroke={stroke.thread}
          strokeWidth={2.8}
          opacity={0.34}
        />
        <Ellipse
          cx={LOOP.cx}
          cy={LOOP.cy}
          rx={LOOP.rx}
          ry={LOOP.ry}
          fill="none"
          stroke={stroke.thread}
          strokeWidth={1.1}
        />
        <Path
          d={`M${MEDAL.x} ${MEDAL.y} L${CROSS.x} ${CROSS.top}`}
          fill="none"
          stroke={stroke.thread}
          strokeWidth={2.8}
          opacity={0.34}
        />
        <Path
          d={`M${MEDAL.x} ${MEDAL.y} L${CROSS.x} ${CROSS.top}`}
          fill="none"
          stroke={stroke.thread}
          strokeWidth={1.1}
        />
      </G>

      {/*
        십자고상. 선 두 개였던 것을 면으로 깎았다 — 세로 기둥과 가로 들보가 폭 4.6 으로
        만나고, 끝을 조금 넓혀 나무를 깎아 낸 느낌을 준다. 크기는 v5 그대로이고 자리만
        아래로 2 내렸다(늘어진 줄에 알 넷이 들어서면서 밀렸다). 왼쪽 위 모서리에만
        한지빛 한 겹을 얹어, 알과 같은 방향에서 빛을 받게 했다.

        **몸(코르푸스)은 새기지 않았다.** 이 십자가는 화면에서 세로 26 · 가로 30 이고
        실제로는 그보다 작게 그려지므로, 사람의 형상을 넣으면 형상이 아니라 얼룩이 된다.

        성호경과 사도신경을 바치는 동안에는 십자가가 지금 알처럼 치자색으로 차오르고
        빛무리를 두른다 — 그 두 기도를 바치는 자리가 실제로 십자가이기 때문이다.
      */}
      {onCross ? <BreathingGlow cx={195} cy={265} rx={19} ry={16} /> : null}
      <G>
        <Path
          d="M192.7 254 L197.3 254 L197.3 260.3 L203.5 260.3 L203.5 264.9 L197.3 264.9
             L197.3 280 L192.7 280 L192.7 264.9 L186.5 264.9 L186.5 260.3 L192.7 260.3 Z"
          fill={onCross ? colors.accentFill : stroke.cross}
        />
        {/* 빛을 받는 위·왼쪽 모서리와 등지는 아래·오른쪽 모서리 — 나무를 깎은 면이 된다. */}
        <Path
          d="M192.7 280 L192.7 264.9 L186.5 264.9 L186.5 260.3 L192.7 260.3 L192.7 254 L197.3 254"
          fill="none"
          stroke={light}
          strokeWidth={0.8}
          opacity={0.4}
        />
        <Path
          d="M197.3 254 L197.3 260.3 L203.5 260.3 L203.5 264.9 L197.3 264.9 L197.3 280 L192.7 280"
          fill="none"
          stroke={shade}
          strokeWidth={0.8}
          opacity={0.3}
        />
      </G>

      {/*
        중심 메달 — 늘어진 줄과 고리가 만나는 패다. 알이 아니므로 원이 아니라 세로로
        긴 타원으로 그린다. 시작 기도의 영광송을 바치는 자리이고, 그때 여기가 빛난다.
      */}
      {onMedal ? (
        <BreathingGlow cx={MEDAL.x} cy={MEDAL.y} rx={MEDAL_SIZE.rx * 2.6} ry={MEDAL_SIZE.ry * 2.2} />
      ) : null}
      <Ellipse
        cx={MEDAL.x}
        cy={MEDAL.y}
        rx={MEDAL_SIZE.rx}
        ry={MEDAL_SIZE.ry}
        fill={onMedal ? colors.accentFill : 'none'}
        stroke={onMedal ? undefined : `url(#${RIM_ID})`}
        strokeWidth={onMedal ? undefined : 1.2}
        opacity={onMedal ? 1 : PENDING_RIM.big}
      />

      {/* 알 쉰아홉. 지금 알은 이웃 위에 얹혀야 하므로 여기서 빼고 맨 나중에 그린다. */}
      {BEADS.map((bead, i) => {
        if (i === current) return null;
        const r = bead.big ? RADIUS.big : RADIUS.small;
        if (i < done) {
          return (
            <G key={i}>
              <BeadContact
                cx={bead.x}
                cy={bead.y}
                r={r}
                base={r}
                shading={SHADING.done}
                shade={shade}
              />
              <Circle cx={bead.x} cy={bead.y} r={r} fill={colors.beadDone} />
              <BeadShading
                cx={bead.x}
                cy={bead.y}
                r={r}
                base={r}
                shading={SHADING.done}
                shade={shade}
              />
            </G>
          );
        }
        return (
          <Circle
            key={i}
            cx={bead.x}
            cy={bead.y}
            r={r}
            fill="none"
            stroke={`url(#${RIM_ID})`}
            strokeWidth={strokeWidthFor(r, RATIO.pendingRim, 0.9)}
            opacity={bead.big ? PENDING_RIM.big : PENDING_RIM.small}
          />
        );
      })}

      {/* 지금 바치는 알 — 이웃보다 세 배 가까이 부풀어 맨 위에 얹힌다. */}
      {spot ? <BreathingBead cx={spot.x} cy={spot.y} r={RADIUS.current} /> : null}

      {/* 지금 알 안의 숫자 — 그 단의 몇 번째 성모송인가. */}
      {spot && label !== null ? (
        <SvgText
          x={spot.x}
          y={spot.y + 6}
          textAnchor="middle"
          fontFamily={fonts.sansMedium}
          fontSize={16}
          fill={colors.onAccentFill}
        >
          {label}
        </SvgText>
      ) : null}
    </Svg>
  );
}
