/**
 * 바텀 시트 일곱의 뼈대 — **v5 에 없어 M2 가 파생한 것이다** (`decisions.md` Q-14).
 *
 * 파생이 창작이 아니라 적용이었음을 보이기 위해, 여기 쓰인 값이 v5 의 어디에서 왔는지
 * 하나도 빼지 않고 적는다.
 *
 * | 이 파일의 자리 | 값 | v5 의 출처 |
 * |---|---|---|
 * | 시트 안쪽 여백 | 좌우 24 · 아래 26 | 모든 화면의 바깥 틀 (`padding:56 24 26`) |
 * | 시트 머리 | 자간 넓은 라벨 + `닫기`, 아래 괘선 1px | `s-new` · `s-settings` 의 머리 그대로 |
 * | 고르는 줄 | 높이 80 · 좌우 16 · 테두리 1px(고른 줄은 치자, 아닌 줄은 옅은 선) · 위 변은 첫 줄만 | `s-new` 의 낭송 세 줄 (`rec-0`~`rec-2`) 그대로 |
 * | 고른 줄의 표시 | **테두리 색 하나로만** 표시한다 (글자를 덧붙이지 않는다) | 같은 자리 — v5 가 고른 줄을 그렇게 표시한다 |
 * | 줄 안의 글자 | 이름 500 14px · 설명 11px/1.5 회색 | 같은 자리 |
 * | 아래 단추 둘 | 채운 단추 80 + 조용한 글 단추 80 | `s-allDone` 의 단추 두 줄 |
 * | 시트의 면 | `--surface` (낮 `#F5F1E6` · 밤 `#18202C`) | 06-design-system §2-2 가 "카드·시트"라고 적어 둔 값 |
 *
 * 새로 만든 값은 **그늘(scrim) 하나뿐**이고, 그것도 팔레트 안의 색에 투명도를 준 것이다
 * (`src/theme/tokens.ts` 의 `scrim` 주석 참고). 시트가 v5 에 한 장도 없었다는 점을 생각하면,
 * 이 정도가 "값을 새로 정하지 않는다"를 지키면서 시트를 세울 수 있는 최소치다.
 *
 * 붉은 경고색은 쓰지 않는다 — 지우기·해산 같은 되돌릴 수 없는 일도 먹빛 단추다
 * (06-design-system §2-4: "기도에서 붉은 경고는 벌주는 인상을 준다").
 */
import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { metrics, metrics2, type as type1, type2, useThemedStyles, type Theme } from '../theme';

export function BottomSheet({
  visible,
  label,
  onClose,
  children,
  testID,
}: {
  visible: boolean;
  /** 시트 머리의 자간 넓은 라벨. */
  label: string;
  onClose: () => void;
  children: ReactNode;
  testID?: string;
}) {
  const styles = useThemedStyles(sheetStyles);
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="닫기" />
        <View style={styles.panel} testID={testID}>
          <View style={styles.header}>
            <Text style={styles.headerLabel}>{label}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" testID="sheet-close" hitSlop={16}>
              <Text style={styles.headerAction}>닫기</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/** 고르는 줄 하나 — v5 `s-new` 의 낭송 줄과 같은 모양이다. */
export function ChoiceRow({
  name,
  note,
  selected,
  first,
  mark,
  onPress,
  testID,
}: {
  name: string;
  note?: string;
  selected: boolean;
  /** 줄 오른쪽에 붙는 짧은 글. v5 는 기본값 줄에 `기본` 을 붙인다. */
  mark?: string;
  /** 첫 줄만 위쪽 변을 갖는다. 둘째 줄부터 위 변을 두면 위 줄의 아래 변과 겹쳐 2px 가 된다. */
  first: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const styles = useThemedStyles(choiceStyles);
  return (
    <Pressable
      style={[styles.row, selected ? styles.rowSelected : styles.rowPlain, first ? null : styles.rowStacked]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      testID={testID}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{name}</Text>
        {note ? <Text style={styles.rowNote}>{note}</Text> : null}
      </View>
      {mark ? <Text style={styles.rowMark}>{mark}</Text> : null}
    </Pressable>
  );
}

/** 여러 줄에서 하나를 고르는 시트 — S2 · S4 · S5 가 이 모양이다. */
export function ChoiceSheet<T extends string>({
  visible,
  label,
  choices,
  selected,
  note,
  onSelect,
  onClose,
  testID,
}: {
  visible: boolean;
  label: string;
  choices: ReadonlyArray<{ key: T; name: string; note?: string; mark?: string }>;
  selected: T;
  /** 목록 아래 한 줄 (예: `새로 만드는 기도에 적용됩니다`). */
  note?: string;
  onSelect: (key: T) => void;
  onClose: () => void;
  testID?: string;
}) {
  const styles = useThemedStyles(sheetStyles);
  return (
    <BottomSheet visible={visible} label={label} onClose={onClose} testID={testID}>
      {choices.map((choice, index) => (
        <ChoiceRow
          key={choice.key}
          name={choice.name}
          note={choice.note}
          mark={choice.mark}
          selected={choice.key === selected}
          first={index === 0}
          onPress={() => onSelect(choice.key)}
          testID={`sheet-choice-${choice.key}`}
        />
      ))}
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </BottomSheet>
  );
}

/** 되돌릴 수 없는 일 앞에서 한 번 묻는 시트 — S3 · S6 · 계정 삭제 확인이 이 모양이다. */
export function ConfirmSheet({
  visible,
  label,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
  testID,
}: {
  visible: boolean;
  label: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  testID?: string;
}) {
  const styles = useThemedStyles(sheetStyles);
  return (
    <BottomSheet visible={visible} label={label} onClose={onClose} testID={testID}>
      <Text style={styles.message}>{message}</Text>
      <Pressable
        style={styles.confirm}
        onPress={onConfirm}
        accessibilityRole="button"
        testID="sheet-confirm"
      >
        <Text style={styles.confirmLabel}>{confirmLabel}</Text>
      </Pressable>
      <Pressable
        style={styles.cancel}
        onPress={onClose}
        accessibilityRole="button"
        testID="sheet-cancel"
      >
        <Text style={styles.cancelLabel}>{cancelLabel}</Text>
      </Pressable>
    </BottomSheet>
  );
}

const sheetStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    scrim: { flex: 1, backgroundColor: colors.scrim },
    panel: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.rule,
      paddingHorizontal: metrics.screenPadding,
      paddingTop: metrics2.screenBottom,
      paddingBottom: metrics2.screenBottom,
      maxHeight: '86%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.rule,
    },
    headerLabel: { ...type1.label, color: colors.inkMuted },
    headerAction: { ...type2.navLabel, color: colors.inkMuted },
    content: { marginTop: 18 },
    contentInner: { paddingBottom: 4 },
    note: { ...type2.noteSmall, color: colors.inkMuted, marginTop: 14 },
    message: { ...type1.bodySmall, color: colors.ink, marginBottom: 26 },
    confirm: {
      height: metrics.touchTargetHeight,
      backgroundColor: colors.fill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmLabel: { ...type1.button, color: colors.onFill },
    cancel: {
      height: metrics.touchTargetHeight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelLabel: { ...type1.tertiary, color: colors.inkMuted },
  });

const choiceStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    row: {
      height: metrics.touchTargetHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      borderWidth: 1,
    },
    rowSelected: { borderColor: colors.accent },
    rowPlain: { borderColor: colors.rowBorder },
    rowStacked: { borderTopWidth: 0 },
    rowText: { flexShrink: 1 },
    rowName: { ...type1.buttonCompact, color: colors.ink },
    rowNote: { ...type2.rowSub, color: colors.inkMuted, marginTop: 5 },
    rowMark: { ...type2.navLabel, color: colors.accent },
  });
