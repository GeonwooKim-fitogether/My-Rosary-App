/**
 * B 성화 갤러리 — 「MyRosary World」 시안의 `data-screen-label="Gallery"` 블록을 옮긴 화면
 * (W3 슬라이스 B).
 *
 * 값(색·크기·간격·문구)은 그 블록에서 그대로 가져왔고, 색은 지역 다섯의 색 벌
 * (`src/theme/worldTokens.ts`)에서 이름으로 고른다. 화면이 스스로 정하는 색은 없다.
 *
 * ── 이 화면이 2026-09-18 에 어떻게 달라졌나 ─────────────────────────────────────
 *
 * 그전까지 이 자리는 **"곧 만들어집니다" 한 장**이었다. W2 가 아래 탭 바 넷을 놓으면서,
 * 갤러리 탭의 목적지를 비워 두면 눌러도 아무 일이 없는 탭이 되어 고장으로 읽히기 때문에
 * 세워 둔 자리 지킴이였다. 이 마일스톤이 그 자리를 시안의 갤러리로 채운다.
 *
 * ── 이 화면이 다루는 두 가지를 먼저 갈라 둔다 ───────────────────────────────────
 *
 * 시안은 그림마다 하트와 핀을 나란히 두는데, 둘은 하는 일이 전혀 다르다.
 *
 * | | 즐겨찾기 (하트) | 고정 (핀) |
 * |---|---|---|
 * | 몇 장인가 | 여러 장 | 한 장 |
 * | 무엇이 달라지나 | 아무것도 — `즐겨찾기` 탭에 모일 뿐이다 | **홈의 큰 그림과 기도 배경이 그 그림이 된다** |
 * | 어디서 하나 | 이 화면의 하트 | 전체 화면 감상(`app/art.tsx`)과 하루 완주 화면 |
 * | 저장 자리 | `src/storage/favoriteArt.ts` (W3 에서 새로 만들었다) | `src/storage/pinnedArt.ts` (W1 부터 있었다) |
 *
 * 그래서 이 화면은 **고정을 걸지 않는다.** 시안의 갤러리도 격자에서는 `고정됨` 표를 보여
 * 주기만 하고, 고정을 걸고 푸는 일은 감상 화면에서 한다.
 *
 * ── 시안과 다르게 한 자리 다섯 (그리고 그 이유) ────────────────────────────────
 *
 * 1. **즐겨찾기 탭이 비었을 때 한 줄로 말한다.** 시안은 이 상태를 그리지 않아, 하트를
 *    한 번도 누르지 않은 사람이 그 탭을 누르면 **아무것도 없는 화면**을 만난다. 빈 화면은
 *    고장으로 읽히므로 무엇을 하면 채워지는지 한 줄로 적었다. 같은 판단을 홈의 빈 상태와
 *    여정 화면의 빈 상태에서 이미 두 번 했다.
 * 2. **그림에 색 보정을 입히지 않는다.** 시안은 격자의 그림마다 `filter: sepia(.12)
 *    saturate(.92)` 를 걸어 옛 인쇄물처럼 보이게 하는데, React Native 에는 그런 속성이 없다
 *    (`expo-image` 의 `tintColor` 는 단색으로 물들이는 것이라 다른 일이다). 그림을 미리
 *    보정해 두는 길도 있지만 그러면 같은 파일이 갤러리와 홈에서 다르게 보여야 해서 표가
 *    둘로 갈린다. **보정 없이 원본 그대로** 둔다.
 * 3. **탭의 이름이 `모든 성화` 다.** 시안의 가운데 탭은 `t.allImages` 인데 한국어 벌의 그
 *    문구가 `모든 성화` 이고, 지시서는 이 자리를 `전체` 라 적었다. 문구는 언어 일곱에 이미
 *    들어 있는 것이 정본이므로(W0 이 기계로 옮겼다) 저장된 문구를 쓴다.
 * 4. **격자의 칸이 단추 하나가 아니라 둘이다.** 시안의 그림 칸은 누르면 감상 화면으로 가고,
 *    하트는 그 아래 따로 있다. 이 저장소도 같지만 **하트의 누르는 자리를 44×44 로 지키기
 *    위해** 캡션 줄의 오른쪽 여백을 음수로 당겼다(시안의 `margin:-10px -12px -10px 0`).
 *    시안의 값을 그대로 옮긴 것이므로 다른 자리는 아니지만, 이 값이 왜 음수인지 적어 둔다.
 * 5. **워터마크가 있는 그림 넷이 그대로 보인다.** `MARKED_PLATES` 의 넷은 작가 서명이나
 *    스톡 워터마크가 눈에 보이는데, Q-50 이 "검증까지 그대로 쓰고 정식 자산에서 교체"로
 *    정했으므로 가리지 않는다. 다만 **갤러리는 그림을 크게 나란히 놓는 첫 화면**이라
 *    그 자국이 처음으로 눈에 띄는 자리다 (`docs/plan/w3-screens/README.md` 에 적었다).
 */
import { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  REGION_PLATES,
  WORLD_PLATES,
  WORLD_PLATE_IDS,
  plateTitle,
  type WorldPlate,
} from '../src/art/worldPlates';
import { stringsFor, type Strings } from '../src/i18n';
import { useAppState } from '../src/state/useAppState';
import { toggleFavoriteArt } from '../src/state/appStore';
import { TEXT_SCALE } from '../src/theme/fontScale';
import {
  guideTitleSizeFor,
  koWordBreak,
  paletteFor,
  worldFontStack,
  worldGalleryType,
  worldRadius,
  type WorldPalette,
} from '../src/theme/worldTokens';
import { Heart } from '../src/ui/Heart';
import { TAB_BAR_HEIGHT, WorldTabBar } from '../src/ui/WorldTabBar';

/** 시안의 괘선 — 화면마다 쓰는 `rgba(0,0,0,.14)` 하나다. 액자 바깥의 실선이 이것이다. */
const RULE = 'rgba(0,0,0,.14)';
/** `고정됨` 표의 바탕과 글자 — 시안의 `rgba(0,0,0,.55)` 와 `#f6efe2`. */
const BADGE_FILL = 'rgba(0,0,0,.55)';
const BADGE_INK = '#f6efe2';

/** 탭 셋. 시안의 `S.galTab` 세 값과 같은 차례다. */
type GalleryTab = 'region' | 'all' | 'favorites';

export default function GalleryScreen() {
  const { settings, favoriteArt, pinnedArt } = useAppState();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const palette = paletteFor(settings.region);
  const strings = stringsFor(settings.language);
  const isKorean = settings.language === 'ko';
  const styles = galleryStyles(palette, isKorean);

  const [tab, setTab] = useState<GalleryTab>('region');

  const titleFontSize = guideTitleSizeFor(window.width) * TEXT_SCALE.font;

  /** 탭 셋의 이름. 첫 칸만 지역 이름이라 문구 열쇠가 아니라 값으로 온다. */
  const tabs: ReadonlyArray<{ key: GalleryTab; label: string }> = [
    { key: 'region', label: strings[settings.region] },
    { key: 'all', label: strings.allImages },
    { key: 'favorites', label: strings.favorites },
  ];

  /**
   * 이 탭이 보여 줄 그림들 — 시안의 `galIds` 와 같은 식이다.
   *
   * 즐겨찾기만은 **저장된 이름을 표와 맞춰 본다.** 저장 자리는 성화 표를 모른 채 이름만
   * 담으므로(`src/storage/favoriteArt.ts`), 표가 바뀌어 지금 없는 그림의 이름이 남아 있을
   * 수 있다. 그런 이름은 여기서 조용히 지나친다 — 저장된 값을 지우지는 않는다.
   */
  const plates: WorldPlate[] =
    tab === 'favorites'
      ? favoriteArt
          .map((file) => Object.values(WORLD_PLATES).find((plate) => plate.file === file))
          .filter((plate): plate is WorldPlate => plate !== undefined)
      : (tab === 'all' ? WORLD_PLATE_IDS : REGION_PLATES[settings.region]).map(
          (id) => WORLD_PLATES[id]!,
        );

  return (
    <View style={styles.screen} testID="gallery-screen">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingTop: insets.top + 18, paddingBottom: TAB_BAR_HEIGHT + 24 },
        ]}
      >
        {/* ── 머리 · 지역 이름과 큰 제목 ──────────────────────────────── */}
        <Text style={styles.label} testID="gallery-region">
          {strings[settings.region]}
        </Text>
        <Text
          style={[styles.title, { fontSize: titleFontSize, lineHeight: titleFontSize * 1.05 }]}
        >
          {strings.gallery}
        </Text>

        {/* ── 탭 셋 ──────────────────────────────────────────────────── */}
        <View style={styles.seg} testID="gallery-tabs">
          {tabs.map((item, index) => {
            const here = tab === item.key;
            return (
              <Pressable
                key={item.key}
                style={[
                  styles.segOption,
                  index > 0 ? styles.segDivider : null,
                  here ? styles.segOn : null,
                ]}
                onPress={() => setTab(item.key)}
                accessibilityRole="radio"
                /*
                  `aria-selected` 를 쓰는 이유는 여정 화면과 설정 화면의 고르개와 같다 —
                  `accessibilityState` 는 웹에서 해당 속성을 내보내지 않는 것이 2026-09-18
                  에 실측됐다. React Native 는 0.71 부터 `aria-*` 를 같은 뜻의 별칭으로 받는다.
                */
                aria-selected={here}
                testID={`gallery-tab-${item.key}`}
              >
                <Text style={[styles.segLabel, here ? styles.segLabelOn : null]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── 격자 (2열) ─────────────────────────────────────────────── */}
        {plates.length === 0 ? (
          <Text style={styles.empty} testID="gallery-empty">
            아직 즐겨찾기에 담은 성화가 없습니다. 그림 아래의 하트를 누르면 여기에 모입니다.
          </Text>
        ) : (
          <View style={styles.grid} testID="gallery-grid">
            {plates.map((plate) => (
              <PlateCell
                key={plate.id}
                plate={plate}
                palette={palette}
                isKorean={isKorean}
                strings={strings}
                language={settings.language}
                pinned={pinnedArt === plate.file}
                favorite={favoriteArt.includes(plate.file)}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <WorldTabBar current="gallery" />
    </View>
  );
}

/** 격자의 칸 하나 — 액자에 든 그림과 그 아래 한 줄(제목과 하트). */
function PlateCell({
  plate,
  palette,
  isKorean,
  strings,
  language,
  pinned,
  favorite,
}: {
  plate: WorldPlate;
  palette: WorldPalette;
  isKorean: boolean;
  strings: Strings;
  language: string;
  pinned: boolean;
  favorite: boolean;
}) {
  const styles = galleryStyles(palette, isKorean);
  const name = plateTitle(plate, language);
  return (
    <View style={styles.cell}>
      <Pressable
        style={styles.frame}
        onPress={() => router.push({ pathname: '/art', params: { id: plate.id } })}
        accessibilityRole="button"
        accessibilityLabel={name}
        testID={`gallery-open-${plate.id}`}
      >
        <Image
          source={plate.source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={{ left: plate.focal.x, top: plate.focal.y }}
          accessible={false}
        />
        {pinned ? (
          <View style={styles.badge} testID={`gallery-pinned-${plate.id}`}>
            <Text style={styles.badgeLabel}>{strings.pinned}</Text>
          </View>
        ) : null}
      </Pressable>

      <View style={styles.caption}>
        <Text style={styles.captionText} numberOfLines={1} testID={`gallery-title-${plate.id}`}>
          {name}
        </Text>
        <Pressable
          style={styles.heartTap}
          onPress={() => toggleFavoriteArt(plate.file)}
          accessibilityRole="button"
          accessibilityLabel={strings.favorites}
          aria-pressed={favorite}
          testID={`gallery-fav-${plate.id}`}
        >
          <Heart on={favorite} color={favorite ? palette.accent2 : palette.muted} size={18} />
        </Pressable>
      </View>
    </View>
  );
}

const galleryStyles = (palette: WorldPalette, isKorean: boolean) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.paper },
    scroll: { flex: 1 },
    /* 시안의 좌우 안쪽 여백은 20px 이다 (여정 화면의 24px 과 다르다). */
    scrollInner: { flexGrow: 1, paddingHorizontal: 20 },

    label: { ...worldGalleryType.label, color: palette.accentText },
    title: {
      fontFamily: worldFontStack('heading', isKorean),
      color: palette.ink,
      marginTop: 6,
      marginBottom: 14,
      ...koWordBreak,
    },

    /* 탭 셋을 고르는 띠 — 「Classical」 의 `.seg`. 여정 화면의 형식 고르개와 같은 부품이다. */
    seg: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: RULE,
      borderRadius: worldRadius.md,
      overflow: 'hidden',
    },
    segOption: {
      flex: 1,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    segDivider: { borderLeftWidth: 1, borderLeftColor: RULE },
    segOn: { borderWidth: 1, borderColor: palette.accent },
    segLabel: {
      ...worldGalleryType.segLabel,
      fontFamily: worldFontStack('body', isKorean),
      color: palette.muted,
      ...koWordBreak,
    },
    segLabelOn: { color: palette.accentText },

    empty: { ...worldGalleryType.empty, color: palette.muted, marginTop: 20, ...koWordBreak },

    /*
      2열 격자. 시안의 `gap:18px 14px` 을 **칸을 감싸는 그릇의 여백**으로 만든다 — 여정
      화면의 날짜 격자와 같은 판단이다. 백분율 너비와 `gap` 을 함께 쓰면 둘을 더한 값이
      100% 를 넘겨 둘째 칸이 줄 밖으로 밀리기 때문이다(세로 18 = 아래 여백 18, 가로 14 =
      양옆 7 씩).
    */
    grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, marginHorizontal: -7 },
    cell: { width: '50%', paddingHorizontal: 7, marginBottom: 18 },

    /*
      액자 — 종이색 6px 테와 그 바깥의 옅은 실선 하나(시안의 `outline:1px solid`).
      React Native 에는 `outline` 이 없으므로 **바깥 테를 그릴 그릇을 하나 더 두는 대신**
      그림자 없는 두 겹 테를 쓴다: 바깥 그릇이 실선, 안쪽이 종이색 6px 이다.
    */
    frame: {
      aspectRatio: 3 / 4,
      borderWidth: 6,
      borderColor: palette.paper,
      outlineWidth: 1,
      outlineColor: RULE,
      outlineStyle: 'solid',
      backgroundColor: palette.scrim,
      overflow: 'hidden',
    },
    badge: {
      position: 'absolute',
      left: 8,
      top: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: BADGE_FILL,
    },
    badgeLabel: { ...worldGalleryType.badge, color: BADGE_INK },

    caption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
      marginTop: 8,
    },
    captionText: { ...worldGalleryType.caption, color: palette.ink, flexShrink: 1 },
    /*
      하트의 누르는 자리는 44×44 여야 하는데(FR-28 계열의 손가락 기준), 캡션 줄의 높이는
      13px 글자 한 줄이다. 시안은 단추를 줄 밖으로 넘치게 해 그 크기를 지킨다
      (`margin:-10px -12px -10px 0`). 같은 값을 그대로 옮긴다.
    */
    heartTap: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -10,
      marginBottom: -10,
      marginRight: -12,
    },
  });
