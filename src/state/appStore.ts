/**
 * 앱이 들고 있는 것 하나 — 여정 목록과 설정.
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
/** 바로 앞에 보여 준 성화의 이름 — 같은 그림이 두 번 이어 나오지 않게 하는 데 쓴다. */
const lastArtStore = createPinnedArtStore(AsyncStorage, LAST_ART_KEY);

export interface AppState {
  /** 저장소를 한 번 읽어 왔나. 읽기 전에는 화면이 빈 목록을 그리지 않고 기다린다. */
  ready: boolean;
  journeys: Journey[];
  settings: AppSettings;
}

let state: AppState = { ready: false, journeys: [], settings: { ...DEFAULT_SETTINGS } };
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

/* ── 성화 뽑기를 다시 여는 데 필요한 것 셋 (W2 슬라이스 C) ─────────────────────────
   화면에 그려지는 값이 아니라 뽑기에만 쓰이는 값이라 `AppState` 에 넣지 않았다. 상태에
   넣으면 아무도 구독하지 않는 칸이 셋 늘고, 화면은 그 값을 볼 일이 없다 — 화면이 보는
   것은 뽑기가 내어 주는 **그림**이지 그 그림을 고른 재료가 아니다. ──────────────── */

/** 고정한 성화의 파일 이름. */
let pinnedArt: string | null = null;
/** 바로 앞에 보여 준 성화의 파일 이름. */
let lastArt: string | null = null;
/** 씨앗. 사진을 찍는 e2e 만 넘긴다. */
let artSeed: number | undefined;

/**
 * 성화 뽑기를 다시 연다. 부르는 자리는 셋뿐이다 — 앱을 열 때, 지역을 바꿀 때,
 * 성화를 고정할 때. 셋 다 기도 화면 밖이므로 "기도 중에는 바뀌지 않는다"가 지켜진다.
 *
 * **기억하는 일이 끝날 때까지 기다릴 수 있게 약속을 돌려준다.** 앱을 열 때만 그 약속을
 * 기다린다 — 기다리지 않으면 앱을 열자마자 다시 여는 경우(화면 새로 고침)에 기억이 아직
 * 기기에 닿지 않아, "연속으로 같은 그림이 두 번 나오지 않는다"가 가끔만 지켜진다. 실제로
 * 그 어긋남이 화면 사진에서 먼저 드러났다 — 같은 시험을 두 번 돌렸는데 여정 완주 화면의
 * 성화가 달랐다(2026-09-18 실측).
 */
function reopenArt(region: RegionKey): Promise<void> {
  const first = configureArtSession({ region, pinned: pinnedArt, avoid: lastArt, seed: artSeed });
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
    pinnedArt = options.reset ? null : await pinnedArtStore.load();
    lastArt = options.reset ? null : await lastArtStore.load();
    await reopenArt(settings.region);
    setHapticEnabled(settings.haptic);

    const rolled = journeys.map((journey) => ({ ...journey, days: rolledDays(journey, today) }));
    publish({ ready: true, journeys: rolled, settings });
    persistJourneys(rolled);
    if (options.reset) void settingsStore.save(settings);
  })();
  return opening;
}

/** 시험이 앱을 여러 번 열 수 있게 문을 다시 잠근다. 화면 코드는 쓰지 않는다. */
export function resetAppStateForTest(): void {
  opening = null;
  state = { ready: false, journeys: [], settings: { ...DEFAULT_SETTINGS } };
  pinnedArt = null;
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

/** 새 여정을 만들어 목록 맨 앞에 둔다. 만들어진 여정을 돌려준다. */
export function addJourney(input: NewJourneyInput, today: Date = new Date()): Journey {
  const journey: Journey = {
    id: `j${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`,
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
    void reopenArt(patch.region);
  }
  if (patch.haptic !== undefined) setHapticEnabled(patch.haptic);
  publish({ ...state, settings });
  void settingsStore.save(settings);
}

/* ── 고정한 성화 (W1 §3-6 · W2 슬라이스 C 에서 배선됐다) ─────────────────────────
   W1 은 이 값을 저장하기만 했고 읽는 화면은 하루 완주 화면 하나뿐이었다(단추의 글자를
   `고정됨` 으로 바꾸는 데 썼다). W2 슬라이스 C 가 **뽑기를 이 값에 잇는다** — 고정한
   그림이 있으면 홈·오늘의 신비·기도 배경이 모두 그 그림으로 선다.

   상태(`AppState`)에는 여전히 넣지 않았다. 화면이 보는 것은 뽑기가 내어 주는 그림이지
   그 그림을 고른 재료가 아니므로, 상태로 끌어올리면 아무도 구독하지 않는 칸이 는다. ── */

/** 이 성화를 고정한다. 파일 이름 하나를 기기에 남기고, 그 자리에서 뽑기를 다시 연다. */
export function pinArt(file: string): void {
  pinnedArt = file;
  void pinnedArtStore.save(file);
  void reopenArt(state.settings.region);
}

/** 고정한 성화의 파일 이름. 고정한 적이 없으면 null 이다. */
export function loadPinnedArt(): Promise<string | null> {
  return pinnedArtStore.load();
}
