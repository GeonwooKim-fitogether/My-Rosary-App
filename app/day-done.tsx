/**
 * C 하루 완주 — 「MyRosary World」 시안의 `data-screen-label="Complete"` 블록을 옮긴 화면.
 *
 * 값(색·크기·간격·문구)은 그 블록에서 그대로 가져왔고, 색은 지역 다섯의 색 벌
 * (`src/theme/worldTokens.ts`)에서 이름으로 고른다. 화면이 스스로 정하는 색은 없다.
 *
 * ── 이 화면이 2026-09-18 에 어떻게 달라졌나 (W1 §3-6 · `decisions.md` 결정 11·12) ──────
 *
 * 그전까지 이 화면은 v5 시안의 한지 벌이었다. 위에서부터 날짜 머리글 · 큰 제목 · 리본 ·
 * 통계 세 줄 · `돌아가기` 단추가 **위에서 아래로** 쌓였다. 새 시안은 같은 화면을 기도
 * 화면과 같은 몰입 어법으로 다시 그렸다.
 *
 * | 무엇 | 옛 화면 (v5) | 이 화면 (World) |
 * |---|---|---|
 * | 성화 | 없다 (한지 바탕) | 화면 전체를 덮는 배경, 그 위에 어두운 덮개 |
 * | 쌓는 방향 | 위에서 아래로 | **아래에서 위로** — 글이 화면 아래쪽에 모인다 |
 * | 숫자 | 통계 세 줄(성모송 · 걸린 시간 · 이어서)이 괘선으로 나뉜다 | 괘선 하나 위에 한 줄로 늘어선다 |
 * | 단추 | `돌아가기` 하나 | `홈으로` 와 `이 성화 고정하기` 둘 |
 *
 * ── 시안과 다르게 한 자리 넷 (그리고 그 이유) ──────────────────────────────────
 *
 * 1. **맨 위 라벨에 여정의 바람을 함께 적는다.** 시안은 계정도 여정도 없는 앱이라 그
 *    자리에 신비 이름만 적는다. 이 앱은 여정이 척추이므로 `바람 · 신비 이름` 두 가지를
 *    적어, 무엇을 위해 바친 하루였는지가 완주 화면에 남게 했다.
 * 2. **여정 줄이 한 줄이 아니라 두 줄이다.** 시안의 `journeyLine · journeyDay` 한 줄에는
 *    이 앱이 말해야 할 것이 다 들어가지 않는다 — 오늘이 며칠이고 몇째 날이었는지, 그리고
 *    54일 중 며칠을 바쳤고 며칠이 남았는지 둘이다. 그래서 같은 크기의 두 줄로 나눴다.
 * 3. **리본(54칸 띠)이 사라졌다.** 시안의 완주 화면에는 그 자리가 없고, 같은 내용을 둘째
 *    여정 줄이 말로 적는다. 54칸을 눈으로 보는 자리는 여정 상세 화면(`app/journey.tsx`)에
 *    그대로 있다.
 * 4. **`이 성화 고정하기` 는 값을 저장하는 데까지만 한다.** 고정한 그림을 홈과 기도
 *    배경에 실제로 쓰는 것은 W2 의 일이다 — 지금 이 값을 읽는 곳은 이 화면의 단추 글자
 *    (`고정됨`)뿐이다.
 *
 * **시안과 같게 두되 옛 값을 지킨 자리 하나.** 머리글의 날짜는 v5 의 `renderDayDone` 이
 * 하루를 마친 뒤 **다음 날**의 번호를 적던 것을 이 저장소가 **방금 바친 날**로 고친 값이다
 * (`decisions.md` Q-20). 하루 완주 화면이 확인해 주는 것은 내일이 아니라 오늘이다.
 */
import { useCallback, useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { artSession } from '../src/art';
import { MYSTERY_SETS } from '../src/domain/mysteries';
import { stringsFor } from '../src/i18n';
import { TEXT_SCALE } from '../src/theme/fontScale';
import { fonts } from '../src/theme';
import { monthDayKo, ordinalKo } from '../src/journey/format';
import { countDays, dayIndexOn, journeyLength } from '../src/journey/rules';
import { dateOfDay } from '../src/journey/session';
import type { MysteryKey } from '../src/domain/types';
import { leaveToHome } from '../src/navigation/leaveToHome';
import { loadPinnedArt, pinArt } from '../src/state/appStore';
import { useAppState } from '../src/state/useAppState';
import {
  doneTitleSizeFor,
  onScrim,
  paletteFor,
  worldDoneType,
  type WorldPalette,
} from '../src/theme/worldTokens';

/** 성화의 짙기. 시안의 `opacity:.9`. */
const PLATE_OPACITY = 0.9;

/** 글이 모이는 칸이 안전 영역 위로 띄우는 만큼. 시안의 `calc(env(safe-area-inset-bottom) + 24px)`. */
const STACK_BOTTOM_GAP = 24;

function numberParam(value: string | string[] | undefined, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function DayDoneScreen() {
  const params = useLocalSearchParams();
  const { journeys, settings } = useAppState();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const palette = paletteFor(settings.region);
  const strings = stringsFor(settings.language);
  const styles = doneStyles(palette);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const journey = journeys.find((item) => item.id === id) ?? journeys[0];

  /**
   * 고정한 성화가 이미 있나. 화면이 뜰 때 한 번 읽어 단추의 글자를 고른다.
   *
   * 갈고리(hook)는 어떤 경우에도 같은 수만큼 불려야 하므로, 여정이 없어 빈 화면을 돌려주는
   * 아래 갈림길보다 **위에** 둔다.
   */
  const [pinnedFile, setPinnedFile] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void loadPinnedArt().then((file) => {
      if (!cancelled) setPinnedFile(file);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const plate = journey ? artSession.forJourney(journey.id) : null;
  const pin = useCallback(() => {
    if (!plate) return;
    pinArt(plate.file);
    setPinnedFile(plate.file);
  }, [plate]);

  if (!journey) return <View style={styles.screen} testID="day-done-screen" />;

  // 방금 바친 날. 기도 화면이 넘겨준다. 값이 없으면(화면을 직접 열었으면) 오늘을 쓴다.
  const prayedDay = numberParam(params.dayIndex, dayIndexOn(journey.startDate, new Date()));
  const hails = numberParam(params.hails, 0);
  const elapsedMs = numberParam(params.elapsedMs, 0);
  const resumeCount = numberParam(params.resumeCount, 0);
  const mystery = (Array.isArray(params.mystery) ? params.mystery[0] : params.mystery) as
    | MysteryKey
    | undefined;

  const counts = countDays(journey.days);
  const length = journeyLength(journey.format) ?? journey.days.length;
  const mysteryName = mystery ? MYSTERY_SETS[mystery]?.name : undefined;
  const minutes = Math.max(1, Math.round(elapsedMs / 60000));
  const focal = plate ? plate.focus.finish : null;
  const pinned = plate !== null && pinnedFile === plate.file;
  /*
   * 큰 제목의 크기 — 시안의 `clamp(32px, 9vw, 42px)` 에 기기 글자 배율을 곱한 값이다.
   *
   * 배율을 곱하는 이유는 FR-28 이 "글자를 키우면 줄 간격도 함께 커진다"를 화면 하나에만
   * 요구하지 않기 때문이다. 시안의 `vw` 는 화면 너비만 보고 사람이 키운 글자는 보지
   * 않으므로, 그대로 옮기면 이 제목만 커지지 않는다. 웹이 아닌 기기에서는 이 배율이 1 이고
   * React Native 가 스스로 키운다(`src/theme/fontScale.ts` 의 표).
   */
  const titleFontSize = doneTitleSizeFor(window.width) * TEXT_SCALE.font;
  const titleSize = { fontSize: titleFontSize, lineHeight: titleFontSize * 1.08 };

  return (
    <View style={styles.screen} testID="day-done-screen">
      {/* 성화와 어두운 덮개. 손가락을 받지 않으므로 통째로 막아 둔다. */}
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
            {/*
              위에서 아래로 네 마디. 위쪽은 옅게 덮어 성화가 그대로 보이고, 62% 아래부터
              지역의 덮개 색으로 가라앉아 100% 에서 완전히 그 색이 된다 — 글이 모이는 아래쪽
              이다. 시안의 `color-mix` 는 "덮개 색을 92% 만큼 섞는다"는 뜻이라, 여기서는 같은
              색에 불투명도를 준다.
            */}
            <LinearGradient id="doneScrim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity={0.2} />
              <Stop offset="0.35" stopColor="#000000" stopOpacity={0.1} />
              <Stop offset="0.62" stopColor={palette.scrim} stopOpacity={0.92} />
              <Stop offset="1" stopColor={palette.scrim} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#doneScrim)" />
        </Svg>
      </View>

      <View
        style={[
          styles.stack,
          { paddingTop: insets.top + STACK_BOTTOM_GAP, paddingBottom: insets.bottom + STACK_BOTTOM_GAP },
        ]}
      >
        <Text style={styles.label} numberOfLines={2}>
          {journey.title}
          {mysteryName ? ` · ${mysteryName}` : ''}
        </Text>

        <Text style={[styles.title, titleSize]}>{strings.complete}</Text>

        <View style={styles.stats}>
          {/*
            성모송의 **숫자만** 따로 이름표를 받는 이유를 적어 둔다. 옛 화면은 이름과 값을
            두 칸으로 나눠 두었고 시험이 값 쪽(`53번`)을 재고 있었는데, 시안은 둘을 한 줄로
            붙여 적는다. 글은 시안대로 붙이고 이름표는 숫자에 그대로 두어, 시험이 재던 것을
            한 글자도 바꾸지 않았다.
          */}
          <Text style={styles.stat}>
            성모송 <Text testID="day-done-hails">{`${hails}번`}</Text>
          </Text>
          <Text style={styles.stat}>{`${minutes}분`}</Text>
          {resumeCount > 0 ? <Text style={styles.stat}>{`이어서 ${resumeCount}번`}</Text> : null}
        </View>

        <View style={styles.journeyLines}>
          <Text style={styles.journeyLine} testID="day-done-head">
            {monthDayKo(dateOfDay(journey, prayedDay))} · {ordinalKo(prayedDay)} 날
          </Text>
          <Text style={styles.journeyLine} testID="day-done-summary">
            {length}일 중 {counts.prayed}일 바쳤습니다 · 남은 {counts.remaining}일
          </Text>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={styles.homeButton}
            onPress={leaveToHome}
            accessibilityRole="button"
            testID="day-done-back"
          >
            <Text style={styles.homeLabel}>{strings.toHome}</Text>
          </Pressable>
          <Pressable
            style={styles.pinButton}
            onPress={pin}
            disabled={plate === null}
            accessibilityRole="button"
            accessibilityState={{ selected: pinned }}
            testID="day-done-pin"
          >
            <Text style={styles.pinLabel}>{pinned ? strings.pinned : strings.keepImage}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/**
 * 색은 지역의 덮개 위에 얹히는 값들(`onScrim`)과 그 지역의 덮개 색(`palette.scrim`)에서만
 * 온다. 크기와 간격은 시안의 하루 완주 마크업에서 그대로 옮겼다 — 안쪽 여백 좌우 24,
 * 층 사이 간격 16, 강조 단추 높이 52, 조용한 단추 높이 44, 모서리 4.
 */
const doneStyles = (palette: WorldPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.scrim, overflow: 'hidden' },
    // 시안의 `justify-content:flex-end` — 글이 화면 아래쪽에 모인다.
    stack: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, gap: 16 },
    label: { ...worldDoneType.label, color: onScrim.accent },
    // 크기와 줄 높이는 너비에서 계산해 얹는다 (`titleSize`). 여기 있는 것은 글꼴과 색뿐이다.
    title: {
      fontFamily: fonts.serif,
      color: onScrim.ink,
      /*
       * 웹에서만 낱말 가운데를 끊지 않게 한다.
       *
       * 브라우저는 한국어를 낱말이 아니라 **글자 단위로** 끊으므로, 그냥 두면 큰 제목이
       * `오늘의 묵주기도를 마 / 쳤습니다` 처럼 갈라진다. `keep-all` 은 띄어쓰기에서만
       * 끊으라는 뜻이고, iOS·안드로이드는 원래 그렇게 끊으므로 웹에만 준다.
       * 시안은 같은 일을 `text-wrap: balance` 로 하는데 React Native 에는 그 속성이 없다.
       */
      ...Platform.select({ web: { wordBreak: 'keep-all' as const }, default: {} }),
    },
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
    homeButton: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: onScrim.accent,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    homeLabel: { ...worldDoneType.button, color: onScrim.buttonInk },
    pinButton: {
      minHeight: 44,
      borderWidth: 1,
      borderColor: onScrim.quietBorder,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pinLabel: { ...worldDoneType.quietButton, color: onScrim.ink },
  });
