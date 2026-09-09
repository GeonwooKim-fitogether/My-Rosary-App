/**
 * E 설정 — v5 시안 `docs/design/v5/index.html` 의 `s-settings` 블록을 바탕으로 옮긴 화면.
 *
 * **이 화면은 옮기기만 해서는 설 수 없었다.** v5 의 설정은 프로토타입 시절의 목록이라
 * PRD 가 요구하는 항목 다섯이 없고(받는 사이 · 손 없이 조작 · 묵주 · 계정 삭제 · 소개),
 * 반대로 PRD 가 빼기로 한 항목 둘이 있다(글자 크기는 시스템 설정을 따르므로 FR-28,
 * 기도 시각 알림은 §9 가 만들지 않기로 한 것). 개발 계획 §3 의 14 행이 이 어긋남을 이미
 * 판정해 두었다 — **"PRD 따름 — 계정 삭제·손 없이·묵주·받는 사이·계정 정보·소개 추가,
 * 글자 크기·알림 삭제"**. 그 판정대로 항목을 맞추고, 묶음 셋(바치는 방식 · 보이는 것 ·
 * 계정)의 위계도 06-screen-spec 화면 E 를 따랐다.
 *
 * **줄의 모양은 v5 그대로다** — 높이 80, 위 괘선 1px, 왼쪽 14px 이름, 오른쪽 13px 회색 값과
 * 화살표. 항목이 바뀌어도 모양은 시안의 것이므로, 검수는 "줄이 v5 와 같은가"가 아니라
 * "항목이 PRD 와 같은가"를 보면 된다.
 *
 * 계정 묶음의 **계정 정보 줄(FR-41)은 아직 없다.** 표시 이름도 제공자도 로그인이 붙는
 * M3 에 생기기 때문이고, 없는 것을 지어 적지 않았다.
 */
import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PaceKey, RecitationMode } from '../src/domain/types';
import { updateSettings } from '../src/state/appStore';
import { useAppState } from '../src/state/useAppState';
import {
  PACE_CHOICES,
  PACE_NAMES,
  RECITATION_CHOICES,
  RECITATION_NAMES,
  ROSARY_NAMES,
  type RosaryKey,
  type ThemePreference,
} from '../src/storage/settings';
import { metrics, type as type1, type2, useThemedStyles, type Theme } from '../src/theme';
import { BottomSheet, ChoiceSheet, ConfirmSheet } from '../src/ui/Sheet';
import { ScreenBody, ScreenHeader } from '../src/ui/Screen';

/** 낮과 밤 셋. `기기 설정 따름` 은 v5 가 그 줄에 적어 둔 값이다. */
const THEME_CHOICES: ReadonlyArray<{ key: ThemePreference; name: string; note?: string }> = [
  { key: 'system', name: '기기 설정 따름' },
  { key: 'day', name: '낮' },
  { key: 'night', name: '밤' },
];

const THEME_NAMES: Record<ThemePreference, string> = {
  system: '기기 설정 따름',
  day: '낮',
  night: '밤',
};

/**
 * 기도문 판본. 지금은 한 판본뿐이다 — `decisions.md` D-4 가 "검증 빌드는 프로토타입 v4
 * 수록문 한 판본으로 가고 판본 시트 S4 는 자리만 잡는다"로 정했다. 없는 판본의 이름을
 * 지어 넣지 않는다.
 */
const VERSION_CHOICES = [{ key: 'catholic' as const, name: '가톨릭 기도서' }];

type Sheet = 'none' | 'recitation' | 'pace' | 'rosary' | 'version' | 'theme' | 'about' | 'logout' | 'deleteAccount';

export default function SettingsScreen() {
  const { settings } = useAppState();
  const styles = useThemedStyles(settingsStyles);
  const [sheet, setSheet] = useState<Sheet>('none');
  const close = () => setSheet('none');

  return (
    <ScreenBody testID="settings-screen">
      <ScreenHeader
        label="설정"
        action="닫기"
        onAction={() => router.back()}
        actionTestID="settings-close"
      />

      <ScrollView style={styles.list} contentContainerStyle={styles.listInner}>
        <Text style={styles.groupLabelFirst}>바치는 방식</Text>
        <SettingRow
          label="낭송 기본값"
          value={RECITATION_NAMES[settings.recitation]}
          onPress={() => setSheet('recitation')}
          testID="settings-recitation"
        />
        <SettingRow
          label="받는 사이"
          value={PACE_NAMES[settings.pace]}
          onPress={() => setSheet('pace')}
          testID="settings-pace"
        />
        <SettingRow
          label="손 없이 조작"
          value={settings.handsFree ? '켜짐' : '꺼짐'}
          onPress={() => updateSettings({ handsFree: !settings.handsFree })}
          testID="settings-handsfree"
          arrow={false}
        />
        {settings.handsFree ? (
          <Text style={styles.rowNote} testID="settings-handsfree-note">
            손 없이 조작 — 폰을 흔들면 다음 알로, 이어폰 버튼으로 앞뒤로
          </Text>
        ) : null}

        <Text style={styles.groupLabel}>보이는 것</Text>
        <SettingRow
          label="묵주"
          value={ROSARY_NAMES[settings.rosary]}
          onPress={() => setSheet('rosary')}
          testID="settings-rosary"
        />
        <SettingRow
          label="기본 기도문 판본"
          value="가톨릭 기도서"
          onPress={() => setSheet('version')}
          testID="settings-version"
        />
        <SettingRow
          label="낮과 밤"
          value={THEME_NAMES[settings.theme]}
          onPress={() => setSheet('theme')}
          testID="settings-theme"
        />

        <Text style={styles.groupLabel}>계정</Text>
        <SettingRow
          label="로그아웃"
          value="올리지 못한 기록은 먼저 보냅니다"
          onPress={() => setSheet('logout')}
          testID="settings-logout"
          arrow={false}
        />
        <SettingRow
          label="계정 삭제"
          value=""
          onPress={() => setSheet('deleteAccount')}
          testID="settings-delete-account"
        />
        <SettingRow
          label="소개"
          value=""
          onPress={() => setSheet('about')}
          testID="settings-about"
          last
        />
      </ScrollView>

      {/* 낭송 기본값 — 이름과 설명은 06-screen-spec 화면 E 의 문구 표 그대로다. */}
      <ChoiceSheet
        visible={sheet === 'recitation'}
        label="낭송 기본값"
        choices={RECITATION_CHOICES}
        selected={settings.recitation}
        note="새로 만드는 기도에 적용됩니다"
        onSelect={(key: RecitationMode) => {
          updateSettings({ recitation: key });
          close();
        }}
        onClose={close}
        testID="sheet-recitation"
      />

      {/* S2 받는 사이 */}
      <ChoiceSheet
        visible={sheet === 'pace'}
        label="받는 사이"
        choices={PACE_CHOICES}
        selected={settings.pace}
        onSelect={(key: PaceKey) => {
          updateSettings({ pace: key });
          close();
        }}
        onClose={close}
        testID="sheet-pace"
      />

      {/* S5 묵주 고르기 */}
      <ChoiceSheet
        visible={sheet === 'rosary'}
        label="묵주"
        choices={(Object.keys(ROSARY_NAMES) as RosaryKey[]).map((key) => ({
          key,
          name: ROSARY_NAMES[key],
        }))}
        selected={settings.rosary}
        onSelect={(key) => {
          updateSettings({ rosary: key });
          close();
        }}
        onClose={close}
        testID="sheet-rosary"
      />

      {/* S4 기도문 판본 — 성모송 첫 줄 미리보기를 함께 보인다 */}
      <ChoiceSheet
        visible={sheet === 'version'}
        label="기도문 판본"
        choices={VERSION_CHOICES.map((v) => ({
          key: v.key,
          name: v.name,
          note: '은총이 가득하신 마리아님, 기뻐하소서!',
        }))}
        selected="catholic"
        note="새로 만드는 기도에 적용됩니다"
        onSelect={close}
        onClose={close}
        testID="sheet-version"
      />

      {/* 낮과 밤 */}
      <ChoiceSheet
        visible={sheet === 'theme'}
        label="낮과 밤"
        choices={THEME_CHOICES}
        selected={settings.theme}
        onSelect={(key: ThemePreference) => {
          updateSettings({ theme: key });
          close();
        }}
        onClose={close}
        testID="sheet-theme"
      />

      {/* 로그아웃 확인 */}
      <ConfirmSheet
        visible={sheet === 'logout'}
        label="로그아웃"
        message="이 기기에서 나갑니다. 기도와 기록은 계정에 남습니다."
        confirmLabel="나가기"
        cancelLabel="두기"
        onConfirm={() => {
          close();
          router.replace('/');
        }}
        onClose={close}
        testID="sheet-logout"
      />

      {/* 계정 삭제 확인 (FR-45 — 애플 심사 5.1.1 이 요구하는 앱 안 삭제 경로) */}
      <ConfirmSheet
        visible={sheet === 'deleteAccount'}
        label="계정 삭제"
        message="서버의 모든 기도와 기록이 지워집니다. 조에 있었으면 조에서 빠집니다."
        confirmLabel="지우기"
        cancelLabel="두기"
        onConfirm={() => {
          close();
          router.replace('/');
        }}
        onClose={close}
        testID="sheet-delete-account"
      />

      {/* S7 소개 — 08 검증 참가자에게 이 빌드가 무엇을 묻는지 알린다 */}
      <BottomSheet
        visible={sheet === 'about'}
        label="소개"
        onClose={close}
        testID="sheet-about"
      >
        <Text style={styles.aboutTitle}>이 앱이 지금 묻는 것</Text>
        <Text style={styles.aboutBody}>
          화면을 보지 않고 손을 쓰지 않고도 다섯 단을 끝까지 바칠 수 있는가 — 이 하나를
          알아보려고 만든 검증 빌드입니다. 흔들기와 이어폰 단추로 알을 넘기고, 앱이 앞 절을
          읽으면 뒷 절을 소리 내어 받습니다.
        </Text>
        <Text style={styles.aboutTitle}>아직 아닌 것</Text>
        <Text style={styles.aboutBody}>
          함께 바치기와 계정 연결은 아직 붙지 않았습니다. 기도문은 임시 판본이고, 성화도
          검증 기간용입니다. 결제는 없습니다.
        </Text>
      </BottomSheet>
    </ScreenBody>
  );
}

/** 설정 줄 하나 — v5 의 줄 모양 그대로다 (높이 80 · 위 괘선 · 14px 이름 · 13px 값). */
function SettingRow({
  label,
  value,
  onPress,
  testID,
  arrow = true,
  last,
}: {
  label: string;
  value: string;
  onPress: () => void;
  testID?: string;
  /** v5 는 시트를 여는 줄에만 화살표를 붙인다. */
  arrow?: boolean;
  last?: boolean;
}) {
  const styles = useThemedStyles(settingsStyles);
  return (
    <Pressable
      style={[styles.row, last ? styles.rowLast : null]}
      onPress={onPress}
      accessibilityRole="button"
      testID={testID}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} testID={testID ? `${testID}-value` : undefined}>
        {value}
        {arrow ? (value ? ' →' : '→') : ''}
      </Text>
    </Pressable>
  );
}

const settingsStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    list: { flex: 1, marginTop: 8 },
    listInner: { paddingBottom: 8 },
    groupLabelFirst: {
      ...type2.sectionLabel,
      color: colors.inkMuted,
      paddingTop: 22,
      paddingBottom: 4,
    },
    groupLabel: {
      ...type2.sectionLabel,
      color: colors.inkMuted,
      paddingTop: 26,
      paddingBottom: 4,
    },
    row: {
      height: metrics.touchTargetHeight, // 80
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      borderTopWidth: 1,
      borderTopColor: colors.rule,
    },
    rowLast: { borderBottomWidth: 1, borderBottomColor: colors.rule },
    rowLabel: { ...type2.rowLabel, color: colors.ink },
    rowValue: { ...type2.rowValue, color: colors.inkMuted, flexShrink: 1, textAlign: 'right' },
    rowNote: { ...type2.rowSub, color: colors.inkMuted, marginTop: 10 },
    aboutTitle: { ...type1.buttonCompact, color: colors.ink, marginBottom: 10 },
    aboutBody: { ...type1.bodySmall, color: colors.inkMuted, marginBottom: 22 },
  });
