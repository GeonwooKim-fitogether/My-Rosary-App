/**
 * 묵주 그림 — v5 시안의 `rosary()` 를 React Native 로 옮긴 것.
 *
 * 좌표·굵기·색은 시안에서 글자 그대로 가져왔다. 실(곡선 셋), 십자가, 큰 알 하나,
 * 그리고 한 단을 이루는 알 열 개다. 나머지 다섯 단의 알을 다 그리지 않고 실선으로만
 * 암시하는 것은 시안이 내린 판정이다 — 59알을 한 화면에 다 그리면 지금 어느 알인지가
 * 보이지 않는다.
 *
 * 알의 상태는 셋이다.
 *
 * 1. **이미 바친 알** — 먹빛으로 채운다.
 * 2. **지금 바치는 알** — 치자색으로 채우고 4초 주기로 숨을 쉰다. 알 안에 몇 번째인지 적는다.
 * 3. **아직 안 바친 알** — 테두리만 그린다.
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
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../theme';
import { BEAD_POSITIONS, type RosaryPlacement } from './rosaryState';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** 주님의 기도·영광송·구원송·신비 선포가 머무는 큰 알. */
const BIG_BEAD = { cx: 195, cy: 210, r: 21 };

const BEAD_RADIUS = 18.4;
const HALO_RADIUS = 34;
/** 숨쉬기의 크기 폭. v5 의 `scale(1.12)`. */
const BREATH_SCALE = 1.12;
/** 숨 한 번의 길이. v5 의 `4s`. */
const BREATH_MS = 4000;

const THREAD = 'rgba(31,37,48,.22)';
const CROSS = 'rgba(31,37,48,.40)';
const PENDING = 'rgba(31,37,48,.30)';
const BIG_PENDING = 'rgba(31,37,48,.34)';

/** 숨 쉬는 알 — 지금 바치는 알 하나에만 붙는다. */
function BreathingBead({ cx, cy, r }: { cx: number; cy: number; r: number }) {
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
        <Circle cx={cx} cy={cy} r={HALO_RADIUS} fill={colors.accentFill} opacity={0.14} />
        <Circle cx={cx} cy={cy} r={r} fill={colors.accentFill} />
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

  return (
    <>
      <AnimatedCircle
        cx={cx}
        cy={cy}
        r={haloRadius}
        fill={colors.accentFill}
        opacity={opacity}
      />
      <AnimatedCircle cx={cx} cy={cy} r={beadRadius} fill={colors.accentFill} opacity={opacity} />
    </>
  );
}

export function Rosary({ done, current }: RosaryPlacement) {
  return (
    <Svg width={340} height={245} viewBox="0 0 390 281">
      {/* 실 — 고리와 늘어진 줄. */}
      <Path
        d="M42 128 C34 56 125 46 195 48 C265 46 356 56 348 128"
        fill="none"
        stroke={THREAD}
        strokeWidth={1.4}
      />
      <Path d="M42 128 C56 170 147 198 195 210" fill="none" stroke={THREAD} strokeWidth={1.4} />
      <Path d="M348 128 C334 170 243 198 195 210" fill="none" stroke={THREAD} strokeWidth={1.4} />
      <Path d="M195 231 L195 252" fill="none" stroke={THREAD} strokeWidth={1.4} />
      {/* 십자가. */}
      <Path
        d="M195 252 L195 278 M180 262 L210 262"
        fill="none"
        stroke={CROSS}
        strokeWidth={2.4}
      />

      {/* 큰 알 — 주님의 기도·영광송·구원송·신비 선포는 여기 머문다. */}
      {current < 0 ? (
        <BreathingBead cx={BIG_BEAD.cx} cy={BIG_BEAD.cy} r={BIG_BEAD.r} />
      ) : (
        <Circle
          cx={BIG_BEAD.cx}
          cy={BIG_BEAD.cy}
          r={BIG_BEAD.r}
          fill="none"
          stroke={BIG_PENDING}
          strokeWidth={1.6}
        />
      )}

      {BEAD_POSITIONS.map(([cx, cy], i) => {
        if (i === current) return <BreathingBead key={i} cx={cx} cy={cy} r={BEAD_RADIUS} />;
        if (i < done) return <Circle key={i} cx={cx} cy={cy} r={BEAD_RADIUS} fill={colors.ink} />;
        return (
          <Circle
            key={i}
            cx={cx}
            cy={cy}
            r={BEAD_RADIUS}
            fill="none"
            stroke={PENDING}
            strokeWidth={1.6}
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
          fill={colors.inverse}
        >
          {current + 1}
        </SvgText>
      ) : null}
    </Svg>
  );
}
