/**
 * 아래 탭 바 넷 — 「MyRosary World」 시안의 `<nav aria-label="main">` 블록을 옮긴 것이다.
 *
 * 값(칸 넷·바탕·괘선·아이콘·글자 크기)은 시안의 그 블록과 `navDefs` 배열에서 그대로 왔다.
 * 아이콘의 선분은 `navDefs` 의 세 번째 칸에 적힌 SVG 조각을 글자 하나 바꾸지 않고 옮긴 것이다.
 *
 * ── 왜 expo-router 의 `Tabs` 가 아니라 부품 하나인가 ──────────────────────────────
 *
 * expo-router 의 탭 항법으로 가려면 화면 파일들을 `(tabs)` 묶음으로 옮겨야 하는데, 그러면
 * 지금 도는 주소(`/home` · `/settings` · `/journey`)가 전부 바뀌고 그 주소로 서 있는 시험
 * 서른셋이 함께 흔들린다. W2 의 슬라이스 A 가 할 일은 **탭으로 네 화면을 오갈 수 있게 하는
 * 것**이지 항법 구조를 갈아 끼우는 것이 아니므로, 화면마다 이 부품을 한 줄 놓는 쪽을 택했다.
 *
 * ── 옮겨 갈 때 화면을 어떻게 갈아 끼우나 (실측으로 정한 규칙) ──────────────────
 *
 * 화면은 쌓인다. 탭을 누를 때마다 그냥 한 장 얹으면(`push`) 홈·설정·홈·설정… 이 끝없이
 * 포개지고, 눈으로는 보이지 않는다 — 맨 위 한 장만 보이기 때문이다.
 *
 * 처음에는 `router.navigate` 를 썼다. 이름대로라면 가려는 화면이 이미 쌓여 있을 때 그 자리로
 * 되감아야 하는데, **이 판(expo-router 57)에서는 되감지 않고 한 장 더 얹었다.** 탭을 세 번
 * 오간 뒤 홈이 두 장 세어지는 것을 e2e 가 잡아 확인한 사실이다(2026-09-18). 같은 갈래의
 * 실측이 `src/navigation/leaveToHome.ts` 에도 적혀 있다 — `replace` 와 `dismissTo` 역시
 * 이 판에서는 기대와 다르게 돌았다.
 *
 * 그래서 되감기를 이름에 맡기지 않고 **탭 화면이 홈 위에 언제나 한 장만 있게** 직접 정한다.
 *
 * 1. 홈으로 갈 때는 그 한 장을 걷어 낸다 (`back`). 걷어 낼 것이 없으면 홈으로 갈아 끼운다.
 * 2. 홈에서 다른 탭으로 갈 때는 한 장 얹는다 (`push`).
 * 3. 탭에서 다른 탭으로 갈 때는 그 한 장을 갈아 끼운다 (`replace`).
 *
 * 이렇게 하면 쌓이는 화면이 세 장(로그인 · 홈 · 탭 화면)을 넘지 않고, 설정과 여정 상세의
 * `닫기` · `돌아가기`(둘 다 `router.back()` 이다)가 언제나 홈으로 떨어진다. 실제로 그런지는
 * `e2e/tabs.spec.ts` 가 탭을 여섯 번 오간 뒤 홈과 설정이 한 장씩인지 세어 확인한다.
 *
 * ── 색을 고를 때의 한 가지 판단 ───────────────────────────────────────────────
 *
 * 시안은 지금 서 있는 탭을 `accent` 로, 나머지를 `muted` 로 칠한다. 그런데 `accent` 는 밝은
 * 종이 위에서 대비가 2.26~2.94 라 11px 글자가 읽히지 않는다(`decisions.md` Q-51). 그래서
 * 지금 탭은 **글자에 쓰는 짙은 짝(`accentText`)** 으로 칠한다. 아이콘까지 같은 색으로 칠하는
 * 것은 이 저장소의 판단이다 — 규칙대로라면 그림 요소인 아이콘은 `accent` 를 그대로 써도
 * 되지만, 한 탭 안에서 아이콘과 글자가 다른 색으로 갈리면 하나의 단추로 읽히지 않는다.
 */
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stringsFor } from '../i18n';
import { useAppState } from '../state/useAppState';
import { TEXT_SCALE } from '../theme/fontScale';
import { paletteFor, worldFontStack, type WorldPalette } from '../theme/worldTokens';

/** 탭 넷의 이름. 시안의 `navDefs` 첫 칸과 같다. */
export type TabKey = 'home' | 'gallery' | 'journeys' | 'settings';

/** 탭이 가는 곳. 시안은 화면 이름 하나로 오갔지만 이 앱은 주소가 있다. */
const TAB_ROUTE: Record<TabKey, '/home' | '/gallery' | '/journey' | '/settings'> = {
  home: '/home',
  gallery: '/gallery',
  // 여정 탭은 **지금 있는 여정 상세 화면**으로 간다. 그 화면은 주소에 여정 번호가 없으면
  // 첫 여정을 편다(`app/journey.tsx`). 그 화면을 시안의 어법으로 옮기는 일은 W3 이다.
  journeys: '/journey',
  settings: '/settings',
};

/** 탭 넷의 차례. 시안의 `navDefs` 순서 그대로다. */
const TAB_ORDER: readonly TabKey[] = ['home', 'gallery', 'journeys', 'settings'];

/**
 * 탭 바가 차지하는 높이 — 화면이 글을 이 높이만큼 띄워 놓아야 마지막 줄이 가리지 않는다.
 * 시안의 `padding:6px 0 calc(env(safe-area-inset-bottom) + 6px)` 와 칸의 `min-height:52px`.
 */
export const TAB_BAR_HEIGHT = 6 + 52 + 6;

/** 아이콘 하나 — 시안 `navDefs` 의 선분을 그대로 옮겼다. 22×22, 선 굵기 1.5. */
function TabIcon({ tab, color }: { tab: TabKey; color: string }) {
  const common = {
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      {tab === 'home' ? (
        <>
          <Path d="M3 10.5 12 3l9 7.5" {...common} />
          <Path d="M5 9.5V21h14V9.5" {...common} />
        </>
      ) : null}
      {tab === 'gallery' ? (
        <>
          <Rect x={3} y={4} width={18} height={16} rx={1} {...common} />
          <Circle cx={9} cy={10} r={1.6} {...common} />
          <Path d="m21 16-5-5-9 9" {...common} />
        </>
      ) : null}
      {tab === 'journeys' ? (
        <>
          <Circle cx={6} cy={19} r={2.5} {...common} />
          <Circle cx={18} cy={5} r={2.5} {...common} />
          <Path d="M8.5 19h6a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7h6" {...common} />
        </>
      ) : null}
      {tab === 'settings' ? (
        <>
          <Path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" {...common} />
          <Circle cx={15} cy={6} r={2} {...common} />
          <Circle cx={9} cy={12} r={2} {...common} />
          <Circle cx={17} cy={18} r={2} {...common} />
        </>
      ) : null}
    </Svg>
  );
}

export function WorldTabBar({ current }: { current: TabKey }) {
  const { settings } = useAppState();
  const insets = useSafeAreaInsets();
  const palette = paletteFor(settings.region);
  const strings = stringsFor(settings.language);
  const styles = tabStyles(palette, settings.language === 'ko');

  const label: Record<TabKey, string> = {
    home: strings.home,
    gallery: strings.gallery,
    journeys: strings.journeys,
    settings: strings.settings,
  };

  return (
    <View
      style={[styles.bar, { paddingBottom: insets.bottom + 6 }]}
      accessibilityRole="menubar"
      accessibilityLabel="주요 화면"
      testID="tab-bar"
    >
      {TAB_ORDER.map((tab) => {
        const here = tab === current;
        const color = here ? palette.accentText : palette.muted;
        return (
          <Pressable
            key={tab}
            style={styles.item}
            onPress={() => {
              if (here) return;
              if (tab === 'home') {
                if (router.canGoBack()) router.back();
                else router.replace('/home');
                return;
              }
              if (current === 'home') router.push(TAB_ROUTE[tab]);
              else router.replace(TAB_ROUTE[tab]);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: here }}
            testID={`tab-${tab}`}
          >
            <TabIcon tab={tab} color={color} />
            <Text style={[styles.label, { color }]}>{label[tab]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * 값의 출처는 시안의 `<nav>` 인라인 스타일 하나다 — 칸 넷, 종이색 94%, 위 괘선 1px,
 * 칸 높이 52, 아이콘과 글자 사이 3, 글자 11px 에 자간 .04em.
 *
 * 시안의 `backdrop-filter:blur(8px)` 는 옮기지 않았다. React Native 에 같은 속성이 없고,
 * 바탕을 94% 가 아니라 꽉 채우면 흐림 없이도 글이 비치지 않는다.
 */
const tabStyles = (palette: WorldPalette, isKorean: boolean) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: palette.paper,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,.14)',
      paddingTop: 6,
    },
    item: {
      flex: 1,
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    },
    label: {
      fontFamily: worldFontStack('body', isKorean),
      fontSize: 11 * TEXT_SCALE.font,
      lineHeight: 11 * 1.25 * TEXT_SCALE.line,
      letterSpacing: 11 * 0.04 * TEXT_SCALE.spacing,
    },
  });
