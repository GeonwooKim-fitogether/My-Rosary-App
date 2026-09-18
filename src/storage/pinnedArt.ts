/**
 * 성화의 이름 **둘**을 기기에 기억한다 — 고정한 그림과, 바로 앞에 보여 준 그림.
 *
 * ── 첫째, 고정한 그림 (W1 지시서 §3-6 · FR-23 의 갈래) ────────────────────────
 *
 * 하루 완주 화면의 `이 성화 고정하기` 가 부르는 자리다. W1 에서 한 일은 값을 저장하는
 * 데까지였고, **그 값을 실제로 읽어 홈과 기도 배경에 쓰는 배선은 W2 슬라이스 C 에서
 * 들어왔다** (`src/art/current.ts` 의 `configureArtSession`).
 *
 * ── 둘째, 바로 앞에 보여 준 그림 (W2 슬라이스 C) ────────────────────────────────
 *
 * 뽑기의 규칙 하나가 "앱을 열 때마다 다른 그림, 다만 연속으로 같은 그림이 두 번 나오지
 * 않는다"인데, 앱을 껐다 켜면 지난번에 무엇을 보여 줬는지 아무도 모른다. **그 한 가지를
 * 알려면 기기에 적어 두는 수밖에 없다.** 담는 값의 성질(파일 이름 하나)이 고정과 똑같아
 * 같은 파일에서 열쇠만 갈아 쓴다.
 *
 * ── 왜 그림이 아니라 이름을 담나 ────────────────────────────────────────────────
 *
 * 그림은 번들에 들어 있어 이름만으로 다시 찾을 수 있고, 이름을 담으면 성화 표가 바뀌어도
 * 저장된 값이 깨지지 않는다 — 모르는 이름이 저장돼 있으면 읽는 쪽이 "없음"으로 보면 된다.
 * 실제로 W2 에서 성화 표가 v5 의 것에서 새 시안의 것으로 바뀌면서 파일 이름의 모양도
 * 바뀌었는데(`01_Mary_Single` → `01-mary-single.jpg`), 옛 이름이 저장된 기기는 이 규칙
 * 덕분에 오류 없이 "고정 없음"으로 열린다.
 */
import type { KeyValueStore } from './position';

/** 고정한 성화의 저장 열쇠. 판이 바뀌면 뒤의 번호를 올려 옛 값을 조용히 버린다. */
export const PINNED_ART_KEY = 'myrosary.pinnedArt.v1';

/** 바로 앞에 보여 준 성화의 저장 열쇠. */
export const LAST_ART_KEY = 'myrosary.lastArt.v1';

/** 읽어 들인 값이 쓸 만한 이름인가. 빈 값과 이름 아닌 것은 고정이 없는 것으로 본다. */
export function parsePinnedArt(raw: string | null): string | null {
  if (typeof raw !== 'string') return null;
  const name = raw.trim();
  return name === '' ? null : name;
}

export interface PinnedArtStore {
  load(): Promise<string | null>;
  /** `null` 을 넘기면 고정을 푼다. */
  save(file: string | null): Promise<void>;
}

/**
 * 이름 하나를 담는 자리를 연다.
 *
 * @param key 어느 자리인가 — 고정한 그림(`PINNED_ART_KEY`)이거나 바로 앞에 보여 준
 *   그림(`LAST_ART_KEY`)이다. 기본값이 고정 쪽인 이유는 이 함수가 원래 고정만을 위해
 *   있었고, 그것을 부르던 자리들을 고치지 않기 위해서다.
 */
export function createPinnedArtStore(
  store: KeyValueStore,
  key: string = PINNED_ART_KEY,
): PinnedArtStore {
  return {
    async load() {
      try {
        return parsePinnedArt(await store.getItem(key));
      } catch {
        return null;
      }
    },
    async save(file) {
      try {
        if (file === null) await store.removeItem(key);
        else await store.setItem(key, file);
      } catch {
        // 저장에 실패해도 기도는 그대로 끝난다. 잃는 것은 다음에 열었을 때의 기억뿐이다.
      }
    },
  };
}
