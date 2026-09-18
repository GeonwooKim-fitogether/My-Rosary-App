/**
 * 설정 — 「MyRosary World」 시안의 `data-screen-label="Settings"` 블록을 옮긴 화면
 * (W2 슬라이스 C · `docs/plan/w2-work-order.md` §2).
 *
 * 값(색·크기·간격·괘선)은 그 블록에서 그대로 가져왔고, 색은 지역 다섯의 색 벌
 * (`src/theme/worldTokens.ts`)에서 이름으로 고른다. 화면이 스스로 정하는 색은 없다.
 *
 * ── 이 화면이 2026-09-18 에 어떻게 달라졌나 ─────────────────────────────────────
 *
 * 그전까지 설정은 v5 시안의 **묶음 셋**(바치는 방식 · 보이는 것 · 계정)이었고, 줄마다
 * 높이 80 에 위 괘선 하나를 둔 한지 벌이었다. 새 시안은 같은 화면을 **묶음 없는 한 줄기**로
 * 그린다 — 큰 제목 아래로 줄이 곧장 이어지고, 켬/끔인 것은 오른쪽에 토글이 선다.
 *
 * | 무엇 | 옛 화면 (v5) | 이 화면 (World) |
 * |---|---|---|
 * | 맨 위 | 자간 넓은 라벨과 `닫기` 글자 | 앱 이름(작은 라벨)과 큰 제목 `설정` |
 * | 묶음 | 셋 (`바치는 방식` · `보이는 것` · `계정`) | 없다 — 줄이 곧장 이어진다 |
 * | 줄의 높이 | 80 | 56 (토글 줄) · 내용에 따라 (값이 붙는 줄) |
 * | 켬/끔 | 오른쪽에 `켜짐`·`꺼짐` 글자 | 오른쪽에 토글 (44×26) |
 * | 색 | 한지 벌 (낮·밤) | 그 지역의 색 벌 |
 *
 * ── 줄의 내용은 시안이 아니라 이 저장소의 요구를 따른다 (결정 12-2 카드 E) ────────
 *
 * 시안의 설정에는 켬/끔 토글이 넷 있다(`voice` · `autoAdvance` · `haptic` · `reduceMotion`).
 * 앞의 둘은 이 앱의 척추와 어긋난다 — 이 앱에서 "소리"는 켬/끔이 아니라 **낭송 방식 셋**
 * (전부 · 교대 · 읽지 않기, FR-06)이고, "자동으로 다음"은 켬/끔이 아니라 **받는 사이 셋**
 * (느리게 · 보통 · 빠르게, FR-07)이다. 카드 E 가 그 자리를 우리 것으로 바꾸라고 정했으므로,
 * 앞의 두 토글 자리에 고르는 줄 둘이 서고 뒤의 두 토글(`진동` · `움직임 줄이기`)은 그대로 남았다.
 *
 * ── 뺀 줄 넷과 그 근거 ─────────────────────────────────────────────────────────
 *
 * | 뺀 줄 | 근거 | 코드는 어떻게 했나 |
 * |---|---|---|
 * | 계정 삭제 (FR-45) | 결정 12-2 **카드 A** — 계정이 V1 에 없다. 지울 계정이 없는데 지우는 단추를 두면 눌러도 아무 일이 없는 줄이 된다. 애플 심사 5.1.1 이 요구하는 것은 **계정을 만드는 앱**의 삭제 경로이므로, 계정이 돌아오는 V1.5 에 이 줄도 함께 돌아온다 | 화면의 줄과 그 확인 시트를 이 파일에서 걷었다. 요구사항(FR-45)과 문구는 `docs/product/` 에 그대로 있다 |
 * | 로그아웃 | 같은 카드 A. 로그인한 계정이 없으므로 나갈 곳이 없다 | 위와 같다. 로그인 화면(`app/index.tsx`)은 지우지 않았다 — 카드 A 가 "진입점만 끊는다"고 적은 그대로다 |
 * | 낮과 밤 | 결정 12-2 **카드 F** — 밤 벌(쪽빛)을 접었다. 새 시안에는 지역 다섯의 색 벌만 있다 | **벌을 그리는 코드는 한 줄도 지우지 않았다** (`src/theme/tokens.ts` 의 `nightColors` 와 `ThemeProvider`). 고르는 자리만 끊었으므로, 되살리기로 하면 줄 하나를 다시 놓는 일이다 |
 * | 기도문 판본 | 같은 카드 F — 판본은 언어마다 한 벌이다 | 위와 같다 |
 *
 * ── 시안에 있으나 아직 놓지 않은 줄 둘 ──────────────────────────────────────────
 *
 * `홈 화면에 추가`(설치형 웹앱)와 `진행 중인 기도 지우기`는 놓지 않았다. 앞의 것은 설치형
 * 웹앱을 세우는 **W4** 의 일이라 지금 놓으면 눌러도 아무 일이 없고, 뒤의 것은 이 앱에서
 * 이미 홈의 `다시 바치기` 가 하는 일이라(확인 시트까지 붙어 있다) 두 곳에서 같은 일을
 * 하게 된다. 둘 다 **없는 것이 아니라 아직 아닌 것**이므로 여기 적어 둔다.
 */
import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LANGUAGES, stringsFor } from '../src/i18n';
import { countDays } from '../src/journey/rules';
import type { PaceKey, RecitationMode } from '../src/domain/types';
import { updateSettings } from '../src/state/appStore';
import { useAppState } from '../src/state/useAppState';
import {
  PACE_CHOICES,
  PACE_NAMES,
  RECITATION_CHOICES,
  RECITATION_NAMES,
  ROSARY_NAMES,
} from '../src/storage/settings';
import { FONT_SCALE_LABEL_KEYS, asFontScaleIndex, type FontScaleIndex } from '../src/theme/prayerFont';
import { TEXT_SCALE } from '../src/theme/fontScale';
import {
  FONT_SEG_PX,
  guideTitleSizeFor,
  koWordBreak,
  paletteFor,
  worldFontStack,
  worldRadius,
  worldSettingsType,
  type WorldPalette,
} from '../src/theme/worldTokens';
import { RosarySheet } from '../src/prayer/RosarySheet';
import { BottomSheet, ChoiceSheet } from '../src/ui/Sheet';
import { TAB_BAR_HEIGHT, WorldTabBar } from '../src/ui/WorldTabBar';

type Sheet = 'none' | 'recitation' | 'pace' | 'rosary' | 'about';

/** 시안의 괘선 — 화면마다 쓰는 `rgba(0,0,0,.14)` 하나다. */
const RULE = 'rgba(0,0,0,.14)';

export default function SettingsScreen() {
  const { journeys, settings } = useAppState();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const palette = paletteFor(settings.region);
  const strings = stringsFor(settings.language);
  const styles = settingsStyles(palette, settings.language === 'ko');
  const [sheet, setSheet] = useState<Sheet>('none');
  const close = () => setSheet('none');

  const titleFontSize = guideTitleSizeFor(window.width) * TEXT_SCALE.font;

  /**
   * 완주 기록 — 지금까지 바친 날의 수.
   *
   * 시안은 이 자리에 "완주한 묵주기도의 수"를 두고 그 아래 성모송 수를 적는데, 시안에는
   * 여정이 없어 하루하루가 곧 한 번의 완주다. 이 앱에서 그것에 해당하는 것은 **여정들이
   * 바친 날의 합**이므로 그 수를 센다. 새 수를 지어내지 않고 이미 있는 셈(`countDays`)을 쓴다.
   */
  const prayedDays = journeys.reduce((sum, journey) => sum + countDays(journey.days).prayed, 0);

  return (
    <View style={styles.screen} testID="settings-screen">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingTop: insets.top + 18, paddingBottom: TAB_BAR_HEIGHT + 24 },
        ]}
      >
        <Text style={styles.brand}>{strings.appName}</Text>
        <Text
          style={[styles.title, { fontSize: titleFontSize, lineHeight: titleFontSize * 1.05 }]}
        >
          {strings.settings}
        </Text>

        {/*
          ── 지역·언어 ───────────────────────────────────────────────────────
          시안의 첫 줄 그대로다 — 위아래에 괘선이 하나씩 있고, 오른쪽에 화살표가 선다.
          아래 작은 글은 지금 고른 지역과 언어를 함께 말한다(시안의 `regionName · langName`).
        */}
        <Pressable
          style={styles.linkRow}
          onPress={() => router.push('/region')}
          accessibilityRole="button"
          testID="settings-region"
        >
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{strings.regionLang}</Text>
            <Text style={styles.rowNote} testID="settings-region-value">
              {`${strings[settings.region]} · ${LANGUAGES[settings.language].name}`}
            </Text>
          </View>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d="m9 18 6-6-6-6"
              stroke={palette.ink}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Pressable>

        {/*
          ── 글자 크기 넉 칸 ─────────────────────────────────────────────────
          시안의 `seg` 그대로다 — 한 줄에 넉 칸, 칸마다 자기 크기의 글자로 이름을 적어
          고르기 전에 결과가 보이게 한다. 고른 칸은 강조색 테 하나로만 표시한다.

          **기도 화면의 `Aa` 단추와 같은 값을 고친다.** 두 곳에서 고칠 수 있는 유일한
          설정이며, 기도문을 보면서 고치는 쪽(기도 화면)과 미리 정해 두는 쪽(여기)이
          모두 필요하기 때문이다.
        */}
        <View style={styles.block}>
          <Text style={styles.rowLabel}>{strings.fontSize}</Text>
          <View style={styles.seg} testID="settings-font-scale">
            {FONT_SCALE_LABEL_KEYS.map((key, index) => {
              const value = asFontScaleIndex(index);
              const here = settings.fontScale === value;
              return (
                <Pressable
                  key={key}
                  style={[styles.segOption, index > 0 ? styles.segDivider : null, here ? styles.segOn : null]}
                  onPress={() => updateSettings({ fontScale: value as FontScaleIndex })}
                  accessibilityRole="radio"
                  /*
                    `aria-selected` 를 쓰는 이유. 이 저장소가 지금까지 쓰던
                    `accessibilityState` 는 **웹에서 해당 속성을 내보내지 않는 것이
                    실측됐다**(2026-09-18 — `role` 만 나오고 상태가 빠졌다). React Native 는
                    0.71 부터 `aria-*` 를 같은 뜻의 별칭으로 받으므로 웹·iOS·안드로이드가
                    함께 읽고, 화면 낭독기도 시험도 같은 것을 본다.
                  */
                  aria-selected={here}
                  testID={`settings-font-${index}`}
                >
                  <Text
                    style={[
                      styles.segLabel,
                      { fontSize: FONT_SEG_PX[index], lineHeight: FONT_SEG_PX[index]! },
                      here ? styles.segLabelOn : null,
                    ]}
                  >
                    {strings[key]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── 낭송 방식 · 받는 사이 · 묵주 (시안의 토글 자리에 앉은 이 저장소의 줄 셋) ── */}
        <ValueRow
          palette={palette}
          isKorean={settings.language === 'ko'}
          label="낭송 방식"
          value={RECITATION_NAMES[settings.recitation]}
          onPress={() => setSheet('recitation')}
          testID="settings-recitation"
        />
        <ValueRow
          palette={palette}
          isKorean={settings.language === 'ko'}
          label="받는 사이"
          value={PACE_NAMES[settings.pace]}
          onPress={() => setSheet('pace')}
          testID="settings-pace"
        />
        <ValueRow
          palette={palette}
          isKorean={settings.language === 'ko'}
          label="묵주"
          value={ROSARY_NAMES[settings.rosary]}
          onPress={() => setSheet('rosary')}
          testID="settings-rosary"
        />

        {/* ── 켬/끔 셋 ────────────────────────────────────────────────────── */}
        <ToggleRow
          palette={palette}
          isKorean={settings.language === 'ko'}
          label="손 없이 조작"
          on={settings.handsFree}
          onPress={() => updateSettings({ handsFree: !settings.handsFree })}
          testID="settings-handsfree"
        />
        {settings.handsFree ? (
          <Text style={styles.note} testID="settings-handsfree-note">
            폰을 흔들면 다음 알로, 이어폰 버튼으로 앞뒤로 갑니다.
          </Text>
        ) : null}
        {/*
          이 줄만 문구를 i18n 표에서 가져오지 않았다. 시안의 표는 이 항목을 `햅틱` 이라
          적는데(기계로 옮긴 값이라 고치지 않는다), 작업 지시서가 이 줄의 이름을 `진동`
          으로 정했고 우리말로도 그쪽이 읽힌다. 영어 문구가 필요해지면 표에 따로 더한다.
        */}
        <ToggleRow
          palette={palette}
          isKorean={settings.language === 'ko'}
          label="진동"
          on={settings.haptic}
          onPress={() => updateSettings({ haptic: !settings.haptic })}
          testID="settings-haptic"
        />
        <ToggleRow
          palette={palette}
          isKorean={settings.language === 'ko'}
          label={strings.reduceMotion}
          on={settings.reduceMotion}
          onPress={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
          testID="settings-reduce-motion"
        />

        {/* ── 완주 기록 (시안의 `history` 줄) ─────────────────────────────── */}
        <View style={styles.countRow}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{strings.history}</Text>
            <Text style={styles.rowNote}>
              {prayedDays > 0 ? `지금까지 ${prayedDays}일을 바쳤습니다` : '아직 바친 날이 없습니다'}
            </Text>
          </View>
          <Text style={styles.count} testID="settings-history-count">
            {prayedDays}
          </Text>
        </View>

        {/* ── 소개 ────────────────────────────────────────────────────────── */}
        <Pressable
          style={styles.linkRow}
          onPress={() => setSheet('about')}
          accessibilityRole="button"
          testID="settings-about"
        >
          <Text style={styles.rowLabel}>소개</Text>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d="m9 18 6-6-6-6"
              stroke={palette.ink}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Pressable>
      </ScrollView>

      {/* 낭송 방식 — 이름과 설명은 06-screen-spec 화면 E 의 문구 표 그대로다. */}
      <ChoiceSheet
        visible={sheet === 'recitation'}
        label="낭송 방식"
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

      {/*
        S5 묵주 고르기. 다른 시트와 달리 전용 시트를 쓰는 이유는 **고른 묵주를 눈으로
        보여 줘야** 하기 때문이다 (`src/prayer/RosarySheet.tsx` 의 머리글).
      */}
      <RosarySheet
        visible={sheet === 'rosary'}
        selected={settings.rosary}
        note="모든 여정의 기도 화면에 적용됩니다"
        onSelect={(key) => {
          updateSettings({ rosary: key });
          close();
        }}
        onClose={close}
        testID="sheet-rosary"
      />

      {/*
        S7 소개 — 08 검증 참가자에게 이 빌드가 무엇을 묻는지 알린다.

        **이 시트의 글자색이 W2 슬라이스 C 에서 고쳐졌다.** 그전에는 이 화면이 한지 벌이라
        시트 안의 글도 한지 벌의 색을 썼는데, 슬라이스 B 가 시트 부품을 새 시안의 어법으로
        옮기면서 판은 종이색이 되고 글만 옛 벌에 남았다. 밤 벌에서는 밝은 종이 위에 밝은
        글자가 얹혀 읽히지 않았다. 이제 글도 그 지역의 색 벌에서 색을 고른다.
      */}
      <BottomSheet visible={sheet === 'about'} label="소개" onClose={close} testID="sheet-about">
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

      <WorldTabBar current="settings" />
    </View>
  );
}

/**
 * 값이 오른쪽에 적히는 줄 — 눌러 시트를 연다 (낭송 방식 · 받는 사이 · 묵주).
 *
 * 시안에는 이 모양의 줄이 없다. 시안의 설정 항목은 전부 켬/끔 토글이라 값을 적을 자리가
 * 없었기 때문이다. 그래서 **시안의 토글 줄에서 오른쪽 토글만 값 글자로 바꾼 것**이며,
 * 높이(56) · 위아래 여백(14) · 아래 괘선은 그 토글 줄과 같다.
 */
function ValueRow({
  palette,
  isKorean,
  label,
  value,
  onPress,
  testID,
}: {
  palette: WorldPalette;
  isKorean: boolean;
  label: string;
  value: string;
  onPress: () => void;
  testID: string;
}) {
  const styles = settingsStyles(palette, isKorean);
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button" testID={testID}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} testID={`${testID}-value`}>
        {value}
      </Text>
    </Pressable>
  );
}

/**
 * 켬/끔 줄 — 시안의 토글 그대로다 (44×26, 반지름 13, 손잡이 18, 200ms).
 *
 * **켠 토글의 바탕은 `accent` 를 그대로 쓴다.** 그 면은 글자가 아니라 색칠한 자리이기
 * 때문이다 (`decisions.md` Q-51 이 가른 기준). 손잡이는 종이색이라 켠 상태에서 강조색
 * 위에 종이색 점이 서고, 끈 상태에서는 흐린 테 안에 흐린 점이 선다.
 */
function ToggleRow({
  palette,
  isKorean,
  label,
  on,
  onPress,
  testID,
}: {
  palette: WorldPalette;
  isKorean: boolean;
  label: string;
  on: boolean;
  onPress: () => void;
  testID: string;
}) {
  const styles = settingsStyles(palette, isKorean);
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="switch"
      /* `aria-checked` 를 쓰는 까닭은 위 글자 크기 고르개의 주석과 같다. */
      aria-checked={on}
      testID={testID}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View
        style={[styles.track, on ? styles.trackOn : null]}
        testID={`${testID}-value`}
        accessibilityLabel={on ? '켜짐' : '꺼짐'}
      >
        <View style={[styles.knob, on ? styles.knobOn : null]} />
      </View>
    </Pressable>
  );
}

/**
 * 크기와 간격은 시안의 `Settings` 마크업에서 그대로 옮겼다 — 좌우 24, 줄의 위아래 14~16,
 * 줄 높이 56, 아래 괘선 1px, 토글 44×26.
 *
 * 색은 지역의 색 벌에서만 온다. 글자에 쓰는 강조는 `accentText`, 테두리와 채운 면에 쓰는
 * 강조는 `accent` 다 (`decisions.md` Q-51).
 */
const settingsStyles = (palette: WorldPalette, isKorean: boolean) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.paper },
    scroll: { flex: 1 },
    scrollInner: { flexGrow: 1, paddingHorizontal: 24 },
    brand: { ...worldSettingsType.brand, color: palette.accentText, textTransform: 'uppercase' },
    title: {
      fontFamily: worldFontStack('heading', isKorean),
      color: palette.ink,
      marginTop: 6,
      marginBottom: 10,
      ...koWordBreak,
    },

    /* 줄 셋의 모양 — 값이 붙는 줄 · 토글 줄 · 화살표가 붙는 줄. */
    row: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: RULE,
    },
    linkRow: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: RULE,
      borderBottomWidth: 1,
      borderBottomColor: RULE,
    },
    countRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: RULE,
    },
    block: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: RULE, gap: 10 },

    rowText: { flex: 1, minWidth: 0 },
    rowLabel: { ...worldSettingsType.rowLabel, color: palette.ink, ...koWordBreak },
    rowNote: { ...worldSettingsType.rowNote, color: palette.muted, marginTop: 2, ...koWordBreak },
    rowValue: { ...worldSettingsType.rowValue, color: palette.accentText, textAlign: 'right' },
    count: { ...worldSettingsType.count, color: palette.accentText },
    note: { ...worldSettingsType.rowNote, color: palette.muted, paddingTop: 10, ...koWordBreak },

    /* 글자 크기 고르개 — 「Classical」 의 `.seg` (테 1px, 모서리 4, 칸 사이 세로선). */
    seg: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: RULE,
      borderRadius: worldRadius.md,
      overflow: 'hidden',
    },
    segOption: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
    segDivider: { borderLeftWidth: 1, borderLeftColor: RULE },
    /* 고른 칸은 강조색 테 하나로만 표시한다 (「Classical」 의 `inset 0 0 0 1px`). */
    segOn: { borderWidth: 1, borderColor: palette.accent },
    /*
      `koWordBreak` 를 펴 넣는 자리다. 좁은 기기(320)에서는 넉 칸이 `아주 크게` 를 한 줄에
      담지 못하는데, 그냥 두면 브라우저가 한국어를 글자 단위로 끊어 `아주 크 / 게` 가 된다.
      이 값이 있으면 띄어쓰기에서만 끊겨 `아주 / 크게` 가 된다 — 줄이 하나 늘 뿐 낱말은 산다.
    */
    segLabel: { fontFamily: worldFontStack('body', isKorean), color: palette.muted, ...koWordBreak },
    segLabelOn: { color: palette.accentText },

    /* 토글 — 시안의 44×26. 켠 바탕은 글자가 아니므로 `accent` 를 그대로 쓴다. */
    track: {
      width: 44,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: RULE,
      backgroundColor: 'transparent',
      justifyContent: 'center',
    },
    trackOn: { borderColor: palette.accent, backgroundColor: palette.accent },
    knob: {
      position: 'absolute',
      top: 3,
      left: 3,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: palette.muted,
    },
    knobOn: { left: 23, backgroundColor: palette.paper },

    aboutTitle: { ...worldSettingsType.rowLabel, color: palette.ink, marginBottom: 10 },
    aboutBody: { ...worldSettingsType.rowNote, color: palette.muted, marginBottom: 22 },
  });
