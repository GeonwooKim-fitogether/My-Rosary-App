/**
 * 지역·언어 — 「MyRosary World」 시안의 `data-screen-label="Region & Language"` 블록을
 * 옮긴 화면 (W2 슬라이스 C · `docs/plan/w2-work-order.md` §2).
 *
 * 값(크기·간격·괘선·그림 테)은 그 블록에서 그대로 가져왔고, 색은 지역 다섯의 색 벌
 * (`src/theme/worldTokens.ts`)에서 이름으로 고른다. 화면이 스스로 정하는 색은 없다.
 *
 * ── 이 화면이 하는 일 ───────────────────────────────────────────────────────────
 *
 * 지역 하나를 고르면 **앱 전체의 색 벌과 성화 묶음이 함께 바뀐다.** 색은 화면들이
 * `paletteFor(settings.region)` 으로 고르므로 저절로 따라오고, 성화는 뽑기를 다시 여는
 * 것으로 따라온다(`src/state/appStore.ts` 의 `updateSettings` 가 그 자리다).
 *
 * ── 시안의 결함 9 번을 여기서 고친다 ────────────────────────────────────────────
 *
 * 시안은 지역을 고를 때 이렇게 한다.
 *
 *     pick: () => { const patch = { region: r.id };
 *                   if (!r.langs.includes(S.settings.lang)) patch.lang = r.defaultLang; ... }
 *
 * 즉 **고른 지역이 쓰지 않는 언어를 보고 있었다면 언어까지 바꿔 버린다.** 한국어로 앱을
 * 쓰던 사람이 유럽의 성화가 보고 싶어 지역만 바꾸면 화면 글이 통째로 영어가 되는 것이다.
 * 시안을 만든 지시문 자신이 "지역과 언어는 독립적으로 변경"이라 적었으므로, 이것은 우리가
 * 시안을 뒤집는 것이 아니라 **시안이 자기 지시문을 어긴 자리**를 되돌리는 일이다.
 *
 * 그래서 이 화면은 지역을 바꿀 때 지역만 바꾼다. **언어는 사람이 아래 목록에서 직접
 * 고르기 전까지 그대로다.** 그것을 e2e 가 붙든다(`e2e/region.spec.ts`).
 *
 * ── 언어 일곱 중 둘만 고를 수 있다 (결정 12-2 카드 C) ──────────────────────────
 *
 * 화면 문구는 일곱 벌이 다 들어와 있지만 고를 수 있는 것은 한국어와 영어 둘뿐이다
 * (`src/i18n/index.ts` 의 `ENABLED_LANGUAGES`). 나머지 다섯은 기도문이 공식 문구인지
 * 확인되지 않았고 앞 절·뒷 절로 나뉘지도 않아, 켜면 사람들이 확인되지 않은 기도문을
 * 바치게 된다. **목록에서 지우지 않고 `준비 중` 으로 보이되 눌리지 않게 한 이유**는,
 * 지우면 "이 앱은 일곱 언어를 목표로 한다"는 사실 자체가 화면에서 사라지기 때문이다.
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WORLD_PLATES, REGION_PLATES } from '../src/art/worldPlates';
import {
  ENABLED_LANGUAGES,
  LANGUAGES,
  LANGUAGE_ORDER,
  REGION_LANGUAGES,
  stringsFor,
  type LanguageKey,
} from '../src/i18n';
import { updateSettings } from '../src/state/appStore';
import { useAppState } from '../src/state/useAppState';
import { TEXT_SCALE } from '../src/theme/fontScale';
import {
  guideTitleSizeFor,
  koWordBreak,
  paletteFor,
  REGION_ORDER,
  REGION_PALETTES,
  worldFontStack,
  worldRegionType,
  type RegionKey,
  type WorldPalette,
} from '../src/theme/worldTokens';

/** 시안의 괘선 — 화면마다 쓰는 `rgba(0,0,0,.14)` 하나다. */
const RULE = 'rgba(0,0,0,.14)';

export default function RegionScreen() {
  const { settings } = useAppState();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const palette = paletteFor(settings.region);
  const strings = stringsFor(settings.language);
  const isKorean = settings.language === 'ko';
  const styles = regionStyles(palette, isKorean);

  const titleFontSize = guideTitleSizeFor(window.width) * TEXT_SCALE.font;

  return (
    <View style={styles.screen} testID="region-screen">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* ── 머리 · 뒤로 화살표와 작은 라벨 ────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            style={styles.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/settings'))}
            accessibilityRole="button"
            accessibilityLabel={strings.back}
            testID="region-back"
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
          <Text style={styles.label} testID="region-label">
            {strings.regionLang}
          </Text>
        </View>

        <Text
          style={[styles.title, { fontSize: titleFontSize, lineHeight: titleFontSize * 1.05 }]}
        >
          {strings.region}
        </Text>

        {/* ── 지역 다섯 ─────────────────────────────────────────────────── */}
        <View style={styles.list}>
          {REGION_ORDER.map((region) => (
            <RegionRow
              key={region}
              region={region}
              here={region === settings.region}
              name={strings[region]}
              desc={strings.regionDesc[region]}
              palette={palette}
              isKorean={isKorean}
              /*
                **지역만 바꾼다 — 언어는 건드리지 않는다.** 시안의 결함 9 번을 고치는
                바로 그 한 줄이다(이 파일 머리 참조).
              */
              onPress={() => updateSettings({ region })}
            />
          ))}
        </View>

        <Text style={styles.section}>{strings.language}</Text>

        {/* ── 언어 일곱 (고를 수 있는 것은 둘) ──────────────────────────── */}
        <View style={styles.list}>
          {LANGUAGE_ORDER.map((language) => (
            <LanguageRow
              key={language}
              language={language}
              here={language === settings.language}
              /*
                그 언어가 지금 지역이 쓰는 언어인지를 오른쪽에 짧게 적는다(시안의 `l.tag`).
                고를 수 없는 다섯은 그 자리에 `준비 중` 이 선다.
              */
              inRegion={REGION_LANGUAGES[settings.region].includes(language)}
              regionName={strings[settings.region]}
              palette={palette}
              isKorean={isKorean}
              onPress={() => updateSettings({ language })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * 지역 한 줄 — 시안의 격자 그대로다 (72 대표 성화 / 이름과 설명 / 고름 표시).
 *
 * 대표 성화는 그 지역 묶음의 **첫 그림**이다(시안의 `D.IMAGES[r.images[0]]`). 뽑기가
 * 어느 그림을 집었는지와 무관하게 언제나 같은 그림이어야 "이 지역은 이런 결"이라는
 * 설명이 되기 때문이며, 그래서 뽑기를 거치지 않고 표에서 곧바로 가져온다.
 *
 * 색 넷(종이 · 먹 · 강조 · 둘째 강조)을 점으로 미리 보인다. 지역을 고르는 일이 곧 **앱의
 * 색을 고르는 일**이므로, 고르기 전에 무엇이 바뀌는지 보이게 하는 자리다.
 */
function RegionRow({
  region,
  here,
  name,
  desc,
  palette,
  isKorean,
  onPress,
}: {
  region: RegionKey;
  here: boolean;
  name: string;
  desc: string;
  palette: WorldPalette;
  isKorean: boolean;
  onPress: () => void;
}) {
  const styles = regionStyles(palette, isKorean);
  const swatch = REGION_PALETTES[region];
  const plate = WORLD_PLATES[REGION_PLATES[region][0]!]!;
  return (
    <Pressable
      style={styles.regionRow}
      onPress={onPress}
      accessibilityRole="radio"
      aria-checked={here}
      testID={`region-${region}`}
    >
      <View style={[styles.plate, { borderColor: swatch.paper, backgroundColor: swatch.scrim }]}>
        <Image
          source={plate.source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={{ left: plate.focal.x, top: plate.focal.y }}
          accessible={false}
        />
      </View>
      <View style={styles.regionText}>
        <Text style={styles.regionName}>{name}</Text>
        <Text style={styles.regionDesc}>{desc}</Text>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotOutlined, { backgroundColor: swatch.paper }]} />
          <View style={[styles.dot, { backgroundColor: swatch.ink }]} />
          <View style={[styles.dot, { backgroundColor: swatch.accent }]} />
          <View style={[styles.dot, { backgroundColor: swatch.accent2 }]} />
        </View>
      </View>
      {/*
        고름 표시 — 시안의 `box-shadow: inset 0 0 0 4px var(--paper)` 를 옮긴 것이다.
        React Native 에는 안쪽 그림자가 없으므로 종이색 테를 두른 작은 원을 안에 하나 더
        그려 같은 결과를 낸다(바깥 테 → 종이색 고리 → 강조색 속).
      */}
      <View style={[styles.mark, { borderColor: here ? palette.accent : 'rgba(0,0,0,.25)' }]}>
        {here ? <View style={[styles.markInner, { backgroundColor: palette.accent }]} /> : null}
      </View>
    </Pressable>
  );
}

/**
 * 언어 한 줄 — 시안의 줄 그대로다 (왼쪽 이름, 오른쪽 짧은 표시).
 *
 * 켜지지 않은 언어는 **눌리지 않는다.** 흐리게만 하고 눌리게 두면 눌러도 아무 일이
 * 일어나지 않는 줄이 되고, 그것은 사용자에게 고장으로 읽힌다(성화 갤러리 탭에 "곧
 * 만들어집니다" 한 줄을 둔 것과 같은 판단이다).
 */
function LanguageRow({
  language,
  here,
  inRegion,
  regionName,
  palette,
  isKorean,
  onPress,
}: {
  language: LanguageKey;
  here: boolean;
  inRegion: boolean;
  regionName: string;
  palette: WorldPalette;
  isKorean: boolean;
  onPress: () => void;
}) {
  const styles = regionStyles(palette, isKorean);
  const enabled = ENABLED_LANGUAGES.includes(language);
  const tag = here ? '지금' : enabled ? (inRegion ? regionName : '') : '준비 중';
  return (
    <Pressable
      style={styles.langRow}
      onPress={enabled ? onPress : undefined}
      disabled={!enabled}
      accessibilityRole="radio"
      aria-checked={here}
      aria-disabled={!enabled}
      testID={`language-${language}`}
    >
      <Text
        style={[
          styles.langName,
          here ? styles.langNameOn : null,
          enabled ? null : styles.langNameOff,
        ]}
      >
        {LANGUAGES[language].name}
      </Text>
      <Text style={styles.langTag} testID={`language-${language}-tag`}>
        {tag}
      </Text>
    </Pressable>
  );
}

/**
 * 크기와 간격은 시안의 `Region & Language` 마크업에서 그대로 옮겼다 — 머리 좌우 12,
 * 본문 좌우 24, 지역 줄의 격자 `72px / 1fr / auto` 와 사이 14, 줄마다 위아래 12 와 위
 * 괘선 1px, 성화 테 4, 색 점 12, 고름 표시 22, 언어 줄 높이 52.
 *
 * 색은 지역의 색 벌에서만 온다. 글자에 쓰는 강조는 `accentText`, 테두리에 쓰는 강조는
 * `accent` 다 (`decisions.md` Q-51).
 */
const regionStyles = (palette: WorldPalette, isKorean: boolean) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.paper },
    scroll: { flex: 1 },
    scrollInner: { flexGrow: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 },
    back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    label: { ...worldRegionType.label, color: palette.accentText, textTransform: 'uppercase' },
    title: {
      fontFamily: worldFontStack('heading', isKorean),
      color: palette.ink,
      paddingHorizontal: 24,
      marginTop: 10,
      marginBottom: 16,
      ...koWordBreak,
    },
    section: {
      ...worldRegionType.section,
      fontFamily: worldFontStack('heading', isKorean),
      color: palette.ink,
      paddingHorizontal: 24,
      marginTop: 28,
      marginBottom: 8,
      ...koWordBreak,
    },
    list: { paddingHorizontal: 24 },

    regionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      minHeight: 44,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: RULE,
    },
    /* 시안의 대표 성화 — 종이색 4px 테를 두르고 그 바깥에 1px 선이 한 겹 더 선다. */
    plate: {
      width: 72,
      height: 72,
      borderWidth: 4,
      overflow: 'hidden',
      outlineWidth: 1,
      outlineColor: RULE,
      outlineStyle: 'solid',
    },
    regionText: { flex: 1, minWidth: 0 },
    regionName: {
      ...worldRegionType.regionName,
      fontFamily: worldFontStack('heading', isKorean),
      color: palette.ink,
      ...koWordBreak,
    },
    regionDesc: { ...worldRegionType.regionDesc, color: palette.muted, marginTop: 3, ...koWordBreak },
    dots: { flexDirection: 'row', gap: 5, marginTop: 7 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    dotOutlined: { borderWidth: 1, borderColor: 'rgba(0,0,0,.2)' },
    mark: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markInner: { width: 11, height: 11, borderRadius: 5.5 },

    langRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      minHeight: 52,
      borderTopWidth: 1,
      borderTopColor: RULE,
    },
    langName: { ...worldRegionType.langName, color: palette.ink },
    langNameOn: { color: palette.accentText },
    langNameOff: { color: palette.muted },
    langTag: { ...worldRegionType.langTag, color: palette.muted, textTransform: 'uppercase' },
  });
