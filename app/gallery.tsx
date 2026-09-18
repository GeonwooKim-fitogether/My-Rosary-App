/**
 * 성화 갤러리 — **아직 만들지 않은 화면의 자리**다 (W3).
 *
 * 왜 빈 화면을 지금 만드나. W2 의 슬라이스 A 는 아래 탭 바 넷을 놓는데, 그중 갤러리는
 * W3 의 화면이라 아직 내용이 없다. 그렇다고 탭만 놓고 목적지를 비워 두면 **눌러도 아무
 * 일이 일어나지 않는 탭**이 되고, 그것은 사용자에게 고장으로 읽힌다. 그래서 "여기는 곧
 * 만들어집니다"라고 말하는 화면 한 장을 놓아, 누른 사람이 자기가 무엇을 눌렀고 왜 아직
 * 비어 있는지 알게 한다.
 *
 * 이 화면에는 새로 정한 값이 없다. 종이색·글자색·서체는 지역의 색 벌
 * (`src/theme/worldTokens.ts`)에서 이름으로 고르고, 크기는 「Classical」 의 기본 계단
 * (`worldType`)을 쓴다. W3 에서 갤러리가 서면 이 파일의 내용이 통째로 바뀐다.
 */
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stringsFor } from '../src/i18n';
import { useAppState } from '../src/state/useAppState';
import { TEXT_SCALE } from '../src/theme/fontScale';
import {
  paletteFor,
  worldFontStack,
  worldType,
  type WorldPalette,
} from '../src/theme/worldTokens';
import { TAB_BAR_HEIGHT, WorldTabBar } from '../src/ui/WorldTabBar';

export default function GalleryScreen() {
  const { settings } = useAppState();
  const insets = useSafeAreaInsets();
  const strings = stringsFor(settings.language);
  const styles = galleryStyles(paletteFor(settings.region), settings.language === 'ko');

  return (
    <View style={styles.screen} testID="gallery-screen">
      <View style={[styles.body, { paddingTop: insets.top + 24, paddingBottom: TAB_BAR_HEIGHT }]}>
        <Text style={styles.title}>{strings.gallery}</Text>
        <Text style={styles.note} testID="gallery-soon">
          곧 만들어집니다.
        </Text>
        <Text style={styles.detail}>
          지역마다 다른 성화를 모아 보고, 마음에 드는 그림을 즐겨찾기에 담거나 전체 화면으로
          감상하는 자리입니다.
        </Text>
      </View>
      <WorldTabBar current="gallery" />
    </View>
  );
}

const galleryStyles = (palette: WorldPalette, isKorean: boolean) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.paper },
    body: { flex: 1, paddingHorizontal: 24, gap: 12 },
    title: {
      fontFamily: worldFontStack('heading', isKorean),
      fontSize: worldType.h3.fontSize * TEXT_SCALE.font,
      lineHeight: worldType.h3.lineHeight * TEXT_SCALE.line,
      letterSpacing: worldType.h3.letterSpacing * TEXT_SCALE.spacing,
      color: palette.ink,
    },
    note: {
      fontFamily: worldFontStack('body', isKorean),
      fontSize: worldType.body.fontSize * TEXT_SCALE.font,
      lineHeight: worldType.body.lineHeight * TEXT_SCALE.line,
      color: palette.ink,
    },
    detail: {
      fontFamily: worldFontStack('body', isKorean),
      fontSize: 13 * TEXT_SCALE.font,
      lineHeight: 13 * 1.6 * TEXT_SCALE.line,
      color: palette.muted,
    },
  });
