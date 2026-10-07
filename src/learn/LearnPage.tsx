/**
 * 배우기 두 화면이 함께 쓰는 한 장짜리 글 화면.
 *
 * 두 화면(`app/learn.tsx` 묵주기도 입문 · `app/background.tsx` 배경 지식)은 고르는 글만
 * 다르고 그리는 방식이 똑같다. 그래서 그리는 일을 여기 한 번만 적는다 — 화면마다 다시
 * 적으면 한쪽만 고쳐져 두 글이 서로 다른 모양으로 읽히게 된다.
 *
 * ── 시안에 없는 화면이라는 사실을 먼저 밝힌다 ────────────────────────────────
 *
 * 「MyRosary World」 시안에는 이 화면이 없다(화면 열 가운데 글을 읽는 화면은 신비 해설
 * 하나뿐이다). 그래서 이 화면의 크기와 간격은 시안에서 옮겨 온 것이 아니라, **시안이
 * 이미 쓰고 있는 값 가운데 성격이 같은 자리를 골라 모은 것**이다. 어느 자리에서 가져왔는지는
 * `src/theme/worldTokens.ts` 의 `worldLearnType` 머리에 표로 적혀 있다.
 *
 * ── 머리와 탭 바 ────────────────────────────────────────────────────────────
 *
 * 머리는 뒤로 화살표와 작은 라벨 하나로, 신비 해설 화면과 같은 어법을 쓴다. 아래 탭 바는
 * 놓지 않는다 — 까닭은 `app/mystery.tsx` 의 머리 4 번과 같다(탭 바는 홈 위에 한 장만
 * 쌓였을 때만 바르게 돈다).
 */
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stringsFor } from '../i18n';
import { useAppState } from '../state/useAppState';
import { paletteFor, worldLearnType, type WorldPalette } from '../theme/worldTokens';
import { learnGuide, type LearnGuideKey } from './text';

export function LearnPage({
  guide,
  label,
  testID,
}: {
  /** 어느 글을 그릴지. */
  guide: LearnGuideKey;
  /** 머리에 적히는 작은 라벨. 화면마다 다르다. */
  label: string;
  /** 화면 전체의 이름표. e2e 가 이것으로 화면을 잡는다. */
  testID: string;
}) {
  const { settings } = useAppState();
  const insets = useSafeAreaInsets();
  const palette = paletteFor(settings.region);
  const strings = stringsFor(settings.language);
  const styles = learnStyles(palette);
  const text = learnGuide(guide, settings.language);

  /*
    이 화면은 저장된 값을 읽지 않고 글만 그리므로 `ready` 를 기다리지 않는다. 기다리는
    화면들(홈 · 오늘의 신비 · 신비 해설)은 오늘 날짜에 기대어 있어 미리 그려 둔 HTML 과
    어긋날 수 있지만, 이 글은 언제 그려도 같다. 지역과 언어만 설정에서 오는데 그 둘은
    첫 그림에서도 기본값으로 서므로 어긋남이 생기지 않는다.
  */

  return (
    <View style={styles.screen} testID={testID}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
            accessibilityRole="button"
            accessibilityLabel={strings.back}
            testID={`${testID}-back`}
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
          <Text style={styles.label} testID={`${testID}-label`}>
            {label}
          </Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title} testID={`${testID}-title`}>
            {text.title}
          </Text>
          <Text style={styles.lead}>{text.lead}</Text>

          {text.sections.map((section, index) => (
            <View
              key={section.heading}
              style={styles.section}
              testID={`${testID}-section-${index + 1}`}
            >
              <Text style={styles.heading}>{section.heading}</Text>

              {section.body.map((paragraph) => (
                <Text key={paragraph} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}

              {/*
                번호가 매겨진 차례. 번호를 글 안에 적지 않고 왼쪽 칸에 세우는 까닭은,
                줄이 두 줄로 넘어갈 때 둘째 줄이 번호 아래가 아니라 글 아래에 맞춰
                들어가야 차례가 눈으로 세어지기 때문이다.
              */}
              {section.steps.map((step, stepIndex) => (
                <View key={step} style={styles.step}>
                  <Text style={styles.stepNumber}>{stepIndex + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}

              {/* 이름과 설명이 짝지어진 목록. 이름만 명조로 세워 설명과 갈린다. */}
              {section.list.map((item) => (
                <View key={item.term} style={styles.item}>
                  <Text style={styles.term}>{item.term}</Text>
                  <Text style={styles.itemText}>{item.text}</Text>
                </View>
              ))}

              {section.note ? <Text style={styles.note}>{section.note}</Text> : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * 좌우 여백 24 와 머리 좌우 12 는 신비 해설 화면과 같다 — 두 화면이 나란히 쓰이므로
 * 글이 시작하는 자리가 같아야 한다. 절 사이 28, 문단 사이 12, 절 제목 아래 10 은 이
 * 화면에서 처음 정한 값이고, 기준은 하나다: **절 사이가 문단 사이보다 눈에 띄게 넓어야
 * 어디서 새 이야기가 시작하는지 스크롤만으로 보인다.**
 */
const learnStyles = (palette: WorldPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.paper },
    scroll: { flex: 1 },
    scrollInner: { flexGrow: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 },
    back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    label: { ...worldLearnType.label, color: palette.accentText },
    body: { paddingHorizontal: 24, paddingTop: 6 },
    title: {
      ...worldLearnType.heading,
      fontSize: worldLearnType.heading.fontSize * 1.45,
      lineHeight: worldLearnType.heading.fontSize * 1.45 * 1.2,
      color: palette.ink,
      marginBottom: 12,
    },
    /* 머리말은 본문과 같은 크기이되 한 걸음 물러나 있다 — 신비 해설의 해설이 쓰는 어법. */
    lead: { ...worldLearnType.lead, color: palette.ink, opacity: 0.85 },
    section: { marginTop: 28 },
    heading: { ...worldLearnType.heading, color: palette.ink, marginBottom: 10 },
    paragraph: { ...worldLearnType.body, color: palette.ink, opacity: 0.85, marginBottom: 12 },
    step: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    stepNumber: { ...worldLearnType.stepNumber, color: palette.accentText, width: 18 },
    stepText: { ...worldLearnType.body, color: palette.ink, opacity: 0.85, flex: 1, minWidth: 0 },
    item: { marginBottom: 12 },
    term: { ...worldLearnType.term, color: palette.ink },
    itemText: { ...worldLearnType.body, color: palette.ink, opacity: 0.85, marginTop: 2 },
    /*
      절 끝의 덧말. 앞의 글에서 한 칸 떨어지고 왼쪽에 선 하나가 서서, 본문이 아니라
      곁들이는 말이라는 것이 읽기 전에 보인다.
    */
    note: {
      ...worldLearnType.note,
      color: palette.muted,
      marginTop: 6,
      paddingLeft: 12,
      borderLeftWidth: 1,
      borderLeftColor: 'rgba(0,0,0,.14)',
    },
  });
