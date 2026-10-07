/**
 * D 기도 여정 — 「MyRosary World」 시안의 `data-screen-label="Journeys"` 블록을 옮긴 화면
 * (W3 슬라이스 A).
 *
 * 값(색·크기·간격·문구)은 그 블록에서 그대로 가져왔고, 색은 지역 다섯의 색 벌
 * (`src/theme/worldTokens.ts`)에서 이름으로 고른다. 화면이 스스로 정하는 색은 없다.
 *
 * ── 이 화면이 2026-09-18 에 어떻게 달라졌나 ─────────────────────────────────────
 *
 * 그전까지 이 자리는 v5 시안의 **여정 상세** 화면이었다. 홈의 카드를 눌러 한 여정만 열고,
 * 그 안에서 격자와 통계 다섯 줄과 단추 셋을 보는 구조였다. 새 시안에는 상세 화면이 아예
 * 없고, 대신 **목록의 줄이 아코디언처럼 펴진다** — 여정이 여럿일 때 화면을 오가지 않고
 * 한자리에서 견줄 수 있다.
 *
 * | 무엇 | 옛 화면 (v5 여정 상세) | 이 화면 (World 기도 여정) |
 * |---|---|---|
 * | 다루는 범위 | 여정 하나 | 여정 전부 |
 * | 격자 | 화면 가운데 큰 격자 하나 | 줄을 펴야 나오는 격자 |
 * | 통계 | 바친 날·못 바친 날·성모송·청원에서 감사로·마치는 날 다섯 줄 | 펴진 자리 아래 한 줄 (`오늘 바침 · 완료 예정 10월 28일`) |
 * | 여정을 새로 만드는 곳 | 따로 있는 `새 기도` 화면 | **이 화면 아래쪽** (§1-2) |
 * | 나가는 길 | 머리의 `돌아가기` | 아래 탭 바 |
 *
 * ── 시안과 다르게 한 자리 아홉 (그리고 그 이유) ────────────────────────────────
 *
 * 1. **날짜 격자가 언제나 아홉 열이다.** 시안은 27칸이 넘으면 열여덟 열로 그리는데
 *    (`cols: total > 27 ? 18 : 9`), 시안 자신이 요구하는 최소 너비 320px 에서 칸 하나가
 *    11.33px 이 된다. 이 격자에서 **오늘 칸은 바탕이 아니라 1px 테두리 하나로만** 구별되므로,
 *    테두리가 네모 넓이의 18% 를 차지해 칠해진 칸·오늘 칸·빈 칸 셋을 눈으로 가를 수 없다.
 *    잰 값과 판단은 `docs/plan/w3-work-order.md` §1-1 에 있다.
 * 2. **지우기 앞에 확인 시트가 선다.** 시안은 `지우기` 를 누르면 아무것도 묻지 않고 그
 *    여정과 기록을 통째로 지운다. 이 저장소는 자리를 지우는 조작에 확인을 둔다(FR-05 ·
 *    시트 S6). 같은 판단을 W1 의 나가기와 W2 의 `다시 바치기` 에서 이미 두 번 했고,
 *    시트는 이미 있는 `src/ui/RemoveJourneySheet.tsx` 를 그대로 쓴다.
 * 3. **줄의 주 단추가 그 여정의 기도로 간다.** 시안의 `j.pray` 는 어느 줄을 눌러도 "오늘의
 *    기도" 하나를 열도록 배선돼 있다(시안에는 여정이라는 개념이 없어 하루가 하나뿐이기
 *    때문이다). 이 앱에서 기도는 언제나 **어떤 여정의 하루**이므로 그 여정의 번호를 들고
 *    들어간다 (FR-42).
 * 4. **끝난 여정의 단추가 다르다.** 시안에는 끝이라는 상태가 없다. 이 앱에서 여정의 끝은
 *    사라짐이 아니라 완주이므로, 끝난 줄의 단추는 기도가 아니라 **여정 완주 화면**
 *    (`app/all-done.tsx`)으로 간다.
 * 5. **시작 전 여정은 흐리고 눌리지 않는다.** 시작일이 아직 오지 않은 여정을 시안은 모른다.
 *    이 앱은 홈에서 이미 그 상태를 흐린 줄로 말하고 있으므로(FR-36 · 06-e 결함 8) 같은
 *    어법을 여기에도 둔다.
 * 6. **바람을 비우고 시작할 수 없다.** 시안은 지향이 비면 `지향` 이라는 낱말 자체를 제목
 *    자리에 넣어 여정을 만든다(`j.intention || t.intention`). 이 앱은 바람 한 줄이 여정의
 *    척추라 비운 채로 시작하지 않는다(FR-33) — 옛 `새 기도` 화면이 이미 그렇게 막고 있었고,
 *    그 판정문을 그대로 옮겨 왔다(`journey-missing-title`).
 * 7. **청원인가 감사인가를 고르지 않는다.** 옛 `새 기도` 화면에는 그 구역이 있었는데,
 *    FR-35 가 54일 여정의 1~27일을 청원, 28일째부터를 감사로 정해 두었으므로 고른 값은
 *    어차피 규칙에 덮인다. 9일·날마다 여정에는 애초에 뜻이 없던 자리다
 *    (`docs/plan/w3-work-order.md` §1-2 의 표).
 * 8. **낭송 방식과 묵주를 여기서 고르지 않는다.** 둘 다 W2 가 결정 12-E·D 에 따라 **설정
 *    화면**으로 옮겼다. 새 여정은 그때의 설정값을 물려받는다.
 * 9. **날마다 여정의 오른쪽 수가 `N일째` 다.** 시안은 끝이 없는 여정에 바친 날의 수만
 *    숫자로 적는데(`i.prayed + ''`), 단위 없는 숫자는 며칠째인지 몇 번인지 읽히지 않는다.
 *    이 저장소가 홈과 기도 화면에서 이미 쓰는 말(`dayLabelOn`)을 그대로 쓴다.
 */
import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { JourneyFormat } from '../src/domain/types';
import { fill, stringsFor, type LanguageKey, type Strings } from '../src/i18n';
import { isResumable } from '../src/journey/card';
import { monthDay } from '../src/journey/format';
import {
  countDays,
  dayIndexOn,
  dayLabelOn,
  finishDateOf,
  hasEnded,
  journeyLength,
  notStartedLabel,
  phaseOn,
  prayedTodayAlready,
  rolledDays,
} from '../src/journey/rules';
import type { DayState, Journey } from '../src/journey/session';
import { primeSpeech } from '../src/prayer/channels';
import { addJourney } from '../src/state/appStore';
import { useAppState } from '../src/state/useAppState';
import { positionStore } from '../src/storage/asyncStore';
import type { PrayerPosition } from '../src/storage/position';
import { TEXT_SCALE } from '../src/theme/fontScale';
import {
  GRID_COLUMNS,
  guideTitleSizeFor,
  koWordBreak,
  openEndedGridSize,
  paletteFor,
  worldFontStack,
  worldJourneyType,
  worldRadius,
  type WorldPalette,
} from '../src/theme/worldTokens';
import { RemoveJourneySheet } from '../src/ui/RemoveJourneySheet';
import { TAB_BAR_HEIGHT, WorldTabBar } from '../src/ui/WorldTabBar';

/** 시안의 괘선 — 화면마다 쓰는 `rgba(0,0,0,.14)` 하나다. */
const RULE = 'rgba(0,0,0,.14)';
/** 진행선의 바탕 — 시안의 `rgba(0,0,0,.1)`. */
const TRACK = 'rgba(0,0,0,.1)';
/** 아직 오지 않은 날 칸의 테 — 시안의 `rgba(0,0,0,.18)`. */
const TICK_RULE = 'rgba(0,0,0,.18)';

/** 형식 셋과 그 문구 열쇠. 시안의 `nj9` · `nj54` · `njDaily` 세 칸과 같은 차례다. */
const FORMAT_SEGMENTS: ReadonlyArray<{ key: JourneyFormat; label: keyof Strings }> = [
  { key: 'novena9', label: 'nine' },
  { key: 'fiftyfour', label: 'fiftyFour' },
  { key: 'daily', label: 'daily' },
];

export default function JourneysScreen() {
  const params = useLocalSearchParams();
  const { ready, journeys, settings } = useAppState();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const palette = paletteFor(settings.region);
  const strings = stringsFor(settings.language);
  const isKorean = settings.language === 'ko';
  const styles = journeyStyles(palette, isKorean);
  const today = new Date();

  /**
   * 어느 줄이 펴져 있나. 시안의 `S.openJourney` 와 같고, 한 번에 하나만 펴진다.
   *
   * 주소로 여정 번호가 넘어오면 그 줄을 펴고 연다 — 홈의 며칠째를 누르는 길(FR-37)이
   * 그것이다. 옛 화면에서는 그 길이 여정 하나짜리 상세 화면으로 갔는데, 새 시안에는
   * 상세가 없으므로 **목록의 그 줄이 펴진 채로 열리는 것**이 같은 뜻이 된다.
   */
  const wanted = Array.isArray(params.id) ? params.id[0] : params.id;
  const [open, setOpen] = useState<string | null>(wanted ?? null);

  /** 길게 누르지 않아도 되는 자리다 — 펴진 줄의 `지우기` 가 이 시트를 연다 (FR-05 · S6). */
  const [removing, setRemoving] = useState<string | null>(null);

  /** 오늘 바치다 멈춘 자리. 줄의 주 단추 글자가 `이어서 기도하기` 인지를 이 값이 정한다. */
  const [position, setPosition] = useState<PrayerPosition | null>(null);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void positionStore.load().then((saved) => {
        if (alive) setPosition(saved);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  /* ── 아래쪽 `새 여정 시작` 이 들고 있는 값 셋 (§1-2) ───────────────────────── */
  const [newFormat, setNewFormat] = useState<JourneyFormat>('fiftyfour');
  /**
   * 입력칸에 적힌 바람.
   *
   * 주소로 바람이 넘어오면 그것으로 시작한다 — 여정 완주 화면의 `이 지향으로 다시
   * 시작하기` 가 그 길이다(`app/all-done.tsx`). 옛 화면에서는 같은 값이 `새 기도` 화면의
   * 입력칸을 채웠고, 그 자리가 여기로 옮겨 왔을 뿐이다.
   */
  const carried = Array.isArray(params.title) ? params.title[0] : params.title;
  const [newTitle, setNewTitle] = useState(carried ?? '');
  const [missingTitle, setMissingTitle] = useState(false);

  const titleFontSize = guideTitleSizeFor(window.width) * TEXT_SCALE.font;

  /*
    **다 읽기 전에는 그리지 않는다.** 이 화면의 글은 처음부터 끝까지 "오늘이 언제인가"와
    "저장된 여정이 무엇인가"에 기대어 있는데, 설치형 웹앱은 빌드할 때 미리 그려 둔 HTML 로
    먼저 뜨고 그 위에 앱이 얹힌다. 미리 그려 둔 글은 빌드한 날의 날짜이므로, 앱이 오늘
    날짜로 다시 그리면 두 글이 어긋나 브라우저 콘솔에 맞춤 실패(React #418)가 찍힌다 —
    이 화면을 주소로 곧바로 열었을 때 실제로 그 오류가 났다(2026-09-18 실측). 홈과 오늘의
    신비 화면이 같은 이유로 같은 문을 두고 있다.
  */
  if (!ready) return <View style={styles.screen} testID="journey-screen" />;

  /** 여정을 만들고 곧바로 그 기도로 들어간다 — 옛 `새 기도` 화면이 하던 일 그대로다. */
  const start = () => {
    const wish = newTitle.trim();
    if (!wish) {
      setMissingTitle(true);
      return;
    }
    // 누른 이 자리에서 소리 엔진을 깨운다. 브라우저는 사용자가 누른 조작에서 곧바로
    // 이어진 소리만 내보내는데, 기도 화면은 뜬 뒤에 기다림이 두 번 끼어 자격이 끊긴다.
    primeSpeech();
    const journey = addJourney(
      {
        title: wish,
        format: newFormat,
        // 청원·감사는 고르지 않고 규칙이 정한다 (머리 7번). 54일 여정의 국면은
        // `phaseOn` 이 며칠째로 가르므로, 여기서는 그 규칙의 시작점만 넘긴다.
        kind: 'petition',
        // 낭송 방식은 설정의 값을 물려받는다 (머리 8번 · 결정 12-E).
        recitation: settings.recitation,
        startDate: today,
      },
      today,
    );
    setNewTitle('');
    setMissingTitle(false);
    /*
      **이 화면을 갈아 끼운다(`replace`), 쌓지 않는다.** 기도 화면의 `잠시 멈춤` 은 홈으로
      나가는 단추인데(`src/navigation/leaveToHome.ts`), 그 단추는 쌓인 것을 한 장 걷어 내는
      식으로 동작한다. 그래서 이 화면 위에 기도를 쌓으면 멈춤이 홈이 아니라 이 화면으로
      떨어진다. 옛 `새 기도` 화면과 옛 여정 상세가 같은 이유로 같은 판단을 했다.
    */
    router.replace({ pathname: '/pray', params: { id: journey.id } });
  };

  return (
    <View style={styles.screen} testID="journey-screen">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingTop: insets.top + 18, paddingBottom: TAB_BAR_HEIGHT + 24 },
        ]}
      >
        {/* ── 머리 · 오늘 날짜와 큰 제목 ────────────────────────────────── */}
        <Text style={styles.label} testID="journey-label">
          {monthDay(today, settings.language)}
        </Text>
        <Text
          style={[styles.title, { fontSize: titleFontSize, lineHeight: titleFontSize * 1.05 }]}
        >
          {strings.journeys}
        </Text>

        {ready && journeys.length === 0 ? (
          <Text style={styles.empty} testID="journey-empty">
            {strings.noJourney}
          </Text>
        ) : null}

        {/* ── 여정 줄 ─────────────────────────────────────────────────── */}
        <View style={styles.rows}>
          {journeys.map((journey, index) => (
            <JourneyRow
              key={journey.id}
              palette={palette}
              isKorean={isKorean}
              language={settings.language}
              strings={strings}
              journey={journey}
              today={today}
              position={position}
              index={index}
              open={open === journey.id}
              onToggle={() => setOpen(open === journey.id ? null : journey.id)}
              onRemove={() => setRemoving(journey.id)}
            />
          ))}
        </View>

        {/* ── 새 여정 시작 (§1-2 — 옛 `새 기도` 화면이 여기로 모였다) ────── */}
        <View style={styles.newBlock}>
          <Text style={styles.newTitle}>{strings.newJourney}</Text>

          <View style={styles.seg} testID="journey-format">
            {FORMAT_SEGMENTS.map((segment, index) => {
              const here = newFormat === segment.key;
              return (
                <Pressable
                  key={segment.key}
                  style={[
                    styles.segOption,
                    index > 0 ? styles.segDivider : null,
                    here ? styles.segOn : null,
                  ]}
                  onPress={() => setNewFormat(segment.key)}
                  accessibilityRole="radio"
                  /*
                    `aria-selected` 를 쓰는 이유는 설정 화면의 글자 크기 고르개와 같다 —
                    `accessibilityState` 는 웹에서 해당 속성을 내보내지 않는 것이
                    2026-09-18 에 실측됐다. React Native 는 0.71 부터 `aria-*` 를 같은
                    뜻의 별칭으로 받으므로 웹·iOS·안드로이드가 함께 읽는다.
                  */
                  aria-selected={here}
                  testID={`journey-format-${segment.key}`}
                >
                  <Text style={[styles.segLabel, here ? styles.segLabelOn : null]}>
                    {strings[segment.label] as string}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>{strings.intention}</Text>
            <TextInput
              style={styles.input}
              value={newTitle}
              onChangeText={(value) => {
                setNewTitle(value);
                if (value.trim()) setMissingTitle(false);
              }}
              placeholder={strings.intentionPh}
              placeholderTextColor={palette.muted}
              accessibilityLabel={strings.intention}
              testID="journey-intent"
            />
          </View>

          {/* 바람이 비면 시작되지 않는다 (머리 6번 · FR-33). */}
          {missingTitle ? (
            <Text style={styles.missing} testID="journey-missing-title">
              {strings.missingIntention}
            </Text>
          ) : null}

          <Pressable
            style={styles.startButton}
            onPress={start}
            accessibilityRole="button"
            testID="journey-start"
          >
            <Text style={styles.startLabel}>{strings.startJourney}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <WorldTabBar current="journeys" />

      {/* S6 — 홈 줄을 길게 누를 때와 같은 시트다 (`src/ui/RemoveJourneySheet.tsx`). */}
      <RemoveJourneySheet
        journeyId={removing}
        onRemoved={() => {
          if (open === removing) setOpen(null);
          setRemoving(null);
        }}
        onClose={() => setRemoving(null)}
      />
    </View>
  );
}

/**
 * 여정 한 줄 — 시안의 `journeyRows` 한 항목.
 *
 * 접혀 있을 때는 위 괘선 · 누르는 자리 · 진행선 셋뿐이고, 펴지면 그 아래에 날짜 격자와
 * 주 단추와 상태 한 줄이 따라 나온다.
 */
function JourneyRow({
  palette,
  isKorean,
  language,
  strings,
  journey,
  today,
  position,
  index,
  open,
  onToggle,
  onRemove,
}: {
  palette: WorldPalette;
  isKorean: boolean;
  language: LanguageKey;
  strings: Strings;
  journey: Journey;
  today: Date;
  position: PrayerPosition | null;
  index: number;
  open: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const styles = journeyStyles(palette, isKorean);

  const dayIndex = dayIndexOn(journey.startDate, today);
  const notStarted = dayIndex < 1;
  const ended = hasEnded(journey, today);
  const days = rolledDays(journey, today);
  const counts = countDays(days);
  const total = journeyLength(journey.format) ?? openEndedGridSize(dayIndex);
  const finish = finishDateOf(journey);

  /** 줄 위의 작은 라벨 — 시안의 `j.kicker` (`54일 기도 · 청원`). */
  const phase = notStarted ? null : phaseOn(journey, dayIndex);
  const kicker = [
    strings[
      journey.format === 'novena9' ? 'nine' : journey.format === 'fiftyfour' ? 'fiftyFour' : 'daily'
    ] as string,
    phase ? ((phase === 'petition' ? strings.petition : strings.thanks) as string) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  /** 오른쪽의 며칠째 — 끝이 있는 여정은 시안의 `{d}일째 / {t}일`, 없는 여정은 `N일째`. */
  const dayLabel = notStarted
    ? strings.notStarted
    : journeyLength(journey.format) !== null
      ? fill(strings.dayOf, { d: Math.min(dayIndex, total), t: total })
      : dayLabelOn(journey, dayIndex, strings);

  const percent = Math.min(100, Math.round((counts.prayed / Math.max(1, total)) * 100));
  const prayedToday = prayedTodayAlready(journey, today);
  const resumable = isResumable(journey, today, position);

  /** 펴진 자리 아래 왼쪽의 상태 한 줄 — 시안의 `j.footer`. */
  const footer = notStarted
    ? notStartedLabel(journey, today, strings, language)
    : [
        prayedToday ? (strings.prayedToday as string) : (strings.notYet as string),
        finish ? fill(strings.dueDate, { date: monthDay(finish, language) }) : '',
      ]
        .filter(Boolean)
        .join(' · ');

  /** 기도로 들어간다. 이 화면을 갈아 끼우는 까닭은 위 `start` 의 주석에 적어 두었다. */
  const openPrayer = () => {
    primeSpeech();
    router.replace({ pathname: '/pray', params: { id: journey.id } });
  };

  return (
    <View style={[styles.row, notStarted ? styles.rowDim : null]}>
      <Pressable
        style={styles.rowHead}
        onPress={onToggle}
        accessibilityRole="button"
        aria-expanded={open}
        testID={`journey-row-${index}`}
      >
        <View style={styles.rowHeadText}>
          <Text style={styles.kicker} testID={`journey-kicker-${index}`}>
            {kicker}
          </Text>
          <Text style={styles.intention} numberOfLines={1} testID={`journey-title-${index}`}>
            {journey.title}
          </Text>
        </View>
        <Text style={styles.dayLabel} testID={`journey-day-${index}`}>
          {dayLabel}
        </Text>
        {/* 펴짐 표시 — 시안의 `rotate({{ j.chevron }}deg)`. 펴지면 180도 돌아간다. */}
        <Svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        >
          <Path
            d="m6 9 6 6 6-6"
            stroke={palette.muted}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Pressable>

      {/* 진행선 — 채워진 부분은 글자가 아니므로 `accent` 를 그대로 쓴다 (Q-51). */}
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${percent}%` }]} testID={`journey-fill-${index}`} />
      </View>

      {open ? (
        <View style={styles.panel}>
          <DayGrid
            palette={palette}
            isKorean={isKorean}
            days={days}
            total={total}
            dayIndex={dayIndex}
            testID={`journey-grid-${index}`}
          />

          <Pressable
            style={styles.rowButton}
            onPress={() => {
              if (notStarted) return;
              if (ended) {
                // 여정 완주 화면의 `홈으로` 가 한 번에 홈으로 닿게 하려는 것이다 —
                // 이 화면 위에 쌓으면 그 단추가 여기로 되돌아온다.
                router.replace({ pathname: '/all-done', params: { id: journey.id } });
                return;
              }
              openPrayer();
            }}
            disabled={notStarted}
            accessibilityRole="button"
            testID={`journey-pray-${index}`}
          >
            <Text style={styles.rowButtonLabel}>
              {ended
                ? strings.viewEndedJourney
                : resumable
                  ? (strings.resume as string)
                  : (strings.prayForThis as string)}
            </Text>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footer} numberOfLines={1} testID={`journey-footer-${index}`}>
              {footer}
            </Text>
            <Pressable
              onPress={onRemove}
              accessibilityRole="button"
              testID={`journey-remove-${index}`}
              hitSlop={6}
              style={styles.removeTap}
            >
              <Text style={styles.remove}>{strings.delete}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/**
 * 날짜 격자 — 시안의 `j.ticks`. 한 칸이 하루이고, **언제나 아홉 열**이다(머리 1번).
 *
 * 칸의 뜻은 시안과 같다. 바친 날은 강조색으로 채우고, 오늘은 먹빛 테 하나로만 말하며,
 * 나머지는 옅은 테로 자리만 잡는다. 못 바친 날과 아직 오지 않은 날을 가르지 않는 것도
 * 시안 그대로다 — 이 앱의 규칙(FR-35)이 "못 바친 날은 빈 칸으로 남는다"이므로 뜻이 맞는다.
 */
function DayGrid({
  palette,
  isKorean,
  days,
  total,
  dayIndex,
  testID,
}: {
  palette: WorldPalette;
  isKorean: boolean;
  days: readonly DayState[];
  total: number;
  dayIndex: number;
  testID: string;
}) {
  const styles = journeyStyles(palette, isKorean);
  const ticks = Array.from({ length: total }, (_, i) => days[i] ?? 'future');

  return (
    <View style={styles.grid} testID={testID}>
      {ticks.map((state, i) => {
        const prayed = state === 'prayed';
        const isToday = i + 1 === dayIndex;
        return (
          <View key={i} style={styles.tickCell}>
            <View
              style={[
                styles.tick,
                {
                  backgroundColor: prayed ? palette.accent : 'transparent',
                  borderColor: prayed ? palette.accent : isToday ? palette.ink : TICK_RULE,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

/**
 * 크기와 간격은 시안의 `Journeys` 마크업에서 그대로 옮겼다 — 좌우 여백 24, 줄 사이 22,
 * 누르는 자리 높이 56, 진행선 2px, 격자 칸 사이 4, 줄 단추 높이 50, `지우기` 높이 44,
 * 아래쪽 새 여정 칸은 위 괘선 뒤로 18.
 *
 * 색은 지역의 색 벌에서만 온다. 글자에 쓰는 강조는 `accentText`, 선과 면에 쓰는 강조는
 * `accent` 다 (`decisions.md` Q-51).
 */
const journeyStyles = (palette: WorldPalette, isKorean: boolean) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.paper },
    scroll: { flex: 1 },
    scrollInner: { flexGrow: 1, paddingHorizontal: 24 },
    label: { ...worldJourneyType.label, color: palette.accentText },
    title: {
      fontFamily: worldFontStack('heading', isKorean),
      color: palette.ink,
      marginTop: 6,
      marginBottom: 18,
      ...koWordBreak,
    },
    empty: { ...worldJourneyType.empty, color: palette.muted, marginBottom: 18 },

    rows: { gap: 22 },
    row: { borderTopWidth: 1, borderTopColor: RULE },
    rowDim: { opacity: 0.5 },
    rowHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 56,
      paddingTop: 14,
      paddingBottom: 10,
    },
    rowHeadText: { flex: 1, minWidth: 0 },
    kicker: { ...worldJourneyType.kicker, color: palette.accentText },
    intention: { ...worldJourneyType.intention, color: palette.ink, marginTop: 3 },
    dayLabel: { ...worldJourneyType.dayLabel, color: palette.muted },

    track: { height: 2, backgroundColor: TRACK, marginBottom: 12 },
    trackFill: { height: 2, backgroundColor: palette.accent },

    panel: { paddingBottom: 14 },
    /*
      시안의 칸 사이 4px 을 `gap` 이 아니라 **칸을 감싸는 그릇의 안쪽 여백 2px** 로 만든다.
      까닭을 적어 둔다. 열 수가 아홉으로 고정이라 칸의 너비를 `100/9 %` 로 주는데, 백분율
      너비와 `gap` 을 함께 쓰면 둘을 더한 값이 100% 를 넘겨 마지막 칸이 줄 밖으로 밀린다.
      그릇에 여백을 주면 여백이 너비 안쪽으로 접혀 들어가므로 어디서나 아홉 칸이 한 줄에 선다.
    */
    grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -2 },
    tickCell: { width: `${100 / GRID_COLUMNS}%`, padding: 2 },
    tick: { aspectRatio: 1, borderRadius: 1, borderWidth: 1 },

    rowButton: {
      minHeight: 50,
      marginTop: 14,
      borderRadius: worldRadius.md,
      borderWidth: 1,
      borderColor: palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowButtonLabel: { ...worldJourneyType.rowButton, color: palette.accentText },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 8,
    },
    footer: { ...worldJourneyType.footer, color: palette.muted, flexShrink: 1 },
    removeTap: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
    /* 지우기는 되돌리기 어려운 조작이라 둘째 강조색이다 — 시안의 `var(--accent2)`. */
    remove: {
      ...worldJourneyType.footer,
      color: palette.accent2,
      textDecorationLine: 'underline',
    },

    newBlock: { marginTop: 28, borderTopWidth: 1, borderTopColor: RULE, paddingTop: 18 },
    newTitle: {
      ...worldJourneyType.newTitle,
      fontFamily: worldFontStack('heading', isKorean),
      color: palette.ink,
      marginBottom: 12,
      ...koWordBreak,
    },

    /* 형식 셋을 고르는 띠 — 「Classical」 의 `.seg` (테 1px, 모서리 4, 칸 사이 세로선). */
    seg: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: RULE,
      borderRadius: worldRadius.md,
      overflow: 'hidden',
    },
    segOption: {
      flex: 1,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    segDivider: { borderLeftWidth: 1, borderLeftColor: RULE },
    /* 고른 칸은 강조색 테 하나로만 표시한다 (「Classical」 의 `inset 0 0 0 1px`). */
    segOn: { borderWidth: 1, borderColor: palette.accent },
    segLabel: {
      ...worldJourneyType.segLabel,
      fontFamily: worldFontStack('body', isKorean),
      /*
        고르지 않은 칸의 글자는 **본문과 같은 먹빛**이다. 시안이 그렇게 그린다 —
        「Classical」 의 `.seg-opt` 가 글자색을 주지 않아 화면이 정한 `--ink` 를
        그대로 물려받는다. 한때 이 자리에 흐린 회색(`palette.muted`)을 썼는데,
        2026-09-18 에 시안 자신의 렌더(`docs/plan/world-screens/5-gallery.jpg`)와
        화소를 맞춰 보고 되돌렸다 — 시안의 고르지 않은 탭 글자는 (20,21,16) 으로
        본문 글자 (32,20,4) 과 같은 짙기였고, 우리 것은 (107,100,90) 이었다.
        **고른 칸은 흐리게 만들지 않아도 이미 두 가지로 말한다** — 금빛 테두리와
        금빛 글자다. `decisions.md` Q-75.
      */
      color: palette.ink,
      ...koWordBreak,
    },
    segLabelOn: { color: palette.accentText },

    field: { marginTop: 14 },
    fieldLabel: { ...worldJourneyType.fieldLabel, color: palette.muted, marginBottom: 5 },
    /* 「Classical」 의 `.input` — 테 1px, 모서리 4. 높이와 글자 크기는 시안이 덧쓴 값이다. */
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: RULE,
      borderRadius: worldRadius.md,
      paddingHorizontal: 10,
      paddingVertical: 6,
      ...worldJourneyType.input,
      color: palette.ink,
    },
    missing: { ...worldJourneyType.footer, color: palette.accent2, marginTop: 8 },

    startButton: {
      minHeight: 50,
      marginTop: 14,
      borderRadius: worldRadius.md,
      borderWidth: 1,
      borderColor: palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    startLabel: { ...worldJourneyType.startLabel, color: palette.accentText },
  });
