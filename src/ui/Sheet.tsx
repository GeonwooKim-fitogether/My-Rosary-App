/**
 * 바텀 시트 일곱의 뼈대 — **v5 에 없어 M2 가 파생했고, W2 가 새 시안의 어법으로 옮겼다**
 * (`decisions.md` Q-14 · Q-56 · `docs/plan/w2-work-order.md` §3).
 *
 * ── 왜 이 파일 하나를 고쳤나 ──────────────────────────────────────────────────
 *
 * 시트 일곱이 모두 이 부품을 쓴다. W1 이 기도 화면을 새 시안의 어법(지역의 덮개색으로
 * 어두운 화면)으로 옮긴 뒤, 그 위에 뜨는 나가기 시트만 **옛 한지 벌의 밝은 판**으로
 * 올라와 화면과 겉돌았다(`docs/plan/w1-screens/pray-leave.png` 에서 보인다). 부품 하나를
 * 옮기면 일곱이 함께 옮겨지므로, 시트마다 손대지 않고 여기만 고쳤다. 감싸고 있는 파일들
 * (`LeavePrayerSheet` · `RestartTodaySheet` · `RemoveJourneySheet` · `RosarySheet`)은
 * 문구와 이름표만 정하므로 한 줄도 바뀌지 않았다.
 *
 * ── 값이 어디서 왔나 ─────────────────────────────────────────────────────────
 *
 * **시안에는 시트가 한 장도 없다.** 그래서 값은 두 곳에서 왔고, 어느 쪽인지 칸마다 밝힌다.
 *
 * | 이 파일의 자리 | 값 | 출처 |
 * |---|---|---|
 * | 판의 바탕 | 그 지역의 종이색 (`palette.paper`) | W2 §3 — 시트는 어느 화면 위에 뜨든 종이색이다 |
 * | 판의 위 모서리 | 반지름 4 | 「Classical」 의 `--radius-md` (거의 각진 체계다) |
 * | 판의 여백 | 좌우 24 · 위아래 22 | 시안이 모든 화면에 쓰는 좌우 여백 24 |
 * | 괘선 | `rgba(0,0,0,.14)` | 시안이 화면마다 쓰는 가는 선 |
 * | 머리 라벨의 자간 | 12px · `.14em` | 시안이 화면 머리마다 쓰는 작은 라벨 |
 * | 글자에 쓰는 강조 | `accentText` | `decisions.md` Q-51 |
 * | 테두리에 쓰는 강조 | `accent` | 같은 곳 — 선은 글자가 아니다 |
 * | 판 아래 덮개 | 그 지역의 덮개색 (`palette.scrim`) 을 0.72 로 | W2 §3 — 아래 설명 |
 *
 * 서체와 크기의 출처는 `src/theme/worldTokens.ts` 의 `worldSheetType` · `worldSheetMetrics`
 * 가 칸마다 적어 두었다.
 *
 * **덮개를 짙게 한 까닭.** 시안은 어두운 화면 위에 시트를 띄우는 그림을 주지 않았으므로 이
 * 저장소가 정했다 — 밝은 종이 판을 그대로 쓰되, 판 아래 덮개를 그 지역의 덮개색으로 짙게 깔아
 * 기도 화면과의 경계를 만든다. 새 색을 만들지 않고 지역의 색 벌 안에서 해결한 것이다.
 *
 * **붉은 경고색은 쓰지 않는다.** 지우기·해산 같은 되돌릴 수 없는 일도 먹빛 단추다
 * (06-design-system §2-4: "기도에서 붉은 경고는 벌주는 인상을 준다"). 그 규칙은 그대로이고,
 * 먹빛이 한지 벌의 `#1F2530` 에서 그 지역의 `ink` 로 바뀐 것만 다르다.
 *
 * **밤 벌은 더 따르지 않는다.** 그전에는 이 부품이 낮·밤 두 벌을 갈아 끼웠는데, 결정 12 가
 * 밤 벌을 접기로 했고 새 시안에는 지역 다섯의 색 벌만 있다. 그래서 시트는 지금 어느 벌에서도
 * 그 지역의 종이색으로 선다.
 */
import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { stringsFor, type Strings } from '../i18n';
import { useAppState } from '../state/useAppState';
import {
  paletteFor,
  worldSheetMetrics,
  worldSheetType,
  type WorldPalette,
} from '../theme/worldTokens';

/** 지금 지역의 색 벌. 시트 넷이 모두 이것으로 그린다. */
function useSheetPalette(): WorldPalette {
  const { settings } = useAppState();
  return paletteFor(settings.region);
}

/**
 * 지금 언어의 문구 한 벌.
 *
 * 시트를 감싸는 파일들은 저마다 자기 문구를 넘기지만, 이 뼈대 자신도 말을 하나 한다 —
 * 머리 오른쪽의 `닫기` 다. 그 한 마디를 위해 감싸는 일곱 곳이 모두 문구를 넘기게 하는
 * 대신, 색 벌과 같은 방식으로 여기서 직접 읽는다.
 */
function useSheetStrings(): Strings {
  const { settings } = useAppState();
  return stringsFor(settings.language);
}

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
  const palette = useSheetPalette();
  const strings = useSheetStrings();
  const styles = sheetStyles(palette);
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel={strings.close} />
        <View style={styles.panel} testID={testID}>
          <View style={styles.header}>
            <Text style={styles.headerLabel}>{label}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" testID="sheet-close" hitSlop={16}>
              <Text style={styles.headerAction}>{strings.close}</Text>
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

/** 고르는 줄 하나 — 고른 줄은 강조색 테 하나로만 표시한다 (글자를 덧붙이지 않는다). */
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
  /** 줄 오른쪽에 붙는 짧은 글. 기본값 줄에 `기본` 을 붙인다. */
  mark?: string;
  /** 첫 줄만 위쪽 변을 갖는다. 둘째 줄부터 위 변을 두면 위 줄의 아래 변과 겹쳐 2px 가 된다. */
  first: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const palette = useSheetPalette();
  const styles = choiceStyles(palette);
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
  const styles = sheetStyles(useSheetPalette());
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
  const styles = sheetStyles(useSheetPalette());
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

const sheetStyles = (palette: WorldPalette) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    /*
      덮개는 그 지역의 덮개색이다. 기도 화면이 같은 색으로 칠해져 있으므로, 시트가 그 위에
      뜨면 화면이 한 단계 더 어두워지면서 판의 경계가 선다.
    */
    scrim: { flex: 1, backgroundColor: palette.scrim, opacity: worldSheetMetrics.scrimOpacity },
    panel: {
      backgroundColor: palette.paper,
      borderTopLeftRadius: worldSheetMetrics.radius,
      borderTopRightRadius: worldSheetMetrics.radius,
      borderTopWidth: 1,
      borderTopColor: worldSheetMetrics.rule,
      paddingHorizontal: worldSheetMetrics.padding,
      paddingTop: worldSheetMetrics.paddingVertical,
      paddingBottom: worldSheetMetrics.paddingVertical,
      maxHeight: '86%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 12,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: worldSheetMetrics.rule,
    },
    headerLabel: { ...worldSheetType.label, color: palette.accentText, flexShrink: 1 },
    headerAction: { ...worldSheetType.action, color: palette.muted },
    content: { marginTop: 16 },
    contentInner: { paddingBottom: 4 },
    note: { ...worldSheetType.rowNote, color: palette.muted, marginTop: 14 },
    message: { ...worldSheetType.message, color: palette.ink, marginBottom: 22 },
    /* 먹빛으로 채운 단추 — 되돌릴 수 없는 일을 맡는 자리다 (머리의 설명). */
    confirm: {
      minHeight: 56,
      borderRadius: worldSheetMetrics.radius,
      backgroundColor: palette.ink,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmLabel: { ...worldSheetType.confirm, color: palette.paper },
    cancel: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelLabel: { ...worldSheetType.cancel, color: palette.muted },
  });

const choiceStyles = (palette: WorldPalette) =>
  StyleSheet.create({
    row: {
      minHeight: worldSheetMetrics.rowHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
    },
    rowSelected: { borderColor: palette.accent },
    rowPlain: { borderColor: worldSheetMetrics.rule },
    rowStacked: { borderTopWidth: 0 },
    rowText: { flexShrink: 1 },
    rowName: { ...worldSheetType.rowName, color: palette.ink },
    rowNote: { ...worldSheetType.rowNote, color: palette.muted, marginTop: 4 },
    rowMark: { ...worldSheetType.action, color: palette.accentText },
  });
