/**
 * C′ 여정 완주 — 하루가 아니라 **여정 전체**가 끝난 날의 화면 (W3 슬라이스 A).
 *
 * ── 이 화면이 2026-09-18 에 어떻게 달라졌나 ─────────────────────────────────────
 *
 * 그전까지 이 화면은 v5 시안의 한지 벌이었다. 위에서부터 성화 한 조각(높이 248) · 날짜
 * 머리글 · 큰 제목 · 지향 · 54칸 리본 · 성모송 수 · 단추 둘이 **위에서 아래로** 쌓였다.
 *
 * | 무엇 | 옛 화면 (v5) | 이 화면 (World) |
 * |---|---|---|
 * | 성화 | 화면 위쪽 248px 조각 | 화면 전체를 덮는 배경, 그 위에 어두운 덮개 |
 * | 쌓는 방향 | 위에서 아래로 | **아래에서 위로** — 글이 화면 아래쪽에 모인다 |
 * | 숫자 | 리본 아래에 성모송 한 줄 | 괘선 하나 위에 성모송 한 줄 |
 * | 리본 | 54칸 띠 | 없다 — 같은 내용을 여정 줄이 말로 적는다 |
 *
 * ── 값이 어디서 왔나 ─────────────────────────────────────────────────────────
 *
 * **새 시안에는 여정 완주 화면이 없다.** 시안에는 여정이라는 개념 자체가 없어 하루를
 * 마치는 화면(`data-screen-label="Complete"`) 하나뿐이기 때문이다. 그래서 이 화면은
 * **그 하루 완주 화면의 어법을 그대로 물려받는다** — 색·간격·글자 크기·단추 모양을
 * `app/day-done.tsx` 와 같은 토큰(`worldDoneType` · `onScrim`)에서 가져오고, 담는 내용만
 * 하루가 아니라 여정 전체의 것으로 바꿨다. 새 값을 지어내지 않은 것이 요점이다.
 *
 * ── 시안(하루 완주)과 다르게 한 자리 여섯 ────────────────────────────────────
 *
 * 1. **큰 제목이 `쉰네 날의 여정을 마쳤습니다` 다.** 하루 완주의 제목(`오늘의 묵주기도를
 *    마쳤습니다`)은 하루를 말하는 글이라, 여정의 끝에 그대로 쓰면 무엇이 끝났는지가
 *    사라진다. 날의 수를 우리말 셈으로 적는 것은 옛 화면에서 그대로 가져왔다.
 *
 *    **처음에는 `쉰네 날을 다 바쳤습니다` 였다. 고친 이유를 적어 둔다 (2026-09-18).**
 *    그 문장은 06-screen-spec 화면 C′ 가 정한 문구(`{N}일을 다 바쳤습니다`)를 그대로
 *    옮긴 것이었는데, **요구사항 문서 자신이 모순이었다** — 같은 표가 바로 아래 줄에서
 *    바친 날 수를 `54일 중 51일` 처럼 적으라며 "빈 날을 숨기지 않고 벌하지도 않는다"고
 *    정한다. 그래서 한 화면에 `쉰네 날을 다 바쳤습니다` 와 `54일 중 21일을 바쳤습니다`
 *    가 나란히 떴다. 하루라도 거른 사람에게 제목이 사실이 아닌데, FR-35 가 못 바친 날을
 *    뒤로 밀지 않기로 했으므로 **거르는 사람이 오히려 보통이다.** 같은 절의 목적 한 줄이
 *    답을 갖고 있다 — "성취 축하가 아니라 **마침**을 확인한다." `마쳤습니다` 는 다 바친
 *    사람에게도 참이고 거른 사람에게도 참이며, 몇 날을 바쳤는지는 아래 줄이 이미 말한다.
 *    요구사항 문서는 원문을 지우지 않고 개정 이력을 덧붙여 고쳤다.
 *
 * 2. **`이 성화 고정하기` 단추가 없다.** 그 단추는 "오늘 본 그림을 앞으로도 보겠다"는 뜻인데,
 *    이 화면 다음에 오는 것은 오늘이 아니라 **다음 여정**이다. 대신 그 자리에 옛 화면의
 *    `이 지향으로 다시 시작하기` 를 두었다.
 * 3. **`이 지향으로 다시 시작하기` 가 여정 화면으로 간다.** 그전에는 옛 `새 기도` 화면으로
 *    갔는데, W3 이 여정을 만드는 자리를 여정 화면 하나로 모았다(`docs/plan/w3-work-order.md`
 *    §1-2). 바람은 주소에 실어 보내 그 화면의 입력칸에 미리 적혀 있게 한다.
 * 3-2. **그 단추는 조용한 둘째 자리에 있고, 주 단추는 `홈으로` 다.** 한때 서열이 반대였다 —
 *    `다시 시작하기` 가 주 단추(52px · 강조색 테)가 되고 `홈으로` 가 조용한 단추로
 *    내려가 있었고, **그 사실이 이 표에 적혀 있지 않았다**(2026-09-18 KimDesigner 검수가
 *    잡았다). 명세대로 되돌렸다 — 06-screen-spec 화면 C′ 의 요소 표는 이 화면의 이탈을
 *    `돌아가기 — 홈으로` 하나로 정했고, 같은 절의 "명세 밖"이 "다음 기도 예약"을 범위
 *    밖으로 못 박았으며, 하루 완주 화면도 `홈으로` 가 주 단추다.
 * 4. **못 바친 날을 뒤로 밀어 채웠다는 말을 하지 않는다.** v5 가 `못 바친 날은 뒤로 밀려
 *    채워졌습니다` 라고 적었는데 이 앱은 그렇게 하지 않는다 — FR-35 가 "하루를 건너뛰어도
 *    며칠째는 흘러가고 그날 칸은 비어 있는 채로 남는다"로 정했기 때문이다. 없는 일을 말하는
 *    문장이라 지웠고, 대신 지어내 채우지도 않았다.
 */
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { artSession } from '../src/art';
import { FIFTYFOUR_PETITION_DAYS } from '../src/domain/mysteries';
import { fill, stringsFor } from '../src/i18n';
import { formatNumber, monthDay, nativeCountKo, ordinalKo } from '../src/journey/format';
import { countDays, finishDateOf, journeyLength } from '../src/journey/rules';
import { leaveToHome } from '../src/navigation/leaveToHome';
import { HAILS_PER_DAY } from '../src/prayer/steps';
import { useAppState } from '../src/state/useAppState';
import { fonts } from '../src/theme';
import { TEXT_SCALE } from '../src/theme/fontScale';
import {
  doneTitleSizeFor,
  koWordBreak,
  onScrim,
  paletteFor,
  worldDoneType,
  type WorldPalette,
} from '../src/theme/worldTokens';

/** 성화의 짙기 — 하루 완주 화면과 같은 값(시안의 `opacity:.9`). */
const PLATE_OPACITY = 0.9;

/** 글이 모이는 칸이 안전 영역 위로 띄우는 만큼 — 하루 완주와 같다. */
const STACK_GAP = 24;

export default function AllDoneScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { journeys, settings } = useAppState();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const palette = paletteFor(settings.region);
  const strings = stringsFor(settings.language);
  const styles = allDoneStyles(palette);

  const journey = journeys.find((item) => item.id === id) ?? journeys[0];
  if (!journey) return <View style={styles.screen} testID="all-done-screen" />;

  const plate = artSession.forJourney(journey.id);
  const focal = plate ? plate.focus.finish : null;
  const length = journeyLength(journey.format) ?? journey.days.length;
  const finish = finishDateOf(journey);
  const counts = countDays(journey.days);

  const titleFontSize = doneTitleSizeFor(window.width) * TEXT_SCALE.font;
  const titleSize = { fontSize: titleFontSize, lineHeight: titleFontSize * 1.08 };

  /** 54일 여정만 국면을 갖는다 (FR-35). 9일·날마다 여정에는 이 줄이 없다. */
  const phaseLine =
    journey.format !== 'fiftyfour'
      ? null
      : journey.kind === 'thanksgiving'
        ? fill(strings.allDonePhaseThanks, { count: nativeCountKo(length), n: length })
        : fill(strings.allDonePhaseBoth, {
            pc: nativeCountKo(FIFTYFOUR_PETITION_DAYS),
            tc: nativeCountKo(length - FIFTYFOUR_PETITION_DAYS),
            p: FIFTYFOUR_PETITION_DAYS,
            t: length - FIFTYFOUR_PETITION_DAYS,
          });

  return (
    <View style={styles.screen} testID="all-done-screen">
      {/* 성화와 어두운 덮개. 손가락을 받지 않으므로 통째로 막아 둔다 (하루 완주와 같다). */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {plate && focal ? (
          <Image
            source={plate.source}
            style={[StyleSheet.absoluteFill, { opacity: PLATE_OPACITY }]}
            contentFit="cover"
            contentPosition={{ left: focal.x, top: focal.y }}
            accessible={false}
          />
        ) : null}
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient id="allDoneScrim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity={0.2} />
              <Stop offset="0.35" stopColor="#000000" stopOpacity={0.1} />
              <Stop offset="0.62" stopColor={palette.scrim} stopOpacity={0.92} />
              <Stop offset="1" stopColor={palette.scrim} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#allDoneScrim)" />
        </Svg>
      </View>

      <View
        style={[
          styles.stack,
          { paddingTop: insets.top + STACK_GAP, paddingBottom: insets.bottom + STACK_GAP },
        ]}
      >
        <Text style={styles.label} numberOfLines={2}>
          {journey.title}
          {phaseLine ? ` · ${phaseLine}` : ''}
        </Text>

        <Text style={[styles.title, titleSize]} testID="all-done-title">
          {fill(strings.allDoneTitle, { count: nativeCountKo(length), n: length })}
        </Text>

        {/*
          숫자 줄에 성모송 하나만 둔다. 하루 완주는 이 자리에 셋(성모송·걸린 시간·이어서)을
          두는데, 여정 전체에는 걸린 시간도 이어서 바친 횟수도 남아 있지 않다 — 하루하루의
          값이라 여정이 모아 두지 않는다. 바친 날의 수는 바로 아래 여정 줄이 말하므로 여기
          다시 적으면 같은 수가 한 화면에 두 번 나온다.
        */}
        <View style={styles.stats}>
          {/*
            성모송의 **글 전체**가 이름표를 받는 것은 옛 화면에서 그대로 물려받은 것이다
            (시험이 `성모송 1,113번` 한 덩어리를 재고 있다). 하루 완주가 숫자만 이름표를
            받는 것과 다른 까닭은 그것뿐이며, 모양과 크기는 같은 토큰에서 온다.
          */}
          <Text style={styles.stat} testID="all-done-note">
            {fill(strings.hailCount, {
              n: formatNumber(counts.prayed * HAILS_PER_DAY, settings.language),
            })}
          </Text>
        </View>

        <View style={styles.journeyLines}>
          <Text style={styles.journeyLine} testID="all-done-head">
            {fill(finish ? strings.allDoneHeadWithDate : strings.allDoneHead, {
              ord: ordinalKo(length),
              n: length,
              date: finish ? monthDay(finish, settings.language) : '',
            })}
          </Text>
          <Text style={styles.journeyLine} testID="all-done-summary">
            {fill(strings.daysPrayedOf, { t: length, p: counts.prayed })}
          </Text>
        </View>

        <View style={styles.buttons}>
          {/*
            `홈으로` 가 주 단추다. 06-screen-spec 화면 C′ 의 요소 표는 이 화면의 이탈을
            `돌아가기 — 홈으로` 하나로 정해 두었고, 하루 완주 화면(`app/day-done.tsx`)도
            같은 서열이다. 한때 `다시 시작하기` 가 주 단추였는데 명세대로 되돌렸다 —
            여정을 마친 자리에서 가장 강한 말이 "다음 여정을 시작하라"가 되면, 이 화면의
            목적("성취 축하가 아니라 마침을 조용히 확인한다")과 어긋난다.
          */}
          <Pressable
            style={styles.primaryButton}
            onPress={leaveToHome}
            accessibilityRole="button"
            testID="all-done-home"
          >
            <Text style={styles.primaryLabel}>{strings.toHome}</Text>
          </Pressable>
          <Pressable
            style={styles.quietButton}
            /*
              여정을 만드는 자리가 W3 에서 여정 화면 하나로 모였으므로 그리로 간다
              (머리 3번). 바람을 주소에 실어 보내면 그 화면의 입력칸에 미리 적혀 있다.
              갈아 끼운다(`replace`) — 끝난 여정의 완주 화면 위에 새 화면을 쌓으면
              뒤로 가기가 이미 끝난 여정으로 되돌아간다.
            */
            onPress={() =>
              router.replace({ pathname: '/journey', params: { title: journey.title } })
            }
            accessibilityRole="button"
            testID="all-done-again"
          >
            <Text style={styles.quietLabel}>{strings.againWithIntention}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/**
 * 색은 지역의 덮개 위에 얹히는 값들(`onScrim`)과 그 지역의 덮개 색(`palette.scrim`)에서만
 * 온다. 크기와 간격은 하루 완주 화면에서 그대로 물려받았다 — 안쪽 여백 좌우 24, 층 사이
 * 간격 16, 강조 단추 높이 52, 조용한 단추 높이 44, 모서리 4.
 */
const allDoneStyles = (palette: WorldPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.scrim, overflow: 'hidden' },
    // 시안의 `justify-content:flex-end` — 글이 화면 아래쪽에 모인다.
    stack: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, gap: 16 },
    label: { ...worldDoneType.label, color: onScrim.accent },
    // 크기와 줄 높이는 너비에서 계산해 얹는다 (`titleSize`). 여기 있는 것은 글꼴과 색뿐이다.
    title: { fontFamily: fonts.serif, color: onScrim.ink, ...koWordBreak },
    stats: {
      flexDirection: 'row',
      gap: 22,
      borderTopWidth: 1,
      borderTopColor: onScrim.rule,
      paddingTop: 14,
      flexWrap: 'wrap',
    },
    stat: { ...worldDoneType.stat, color: onScrim.ink },
    journeyLines: { gap: 4 },
    journeyLine: { ...worldDoneType.journey, color: onScrim.ink, opacity: 0.85 },
    buttons: { gap: 10, marginTop: 6 },
    primaryButton: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: onScrim.accent,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    primaryLabel: { ...worldDoneType.button, color: onScrim.buttonInk, textAlign: 'center' },
    quietButton: {
      minHeight: 44,
      borderWidth: 1,
      borderColor: onScrim.quietBorder,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quietLabel: { ...worldDoneType.quietButton, color: onScrim.ink },
  });
