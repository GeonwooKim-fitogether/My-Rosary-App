/**
 * 묵주 그림 — v5 시안의 `rosary()` 를 React Native 로 옮긴 것.
 *
 * 좌표·굵기는 시안에서 글자 그대로 가져왔다. 실(곡선 셋), 십자가, 큰 알 하나,
 * 그리고 한 단을 이루는 알 열 개다. 나머지 다섯 단의 알을 다 그리지 않고 실선으로만
 * 암시하는 것은 시안이 내린 판정이다 — 59알을 한 화면에 다 그리면 지금 어느 알인지가
 * 보이지 않는다.
 *
 * 알의 상태는 셋이다.
 *
 * 1. **이미 바친 알** — 먹빛으로 채운다.
 * 2. **지금 바치는 알** — 치자색으로 채우고 4초 주기로 숨을 쉰다. 알 안에 몇 번째인지 적는다.
 * 3. **아직 안 바친 알** — 테두리로 그린다.
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
 * 빛은 언제나 **왼쪽 위**에서 온다. 알 열두 개가 모두 같은 방향으로 밝고 어두워야
 * 한 벌의 구슬로 보이기 때문이다. 광택점(하이라이트 흰 점)은 찍지 않았고, 흐림 필터도
 * 쓰지 않았다 — 번들거리는 3D 렌더가 아니라 **정성껏 그린 그림** 쪽에 선을 그은 것이다.
 * 그 선의 실제 내용은 셋이다. 첫째, 반사광은 넓고 부드럽게 한 겹만 얹는다. 둘째,
 * 알마다 **가늘게 테를 두른다** — 화가가 형태를 잡을 때 하는 일이고, 겹친 알을 갈라
 * 주는 실제 효과가 있다. 셋째, 알 아래에 **아주 옅은 그림자**를 깔아 실 위에 얹힌
 * 느낌을 준다. 셋 다 새 색을 들이지 않고 위의 두 재료만 쓴다.
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { fonts, useTheme } from '../theme';
import { BEAD_POSITIONS, type RosaryPlacement } from './rosaryState';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

/** 주님의 기도·영광송·구원송·신비 선포가 머무는 큰 알. */
const BIG_BEAD = { cx: 195, cy: 210, r: 21 };

const BEAD_RADIUS = 18.4;
const HALO_RADIUS = 34;
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
    pending: 'rgba(31,37,48,.30)',
    bigPending: 'rgba(31,37,48,.34)',
  },
  night: {
    thread: 'rgba(240,234,217,.22)',
    cross: 'rgba(240,234,217,.40)',
    pending: 'rgba(240,234,217,.30)',
    bigPending: 'rgba(240,234,217,.34)',
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
 * 잡아먹지 않는 선에서 멈춘다. 아직 안 바친 알은 여전히 **테두리가 형태의 주인**이고
 * 빛과 그늘은 그 안에서 겨우 숨 쉬는 정도(10% 안팎)만 얹는다.
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

/** 알 아래 그림자가 밀리는 거리. 빛이 왼쪽 위에서 오므로 오른쪽 아래로 밀린다. */
const CONTACT_OFFSET = { x: 1.6, y: 2.2 };

type Shading = (typeof SHADING)[keyof typeof SHADING];
/** 숨 쉬는 알은 반지름이 애니메이션 값이라 숫자와 애니메이션 값을 모두 받는다. */
type Radius = number | Animated.AnimatedInterpolation<number>;

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
  shading,
  shade,
}: {
  cx: number;
  cy: number;
  r: Radius;
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
          strokeWidth={0.9}
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
  shading,
  shade,
}: {
  cx: number;
  cy: number;
  r: Radius;
  shading: Shading;
  shade: string;
}) {
  if (shading.contact <= 0) return null;
  return (
    <AnimatedCircle
      cx={cx + CONTACT_OFFSET.x}
      cy={cy + CONTACT_OFFSET.y}
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

  if (still) {
    return (
      <>
        <Circle cx={cx} cy={cy} r={HALO_RADIUS} fill={`url(#${HALO_ID})`} opacity={HALO_OPACITY} />
        <BeadContact cx={cx} cy={cy} r={r} shading={SHADING.current} shade={shade} />
        <Circle cx={cx} cy={cy} r={r} fill={colors.accentFill} />
        <BeadShading cx={cx} cy={cy} r={r} shading={SHADING.current} shade={shade} />
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
   * 14% 를 잃고 42~100% 로 칠해져, 지금 알이 지름 68 짜리 치자색 덩어리가 된다
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
      <BeadContact cx={cx} cy={cy} r={beadRadius} shading={SHADING.current} shade={shade} />
      <AnimatedCircle cx={cx} cy={cy} r={beadRadius} fill={colors.accentFill} />
      <BeadShading cx={cx} cy={cy} r={beadRadius} shading={SHADING.current} shade={shade} />
    </AnimatedG>
  );
}

export function Rosary({ done, current }: RosaryPlacement) {
  const { colors, mode } = useTheme();
  const stroke = STROKES[mode];
  const { light, shade } = MATERIAL[mode];
  return (
    <Svg width={340} height={245} viewBox="0 0 390 281">
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
        실 — 고리와 늘어진 줄. 곡선의 `d` 는 시안 그대로이고, 굵기만 두 겹으로 나눴다.
        넓고 옅은 겹이 실의 바깥 결을, 가는 겹이 심을 이룬다. 민선 하나보다 부드럽다.
      */}
      <G>
        {[
          'M42 128 C34 56 125 46 195 48 C265 46 356 56 348 128',
          'M42 128 C56 170 147 198 195 210',
          'M348 128 C334 170 243 198 195 210',
          'M195 231 L195 252',
        ].map((d) => (
          <G key={d}>
            <Path d={d} fill="none" stroke={stroke.thread} strokeWidth={2.8} opacity={0.34} />
            <Path d={d} fill="none" stroke={stroke.thread} strokeWidth={1.1} />
          </G>
        ))}
      </G>

      {/*
        십자고상. 선 두 개였던 것을 면으로 깎았다 — 세로 기둥과 가로 들보가 폭 5.2 로
        만나고, 끝을 조금 넓혀 나무를 깎아 낸 느낌을 준다. 자리와 크기는 그대로다
        (가로 180~210 · 세로 252~278). 왼쪽 위 모서리에만 한지빛 한 겹을 얹어, 알과
        같은 방향에서 빛을 받게 했다.

        **몸(코르푸스)은 새기지 않았다.** 이 십자가는 화면에서 세로 26 · 가로 30 이고
        실제로는 그보다 작게 그려지므로, 사람의 형상을 넣으면 형상이 아니라 얼룩이 된다.
        대신 팔이 만나는 자리에 아주 작은 못 자국 하나를 어둡게 남겼다.
      */}
      <G>
        <Path
          d="M192.7 252 L197.3 252 L197.3 258.3 L203.5 258.3 L203.5 262.9 L197.3 262.9
             L197.3 278 L192.7 278 L192.7 262.9 L186.5 262.9 L186.5 258.3 L192.7 258.3 Z"
          fill={stroke.cross}
        />
        {/* 빛을 받는 위·왼쪽 모서리와 등지는 아래·오른쪽 모서리 — 나무를 깎은 면이 된다. */}
        <Path
          d="M192.7 278 L192.7 262.9 L186.5 262.9 L186.5 258.3 L192.7 258.3 L192.7 252 L197.3 252"
          fill="none"
          stroke={light}
          strokeWidth={0.8}
          opacity={0.4}
        />
        <Path
          d="M197.3 252 L197.3 258.3 L203.5 258.3 L203.5 262.9 L197.3 262.9 L197.3 278 L192.7 278"
          fill="none"
          stroke={shade}
          strokeWidth={0.8}
          opacity={0.3}
        />
      </G>

      {/* 큰 알 — 주님의 기도·영광송·구원송·신비 선포는 여기 머문다. */}
      {current < 0 ? (
        <BreathingBead cx={BIG_BEAD.cx} cy={BIG_BEAD.cy} r={BIG_BEAD.r} />
      ) : (
        <Circle
          cx={BIG_BEAD.cx}
          cy={BIG_BEAD.cy}
          r={BIG_BEAD.r}
          fill="none"
          stroke={`url(#${RIM_ID})`}
          strokeWidth={1.6}
          opacity={PENDING_RIM.big}
        />
      )}

      {BEAD_POSITIONS.map(([cx, cy], i) => {
        if (i === current) return <BreathingBead key={i} cx={cx} cy={cy} r={BEAD_RADIUS} />;
        if (i < done) {
          return (
            <G key={i}>
              <BeadContact cx={cx} cy={cy} r={BEAD_RADIUS} shading={SHADING.done} shade={shade} />
              <Circle cx={cx} cy={cy} r={BEAD_RADIUS} fill={colors.beadDone} />
              <BeadShading cx={cx} cy={cy} r={BEAD_RADIUS} shading={SHADING.done} shade={shade} />
            </G>
          );
        }
        return (
          <Circle
            key={i}
            cx={cx}
            cy={cy}
            r={BEAD_RADIUS}
            fill="none"
            stroke={`url(#${RIM_ID})`}
            strokeWidth={1.6}
            opacity={PENDING_RIM.small}
          />
        );
      })}

      {/* 지금 바치는 알 안의 숫자 — 열 알 중 몇 번째인가. */}
      {current >= 0 && BEAD_POSITIONS[current] ? (
        <SvgText
          x={BEAD_POSITIONS[current]![0]}
          y={BEAD_POSITIONS[current]![1] + 6}
          textAnchor="middle"
          fontFamily={fonts.sansMedium}
          fontSize={16}
          fill={colors.onAccentFill}
        >
          {current + 1}
        </SvgText>
      ) : null}
    </Svg>
  );
}
