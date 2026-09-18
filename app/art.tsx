/**
 * B 전체 화면 감상 — 「MyRosary World」 시안의 `data-screen-label="Art View"` 블록을 옮긴
 * 화면 (W3 슬라이스 B).
 *
 * 값(색·크기·간격·문구)은 그 블록에서 그대로 가져왔다. 이 화면만은 **지역 색 벌을 쓰지
 * 않는다** — 시안이 바탕을 `#0d0c0b` 하나로 못 박아 두었고, 그림 한 장을 보는 자리라
 * 지역의 종이색이 끼어들 이유가 없기 때문이다. 그 색들은 `artViewColors` 에 모여 있다.
 *
 * ── 이 화면이 하는 일 셋 ────────────────────────────────────────────────────────
 *
 * 1. **그림을 잘라내지 않고 통째로 보여 준다.** 갤러리의 격자는 3:4 액자에 맞춰 그림을
 *    잘라 담지만(`contentFit="cover"`), 이 화면은 그림 전체를 보는 자리이므로 화면 안에
 *    맞춰 넣는다(`contain`). 그래서 위아래나 좌우에 바탕색이 남는 것이 정상이다.
 * 2. **그림을 누르면 껍데기가 사라졌다 나타난다** (시안의 `toggleViewUi`). 닫기 단추와
 *    아래 띠가 함께 숨고, 그림은 그대로다.
 * 3. **고정을 걸고 푼다.** `고정하기` 를 누르면 `pinArt()` 가 불리고, 그 함수가 성화 뽑기를
 *    다시 열어 **홈의 큰 그림과 기도 화면의 배경이 이 그림이 된다.** 이미 고정된 그림에서
 *    다시 누르면 `unpinArt()` 가 불려 지역 묶음에서 다시 뽑은 그림으로 돌아간다.
 *
 * ── 시안과 다르게 한 자리 넷 (그리고 그 이유) ──────────────────────────────────
 *
 * 1. **껍데기가 숨을 때 아예 사라진다.** 시안은 위아래 껍데기를 `opacity:0` 으로만 숨기는데,
 *    투명해진 단추는 **여전히 눌리고 스크린리더도 여전히 읽는다.** 닫기 단추가 있던 자리를
 *    누르면 보이지 않는 단추가 화면을 닫아 버리고, 사람은 자기가 무엇을 눌렀는지 알지
 *    못한다. 그래서 숨을 때는 그리지 않는다. 시안이 `opacity` 를 고른 까닭은 300ms 동안
 *    부드럽게 사라지게 하려는 것인데, 이 화면은 그 사라짐을 움직임으로 그리지 않으므로
 *    (동작 줄이기를 켠 사람에게는 어차피 즉시 사라져야 한다) 잃는 것이 없다.
 * 2. **닫으면 온 곳으로 돌아간다.** 시안은 `returnTo` 라는 값을 따로 들고 다니며 그 화면
 *    이름으로 간다. 이 앱은 화면이 쌓이는 구조라 **쌓인 것을 한 장 걷어 내면**(`back`)
 *    저절로 온 곳으로 돌아간다 — 갤러리에서 왔으면 갤러리로, 홈에서 왔으면 홈으로.
 *    주소로 이 화면을 곧바로 열어 걷어 낼 것이 없을 때만 홈으로 갈아 끼운다
 *    (`src/navigation/leaveToHome.ts` 가 기도 화면에서 같은 판단을 한다).
 * 3. **아래 띠에 탭 바가 없다.** 시안도 이 화면에서는 탭 바를 감추는데, 이 저장소는 탭 바를
 *    화면마다 놓는 부품으로 두었으므로(`src/ui/WorldTabBar.tsx`) **놓지 않는 것**이 곧
 *    감추는 것이다. 그림 한 장을 보는 자리에 다른 곳으로 가는 길이 넷이나 서 있으면
 *    몰입이 깨지고, 나가는 길은 닫기 단추 하나로 충분하다.
 * 4. **모르는 그림이면 닫기만 남는다.** 시안에는 없는 상태다. 주소로 이 화면을 열면서 표에
 *    없는 번호를 넘기면 그릴 그림이 없는데, 그때 빈 검은 화면만 두면 나갈 길이 사라진다.
 *    그래서 그림 자리는 비우되 닫기 단추는 언제나 그린다.
 */
import { useState } from 'react';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WORLD_PLATES, plateTitle } from '../src/art/worldPlates';
import { stringsFor } from '../src/i18n';
import { pinArt, toggleFavoriteArt, unpinArt } from '../src/state/appStore';
import { useAppState } from '../src/state/useAppState';
import {
  artViewColors,
  koWordBreak,
  worldArtViewType,
  worldFontStack,
} from '../src/theme/worldTokens';
import { Heart } from '../src/ui/Heart';

export default function ArtViewScreen() {
  const params = useLocalSearchParams();
  const { settings, favoriteArt, pinnedArt } = useAppState();
  const insets = useSafeAreaInsets();
  const strings = stringsFor(settings.language);
  const isKorean = settings.language === 'ko';
  const styles = artStyles(isKorean);

  /** 껍데기가 보이나. 시안의 `S.viewUi` 와 같고, 들어올 때는 보인다. */
  const [chromeVisible, setChromeVisible] = useState(true);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const plate = id ? WORLD_PLATES[id] : undefined;

  const name = plate ? plateTitle(plate, settings.language) : '';
  const pinned = plate !== undefined && pinnedArt === plate.file;
  const favorite = plate !== undefined && favoriteArt.includes(plate.file);

  /** 아래 띠의 한 줄 설명 — 시안의 `viewMeta` 그대로(지역 이름, 고정됐으면 그 사실). */
  const meta = `${strings[settings.region]}${pinned ? ` · ${strings.pinned}` : ''}`;

  /** 닫는다. 쌓인 것을 걷어 내고, 걷어 낼 것이 없으면 홈으로 간다 (머리 2번). */
  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  };

  return (
    <View style={styles.screen} testID="art-screen">
      {/* ── 그림 · 누르면 껍데기가 사라졌다 나타난다 ─────────────────── */}
      {plate ? (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setChromeVisible((visible) => !visible)}
          accessibilityRole="imagebutton"
          accessibilityLabel={name}
          /* 표식에 그림의 번호를 싣는다 — 홈과 갤러리가 같은 방식이고, 까닭은 그 자리에 있다. */
          testID={`art-image-${plate.id}`}
        >
          <Image
            source={plate.source}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            accessible={false}
          />
        </Pressable>
      ) : null}

      {/* ── 위 · 닫기 단추 ──────────────────────────────────────────── */}
      {chromeVisible ? (
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            style={styles.closeButton}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={strings.close}
            testID="art-close"
          >
            {/* 시안의 선분을 그대로 옮겼다. */}
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M18 6 6 18M6 6l12 12"
                fill="none"
                stroke={artViewColors.ink}
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>
      ) : null}

      {/* ── 아래 · 이름과 단추 둘 ───────────────────────────────────── */}
      {plate && chromeVisible ? (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 18 }]}>
          {/*
            어두운 그러데이션 띠 — 시안의 `linear-gradient(180deg,transparent,rgba(0,0,0,.7))`.
            React Native 에는 배경 그러데이션이 없으므로 SVG 로 한 장 깔고 그 위에 글을 얹는다.
            홈의 성화 덮개가 같은 방식이다.
          */}
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
            <Defs>
              <LinearGradient id="artBottom" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000000" stopOpacity={0} />
                <Stop offset="1" stopColor="#000000" stopOpacity={0.7} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#artBottom)" />
          </Svg>

          <View style={styles.caption}>
            <Text style={styles.title} numberOfLines={2} testID="art-title">
              {name}
            </Text>
            <Text style={styles.meta} testID="art-meta">
              {meta}
            </Text>
          </View>

          <View style={styles.buttons}>
            <Pressable
              style={styles.roundButton}
              onPress={() => toggleFavoriteArt(plate.file)}
              accessibilityRole="button"
              accessibilityLabel={strings.favorites}
              aria-pressed={favorite}
              testID="art-fav"
            >
              <Heart
                on={favorite}
                color={favorite ? artViewColors.on : artViewColors.ink}
                size={20}
              />
            </Pressable>

            <Pressable
              style={styles.pinButton}
              onPress={() => (pinned ? unpinArt() : pinArt(plate.file))}
              accessibilityRole="button"
              aria-pressed={pinned}
              testID="art-pin"
            >
              <Text style={[styles.pinLabel, pinned ? styles.pinLabelOn : null]}>
                {pinned ? strings.unpin : strings.pin}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const artStyles = (isKorean: boolean) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: artViewColors.backdrop },

    topBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      paddingHorizontal: 8,
      alignItems: 'flex-end',
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: artViewColors.closeFill,
      alignItems: 'center',
      justifyContent: 'center',
    },

    bottomBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingTop: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    caption: { flexShrink: 1, minWidth: 0 },
    title: {
      ...worldArtViewType.title,
      fontFamily: worldFontStack('heading', isKorean),
      color: artViewColors.ink,
      ...koWordBreak,
    },
    /* 시안의 `opacity:.7` 을 색에 녹였다 — 글자 하나에 투명도를 주면 웹에서 그림자까지 흐려진다. */
    meta: { ...worldArtViewType.meta, color: 'rgba(244,236,220,.7)', marginTop: 2 },

    buttons: { flexDirection: 'row', gap: 6, flexShrink: 0 },
    roundButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: artViewColors.buttonBorder,
      backgroundColor: artViewColors.buttonFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pinButton: {
      height: 44,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: artViewColors.buttonBorder,
      backgroundColor: artViewColors.buttonFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pinLabel: { ...worldArtViewType.pinLabel, color: artViewColors.ink },
    pinLabelOn: { color: artViewColors.on },
  });
