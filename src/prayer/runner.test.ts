/**
 * 기도 진행기 시험 — 화면 없이 "81단계를 끝까지 가는가"를 확인한다.
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
  it('교대 낭송으로 81단계를 스스로 끝까지 간다', async () => {
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

    expect(seen).toHaveLength(81);
    expect(seen[0]).toBe(0);
    expect(seen[80]).toBe(80);
    expect(finished).toBe(1);
    expect(runner.isRunning()).toBe(false);
  });

  it('교대 낭송은 앞 절만 읽는다 — 뒷 절은 사용자 몫이다', async () => {
    const channels = recorder();
    const runner = createRunner({ queue: QUEUE, mode: 'alternate', pace: 'normal', channels });
    runner.start();
    await runToEnd();

    expect(channels.spoken).toHaveLength(81);
    expect(channels.spoken[0]).toBe(QUEUE[0]!.a);
    expect(channels.spoken).not.toContain(QUEUE[4]!.b);
  });

  it('전부 읽기는 앞 절과 뒷 절을 모두 읽는다', async () => {
    const channels = recorder();
    const runner = createRunner({ queue: QUEUE, mode: 'full', pace: 'normal', channels });
    runner.start();
    await runToEnd();

    const withTail = QUEUE.filter((s) => s.b).length;
    expect(channels.spoken).toHaveLength(81 + withTail);
    expect(channels.spoken).toContain(QUEUE[4]!.b);
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
    expect(beads).toHaveLength(81);
  });

  it('구간이 바뀔 때 여섯 번, 하루를 마칠 때 한 번 진동한다', async () => {
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
    // 시작 기도에서 제1단으로 한 번, 제1단에서 제5단까지 한 단씩 옮겨 가며 넷,
    // 그리고 제5단에서 마침 기도로 한 번. 합이 여섯이다.
    expect(decadeChanges).toHaveLength(6);
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
      startIndex: 80,
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

/**
 * 단 넘기기 — `decisions.md` 결정 6.
 *
 * 진행기가 할 일은 하나다: 자리를 옮기고 **그 사실을 알린다.** 알리지 않으면 화면도
 * 저장된 자리도 옛 자리에 머물러, 앱을 다시 열었을 때 옮기기 전으로 돌아간다.
 */
describe('아무 자리로나 옮기기', () => {
  it('진행 중에 옮기면 그 자리부터 읽기 시작한다', async () => {
    const channels = recorder();
    const seen: number[] = [];
    const runner = createRunner({
      queue: QUEUE,
      mode: 'alternate',
      pace: 'normal',
      channels,
      onStep: (i) => seen.push(i),
    });
    runner.start();
    await jest.advanceTimersByTimeAsync(1);

    runner.goTo(37); // 제3단 신비 선포
    await jest.advanceTimersByTimeAsync(1);

    expect(runner.index()).toBe(37);
    expect(seen).toContain(37);
    expect(channels.spoken.at(-1)).toBe(QUEUE[37]!.a);
  });

  it('멈춰 있을 때 옮겨도 자리가 바뀐 것을 알린다', async () => {
    const channels = recorder();
    const seen: number[] = [];
    const runner = createRunner({
      queue: QUEUE,
      mode: 'alternate',
      pace: 'normal',
      channels,
      onStep: (i) => seen.push(i),
    });
    runner.start();
    await jest.advanceTimersByTimeAsync(1);
    runner.pause();
    const spokenBefore = channels.spoken.length;

    runner.goTo(23); // 제2단 신비 선포
    await jest.advanceTimersByTimeAsync(1);

    expect(runner.index()).toBe(23);
    expect(seen.at(-1)).toBe(23);
    // 멈춰 있으므로 읽지는 않는다 — 자리만 옮긴다.
    expect(channels.spoken).toHaveLength(spokenBefore);
    expect(runner.isRunning()).toBe(false);
  });

  it('단이 바뀌면 진동으로 알린다', async () => {
    const channels = recorder();
    const runner = createRunner({
      queue: QUEUE,
      mode: 'alternate',
      pace: 'normal',
      channels,
    });
    runner.start();
    await jest.advanceTimersByTimeAsync(1);
    channels.vibrations.length = 0;

    runner.goTo(51); // 제4단
    await jest.advanceTimersByTimeAsync(1);

    expect(channels.vibrations).toContainEqual([...HAPTIC_PATTERNS.decadeChange]);
  });

  it('건너뛴 채로도 하루를 마칠 수 있다', async () => {
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
    await jest.advanceTimersByTimeAsync(1);

    runner.goTo(65); // 제5단 신비 선포로 뛴다
    await runToEnd();

    expect(finished).toBe(1);
    // 뛰어넘은 단들은 한 번도 들르지 않았다 — 하루 완주 화면의 성모송 수가 여기서 나온다.
    expect(seen).not.toContain(30);
    expect(seen.filter((i) => i >= 65)).toHaveLength(81 - 65);
  });
});

/**
 * 지금 알의 상태 알림 (FR-15 · `phase.ts`).
 *
 * 여기서 확인하는 것은 "알림이 더해졌을 뿐 흐름은 그대로인가"다. 위의 시험들이 낭송 수와
 * 진동 수와 완주를 그대로 통과한다는 것이 그 절반이고, 알림이 옳은 자리에서 옳은 값으로
 * 나오는가가 나머지 절반이다.
 */
describe('지금 알의 상태 알림', () => {
  function withPhases(mode: 'alternate' | 'full' | 'silent') {
    const channels = recorder();
    const phases: string[] = [];
    const runner = createRunner({
      queue: QUEUE,
      mode,
      pace: 'normal',
      channels,
      onPhase: (phase) => phases.push(phase),
    });
    return { runner, phases, channels };
  }

  it('교대 낭송은 단계마다 읽는 중 → 내 차례 순서로 알린다', async () => {
    const { runner, phases } = withPhases('alternate');
    runner.start();
    await runToEnd();

    const withoutDecade = phases.filter((p) => p !== 'decade');
    // 81단계 × (reading, response) = 162.
    expect(withoutDecade).toHaveLength(162);
    for (let i = 0; i < 81; i++) {
      expect(withoutDecade[i * 2]).toBe('reading');
      expect(withoutDecade[i * 2 + 1]).toBe('response');
    }
    expect(phases).not.toContain('silent');
  });

  it('읽지 않기는 읽는 중을 알리지 않고 단계마다 소리 없는 진행만 알린다', async () => {
    const { runner, phases } = withPhases('silent');
    runner.start();
    await runToEnd();

    expect(phases.filter((p) => p === 'silent')).toHaveLength(81);
    expect(phases).not.toContain('reading');
    expect(phases).not.toContain('response');
  });

  it('단이 바뀌는 순간에만 단 전환을 알린다 — 진동과 같은 여섯 번', async () => {
    const { runner, phases, channels } = withPhases('alternate');
    runner.start();
    await runToEnd();

    const decadeVibrations = channels.vibrations.filter(
      (v) => v.length === HAPTIC_PATTERNS.decadeChange.length,
    );
    expect(phases.filter((p) => p === 'decade')).toHaveLength(6);
    expect(phases.filter((p) => p === 'decade')).toHaveLength(decadeVibrations.length);
  });

  it('단을 건너 옮기면 그때도 단 전환을 알린다 — 멈춘 채로도', async () => {
    const { runner, phases } = withPhases('alternate');
    runner.start();
    await jest.advanceTimersByTimeAsync(1);
    runner.pause();
    phases.length = 0;

    runner.goTo(65); // 제5단 신비 선포로 뛴다 — 시작 기도에서 단이 바뀐다.
    expect(phases).toEqual(['decade']);

    runner.advance(); // 같은 단 안에서 한 알 — 단 전환이 아니다.
    expect(phases).toEqual(['decade']);
  });

  it('알림을 받지 않는 호출자에게는 아무 일도 일어나지 않는다', async () => {
    const channels = recorder();
    const runner = createRunner({ queue: QUEUE, mode: 'alternate', pace: 'normal', channels });
    runner.start();
    await runToEnd();
    expect(runner.isRunning()).toBe(false);
  });
});
