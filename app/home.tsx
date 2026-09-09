/**
 * A 홈 (여정 목록) — v5 시안 `docs/design/v5/index.html` 의 `s-home` 블록을 옮긴 화면.
 *
 * 값(색·크기·간격·문구)은 그 블록에서 그대로 가져왔고, 색과 서체는 `src/theme` 의 토큰
 * 이름으로 쓴다. 시안과 다른 곳은 셋이고 모두 이유가 있다.
 *
 * 1. **카드가 예시가 아니라 저장된 여정이다.** v5 는 카드 둘을 마크업에 박아 두었지만
 *    여기서는 기기에 저장된 여정을 그린다. 여정이 하나도 없는 것이 처음의 정상 상태이며
 *    (06-screen-spec 화면 A), 그때는 빈 홈 문구 두 줄이 대신 선다.
 * 2. **함께 바치기 카드는 아직 없다.** v5 의 둘째 카드는 조 기도인데 조는 M3 의 일이다.
 *    카드의 넷째 줄(`내 몫 제2단 · 오늘 다섯 중 셋`)도 그때 선다.
 * 3. **날짜가 달력에서 온다.** v5 는 리본의 `today` 칸으로 며칠째를 셌지만, 저장된 여정은
 *    앱을 안 켠 날에도 날짜가 흘러야 하므로 시작일과 오늘로 센다 (`src/journey/rules.ts`).
 */
import { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { artSession } from '../src/art';
import { MYSTERY_SETS } from '../src/domain/mysteries';
import { cardStatus, resumeLine, type CardStatus } from '../src/journey/card';
import { countKo, monthDayKo, relativeTimeKo } from '../src/journey/format';
import {
  dayIndexOn,
  dayLabelOn,
  finishDateOf,
  journeyLength,
  notStartedLabel,
} from '../src/journey/rules';
import { mysteryOf, type Journey } from '../src/journey/session';
import { buildDayQueue } from '../src/prayer/steps';
import { useAppState } from '../src/state/useAppState';
import { positionStore } from '../src/storage/asyncStore';
import type { PrayerPosition } from '../src/storage/position';
import {
  metrics2,
  type as type1,
  type2,
  useThemedStyles,
  type Theme,
} from '../src/theme';
import { PrimaryButton, QuietButton, Ribbon, ScreenBody, ScreenHeader } from '../src/ui/Screen';

export default function HomeScreen() {
  const { ready, journeys } = useAppState();
  const styles = useThemedStyles(homeStyles);
  const [position, setPosition] = useState<PrayerPosition | null>(null);
  const today = new Date();

  // 화면으로 돌아올 때마다 오늘 자리를 다시 읽는다. 기도하다 나온 직후의 카드가
  // "어디까지 왔나"를 곧바로 말해야 하기 때문이다.
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

  // 끝난 여정은 목록 아래로 내린다 (06-screen-spec: "마친 카드는 목록 아래").
  const ordered = [...journeys].sort((a, b) => {
    const rank = (j: Journey) => (cardStatus(j, today, position) === 'ended' ? 1 : 0);
    return rank(a) - rank(b);
  });

  return (
    <ScreenBody testID="home-screen">
      <ScreenHeader
        label={journeys.length > 0 ? `내 기도 · ${countKo(journeys.length)}` : '내 기도'}
        action="설정"
        wideAction
        onAction={() => router.push('/settings')}
        actionTestID="home-settings"
      />

      <ScrollView style={styles.list} contentContainerStyle={styles.listInner}>
        {ready && journeys.length === 0 ? (
          <View style={styles.empty} testID="home-empty">
            <Text style={styles.emptyTitle}>아직 바치는 기도가 없습니다.</Text>
            <Text style={styles.emptyNote}>
              바람 하나를 적고 시작해 보세요. 54일이든 하루든, 끊겨도 그 자리가 남습니다.
            </Text>
          </View>
        ) : null}

        {ordered.map((journey, index) => (
          <JourneyCard
            key={journey.id}
            journey={journey}
            today={today}
            position={position}
            index={index}
          />
        ))}
      </ScrollView>

      <PrimaryButton
        label="새 기도"
        onPress={() => router.push('/new')}
        testID="home-new"
        style={styles.newButton}
      />
      <QuietButton
        label="초대 코드로 들어가기"
        onPress={() => router.push('/invite')}
        testID="home-invite"
      />
    </ScreenBody>
  );
}

/**
 * 카드 한 장. 탭하면 기도로 들어가고(FR-42), 리본을 탭하면 여정 상세로 간다(FR-37).
 *
 * 리본이 "자세히"의 자리를 대신하는 것은 v5 의 배선 그대로다 — 시안에서도 카드는 기도로,
 * 리본은 여정 상세로 간다.
 */
function JourneyCard({
  journey,
  today,
  position,
  index,
}: {
  journey: Journey;
  today: Date;
  position: PrayerPosition | null;
  index: number;
}) {
  const styles = useThemedStyles(homeStyles);
  const plate = artSession.forJourney(journey.id);
  const status = cardStatus(journey, today, position);
  const dayIndex = dayIndexOn(journey.startDate, today);
  const finish = finishDateOf(journey);
  const mystery = mysteryOf(journey, today);

  const openPrayer = () => {
    if (status === 'notStarted') return;
    if (status === 'ended') {
      router.push({ pathname: '/journey', params: { id: journey.id } });
      return;
    }
    router.push({ pathname: '/pray', params: { id: journey.id } });
  };

  return (
    <View style={[styles.card, status === 'notStarted' ? styles.cardDim : null]}>
      <Pressable
        style={styles.cardRow}
        onPress={openPrayer}
        accessibilityRole="button"
        testID={`home-card-${index}`}
      >
        {plate ? (
          <Image
            source={plate.source}
            style={styles.thumb}
            contentFit="cover"
            contentPosition={{ left: plate.focus.thumb.x, top: plate.focus.thumb.y }}
            accessible={false}
          />
        ) : (
          <View style={styles.thumb} />
        )}
        <View style={styles.cardText}>
          <Text style={styles.cardTitle} testID={`home-card-title-${index}`}>
            {journey.title}
          </Text>
          <Text style={styles.cardMeta} testID={`home-card-meta-${index}`}>
            {status === 'notStarted' ? '시작 전' : dayLabelOn(journey, dayIndex)}
          </Text>
          <CardStatusLines
            status={status}
            journey={journey}
            today={today}
            position={position}
            mysteryName={MYSTERY_SETS[mystery].name}
            index={index}
          />
        </View>
      </Pressable>

      {status === 'notStarted' ? null : (
        <>
          <Pressable
            onPress={() => router.push({ pathname: '/journey', params: { id: journey.id } })}
            accessibilityRole="button"
            accessibilityLabel="여정 상세"
            testID={`home-ribbon-${index}`}
            style={styles.ribbonTap}
          >
            <Ribbon days={journey.days} height={metrics2.ribbonHome} />
          </Pressable>
          <View style={styles.dates}>
            <Text style={styles.dateText}>{monthDayKo(journey.startDate)} 시작</Text>
            {finish ? <Text style={styles.dateText}>{monthDayKo(finish)} 마침</Text> : null}
          </View>
        </>
      )}
    </View>
  );
}

/** 카드의 셋째·넷째 줄 — 오늘 자리와 그 시각. */
function CardStatusLines({
  status,
  journey,
  today,
  position,
  mysteryName,
  index,
}: {
  status: CardStatus;
  journey: Journey;
  today: Date;
  position: PrayerPosition | null;
  mysteryName: string;
  index: number;
}) {
  const styles = useThemedStyles(homeStyles);

  if (status === 'notStarted') {
    return <Text style={styles.cardResume}>{notStartedLabel(journey, today)}</Text>;
  }
  if (status === 'ended') {
    const length = journeyLength(journey.format) ?? journey.days.length;
    const prayed = journey.days.filter((state) => state === 'prayed').length;
    return (
      <Text style={styles.cardResume} testID={`home-card-status-${index}`}>
        {length}일 중 {prayed}일을 바쳤습니다
      </Text>
    );
  }
  if (status === 'prayedToday') {
    return (
      <Text style={styles.cardResume} testID={`home-card-status-${index}`}>
        오늘 바쳤습니다
      </Text>
    );
  }
  if (status === 'resume' && position) {
    const step = buildDayQueue(position.mystery)[position.stepIndex];
    const name = step?.label.split(' · ')[1];
    return (
      <>
        <Text style={styles.cardResume} testID={`home-card-status-${index}`}>
          {MYSTERY_SETS[position.mystery].name}
          {'\n'}
          {resumeLine(position, name)}
        </Text>
        <Text style={styles.cardWhen}>{relativeTimeKo(new Date(position.savedAt), today)}</Text>
      </>
    );
  }
  return (
    <Text style={styles.cardResume} testID={`home-card-status-${index}`}>
      {mysteryName}
      {'\n'}
      아직
    </Text>
  );
}

const homeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    list: { flex: 1 },
    listInner: { paddingBottom: 8 },
    empty: { paddingTop: 40 },
    emptyTitle: { ...type1.body, color: colors.ink },
    emptyNote: { ...type2.noteSmall, color: colors.inkMuted, marginTop: 10 },
    card: {
      paddingTop: 26,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.rule,
    },
    cardDim: { opacity: 0.5 },
    cardRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
    thumb: {
      width: metrics2.thumbWidth, // 96
      height: metrics2.thumbHeight, // 124
      flexGrow: 0,
      flexShrink: 0,
      backgroundColor: colors.rule,
    },
    cardText: { flex: 1, minWidth: 0 },
    cardTitle: { ...type2.cardTitle, color: colors.ink, marginBottom: 10 },
    cardMeta: { ...type2.cardMeta, color: colors.accent },
    cardResume: { ...type2.cardResume, color: colors.ink, marginTop: 14 },
    cardWhen: { ...type1.caption, color: colors.inkMuted, marginTop: 8 },
    ribbonTap: { marginTop: 18 },
    dates: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    dateText: { ...type2.micro, color: colors.inkMuted },
    newButton: { marginBottom: 14 },
  });
