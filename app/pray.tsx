/**
 * B 기도 — v5 시안 `docs/design/v5/index.html` 의 `s-pray` 블록을 옮긴 화면.
 *
 * 값(색·크기·간격·문구)은 그 블록에서 그대로 가져왔고, 색과 서체는 `src/theme` 의
 * 토큰 이름으로 쓴다. 화면이 스스로 정하는 값은 하나도 없다.
 *
 * 옮기면서 세 가지를 시안과 다르게 했고, 셋 다 이유가 있다.
 *
 * 1. **구간 라벨의 색이 고정값이 아니라 전례색이다.** v5 는 그 자리에 자색 `#63507F`
 *    하나를 박아 두었는데, 그것은 전례색 슬롯(FR-25)의 한 값이지 고정색이 아니다.
 *    그래서 오늘 날짜의 전례 시기를 계산해(`src/domain/liturgy.ts`) 그 시기의 색으로
 *    칠한다. 사순·대림이면 시안과 똑같은 자색이 나오고, 다른 시기면 다른 색이 나온다.
 * 2. **기도문 영역의 높이를 361 로 적었다.** 시안의 340 은 CSS 의 content-box 기준
 *    값이고 위쪽 여백 20 과 괘선 1 이 그 밖에 붙는다. React Native 의 높이는 여백과
 *    선을 포함하므로 340 + 20 + 1 = 361 이 브라우저에서 실제로 차지하던 높이다.
 * 3. **성화와 기도문 사이에 한 알씩 옮기는 줄이 하나 있다.** v5 에 없는 줄이고,
 *    `decisions.md` 결정 6 이 더한 것이다 — 공방장이 "어떤 상황에서든 마음대로 넘길 수
 *    있어야 한다"고 정했다. 2026-09-09 에 그 줄이 **한 단씩에서 한 알씩으로** 바뀌었다
 *    (결정 8). 모양은 v5 의 어법(높이 80 · 괘선 · 굴리지 않은 모서리 · 토큰 색)을 그대로
 *    쓰고, 자리를 왜 여기로 잡았는지는 그 줄 옆에 적었다.
 */
import { useCallback, useMemo } from 'react';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { artSession } from '../src/art';
import { liturgicalDay } from '../src/domain/liturgy';
import { Rosary } from '../src/prayer/Rosary';
import { estimateSpeechMs } from '../src/prayer/channels';
import { PHASE_LABEL } from '../src/prayer/phase';
import { rosaryStateFor, type RosaryPlacement } from '../src/prayer/rosaryState';
import { buildDayQueue } from '../src/prayer/steps';
import { PRAYERS } from '../src/domain/sequence';
import type { PrayerKey } from '../src/domain/types';
import { usePrayerSession, type DayResult } from '../src/prayer/usePrayerSession';
import type { RosaryKey } from '../src/storage/settings';
import type { PaceKey } from '../src/domain/types';
import { dayIndexOn, dayLabelOn } from '../src/journey/rules';
import type { Journey } from '../src/journey/session';
import { leaveToHome } from '../src/navigation/leaveToHome';
import { finishTodayFor } from '../src/state/appStore';
import { useAppState } from '../src/state/useAppState';
import { metrics, type, useThemedStyles, useTheme, type Theme } from '../src/theme';

/**
 * 성화 위에 덮는 한지. v5 가 정한 84% — 가장 어두운 화소까지 먹빛과 4.5:1 을 넘긴다.
 *
 * 밤 벌에서는 같은 84% 를 쪽빛 바탕에 준다. 덮개가 하는 일(그림을 질감으로 물러나게 하고
 * 그 위의 글자·알과 대비를 지키는 것)이 같으므로 색만 그 벌의 바탕색으로 바꿨다.
 */
const PAPER_OVERLAY = { day: 'rgba(237,231,216,.84)', night: 'rgba(16,22,31,.84)' } as const;

/**
 * 바깥 껍데기 — 저장소에서 여정을 찾아 안쪽 화면에 넘긴다.
 *
 * 여정을 찾기 전에는 기도를 시작하지 않는다. 저장된 여정을 읽어 오는 데 한 틱이 걸리는데,
 * 그 사이에 진행기를 세우면 **엉뚱한 여정의 자리를 저장하고** 곧바로 다시 세우게 된다.
 * 그래서 안쪽(`PraySession`)이 여정을 필수로 받게 갈라 두었다.
 */
export default function PrayScreen() {
  const params = useLocalSearchParams();
  const requestedId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { ready, journeys, settings } = useAppState();
  const styles = useThemedStyles(prayStyles);

  const journey = journeys.find((item) => item.id === requestedId) ?? journeys[0];
  if (!ready || !journey) return <View style={styles.screen} testID="pray-screen" />;

  return (
    <PraySession
      key={journey.id}
      journey={journey}
      pace={settings.pace}
      handsFree={settings.handsFree}
      rosary={settings.rosary}
    />
  );
}

function PraySession({
  journey,
  pace,
  handsFree,
  rosary,
}: {
  journey: Journey;
  pace: PaceKey;
  handsFree: boolean;
  /** 설정에서 고른 묵주 (FR-39). 그림의 재질을 정한다. */
  rosary: RosaryKey;
}) {
  const styles = useThemedStyles(prayStyles);
  const { season } = useTheme();
  const plate = artSession.forJourney(journey.id);

  // 오늘의 전례색 (FR-25 · Q-10). 날짜만 보고 정해지므로 화면을 여는 동안 한 번만 센다.
  const seasonKey = useMemo(() => liturgicalDay(new Date()).color, []);
  const seasonColor = season[seasonKey];

  const onFinish = useCallback(
    (result: DayResult) => {
      // 하루 완주 화면이 "방금 바친 날"을 적을 수 있도록 먼저 그 번호를 붙든 뒤,
      // 오늘 칸을 바친 칸으로 새긴다. 그것으로 여정이 끝났으면 여정 완주 화면으로 간다.
      const today = new Date();
      const prayedDay = dayIndexOn(journey.startDate, today);
      const { ended } = finishTodayFor(journey.id, today);
      if (ended) {
        router.replace({ pathname: '/all-done', params: { id: journey.id } });
        return;
      }
      router.replace({
        pathname: '/day-done',
        params: {
          id: journey.id,
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

  const session = usePrayerSession({
    journey,
    mode: journey.recitation,
    pace,
    handsFree,
    onFinish,
  });
  const step = session.step;
  const placement: RosaryPlacement = step
    ? rosaryStateFor(step)
    : { done: 0, current: -1, focus: 'cross', label: null };
  /*
   * 읽는 중 테두리가 차오르는 시간 (FR-15). 기기는 낭송이 얼마나 걸릴지 미리 말해 주지
   * 않으므로, 소리 통로가 안전망에 쓰는 어림식(`estimateSpeechMs`)을 그대로 쓴다. 전부 읽기는
   * 앞 절과 뒷 절을 이어 읽으니 둘을 더한다.
   */
  const readingMs = step
    ? estimateSpeechMs(step.a) + (session.mode === 'full' && step.b ? estimateSpeechMs(step.b) : 0)
    : 0;

  /*
   * 앞뒤 단추에 적을 이름 — 한 걸음 앞과 뒤에 무슨 기도가 있는가.
   *
   * 큐를 여기서 다시 만드는 것이 낭비로 보일 수 있지만, `usePrayerSession` 은 지금 단계
   * 하나만 내보내고 큐 전체는 내보내지 않는다. 큐는 그날의 신비 하나로 정해지는 값이라
   * (`buildDayQueue`) 같은 신비로 다시 만들면 진행기가 쓰는 것과 글자까지 같다. 신비가
   * 바뀔 때만 다시 만든다.
   */
  const queue = useMemo(() => buildDayQueue(session.mystery), [session.mystery]);
  const nameOf = (at: number): string | null => {
    const found = queue[at];
    return found ? PRAYERS[found.prayer as PrayerKey].name : null;
  };
  const previousName = nameOf(session.index - 1);
  const nextName = nameOf(session.index + 1);

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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
      <View style={styles.header}>
        <Text style={styles.heading} testID="pray-title">
          {journey.title}{' '}
          <Text style={styles.headingDim}>
            · {dayLabelOn(journey, dayIndexOn(journey.startDate, new Date()))}
          </Text>
        </Text>
        <Text style={[styles.stepLabel, { color: seasonColor }]} testID="pray-step">
          {step?.head ?? ''}
        </Text>
      </View>

      <View style={styles.stage} testID="pray-stage">
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
        {/*
          지금 알의 상태 이름을 이 상자에 붙인다 (FR-15 · 06-design-system §7). 그림은 색과
          움직임으로 말하고, 화면 낭독기는 이 글로 같은 것을 듣는다.
        */}
        <View
          style={[StyleSheet.absoluteFill, styles.rosaryBox]}
          accessible
          accessibilityRole="image"
          accessibilityLabel={PHASE_LABEL[session.phase]}
          testID="pray-rosary"
        >
          <Rosary {...placement} rosary={rosary} phase={session.phase} readingMs={readingMs} />
        </View>
      </View>

      {/*
        한 알씩 옮기는 줄 (`decisions.md` 결정 6 이 만들고 결정 8 이 한 알씩으로 바꿨다).
        성화 바로 아래, 기도문 위에 둔다.

        자리를 여기로 잡은 이유가 둘이다. 첫째, 공방장의 요구가 "어떤 상황에서든"이므로
        **스크롤하지 않고 언제나 보여야** 한다 — 단추 두 줄(잠시 멈춤·여기서 끝내기)
        아래에 세 번째 줄로 붙이면 짧은 화면에서 첫 화면 밖으로 밀린다. 둘째, "지금 어디
        있나"를 말하는 묵주 그림과 "한 알 옮긴다"는 조작은 한 가지 일의 앞뒤라 나란히
        있는 편이 읽힌다.

        치르는 값도 적어 둔다 — 기도문이 81 만큼 아래로 밀린다. 390×844 에서는 앞 절이
        그대로 다 보이고, 390×640 에서는 뒷 절을 보려면 조금 더 스크롤하게 된다.
      */}
      <View style={styles.stepNav} testID="pray-step-nav">
        <StepButton
          onPress={session.back}
          to={previousName}
          action="앞 알"
          title="← 앞 알"
          empty="여기가 처음"
          testID="pray-previous-step"
        />
        <View style={styles.stepDivider} />
        <StepButton
          onPress={session.advance}
          to={nextName}
          action="다음 알"
          title="다음 알 →"
          empty="여기가 끝"
          testID="pray-next-step"
        />
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
      </ScrollView>
    </View>
  );
}

/**
 * 한 알 옮기는 단추 하나.
 *
 * 갈 데가 없으면(첫 단계에서의 앞 알, 마지막 단계에서의 다음 알) 감추지 않고 **흐리게
 * 둔다.** 감추면 남은 단추가 자리를 옮겨, 같은 자리를 눌렀는데 다른 일이 일어난다.
 *
 * 아래 줄에 **갈 곳의 기도문 이름**(`성모송` · `영광송`)을 적는다. 화살표만 있으면 누르기
 * 전에는 무엇이 나올지 알 수 없어, 되짚어 보려는 사람이 화면을 여러 번 넘기게 된다.
 */
function StepButton({
  onPress,
  to,
  action,
  title,
  empty,
  testID,
}: {
  onPress: () => void;
  /** 갈 곳의 기도문 이름. 갈 데가 없으면 null 이다. */
  to: string | null;
  /** 소리로 읽어 줄 때의 이름. 화살표가 없는 쪽이다 — 화면 낭독기가 화살표를 읽으면 방해가 된다. */
  action: string;
  /** 화면에 보이는 이름. 화살표가 방향을 말한다. */
  title: string;
  /** 갈 데가 없을 때 아래 줄에 적을 말. */
  empty: string;
  testID: string;
}) {
  const styles = useThemedStyles(prayStyles);
  return (
    <Pressable
      style={styles.stepButton}
      onPress={to ? onPress : undefined}
      disabled={!to}
      accessibilityRole="button"
      accessibilityState={{ disabled: !to }}
      accessibilityLabel={`${action}, ${to ?? empty}`}
      testID={testID}
    >
      <Text style={to ? styles.actionTitle : styles.actionTitleDisabled}>{title}</Text>
      <Text style={styles.actionNote}>{to ?? empty}</Text>
    </Pressable>
  );
}

const prayStyles = ({ colors, mode }: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    /**
     * 화면이 짧으면 눌리지 않고 아래로 흐르게 한다.
     *
     * v5 시안은 390×844 한 크기를 전제로 그려졌고 구현이 그것을 그대로 옮겼다. 그래서
     * 실제 폰에서 브라우저 주소창이 높이를 가져가면 남는 자리를 성화 띠가 혼자 떠안아
     * 짜부라졌다 — 844 에서 267px 이던 띠가 640 에서 63px 이 되어 묵주가 잘렸고, 기도문은
     * 상자 밖으로 넘쳐 윗줄이 잘려 나갔다. 공방장이 실기기에서 발견했다(2026-09-09).
     *
     * 고침의 방향은 공방장이 정했다 — 그림을 침범하지 않고, 글자 크기도 줄이지 않고,
     * 대신 아래로 스크롤한다.
     */
    scroll: { flex: 1 },
    scrollInner: {
      flexDirection: 'column',
      paddingTop: 56,
      paddingBottom: 26,
      flexGrow: 1,
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
    // 바람이 길면 제목만 줄바꿈하고, 오른쪽 구간 이름은 한 줄로 둔다. 둘 다 접히면
    // 두 글줄이 서로 엇물려 읽히지 않는다(실기기에서 실제로 그렇게 보였다).
    heading: { ...type.heading, color: colors.ink, flexShrink: 1 },
    headingDim: { color: colors.inkMuted },
    stepLabel: { ...type.stepLabel, flexShrink: 0, marginLeft: 12 },
    stage: {
      // 844 에서 재 보면 267 이다. 그 값을 바닥으로 깔아 짧은 화면에서도 줄지 않게 하고,
      // 긴 화면에서는 예전처럼 남는 자리를 가져가게 둔다.
      minHeight: 267,
      flexGrow: 1,
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
    },
    paper: { backgroundColor: PAPER_OVERLAY[mode] },
    // 묵주를 위로 붙인다. 가운데 정렬이면 그림이 아래로 치우쳐 보인다 — SVG 안에서
    // 실제로 그려지는 부분이 아래쪽에 몰려 있기 때문이다 (v5 의 주석 그대로).
    rosaryBox: { alignItems: 'center', justifyContent: 'flex-start' },
    /*
     * 한 알씩 옮기는 줄. v5 의 어법을 그대로 쓴다 — 높이 80, 괘선으로 나누고, 모서리를
     * 굴리지 않으며, 색은 토큰으로만. 설정 화면의 줄과 같은 문법이라 새로 배울 것이 없다.
     * 좌우 여백을 두지 않고 화면을 가로지르게 한 것도 그 줄들과 같다.
     */
    stepNav: {
      flexDirection: 'row',
      height: metrics.touchTargetHeight, // 80
      flexShrink: 0,
    },
    stepDivider: { width: 1, backgroundColor: colors.rule },
    stepButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    prayerBox: {
      paddingHorizontal: metrics.screenPadding,
      // v5 의 340 + 위쪽 여백 20 + 괘선 1. 고정 높이가 아니라 **바닥**이다 — 주님의 기도처럼
      // 긴 기도문은 이 높이를 넘는데, 고정이면 넘친 윗줄이 잘려 나갔다.
      minHeight: 361,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.rule,
      flexDirection: 'column',
      // v5 는 기도문을 이 상자의 **아래쪽**에 붙여 단추 바로 위에 오게 했다. 화면 높이가
      // 844 로 고정된 시안에서는 그것이 옳았지만, 화면이 짧아 스크롤이 생기면 그림과
      // 기도문 사이에 빈 자리가 생겨 **기도문이 첫 화면 밖으로 밀려난다.** 정작 읽어야 할
      // 것을 보려고 스크롤하게 되므로, 위쪽에 붙여 그림 바로 아래에서 시작하게 한다.
      justifyContent: 'flex-start',
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
      borderColor: colors.quietBorder,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    actionTitle: { ...type.buttonCompact, color: colors.ink },
    actionTitleQuiet: { ...type.buttonCompact, color: colors.inkMuted },
    // 갈 데가 없는 단추. 흐리게 두되 자리는 지킨다.
    actionTitleDisabled: { ...type.buttonCompact, color: colors.inkMuted, opacity: 0.5 },
    actionNote: { ...type.caption, color: colors.inkMuted },
  });
