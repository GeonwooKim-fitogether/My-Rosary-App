/**
 * 시트 S5 묵주 고르기 — 줄 넷 위에 **고른 묵주의 큰 미리보기**가 함께 선다.
 *
 * 다른 고르기 시트(받는 사이 · 낭송 방식 · 판본)는 `ChoiceSheet` 하나로 족한데 이 시트만
 * 따로 있는 이유는 하나다. **묵주는 말로 고를 수 없다.** `나무` 와 `금` 이라는 글자만
 * 보여 주고 고르게 하면, 고른 뒤 기도 화면에 가서야 그것이 무엇인지 알게 된다. 화면
 * 명세가 이 시트에만 "고르면 즉시 큰 미리보기"를 적어 둔 것도 같은 까닭이다.
 *
 * 설정 화면(E)과 새 기도 화면(N) 두 곳에서 열리며, 두 곳이 같은 것을 보아야 하므로 이
 * 파일 하나만 부른다.
 */
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { BottomSheet, ChoiceRow } from '../ui/Sheet';
import { ROSARY_CHOICES, type RosaryKey } from '../storage/settings';
import { type2, useThemedStyles, type Theme } from '../theme';
import { RosaryPreview } from './RosaryPreview';

export function RosarySheet({
  visible,
  selected,
  note,
  onSelect,
  onClose,
  testID,
}: {
  visible: boolean;
  selected: RosaryKey;
  /** 목록 아래 한 줄. 설정에서 열면 "모든 기도에 적용됩니다" 같은 말이 붙는다. */
  note?: string;
  onSelect: (key: RosaryKey) => void;
  onClose: () => void;
  testID?: string;
}) {
  const styles = useThemedStyles(sheetStyles);
  return (
    <BottomSheet visible={visible} label="묵주" onClose={onClose} testID={testID}>
      {/*
        미리보기를 목록 **위**에 둔다. 아래에 두면 줄 넷을 훑는 동안 그림이 시야 밖으로
        밀려, 고를 때마다 눈이 위아래로 오간다.
      */}
      <View style={styles.stage}>
        <RosaryPreview rosary={selected} />
      </View>
      {ROSARY_CHOICES.map((choice, index) => (
        <ChoiceRow
          key={choice.key}
          name={choice.name}
          note={choice.note}
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

const sheetStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    /*
     * 미리보기가 앉는 자리. 기도 화면에서 묵주가 성화 위에 놓이듯, 여기서도 바탕에서 한 겹
     * 물러난 면 위에 놓아 알의 빛과 그늘이 배경과 섞이지 않게 한다.
     */
    stage: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.rule,
      marginBottom: 18,
      paddingHorizontal: 4,
    },
    note: { ...type2.noteSmall, color: colors.inkMuted, marginTop: 14 },
  });
