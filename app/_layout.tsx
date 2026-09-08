/**
 * 앱의 껍데기 — 글꼴을 갖추고, 저장된 것을 읽어 오고, 낮·밤 벌을 씌운 뒤에 화면을 보여 준다.
 *
 * 글꼴을 번들에 넣고 여기서 불러오는 이유는, v5 시안이 웹에서 구글 폰트를 내려받는
 * 것과 달리 앱은 네트워크가 없어도 같은 글꼴로 떠야 하기 때문이다.
 *
 * M2 에서 둘이 더해졌다. 첫째, **기기에 저장된 여정과 설정을 여기서 한 번 읽는다**
 * (`openApp`). 화면마다 읽으면 같은 것을 여러 번 읽게 되고, 읽는 동안 화면이 빈 목록을
 * 그려 "여정이 없다"고 잘못 말하게 된다. 둘째, **낮 벌과 밤 벌을 갈아 끼우는 `ThemeProvider`**
 * 가 화면 전체를 감싼다.
 */
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { openApp } from '../src/state/appStore';
import { ThemeProvider, useTheme } from '../src/theme';

// 글꼴이 준비되기 전에 화면이 먼저 뜨면 글자가 한 번 튀므로, 그때까지 가림막을 붙든다.
void SplashScreen.preventAutoHideAsync();

/**
 * 본보기 여정을 세우는 손잡이 — 웹 주소의 `?demo=1` (`src/journey/demo.ts`).
 *
 * 실제 사용자는 이 주소를 지나가지 않는다. 화면을 v5 시안과 나란히 놓고 대조하는 사진
 * 시험과 눈 검수에만 쓴다. `?demo=reset` 은 저장된 것을 버리고 처음부터 다시 세운다.
 */
function demoOptions(): { seedDemo?: boolean; reset?: boolean } {
  if (typeof window === 'undefined' || typeof window.location === 'undefined') return {};
  const value = new URLSearchParams(window.location.search).get('demo');
  if (value === 'reset') return { seedDemo: true, reset: true };
  if (value) return { seedDemo: true };
  return {};
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'NotoSerifKR-Regular': require('../assets/fonts/NotoSerifKR-Regular.ttf'),
    'NotoSansKR-Regular': require('../assets/fonts/NotoSansKR-Regular.ttf'),
    'NotoSansKR-Medium': require('../assets/fonts/NotoSansKR-Medium.ttf'),
  });

  // 저장된 여정과 설정을 읽어 온다. 여러 번 불려도 한 번만 연다.
  useEffect(() => {
    void openApp(demoOptions());
  }, []);

  useEffect(() => {
    // 글꼴을 못 읽어도 가림막은 걷는다. 글자 모양이 달라질지언정 앱이 멈추는 것보다 낫다.
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}

/** 화면 껍데기. 벌에 따라 바탕색과 상태 표시줄의 밝기가 함께 바뀐다. */
function Shell() {
  const { colors, mode } = useTheme();
  return (
    <>
      <StatusBar style={mode === 'night' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}
