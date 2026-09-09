/**
 * 묵주 재질 미리보기 — 고르는 자리(시트 S5)에서 "이 묵주가 어떻게 생겼나"를 보여 준다.
 *
 * 화면 명세가 S5 에 "고르면 즉시 큰 미리보기"를 요구하는데(06-screen-spec 시트 표), 그
 * 자리가 오래 비어 있었다. 채우면서 두 가지를 정했다.
 *
 * **첫째, 묵주 전체를 작게 그리지 않고 몇 알을 크게 확대해 그린다.** 전체를 작게 그리면
 * 알 하나가 지름 3px 이 되어 나무와 금이 같은 점으로 보인다 — 실제로 두 방식을 다 렌더해
 * 눈으로 견주었고, 재질의 차이(빛깔·광택·줄의 생김새)가 실제로 구별되는 쪽은 확대였다.
 * 고르는 사람이 알고 싶은 것은 고리의 모양이 아니라 알의 재질이므로 이쪽이 맞다.
 *
 * **둘째, 알의 다섯 상태를 한 줄에 함께 보인다.** 왼쪽부터 십자고상, 주님의 기도 큰 알,
 * 이미 바친 알 둘, 지금 바치는 알(치자·빛무리), 아직 안 바친 알 둘, 중심 메달이다.
 * 이렇게 두면 "이 묵주에서도 지금 알이 잘 보이는가"를 고르는 자리에서 바로 판단할 수
 * 있다 — 디자인 시스템 §9-3 의 22번이 요구하는 것이 바로 그것이다.
 *
 * 여기서는 숨쉬기를 걸지 않는다. 고르는 화면에서 움직이는 것이 있으면 눈이 그리로 끌려
 * 정작 견주어야 할 알의 빛깔을 보지 못한다.
 */
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Path } from 'react-native-svg';
import { useTheme } from '../theme';
import type { RosaryKey } from '../storage/settings';
import { BeadGradients, Cross, DoneBead, Medal, PendingBead, gradientIds } from './beadPaint';
import { materialFor } from './rosaryMaterials';

/** 미리보기의 좌표계. 폭은 시트 안쪽 폭(390 − 좌우 24)과 같다. */
const BOX = { width: 342, height: 96 } as const;
/** 줄이 지나가는 높이 — 상자의 한가운데다. */
const LINE = BOX.height / 2;

/**
 * 한 줄에 늘어놓는 것들의 가로 자리.
 *
 * 사이를 넉넉히 벌린 것은 기도 화면과 같은 이유다 — 알과 알 사이에 줄이 보여야 하고,
 * 주님의 기도 큰 알은 한 칸 더 떨어져 홀로 놓여야 한다.
 */
const AT = {
  cross: 26,
  big: 84,
  done: [124, 156],
  current: 200,
  pending: [248, 282],
  medal: 318,
} as const;

/** 확대한 크기들. 기도 화면의 비율(작은 알 4.4 · 큰 알 6.1 · 지금 알 17)을 그대로 키웠다. */
const SIZE = { small: 11, big: 15, current: 22, crossScale: 2, medal: { rx: 13, ry: 18 } } as const;
/** 지금 알을 두르는 빛무리. 기도 화면의 1.7 배를 그대로 쓰되 이웃을 덜 덮게 조금 줄였다. */
const HALO = SIZE.current * 1.5;
/** 기도 화면의 후광 짙기와 같다 (v5 의 `opacity=".14"`). */
const HALO_OPACITY = 0.14;
/** 이 그림만의 그러데이션 앞가지. 기도 화면의 것과 섞이지 않게 이름을 따로 둔다. */
const PREFIX = 'rosaryPreview';
/** 줄 굵기와 사슬 마디 — 확대한 만큼 기도 화면보다 굵다. */
const THREAD = { outer: 4.4, core: 2 } as const;
const CHAIN_DASH = [5.4, 3.2];

export function RosaryPreview({ rosary }: { rosary: RosaryKey }) {
  const { colors, mode } = useTheme();
  const material = materialFor(mode, rosary);
  const id = gradientIds(PREFIX);
  const dash = material.link === 'chain' ? CHAIN_DASH : undefined;
  const line = `M${AT.cross} ${LINE} L${AT.medal} ${LINE}`;

  return (
    <View style={styles.box} testID="rosary-preview">
      <Svg width="100%" height={BOX.height} viewBox={`0 0 ${BOX.width} ${BOX.height}`}>
        <Defs>
          <BeadGradients prefix={PREFIX} material={material} accent={colors.accentFill} />
        </Defs>

        <G>
          <Path
            d={line}
            fill="none"
            stroke={material.thread}
            strokeWidth={THREAD.outer}
            strokeDasharray={dash}
            opacity={0.3}
          />
          <Path
            d={line}
            fill="none"
            stroke={material.thread}
            strokeWidth={THREAD.core}
            strokeDasharray={dash}
            opacity={0.9}
          />
        </G>

        <Cross
          x={AT.cross}
          top={LINE - 13 * SIZE.crossScale}
          fill={material.metal}
          material={material}
          scale={SIZE.crossScale}
        />

        <DoneBead
          cx={AT.big}
          cy={LINE}
          r={SIZE.big}
          fill={material.bigBead}
          material={material}
          prefix={PREFIX}
        />
        {AT.done.map((x) => (
          <DoneBead
            key={x}
            cx={x}
            cy={LINE}
            r={SIZE.small}
            fill={material.bead}
            material={material}
            prefix={PREFIX}
          />
        ))}

        {/* 지금 바치는 알 — 어느 재질에서도 같은 치자색으로 한눈에 보여야 한다. */}
        <Circle cx={AT.current} cy={LINE} r={HALO} fill={`url(#${id.halo})`} opacity={HALO_OPACITY} />
        <DoneBead
          cx={AT.current}
          cy={LINE}
          r={SIZE.current}
          fill={colors.accentFill}
          material={material}
          prefix={PREFIX}
        />

        {AT.pending.map((x) => (
          <PendingBead key={x} cx={x} cy={LINE} r={SIZE.small} material={material} />
        ))}

        <Medal
          cx={AT.medal}
          cy={LINE}
          rx={SIZE.medal.rx}
          ry={SIZE.medal.ry}
          fill={material.metal}
          material={material}
          prefix={PREFIX}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { height: BOX.height, justifyContent: 'center' },
});
