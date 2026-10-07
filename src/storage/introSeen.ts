/**
 * 소개 시트(S7)를 본 적이 있는지를 기기에 기억한다 (W4 슬라이스 C).
 *
 * 담는 것은 참·거짓 하나뿐이다. 그런데도 파일 하나를 쓰는 까닭은, 이 값이 **앱의 설정이
 * 아니기 때문**이다. 설정(`settings.ts`)은 사람이 고른 것이라 기록 내보내기·들여오기로
 * 기기 사이를 옮겨 다니는데, "소개를 본 적이 있나" 는 사람이 고른 것이 아니라 **이 기기에서
 * 일어난 일**이다. 설정에 섞어 두면 남의 기기에서 만든 기록 파일을 들여왔을 때 이 기기의
 * 소개가 조용히 본 것으로 바뀐다.
 *
 * **값이 없으면 "아직 보지 않았다" 이다.** 처음 앱을 여는 사람의 기기에는 아무것도 적혀 있지
 * 않으므로, 없는 것이 곧 처음이라는 뜻이 된다. 읽기에 실패해도 같은 쪽으로 떨어진다 — 못 본
 * 사람에게 한 번 더 보이는 쪽이, 본 적 없는 사람이 영영 못 보는 쪽보다 낫다.
 */
import type { KeyValueStore } from './position';

/** 저장 열쇠. 소개 글이 통째로 바뀌어 다시 보여야 하면 뒤의 번호를 올린다. */
export const INTRO_SEEN_KEY = 'myrosary.introSeen.v1';

/** 적혀 있던 값을 읽는다. `1` 만 본 것으로 치고, 나머지는 전부 아직 보지 않은 것이다. */
export function parseIntroSeen(raw: string | null): boolean {
  return raw === '1';
}

export interface IntroSeenStore {
  load(): Promise<boolean>;
  /** 본 것으로 적는다. 되돌리는 길은 두지 않았다 — 되돌릴 일이 없기 때문이다. */
  markSeen(): Promise<void>;
}

export function createIntroSeenStore(store: KeyValueStore): IntroSeenStore {
  return {
    async load() {
      try {
        return parseIntroSeen(await store.getItem(INTRO_SEEN_KEY));
      } catch {
        return false;
      }
    },
    async markSeen() {
      try {
        await store.setItem(INTRO_SEEN_KEY, '1');
      } catch {
        // 적는 데 실패해도 앱은 그대로 돈다. 다음에 열 때 소개가 한 번 더 뜰 뿐이다.
      }
    },
  };
}
