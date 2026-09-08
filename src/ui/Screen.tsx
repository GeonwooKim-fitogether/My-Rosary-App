/**
 * 화면들이 함께 쓰는 조각들 — 머리 · 단추 · 리본과 격자.
 *
 * 값은 하나도 새로 정하지 않았다. v5 시안이 화면마다 같은 모양을 반복해 그려 둔 것을
 * 한 곳으로 모은 것뿐이며, 어느 화면의 어느 줄에서 왔는지 조각마다 적어 두었다.
 */
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DayState } from '../journey/session';
import { metrics, metrics2, type as type1, type2, useThemedStyles, type Theme } from '../theme';

/**
 * 화면 머리 — 왼쪽에 자간 넓은 라벨, 오른쪽에 나가는 글, 아래에 괘선 하나.
 * v5 의 `s-home` · `s-new` · `s-journey` · `s-settings` · `s-invite` 가 모두 같은 모양이다.
 */
export function ScreenHeader({
  label,
  action,
  onAction,
  actionTestID,
  wideAction,
}: {
  label: string;
  action?: string;
  onAction?: () => void;
  actionTestID?: string;
  /** 홈의 `설정` 만 자간이 넓다 (v5 `go-settings`). */
  wideAction?: boolean;
}) {
  const styles = useThemedStyles(headerStyles);
  return (
    <View style={styles.header}>
      <Text style={styles.label}>{label}</Text>
      {action ? (
        <Pressable onPress={onAction} accessibilityRole="button" testID={actionTestID} hitSlop={16}>
          <Text style={wideAction ? styles.actionWide : styles.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const headerStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.rule,
    },
    label: { ...type1.label, color: colors.inkMuted },
    action: { ...type2.navLabel, color: colors.inkMuted },
    actionWide: { ...type2.navLabelWide, color: colors.inkMuted },
  });

/** 채운 단추 — 80px, 먹빛 바탕(밤에는 표면 강조), 15px 중간 굵기 글자. */
export function PrimaryButton({
  label,
  onPress,
  testID,
  style,
}: {
  label: string;
  onPress: () => void;
  testID?: string;
  style?: object;
}) {
  const styles = useThemedStyles(buttonStyles);
  return (
    <Pressable
      style={[styles.primary, style]}
      onPress={onPress}
      accessibilityRole="button"
      testID={testID}
    >
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

/** 테두리만 있는 단추 — v5 여정 상세의 `오늘 이어서 바치기`. */
export function OutlineButton({
  label,
  onPress,
  testID,
}: {
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const styles = useThemedStyles(buttonStyles);
  return (
    <Pressable
      style={styles.outline}
      onPress={onPress}
      accessibilityRole="button"
      testID={testID}
    >
      <Text style={styles.outlineLabel}>{label}</Text>
    </Pressable>
  );
}

/** 앞세우지 않는 글 단추 — v5 의 `초대 코드로 들어가기` · `이 여정 그만두기`. */
export function QuietButton({
  label,
  onPress,
  testID,
}: {
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const styles = useThemedStyles(buttonStyles);
  return (
    <Pressable style={styles.quiet} onPress={onPress} accessibilityRole="button" testID={testID}>
      <Text style={styles.quietLabel}>{label}</Text>
    </Pressable>
  );
}

const buttonStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    primary: {
      height: metrics.touchTargetHeight,
      backgroundColor: colors.fill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryLabel: { ...type1.button, color: colors.onFill },
    outline: {
      height: metrics.touchTargetHeight,
      minHeight: metrics.touchTargetHeight,
      flexGrow: 0,
      flexShrink: 0,
      borderWidth: 1,
      borderColor: colors.buttonBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outlineLabel: { ...type1.button, color: colors.ink },
    quiet: {
      height: metrics.touchTargetHeight,
      minHeight: metrics.touchTargetHeight,
      flexGrow: 0,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quietLabel: { ...type1.tertiary, color: colors.inkMuted },
  });

/** 54칸 리본 — 하루가 한 칸이다. 높이만 화면마다 다르다 (홈 22 · 하루 완주 26 · 완주 30). */
export function Ribbon({
  days,
  height,
  testID,
}: {
  days: readonly DayState[];
  height: number;
  testID?: string;
}) {
  const { cell } = useThemedStyles(cellPalette);
  return (
    <View style={ribbonStyles.row} testID={testID}>
      {days.map((state, index) => (
        <View key={index} style={{ flex: 1, height, backgroundColor: cell[state] }} />
      ))}
    </View>
  );
}

/**
 * 같은 칸을 아홉 열 격자로 — v5 여정 상세의 `grid-journey`.
 *
 * 칸의 크기를 백분율로 줄 수 없어 폭을 재서 나눈다. v5 는 CSS 격자(`repeat(9,1fr)` · `gap:5`)로
 * 그렸는데, 그 계산은 "칸 사이 간격을 먼저 빼고 남은 폭을 아홉으로 나눈다"는 뜻이다.
 * React Native 에는 그 계산을 대신해 줄 격자가 없으므로 같은 식을 직접 쓴다.
 */
export function DayGrid({ days, testID }: { days: readonly DayState[]; testID?: string }) {
  const { cell } = useThemedStyles(cellPalette);
  const [width, setWidth] = useState(0);
  const gap = metrics2.gridGap;
  const columns = metrics2.gridColumns;
  const size = width > 0 ? (width - gap * (columns - 1)) / columns : 0;

  return (
    <View
      style={gridStyles.grid}
      testID={testID}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {size > 0
        ? days.map((state, index) => (
            <View
              key={index}
              style={{ width: size, height: size, backgroundColor: cell[state] }}
            />
          ))
        : null}
    </View>
  );
}

const cellPalette = (theme: Theme) => ({ cell: theme.cell });

const ribbonStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
});

const gridStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: metrics2.gridGap },
});

/** 화면 하나를 감싸는 바깥 틀 — 위 56 · 좌우 24 · 아래 26 (v5 의 안쪽 화면 전부). */
export function ScreenBody({ children, testID }: { children: ReactNode; testID?: string }) {
  const styles = useThemedStyles(bodyStyles);
  return (
    <View style={styles.screen} testID={testID}>
      {children}
    </View>
  );
}

const bodyStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      flexDirection: 'column',
      paddingTop: metrics2.screenTop,
      paddingHorizontal: metrics.screenPadding,
      paddingBottom: metrics2.screenBottom,
      backgroundColor: colors.background,
    },
  });
