/**
 * B 기도 — v5 시안 `docs/design/v5/index.html` 의 `s-pray` 블록을 옮긴 화면.
 *
 * 값(색·크기·간격·문구)은 그 블록에서 그대로 가져왔고, 색과 서체는 `src/theme` 의
 * 토큰 이름으로 쓴다. 화면이 스스로 정하는 값은 하나도 없다.
 *
 * 옮기면서 두 가지를 시안과 다르게 했고, 둘 다 이유가 있다.
 *
 * 1. **구간 라벨의 색이 고정값이 아니라 전례색이다.** v5 는 그 자리에 자색 `#63507F`
 *    하나를 박아 두었는데, 그것은 전례색 슬롯(FR-25)의 한 값이지 고정색이 아니다.
 *    그래서 오늘 날짜의 전례 시기를 계산해(`src/domain/liturgy.ts`) 그 시기의 색으로
 *    칠한다. 사순·대림이면 시안과 똑같은 자색이 나오고, 다른 시기면 다른 색이 나온다.
 * 2. **기도문 영역의 높이를 361 로 적었다.** 시안의 340 은 CSS 의 content-box 기준
 *    값이고 위쪽 여백 20 과 괘선 1 이 그 밖에 붙는다. React Native 의 높이는 여백과
 *    선을 포함하므로 340 + 20 + 1 = 361 이 브라우저에서 실제로 차지하던 높이다.
 */
import { useCallback, useMemo } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { artSession } from '../src/art';
import { liturgicalDay } from '../src/domain/liturgy';
import { Rosary } from '../src/prayer/Rosary';
import { rosaryStateFor } from '../src/prayer/rosaryState';
import { usePrayerSession, type DayResult } from '../src/prayer/usePrayerSession';
import { completeToday, currentJourney, dayNumber } from '../src/journey/session';
import { leaveToHome } from '../src/navigation/leaveToHome';
import { colors, metrics, seasonColors, type } from '../src/theme';

/** 성화 위에 덮는 한지. v5 가 정한 84% — 가장 어두운 화소까지 먹빛과 4.5:1 을 넘긴다. */
const PAPER_OVERLAY = 'rgba(237,231,216,.84)';
/** 아래 두 단추 중 "여기서 끝내기" 쪽의 옅은 테두리. */
const QUIET_BORDER = 'rgba(31,37,48,.14)';

export default function PrayScreen() {
  const journey = currentJourney;
  const plate = artSession.forJourney(journey.id);

  // 오늘의 전례색 (FR-25 · Q-10). 날짜만 보고 정해지므로 화면을 여는 동안 한 번만 센다.
  const seasonColor = useMemo(() => seasonColors[liturgicalDay(new Date()).color], []);

  const onFinish = useCallback(
    (result: DayResult) => {
      // 하루 완주 화면이 "방금 바친 날"을 적을 수 있도록 먼저 그 번호를 붙든 뒤,
      // 여정의 오늘 칸을 바친 칸으로 바꾸고 다음 칸을 오늘로 넘긴다.
      const prayedDay = dayNumber(journey);
      completeToday(journey);
      router.replace({
        pathname: '/day-done',
        params: {
          dayIndex: String(prayedDay),
          hails: String(result.hails),
          elapsedMs: String(result.elapsedMs),
          resumeCount: String(result.resumeCount),
          mystery: result.mystery,
        },
      });
    },
    [journey],
  );

  const session = usePrayerSession({ journey, onFinish });
  const step = session.step;
  const placement = step ? rosaryStateFor(step) : { done: 0, current: -1 };

  /** 잠시 멈춤 — 자리를 남기고 나간다 (FR-18). */
  const pauseAndLeave = useCallback(() => {
    session.pause();
    leaveToHome();
  }, [session]);

  /** 여기서 끝내기 — 오늘 자리를 지우고 나간다. 다음에 열면 오늘 처음부터다 (FR-18). */
  const discardAndLeave = useCallback(() => {
    void session.discard().then(leaveToHome);
  }, [session]);

  return (
    <View style={styles.screen} testID="pray-screen">
      <View style={styles.header}>
        <Text style={styles.heading} testID="pray-title">
          {journey.title} <Text style={styles.headingDim}>· {dayNumber(journey)}일째</Text>
        </Text>
        <Text style={[styles.stepLabel, { color: seasonColor }]} testID="pray-step">
          {step?.head ?? ''}
        </Text>
      </View>

      <View style={styles.stage}>
        {plate ? (
          <Image
            source={plate.source}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition={{ left: plate.focus.prayer.x, top: plate.focus.prayer.y }}
            accessible={false}
          />
        ) : null}
        <View style={[StyleSheet.absoluteFill, styles.paper]} />
        <View style={[StyleSheet.absoluteFill, styles.rosaryBox]}>
          <Rosary done={placement.done} current={placement.current} />
        </View>
      </View>

      <View style={styles.prayerBox}>
        <Text style={styles.prayerLead} testID="pray-a">
          {step?.a ?? ''}
        </Text>
        {step?.b ? (
          <Text style={styles.prayerResponse} testID="pray-b">
            {step.b}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.pauseButton}
          onPress={pauseAndLeave}
          accessibilityRole="button"
          testID="pray-pause"
        >
          <Text style={styles.actionTitle}>잠시 멈춤</Text>
          <Text style={styles.actionNote}>자리가 남습니다</Text>
        </Pressable>
        <Pressable
          style={styles.stopButton}
          onPress={discardAndLeave}
          accessibilityRole="button"
          testID="pray-stop"
        >
          <Text style={styles.actionTitleQuiet}>여기서 끝내기</Text>
          <Text style={styles.actionNote}>오늘 처음부터</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 56,
    paddingBottom: 26,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: metrics.screenPadding, // 24
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  heading: { ...type.heading, color: colors.ink },
  headingDim: { color: colors.inkMuted },
  stepLabel: { ...type.stepLabel },
  stage: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  paper: { backgroundColor: PAPER_OVERLAY },
  // 묵주를 위로 붙인다. 가운데 정렬이면 그림이 아래로 치우쳐 보인다 — SVG 안에서
  // 실제로 그려지는 부분이 아래쪽에 몰려 있기 때문이다 (v5 의 주석 그대로).
  rosaryBox: { alignItems: 'center', justifyContent: 'flex-start' },
  prayerBox: {
    paddingHorizontal: metrics.screenPadding,
    height: 361, // v5 의 340 + 위쪽 여백 20 + 괘선 1 (위 머리글의 설명 참고)
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  prayerLead: { ...type.prayerLead, color: colors.ink },
  prayerResponse: { ...type.prayerResponse, color: colors.accent, marginTop: 12 },
  actions: {
    paddingHorizontal: metrics.screenPadding,
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  pauseButton: {
    flex: 1,
    height: metrics.touchTargetHeight, // 80
    borderWidth: 1,
    borderColor: colors.buttonBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stopButton: {
    flex: 1,
    height: metrics.touchTargetHeight,
    borderWidth: 1,
    borderColor: QUIET_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionTitle: { ...type.buttonCompact, color: colors.ink },
  actionTitleQuiet: { ...type.buttonCompact, color: colors.inkMuted },
  actionNote: { ...type.caption, color: colors.inkMuted },
});
