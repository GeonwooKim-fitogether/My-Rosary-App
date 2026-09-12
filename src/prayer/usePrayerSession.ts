/**
 * 기도 화면과 진행기를 잇는 자리.
 *
 * 진행기(`runner.ts`)는 시간을, 통로(`channels.ts`)는 소리와 진동을, 자리 창고
 * (`storage/position.ts`)는 기억을 맡는다. 그 셋을 화면 하나에 붙이고 리액트의 수명
 * (열림·닫힘)에 맞춰 열고 닫는 것이 이 갈고리(hook)의 일이다.
 *
 * 여기서 정해지는 것이 하나 있다 — **낭송 방식이 기기 사정에 따라 낮춰질 수 있다.**
 * 교대나 전부 읽기를 골랐어도 기기에 한국어 음성이 없으면 읽지 않기로 진행한다
 * (PRD §8). 그래야 소리를 기다리다 멈춘 화면 앞에 사용자를 세워 두지 않는다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useKeepAwake } from 'expo-keep-awake';
import type { MysteryKey, PaceKey, RecitationMode } from '../domain/types';
import { currentJourney, dayNumber, mysteryOf, type Journey } from '../journey/session';
import { positionStore } from '../storage/asyncStore';
import { createDeviceChannels, koreanVoiceStatus } from './channels';
import { useRemoteCommands, useShakeToAdvance } from './handsfree';
import { DECADE_PULSE_MS, type PrayerPhase, type RunnerPhase } from './phase';
import { createRunner, type Runner } from './runner';
import { sectionMoves, type SectionMove } from './sections';
import { buildDayQueue, hailCountAmong, type RunStep } from './steps';

/** 하루를 마쳤을 때 하루 완주 화면으로 넘겨줄 것들. */
export interface DayResult {
  /** 오늘 바친 성모송의 수. */
  hails: number;
  /** 기도에 든 시간 (멈춘 사이는 빼고 잰다). */
  elapsedMs: number;
  /** 오늘 몇 번 이어서 바쳤나. */
  resumeCount: number;
  /** 무슨 신비로 바쳤나. 하루 완주 화면이 "고통의 신비 다섯 단"이라고 적을 때 쓴다. */
  mystery: MysteryKey;
}

export interface PrayerSessionOptions {
  journey?: Journey;
  mode?: RecitationMode;
  pace?: PaceKey;
  /** 손 없이 조작 (흔들기·이어폰 단추). */
  handsFree?: boolean;
  onFinish?: (result: DayResult) => void;
}

export interface PrayerSession {
  /** 자리를 읽어 진행기를 세울 때까지는 false 다. 대개 한 프레임 안에 true 가 된다. */
  ready: boolean;
  index: number;
  step: RunStep | null;
  running: boolean;
  /**
   * 지금 알의 상태 다섯 중 하나 (FR-15 · `phase.ts`). 묵주 그림이 이 값으로 지금 알을 그린다.
   *
   * 진행기가 알리는 넷(읽는 중 · 내 차례 · 소리 없이 진행 · 단 전환)에 멈춤을 얹은 것이다 —
   * 멈춤은 `running` 이 거짓이라는 뜻이므로 진행기의 알림과 무관하게 여기서 정한다.
   */
  phase: PrayerPhase;
  /** 그날의 신비. 이어가기면 저장된 신비다 (FR-03). */
  mystery: MysteryKey;
  /** 실제로 쓰이고 있는 낭송 방식. 음성이 없어 낮춰졌으면 고른 것과 다르다. */
  mode: RecitationMode;
  /**
   * 한국어 음성이 **없다고 확인돼** 읽지 않기로 낮춰졌는가.
   *
   * 낮추는 일 자체는 PRD §8 이 정한 옳은 처리인데, 그것을 화면에 적지 않으면 쓰는 사람에게는
   * 앱이 까닭 없이 벙어리가 된 것으로 보인다. 그래서 낮췄다는 사실을 밖으로 내보낸다.
   */
  voiceMissing: boolean;
  /** 잠시 멈춤 — 자리를 남기고 멈춘다 (FR-18). */
  pause(): void;
  /** 멈춘 자리에서 이어서. */
  resume(): void;
  /** 다음 알 · 이전 알 (손 없이 조작이 부른다). */
  advance(): void;
  back(): void;
  /**
   * 앞 단·다음 단으로 옮길 곳 (`decisions.md` 결정 6). 갈 데가 없으면 null 이다 —
   * 시작 기도에서의 `previous` 와 제5단에서의 `next` 가 그렇다.
   */
  moves: { previous: SectionMove | null; next: SectionMove | null };
  /** 그 구간의 첫 단계로 옮긴다. 진행 중이든 멈춰 있든 언제나 된다. */
  goToSection(move: SectionMove): void;
  /** 여기서 끝내기 — 오늘 자리를 지운다 (FR-18). */
  discard(): Promise<void>;
}

export function usePrayerSession(options: PrayerSessionOptions = {}): PrayerSession {
  const journey = options.journey ?? currentJourney;
  const requestedMode: RecitationMode = options.mode ?? 'alternate';
  const pace: PaceKey = options.pace ?? 'normal';
  const handsFree = options.handsFree ?? true;

  /*
   * 화면이 열려 있는 동안 화면이 꺼지지 않게 한다 (FR-24). 기도 중에 화면이 꺼지면
   * 묵주 그림도, 지금 어느 알인지도 함께 사라진다.
   *
   * `suppressDeactivateWarnings` 를 켠 이유가 있다. 화면 잠금 방지를 **걸지 못하는**
   * 브라우저·상황이 있는데(문서가 보이지 않는 상태로 열렸거나 브라우저가 거절한 경우),
   * 그때 화면을 떠나며 잠금을 푸는 호출이 "아직 걸리지도 않았다"는 오류로 터진다.
   * 이 오류는 기도와 아무 상관이 없는데도 콘솔에 남는다 — 실제로 CI 의 브라우저에서
   * 이 오류가 나 화면 e2e 셋이 한꺼번에 실패했고, 그렇게 발견했다. 잠금을 걸 수 없는
   * 기기에서는 조용히 넘어가는 것이 이 프로젝트의 규칙이다(`journey-rules.md` §5 와 같은 태도).
   */
  useKeepAwake(undefined, { suppressDeactivateWarnings: true });

  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<RecitationMode>(requestedMode);
  const [mystery, setMystery] = useState<MysteryKey>(() => mysteryOf(journey));
  const [runnerPhase, setRunnerPhase] = useState<RunnerPhase>('reading');

  const runnerRef = useRef<Runner | null>(null);
  /**
   * 단 전환을 붙들어 두는 자리 (`phase.ts` 의 `DECADE_PULSE_MS` 가 왜 필요한지 적어 두었다).
   *
   * 진행기는 `decade` 를 알린 바로 다음에 새 단계의 `reading` 을 알린다. 그 둘을 그대로 상태에
   * 넣으면 한 번의 그리기로 합쳐져 단 전환은 화면에 나타나지 못한다. 그래서 `decade` 가 오면
   * 맥동 시간만큼 붙들고, 그 사이에 온 상태는 `pending` 에 두었다가 시간이 끝나면 넘긴다.
   */
  const decadeHoldRef = useRef<{
    timer: ReturnType<typeof setTimeout>;
    pending: RunnerPhase | null;
  } | null>(null);
  /**
   * 오늘 실제로 지나온 단계들. 단을 건너뛸 수 있으므로(`decisions.md` 결정 6) 하루
   * 완주 화면의 성모송 수는 큐가 아니라 이 목록에서 나온다.
   */
  const visitedRef = useRef<Set<number>>(new Set());
  const resumeCountRef = useRef(0);
  const elapsedRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(options.onFinish);
  onFinishRef.current = options.onFinish;

  // 큐는 신비가 정해져야 만들어진다. 처음에는 오늘 날짜로 어림해 두고, 저장된 자리를
  // 읽어 본 뒤(이어가기면 저장된 신비가 이긴다) 확정된 큐로 갈아 끼운다.
  /** 한국어 음성이 없어 읽지 않기로 낮춰졌는가. 화면이 그 사실을 적을 수 있게 내보낸다. */
  const [voiceMissing, setVoiceMissing] = useState(false);
  const [queue, setQueue] = useState<RunStep[]>(() => buildDayQueue(mysteryOf(journey)));
  const queueRef = useRef(queue);
  queueRef.current = queue;

  /** 지금까지 기도에 든 시간. 돌고 있는 중이면 지금 이 순간까지 더해서 센다. */
  const elapsedNow = useCallback(() => {
    const open = startedAtRef.current;
    return elapsedRef.current + (open === null ? 0 : Date.now() - open);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const channels = createDeviceChannels();
    const dayIndex = dayNumber(journey);

    function releaseDecadeHold(): void {
      const hold = decadeHoldRef.current;
      if (!hold) return;
      clearTimeout(hold.timer);
      decadeHoldRef.current = null;
    }

    function onPhase(phase: RunnerPhase): void {
      if (cancelled) return;
      if (phase === 'decade') {
        releaseDecadeHold();
        setRunnerPhase('decade');
        decadeHoldRef.current = {
          pending: null,
          timer: setTimeout(() => {
            const hold = decadeHoldRef.current;
            decadeHoldRef.current = null;
            if (!cancelled && hold?.pending) setRunnerPhase(hold.pending);
          }, DECADE_PULSE_MS),
        };
        return;
      }
      const hold = decadeHoldRef.current;
      if (hold) {
        hold.pending = phase;
        return;
      }
      setRunnerPhase(phase);
    }

    async function open(): Promise<void> {
      // 1. 저장된 자리를 읽는다. 같은 여정의 같은 날이면 그 자리부터 이어간다 (FR-02).
      const saved = await positionStore.load();
      const resumable =
        saved && saved.journeyId === journey.id && saved.dayIndex === dayIndex ? saved : null;

      // 2. 이어가기면 저장된 신비로 간다 — 날짜가 바뀌어 오늘의 신비가 달라졌어도
      //    바치던 신비를 끝까지 바치는 것이 옳다 (FR-03).
      const todaysMystery = resumable?.mystery ?? mysteryOf(journey);
      const startIndex = resumable?.stepIndex ?? 0;
      resumeCountRef.current = (resumable?.resumeCount ?? 0) + (startIndex > 0 ? 1 : 0);
      elapsedRef.current = resumable?.elapsedMs ?? 0;
      visitedRef.current = new Set(resumable?.visited ?? []);

      // 3. 기기에 한국어 음성이 있는가. **없다고 확인됐을 때만** 읽지 않기로 낮춘다 (PRD §8).
      //    목록을 받지 못해 모르는 경우에는 낮추지 않고 일단 읽어 본다 — 브라우저는 음성
      //    목록을 뒤늦게 채우므로, 모른다는 것을 없다는 것으로 읽으면 멀쩡한 기기에서
      //    소리가 통째로 사라진다.
      const voice = requestedMode === 'silent' ? 'yes' : await koreanVoiceStatus();
      const effectiveMode: RecitationMode = voice === 'no' ? 'silent' : requestedMode;
      if (cancelled) return;
      setVoiceMissing(voice === 'no' && requestedMode !== 'silent');

      const runQueue = buildDayQueue(todaysMystery);
      queueRef.current = runQueue;
      setQueue(runQueue);
      setMystery(todaysMystery);
      setMode(effectiveMode);
      setIndex(Math.min(startIndex, runQueue.length - 1));

      const runner = createRunner({
        queue: runQueue,
        startIndex,
        mode: effectiveMode,
        pace,
        channels,
        onStep: (at, step) => {
          if (cancelled) return;
          setIndex(at);
          visitedRef.current.add(at);
          // 알을 넘길 때마다 자리를 남긴다 (FR-17).
          void positionStore.save({
            journeyId: journey.id,
            dayIndex,
            stepIndex: at,
            decade: step.decade ?? null,
            bead: step.bead ?? null,
            mystery: todaysMystery,
            savedAt: new Date().toISOString(),
            resumeCount: resumeCountRef.current,
            elapsedMs: elapsedNow(),
            visited: [...visitedRef.current],
          });
        },
        onPhase,
        onFinish: () => {
          if (cancelled || finishedRef.current) return;
          finishedRef.current = true;
          const spent = elapsedNow();
          startedAtRef.current = null;
          setRunning(false);
          // 하루를 마쳤으므로 오늘 자리는 지운다. 내일은 처음부터다.
          void positionStore.clear();
          onFinishRef.current?.({
            // 큐 전체가 아니라 실제로 지나온 단계만 센다 — 건너뛴 단의 성모송은 세지 않는다.
            hails: hailCountAmong(queueRef.current, visitedRef.current),
            elapsedMs: spent,
            resumeCount: resumeCountRef.current,
            mystery: todaysMystery,
          });
        },
      });

      runnerRef.current = runner;
      startedAtRef.current = Date.now();
      runner.start();
      setRunning(true);
      setReady(true);
    }

    void open();

    return () => {
      cancelled = true;
      releaseDecadeHold();
      runnerRef.current?.stop();
      runnerRef.current = null;
    };
    // 여정과 낭송 설정이 바뀌면 처음부터 다시 연다. 기도 중에는 바뀌지 않는 값들이다.
  }, [journey, requestedMode, pace, elapsedNow]);

  const pause = useCallback(() => {
    const runner = runnerRef.current;
    if (!runner || !runner.isRunning()) return;
    runner.pause();
    if (startedAtRef.current !== null) {
      elapsedRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = null;
    }
    setRunning(false);
  }, []);

  const resume = useCallback(() => {
    const runner = runnerRef.current;
    if (!runner || runner.isRunning()) return;
    resumeCountRef.current += 1;
    startedAtRef.current = Date.now();
    runner.resume();
    setRunning(true);
  }, []);

  const advance = useCallback(() => runnerRef.current?.advance(), []);
  const back = useCallback(() => runnerRef.current?.back(), []);

  /**
   * 단 넘기기 (`decisions.md` 결정 6).
   *
   * 진행기에게 자리만 넘기면 나머지는 이미 있는 길로 흐른다 — 진행기가 `onStep` 을
   * 부르고, 그 자리에서 화면이 갱신되고 자리가 저장된다. 멈춰 있을 때도 마찬가지다
   * (`runner.ts` 의 `goTo` 가 멈춘 채로도 알린다).
   */
  const goToSection = useCallback((move: SectionMove) => {
    runnerRef.current?.goTo(move.index);
  }, []);

  const discard = useCallback(async () => {
    runnerRef.current?.stop();
    setRunning(false);
    await positionStore.clear();
  }, []);

  // 손 없이 조작 — 흔들기는 다음 알, 이어폰 단추는 멈춤·다음·이전 (FR-38).
  useShakeToAdvance(handsFree, advance);
  useRemoteCommands(handsFree, {
    onToggle: () => (runnerRef.current?.isRunning() ? pause() : resume()),
    onNext: advance,
    onPrevious: back,
  });

  const step = queue[index] ?? null;
  const moves = sectionMoves(queue, index);
  // 멈춤은 진행기의 알림이 아니라 "돌고 있지 않다"는 사실이다. 멈춘 채로 알을 옮겨도 멈춤이다.
  const phase: PrayerPhase = running ? runnerPhase : 'paused';
  return {
    ready,
    index,
    step,
    running,
    phase,
    mystery,
    mode,
    voiceMissing,
    pause,
    resume,
    advance,
    back,
    moves,
    goToSection,
    discard,
  };
}
