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
 * 1. **이미 바친 알** — 그 재질의 빛깔로 채우고, 알 둘레에 빛무리를 두르고 알 자신도
 *    환하게 밝힌다.
 * 2. **지금 바치는 알** — 치자색으로 채우고 부풀리고 4초 주기로 숨을 쉰다. 이 색만은
 *    **재질을 따르지 않는다** — 재질이 아니라 상태를 말하는 색이기 때문이고, 그래야 어느
 *    묵주를 골라도 "지금 어디인가"가 같은 세기로 보인다.
 * 3. **아직 안 바친 알** — 같은 빛깔로 **똑같이 꽉 차게** 채우되, 빛무리 없이 차분하게
 *    둔다.
 * 4. **알이 아닌 자리** — 성호경·사도신경은 십자가가, 시작 기도의 영광송은 중심 메달이
 *    같은 방식으로 빛난다. 알에 머물지 않는 기도를 아무 데도 표시하지 않으면 그 사이에
 *    그림이 죽어 버린다.
 *
 * 1번과 3번이 **같은 알**이라는 것이 2026-09-10 에 바뀐 것이다(`decisions.md` 결정 10).
 * 그전에는 안 바친 알이 테만 두른 빈 동그라미여서 진행이 한눈에 보였지만, 실제 묵주는
 * 기도한다고 알이 채워지지 않는다. 그래서 채우기가 하던 일을 빛이 넘겨받았다.
 *
 * ── 지금 알은 다섯 상태를 구분해 보인다 (FR-15 · 06-screen-spec 화면 B · `phase.ts`) ──
 *
 * 위 넷은 "어디까지 왔나"의 상태다. 지금 알 하나에는 그 위에 "지금 무슨 일이 벌어지고
 * 있나"의 상태가 따로 얹힌다 — 진행기가 알리는 값(`phase`)을 받아 이렇게 그린다.
 *
 * | 상태 | 움직임이 있는 기기에서 | 동작 줄이기를 켠 기기에서 (정지된 모양의 차이) |
 * |---|---|---|
 * | 읽는 중 `reading` | 알 바깥의 테두리가 시계 방향으로 차오른다 — 읽는 절의 어림 길이에 맞춰 | 테두리가 다 차 있다 |
 * | 내 차례 `response` | 4초 주기로 부풀며 밝아졌다 어두워진다 (v5 `@keyframes bre`) | 지금까지의 모습 그대로 |
 * | 소리 없이 진행 `silent` | 알을 넘기는 진동에 맞춰 빛무리가 한 번 반짝이고 가라앉는다 | 빛무리가 평소보다 짙다 |
 * | 단 전환 `decade` | 한 번 크게 부풀었다 돌아온다 | 부푼 채 서 있다 |
 * | 멈춤 `paused` | 호흡이 멎고 빛무리가 꺼지며 알이 흐려진다 | 같다 — 움직임이 없는 상태다 |
 *
 * 값의 출처는 둘뿐이다. v5 시안의 `@keyframes bre`(크기 1 → 1.12, 투명도 .42 → 1, 4초)와
 * 06-design-system §6 의 모션 표. **시안에 없는 값은 지어내지 않고 이 둘에서 파생했고**,
 * 어느 값이 어디서 왔는지는 아래 상수마다 적었다.
 *
 * 숨쉬기는 시안의 CSS `transform: scale()` 대신 반지름을 직접 키운다 — React Native 에는
 * SVG 도형 자신을 중심으로 삼는 `transform-box: fill-box` 가 없어서, 크기를 키우면 뷰박스
 * 원점을 기준으로 자리가 함께 밀리기 때문이다. 반지름을 키우면 중심이 그대로 있으므로
 * 눈에는 같은 움직임으로 보인다.
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
import type { PrayerPhase } from './phase';
import {
  Bead,
  BeadContact,
  BeadGlow,
  BeadGradients,
  BeadShading,
  Cross,
  Medal,
  SHADING,
  gradientIds,
} from './beadPaint';
import { DECADE_PULSE_MS } from './phase';
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
/** 숨쉬기의 크기 폭. v5 의 `scale(1.12)`. 단 전환의 확장 맥동도 같은 폭까지 부푼다. */
const BREATH_SCALE = 1.12;
/** 숨 한 번의 길이. v5 의 `4s`. */
const BREATH_MS = 4000;
/** 숨의 가장 어두운 끝. v5 `bre` 의 `opacity:.42`. 멈춤의 흐려짐도 이 값에 세운다. */
const BREATH_DIM = 0.42;
/** 지금 알을 두르는 후광의 짙기. v5 의 `opacity=".14"`. */
const HALO_OPACITY = 0.14;
/**
 * 소리 없이 진행할 때 반짝임이 가라앉는 시간. 06-design-system §6 의 **글자 교체 450ms**.
 * 시안에 반짝임이 없어, 모션 표에서 알이 넘어갈 때 함께 일어나는 움직임(기도문 글자가
 * 바뀌는 것)의 값을 골랐다. 반짝임은 v5 `bre` 의 밝은 끝(1)에서 후광의 평소 짙기(.14)로 내려온다.
 */
const FLASH_MS = 450;
/**
 * 동작 줄이기를 켠 기기에서 "소리 없이 진행"이 서 있을 때의 후광 짙기. 움직임 없이도 내 차례
 * (.14)와 갈리게, 반짝임이 지나는 길 위의 값인 v5 `bre` 의 어두운 끝(.42)에 세웠다.
 */
const FLASH_STILL_OPACITY = BREATH_DIM;
/**
 * 읽는 중에 차오르는 테두리. 시안에는 없는 그림이라 값을 줄에서 빌렸다 — 굵기는 줄의 바깥
 * 결(`THREAD.outer` 1.8)과 같고, 알에서 그 굵기의 두 배만큼 떨어져 돈다. 알이 숨 쉴 때
 * 닿는 크기(1.12배 = 19)보다 바깥이라 두 상태가 겹쳐 보이지 않는다.
 */
const RING_WIDTH = 1.8;
const RING_RADIUS = BEAD_RADIUS.current + RING_WIDTH * 2; // 20.6
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
/** 읽는 길이를 모를 때의 테두리 시간 — 신비 선포의 고정 사이와 같은 2200ms 를 쓴다. */
const RING_FALLBACK_MS = 2200;

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

/** 어떤 값이 흐름(Animated)일 수도, 그냥 숫자일 수도 있다. 정지 화면에서는 숫자다. */
type Flow = number | Animated.Value | Animated.AnimatedInterpolation<number>;

/** 동작 줄이기 설정을 한 번 읽는다. 켜져 있으면 다섯 상태를 움직임 대신 모양으로 갈라 그린다. */
function useReduceMotion(): boolean {
  const [still, setStill] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!cancelled && reduce) setStill(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return still;
}

/** 지금 알(또는 십자가·메달의 빛무리)을 그리는 데 필요한 값 넷. */
interface PhaseLook {
  /** 알과 빛무리의 크기 배수. 1 이 본래 크기다. */
  scale: Flow;
  /** 알 무리 전체의 투명도. 숨의 어두운 끝이 .42, 멈춤도 .42 다. */
  opacity: Flow;
  /** 빛무리의 짙기. 평소 .14, 멈추면 0. */
  halo: Flow;
  /** 읽는 중 테두리가 차오른 정도 0~1. 읽는 중이 아니면 null — 테두리를 그리지 않는다. */
  ring: Flow | null;
}

/**
 * 상태(phase)를 그림의 값으로 옮긴다.
 *
 * 움직임이 있는 기기에서는 흐름(Animated) 하나를 상태마다 다르게 굴리고, 동작 줄이기를 켠
 * 기기에서는 상태마다 정해진 숫자를 그대로 준다. 두 표는 파일 머리의 표와 같다.
 *
 * `restartKey` 가 바뀌면 흐름을 처음부터 다시 굴린다 — 알이 바뀔 때마다 반짝임이 다시
 * 일어나고 테두리가 다시 차오르게 하려는 것이다.
 */
function usePhaseLook(phase: PrayerPhase, readingMs: number, restartKey: number): PhaseLook {
  const still = useReduceMotion();
  const drive = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (still) return;
    drive.stopAnimation();
    drive.setValue(0);
    const ease = Easing.inOut(Easing.ease);
    let animation: Animated.CompositeAnimation | null = null;

    if (phase === 'response') {
      // v5 `bre` — 4초에 한 번, 0 → 1 → 0.
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(drive, { toValue: 1, duration: BREATH_MS / 2, easing: ease, useNativeDriver: false }),
          Animated.timing(drive, { toValue: 0, duration: BREATH_MS / 2, easing: ease, useNativeDriver: false }),
        ]),
      );
    } else if (phase === 'decade') {
      // 확장 맥동 한 번 — 화면 전환 시간(500ms) 안에 부풀었다 돌아온다.
      animation = Animated.sequence([
        Animated.timing(drive, { toValue: 1, duration: DECADE_PULSE_MS / 2, easing: ease, useNativeDriver: false }),
        Animated.timing(drive, { toValue: 0, duration: DECADE_PULSE_MS / 2, easing: ease, useNativeDriver: false }),
      ]);
    } else if (phase === 'silent') {
      // 반짝임 — 밝은 끝에서 시작해 평소 짙기로 가라앉는다. 글자 교체와 같은 450ms.
      drive.setValue(1);
      animation = Animated.timing(drive, { toValue: 0, duration: FLASH_MS, easing: Easing.ease, useNativeDriver: false });
    } else if (phase === 'reading') {
      // 테두리가 읽는 절의 어림 길이에 맞춰 차오른다. 실제 낭송이 어림보다 짧으면 다음 상태가
      // 먼저 와서 테두리가 걷히고, 길면 다 찬 채로 기다린다 — 어느 쪽도 거짓을 말하지 않는다.
      animation = Animated.timing(drive, {
        toValue: 1,
        duration: readingMs > 0 ? readingMs : RING_FALLBACK_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      });
    }
    animation?.start();
    return () => {
      animation?.stop();
    };
  }, [phase, readingMs, restartKey, still, drive]);

  if (still) {
    switch (phase) {
      case 'reading':
        return { scale: 1, opacity: 1, halo: HALO_OPACITY, ring: 1 };
      case 'silent':
        return { scale: 1, opacity: 1, halo: FLASH_STILL_OPACITY, ring: null };
      case 'decade':
        return { scale: BREATH_SCALE, opacity: 1, halo: HALO_OPACITY, ring: null };
      case 'paused':
        return { scale: 1, opacity: BREATH_DIM, halo: 0, ring: null };
      case 'response':
      default:
        return { scale: 1, opacity: 1, halo: HALO_OPACITY, ring: null };
    }
  }

  const grow = drive.interpolate({ inputRange: [0, 1], outputRange: [1, BREATH_SCALE] });
  switch (phase) {
    case 'reading':
      return { scale: 1, opacity: 1, halo: HALO_OPACITY, ring: drive };
    case 'response':
      return {
        scale: grow,
        opacity: drive.interpolate({ inputRange: [0, 1], outputRange: [BREATH_DIM, 1] }),
        halo: HALO_OPACITY,
        ring: null,
      };
    case 'silent':
      return {
        scale: 1,
        opacity: 1,
        halo: drive.interpolate({ inputRange: [0, 1], outputRange: [HALO_OPACITY, 1] }),
        ring: null,
      };
    case 'decade':
      return { scale: grow, opacity: 1, halo: HALO_OPACITY, ring: null };
    case 'paused':
    default:
      return { scale: 1, opacity: BREATH_DIM, halo: 0, ring: null };
  }
}

/** 숫자든 흐름이든 배수를 곱한다. */
function times(value: Flow, factor: number): Flow {
  return typeof value === 'number' ? value * factor : Animated.multiply(value, factor);
}

/**
 * 읽는 중 차오르는 테두리 — 원 둘레를 점선 한 토막으로 그리고, 그 토막의 시작점을 밀어
 * 보이는 길이를 늘린다. 맨 위(12시)에서 시작해 시계 방향으로 돈다.
 */
function ReadingRing({ cx, cy, progress, color }: { cx: number; cy: number; progress: Flow; color: string }) {
  const offset =
    typeof progress === 'number'
      ? RING_LENGTH * (1 - progress)
      : progress.interpolate({ inputRange: [0, 1], outputRange: [RING_LENGTH, 0] });
  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={RING_RADIUS}
      fill="none"
      stroke={color}
      strokeWidth={RING_WIDTH}
      strokeDasharray={[RING_LENGTH, RING_LENGTH]}
      strokeDashoffset={offset}
      strokeLinecap="round"
      transform={`rotate(-90 ${cx} ${cy})`}
    />
  );
}

/** 지금 바치는 알 하나 — 상태에 따라 부풀고, 반짝이고, 테두리가 차오르고, 흐려진다. */
function CurrentBead({
  cx,
  cy,
  r,
  shade,
  phase,
  readingMs,
  restartKey,
}: {
  cx: number;
  cy: number;
  r: number;
  shade: string;
  phase: PrayerPhase;
  readingMs: number;
  restartKey: number;
}) {
  const { colors } = useTheme();
  const look = usePhaseLook(phase, readingMs, restartKey);
  const id = gradientIds(PREFIX);
  const shading: Shading = SHADING.current;
  const beadRadius = times(look.scale, r);
  const haloRadius = times(look.scale, HALO_RADIUS);

  /*
   * 상태의 투명도는 무리 전체에 한 번만 건다. 이렇게 하지 않으면 후광이 자기 몫의
   * 14% 를 잃고 42~100% 로 칠해져, 지금 알이 치자색 덩어리가 된다
   * (v5 는 후광에 14% 와 숨 두 가지를 함께 건다).
   */
  return (
    <AnimatedG opacity={look.opacity}>
      <AnimatedCircle cx={cx} cy={cy} r={haloRadius} fill={`url(#${id.halo})`} opacity={look.halo} />
      {look.ring !== null ? <ReadingRing cx={cx} cy={cy} progress={look.ring} color={colors.accentFill} /> : null}
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
 * 키우면 모양이 무너진다. 그래서 **빛무리만** 상태를 따르고 형태는 가만히 둔다. 읽는 중의
 * 테두리는 원이 아니라 타원 둘레라 차오르게 그리지 않고, 대신 타원 테두리가 같은 시간에
 * 걸쳐 짙어진다. 사용자가 받는 신호(숨 · 반짝임 · 맥동 · 흐려짐)는 알과 같다.
 */
function PhaseGlow({
  cx,
  cy,
  rx,
  ry,
  phase,
  readingMs,
  restartKey,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  phase: PrayerPhase;
  readingMs: number;
  restartKey: number;
}) {
  const { colors } = useTheme();
  const look = usePhaseLook(phase, readingMs, restartKey);
  const id = gradientIds(PREFIX);
  return (
    <AnimatedG opacity={look.opacity}>
      <AnimatedEllipse
        cx={cx}
        cy={cy}
        rx={times(look.scale, rx)}
        ry={times(look.scale, ry)}
        fill={`url(#${id.halo})`}
        opacity={look.halo}
      />
      {look.ring !== null ? (
        <AnimatedEllipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={colors.accentFill}
          strokeWidth={RING_WIDTH}
          opacity={look.ring}
        />
      ) : null}
    </AnimatedG>
  );
}

export function Rosary({
  done,
  current,
  focus,
  label,
  rosary,
  phase,
  readingMs = 0,
}: RosaryPlacement & {
  rosary: RosaryKey;
  /** 지금 알의 상태 (FR-15 · `phase.ts`). 세션 갈고리가 준다. */
  phase: PrayerPhase;
  /** 읽는 중 테두리가 차오르는 데 걸릴 시간 — 지금 읽는 절의 어림 길이. 모르면 0. */
  readingMs?: number;
}) {
  const { colors, mode } = useTheme();
  const material = materialFor(mode, rosary);
  /*
   * 알이 바뀌면 상태의 움직임을 처음부터 다시 굴린다. 그래야 소리 없이 진행할 때 알마다
   * 반짝이고, 읽는 중이면 새 절의 길이로 테두리가 다시 차오른다. 십자가와 메달에 머무는
   * 단계는 알 번호가 없으므로(-1) 어느 자리인지를 함께 섞어 준다.
   */
  const restartKey = current >= 0 ? current : focus === 'cross' ? -2 : -3;
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
        <BeadGradients prefix={PREFIX} material={material} accent={colors.accentFill} mode={mode} />
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
        <PhaseGlow
          cx={CROSS.x}
          cy={CROSS.top + 13 * CROSS_SCALE}
          rx={22}
          ry={19}
          phase={phase}
          readingMs={readingMs}
          restartKey={restartKey}
        />
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
        <PhaseGlow
          cx={MEDAL.x}
          cy={MEDAL.y}
          rx={MEDAL_SIZE.rx * 2.6}
          ry={MEDAL_SIZE.ry * 2.2}
          phase={phase}
          readingMs={readingMs}
          restartKey={restartKey}
        />
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

      {/*
        이미 바친 알들의 빛무리 — 알보다 **먼저 한꺼번에** 깐다.

        빛무리는 이웃 알까지 덮을 만큼 넓다. 알을 하나 그리고 그 위에 다음 알의 빛무리를
        얹으면 앞의 알이 흰빛에 씻겨 색을 잃으므로, 빛은 빛끼리 겹쳐 하나의 띠를 이루게
        하고 알은 그 띠 위에 온전히 올라서게 한다. 알 사이가 좁아 빛무리끼리 실제로
        겹치며, 그래서 바친 구간이 낱낱의 점이 아니라 **이어진 빛의 띠**로 읽힌다.
      */}
      <G>
        {BEADS.map((bead, i) =>
          i < done && i !== current ? (
            <BeadGlow
              key={i}
              cx={bead.x}
              cy={bead.y}
              r={bead.big ? BEAD_RADIUS.big : BEAD_RADIUS.small}
              prefix={PREFIX}
              mode={mode}
            />
          ) : null,
        )}
      </G>

      {/* 알 쉰아홉. 지금 알은 이웃 위에 얹혀야 하므로 여기서 빼고 맨 나중에 그린다. */}
      {BEADS.map((bead, i) => {
        if (i === current) return null;
        const r = bead.big ? BEAD_RADIUS.big : BEAD_RADIUS.small;
        return (
          <Bead
            key={i}
            cx={bead.x}
            cy={bead.y}
            r={r}
            fill={bead.big ? material.bigBead : material.bead}
            material={material}
            prefix={PREFIX}
            lit={i < done}
          />
        );
      })}

      {/* 지금 바치는 알 — 이웃보다 세 배 넘게 부풀어 맨 위에 얹히고, 상태를 몸으로 말한다. */}
      {spot ? (
        <CurrentBead
          cx={spot.x}
          cy={spot.y}
          r={BEAD_RADIUS.current}
          shade={material.shade}
          phase={phase}
          readingMs={readingMs}
          restartKey={restartKey}
        />
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
