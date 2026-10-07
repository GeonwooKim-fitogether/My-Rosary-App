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
 *
 * W1 에서 셋째가 더해졌다. **안전 영역을 재는 `SafeAreaProvider`** 가 가장 바깥에 선다.
 * 안전 영역(safe area)이란 노치·홈 인디케이터·상태 표시줄에 가리지 않는 화면의 속살을
 * 말하며, 시안은 기도 화면의 머리를 `env(safe-area-inset-top) + 6` 으로 잡는다. 그 값을
 * 읽으려면 이 공급자가 화면보다 위에 서 있어야 한다 — 없으면 `useSafeAreaInsets()` 가
 * 어디서도 값을 얻지 못한다. 웹에서는 네 변이 모두 0 이라 시안과 같은 6px 이 되고, 노치가
 * 있는 기기에서만 그만큼 내려온다.
 */
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { syncDocumentLanguage } from '../src/i18n/documentLanguage';
import { openApp } from '../src/state/appStore';
import { useAppState } from '../src/state/useAppState';
import { createIntroSeenStore } from '../src/storage/introSeen';
import { ThemeProvider, useTheme } from '../src/theme';
import { AboutSheet } from '../src/ui/AboutSheet';

// 글꼴이 준비되기 전에 화면이 먼저 뜨면 글자가 한 번 튀므로, 그때까지 가림막을 붙든다.
void SplashScreen.preventAutoHideAsync();

/**
 * 본보기 여정을 세우는 손잡이 — 웹 주소의 `?demo=1` (`src/journey/demo.ts`).
 *
 * 실제 사용자는 이 주소를 지나가지 않는다. 화면을 v5 시안과 나란히 놓고 대조하는 사진
 * 시험과 눈 검수에만 쓴다. `?demo=reset` 은 저장된 것을 버리고 처음부터 다시 세운다.
 */
function demoOptions(): { seedDemo?: boolean; reset?: boolean; artSeed?: number } {
  if (typeof window === 'undefined' || typeof window.location === 'undefined') return {};
  const query = new URLSearchParams(window.location.search);
  const artSeed = artSeedOf(query.get('art'));
  const value = query.get('demo');
  if (value === 'reset') return { seedDemo: true, reset: true, artSeed };
  if (value) return { seedDemo: true, artSeed };
  return { artSeed };
}

/**
 * 성화 뽑기의 씨앗 — 웹 주소의 `?art=<숫자>` (`decisions.md` Q-57).
 *
 * 뽑기가 난수라 화면 사진을 다시 찍을 때마다 그림이 달라져, 아무것도 고치지 않아도 사진
 * 커밋에 뜻 없는 변경이 섞였다. 이 손잡이를 주면 순서가 언제나 같아진다. 쓰는 곳은 사진을
 * 찍는 e2e 하나뿐이고(`e2e/screenshots.spec.ts`), 실제 사용자는 이 주소를 지나가지 않는다 —
 * `?demo=1` 과 같은 성격의 진단용 손잡이다. 숫자가 아니면 없는 것으로 본다.
 */
function artSeedOf(value: string | null): number | undefined {
  if (value === null) return undefined;
  const seed = Number(value);
  return Number.isFinite(seed) ? seed : undefined;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'NotoSerifKR-Regular': require('../assets/fonts/NotoSerifKR-Regular.ttf'),
    'NotoSansKR-Regular': require('../assets/fonts/NotoSansKR-Regular.ttf'),
    'NotoSansKR-Medium': require('../assets/fonts/NotoSansKR-Medium.ttf'),
    // 새 시안(결정 11)이 쓰는 라틴 글꼴 둘. 한글은 위의 명조를 그대로 쓴다.
    // 이름은 `src/theme/worldTokens.ts` 의 `worldFonts` 와 글자 하나까지 같아야 한다.
    'CormorantGaramond-Regular': require('../assets/fonts/CormorantGaramond-Regular.ttf'),
    'CormorantGaramond-SemiBold': require('../assets/fonts/CormorantGaramond-SemiBold.ttf'),
    'Lora-Regular': require('../assets/fonts/Lora-Regular.ttf'),
    'Lora-SemiBold': require('../assets/fonts/Lora-SemiBold.ttf'),
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
    <SafeAreaProvider>
      <ThemeProvider>
        <Shell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/**
 * 화면 껍데기. 벌에 따라 바탕색과 상태 표시줄의 밝기가 함께 바뀐다.
 *
 * W4 에서 둘이 더해졌다. 첫째, **문서의 언어를 앱의 언어와 묶는다**(슬라이스 B) — 웹에서
 * `<html lang>` 을 고쳐 쓰는 일이며, 까닭은 `src/i18n/documentLanguage.ts` 가 적는다.
 * 화면 하나가 아니라 여기서 부르는 이유는, 언어가 어느 화면에서 바뀌든(지역·언어 화면 ·
 * 기록 들여오기) 이 한 곳이 그것을 받기 때문이다. 둘째, **소개 시트가 처음 한 번 뜬다**
 * (슬라이스 C) — 아래 `IntroGate`.
 */
function Shell() {
  const { colors, mode } = useTheme();
  const { settings } = useAppState();

  // 앱이 켜질 때 한 번, 그리고 언어가 바뀔 때마다.
  useEffect(() => {
    syncDocumentLanguage(settings.language);
  }, [settings.language]);

  return (
    <>
      <StatusBar style={mode === 'night' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
      <IntroGate />
    </>
  );
}

/** 소개를 본 적이 있는지 적어 두는 자리. 모듈 하나만 만들어 두고 함께 쓴다. */
const introSeenStore = createIntroSeenStore(AsyncStorage);

/**
 * 소개 시트(S7)를 **처음 여는 사람에게 한 번만** 띄운다 (W4 슬라이스 C).
 *
 * ── 왜 화면 안이 아니라 껍데기에 두나 ────────────────────────────────────────
 *
 * 처음 여는 사람이 어느 화면에 서 있을지를 이 부품이 알 필요가 없기 때문이다. 지금은 첫
 * 화면이 로그인이지만 그 화면은 계정이 돌아오는 V1.5 에 바뀔 수 있고, 설치형 웹앱은 홈
 * 화면에 놓인 아이콘이 어느 주소로 열릴지도 사람이 정한다. 껍데기에 두면 **어느 화면으로
 * 들어오든 소개가 한 번 뜬다.**
 *
 * ── 언제 뜨고 언제 사라지나 ─────────────────────────────────────────────────
 *
 * 기기에 적힌 것을 한 번 읽어 보고(`introSeenStore.load`), 본 적이 없으면 띄운다. 읽는 동안은
 * 아무것도 띄우지 않는다 — 값을 모르는 채로 띄웠다가 곧 걷으면 화면이 한 번 번쩍인다.
 *
 * **닫는 순간 본 것으로 적는다.** 머리의 `닫기` 를 누르든, 판 바깥의 어두운 자리를 누르든,
 * 맨 아래 `시작하기` 를 누르든 같다. 읽지 않고 곧바로 닫아도 다시 뜨지 않으며, 그것이
 * "건너뛸 수 있다" 의 뜻이다 — 기도하러 온 사람을 이 글로 막지 않는다. 다시 보고 싶은
 * 사람은 설정의 `소개` 줄에서 언제든 같은 글을 연다.
 */
function IntroGate() {
  // `null` 은 "아직 기기에서 읽어 오는 중" 이라는 뜻이다.
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    void introSeenStore.load().then((value) => {
      if (alive) setSeen(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (seen !== false) return null;
  return (
    <AboutSheet
      visible
      firstRun
      testID="sheet-intro"
      onClose={() => {
        setSeen(true);
        void introSeenStore.markSeen();
      }}
    />
  );
}
