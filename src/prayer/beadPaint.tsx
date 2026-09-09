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
 */
import type { ReactNode } from 'react';
import { Animated } from 'react-native';
import { Circle, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';
import type { RosaryMaterial } from './rosaryMaterials';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** 숨 쉬는 알은 반지름이 애니메이션 값이라 숫자와 애니메이션 값을 모두 받는다. */
export type Radius = number | Animated.AnimatedInterpolation<number>;

/**
 * 상태마다 빛과 그늘을 얼마나 얹는가.
 *
 * 세 상태가 한눈에 갈라지는 것이 이 그림의 일이므로, 입체를 주되 상태의 차이를
 * 잡아먹지 않는 선에서 멈춘다.
 *
 * 지금 알의 테(`current.rim`)를 0.3 에서 0.45 로 올린 것은 금 묵주 때문이다. 금 알의
 * 빛깔이 지금 알의 치자색과 가까워, 테가 옅으면 지금 알이 "큰 금 알"로도 보였다. 테를
 * 짙게 하니 알의 가장자리가 또렷해져 어느 재질에서도 따로 떨어져 보인다.
 */
export const SHADING = {
  done: { light: 0.34, shade: 0.4, rim: 0.5, contact: 0.1 },
  current: { light: 0.26, shade: 0.24, rim: 0.45, contact: 0.1 },
} as const;

export type Shading = (typeof SHADING)[keyof typeof SHADING];

/**
 * 알 크기에 매달린 비율들. 반지름 18.4 짜리 알에 맞춰 적혀 있던 값을 그 반지름으로
 * 나눠 얻은 것이라, 알이 커지든 작아지든 같은 그림이 나온다.
 */
export const RATIO = {
  /** 알 아래 그림자가 밀리는 거리. 빛이 왼쪽 위에서 오므로 오른쪽 아래로 밀린다. */
  contactX: 1.6 / 18.4,
  contactY: 2.2 / 18.4,
  /** 채워진 알에 두르는 테의 굵기. */
  rim: 0.9 / 18.4,
  /** 아직 안 바친 알의 테 굵기. */
  pendingRim: 2.4 / 18.4,
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
}: {
  prefix: string;
  material: RosaryMaterial;
  /** 지금 알과 그 빛무리에 쓰는 치자색. 재질과 무관한 **상태의 색**이다. */
  accent: string;
}): ReactNode {
  const id = gradientIds(prefix);
  const reach = 0.8 - 0.45 * material.sheen;
  const spread = 0.05 + 0.26 * (1 - material.sheen);
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
    </>
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

/** 이미 바친 알 — 재질의 빛깔로 채우고 빛과 그늘을 얹는다. */
export function DoneBead({
  cx,
  cy,
  r,
  fill,
  material,
  prefix,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  material: RosaryMaterial;
  prefix: string;
}): ReactNode {
  return (
    <>
      <BeadContact cx={cx} cy={cy} r={r} base={r} shading={SHADING.done} shade={material.shade} />
      <Circle cx={cx} cy={cy} r={r} fill={fill} />
      <BeadShading
        cx={cx}
        cy={cy}
        r={r}
        base={r}
        shading={SHADING.done}
        shade={material.shade}
        prefix={prefix}
      />
    </>
  );
}

/**
 * 아직 안 바친 알 — 테만 두른다.
 *
 * 채우지 않는 것은 두 가지를 지키기 위해서다(`decisions.md` Q-37). 첫째, 옅게라도 채우면
 * 알이 유리처럼 뿌예져 디자인 시스템 §9-3 의 14번(스큐어모픽 잔재)에 걸린다. 둘째, 성화가
 * 알 뒤로 비쳐 보이게 하려던 v5 의 뜻이 사라진다. 대신 테를 **그 재질의 알 빛깔로 온전한
 * 짙기로** 그려, 아직 안 바친 알에서도 무슨 묵주인지 읽히게 했다(고리의 알 대부분이 늘 이
 * 상태이므로, 여기가 흐리면 재질을 고른 보람이 없다).
 *
 * 테에 빛과 그늘을 나눠 넣어 둥글게 보이게 하는 방법을 먼저 써 봤는데, 렌더해 보니 테의
 * 밝은 쪽이 한지 바탕에 그대로 묻혀 고리의 왼쪽 절반이 유령처럼 사라졌다. 지름이 8.8 밖에
 * 안 되는 테에서는 입체보다 **보이는 것**이 먼저다.
 */
export function PendingBead({
  cx,
  cy,
  r,
  material,
}: {
  cx: number;
  cy: number;
  r: number;
  material: RosaryMaterial;
}): ReactNode {
  return (
    <Circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke={material.bead}
      strokeWidth={strokeWidthFor(r, RATIO.pendingRim, 1)}
    />
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
