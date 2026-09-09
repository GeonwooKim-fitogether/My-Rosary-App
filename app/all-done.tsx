/**
 * C′ 여정 완주 — v5 시안 `docs/design/v5/index.html` 의 `s-allDone` 블록을 옮긴 화면.
 *
 * 값은 그 블록에서 그대로 가져왔고, 시안이 글자로 박아 둔 숫자(쉰네 번째 날 · 날짜 ·
 * 성모송 2,700번)는 실제 여정에서 세어 온 값으로 채운다.
 *
 * **시안의 마지막 줄에서 한 마디를 뺐다.** v5 는 `성모송 2,700번 · 못 바친 날은 뒤로 밀려
 * 채워졌습니다` 라고 적었는데, 이 앱은 못 바친 날을 뒤로 밀어 채우지 않는다 — FR-35 가
 * "하루를 건너뛰어도 며칠째는 흘러가고 그날 칸은 비어 있는 채로 남는다"로 정했기 때문이다.
 * 없는 일을 말하는 문장이라 지웠고, 대신 지어내 채우지도 않았다. 남은 것은 성모송 수뿐이다.
 */
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { artSession, SLOT_GEOMETRY } from '../src/art';
import { FIFTYFOUR_PETITION_DAYS } from '../src/domain/mysteries';
import { monthDayKo, nativeCountKo, ordinalKo } from '../src/journey/format';
import { countDays, finishDateOf, journeyLength } from '../src/journey/rules';
import { leaveToHome } from '../src/navigation/leaveToHome';
import { HAILS_PER_DAY } from '../src/prayer/steps';
import { useAppState } from '../src/state/useAppState';
import { metrics, metrics2, type as type1, type2, useThemedStyles, type Theme } from '../src/theme';
import { PrimaryButton, QuietButton, Ribbon } from '../src/ui/Screen';

export default function AllDoneScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { journeys } = useAppState();
  const styles = useThemedStyles(allDoneStyles);

  const journey = journeys.find((item) => item.id === id) ?? journeys[0];
  if (!journey) return <View style={styles.screen} testID="all-done-screen" />;

  const plate = artSession.forJourney(journey.id);
  const length = journeyLength(journey.format) ?? journey.days.length;
  const finish = finishDateOf(journey);
  const counts = countDays(journey.days);

  return (
    <View style={styles.screen} testID="all-done-screen">
      {plate ? (
        <Image
          source={plate.source}
          style={styles.art}
          contentFit="cover"
          contentPosition={{ left: plate.focus.finish.x, top: plate.focus.finish.y }}
          accessible={false}
        />
      ) : (
        <View style={styles.art} />
      )}

      <View style={styles.body}>
        <Text style={styles.head} testID="all-done-head">
          {ordinalKo(length)} 날{finish ? ` · ${monthDayKo(finish)}` : ''}
        </Text>
        <Text style={styles.title} testID="all-done-title">
          {nativeCountKo(length)} 날을{'\n'}다 바쳤습니다
        </Text>
        <Text style={styles.sub}>
          {journey.title}을 위하여
          {journey.format === 'fiftyfour' ? (
            <Text>
              {'\n'}
              {journey.kind === 'thanksgiving'
                ? `${nativeCountKo(length)} 날 내내 감사`
                : `청원 ${nativeCountKo(FIFTYFOUR_PETITION_DAYS)} 날, 감사 ${nativeCountKo(
                    length - FIFTYFOUR_PETITION_DAYS,
                  )} 날`}
            </Text>
          ) : null}
        </Text>

        <View style={styles.ribbonBox}>
          <Ribbon days={journey.days} height={metrics2.ribbonAll} testID="all-done-ribbon" />
        </View>
        <Text style={styles.note} testID="all-done-note">
          성모송 {(counts.prayed * HAILS_PER_DAY).toLocaleString('ko-KR')}번
        </Text>

        <View style={styles.spacer} />

        <PrimaryButton
          label="이 지향으로 다시 시작하기"
          onPress={() =>
            router.replace({ pathname: '/new', params: { title: journey.title } })
          }
          testID="all-done-again"
        />
        <QuietButton label="여정 목록으로" onPress={leaveToHome} testID="all-done-home" />
      </View>
    </View>
  );
}

const allDoneStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      flexDirection: 'column',
      paddingBottom: metrics2.screenBottom, // 26
      backgroundColor: colors.background,
    },
    art: {
      height: SLOT_GEOMETRY.finish.height, // 248
      flexGrow: 0,
      flexShrink: 0,
      backgroundColor: colors.rule,
    },
    body: {
      paddingTop: 32,
      paddingHorizontal: metrics.screenPadding, // 24
      flexDirection: 'column',
      flex: 1,
    },
    head: { ...type1.label, color: colors.inkMuted },
    title: { ...type2.finishTitle, color: colors.ink, marginTop: 18 },
    sub: { ...type1.bodySmall, color: colors.ink, marginTop: 18 },
    ribbonBox: { marginTop: 26 },
    note: { ...type1.caption, color: colors.inkMuted, marginTop: 10 },
    spacer: { flex: 1 },
  });
