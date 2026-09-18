/**
 * 「홈 화면에 추가」 — 이 브라우저에서 앱을 놓는 길이 어떤 모양인지 가려내는 자리 (W4 슬라이스 A).
 *
 * ── 왜 한 가지 길로 끝나지 않나 ────────────────────────────────────────────────
 *
 * 폰 브라우저마다 "홈 화면에 놓기" 를 여는 방법이 다르고, **그 차이가 단추를 놓을 수 있느냐
 * 없느냐를 가른다.** 2026-09-18 에 문서를 확인해 정리한 것이 아래 표다.
 *
 * | 어디 | 앱이 설치 창을 띄울 수 있나 | 그래서 이 줄이 하는 일 |
 * |---|---|---|
 * | 안드로이드 크롬 계열 | **있다** — 브라우저가 `beforeinstallprompt` 라는 사건을 먼저 보내 주고, 그것을 붙들어 두었다가 사람이 누를 때 띄운다 | 누르면 **진짜 설치 창**이 뜬다 |
 * | iOS 사파리·크롬 (전부 웹킷) | **없다** — 애플은 그 사건을 보내지 않는다. 사람이 공유 단추에서 직접 골라야 한다 | 누르면 **어떻게 하는지 알려 주는 시트**가 뜬다 |
 * | 그 밖의 브라우저 (파이어폭스 등) | 없거나 제각각 | 위와 같다 — 브라우저 차림표로 안내한다 |
 * | iOS·안드로이드 **앱** (스토어로 받은 것) | 해당 없다 | **줄을 아예 놓지 않는다** — 이미 앱이라 홈 화면에 놓을 것이 없다 |
 *
 * 여기서 이 저장소가 지킨 것 하나를 분명히 적어 둔다. **되지 않는 곳에 눌리는 단추를 두지
 * 않는다.** 그렇다고 iOS 에서 줄을 지우지도 않았다 — 지우면 iOS 사용자는 이 앱을 홈 화면에
 * 놓을 수 있다는 사실 자체를 모른다. 그래서 iOS 에서는 단추가 **설치를 하는 것이 아니라
 * 방법을 알려 주는 것**이 되고, 누르면 언제나 무엇인가가 일어난다.
 *
 * ── 왜 화면이 아니라 이 파일이 사건을 붙드나 ───────────────────────────────────
 *
 * `beforeinstallprompt` 는 **화면이 뜨자마자, 사람이 설정에 들어오기 훨씬 전에** 온다. 설정
 * 화면이 열릴 때 비로소 귀를 기울이면 그 사건은 이미 지나간 뒤다. 이 파일은 묶음이 처음
 * 실행될 때 귀를 기울여 두고 붙들어 둔 것을 나중에 화면에 건넨다.
 *
 * ── 처음 그리는 값이 왜 「모른다」에서 시작하나 ────────────────────────────────
 *
 * 웹 빌드는 화면을 **미리 한 번 그려 html 로 찍어 둔다.** 그 자리에는 브라우저도 창도 없어
 * 무엇이 되는지 알 수 없다. 찍어 둔 글자와 브라우저가 처음 그린 글자가 다르면 리액트가
 * 어긋남을 알리므로, 처음에는 양쪽 모두 **아무것도 모르는 값**으로 그리고 화면이 붙은 뒤에
 * (`useEffect`) 실제로 재서 고쳐 그린다.
 */
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/** 이 브라우저에서 홈 화면에 놓는 길의 모양. */
export type InstallGuide = 'ios' | 'browser';

/** 화면에 이 줄을 놓아도 되는 표면인가. 스토어로 받은 앱에는 놓을 것이 없다. */
export const installRowSupported = Platform.OS === 'web';

/** 화면이 읽어 가는 지금 상태. */
export interface HomeScreenInstall {
  /** 누르면 진짜 설치 창이 뜨는가. */
  canPrompt: boolean;
  /** 설치 창이 없을 때 어떤 방법을 알려 줄 것인가. */
  guide: InstallGuide;
  /** 이미 홈 화면에서 열고 있는가. */
  installed: boolean;
}

/** 아직 아무것도 재지 않은 값. 미리 찍는 자리와 브라우저의 첫 그림이 이것으로 같아진다. */
const UNMEASURED: HomeScreenInstall = { canPrompt: false, guide: 'browser', installed: false };

/**
 * 브라우저가 건네는 설치 사건. 표준 타입에 없어 여기서 좁게 적는다 — 쓰는 것은 둘뿐이다.
 */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** 붙들어 둔 설치 사건. 한 번 쓰면 브라우저가 다시 주기 전까지 없다. */
let captured: InstallPromptEvent | null = null;
const watchers = new Set<() => void>();

function tellWatchers(): void {
  for (const watcher of watchers) watcher();
}

if (installRowSupported && typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    // 막지 않으면 브라우저가 제 시각에 제 창을 띄운다. 우리는 사람이 누를 때 띄우고 싶다.
    event.preventDefault();
    captured = event as InstallPromptEvent;
    tellWatchers();
  });
  // 설치가 끝나면 붙들어 둔 것은 쓸모가 없다. 줄의 글도 「이미 놓여 있다」로 바뀌어야 한다.
  window.addEventListener('appinstalled', () => {
    captured = null;
    tellWatchers();
  });
}

/**
 * 사용자 문자열을 보고 iOS 인지 가른다.
 *
 * `touchPoints` 를 함께 받는 까닭은 **아이패드가 자기를 맥이라고 말하기 때문**이다(iPadOS 13
 * 부터). 맥에는 손가락이 닿는 화면이 없으므로, 맥이라고 말하면서 손가락 자리가 둘 이상이면
 * 아이패드로 본다. 이 값은 `navigator.maxTouchPoints` 다.
 */
export function installGuideFor(userAgent: string, touchPoints = 0): InstallGuide {
  if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
  if (/Macintosh/.test(userAgent) && touchPoints > 1) return 'ios';
  return 'browser';
}

/**
 * 지금 홈 화면에서 열고 있는가.
 *
 * 두 가지를 본다. 표준은 「띄우는 모양이 standalone 인가」이고, iOS 사파리는 그 표준을 늦게
 * 받아들여 `navigator.standalone` 이라는 자기 값을 따로 둔다. 둘 중 하나면 놓여 있는 것이다.
 */
export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const legacy = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  if (legacy === true) return true;
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(display-mode: standalone)').matches
    : false;
}

/** 지금 이 순간을 실제로 재서 한 벌로 만든다. 브라우저가 있을 때만 부른다. */
function measure(): HomeScreenInstall {
  return {
    canPrompt: captured !== null,
    guide: installGuideFor(window.navigator.userAgent, window.navigator.maxTouchPoints ?? 0),
    installed: isStandaloneDisplay(),
  };
}

/**
 * 붙들어 둔 설치 창을 띄운다.
 *
 * @returns 무슨 일이 있었나. `unavailable` 은 띄울 창이 없었다는 뜻이며, 부르는 쪽은 그때
 *   방법을 알려 주는 시트를 연다.
 */
export async function promptHomeScreenInstall(): Promise<
  'accepted' | 'dismissed' | 'unavailable'
> {
  const event = captured;
  if (!event) return 'unavailable';
  /*
    띄우기 전에 손에서 놓는다. 이 사건은 **한 번만 쓸 수 있고**, 놓지 않으면 사람이 창을
    닫은 뒤에도 줄이 계속 "누르면 설치됩니다" 라고 말한다. 두 번째 누름은 브라우저가 거절한다.
  */
  captured = null;
  tellWatchers();
  await event.prompt();
  const choice = await event.userChoice;
  return choice.outcome;
}

/** 설정 화면이 읽어 가는 손잡이. */
export function useHomeScreenInstall(): HomeScreenInstall {
  const [state, setState] = useState<HomeScreenInstall>(UNMEASURED);

  useEffect(() => {
    if (!installRowSupported || typeof window === 'undefined') return;
    const read = () => setState(measure());
    read();
    watchers.add(read);
    return () => {
      watchers.delete(read);
    };
  }, []);

  return state;
}
