/**
 * C 하루 완주 — v5 시안 `docs/design/v5/index.html` 의 `s-dayDone` 블록을 옮긴 화면.
 *
 * 값은 그 블록에서 그대로 가져왔다. 다만 시안이 글자로 박아 둔 숫자 넷(며칠째 · 바친
 * 날수 · 성모송 횟수 · 걸린 시간)은 방금 바친 기도에서 실제로 세어 온 값으로 채운다 —
 * 완주 화면의 숫자가 실제와 다르면 그 화면이 하는 일(오늘을 확인해 주는 일)이 무너진다.
 *
 * **시안과 하나 다르게 했다.** v5 의 `renderDayDone` 은 하루를 마친 뒤 **다음 날**의
 * 번호를 머리글에 적는다(리본에서 `today` 가 이미 다음 칸으로 옮겨간 뒤에 읽기 때문이다).
 * 여기서는 **방금 바친 날**을 적는다. 하루 완주 화면이 확인해 주는 것은 내일이 아니라
 * 오늘이기 때문이다. 리본은 그대로 다음 칸이 오늘로 넘어간 모습을 보여 준다.
 */
import { useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MYSTERY_SETS } from '../src/domain/mysteries';
import type { MysteryKey } from '../src/domain/types';
import { monthDayKo, objectParticle, ordinalKo } from '../src/journey/format';
import { currentJourney, dateOfDay, dayNumber, tally } from '../src/journey/session';
import { leaveToHome } from '../src/navigation/leaveToHome';
import { colors, metrics, type } from '../src/theme';

/** 54칸 리본의 칸 색. v5 의 `FILL` 표 그대로다. */
const RIBBON_FILL = {
  prayed: '#82600F',
  missed: 'rgba(31,37,48,.10)',
  future: 'rgba(31,37,48,.10)',
  today: '#1F2530',
} as const;

/** 리본 한 칸의 높이. v5 는 하루 완주에서 26, 여정 완주에서 30 을 쓴다. */
const RIBBON_HEIGHT = 26;

function numberParam(value: string | string[] | undefined, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function DayDoneScreen() {
  const params = useLocalSearchParams();
  const journey = currentJourney;

  // 방금 바친 날. 기도 화면이 넘겨준다. 값이 없으면(화면을 직접 열었으면) 지금 날을 쓴다.
  const prayedDay = numberParam(params.dayIndex, dayNumber(journey));
  const hails = numberParam(params.hails, 0);
  const elapsedMs = numberParam(params.elapsedMs, 0);
  const resumeCount = numberParam(params.resumeCount, 0);
  const mystery = (Array.isArray(params.mystery) ? params.mystery[0] : params.mystery) as
    | MysteryKey
    | undefined;

  const counts = tally(journey);
  const mysteryName = mystery ? MYSTERY_SETS[mystery]?.name : undefined;

  return (
    <View style={styles.screen} testID="day-done-screen">
      <Text style={styles.head} testID="day-done-head">
        {monthDayKo(dateOfDay(journey, prayedDay))} · {ordinalKo(prayedDay)} 날
      </Text>

      <Text style={styles.title}>다 바쳤습니다</Text>
      <Text style={styles.sub}>
        {journey.title}
        {objectParticle(journey.title)} 위하여{'\n'}
        {mysteryName ? `${mysteryName} 다섯 단` : '다섯 단'}
      </Text>

      <View style={styles.ribbon} testID="day-done-ribbon">
        {journey.days.map((state, index) => (
          <View key={index} style={[styles.ribbonCell, { backgroundColor: RIBBON_FILL[state] }]} />
        ))}
      </View>
      <Text style={styles.summary} testID="day-done-summary">
        54일 중 {counts.done}일 바쳤습니다 · 남은 {counts.left}일
      </Text>

      <View style={styles.stats}>
        <StatRow label="성모송" value={`${hails}번`} />
        <StatRow label="걸린 시간" value={`${Math.max(1, Math.round(elapsedMs / 60000))}분`} />
        <StatRow label="이어서" value={`${resumeCount}번`} last />
      </View>

      <View style={styles.spacer} />

      <Pressable
        style={styles.backButton}
        onPress={leaveToHome}
        accessibilityRole="button"
        testID="day-done-back"
      >
        <Text style={styles.backLabel}>돌아가기</Text>
      </Pressable>
    </View>
  );
}

function StatRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.statRow, last ? styles.statRowLast : null]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 56,
    paddingHorizontal: metrics.screenPadding, // 24
    paddingBottom: 26,
    backgroundColor: colors.background,
  },
  head: {
    ...type.label, // 10.5px · 자간 .24em
    color: colors.inkMuted,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  title: { ...type.display, color: colors.ink, marginTop: 48, marginBottom: 18 },
  sub: { ...type.bodySmall, color: colors.inkMuted },
  ribbon: { flexDirection: 'row', gap: 2, marginTop: 44 },
  ribbonCell: { flex: 1, height: RIBBON_HEIGHT },
  summary: { ...type.caption, color: colors.inkMuted, marginTop: 10 },
  stats: { marginTop: 44, flexDirection: 'column' },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  statRowLast: { borderBottomWidth: 1, borderBottomColor: colors.rule },
  statLabel: { ...type.statLabel, color: colors.inkMuted },
  statValue: { ...type.statValue, color: colors.ink },
  spacer: { flex: 1 },
  backButton: {
    height: metrics.touchTargetHeight, // 80
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: { ...type.button, color: colors.inverse },
});
