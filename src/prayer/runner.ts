/**
 * 기도 진행기 — 77단계를 스스로 넘어가는 상태 기계.
 *
 * 이 파일에는 React 도 Expo 도 들어오지 않는다. 소리와 진동은 바깥에서 주입받고
 * 시간도 주입받은 타이머로 잰다. 그래서 브라우저 없이 단위 시험으로 "정말 77단계를
 * 끝까지 가는가"를 확인할 수 있다 — 화면 없이 검증되는 층을 하나 만들어 두는 것이
 * 이 파일의 존재 이유다.
 *
 * 한 단계는 낭송 방식에 따라 이렇게 흐른다 (`spec/journey-rules.md` §4).
 *
 * | 방식 | 앱이 하는 일 | 그다음 사이 |
 * |---|---|---|
 * | `alternate` (교대, 기본) | 앞 절을 읽는다 | 뒷 절 글자수로 계산한 사이 — 사용자가 받아 바친다 |
 * | `full` (전부 읽기) | 앞 절과 뒷 절을 다 읽는다 | 900ms ÷ 속도 (사용자 몫이 없으므로 L=0) |
 * | `silent` (읽지 않기) | 아무 소리도 내지 않는다 | 앞 절 + 뒷 절 글자수로 계산한 사이. 끝에 알 넘어감 진동 |
 *
 * 신비 선포만 예외로 사이가 고정 2200ms 다 (`pacing.ts` 의 `DECLARATION_GAP_MS`).
 */
import { HAPTIC_PATTERNS, gapForPrayer } from '../domain/pacing';
import type { PaceKey, RecitationMode } from '../domain/types';
import type { RunStep } from './steps';

/** 진행기가 바깥 세상에 손을 뻗는 통로. 실제 구현은 `channels.ts` 에 있다. */
export interface RunnerChannels {
  /** 소리 내어 읽는다. 다 읽으면(또는 못 읽으면) 약속이 풀린다. */
  speak(text: string): Promise<void>;
  /** 읽던 것을 멈춘다. 진행 중인 `speak` 의 약속도 함께 풀려야 한다. */
  stopSpeaking(): void;
  /** 진동. 지원하지 않는 기기에서는 아무 일도 하지 않는다. */
  vibrate(pattern: readonly number[]): void;
}

export interface RunnerOptions {
  queue: readonly RunStep[];
  /** 시작 자리 (0~76). 이어가기면 저장된 자리가 들어온다. */
  startIndex?: number;
  mode: RecitationMode;
  pace: PaceKey;
  channels: RunnerChannels;
  /** 자리가 바뀔 때마다 불린다. 화면 갱신과 자리 저장이 여기 걸린다. */
  onStep?: (index: number, step: RunStep) => void;
  /** 마지막 단계까지 마쳤을 때 한 번 불린다. */
  onFinish?: () => void;
}

export interface Runner {
  /** 진행을 시작한다. 이미 돌고 있으면 아무 일도 하지 않는다. */
  start(): void;
  /** 잠시 멈춤 — 자리는 그대로 두고 소리와 사이만 멈춘다. */
  pause(): void;
  /** 멈춘 자리에서 다시 시작한다. */
  resume(): void;
  /** 지금 자리를 마치고 다음 알로 (흔들기·이어폰 다음 버튼이 부른다). */
  advance(): void;
  /** 앞 알로 되돌아간다 (이어폰 이전 버튼). */
  back(): void;
  /** 완전히 멈춘다. 화면을 떠날 때 부른다. */
  stop(): void;
  index(): number;
  isRunning(): boolean;
}

export function createRunner(options: RunnerOptions): Runner {
  const { queue, mode, pace, channels } = options;
  let index = clamp(options.startIndex ?? 0, queue.length);
  let running = false;
  /**
   * 세대 번호. 자리를 건너뛰거나 멈출 때마다 하나씩 오른다. 진행 중이던 반복문은
   * 자기 세대 번호가 바뀐 것을 보고 스스로 물러난다 — 그래야 흔들기로 알을 넘겼을 때
   * 옛 반복문과 새 반복문이 함께 돌며 두 알씩 넘어가는 일이 생기지 않는다.
   */
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let wake: (() => void) | null = null;

  function clamp(i: number, length: number): number {
    if (!Number.isInteger(i) || i < 0) return 0;
    return Math.min(i, Math.max(0, length - 1));
  }

  /** 사이를 기다린다. 도중에 깨우면(`interrupt`) 기다림이 즉시 끝난다. */
  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      wake = resolve;
      timer = setTimeout(() => {
        timer = null;
        wake = null;
        resolve();
      }, ms);
    });
  }

  /** 기다림과 낭송을 즉시 깨운다. 세대 번호를 올려 옛 반복문이 물러나게 한다. */
  function interrupt(): void {
    generation++;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (wake) {
      const resume = wake;
      wake = null;
      resume();
    }
    channels.stopSpeaking();
  }

  function alive(mine: number): boolean {
    return running && generation === mine;
  }

  async function loop(mine: number): Promise<void> {
    while (alive(mine) && index < queue.length) {
      const step = queue[index]!;
      options.onStep?.(index, step);

      if (mode !== 'silent') {
        await channels.speak(step.a);
        if (!alive(mine)) return;
        if (mode === 'full' && step.b) {
          await channels.speak(step.b);
          if (!alive(mine)) return;
        }
      }

      await wait(gapForPrayer(step.prayer, mode, pace));
      if (!alive(mine)) return;

      // 읽지 않기일 때만 알이 넘어갔음을 진동으로 알린다 (`journey-rules.md` §4·§5).
      if (mode === 'silent') channels.vibrate(HAPTIC_PATTERNS.beadAdvance);

      const next = index + 1;
      if (next >= queue.length) {
        finish();
        return;
      }
      if (queue[next]!.decade !== step.decade) channels.vibrate(HAPTIC_PATTERNS.decadeChange);
      index = next;
    }
  }

  function finish(): void {
    running = false;
    generation++;
    channels.vibrate(HAPTIC_PATTERNS.dayComplete);
    options.onFinish?.();
  }

  function startLoop(): void {
    const mine = ++generation;
    void loop(mine);
  }

  /** 자리를 옮기고 그 자리부터 다시 진행한다. */
  function goTo(target: number): void {
    const bounded = Math.max(0, target);
    if (bounded >= queue.length) {
      interrupt();
      index = queue.length - 1;
      finish();
      return;
    }
    const previous = queue[index];
    interrupt();
    index = bounded;
    if (previous && queue[index]!.decade !== previous.decade) {
      channels.vibrate(HAPTIC_PATTERNS.decadeChange);
    }
    if (running) startLoop();
  }

  return {
    start() {
      if (running) return;
      running = true;
      startLoop();
    },
    pause() {
      if (!running) return;
      running = false;
      interrupt();
    },
    resume() {
      if (running) return;
      running = true;
      startLoop();
    },
    advance() {
      goTo(index + 1);
    },
    back() {
      goTo(index - 1);
    },
    stop() {
      running = false;
      interrupt();
    },
    index: () => index,
    isRunning: () => running,
  };
}
