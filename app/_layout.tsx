/**
 * 앱의 껍데기 — 글꼴을 갖춘 뒤에 화면을 보여 준다.
 *
 * 글꼴을 번들에 넣고 여기서 불러오는 이유는, v5 시안이 웹에서 구글 폰트를 내려받는
 * 것과 달리 앱은 네트워크가 없어도 같은 글꼴로 떠야 하기 때문이다.
 */
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../src/theme';

// 글꼴이 준비되기 전에 화면이 먼저 뜨면 글자가 한 번 튀므로, 그때까지 가림막을 붙든다.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'NotoSerifKR-Regular': require('../assets/fonts/NotoSerifKR-Regular.ttf'),
    'NotoSansKR-Regular': require('../assets/fonts/NotoSansKR-Regular.ttf'),
    'NotoSansKR-Medium': require('../assets/fonts/NotoSansKR-Medium.ttf'),
  });

  useEffect(() => {
    // 글꼴을 못 읽어도 가림막은 걷는다. 글자 모양이 달라질지언정 앱이 멈추는 것보다 낫다.
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}
