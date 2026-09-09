/**
 * N 새 기도 — v5 시안 `docs/design/v5/index.html` 의 `s-new` 블록을 옮긴 화면.
 *
 * v5 의 네 구역(① 무엇을 위하여 ② 청원인가 감사인가 ③ 낭송 ④ 묵주)이 결정 1-2 가 확정한
 * 구조이고, 그 구역들의 값은 시안에서 글자 그대로 가져왔다.
 *
 * **구역 하나를 파생해 더했다 — 형식(54일 · 9일 · 날마다).** 까닭을 적어 둔다. M2 의 범위에
 * 여정 형식 셋이 들어 있고(개발 계획 §6-3) FR-33 이 형식 선택을 새 기도의 일로 정했는데,
 * v5 의 새 기도에는 형식을 고르는 자리가 없다(시안 전체가 54일 기도 하나를 전제로 그려졌다).
 * 고르는 자리가 없으면 형식 셋은 코드에만 있고 사용자에게는 없는 것과 같다. 그래서
 * **모양을 새로 만들지 않고** v5 가 바로 아래 구역(낭송)에 쓴 줄 세 개의 모양을 그대로 쓰고,
 * 문구는 06-screen-spec 화면 N 의 문구 표에 확정돼 있는 것을 그대로 옮겼다. 시트와 밤 벌에
 * 대해 `decisions.md` Q-14 가 정한 방식(v5 값에서 파생하고 KimDesigner 가 렌더를 검수)을
 * 같은 성격의 빈자리에 한 번 더 적용한 것이며, **KimDesigner 검수 대상**이다.
 *
 * v5 에 없어 옮기지 못한 FR-33 의 나머지 셋(시작일 고르기 · 판본 고르기 · 첫날 신비
 * 미리보기)은 이 화면에 없다. 시작일은 오늘로 고정이고 판본은 설정의 기본값을 따른다.
 */
import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { JourneyFormat, RecitationMode } from '../src/domain/types';
import { monthDayKo } from '../src/journey/format';
import { journeyLength } from '../src/journey/rules';
import { addJourney } from '../src/state/appStore';
import { useAppState, } from '../src/state/useAppState';
import { updateSettings } from '../src/state/appStore';
import { ROSARY_NAMES, type RosaryKey } from '../src/storage/settings';
import { addDays } from '../src/journey/format';
import {
  metrics,
  metrics2,
  type as type1,
  type2,
  useThemedStyles,
  type Theme,
} from '../src/theme';
import { ChoiceRow, ChoiceSheet } from '../src/ui/Sheet';
import { PrimaryButton, ScreenHeader } from '../src/ui/Screen';
import { primeSpeech } from '../src/prayer/channels';

/** 형식 셋. 설명은 06-screen-spec 화면 N 의 문구 표 그대로다. */
const FORMAT_CHOICES: ReadonlyArray<{
  key: JourneyFormat;
  name: string;
  note: string;
  mark?: string;
}> = [
  { key: 'fiftyfour', name: '54일 기도', note: '27일 청원, 27일 감사. 하루에 다섯 단.', mark: '기본' },
  { key: 'novena9', name: '9일 기도', note: '아홉 날, 하루에 다섯 단.' },
  { key: 'daily', name: '날마다', note: '끝나는 날을 정하지 않습니다.' },
];

/** 낭송 셋. 이름과 설명은 v5 새 기도의 세 줄 그대로다. */
const RECITATION_ROWS: ReadonlyArray<{
  key: RecitationMode;
  name: string;
  note: string;
  mark?: string;
}> = [
  { key: 'alternate', name: '교대로', note: '앞은 소리가 읽고 뒤는 내가 받습니다', mark: '기본' },
  { key: 'full', name: '전부 소리로', note: '처음부터 끝까지 읽어 줍니다' },
  { key: 'silent', name: '소리 없이', note: '글자만 보며 내 속도로' },
];

/** 구역 ①의 아래 한 줄. v5 는 `쉰네 날 동안 · 나만 봅니다` 를 적어 두었다. */
function spanNote(format: JourneyFormat): string {
  if (format === 'fiftyfour') return '쉰네 날 동안 · 나만 봅니다';
  if (format === 'novena9') return '아홉 날 동안 · 나만 봅니다';
  return '날마다 · 나만 봅니다';
}

export default function NewJourneyScreen() {
  const styles = useThemedStyles(newStyles);
  const { settings } = useAppState();

  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<JourneyFormat>('fiftyfour');
  const [kind, setKind] = useState<'petition' | 'thanksgiving'>('petition');
  const [recitation, setRecitation] = useState<RecitationMode>(settings.recitation);
  const [rosarySheet, setRosarySheet] = useState(false);
  const [missingTitle, setMissingTitle] = useState(false);

  const today = new Date();
  const length = journeyLength(format);
  const finish = length === null ? null : addDays(today, length - 1);

  function start(): void {
    const wish = title.trim();
    if (!wish) {
      setMissingTitle(true);
      return;
    }
    // 누른 이 자리에서 소리 엔진을 깨운다. 브라우저는 사용자가 누른 조작에서 곧바로
    // 이어진 소리만 내보내는데, 기도 화면은 뜬 뒤에 기다림이 두 번 끼어 자격이 끊긴다.
    primeSpeech();

    const journey = addJourney(
      { title: wish, format, kind, recitation, startDate: today },
      today,
    );
    router.replace({ pathname: '/pray', params: { id: journey.id } });
  }

  return (
    <View style={styles.screen} testID="new-screen">
      <View style={styles.headerBox}>
        <ScreenHeader
          label="새 기도"
          action="닫기"
          onAction={() => router.back()}
          actionTestID="new-close"
        />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
        {/* ① 무엇을 위하여 */}
        <View style={styles.firstZone}>
          <Text style={styles.zoneLabel}>무엇을 위하여</Text>
          <TextInput
            value={title}
            onChangeText={(next) => {
              setTitle(next);
              if (next.trim()) setMissingTitle(false);
            }}
            placeholder="누구를, 무엇을 위해 바치나요"
            placeholderTextColor={styles.placeholder.color}
            maxLength={24}
            style={styles.intent}
            testID="new-intent"
          />
          <Text style={styles.zoneNote}>{spanNote(format)}</Text>
          {missingTitle ? (
            <Text style={styles.error} testID="new-missing-title">
              바람을 한 줄 적어 주세요.
            </Text>
          ) : null}
        </View>

        {/* 형식 — v5 에 없어 파생한 구역 (머리글의 설명 참고) */}
        <View style={styles.zone}>
          <Text style={styles.zoneLabel}>형식</Text>
          <View style={styles.rows}>
            {FORMAT_CHOICES.map((choice, index) => (
              <ChoiceRow
                key={choice.key}
                name={choice.name}
                note={choice.note}
                mark={choice.mark}
                selected={choice.key === format}
                first={index === 0}
                onPress={() => setFormat(choice.key)}
                testID={`new-format-${choice.key}`}
              />
            ))}
          </View>
          {finish ? (
            <Text style={styles.zoneNote} testID="new-finish">
              {monthDayKo(finish)}에 마칩니다.
            </Text>
          ) : null}
        </View>

        {/* ② 청원인가 감사인가 — 54일 기도에만 뜻이 있다 */}
        {format === 'fiftyfour' ? (
          <View style={styles.zone}>
            <Text style={styles.zoneLabel}>청원인가 감사인가</Text>
            <View style={styles.kindRow}>
              <KindBox
                name="청원"
                note="27일 + 27일"
                selected={kind === 'petition'}
                onPress={() => setKind('petition')}
                testID="new-kind-petition"
              />
              <KindBox
                name="감사"
                note="쉰네 날 내내"
                selected={kind === 'thanksgiving'}
                onPress={() => setKind('thanksgiving')}
                testID="new-kind-thanksgiving"
              />
            </View>
          </View>
        ) : null}

        {/* ③ 낭송 */}
        <View style={styles.zone}>
          <Text style={styles.zoneLabel}>낭송</Text>
          <View style={styles.rows}>
            {RECITATION_ROWS.map((choice, index) => (
              <ChoiceRow
                key={choice.key}
                name={choice.name}
                note={choice.note}
                mark={choice.mark}
                selected={choice.key === recitation}
                first={index === 0}
                onPress={() => setRecitation(choice.key)}
                testID={`new-recitation-${choice.key}`}
              />
            ))}
          </View>
        </View>

        {/* ④ 묵주 */}
        <Pressable
          style={styles.rosaryRow}
          onPress={() => setRosarySheet(true)}
          accessibilityRole="button"
          testID="new-rosary"
        >
          <View style={styles.rosaryIconRow}>
            {/* v5 가 이 줄에 그려 둔 작은 묵주 표시 — 좌표와 굵기 그대로다. */}
            <Svg width={30} height={30} viewBox="0 0 34 34">
              <Circle cx={17} cy={17} r={11} fill="none" stroke={styles.rosaryIcon.color} strokeWidth={1.4} />
              <Circle cx={17} cy={6} r={4} fill={styles.rosaryIcon.color} />
            </Svg>
          </View>
          <View style={styles.rosaryLeft}>
            <Text style={styles.rosaryTitle}>묵주</Text>
            <Text style={styles.rosaryNote}>{ROSARY_NAMES[settings.rosary]}</Text>
          </View>
          <Text style={styles.rosaryAction}>고르기 →</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="시작하기" onPress={start} testID="new-start" />
      </View>

      <ChoiceSheet
        visible={rosarySheet}
        label="묵주"
        choices={(Object.keys(ROSARY_NAMES) as RosaryKey[]).map((key) => ({
          key,
          name: ROSARY_NAMES[key],
        }))}
        selected={settings.rosary}
        onSelect={(key) => {
          updateSettings({ rosary: key });
          setRosarySheet(false);
        }}
        onClose={() => setRosarySheet(false)}
        testID="sheet-rosary"
      />
    </View>
  );
}

/** 구역 ②의 상자 하나 — v5 의 `kind-0` · `kind-1` 그대로다. */
function KindBox({
  name,
  note,
  selected,
  onPress,
  testID,
}: {
  name: string;
  note: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
}) {
  const styles = useThemedStyles(newStyles);
  return (
    <Pressable
      style={[styles.kindBox, selected ? styles.kindBoxOn : styles.kindBoxOff]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      testID={testID}
    >
      <Text style={selected ? styles.kindNameOn : styles.kindNameOff}>{name}</Text>
      <Text style={selected ? styles.kindNoteOn : styles.kindNoteOff}>{note}</Text>
    </Pressable>
  );
}

const newStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      flexDirection: 'column',
      paddingTop: metrics2.screenTop, // 56
      paddingBottom: metrics2.screenBottom, // 26
      backgroundColor: colors.background,
    },
    // v5 는 이 화면만 좌우 여백을 바깥 틀이 아니라 안쪽 조각들에 준다 — 목록만 스크롤되고
    // 머리와 아래 단추는 제자리에 있어야 하기 때문이다.
    headerBox: { paddingHorizontal: metrics.screenPadding },
    scroll: { flex: 1, minHeight: 0 },
    scrollInner: { paddingHorizontal: metrics.screenPadding },
    firstZone: {
      paddingTop: 18,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.rule,
    },
    zone: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.rule },
    zoneLabel: { ...type2.sectionLabel, color: colors.inkMuted },
    intent: { ...type2.intent, color: colors.ink, marginTop: 10, padding: 0 },
    placeholder: { color: colors.inkMuted },
    zoneNote: { ...type2.noteSmall, color: colors.inkMuted, marginTop: 8 },
    error: { ...type2.noteSmall, color: colors.accent, marginTop: 8 },
    rows: { marginTop: 10 },
    kindRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
    kindBox: {
      flex: 1,
      height: metrics.touchTargetHeight, // 80
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    kindBoxOn: { borderColor: colors.fill, backgroundColor: colors.fill },
    kindBoxOff: { borderColor: colors.buttonBorder },
    kindNameOn: { ...type1.button, color: colors.onFill },
    kindNameOff: { ...type1.button, color: colors.ink },
    kindNoteOn: { ...type1.caption, color: colors.onFillMuted },
    kindNoteOff: { ...type1.caption, color: colors.inkMuted },
    rosaryRow: {
      height: metrics.touchTargetHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
    },
    rosaryIconRow: { flexGrow: 0, flexShrink: 0 },
    rosaryLeft: { flex: 1 },
    rosaryTitle: { ...type2.rowLabel, color: colors.ink },
    rosaryNote: { ...type2.rowSub, color: colors.inkMuted, marginTop: 5 },
    rosaryAction: { ...type2.rowValue, color: colors.inkMuted },
    rosaryIcon: { color: colors.accent },
    footer: {
      paddingTop: 18,
      paddingHorizontal: metrics.screenPadding,
      borderTopWidth: 1,
      borderTopColor: colors.rule,
    },
  });
