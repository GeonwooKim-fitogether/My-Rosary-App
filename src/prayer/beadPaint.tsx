/**
 * 알을 칠하는 붓 — 묵주 그림(`Rosary.tsx`)과 재질 미리보기(`RosaryPreview.tsx`)가 함께 쓴다.
 *
 * 둘로 갈라 둔 이유는 하나다. **고르는 자리에서 본 알과 기도하며 보는 알이 같아야 한다.**
 * 미리보기가 따로 그리면 "고를 때는 이랬는데 기도할 때는 저렇다"가 되고, 그러면 미리보기가
 * 거짓말을 하는 셈이다. 그래서 빛·그늘·테를 얹는 일을 여기 한 군데 모았다.
 *
 * ── 입체를 만드는 재료 (2026-09-09 이전부터 이어지는 규칙) ────────────────────────
 *
 * 빛은 **언제나 왼쪽 위에서** 온다. 알 쉰아홉이 모두 같은 방향으로 밝고 어두워야 한 벌의
 * 구슬로 보이기 때문이다. 흐림 필터(`feGaussianBlur`)는 쓰지 않는다 — 웹과 네이티브에서
 * 지원이 갈리므로, 흐림이 필요한 자리는 전부 투명도를 달리한 도형을 겹쳐 만들었다.
 *
 * 재질이 바꾸는 것은 그 빛이 **얼마나 좁게 맺히는가**다(`RosaryMaterial.sheen`). 금속은
 * 좁고 또렷하게, 나무는 넓고 무디게 맺힌다. 그 하나로 사진의 금속 구슬과 나무 알이 갈린다.
 *
 * ── 상태를 말하는 것은 채우기가 아니라 빛이다 (2026-09-10, `decisions.md` 결정 10) ──
 *
 * 알 쉰아홉은 **언제나 같은 모습의 꽉 찬 알**이다. 아직 안 바친 알을 빈 동그라미로 그리던
 * 방식은 없앴다 — 실제 묵주는 기도한다고 알이 채워지지 않기 때문이다. 어디까지 바쳤는가는
 * 이미 바친 알이 **환해지는 것**으로만 말한다. 그 환해짐을 만드는 값(빛무리의 색·짙기·
 * 크기와 상태별 빛의 세기)은 `rosaryMaterials.ts` 의 `BEAD_GLOW` 와 `BEAD_SHADING` 이
 * 갖고 있고, 이 파일은 그 값을 도형으로 옮기기만 한다.
 */
import type { ReactNode } from 'react';
import { Animated } from 'react-native';
import { Circle, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';
import { BEAD_GLOW, BEAD_SHADING } from './rosaryMaterials';
import type { RosaryMaterial } from './rosaryMaterials';
import type { ThemeMode } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** 숨 쉬는 알은 반지름이 애니메이션 값이라 숫자와 애니메이션 값을 모두 받는다. */
export type Radius = number | Animated.AnimatedInterpolation<number>;

/**
 * 상태마다 빛과 그늘을 얼마나 얹는가.
 *
 * 값 자체는 `rosaryMaterials.ts` 의 `BEAD_SHADING` 이 갖는다. 값을 그 파일에 둔 이유는
 * 시험 때문이다 — 그 파일은 화면 없이 읽히므로, "바친 알이 정말 더 밝은가"를 렌더 없이
 * 못 박을 수 있다. 여기서는 그 표를 그대로 다시 내보내, 그리는 쪽이 붓 하나만 들여다보면
 * 되게 한다.
 */
export const SHADING = BEAD_SHADING;

export type Shading = (typeof SHADING)[keyof typeof SHADING];

/**
 * 알 크기에 매달린 비율들. 반지름 18.4 짜리 알에 맞춰 적혀 있던 값을 그 반지름으로
 * 나눠 얻은 것이라, 알이 커지든 작아지든 같은 그림이 나온다.
 */
export const RATIO = {
  /** 알 아래 그림자가 밀리는 거리. 빛이 왼쪽 위에서 오므로 오른쪽 아래로 밀린다. */
  contactX: 1.6 / 18.4,
  contactY: 2.2 / 18.4,
  /** 알에 두르는 테의 굵기. 상태와 무관하게 같고, 짙기만 상태가 정한다. */
  rim: 0.9 / 18.4,
} as const;

/** 아주 작은 알에서도 테가 사라지지 않게 하는 바닥값. */
export function strokeWidthFor(radius: number, ratio: number, floor: number): number {
  return Math.max(floor, radius * ratio);
}

/** 한 그림 안에서 쓰는 그러데이션 이름들. 그림이 여럿 떠 있어도 섞이지 않게 앞가지를 붙인다. */
export function gradientIds(prefix: string) {
  return {
    light: `${prefix}Light`,
    shade: `${prefix}Shade`,
    halo: `${prefix}Halo`,
    glow: `${prefix}Glow`,
  };
}

/**
 * 그러데이션 넷을 정의한다. `<Defs>` 안에 넣어 쓴다.
 *
 * 빛의 반지름과 가운데 짙기를 `sheen` 하나에서 계산하는 것이 이 함수의 핵심이다.
 * 광택이 높을수록(금속) 반지름이 작아지고 가운데 밖은 빠르게 사라져, 빛이 한 점에
 * 맺힌 것처럼 보인다. 광택이 낮으면(나무) 넓게 퍼져 무광의 결이 된다.
 */
export function BeadGradients({
  prefix,
  material,
  accent,
  mode,
}: {
  prefix: string;
  material: RosaryMaterial;
  /** 지금 알과 그 빛무리에 쓰는 치자색. 재질과 무관한 **상태의 색**이다. */
  accent: string;
  /** 낮인가 밤인가. 이미 바친 알을 두르는 빛의 색이 벌마다 다르다. */
  mode: ThemeMode;
}): ReactNode {
  const id = gradientIds(prefix);
  const reach = 0.8 - 0.45 * material.sheen;
  const spread = 0.05 + 0.26 * (1 - material.sheen);
  const glow = BEAD_GLOW[mode];
  return (
    <>
      {/* 왼쪽 위에서 오는 빛. */}
      <RadialGradient id={id.light} cx="32%" cy="26%" r={`${(reach * 100).toFixed(1)}%`}>
        <Stop offset="0" stopColor={material.light} stopOpacity={1} />
        <Stop offset="0.5" stopColor={material.light} stopOpacity={spread} />
        <Stop offset="1" stopColor={material.light} stopOpacity={0} />
      </RadialGradient>
      {/* 그 반대쪽에 지는 그늘. 알의 아래 오른쪽이 말려 들어가 보이게 한다. */}
      <RadialGradient id={id.shade} cx="74%" cy="78%" r="82%">
        <Stop offset="0" stopColor={material.shade} stopOpacity={1} />
        <Stop offset="0.55" stopColor={material.shade} stopOpacity={0.22} />
        <Stop offset="1" stopColor={material.shade} stopOpacity={0} />
      </RadialGradient>
      {/*
        지금 알을 두르는 후광. 알의 가장자리에서 바깥으로 **번지게** 만들어, 흐림 필터 없이
        빛무리를 얻는다.
      */}
      <RadialGradient id={id.halo} cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor={accent} stopOpacity={1} />
        <Stop offset="0.56" stopColor={accent} stopOpacity={1} />
        <Stop offset="0.8" stopColor={accent} stopOpacity={0.52} />
        <Stop offset="1" stopColor={accent} stopOpacity={0} />
      </RadialGradient>
      {/*
        이미 바친 알을 두르는 빛. 알이 덮는 안쪽(반지름의 54% 까지)은 온전한 짙기로 두고
        그 바깥부터 사라지게 해, 알의 가장자리에서 빛이 새어 나오는 것처럼 보이게 한다.
        중간 정지점(0.78)을 둔 것은 빛이 알에 바짝 붙어 있게 하려는 것이다 — 그 정지점이
        없으면 빛이 고르게 옅어져 안개처럼 퍼지고, 그러면 알이 아니라 화면이 뿌예진다.
      */}
      <RadialGradient id={id.glow} cx="50%" cy="50%" r="50%">
        <Stop offset="0" stopColor={glow.color} stopOpacity={1} />
        <Stop offset="0.54" stopColor={glow.color} stopOpacity={1} />
        <Stop offset="0.78" stopColor={glow.color} stopOpacity={0.5} />
        <Stop offset="1" stopColor={glow.color} stopOpacity={0} />
      </RadialGradient>
    </>
  );
}

/**
 * 이미 바친 알 밑에 까는 빛무리.
 *
 * **알보다 먼저, 그리고 알 쉰아홉을 그리기 전에 한꺼번에** 그린다. 빛무리는 이웃 알까지
 * 덮을 만큼 넓은데, 알을 하나 그리고 그 위에 다음 알의 빛무리를 얹으면 앞의 알이 흰빛에
 * 씻겨 색을 잃기 때문이다. 빛은 빛끼리 겹쳐야 띠가 되고, 알은 그 띠 위에 온전히 올라선다.
 */
export function BeadGlow({
  cx,
  cy,
  r,
  prefix,
  mode,
}: {
  cx: number;
  cy: number;
  r: number;
  prefix: string;
  mode: ThemeMode;
}): ReactNode {
  const id = gradientIds(prefix);
  const glow = BEAD_GLOW[mode];
  return (
    <Circle
      cx={cx}
      cy={cy}
      r={r * glow.radius}
      fill={`url(#${id.glow})`}
      opacity={glow.opacity}
    />
  );
}

/** 알 하나에 얹는 빛·그늘·테. 알의 채움 위에 겹쳐 그린다. */
export function BeadShading({
  cx,
  cy,
  r,
  base,
  shading,
  shade,
  prefix,
}: {
  cx: number;
  cy: number;
  r: Radius;
  /** 비율을 재는 기준이 되는 반지름. 숨 쉬는 알은 반지름이 값이 아니라 흐름이라 따로 받는다. */
  base: number;
  shading: Shading;
  shade: string;
  prefix: string;
}): ReactNode {
  const id = gradientIds(prefix);
  return (
    <>
      <AnimatedCircle cx={cx} cy={cy} r={r} fill={`url(#${id.light})`} opacity={shading.light} />
      <AnimatedCircle cx={cx} cy={cy} r={r} fill={`url(#${id.shade})`} opacity={shading.shade} />
      {shading.rim > 0 ? (
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={shade}
          strokeWidth={strokeWidthFor(base, RATIO.rim, 0.3)}
          opacity={shading.rim}
        />
      ) : null}
    </>
  );
}

/** 알이 줄 위에 얹혀 있다는 것을 알리는 아주 옅은 그림자. */
export function BeadContact({
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
}): ReactNode {
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

/**
 * 알 하나 — 재질의 빛깔로 채우고 빛과 그늘을 얹는다.
 *
 * **이미 바친 알과 아직 안 바친 알이 이 함수 하나로 그려진다.** 둘의 채우는 색도, 크기도,
 * 자리도 같다. 갈리는 것은 `lit` 이 고르는 빛과 그늘의 세기뿐이며, 바친 알은 빛을 더 받고
 * 그늘을 덜 져서 환해진다. 그 바깥의 빛무리는 `BeadGlow` 가 따로, 그리고 먼저 그린다.
 *
 * 그전까지 아직 안 바친 알은 테만 두른 빈 동그라미였다(2026-09-09 까지의 `PendingBead`).
 * 공방장이 그 방식을 뒤집은 경위는 `decisions.md` 결정 10 에 있다.
 */
export function Bead({
  cx,
  cy,
  r,
  fill,
  material,
  prefix,
  lit,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  material: RosaryMaterial;
  prefix: string;
  /** 이미 바친 알인가. */
  lit: boolean;
}): ReactNode {
  const shading = lit ? SHADING.lit : SHADING.unlit;
  return (
    <>
      <BeadContact cx={cx} cy={cy} r={r} base={r} shading={shading} shade={material.shade} />
      <Circle cx={cx} cy={cy} r={r} fill={fill} />
      <BeadShading
        cx={cx}
        cy={cy}
        r={r}
        base={r}
        shading={shading}
        shade={material.shade}
        prefix={prefix}
      />
    </>
  );
}

/**
 * 십자고상 — 선 두 개였던 것을 면으로 깎았다.
 *
 * 세로 기둥과 가로 들보가 폭 4.6 으로 만나고, 왼쪽 위 모서리에만 빛 한 겹을 얹어 알과
 * 같은 방향에서 빛을 받게 했다. **몸(코르푸스)은 새기지 않았다** — 화면에서 세로 26 ·
 * 가로 30 이라 사람의 형상을 넣으면 형상이 아니라 얼룩이 된다.
 *
 * @param x 십자가의 가로 가운데
 * @param top 십자가의 맨 윗변
 * @param scale 크기 배수. 재질 미리보기가 같은 십자가를 크게 그릴 때 쓴다 — 비율을 손으로
 *   다시 적는 대신 배수만 주어야 두 곳의 십자가가 갈라지지 않는다.
 */
export function Cross({
  x,
  top,
  fill,
  material,
  scale = 1,
}: {
  x: number;
  top: number;
  fill: string;
  material: RosaryMaterial;
  scale?: number;
}): ReactNode {
  // 아래 좌표는 (x, top) 을 원점 삼아 잰 상대값이다. v5 의 십자가 비율 그대로다.
  const l = (dx: number) => x + dx * scale;
  const t = (dy: number) => top + dy * scale;
  const body =
    `M${l(-2.3)} ${t(0)} L${l(2.3)} ${t(0)} L${l(2.3)} ${t(6.3)} L${l(8.5)} ${t(6.3)} ` +
    `L${l(8.5)} ${t(10.9)} L${l(2.3)} ${t(10.9)} L${l(2.3)} ${t(26)} L${l(-2.3)} ${t(26)} ` +
    `L${l(-2.3)} ${t(10.9)} L${l(-8.5)} ${t(10.9)} L${l(-8.5)} ${t(6.3)} L${l(-2.3)} ${t(6.3)} Z`;
  const litEdge =
    `M${l(-2.3)} ${t(26)} L${l(-2.3)} ${t(10.9)} L${l(-8.5)} ${t(10.9)} L${l(-8.5)} ${t(6.3)} ` +
    `L${l(-2.3)} ${t(6.3)} L${l(-2.3)} ${t(0)} L${l(2.3)} ${t(0)}`;
  const shadedEdge =
    `M${l(2.3)} ${t(0)} L${l(2.3)} ${t(6.3)} L${l(8.5)} ${t(6.3)} L${l(8.5)} ${t(10.9)} ` +
    `L${l(2.3)} ${t(10.9)} L${l(2.3)} ${t(26)} L${l(-2.3)} ${t(26)}`;
  return (
    <>
      <Path d={body} fill={fill} />
      <Path d={litEdge} fill="none" stroke={material.light} strokeWidth={0.8 * scale} opacity={0.45} />
      <Path
        d={shadedEdge}
        fill="none"
        stroke={material.shade}
        strokeWidth={0.8 * scale}
        opacity={0.35}
      />
    </>
  );
}

/**
 * 중심 메달 — 늘어진 줄과 고리가 만나는 패다.
 *
 * 알이 아니므로 원이 아니라 세로로 긴 타원이고, 그 재질의 금속 빛깔로 채운다. 알과 달리
 * 속을 채우는 것은 실제 메달이 성모님을 새긴 금속판이기 때문이다 — 테만 두르면 구멍처럼
 * 보인다. 새김은 넣지 않았다. 화면에서 가로 12 · 세로 17 이라 형상이 얼룩이 된다.
 */
export function Medal({
  cx,
  cy,
  rx,
  ry,
  fill,
  material,
  prefix,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
  material: RosaryMaterial;
  prefix: string;
}): ReactNode {
  const id = gradientIds(prefix);
  return (
    <>
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id.light})`} opacity={0.3} />
      <Ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={material.shade}
        strokeWidth={Math.max(0.6, rx * 0.11)}
        opacity={0.45}
      />
    </>
  );
}
