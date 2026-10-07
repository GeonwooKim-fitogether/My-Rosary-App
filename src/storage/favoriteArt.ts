/**
 * 즐겨찾기에 담은 성화들 — 그림 **파일 이름의 목록**을 기기에 기억한다 (W3 슬라이스 B).
 *
 * ── 고정(`pinnedArt.ts`)과 무엇이 다른가 ────────────────────────────────────────
 *
 * 시안은 둘을 나란히 두고, 뜻이 다르다. **고정(핀)은 한 장**이고 홈과 기도 배경에 실제로
 * 쓰이는 그림이다. **즐겨찾기(하트)는 여러 장**이고 아무것도 바꾸지 않는다 — 갤러리의
 * `즐겨찾기` 탭이 그 목록을 보여 줄 뿐이다. 그래서 담는 값의 성질이 다르고(이름 하나 대
 * 이름의 목록) 저장 자리도 따로 둔다.
 *
 * ── 왜 그림이 아니라 이름을 담나 ────────────────────────────────────────────────
 *
 * 고정이 이름을 담는 것과 같은 이유다. 그림은 번들에 들어 있어 이름만으로 다시 찾을 수
 * 있고, 이름을 담으면 성화 표가 바뀌어도 저장된 값이 깨지지 않는다. 실제로 W2 에서 표가
 * v5 의 것에서 새 시안의 것으로 바뀌며 이름의 모양까지 달라졌는데(`01_Mary_Single` →
 * `01-mary-single.jpg`), 옛 이름이 저장된 기기는 그 이름을 **모르는 그림**으로 지나치면
 * 그만이다.
 *
 * ── 깨진 값을 만나도 열린다 ─────────────────────────────────────────────────────
 *
 * 이 자리는 목록이라 고정보다 깨질 수 있는 모양이 많다 — 글이 JSON 이 아닐 수도 있고,
 * 목록이 아니라 숫자 하나일 수도 있고, 목록 안에 이름 아닌 것이 섞여 있을 수도 있다.
 * **어느 경우에도 오류를 내지 않고 읽을 수 있는 것만 남긴다.** 즐겨찾기를 읽다 앱이 멈추는
 * 것보다 즐겨찾기 몇 개를 잃는 편이 언제나 낫기 때문이며, `parsePinnedArt` 가 같은 정신으로
 * 쓰여 있다.
 *
 * **모르는 그림 이름은 여기서 걸러 내지 않는다.** 이 파일은 성화 표를 모르고, 알 필요도
 * 없다 — 표를 아는 것은 화면이므로 지금 없는 그림을 걸러 내는 일은 갤러리가 한다
 * (`app/gallery.tsx`). 여기서 걸러 내면 표가 잠시 바뀌었다가 되돌아오는 경우에 저장된 값이
 * 조용히 지워진다.
 */
import type { KeyValueStore } from './position';

/** 즐겨찾기 목록의 저장 열쇠. 판이 바뀌면 뒤의 번호를 올려 옛 값을 조용히 버린다. */
export const FAVORITE_ART_KEY = 'myrosary.favoriteArt.v1';

/**
 * 읽어 들인 글을 이름의 목록으로 돌린다. 읽을 수 없으면 빈 목록이다.
 *
 * 남기는 것은 **글이면서 비어 있지 않은 것**뿐이고, 같은 이름이 두 번 들어 있으면 처음
 * 것만 남긴다 — 목록의 차례가 갤러리의 차례이므로 담은 순서를 지킨다.
 */
export function parseFavoriteArt(raw: string | null): string[] {
  if (typeof raw !== 'string') return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const names: string[] = [];
  for (const item of parsed) {
    if (typeof item !== 'string') continue;
    const name = item.trim();
    if (name === '' || names.includes(name)) continue;
    names.push(name);
  }
  return names;
}

export interface FavoriteArtStore {
  load(): Promise<string[]>;
  save(files: readonly string[]): Promise<void>;
}

/** 즐겨찾기 목록을 담는 자리를 연다. */
export function createFavoriteArtStore(store: KeyValueStore): FavoriteArtStore {
  return {
    async load() {
      try {
        return parseFavoriteArt(await store.getItem(FAVORITE_ART_KEY));
      } catch {
        return [];
      }
    },
    async save(files) {
      try {
        await store.setItem(FAVORITE_ART_KEY, JSON.stringify([...files]));
      } catch {
        // 저장에 실패해도 화면은 그대로 돈다. 잃는 것은 다음에 열었을 때의 기억뿐이다.
      }
    },
  };
}

/**
 * 한 그림을 담거나 뺀 새 목록을 만든다.
 *
 * 목록을 제자리에서 고치지 않고 **새것을 돌려주는** 이유는, 이 값을 들고 있는 곳이
 * `AppState` 라 리액트가 "바뀌었다"를 같음 비교로 판단하기 때문이다.
 */
export function toggleFavorite(files: readonly string[], file: string): string[] {
  return files.includes(file) ? files.filter((name) => name !== file) : [...files, file];
}
