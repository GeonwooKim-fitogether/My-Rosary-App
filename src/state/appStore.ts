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
import type { JourneyFormat, JourneyPhase, RecitationMode } from '../domain/types';
import { demoJourney } from '../journey/demo';
import type { Journey } from '../journey/session';
import { rolledDays, withTodayPrayed } from '../journey/rules';
import { createJourneyStore } from '../storage/journeys';
import {
  createSettingsStore,
  DEFAULT_SETTINGS,
  type AppSettings,
} from '../storage/settings';

const journeyStore = createJourneyStore(AsyncStorage);
const settingsStore = createSettingsStore(AsyncStorage);

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

/** 설정 몇 가지를 고친다. */
export function updateSettings(patch: Partial<AppSettings>): void {
  const settings = { ...state.settings, ...patch };
  publish({ ...state, settings });
  void settingsStore.save(settings);
}
