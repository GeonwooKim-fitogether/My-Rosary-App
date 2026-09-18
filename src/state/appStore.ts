/**
 * 앱이 들고 있는 것 하나 — 여정 목록과 설정, 그리고 성화 둘(고정한 그림 · 즐겨찾기 목록).
 *
 * 성화 둘은 W3 슬라이스 B 에서 들어왔다. 그전까지 고정한 그림은 이 파일 안의 모듈 변수였고
 * 즐겨찾기는 아예 없었는데, 갤러리와 감상 화면이 **그 값 자체를 그리게 되면서** 화면이
 * 구독할 수 있는 자리로 옮겨 왔다. 까닭은 아래 `AppState` 의 그 칸에 적혀 있다.
 *
 * 화면 다섯이 같은 여정 목록을 본다(홈 · 새 기도 · 여정 상세 · 여정 완주 · 기도). 그래서
 * 상태를 화면 안에 두지 않고 여기 한 곳에 두고, 화면은 `useAppState()` 로 구독만 한다.
 * 리액트의 `useSyncExternalStore` 를 쓰므로 화면 밖(예: 저장소를 읽어 오는 비동기 흐름)에서
 * 값이 바뀌어도 화면이 따라온다.
 *
 * **바뀔 때마다 곧바로 기기에 저장한다.** 기도 자리를 알마다 저장하는 것과 같은 태도이며
 * (FR-17), 저장에 실패해도 앱은 멈추지 않는다 — 잃는 것은 다음에 열었을 때의 기억뿐이다.
 *
 * 상태를 화면 밖에 두는 값은 여기서 끝이다. **여정 하나 안의 기도 진행(어느 알까지 왔나)은
 * 여기 없다** — 그것은 기도 화면이 열려 있는 동안만 살아 있고 `storage/position.ts` 가
 * 따로 기억한다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureArtSession } from '../art/current';
import type { JourneyFormat, JourneyPhase, RecitationMode } from '../domain/types';
import { demoJourney } from '../journey/demo';
import type { Journey } from '../journey/session';
import { rolledDays, withTodayPrayed } from '../journey/rules';
import { setHapticEnabled } from '../prayer/channels';
import { createJourneyStore } from '../storage/journeys';
import { createFavoriteArtStore, toggleFavorite } from '../storage/favoriteArt';
import { createPinnedArtStore, LAST_ART_KEY } from '../storage/pinnedArt';
import {
  createSettingsStore,
  DEFAULT_SETTINGS,
  type AppSettings,
} from '../storage/settings';
import type { RegionKey } from '../theme/worldTokens';

const journeyStore = createJourneyStore(AsyncStorage);
const settingsStore = createSettingsStore(AsyncStorage);
const pinnedArtStore = createPinnedArtStore(AsyncStorage);
const favoriteArtStore = createFavoriteArtStore(AsyncStorage);
/** 바로 앞에 보여 준 성화의 이름 — 같은 그림이 두 번 이어 나오지 않게 하는 데 쓴다. */
const lastArtStore = createPinnedArtStore(AsyncStorage, LAST_ART_KEY);

export interface AppState {
  /** 저장소를 한 번 읽어 왔나. 읽기 전에는 화면이 빈 목록을 그리지 않고 기다린다. */
  ready: boolean;
  journeys: Journey[];
  settings: AppSettings;
  /**
   * 고정한 성화의 파일 이름. 고정한 적이 없으면 null 이다 (W3 슬라이스 B).
   *
   * **W2 까지 이 값은 이 파일 안의 모듈 변수였다.** 그때는 화면이 볼 일이 없었기 때문이다 —
   * 화면이 보는 것은 뽑기가 내어 주는 그림이지 그 그림을 고른 재료가 아니었다. 그런데
   * 갤러리와 감상 화면은 **재료 자체를 그린다**: 격자의 어느 칸에 `고정됨` 표를 얹을지,
   * 감상 화면의 단추가 `고정하기` 인지 `고정 해제` 인지가 이 값으로 갈린다. 모듈 변수는
   * 구독할 수 없어 값이 바뀌어도 화면이 다시 그려지지 않으므로, 상태로 끌어올렸다.
   */
  pinnedArt: string | null;
  /** 즐겨찾기에 담은 성화들의 파일 이름 (W3 슬라이스 B · `src/storage/favoriteArt.ts`). */
  favoriteArt: string[];
}

let state: AppState = {
  ready: false,
  journeys: [],
  settings: { ...DEFAULT_SETTINGS },
  pinnedArt: null,
  favoriteArt: [],
};
const listeners = new Set<() => void>();

export function getAppState(): AppState {
  return state;
}

export function subscribeApp(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function publish(next: AppState): void {
  state = next;
  for (const listener of listeners) listener();
}

function persistJourneys(journeys: readonly Journey[]): void {
  void journeyStore.save(journeys);
}

/** 여정 목록을 갈아 끼우고 저장한다. */
function setJourneys(journeys: Journey[]): void {
  publish({ ...state, journeys });
  persistJourneys(journeys);
}

let opening: Promise<void> | null = null;

export interface OpenOptions {
  /** 기준 날짜. 시험이 날짜를 돌릴 때 넘긴다. */
  today?: Date;
  /** 여정이 하나도 없으면 본보기 여정을 세운다 (`?demo=1` 손잡이). */
  seedDemo?: boolean;
  /** 저장된 것을 모두 버리고 다시 시작한다 (`?demo=reset`). */
  reset?: boolean;
  /** 성화 뽑기의 씨앗 (`?art=<숫자>` 손잡이 · `decisions.md` Q-57). */
  artSeed?: number;
}

/* ── 성화 뽑기에만 쓰이는 값 둘 (W2 슬라이스 C) ───────────────────────────────────
   화면에 그려지는 값이 아니라 뽑기에만 쓰이는 값이라 `AppState` 에 넣지 않았다. 상태에
   넣으면 아무도 구독하지 않는 칸이 늘고, 화면은 그 값을 볼 일이 없다 — 화면이 보는 것은
   뽑기가 내어 주는 **그림**이지 그 그림을 고른 재료가 아니다.

   **셋이었다가 둘이 됐다.** 고정한 성화만은 W3 슬라이스 B 에서 `AppState` 로 올라갔다 —
   갤러리와 감상 화면이 그 값 자체를 그리기 때문이며, 까닭은 그 칸의 주석에 있다. ──── */

/** 바로 앞에 보여 준 성화의 파일 이름. */
let lastArt: string | null = null;
/** 씨앗. 사진을 찍는 e2e 만 넘긴다. */
let artSeed: number | undefined;

/**
 * 성화 뽑기를 다시 연다. 부르는 자리는 셋뿐이다 — 앱을 열 때, 지역을 바꿀 때,
 * 성화를 고정하거나 고정을 풀 때. 셋 다 기도 화면 밖이므로 "기도 중에는 바뀌지 않는다"가
 * 지켜진다.
 *
 * 고정한 그림을 **인자로 받는** 이유를 적어 둔다. 이 값은 이제 `AppState` 에 있는데, 앱을
 * 열 때는 아직 그 상태가 발행되기 전에 뽑기를 열어야 한다(뽑기가 열려야 첫 화면이 그림을
 * 물을 수 있다). 부르는 쪽이 자기가 아는 값을 넘기게 하면 "상태에 있는 값"과 "아직 발행되지
 * 않은 값"을 가르는 일이 없어진다.
 *
 * **기억하는 일이 끝날 때까지 기다릴 수 있게 약속을 돌려준다.** 앱을 열 때만 그 약속을
 * 기다린다 — 기다리지 않으면 앱을 열자마자 다시 여는 경우(화면 새로 고침)에 기억이 아직
 * 기기에 닿지 않아, "연속으로 같은 그림이 두 번 나오지 않는다"가 가끔만 지켜진다. 실제로
 * 그 어긋남이 화면 사진에서 먼저 드러났다 — 같은 시험을 두 번 돌렸는데 여정 완주 화면의
 * 성화가 달랐다(2026-09-18 실측).
 */
function reopenArt(region: RegionKey, pinned: string | null): Promise<void> {
  artSeedInUse = artSeed ?? null;
  /*
   * 씨앗이 걸려 있으면 **직전 그림 피하기를 끈다.**
   *
   * 씨앗은 순서를 고정하지만, 피하기는 기기에 기억된 직전 그림을 읽어 그 순서의 첫 자리를
   * 한 칸 밀어낸다. 그 기억이 기기에 닿는 시점이 화면을 다시 여는 속도에 따라 갈리므로,
   * 씨앗을 물려도 사진이 돌릴 때마다 달라지는 자리가 남았다 — 여정 완주와 이어서 바치는
   * 홈 석 장이 그랬다(2026-09-18 실측, `decisions.md` Q-57).
   *
   * 씨앗이 있다는 것은 "지금은 재현이 목적"이라는 뜻이므로 피하기를 끄는 것이 옳다.
   * 실제 사용자에게는 씨앗이 걸리지 않으므로 피하기가 그대로 산다.
   */
  const avoid = artSeed === undefined ? lastArt : null;
  const first = configureArtSession({ region, pinned, avoid, seed: artSeed });
  if (!first) return Promise.resolve();
  lastArt = first.file;
  return lastArtStore.save(first.file);
}

/**
 * 저장소를 읽어 앱을 연다. 여러 번 불려도 한 번만 연다.
 *
 * 읽어 온 여정은 곧바로 **달력에 맞춰 다시 칠한다**(`rolledDays`). 앱을 며칠 안 켰으면
 * 그 며칠이 못 바친 날로 남고 오늘 칸이 오늘로 옮겨 온다. 이 한 줄이 "앱을 안 켠 날에도
 * 날짜는 흐른다"를 지키는 자리다.
 */
export function openApp(options: OpenOptions = {}): Promise<void> {
  if (opening) return opening;
  opening = (async () => {
    const today = options.today ?? new Date();
    let journeys = options.reset ? [] : await journeyStore.load();
    const settings = options.reset ? { ...DEFAULT_SETTINGS } : await settingsStore.load();

    if (journeys.length === 0 && options.seedDemo) journeys = [demoJourney(today)];

    // 성화 뽑기를 이 지역의 묶음으로 연다. 고정한 그림과 지난번 그림을 먼저 읽어야
    // "고정한 것이 있으면 그것"과 "같은 것이 두 번 이어 나오지 않는다"가 성립한다.
    artSeed = options.artSeed;
    const pinnedArt = options.reset ? null : await pinnedArtStore.load();
    const favoriteArt = options.reset ? [] : await favoriteArtStore.load();
    lastArt = options.reset ? null : await lastArtStore.load();
    await reopenArt(settings.region, pinnedArt);
    setHapticEnabled(settings.haptic);

    const rolled = journeys.map((journey) => ({ ...journey, days: rolledDays(journey, today) }));
    publish({ ready: true, journeys: rolled, settings, pinnedArt, favoriteArt });
    persistJourneys(rolled);
    if (options.reset) void settingsStore.save(settings);
  })();
  return opening;
}

/** 시험이 앱을 여러 번 열 수 있게 문을 다시 잠근다. 화면 코드는 쓰지 않는다. */
export function resetAppStateForTest(): void {
  opening = null;
  state = {
    ready: false,
    journeys: [],
    settings: { ...DEFAULT_SETTINGS },
    pinnedArt: null,
    favoriteArt: [],
  };
  lastArt = null;
  artSeed = undefined;
}

export interface NewJourneyInput {
  title: string;
  format: JourneyFormat;
  kind: JourneyPhase;
  recitation: RecitationMode;
  startDate: Date;
}

/** 성화 씨앗이 걸려 있으면 그 값. 여정 번호를 세는 수로 만들지를 이 값이 정한다. */
let artSeedInUse: number | null = null;

/*
 * 새 여정의 번호를 만든다.
 *
 * 보통은 시각과 난수를 붙여 만든다 — 여정 번호는 기기 안에서만 겹치지 않으면 되고,
 * 같은 밀리초에 둘을 만드는 일은 사람 손으로는 일어나지 않기 때문이다.
 *
 * **다만 성화 씨앗(`?art=<숫자>`)이 걸려 있으면 번호도 세는 수로 만든다.** 성화를 고르는
 * 규칙이 여정 번호에서 출발하므로(`artSession.forJourney`), 번호가 매번 달라지면 씨앗을
 * 물려도 그림이 달라진다. 실제로 그랬다 — 씨앗을 넣은 뒤에도 여정 완주 화면의 사진이
 * 돌릴 때마다 바뀌어, 사진 커밋에 뜻 없는 변경이 계속 섞였다(2026-09-18, `decisions.md`
 * Q-57). 씨앗은 사진을 찍는 e2e 에서만 걸리는 진단용 손잡이이므로 실제 사용자는 이 길을
 * 지나가지 않는다.
 */
let journeySeq = 0;
function newJourneyId(): string {
  if (artSeedInUse !== null) {
    journeySeq += 1;
    return `jseed${artSeedInUse}-${journeySeq}`;
  }
  return `j${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

/** 새 여정을 만들어 목록 맨 앞에 둔다. 만들어진 여정을 돌려준다. */
export function addJourney(input: NewJourneyInput, today: Date = new Date()): Journey {
  const journey: Journey = {
    id: newJourneyId(),
    title: input.title,
    format: input.format,
    startDate: input.startDate,
    days: [],
    kind: input.kind,
    recitation: input.recitation,
  };
  journey.days = rolledDays(journey, today);
  setJourneys([journey, ...state.journeys]);
  return journey;
}

/** 여정 하나를 지운다 (FR-05 · 시트 S6). */
export function removeJourney(id: string): void {
  setJourneys(state.journeys.filter((journey) => journey.id !== id));
}

/**
 * 오늘을 바친 것으로 새긴다. 하루 완주 뒤에 불린다.
 *
 * @returns 이 하루로 여정이 끝났는지 — 끝났으면 화면은 하루 완주가 아니라 여정 완주로 간다.
 */
export function finishTodayFor(id: string, today: Date = new Date()): { ended: boolean } {
  const journey = state.journeys.find((item) => item.id === id);
  if (!journey) return { ended: false };
  const { days, ended } = withTodayPrayed(journey, today);
  setJourneys(state.journeys.map((item) => (item.id === id ? { ...item, days } : item)));
  return { ended };
}

/**
 * 설정 몇 가지를 고친다.
 *
 * 두 값만은 고치는 것으로 끝나지 않고 **그 자리에서 다른 곳에 알린다.** 지역이 바뀌면
 * 성화 묶음이 통째로 갈려야 하고(W2 통과 조건 3), 진동을 끄면 기도 중에 곧바로 조용해져야
 * 하기 때문이다. 화면이 값을 보고 스스로 판단하게 두지 않는 이유는, 그 값을 실제로 쓰는
 * 곳(뽑기와 진동 통로)이 화면 밖에 있기 때문이다.
 */
export function updateSettings(patch: Partial<AppSettings>): void {
  const settings = { ...state.settings, ...patch };
  if (patch.region !== undefined && patch.region !== state.settings.region) {
    void reopenArt(patch.region, state.pinnedArt);
  }
  if (patch.haptic !== undefined) setHapticEnabled(patch.haptic);
  publish({ ...state, settings });
  void settingsStore.save(settings);
}

/* ── 고정한 성화 (W1 §3-6 · W2 슬라이스 C 에서 배선됐다) ─────────────────────────
   W1 은 이 값을 저장하기만 했고 읽는 화면은 하루 완주 화면 하나뿐이었다(단추의 글자를
   `고정됨` 으로 바꾸는 데 썼다). W2 슬라이스 C 가 **뽑기를 이 값에 잇는다** — 고정한
   그림이 있으면 홈·오늘의 신비·기도 배경이 모두 그 그림으로 선다.

   W3 슬라이스 B 가 둘을 더했다. 값이 `AppState` 로 올라가 화면이 구독할 수 있게 됐고,
   **고정을 푸는 길**이 생겼다 — 시안의 감상 화면은 이미 고정된 그림에서 다시 누르면
   풀리는데, W2 까지는 거는 길만 있었다. ─────────────────────────────────────── */

/**
 * 이 성화를 고정한다. 파일 이름 하나를 기기에 남기고, 그 자리에서 뽑기를 다시 연다.
 * 뽑기를 다시 여는 것이 곧 **홈과 기도 배경이 이 그림으로 서는 일**이다.
 */
export function pinArt(file: string): void {
  publish({ ...state, pinnedArt: file });
  void pinnedArtStore.save(file);
  void reopenArt(state.settings.region, file);
}

/**
 * 고정을 푼다 (W3 슬라이스 B).
 *
 * 저장 자리에서 이름을 지우고 뽑기를 다시 여는데, 이때 뽑기는 고정이 없는 상태로 열리므로
 * 홈과 기도 배경은 **지역 묶음에서 다시 뽑은 그림**으로 돌아간다. 고정을 건 자리(갤러리와
 * 감상 화면)에서 같은 단추를 다시 누르는 것이 이 함수를 부른다.
 */
export function unpinArt(): void {
  publish({ ...state, pinnedArt: null });
  void pinnedArtStore.save(null);
  void reopenArt(state.settings.region, null);
}

/** 이 성화를 즐겨찾기에 담거나 뺀다 (W3 슬라이스 B). 고정과 달리 뽑기에는 영향이 없다. */
export function toggleFavoriteArt(file: string): void {
  const favoriteArt = toggleFavorite(state.favoriteArt, file);
  publish({ ...state, favoriteArt });
  void favoriteArtStore.save(favoriteArt);
}

/** 고정한 성화의 파일 이름. 고정한 적이 없으면 null 이다. */
export function loadPinnedArt(): Promise<string | null> {
  return pinnedArtStore.load();
}
