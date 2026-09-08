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
import { createDeviceChannels, hasKoreanVoice } from './channels';
import { useRemoteCommands, useShakeToAdvance } from './handsfree';
import { createRunner, type Runner } from './runner';
import { buildDayQueue, hailCount, type RunStep } from './steps';

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
  /** 그날의 신비. 이어가기면 저장된 신비다 (FR-03). */
  mystery: MysteryKey;
  /** 실제로 쓰이고 있는 낭송 방식. 음성이 없어 낮춰졌으면 고른 것과 다르다. */
  mode: RecitationMode;
  /** 잠시 멈춤 — 자리를 남기고 멈춘다 (FR-18). */
  pause(): void;
  /** 멈춘 자리에서 이어서. */
  resume(): void;
  /** 다음 알 · 이전 알 (손 없이 조작이 부른다). */
  advance(): void;
  back(): void;
  /** 여기서 끝내기 — 오늘 자리를 지운다 (FR-18). */
  discard(): Promise<void>;
}

export function usePrayerSession(options: PrayerSessionOptions = {}): PrayerSession {
  const journey = options.journey ?? currentJourney;
  const requestedMode: RecitationMode = options.mode ?? 'alternate';
  const pace: PaceKey = options.pace ?? 'normal';
  const handsFree = options.handsFree ?? true;

  // 화면이 열려 있는 동안 화면이 꺼지지 않게 한다 (FR-24).
  // 기도 중에 화면이 꺼지면 묵주 그림도, 지금 어느 알인지도 함께 사라진다.
  useKeepAwake();

  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<RecitationMode>(requestedMode);
  const [mystery, setMystery] = useState<MysteryKey>(() => mysteryOf(journey));

  const runnerRef = useRef<Runner | null>(null);
  const resumeCountRef = useRef(0);
  const elapsedRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(options.onFinish);
  onFinishRef.current = options.onFinish;

  // 큐는 신비가 정해져야 만들어진다. 처음에는 오늘 날짜로 어림해 두고, 저장된 자리를
  // 읽어 본 뒤(이어가기면 저장된 신비가 이긴다) 확정된 큐로 갈아 끼운다.
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

      // 3. 기기에 한국어 음성이 있는가. 없으면 읽지 않기로 낮춘다 (PRD §8).
      const effectiveMode: RecitationMode =
        requestedMode === 'silent' || (await hasKoreanVoice()) ? requestedMode : 'silent';
      if (cancelled) return;

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
          });
        },
        onFinish: () => {
          if (cancelled || finishedRef.current) return;
          finishedRef.current = true;
          const spent = elapsedNow();
          startedAtRef.current = null;
          setRunning(false);
          // 하루를 마쳤으므로 오늘 자리는 지운다. 내일은 처음부터다.
          void positionStore.clear();
          onFinishRef.current?.({
            hails: hailCount(queueRef.current),
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
  return { ready, index, step, running, mystery, mode, pause, resume, advance, back, discard };
}
