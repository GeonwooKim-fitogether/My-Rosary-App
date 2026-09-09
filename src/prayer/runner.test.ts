/**
 * 기도 진행기 시험 — 화면 없이 "77단계를 끝까지 가는가"를 확인한다.
 *
 * 가짜 타이머로 시간을 앞당겨 돌린다. 실제로 기다리면 한 번 완주에 십수 분이 걸리는데,
 * 그 시간은 사람이 기도하는 시간이지 시험이 기다릴 시간이 아니다.
 */
import { HAPTIC_PATTERNS } from '../domain/pacing';
import { mysteryForFiftyfourDay } from '../domain/mysteries';
import { createRunner, type RunnerChannels } from './runner';
import { buildDayQueue } from './steps';

const QUEUE = buildDayQueue(mysteryForFiftyfourDay(23));

/** 소리와 진동을 받아 적기만 하는 통로. 실제로는 아무 소리도 내지 않는다. */
function recorder(): RunnerChannels & { spoken: string[]; vibrations: number[][] } {
  const spoken: string[] = [];
  const vibrations: number[][] = [];
  return {
    spoken,
    vibrations,
    speak(text) {
      spoken.push(text);
      return Promise.resolve();
    },
    stopSpeaking() {},
    vibrate(pattern) {
      vibrations.push([...pattern]);
    },
  };
}

/** 가짜 시간을 조금씩 앞당기며 끝나기를 기다린다. */
async function runToEnd(step = 20000, rounds = 200): Promise<void> {
  for (let i = 0; i < rounds; i++) {
    await jest.advanceTimersByTimeAsync(step);
  }
}

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('하루 완주', () => {
  it('교대 낭송으로 77단계를 스스로 끝까지 간다', async () => {
    const channels = recorder();
    const seen: number[] = [];
    let finished = 0;
    const runner = createRunner({
      queue: QUEUE,
      mode: 'alternate',
      pace: 'normal',
      channels,
      onStep: (i) => seen.push(i),
      onFinish: () => finished++,
    });

    runner.start();
    await runToEnd();

    expect(seen).toHaveLength(77);
    expect(seen[0]).toBe(0);
    expect(seen[76]).toBe(76);
    expect(finished).toBe(1);
    expect(runner.isRunning()).toBe(false);
  });

  it('교대 낭송은 앞 절만 읽는다 — 뒷 절은 사용자 몫이다', async () => {
    const channels = recorder();
    const runner = createRunner({ queue: QUEUE, mode: 'alternate', pace: 'normal', channels });
    runner.start();
    await runToEnd();

    expect(channels.spoken).toHaveLength(77);
    expect(channels.spoken[0]).toBe(QUEUE[0]!.a);
    expect(channels.spoken).not.toContain(QUEUE[3]!.b);
  });

  it('전부 읽기는 앞 절과 뒷 절을 모두 읽는다', async () => {
    const channels = recorder();
    const runner = createRunner({ queue: QUEUE, mode: 'full', pace: 'normal', channels });
    runner.start();
    await runToEnd();

    const withTail = QUEUE.filter((s) => s.b).length;
    expect(channels.spoken).toHaveLength(77 + withTail);
    expect(channels.spoken).toContain(QUEUE[3]!.b);
  });

  it('읽지 않기는 아무 소리도 내지 않고 알마다 진동한다', async () => {
    const channels = recorder();
    const runner = createRunner({ queue: QUEUE, mode: 'silent', pace: 'normal', channels });
    runner.start();
    await runToEnd();

    expect(channels.spoken).toHaveLength(0);
    const beads = channels.vibrations.filter(
      (v) => v.length === 1 && v[0] === HAPTIC_PATTERNS.beadAdvance[0],
    );
    expect(beads).toHaveLength(77);
  });

  it('단이 바뀔 때 다섯 번, 하루를 마칠 때 한 번 진동한다', async () => {
    const channels = recorder();
    const runner = createRunner({ queue: QUEUE, mode: 'alternate', pace: 'normal', channels });
    runner.start();
    await runToEnd();

    const decadeChanges = channels.vibrations.filter(
      (v) => v.length === HAPTIC_PATTERNS.decadeChange.length,
    );
    const completions = channels.vibrations.filter(
      (v) => v.length === 1 && v[0] === HAPTIC_PATTERNS.dayComplete[0],
    );
    // 시작 기도 → 제1단, 그리고 제1단 → 제2단부터 제4단 → 제5단까지 넷. 합이 다섯이다.
    expect(decadeChanges).toHaveLength(5);
    expect(completions).toHaveLength(1);
  });
});

describe('멈춤과 이어가기', () => {
  it('잠시 멈추면 자리가 그대로 남고 더 나아가지 않는다', async () => {
    const channels = recorder();
    const runner = createRunner({ queue: QUEUE, mode: 'alternate', pace: 'normal', channels });
    runner.start();
    await jest.advanceTimersByTimeAsync(30000);

    const stopped = runner.index();
    runner.pause();
    await jest.advanceTimersByTimeAsync(60000);

    expect(runner.index()).toBe(stopped);
    expect(runner.isRunning()).toBe(false);
  });

  it('멈춘 자리에서 다시 시작하면 그 자리부터 간다', async () => {
    const channels = recorder();
    const runner = createRunner({ queue: QUEUE, mode: 'alternate', pace: 'normal', channels });
    runner.start();
    await jest.advanceTimersByTimeAsync(30000);
    const stopped = runner.index();
    runner.pause();
    runner.resume();
    await jest.advanceTimersByTimeAsync(30000);

    expect(runner.index()).toBeGreaterThan(stopped);
  });

  it('저장된 자리에서 열면 그 자리부터 시작한다', async () => {
    const channels = recorder();
    const seen: number[] = [];
    const runner = createRunner({
      queue: QUEUE,
      startIndex: 40,
      mode: 'alternate',
      pace: 'normal',
      channels,
      onStep: (i) => seen.push(i),
    });
    runner.start();
    await jest.advanceTimersByTimeAsync(1);

    expect(seen[0]).toBe(40);
  });
});

describe('손 없이 조작', () => {
  it('흔들면 사이가 남아 있어도 다음 알로 간다', async () => {
    const channels = recorder();
    const runner = createRunner({ queue: QUEUE, mode: 'alternate', pace: 'normal', channels });
    runner.start();
    await jest.advanceTimersByTimeAsync(1);
    expect(runner.index()).toBe(0);

    runner.advance();
    await jest.advanceTimersByTimeAsync(1);
    expect(runner.index()).toBe(1);
  });

  it('이전 알로 되돌아갈 수 있고 첫 알 앞으로는 가지 않는다', async () => {
    const channels = recorder();
    const runner = createRunner({
      queue: QUEUE,
      startIndex: 2,
      mode: 'alternate',
      pace: 'normal',
      channels,
    });
    runner.start();
    await jest.advanceTimersByTimeAsync(1);

    runner.back();
    await jest.advanceTimersByTimeAsync(1);
    expect(runner.index()).toBe(1);

    runner.back();
    runner.back();
    await jest.advanceTimersByTimeAsync(1);
    expect(runner.index()).toBe(0);
  });

  it('마지막 알에서 한 번 더 넘기면 하루를 마친다', async () => {
    const channels = recorder();
    let finished = 0;
    const runner = createRunner({
      queue: QUEUE,
      startIndex: 76,
      mode: 'alternate',
      pace: 'normal',
      channels,
      onFinish: () => finished++,
    });
    runner.start();
    await jest.advanceTimersByTimeAsync(1);
    runner.advance();

    expect(finished).toBe(1);
  });
});
