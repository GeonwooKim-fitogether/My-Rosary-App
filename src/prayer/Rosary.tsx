/**
 * 묵주 그림 — v5 시안의 `rosary()` 에서 자라 나온 것.
 *
 * v5 는 실(곡선 셋), 십자가, 큰 알 하나, 그리고 **한 단을 이루는 알 열 개**만 그렸다.
 * 나머지 다섯 단의 알을 실선으로만 암시한 것은 시안의 판정이었다 — 쉰아홉 알을 한
 * 화면에 다 그리면 지금 어느 알인지가 보이지 않는다는 것이다. 2026-09-09 에 공방장이
 * 그 판정을 뒤집었다("묵주가 모든 알이 다 반영되게 해줘", `decisions.md` 결정 6).
 *
 * 그래서 이 그림은 **실제 묵주와 같은 쉰아홉 알**을 다 그린다. 알이 어디에 있는지는
 * 이 파일이 정하지 않는다 — `rosaryState.ts` 가 곡선의 길이를 재서 계산하고, 여기서는
 * 받아 그리기만 한다. 알에 무슨 빛깔을 칠하는지도 이 파일이 정하지 않는다 —
 * `rosaryMaterials.ts` 의 재질 표가 정하고, 빛과 그늘을 얹는 붓은 `beadPaint.tsx` 다.
 * 이 파일이 하는 일은 셋을 한 그림으로 조립하고 **지금 알을 숨 쉬게** 하는 것뿐이다.
 *
 * ── 시안이 걱정한 것을 어떻게 풀었나 ────────────────────────────────────────────
 *
 * 알이 열에서 쉰아홉으로 늘면 알 하나가 작아진다. 그러면 시안의 걱정이 그대로 일어나고,
 * 디자인 시스템 §9-3 의 13번("알의 지름이 화면 폭의 8% 이상")도 지킬 수 없다. 그래서
 * **지금 바치는 알 하나만 크게 부풀린다** — 크기 표는 `rosaryState.ts` 의 `BEAD_RADIUS`
 * 옆에 있다. 지금 알이 이웃보다 세 배 넘게 크고 치자색으로 차 있으며 빛무리를 두르고
 * 숨까지 쉬므로, 알이 늘어도 눈이 갈 곳은 하나다. 전체는 "얼마나 남았나"를, 부푼 알
 * 하나는 "지금 어디인가"를 말한다.
 *
 * ── 알의 상태는 넷이다 (디자인 시스템 §4-2 · FR-15) ─────────────────────────────
 *
 * 1. **이미 바친 알** — 그 재질의 빛깔로 채운다.
 * 2. **지금 바치는 알** — 치자색으로 채우고 부풀리고 4초 주기로 숨을 쉰다. 이 색만은
 *    **재질을 따르지 않는다** — 재질이 아니라 상태를 말하는 색이기 때문이고, 그래야 어느
 *    묵주를 골라도 "지금 어디인가"가 같은 세기로 보인다.
 * 3. **아직 안 바친 알** — 그 재질의 빛깔로 테만 두른다.
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
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Path,
  Text as SvgText,
} from 'react-native-svg';
import { fonts, useTheme } from '../theme';
import type { RosaryKey } from '../storage/settings';
import {
  BeadContact,
  BeadGradients,
  BeadShading,
  Cross,
  DoneBead,
  Medal,
  PendingBead,
  SHADING,
  gradientIds,
} from './beadPaint';
import { materialFor } from './rosaryMaterials';
import {
  BEADS,
  BEAD_RADIUS,
  CROSS,
  LOOP_PATH,
  MEDAL,
  VIEWBOX,
  type RosaryPlacement,
} from './rosaryState';

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

/** 지금 알을 두르는 빛무리의 반지름. 고리의 맨 위에서도 잘리지 않는 크기다. */
const HALO_RADIUS = BEAD_RADIUS.current * 1.7;
/** 중심 메달 — 알이 아니라 패(牌)이므로 세로로 긴 타원이다. */
const MEDAL_SIZE = { rx: 6.2, ry: 8.6 } as const;
/** 숨쉬기의 크기 폭. v5 의 `scale(1.12)`. */
const BREATH_SCALE = 1.12;
/** 숨 한 번의 길이. v5 의 `4s`. */
const BREATH_MS = 4000;
/** 지금 알을 두르는 후광의 짙기. v5 의 `opacity=".14"`. */
const HALO_OPACITY = 0.14;

/** 이 그림의 그러데이션 이름 앞가지. 한 화면에 묵주는 하나뿐이라 고정 이름으로 족하다. */
const PREFIX = 'rosaryBead';

/**
 * 십자고상의 크기 배수.
 *
 * v5 의 십자가는 세로 26 이었는데, 알 쉰아홉을 다 그리고 나니 알보다 조금 큰 표시로만
 * 보였다. 사진의 묵주에서 십자고상은 어느 알보다도 확실히 크고, 묵주를 쥘 때 처음 잡는
 * 것이 그것이다. 1.15 배(세로 29.9)는 그림의 아래 끝(281)을 넘지 않는 가장 큰 값이다.
 */
const CROSS_SCALE = 1.15;

/**
 * 줄의 굵기.
 *
 * v5 처럼 두 겹으로 나눴다. 넓고 옅은 겹이 줄의 바깥 결을, 가는 겹이 심을 이룬다.
 * 알이 작아진 만큼 줄도 함께 가늘게 했다 — 알보다 줄이 굵으면 구슬을 꿴 것이 아니라
 * 밧줄에 점을 찍은 것처럼 보인다.
 */
const THREAD = { outer: 1.8, core: 0.8 } as const;

/**
 * 사슬로 그릴 때의 마디 길이.
 *
 * 은·금 묵주는 끈이 아니라 사슬 고리로 이어진다(사진). 고리를 하나하나 그리는 대신
 * **선을 끊어** 그려 마디가 보이게 했다 — 이 크기에서는 고리를 그려도 점으로 뭉치고,
 * 끊어 그린 쪽이 오히려 사슬로 읽힌다.
 */
const CHAIN_DASH = [2.4, 1.4];

type Shading = (typeof SHADING)[keyof typeof SHADING];

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

/** 숨 쉬는 알 — 지금 바치는 알 하나에만 붙는다. */
function BreathingBead({
  cx,
  cy,
  r,
  shade,
}: {
  cx: number;
  cy: number;
  r: number;
  shade: string;
}) {
  const { colors } = useTheme();
  const { still, breath } = useBreath();
  const id = gradientIds(PREFIX);
  const shading: Shading = SHADING.current;

  if (still) {
    return (
      <>
        <Circle cx={cx} cy={cy} r={HALO_RADIUS} fill={`url(#${id.halo})`} opacity={HALO_OPACITY} />
        <BeadContact cx={cx} cy={cy} r={r} base={r} shading={shading} shade={shade} />
        <Circle cx={cx} cy={cy} r={r} fill={colors.accentFill} />
        <BeadShading
          cx={cx}
          cy={cy}
          r={r}
          base={r}
          shading={shading}
          shade={shade}
          prefix={PREFIX}
        />
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
      <AnimatedCircle cx={cx} cy={cy} r={haloRadius} fill={`url(#${id.halo})`} opacity={HALO_OPACITY} />
      <BeadContact cx={cx} cy={cy} r={beadRadius} base={r} shading={shading} shade={shade} />
      <AnimatedCircle cx={cx} cy={cy} r={beadRadius} fill={colors.accentFill} />
      <BeadShading
        cx={cx}
        cy={cy}
        r={beadRadius}
        base={r}
        shading={shading}
        shade={shade}
        prefix={PREFIX}
      />
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
function BreathingGlow({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  const { still, breath } = useBreath();
  const id = gradientIds(PREFIX);
  if (still) {
    return <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id.halo})`} opacity={HALO_OPACITY} />;
  }
  const opacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.42, 1] });
  return (
    <AnimatedG opacity={opacity}>
      <AnimatedEllipse
        cx={cx}
        cy={cy}
        rx={breath.interpolate({ inputRange: [0, 1], outputRange: [rx, rx * BREATH_SCALE] })}
        ry={breath.interpolate({ inputRange: [0, 1], outputRange: [ry, ry * BREATH_SCALE] })}
        fill={`url(#${id.halo})`}
        opacity={HALO_OPACITY}
      />
    </AnimatedG>
  );
}

export function Rosary({ done, current, focus, label, rosary }: RosaryPlacement & { rosary: RosaryKey }) {
  const { colors, mode } = useTheme();
  const material = materialFor(mode, rosary);
  const onCross = focus === 'cross';
  const onMedal = focus === 'medal';
  const spot = current >= 0 ? BEADS[current] : undefined;
  const dash = material.link === 'chain' ? CHAIN_DASH : undefined;

  return (
    <Svg
      width={SVG_WIDTH}
      height={SVG_HEIGHT}
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      testID="rosary"
    >
      <Defs>
        <BeadGradients prefix={PREFIX} material={material} accent={colors.accentFill} />
      </Defs>

      {/*
        줄 — 알을 꿴 고리와 아래로 늘어진 줄. 고리는 **알을 놓는 데 쓴 곡선 그 자체**를
        그린다(`LOOP_PATH`). 둘이 다른 식으로 그려지면 알이 줄에서 떠 보인다.

        알 사이에 틈을 두었으므로 이 줄이 그 틈에서 실제로 보인다 — 사진에서 알과 알
        사이에 짧은 줄 마디가 드러나는 것이 이 그림에서도 그대로 나온다.
      */}
      <G>
        <Path
          d={LOOP_PATH}
          fill="none"
          stroke={material.thread}
          strokeWidth={THREAD.outer}
          strokeDasharray={dash}
          opacity={0.3}
        />
        <Path
          d={LOOP_PATH}
          fill="none"
          stroke={material.thread}
          strokeWidth={THREAD.core}
          strokeDasharray={dash}
          opacity={0.9}
        />
        <Path
          d={`M${MEDAL.x} ${MEDAL.y} L${CROSS.x} ${CROSS.top}`}
          fill="none"
          stroke={material.thread}
          strokeWidth={THREAD.outer}
          strokeDasharray={dash}
          opacity={0.3}
        />
        <Path
          d={`M${MEDAL.x} ${MEDAL.y} L${CROSS.x} ${CROSS.top}`}
          fill="none"
          stroke={material.thread}
          strokeWidth={THREAD.core}
          strokeDasharray={dash}
          opacity={0.9}
        />
      </G>

      {/*
        십자고상. 성호경과 사도신경을 바치는 동안에는 지금 알처럼 치자색으로 차오르고
        빛무리를 두른다 — 그 두 기도를 바치는 자리가 실제로 십자가이기 때문이다.
      */}
      {onCross ? (
        <BreathingGlow cx={CROSS.x} cy={CROSS.top + 13 * CROSS_SCALE} rx={22} ry={19} />
      ) : null}
      <Cross
        x={CROSS.x}
        top={CROSS.top}
        fill={onCross ? colors.accentFill : material.metal}
        material={material}
        scale={CROSS_SCALE}
      />

      {/*
        중심 메달 — 늘어진 줄과 고리가 만나는 패다. 알이 아니므로 원이 아니라 세로로
        긴 타원으로 그리고, 그 재질의 금속 빛깔로 채운다. 시작 기도의 영광송을 바치는
        자리이고, 그때 여기가 빛난다.
      */}
      {onMedal ? (
        <BreathingGlow cx={MEDAL.x} cy={MEDAL.y} rx={MEDAL_SIZE.rx * 2.6} ry={MEDAL_SIZE.ry * 2.2} />
      ) : null}
      <Medal
        cx={MEDAL.x}
        cy={MEDAL.y}
        rx={MEDAL_SIZE.rx}
        ry={MEDAL_SIZE.ry}
        fill={onMedal ? colors.accentFill : material.metal}
        material={material}
        prefix={PREFIX}
      />

      {/* 알 쉰아홉. 지금 알은 이웃 위에 얹혀야 하므로 여기서 빼고 맨 나중에 그린다. */}
      {BEADS.map((bead, i) => {
        if (i === current) return null;
        const r = bead.big ? BEAD_RADIUS.big : BEAD_RADIUS.small;
        if (i < done) {
          return (
            <G key={i}>
              <DoneBead
                cx={bead.x}
                cy={bead.y}
                r={r}
                fill={bead.big ? material.bigBead : material.bead}
                material={material}
                prefix={PREFIX}
              />
            </G>
          );
        }
        return <PendingBead key={i} cx={bead.x} cy={bead.y} r={r} material={material} />;
      })}

      {/* 지금 바치는 알 — 이웃보다 세 배 넘게 부풀어 맨 위에 얹힌다. */}
      {spot ? (
        <BreathingBead cx={spot.x} cy={spot.y} r={BEAD_RADIUS.current} shade={material.shade} />
      ) : null}

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
