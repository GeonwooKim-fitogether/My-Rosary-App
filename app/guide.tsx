/**
 * 신비 해설 — 「MyRosary World」 시안의 `data-screen-label="Mysteries Guide"` 블록을
 * 옮긴 화면 (W2 슬라이스 B).
 *
 * 네 벌(환희·빛·고통·영광)을 위쪽 칸으로 갈아 끼우며, 벌마다 다섯 단의 제목과 성경 구절과
 * 해설 한 문단을 읽는 자리다. 오늘 바치는 신비만 보여 주는 `오늘의 신비` 화면과 달리,
 * 여기서는 **오늘이 아닌 벌도 펼쳐 볼 수 있다.**
 *
 * ── 시안과 다르게 한 자리 넷 (그리고 그 이유) ──────────────────────────────────
 *
 * 1. **이 화면으로 들어오는 길을 만들었다.** 시안에서 이 화면은 그려져 있기만 하고 어느
 *    화면에서도 닿지 않는다(`goGuide` 가 없다). 오늘의 신비 화면에 링크 한 줄을 두어 이었다.
 * 2. **다섯 단의 제목이 시안의 글이 아니라 이 저장소의 정본이다.** 까닭과 출처는
 *    `src/mystery/text.ts` 의 머리에 표로 적어 두었다.
 * 3. **맨 아래 단추가 "고른 벌"이 아니라 "오늘의 기도"로 들어간다.** 시안은 여정이 없는 앱이라
 *    아무 벌이나 골라 그 자리에서 바치기 시작할 수 있다. 이 앱에서 기도는 언제나 **어떤
 *    여정의 하루**이고, 그 하루의 신비는 여정의 형식이 정한다(FR-43) — 사람이 화면에서
 *    고른 벌이 그것을 덮어쓰면 54일 순환이 깨진다. 그래서 단추는 그 여정의 오늘 기도로
 *    들어가고, **고른 벌이 오늘의 벌과 다르면 그 사실을 단추 아래 한 줄로 밝힌다.**
 *    바칠 여정이 하나도 없으면 같은 자리가 `새 기도` 로 간다 — 여정이 없으면 기도도 없다.
 * 4. **아래 탭 바를 놓지 않았다.** 까닭은 `app/mystery.tsx` 의 머리 4 번과 같다.
 * 5. **한국어의 해설이 시안보다 훨씬 길다.** 시안의 해설은 한 단에 한 문장이라, 그 장면을
 *    처음 보는 사람에게는 설명이 되지 않았다. 한국어에 한해 세 칸으로 나뉜 긴 해설을
 *    싣는다 — 무슨 일이 있었나 · 무엇을 묵상하나 · 오늘 나에게. 글의 출처와 아직 교회의
 *    검토를 받지 않았다는 사실은 `spec/mystery-commentary.ko.json` 의 머리에 있다.
 *    그 해설이 없는 언어는 지금까지처럼 시안의 한 문단을 그대로 그린다.
 */
import { useState } from 'react';
import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MYSTERY_SETS, mysteryForWeekday } from '../src/domain/mysteries';
import type { MysteryKey } from '../src/domain/types';
import { fill, stringsFor } from '../src/i18n';
import { cardStatus } from '../src/journey/card';
import { mysteryOf } from '../src/journey/session';
import { MYSTERY_SET_ORDER, mysteryRows, shortSetName } from '../src/mystery/text';
import { primeSpeech } from '../src/prayer/channels';
import { useAppState } from '../src/state/useAppState';
import { fonts } from '../src/theme';
import { TEXT_SCALE } from '../src/theme/fontScale';
import {
  koWordBreak,
  guideTitleSizeFor,
  paletteFor,
  worldGuideType,
  worldRadius,
  type WorldPalette,
} from '../src/theme/worldTokens';

export default function GuideScreen() {
  const { ready, journeys, settings } = useAppState();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const palette = paletteFor(settings.region);
  const strings = stringsFor(settings.language);
  const styles = guideStyles(palette);
  const today = new Date();

  /** 사람이 칸을 눌러 고른 벌. 아직 고르지 않았으면 오늘의 벌이 선다 (시안의 `guideSet`). */
  const [picked, setPicked] = useState<MysteryKey | null>(null);

  // 오늘의 벌을 계산하려면 저장된 여정을 다 읽어야 하므로, 읽기가 끝나기 전에는 그리지 않는다
  // (`app/mystery.tsx` 의 같은 문과 같은 까닭 — 미리 그려 둔 HTML 과 어긋나지 않게 한다).
  if (!ready) return <View style={styles.screen} testID="guide-screen" />;

  const openable = journeys.find((journey) => {
    const status = cardStatus(journey, today, null);
    return status !== 'notStarted' && status !== 'ended';
  });
  const todaySet = openable ? mysteryOf(openable, today) : mysteryForWeekday(today.getDay());
  const set = picked ?? todaySet;
  const rows = mysteryRows(set, settings.language);
  const titleFontSize = guideTitleSizeFor(window.width) * TEXT_SCALE.font;

  return (
    <View style={styles.screen} testID="guide-screen">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
            accessibilityRole="button"
            accessibilityLabel={strings.back}
            testID="guide-back"
            hitSlop={8}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path
                d="m15 18-6-6 6-6"
                stroke={palette.ink}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Pressable>
          <Text style={styles.label} testID="guide-label">
            {strings.mysteryGuide}
          </Text>
        </View>

        <View style={styles.body}>
          <Text
            style={[styles.title, { fontSize: titleFontSize, lineHeight: titleFontSize * 1.05 }]}
            testID="guide-set"
          >
            {strings[set]}
          </Text>

          {/* ── 네 벌을 고르는 칸 — 「Classical」 의 `.seg` ────────────────── */}
          <View style={styles.seg} testID="guide-tabs">
            {MYSTERY_SET_ORDER.map((key, index) => {
              const on = key === set;
              return (
                <Pressable
                  key={key}
                  style={[
                    styles.segOpt,
                    index === 0 ? null : styles.segOptStacked,
                    on ? styles.segOptOn : null,
                  ]}
                  onPress={() => setPicked(key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  testID={`guide-tab-${key}`}
                >
                  <Text style={[styles.segLabel, on ? styles.segLabelOn : null]}>
                    {shortSetName(strings[key])}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ── 다섯 단과 해설 ──────────────────────────────────────────── */}
          <View style={styles.list}>
            {rows.map((row) => (
              <View key={row.n} style={styles.row} testID={`guide-row-${row.n}`}>
                <Text style={styles.rowNumber}>{row.n}</Text>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{row.title}</Text>
                  <Text style={styles.rowRef}>{`${strings.scripture} · ${row.ref}`}</Text>
                  {row.commentary ? (
                    /*
                      긴 해설이 있는 언어(지금은 한국어)는 세 칸으로 나뉘어 선다. 나누지
                      않고 석 문단을 붙여 놓으면 한 덩어리로 흘려 읽히므로, 칸마다 작은
                      제목을 세워 무엇을 읽고 있는지 보이게 한다.
                    */
                    <View testID={`guide-commentary-${row.n}`}>
                      <Text style={styles.partLabel}>{strings.commentaryScene}</Text>
                      <Text style={styles.rowNote}>{row.commentary.scene}</Text>
                      <Text style={styles.partLabel}>{strings.commentaryMeaning}</Text>
                      <Text style={styles.rowNote}>{row.commentary.meaning}</Text>
                      <Text style={styles.partLabel}>{strings.commentaryToday}</Text>
                      <Text style={styles.rowNote}>{row.commentary.today}</Text>
                    </View>
                  ) : (
                    <Text style={styles.rowNote}>{row.note}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          <Pressable
            style={styles.primary}
            onPress={() => {
              if (!openable) {
                // W3 에서 여정을 만드는 자리가 여정 화면 하나로 모였다 (§1-2).
                router.push('/journey');
                return;
              }
              primeSpeech();
              router.push({ pathname: '/pray', params: { id: openable.id } });
            }}
            accessibilityRole="button"
            testID="guide-pray"
          >
            <Text style={styles.primaryLabel}>
              {openable ? strings.prayThis : strings.newPrayer}
            </Text>
          </Pressable>

          {/*
            단추가 무엇을 여는지 정직하게 밝히는 한 줄. 고른 벌이 오늘의 벌과 같으면 할 말이
            없으므로 나오지 않는다 (위 머리의 3 번).
          */}
          {openable && set !== todaySet ? (
            <Text style={styles.primaryNote} testID="guide-today-note">
              {fill(strings.todayIsSet, { set: strings[todaySet] })}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * 크기와 간격은 시안의 `Mysteries Guide` 마크업과 「Classical」 의 `.seg` 선언에서 그대로
 * 옮겼다 — 본문 좌우 24, 제목 아래 14, 칸 높이 44 와 모서리 4 와 1px 테, 줄마다 위아래 16 과
 * 아래 괘선 1px, 주 단추 높이 52.
 *
 * 색은 지역의 색 벌에서만 온다. 글자는 `accentText`, 테두리는 `accent` 다 (Q-51).
 */
const guideStyles = (palette: WorldPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.paper },
    scroll: { flex: 1 },
    scrollInner: { flexGrow: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 },
    back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    label: { ...worldGuideType.label, color: palette.accentText },
    body: { paddingHorizontal: 24, paddingTop: 6 },
    title: {
      fontFamily: fonts.serif,
      color: palette.ink,
      marginBottom: 14,
      ...koWordBreak,
    },
    /* 「Classical」 `.seg` — 1px 테 안에 칸이 붙어 서고 모서리는 4 다. */
    seg: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,.14)',
      borderRadius: worldRadius.md,
      overflow: 'hidden',
    },
    segOpt: {
      flex: 1,
      minHeight: 44,
      paddingVertical: 6,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    /* `.seg-opt + .seg-opt` — 둘째 칸부터 왼쪽에 가르는 선이 선다. */
    segOptStacked: { borderLeftWidth: 1, borderLeftColor: 'rgba(0,0,0,.14)' },
    /*
      고른 칸은 시안에서 `box-shadow: inset 0 0 0 1px var(--color-accent)` 로 표시된다.
      React Native 에는 안쪽 그림자가 없으므로 같은 뜻의 1px 테를 그린다 — 선은 글자가
      아니므로 시안의 `accent` 를 그대로 쓴다 (Q-51).
    */
    segOptOn: { borderWidth: 1, borderColor: palette.accent },
    segLabel: { ...worldGuideType.tab, color: palette.ink, textAlign: 'center' },
    segLabelOn: { color: palette.accentText },
    list: { marginTop: 10 },
    row: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,.14)',
    },
    rowNumber: { ...worldGuideType.rowNumber, color: palette.accentText, width: 36 },
    rowText: { flex: 1, minWidth: 0 },
    rowTitle: { ...worldGuideType.rowTitle, color: palette.ink, ...koWordBreak },
    rowRef: { ...worldGuideType.rowRef, color: palette.muted, marginTop: 4 },
    /* 시안의 해설은 `opacity:.85` 로 한 걸음 물러나 있다. */
    rowNote: { ...worldGuideType.rowNote, color: palette.ink, opacity: 0.85, marginTop: 8 },
    /*
      긴 해설 세 칸의 작은 제목. 위 여백(14)이 아래 여백(8, `rowNote` 가 가진다)보다 넓어
      제목이 바로 아래 문단에 붙고 앞 문단에서 떨어진다 — 제목이 어느 쪽 것인지가 간격만
      보고도 갈린다.
    */
    partLabel: { ...worldGuideType.partLabel, color: palette.accentText, marginTop: 14 },
    primary: {
      marginTop: 20,
      minHeight: 52,
      borderRadius: worldRadius.md,
      borderWidth: 1,
      borderColor: palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryLabel: { ...worldGuideType.primary, color: palette.accentText },
    primaryNote: { ...worldGuideType.rowRef, color: palette.muted, marginTop: 10 },
  });
