/**
 * 오늘의 신비 — 「MyRosary World」 시안의 `data-screen-label="Today's Mystery"` 블록을
 * 옮긴 화면 (W2 슬라이스 B).
 *
 * 오늘 바칠 다섯 단을 번호와 성경 구절과 함께 펼쳐 놓는다. 홈이 첫 단 한 줄만 보여 주는 데
 * 견주어, 이 화면은 **오늘 무엇을 묵상하게 되는지 다섯 줄을 다 보여 주는** 자리다.
 *
 * ── 시안과 다르게 한 자리 넷 (그리고 그 이유) ──────────────────────────────────
 *
 * 1. **오늘의 신비를 정하는 규칙이 시안이 아니라 이 저장소의 것이다.** 시안은 요일 하나로만
 *    신비를 고르는데(`DAY_TO_SET`), 이 앱의 54일 기도는 요일과 무관하게 **며칠째인가**로
 *    환희·고통·영광을 하루씩 돈다(FR-43). 그래서 규칙을 새로 쓰지 않고 이미 있는 것을
 *    부른다 — 여는 여정이 있으면 `mysteryOf(여정, 오늘)`, 없으면 `mysteryForWeekday()` 다.
 *    홈이 같은 두 갈래를 쓰므로 두 화면이 언제나 같은 신비를 말한다.
 * 2. **다섯 단의 제목이 시안의 글이 아니라 이 저장소의 정본이다.** 까닭과 출처는
 *    `src/mystery/text.ts` 의 머리에 표로 적어 두었다.
 * 3. **신비 해설로 가는 링크를 하나 두었다.** 시안에는 해설 화면(`Mysteries Guide`)이
 *    그려져 있는데 **어느 화면에서도 그리로 가는 길이 없다** — 시안 자신의 배선 누락이다.
 *    성격이 가장 가까운 이 화면에서 잇고, 링크의 값은 시안이 홈에서 같은 성격의 링크에
 *    쓰는 것을 그대로 가져왔다.
 * 4. **아래 탭 바를 놓지 않았다.** 시안은 이 화면에도 탭 바를 세우지만(`navScreens`), 이
 *    앱의 화면은 쌓이는 구조(스택)이고 탭 바는 **홈 위에 한 장만 쌓인다**는 규칙 위에서만
 *    바르게 돈다(`src/ui/WorldTabBar.tsx`). 이 화면은 그 한 장 위에 또 한 장이므로 탭 바를
 *    놓으면 `홈` 탭이 홈이 아니라 아래 화면으로 떨어진다. 대신 머리에 뒤로 화살표를 둔다 —
 *    이 저장소가 새 기도·초대 코드 화면에서 이미 쓰는 어법이다.
 */
import { Image } from 'expo-image';
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
import { artSession } from '../src/art';
import { MYSTERY_SETS, mysteryForWeekday } from '../src/domain/mysteries';
import { stringsFor } from '../src/i18n';
import { cardStatus } from '../src/journey/card';
import { mysteryOf } from '../src/journey/session';
import { mysteryRows, todayLabelKo } from '../src/mystery/text';
import { primeSpeech } from '../src/prayer/channels';
import { useAppState } from '../src/state/useAppState';
import { fonts } from '../src/theme';
import { TEXT_SCALE } from '../src/theme/fontScale';
import {
  koWordBreak,
  mysteryTitleSizeFor,
  paletteFor,
  worldMysteryType,
  worldRadius,
  type WorldPalette,
} from '../src/theme/worldTokens';

export default function MysteryScreen() {
  const { ready, journeys, settings } = useAppState();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const palette = paletteFor(settings.region);
  const strings = stringsFor(settings.language);
  const styles = mysteryStyles(palette);
  const today = new Date();

  /*
    **다 읽기 전에는 그리지 않는다.** 이 화면은 처음부터 끝까지 "오늘이 언제인가"에 기대어
    있는데, 설치형 웹앱은 빌드할 때 미리 그려 둔 HTML 로 먼저 뜨고 그 위에 앱이 얹힌다.
    미리 그려 둔 글은 빌드한 날의 신비이므로, 앱이 오늘 날짜로 다시 그리면 두 글이 어긋나
    브라우저 콘솔에 맞춤 실패(React #418)가 찍힌다 — 홈이 같은 이유로 같은 문을 둔다.
  */
  if (!ready) return <View style={styles.screen} testID="mystery-screen" />;

  /** 오늘 바칠 수 있는 첫 여정. 홈의 주 단추가 여는 것과 같은 것을 고른다. */
  const openable = journeys.find((journey) => {
    const status = cardStatus(journey, today, null);
    return status !== 'notStarted' && status !== 'ended';
  });

  /** 오늘의 신비 — 여는 여정이 있으면 그 여정의 규칙을, 없으면 요일 규칙을 따른다 (FR-43). */
  const todaySet = openable ? mysteryOf(openable, today) : mysteryForWeekday(today.getDay());
  const rows = mysteryRows(todaySet, settings.language);

  /** 성화. 홈과 같은 키로 물으므로 홈에 떠 있는 그림이 그대로 온다. */
  const plate = openable
    ? artSession.forJourney(openable.id)
    : artSession.forKey('screen:home', ['login']);

  const titleFontSize = mysteryTitleSizeFor(window.width) * TEXT_SCALE.font;

  return (
    <View style={styles.screen} testID="mystery-screen">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* ── 머리 · 뒤로 화살표와 작은 라벨 ────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            style={styles.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
            accessibilityRole="button"
            accessibilityLabel={strings.back}
            testID="mystery-back"
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
          <Text style={styles.label} testID="mystery-label">
            {strings.today}
          </Text>
        </View>

        {/* ── 큰 제목과 오늘 날짜 ──────────────────────────────────────── */}
        <View style={styles.titleBlock}>
          <Text
            style={[styles.title, { fontSize: titleFontSize, lineHeight: titleFontSize * 1.05 }]}
            testID="mystery-set"
          >
            {MYSTERY_SETS[todaySet].name}
          </Text>
          <Text style={styles.date} testID="mystery-date">
            {todayLabelKo(today)}
          </Text>
        </View>

        {/* ── 성화 한 장 — 시안의 `.plate` (종이색 6px 테와 그 바깥의 1px 선) ── */}
        <View style={styles.plate}>
          <View style={styles.plateInner}>
            {plate ? (
              <Image
                source={plate.source}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                contentPosition={{ left: plate.focus.login.x, top: plate.focus.login.y }}
                accessible={false}
              />
            ) : null}
          </View>
        </View>

        {/* ── 다섯 단 ─────────────────────────────────────────────────── */}
        <View style={styles.list}>
          {rows.map((row) => (
            <View key={row.n} style={styles.row} testID={`mystery-row-${row.n}`}>
              <Text style={styles.rowNumber}>{row.n}</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowRef}>{row.ref}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── 신비 해설로 가는 길 (시안의 배선 누락을 여기서 잇는다) ─────── */}
        <Pressable
          style={styles.link}
          onPress={() => router.push('/guide')}
          accessibilityRole="button"
          testID="mystery-guide-link"
        >
          <Text style={styles.linkLabel}>{`${strings.mysteryGuide} →`}</Text>
        </Pressable>

        {/* ── 주 단추 — 홈의 것과 같은 일을 한다 ─────────────────────────── */}
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
          testID="mystery-primary"
        >
          <Text style={styles.primaryLabel}>{openable ? strings.start : '새 기도'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

/**
 * 크기와 간격은 시안의 `Today's Mystery` 마크업에서 그대로 옮겼다 — 머리 좌우 12,
 * 본문 좌우 24, 성화 위 18, 줄마다 위아래 12 와 위 괘선 1px, 주 단추 높이 56 과 모서리 4.
 *
 * 색은 지역의 색 벌에서만 온다. 글자에 쓰는 강조는 `accentText`, 테두리에 쓰는 강조는
 * `accent` 다 (`decisions.md` Q-51).
 */
const mysteryStyles = (palette: WorldPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.paper },
    scroll: { flex: 1 },
    scrollInner: { flexGrow: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 },
    back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    label: { ...worldMysteryType.label, color: palette.accentText },
    titleBlock: { paddingHorizontal: 24, paddingTop: 8 },
    title: {
      fontFamily: fonts.serif,
      color: palette.ink,
      marginBottom: 6,
      ...koWordBreak,
    },
    date: { ...worldMysteryType.date, color: palette.muted },
    /* 시안의 `.plate` — 종이색 6px 테를 두르고 그 바깥에 1px 선이 한 겹 더 선다. */
    plate: {
      marginHorizontal: 24,
      marginTop: 18,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,.14)',
      padding: 6,
      backgroundColor: palette.paper,
    },
    plateInner: { aspectRatio: 4 / 3, backgroundColor: palette.scrim, overflow: 'hidden' },
    list: { marginHorizontal: 24, marginTop: 18 },
    row: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,.14)',
    },
    rowNumber: { ...worldMysteryType.rowNumber, color: palette.accentText, width: 34 },
    rowText: { flex: 1, minWidth: 0 },
    rowTitle: { ...worldMysteryType.rowTitle, color: palette.ink, ...koWordBreak },
    rowRef: { ...worldMysteryType.rowRef, color: palette.muted, marginTop: 3 },
    link: {
      marginHorizontal: 24,
      minHeight: 44,
      justifyContent: 'center',
    },
    linkLabel: {
      ...worldMysteryType.link,
      color: palette.accentText,
      textDecorationLine: 'underline',
    },
    primary: {
      marginHorizontal: 24,
      marginTop: 12,
      minHeight: 56,
      borderRadius: worldRadius.md,
      borderWidth: 1,
      borderColor: palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryLabel: { ...worldMysteryType.primary, color: palette.accentText },
  });
