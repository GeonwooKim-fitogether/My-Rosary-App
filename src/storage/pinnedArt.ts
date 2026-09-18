/**
 * 고정한 성화 한 장을 기기에 기억한다 (W1 지시서 §3-6 · FR-23 의 갈래).
 *
 * 하루 완주 화면의 `이 성화 고정하기` 가 부르는 자리다. **W1 에서 하는 일은 값을
 * 저장하는 데까지이고, 고정한 그림을 홈과 기도 배경에 실제로 쓰는 것은 W2 의 일이다**
 * — 그래서 지금 이 값을 읽는 화면은 하루 완주 화면 자신뿐이다(단추의 글자를 `고정됨`
 * 으로 바꾸는 데 쓴다).
 *
 * 담는 것은 성화의 파일 이름 하나(`src/art/plates.ts` 의 `file`)다. 그림 자체를 담지
 * 않는 이유는 그림이 번들에 들어 있어 이름만으로 다시 찾을 수 있기 때문이고, 이름을
 * 담으면 성화 표가 바뀌어도 저장된 값이 깨지지 않기 때문이다 — 모르는 이름이 저장돼
 * 있으면 읽는 쪽이 고정이 없는 것으로 보면 된다.
 */
import type { KeyValueStore } from './position';

/** 저장 열쇠. 판이 바뀌면 뒤의 번호를 올려 옛 값을 조용히 버린다. */
export const PINNED_ART_KEY = 'myrosary.pinnedArt.v1';

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

export function createPinnedArtStore(store: KeyValueStore): PinnedArtStore {
  return {
    async load() {
      try {
        return parsePinnedArt(await store.getItem(PINNED_ART_KEY));
      } catch {
        return null;
      }
    },
    async save(file) {
      try {
        if (file === null) await store.removeItem(PINNED_ART_KEY);
        else await store.setItem(PINNED_ART_KEY, file);
      } catch {
        // 저장에 실패해도 기도는 그대로 끝난다. 잃는 것은 다음에 열었을 때의 기억뿐이다.
      }
    },
  };
}
