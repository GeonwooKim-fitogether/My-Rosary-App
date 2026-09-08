/**
 * 성화 뽑기 — 한 세션 동안 어떤 그림을 어디에 쓸지 정한다.
 *
 * 규칙 셋 (v5 시안의 뽑기 로직과 같다).
 *
 * 1. **한 세션 안에서 그림이 고정된다.** 앱을 열 때 한 번 섞고 그 순서를 세션 내내 쓴다.
 *    화면을 오갈 때마다 성화가 바뀌면 여정의 정체성이 깨지기 때문이다. 그래서 같은
 *    키(예: 여정 ID)로 다시 물으면 언제나 같은 그림이 돌아온다.
 * 2. **비복원 추출이다.** 이미 쓴 그림은 다시 집지 않아 한 화면 안에서 겹치지 않는다.
 * 3. **쓸 수 없는 슬롯은 제외한다.** 여정용 그림은 썸네일·기도 배경·완주 세 슬롯을
 *    모두 통과해야 한다 — 홈에서 본 그림이 그 여정의 기도와 완주로 이어져야 해서다.
 *
 * 섞기에 난수를 쓰므로 씨앗을 주입할 수 있게 만들었다. v5 가 진단용으로 두었던
 * `?art=01,02,07` 질의 문자열 손잡이와 같은 목적이며, 테스트가 결정적으로 돈다.
 */
import { ART_PLATES, JOURNEY_SLOTS, fitsSlot, type ArtPlate, type ArtSlot } from './plates';

export interface ArtSessionOptions {
  /** 씨앗. 같은 씨앗은 언제나 같은 순서를 낸다. 없으면 무작위로 연다. */
  seed?: number;
  /**
   * 맨 앞으로 끌어올릴 그림들의 파일 이름 앞부분 (예: `['01', '02']`).
   * v5 의 `?art=` 손잡이와 같다 — 시안 대조와 재현에 쓴다.
   */
  forced?: readonly string[];
  /** 뽑기 대상 목록. 기본값은 열여섯 장 전부이며, 테스트에서 좁힐 때 쓴다. */
  plates?: readonly ArtPlate[];
}

/** 씨앗 하나로 결정되는 난수열 (mulberry32). 작고 결정적이면 충분하다. */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ArtSession {
  /** 아직 쓰지 않은 그림 중 주어진 슬롯 전부를 통과하는 것을 하나 집는다. */
  take(slots: readonly ArtSlot[]): ArtPlate | null;
  /**
   * 키에 배정된 그림. 같은 키로 다시 물으면 같은 그림이 돌아오고,
   * 처음 묻는 키면 새로 하나 집어 배정한다.
   */
  forKey(key: string, slots: readonly ArtSlot[]): ArtPlate | null;
  /** 여정용 그림 — 썸네일·기도 배경·완주 세 슬롯을 모두 통과하는 것. */
  forJourney(journeyId: string): ArtPlate | null;
  /** 이번 세션의 섞인 순서. 진단용이다. */
  order(): readonly ArtPlate[];
}

/**
 * 세션을 연다. 앱을 열 때 한 번 부르고 그 결과를 세션 내내 들고 다닌다.
 *
 * 풀이 바닥나면 예외를 던지지 않고 `null` 을 돌려준다. 성화가 모자란 것은
 * 기도를 멈춰 세울 이유가 아니므로, 부르는 쪽이 그림 없이 그릴 수 있어야 한다.
 */
export function createArtSession(options: ArtSessionOptions = {}): ArtSession {
  const source = options.plates ?? ART_PLATES;
  const random = options.seed === undefined ? Math.random : seededRandom(options.seed);

  // 한 번만 섞는다 (피셔–예이츠).
  const pool = source.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const swap = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = swap;
  }

  // 지정된 그림을 맨 앞으로 끌어올린다.
  if (options.forced?.length) {
    const head: ArtPlate[] = [];
    for (const want of options.forced) {
      const found = source.find((p) => p.file.startsWith(want) && !head.includes(p));
      if (found) head.push(found);
    }
    const rest = pool.filter((p) => !head.includes(p));
    pool.length = 0;
    pool.push(...head, ...rest);
  }

  const used = new Set<ArtPlate>();
  const assigned = new Map<string, ArtPlate | null>();

  function take(slots: readonly ArtSlot[]): ArtPlate | null {
    for (const plate of pool) {
      if (used.has(plate)) continue;
      if (slots.every((slot) => fitsSlot(plate, slot))) {
        used.add(plate);
        return plate;
      }
    }
    return null;
  }

  function forKey(key: string, slots: readonly ArtSlot[]): ArtPlate | null {
    if (assigned.has(key)) return assigned.get(key) ?? null;
    const plate = take(slots);
    assigned.set(key, plate);
    return plate;
  }

  return {
    take,
    forKey,
    forJourney: (journeyId) => forKey(journeyId, JOURNEY_SLOTS),
    order: () => pool.slice(),
  };
}
