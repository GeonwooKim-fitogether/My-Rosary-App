/**
 * 묵주 그림 — 「MyRosary World」 시안의 기도 화면 묵주를 옮긴 것.
 *
 * 이 그림이 그리는 것은 **실제 묵주와 같은 쉰아홉 알**이다(`decisions.md` 결정 6).
 * 알이 어디에 있는지는 이 파일이 정하지 않는다 — `rosaryState.ts` 가 시안의 원형 고리
 * 기하로 계산하고, 여기서는 받아 그리기만 한다. 알에 무슨 빛깔을 칠하는지도 이 파일이
 * 정하지 않는다 — `rosaryMaterials.ts` 의 재질 표가 정하고, 빛과 그늘을 얹는 붓은
 * `beadPaint.tsx` 다. 이 파일이 하는 일은 셋을 한 그림으로 조립하고 **지금 자리를 빛으로
 * 말하는** 것뿐이다.
 *
 * ── 2026-09-17 에 무엇이 바뀌었나 (`decisions.md` 결정 12-2 의 카드 D) ────────────
 *
 * 세 가지다.
 *
 * 1. **고리가 물방울에서 정원이 됐다.** 좌표계도 v5 의 `390×281` 에서 시안의 `240×324`
 *    로 바뀌었다. 바뀐 값은 모두 `rosaryState.ts` 에 있고 이 파일은 그 값을 읽는다.
 * 2. **지금 알을 부풀리지 않는다.** 옛 판은 지금 알만 반지름 17 로 키워 눈이 갈 곳을
 *    만들었는데, 시안은 알을 제자리에 두고 **빛만 옮긴다**. 그래서 지금 알의 크기는 그 알
 *    본래의 크기이고, 그 위에 빛무리(알 반지름 + 6)와 테(+ 3)가 얹힌다.
 * 3. **그림이 어두운 덮개 위에 선다.** 기도 화면이 한지 바탕에서 성화와 지역 덮개 위로
 *    옮겨 갔으므로(W1), 이 그림은 언제나 **밤 벌의 재질**로 그린다 — 낮 벌의 금·나무는
 *    밝은 종이 위에서 읽히도록 어둡게 가라앉힌 값이라 어두운 덮개 위에서는 묻힌다.
 *    그래서 이 파일은 낮과 밤을 갈라 받지 않고, 어두운 바탕 하나만 전제한다.
 *
 * **바뀌지 않은 것**도 적어 둔다. 알 쉰아홉을 다 그리는 것(결정 6), 고리가 오른쪽으로
 * 도는 것(결정 7), 그리고 **진행을 채우기가 아니라 빛으로 말하는 것**(결정 10)은 그대로다.
 * 아직 안 바친 알도 이미 바친 알도 재질의 빛깔로 똑같이 꽉 차 있고, 갈리는 것은 이미 바친
 * 알이 빛무리를 두르고 환해진다는 점뿐이다 — 실제 묵주는 기도한다고 알이 채워지지 않는다.
 *
 * ── 지금 자리는 다섯 상태를 구분해 보인다 (FR-15 · `phase.ts`) ────────────────────
 *
 * 시안의 지금 알은 상태가 하나뿐이다(4초 주기로 테가 숨을 쉰다). 이 앱은 진행기가 알리는
 * 다섯 상태를 그려야 하므로, 그 하나를 다섯으로 갈라 **시안의 빛무리와 테 위에** 얹었다.
 *
 * | 상태 | 움직임이 있는 기기에서 | 동작 줄이기를 켠 기기에서 (정지된 모양의 차이) |
 * |---|---|---|
 * | 읽는 중 `reading` | 테가 시계 방향으로 차오른다 — 읽는 절의 어림 길이에 맞춰 | 테가 다 차 있다 |
 * | 내 차례 `response` | 4초 주기로 부풀며 밝아졌다 어두워진다 (시안의 `mrPulse`) | 지금까지의 모습 그대로 |
 * | 소리 없이 진행 `silent` | 알을 넘기는 진동에 맞춰 빛무리가 한 번 반짝이고 가라앉는다 | 빛무리가 평소보다 짙다 |
 * | 단 전환 `decade` | 한 번 크게 부풀었다 돌아온다 | 부푼 채 서 있다 |
 * | 멈춤 `paused` | 호흡이 멎고 빛무리가 꺼지며 흐려진다 | 같다 — 움직임이 없는 상태다 |
 *
 * 숨쉬기는 CSS 의 `transform: scale()` 대신 반지름을 직접 키운다 — React Native 에는 SVG
 * 도형 자신을 중심으로 삼는 `transform-box: fill-box` 가 없어, 크기를 키우면 뷰박스 원점을
 * 기준으로 자리가 함께 밀리기 때문이다. 반지름을 키우면 중심이 그대로 있으므로 눈에는
 * 같은 움직임으로 보인다.
 *
 * ── 성모송의 몇째 알인가는 이제 그림이 적지 않는다 ────────────────────────────────
 *
 * 옛 판은 부푼 지금 알(반지름 17) 안에 숫자를 적었다. 시안의 지금 알은 본래 크기(3.7)라
 * 그 안에 글자가 들어가지 않으므로, 그 숫자는 시안이 둔 자리 — 기도문 제목 옆의 세는 줄
 * (`4 / 10`) — 로 옮겼다(`app/pray.tsx` 의 `pray-counter`). 정보는 그대로 있고 자리만
 * 바뀌었으며, 옮긴 자리가 더 크고 화면 낭독기도 읽는다.
 */
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Stop } from 'react-native-svg';
import { onScrim } from '../theme/worldTokens';
import type { RosaryKey } from '../storage/settings';
import type { PrayerPhase } from './phase';
import { Bead, BeadGlow, BeadGradients, Cross, Medal, gradientIds } from './beadPaint';
import { DECADE_PULSE_MS } from './phase';
import { materialFor } from './rosaryMaterials';
import { useReduceMotion } from './useReduceMotion';
import {
  BEADS,
  BEAD_RADIUS,
  CROSS,
  CROSS_FOCUS,
  FOCUS_OFFSET,
  LOOP,
  LOOP_PATH,
  MEDAL,
  MEDAL_FOCUS,
  TAIL_LINE,
  VIEWBOX,
  type FocusSpot,
  type RosaryPlacement,
} from './rosaryState';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * 어두운 덮개 위에 선다는 전제. 재질 표는 낮과 밤 두 벌인데 이 그림은 **언제나 밤 벌**을 쓴다.
 *
 * ── "밤 벌은 접었다는데 왜 여기 쓰이나" ─────────────────────────────────────────
 *
 * 다음에 이 파일을 여는 사람이 반드시 묻는 질문이라 먼저 답해 둔다. `decisions.md` 결정
 * 12-2 의 카드 F 가 접은 것은 **앱 전체를 쪽빛으로 칠하는 밤 테마**(설정의 `낮과 밤`)이고,
 * 여기서 쓰는 것은 **어두운 바탕 위에서 읽히라고 만든 재질 색 한 벌**이다. 둘은 같은 파일
 * (`rosaryMaterials.ts`)에 나란히 있지만 서로 다른 것이며, 접힌 것은 앞의 것뿐이다.
 *
 * 그래서 이 그림은 `ThemeMode` 로 낮·밤을 고르지 않는다. 기도 화면은 성화와 지역 덮개
 * 위에 서므로 **언제나 어둡고**, 어두운 바탕에서 읽히는 벌은 하나뿐이기 때문이다.
 *
 * 값으로 확인한 사실이 그 판단의 근거다. 지역 다섯의 덮개 색 위에서 재질 넷의 색을 스무
 * 조합씩 재면, 낮 벌은 가장 빠듯한 값이 **1.31** 로 스무 조합이 전부 기준(3:1)에 미달하고,
 * 밤 벌은 가장 빠듯한 값이 **4.04** 로 전부 통과한다. 이 계산은 눈이 아니라
 * `rosaryMaterials.test.ts` 의 마지막 묶음이 다섯 지역 전부에 대해 매번 다시 한다.
 */
const SURFACE = 'night' as const;

/** 숨의 크기 폭. 시안 `mrPulse` 의 `scale(1.12)`. 단 전환의 확장 맥동도 같은 폭까지 부푼다. */
const BREATH_SCALE = 1.12;
/** 숨 한 번의 길이. 시안 `mrPulse` 의 `2.6s`. */
const BREATH_MS = 2600;
/** 숨의 가장 어두운 끝. 시안 `mrPulse` 의 `opacity:.45`. 멈춤의 흐려짐도 이 값에 세운다. */
const BREATH_DIM = 0.45;
/** 지금 자리의 빛무리 짙기. 시안의 `opacity=".85"`. */
const HALO_OPACITY = 0.85;
/**
 * 소리 없이 진행할 때 반짝임이 가라앉는 시간. 06-design-system §6 의 **글자 교체 450ms**.
 * 시안에 반짝임이 없어, 알이 넘어갈 때 함께 일어나는 움직임(기도문 글자가 바뀌는 것)의
 * 값을 골랐다. 반짝임은 완전히 밝은 끝(1)에서 평소 짙기(.85)로 내려온다.
 */
const FLASH_MS = 450;
/**
 * 동작 줄이기를 켠 기기에서 "소리 없이 진행"이 서 있을 때의 빛무리 짙기. 움직임 없이도
 * 내 차례(.85)와 갈리게, 반짝임이 지나는 길의 밝은 끝에 세웠다.
 */
const FLASH_STILL_OPACITY = 1;
/** 테의 굵기. 시안의 `stroke-width="1"`. */
const RING_WIDTH = 1;
/** 읽는 길이를 모를 때의 테두리 시간 — 신비 선포의 고정 사이와 같은 2200ms 를 쓴다. */
const RING_FALLBACK_MS = 2200;

/** 이 그림의 그러데이션 이름 앞가지. 한 화면에 묵주는 하나뿐이라 고정 이름으로 족하다. */
const PREFIX = 'rosaryBead';
/** 고리 안쪽에 까는 옅은 그늘의 이름. 시안의 `mrCenter`. */
const CENTER_ID = 'rosaryCenter';

/** 줄의 굵기. 시안의 고리 줄과 꼬리 줄은 둘 다 `stroke-width="1"` 이다. */
const THREAD = { outer: 1.8, core: 0.8 } as const;

/**
 * 사슬로 그릴 때의 마디 길이.
 *
 * 은·금 묵주는 끈이 아니라 사슬 고리로 이어진다(공방장이 보낸 사진). 고리를 하나하나
 * 그리는 대신 **선을 끊어** 그려 마디가 보이게 했다 — 이 크기에서는 고리를 그려도 점으로
 * 뭉치고, 끊어 그린 쪽이 오히려 사슬로 읽힌다.
 */
const CHAIN_DASH = [2.4, 1.4];

/** 어떤 값이 흐름(Animated)일 수도, 그냥 숫자일 수도 있다. 정지 화면에서는 숫자다. */
type Flow = number | Animated.Value | Animated.AnimatedInterpolation<number>;

/** 지금 자리를 그리는 데 필요한 값 넷. */
interface PhaseLook {
  /** 알과 빛무리와 테의 크기 배수. 1 이 본래 크기다. */
  scale: Flow;
  /** 무리 전체의 투명도. 숨의 어두운 끝이 .45, 멈춤도 .45 다. */
  opacity: Flow;
  /** 빛무리의 짙기. 평소 .85, 멈추면 0. */
  halo: Flow;
  /** 읽는 중 테가 차오른 정도 0~1. 읽는 중이 아니면 null — 테는 차오르지 않고 그냥 선다. */
  ring: Flow | null;
}

/**
 * 상태(phase)를 그림의 값으로 옮긴다.
 *
 * 움직임이 있는 기기에서는 흐름(Animated) 하나를 상태마다 다르게 굴리고, 동작 줄이기를 켠
 * 기기에서는 상태마다 정해진 숫자를 그대로 준다. 두 표는 파일 머리의 표와 같다.
 *
 * `restartKey` 가 바뀌면 흐름을 처음부터 다시 굴린다 — 알이 바뀔 때마다 반짝임이 다시
 * 일어나고 테가 다시 차오르게 하려는 것이다.
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
      // 시안 `mrPulse` — 2.6초에 한 번, 0 → 1 → 0.
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
      // 테가 읽는 절의 어림 길이에 맞춰 차오른다. 실제 낭송이 어림보다 짧으면 다음 상태가
      // 먼저 와서 테가 걷히고, 길면 다 찬 채로 기다린다 — 어느 쪽도 거짓을 말하지 않는다.
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
 * 읽는 중 차오르는 테 — 원 둘레를 점선 한 토막으로 그리고, 그 토막의 시작점을 밀어 보이는
 * 길이를 늘린다. 맨 위(12시)에서 시작해 시계 방향으로 돈다.
 */
function ReadingRing({
  cx,
  cy,
  r,
  progress,
}: {
  cx: number;
  cy: number;
  r: number;
  progress: Flow;
}) {
  const length = 2 * Math.PI * r;
  const offset =
    typeof progress === 'number'
      ? length * (1 - progress)
      : progress.interpolate({ inputRange: [0, 1], outputRange: [length, 0] });
  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke={onScrim.beadRing}
      strokeWidth={RING_WIDTH}
      strokeDasharray={[length, length]}
      strokeDashoffset={offset}
      strokeLinecap="round"
      transform={`rotate(-90 ${cx} ${cy})`}
    />
  );
}

/**
 * 지금 자리 — 빛무리와 테와 알을 겹쳐 그린다. 시안의 `cur` 무리와 같은 순서다.
 *
 * 알 반지름이 0 인 자리(십자가)는 알을 그리지 않고 빛무리와 테만 두른다 — 십자가는 경로로
 * 그리므로 그 위에 동그라미를 겹치면 십자가가 가려지기 때문이다. 시안도 같게 한다.
 */
function FocusMark({
  spot,
  phase,
  readingMs,
  restartKey,
}: {
  spot: FocusSpot;
  phase: PrayerPhase;
  readingMs: number;
  restartKey: number;
}) {
  const look = usePhaseLook(phase, readingMs, restartKey);
  const id = gradientIds(PREFIX);

  /*
   * 상태의 투명도는 무리 전체에 한 번만 건다. 이렇게 하지 않으면 빛무리가 자기 몫의
   * 짙기를 잃고 두 값이 곱해져, 지금 자리가 상태에 따라 사라지거나 덩어리가 된다.
   */
  return (
    <AnimatedG opacity={look.opacity}>
      <AnimatedCircle
        cx={spot.x}
        cy={spot.y}
        r={times(look.scale, spot.glow)}
        fill={`url(#${id.halo})`}
        opacity={look.halo}
      />
      {look.ring !== null ? (
        <ReadingRing cx={spot.x} cy={spot.y} r={spot.ring} progress={look.ring} />
      ) : (
        <AnimatedCircle
          cx={spot.x}
          cy={spot.y}
          r={times(look.scale, spot.ring)}
          fill="none"
          stroke={onScrim.beadRing}
          strokeWidth={RING_WIDTH}
        />
      )}
      {spot.r > 0 ? (
        <AnimatedCircle
          cx={spot.x}
          cy={spot.y}
          r={times(look.scale, spot.r)}
          fill={onScrim.bead}
          stroke={onScrim.beadEdge}
          strokeWidth={RING_WIDTH}
        />
      ) : null}
    </AnimatedG>
  );
}

export function Rosary({
  done,
  current,
  focus,
  rosary,
  phase,
  readingMs = 0,
  height,
}: RosaryPlacement & {
  rosary: RosaryKey;
  /** 지금 알의 상태 (FR-15 · `phase.ts`). 세션 갈고리가 준다. */
  phase: PrayerPhase;
  /** 읽는 중 테가 차오르는 데 걸릴 시간 — 지금 읽는 절의 어림 길이. 모르면 0. */
  readingMs?: number;
  /**
   * 그림의 높이(논리 픽셀). 가로는 좌표계의 비율(240:324)로 여기서 계산한다.
   *
   * 크기를 밖에서 받는 이유는 시안이 높이를 화면 크기로 정하기 때문이다 —
   * `min(38dvh, 66vw × 1.35, 400px)` 이고, 그 계산은 화면 크기를 아는 `app/pray.tsx` 가 한다.
   */
  height: number;
}) {
  const material = materialFor(SURFACE, rosary);
  /*
   * 자리가 바뀌면 상태의 움직임을 처음부터 다시 굴린다. 그래야 소리 없이 진행할 때 알마다
   * 반짝이고, 읽는 중이면 새 절의 길이로 테가 다시 차오른다. 십자가와 메달에 머무는
   * 단계는 알 번호가 없으므로(-1) 어느 자리인지를 함께 섞어 준다.
   */
  const restartKey = current >= 0 ? current : focus === 'cross' ? -2 : -3;
  const spot = current >= 0 ? BEADS[current] : undefined;
  const dash = material.link === 'chain' ? CHAIN_DASH : undefined;
  const width = (height * VIEWBOX.width) / VIEWBOX.height;

  /** 지금 빛나는 자리 — 알 하나이거나, 중심 메달이거나, 십자가다. */
  const focusSpot: FocusSpot | null = spot
    ? {
        x: spot.x,
        y: spot.y,
        r: spot.big ? BEAD_RADIUS.big : BEAD_RADIUS.small,
        glow: (spot.big ? BEAD_RADIUS.big : BEAD_RADIUS.small) + FOCUS_OFFSET.glow,
        ring: (spot.big ? BEAD_RADIUS.big : BEAD_RADIUS.small) + FOCUS_OFFSET.ring,
      }
    : focus === 'medal'
      ? MEDAL_FOCUS
      : focus === 'cross'
        ? CROSS_FOCUS
        : null;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      testID="rosary"
    >
      <Defs>
        <BeadGradients prefix={PREFIX} material={material} accent={onScrim.glow} mode={SURFACE} />
        {/* 고리 안쪽의 옅은 그늘. 시안의 `mrCenter` — 성화 위에서 고리 안이 가라앉게 한다. */}
        <RadialGradient id={CENTER_ID} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#000000" stopOpacity={0.22} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      <Circle cx={LOOP.cx} cy={LOOP.cy} r={LOOP.r} fill={`url(#${CENTER_ID})`} />

      {/*
        줄 — 알을 꿴 고리와 아래로 늘어진 줄. 고리는 **알을 놓는 데 쓴 각도 그 자체**로
        그린다(`LOOP_PATH`). 둘이 다른 식으로 그려지면 알이 줄에서 떠 보인다.
      */}
      <G>
        <Path d={LOOP_PATH} fill="none" stroke={material.thread} strokeWidth={THREAD.outer} strokeDasharray={dash} opacity={0.3} />
        <Path d={LOOP_PATH} fill="none" stroke={material.thread} strokeWidth={THREAD.core} strokeDasharray={dash} opacity={0.9} />
        <Line x1={TAIL_LINE.x} y1={TAIL_LINE.top} x2={TAIL_LINE.x} y2={TAIL_LINE.bottom} stroke={material.thread} strokeWidth={THREAD.outer} strokeDasharray={dash} opacity={0.3} />
        <Line x1={TAIL_LINE.x} y1={TAIL_LINE.top} x2={TAIL_LINE.x} y2={TAIL_LINE.bottom} stroke={material.thread} strokeWidth={THREAD.core} strokeDasharray={dash} opacity={0.9} />
      </G>

      {/*
        이미 바친 알들의 빛무리 — 알보다 **먼저 한꺼번에** 깐다 (결정 10).

        빛무리는 이웃 알까지 덮을 만큼 넓다. 알을 하나 그리고 그 위에 다음 알의 빛무리를
        얹으면 앞의 알이 빛에 씻겨 색을 잃으므로, 빛은 빛끼리 겹쳐 하나의 띠를 이루게 하고
        알은 그 띠 위에 온전히 올라서게 한다. 그래서 바친 구간이 낱낱의 점이 아니라
        **이어진 빛의 띠**로 읽힌다.
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
              mode={SURFACE}
            />
          ) : null,
        )}
      </G>

      {/* 알 쉰아홉. 지금 알은 그 위에 빛이 얹히므로 여기서 빼고 맨 나중에 그린다. */}
      {BEADS.map((bead, i) => {
        if (i === current) return null;
        return (
          <Bead
            key={i}
            cx={bead.x}
            cy={bead.y}
            r={bead.big ? BEAD_RADIUS.big : BEAD_RADIUS.small}
            fill={bead.big ? material.bigBead : material.bead}
            material={material}
            prefix={PREFIX}
            lit={i < done}
          />
        );
      })}

      {/*
        중심 메달 — 늘어진 줄과 고리가 만나는 패다. 알이 아니므로 원이 아니라 세로로 긴
        타원으로 그리고, 그 재질의 금속 빛깔로 채운다. 시작 기도의 영광송과 마침 기도를
        바치는 자리이고, 그때 여기가 빛난다.
      */}
      <Medal
        cx={MEDAL.x}
        cy={MEDAL.y}
        rx={MEDAL.rx}
        ry={MEDAL.ry}
        fill={material.metal}
        material={material}
        prefix={PREFIX}
      />

      {/* 십자고상. 성호경·십자가에 입맞춤·사도신경을 바치는 자리다. */}
      <Cross x={CROSS.x} top={CROSS.top} fill={material.metal} material={material} />

      {/* 지금 자리 — 빛무리와 테가 맨 위에 얹혀 상태를 몸으로 말한다. */}
      {focusSpot ? (
        <FocusMark
          spot={focusSpot}
          phase={phase}
          readingMs={readingMs}
          restartKey={restartKey}
        />
      ) : null}
    </Svg>
  );
}
