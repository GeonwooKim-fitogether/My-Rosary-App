/**
 * D 여정 상세 — v5 시안 `docs/design/v5/index.html` 의 `s-journey` 블록을 옮긴 화면.
 *
 * 값은 그 블록에서 그대로 가져왔고, 시안이 글자로 박아 둔 숫자들(며칠째 · 바친 날 · 성모송 ·
 * 마치는 날)은 실제 여정에서 세어 온 값으로 채운다.
 *
 * 시안과 다른 곳이 셋이다.
 *
 * 1. **`청원에서 감사로` 가 28일째다.** v5 는 `27일째부터` 라고 적었지만 FR-35 는 1~27일이
 *    청원이고 28일째부터 감사라고 정한다. 숫자가 어긋나면 규칙 쪽을 따랐다 — 이 줄이 말하는
 *    것은 화면의 모양이 아니라 기도의 규칙이기 때문이다.
 * 2. **`오늘 처음부터` 를 더했다.** FR-18 과 시트 S3 가 요구하는 자리인데 v5 에 없다. 오늘
 *    바치던 자리가 있을 때만 보이고, 누르면 S3 확인 시트를 거쳐 자리를 지우고 처음부터 간다.
 * 3. **격자를 누르는 일은 여정이 끝났을 때만 한다.** v5 는 격자를 누르면 언제나 여정 완주
 *    화면으로 갔는데 그것은 화면을 둘러보기 위한 시제품의 배선이다.
 */
import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FIFTYFOUR_PETITION_DAYS } from '../src/domain/mysteries';
import { isResumable } from '../src/journey/card';
import { monthDayKo } from '../src/journey/format';
import {
  countDays,
  dayIndexOn,
  dayLabelOn,
  finishDateOf,
  hasEnded,
  journeyLength,
} from '../src/journey/rules';
import { HAILS_PER_DAY } from '../src/prayer/steps';
import { useAppState } from '../src/state/useAppState';
import { positionStore } from '../src/storage/asyncStore';
import type { PrayerPosition } from '../src/storage/position';
import { type as type1, type2, useThemedStyles, type Theme } from '../src/theme';
import { RemoveJourneySheet } from '../src/ui/RemoveJourneySheet';
import { ConfirmSheet } from '../src/ui/Sheet';
import { primeSpeech } from '../src/prayer/channels';
import {
  DayGrid,
  OutlineButton,
  QuietButton,
  ScreenBody,
  ScreenHeader,
} from '../src/ui/Screen';

/** 1,050 처럼 세 자리마다 쉼표. v5 가 성모송 수를 그렇게 적었다. */
function grouped(n: number): string {
  return n.toLocaleString('ko-KR');
}

export default function JourneyDetailScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { journeys } = useAppState();
  const styles = useThemedStyles(detailStyles);

  const [position, setPosition] = useState<PrayerPosition | null>(null);
  const [restartSheet, setRestartSheet] = useState(false);
  const [quitSheet, setQuitSheet] = useState(false);

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

  const journey = journeys.find((item) => item.id === id) ?? journeys[0];
  if (!journey) {
    return (
      <ScreenBody testID="journey-screen">
        <ScreenHeader
          label="여정"
          action="돌아가기"
          onAction={() => router.back()}
          actionTestID="journey-back"
        />
      </ScreenBody>
    );
  }

  const today = new Date();
  const dayIndex = dayIndexOn(journey.startDate, today);
  const counts = countDays(journey.days);
  const length = journeyLength(journey.format);
  const finish = finishDateOf(journey);
  const ended = hasEnded(journey, today);
  const canResume = isResumable(journey, today, position);

  return (
    <ScreenBody testID="journey-screen">
      <ScreenHeader
        label="여정"
        action="돌아가기"
        onAction={() => router.back()}
        actionTestID="journey-back"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
        <Text style={styles.title} testID="journey-title">
          {journey.title}
        </Text>
        <Text style={styles.meta} testID="journey-meta">
          {dayIndex >= 1 ? `${dayLabelOn(journey, dayIndex)} · ` : ''}
          {monthDayKo(journey.startDate)} 시작
        </Text>

        <View style={styles.gridBox}>
          <DayGrid days={journey.days} testID="journey-grid" />
        </View>
        <View style={styles.caption}>
          <Text style={styles.captionText}>한 칸이 하루 · 빈 칸은 못 바친 날</Text>
          <Text style={styles.captionText} testID="journey-count">
            {length === null
              ? `${journey.days.length}일 중 ${counts.prayed}일`
              : `${length}일 중 ${counts.prayed}일`}
          </Text>
        </View>

        <View style={styles.stats}>
          <StatRow label="바친 날" value={`${counts.prayed}일`} testID="journey-prayed" />
          <StatRow label="못 바친 날" value={`${counts.missed}일`} testID="journey-missed" />
          <StatRow
            label="성모송"
            value={`${grouped(counts.prayed * HAILS_PER_DAY)}번`}
            testID="journey-hails"
          />
          {journey.format === 'fiftyfour' ? (
            <StatRow
              label="청원에서 감사로"
              value={
                journey.kind === 'thanksgiving'
                  ? '쉰네 날 내내 감사'
                  : `${FIFTYFOUR_PETITION_DAYS + 1}일째부터`
              }
            />
          ) : null}
          {finish ? (
            <StatRow label="마치는 날" value={monthDayKo(finish)} last testID="journey-finish" />
          ) : (
            <StatRow label="마치는 날" value="정하지 않았습니다" last />
          )}
        </View>
      </ScrollView>

      {ended ? (
        <OutlineButton
          label="마친 여정 보기"
          // 갈아 끼운다(push 가 아니다). 여정 완주 화면의 `여정 목록으로` 가 한 번에 홈으로
          // 닿게 하려는 것이다 — 상세 위에 쌓으면 그 단추가 상세로 되돌아간다.
          onPress={() => router.replace({ pathname: '/all-done', params: { id: journey.id } })}
          testID="journey-see-finish"
        />
      ) : (
        <OutlineButton
          label="오늘 이어서 바치기"
          // 이 화면을 갈아 끼우고 기도로 간다. 기도 화면의 `잠시 멈춤` 이 홈으로 나가는 단추라,
          // 상세 위에 쌓으면 홈이 아니라 상세로 되돌아오게 된다.
          onPress={() => {
            primeSpeech();
            router.replace({ pathname: '/pray', params: { id: journey.id } });
          }}
          testID="journey-resume"
        />
      )}

      {canResume && !ended ? (
        <QuietButton
          label="오늘 처음부터"
          onPress={() => setRestartSheet(true)}
          testID="journey-restart"
        />
      ) : null}

      <QuietButton
        label="이 여정 그만두기"
        onPress={() => setQuitSheet(true)}
        testID="journey-quit"
      />

      <ConfirmSheet
        visible={restartSheet}
        label="오늘 처음부터"
        message="오늘 자리를 지우고 처음부터 바칩니다."
        confirmLabel="처음부터"
        cancelLabel="아니요, 이어서"
        onConfirm={() => {
          primeSpeech();
          setRestartSheet(false);
          void positionStore.clear().then(() => {
            setPosition(null);
            router.replace({ pathname: '/pray', params: { id: journey.id } });
          });
        }}
        onClose={() => setRestartSheet(false)}
        testID="sheet-restart"
      />

      {/* S6 — 홈 카드를 길게 누를 때와 같은 시트다 (`src/ui/RemoveJourneySheet.tsx`). */}
      <RemoveJourneySheet
        journeyId={quitSheet ? journey.id : null}
        onRemoved={() => {
          setQuitSheet(false);
          router.back();
        }}
        onClose={() => setQuitSheet(false)}
      />
    </ScreenBody>
  );
}

function StatRow({
  label,
  value,
  last,
  testID,
}: {
  label: string;
  value: string;
  last?: boolean;
  testID?: string;
}) {
  const styles = useThemedStyles(detailStyles);
  return (
    <View style={[styles.statRow, last ? styles.statRowLast : null]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} testID={testID}>
        {value}
      </Text>
    </View>
  );
}

const detailStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    scrollInner: { paddingBottom: 10 },
    title: { ...type2.detailTitle, color: colors.ink, marginTop: 26 },
    meta: { ...type1.tertiary, color: colors.accent, marginTop: 12 },
    gridBox: { marginTop: 26 },
    caption: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    captionText: { ...type2.micro, color: colors.inkMuted },
    stats: { marginTop: 28, flexDirection: 'column' },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 11,
      borderTopWidth: 1,
      borderTopColor: colors.rule,
    },
    statRowLast: { borderBottomWidth: 1, borderBottomColor: colors.rule },
    statLabel: { ...type1.statLabel, color: colors.inkMuted },
    statValue: { ...type1.statValue, color: colors.ink },
  });
