/**
 * 지역별 성화 뽑기 — 「MyRosary World」 시안의 표(`worldPlates.ts`)를 **뽑기가 쓰는 모양**으로
 * 옮긴다 (W2 슬라이스 C · `docs/plan/w2-work-order.md` §2).
 *
 * ── 왜 표를 바꾸는 대신 모양을 맞추나 ────────────────────────────────────────────
 *
 * 뽑기(`session.ts`)와 그것을 쓰는 화면 여섯(로그인 · 홈 · 오늘의 신비 · 기도 · 하루 완주 ·
 * 여정 완주)은 v5 의 성화 모양(`ArtPlate`)을 전제로 서 있다. 그 모양은 그림 하나가 **자리
 * 넷**(로그인 · 썸네일 · 기도 배경 · 완주)마다 다른 초점을 갖는다. 반면 새 시안의 표
 * (`WorldPlate`)는 그림마다 초점을 **하나만** 갖는다.
 *
 * 그래서 이 파일이 하는 일은 하나다 — **새 표의 그림을 옛 모양으로 감싸** 화면을 한 줄도
 * 고치지 않고 뽑기의 밑감만 갈아 끼우는 것. 화면을 고치지 않는 것이 이 마일스톤의 경계이기도
 * 하다(기도 화면과 하루 완주 화면은 W1 에서 끝났다).
 *
 * ── 자리 넷의 초점을 하나에서 어떻게 만드나 ─────────────────────────────────────
 *
 * **셋은 시안의 초점을 그대로 쓴다.** 시안은 홈 · 오늘의 신비 · 갤러리 · 지역 화면에서 같은
 * 그림에 언제나 같은 `background-position` 을 준다(`data.js` 의 `focal`).
 *
 * **기도 배경 하나만 아래로 내린다.** 시안 자신이 그렇게 한다 — 기도 화면을 그릴 때
 * `focal` 의 세로값에 14 를 더하고 60% 를 넘지 않게 자른다(시안 마크업의 `prayImg`). 기도
 * 화면은 위쪽에 묵주 고리가 서므로 얼굴이 조금 아래에 놓여야 가리지 않기 때문이고, 이
 * 파일은 그 식을 글자 그대로 옮긴다.
 *
 * ── 쓸 수 없는 자리는 없다 ──────────────────────────────────────────────────────
 *
 * v5 의 표는 그림 넷에 `excludedSlots` 를 달아 두었다(세로로 긴 자리에서 이목구비가 잘리는
 * 조합). 새 표에는 그런 목록이 없고, 시안은 열여섯 장을 자리 가림 없이 모든 화면에 쓴다.
 * 없는 제한을 지어 넣지 않으므로 여기서 만드는 그림은 모두 네 자리를 통과한다.
 */
import type { RegionKey } from '../theme/worldTokens';
import type { ArtPlate, ArtSlot } from './plates';
import { REGION_PLATES, WORLD_PLATES, type WorldPlate } from './worldPlates';

/**
 * 기도 배경에서 초점을 아래로 내리는 정도와 상한 — 시안의 `Math.min(60, +y + 14)`.
 * 두 값 모두 시안 마크업에서 글자 그대로 왔다.
 */
const PRAYER_FOCAL_SHIFT = 14;
const PRAYER_FOCAL_MAX = 60;

/** `'22%'` 같은 값에서 숫자만 뽑는다. 퍼센트가 아니면 그대로 둔다는 뜻으로 null 을 낸다. */
function percentOf(value: string): number | null {
  const match = /^(\d+(?:\.\d+)?)%$/.exec(value.trim());
  return match ? Number(match[1]) : null;
}

/** 기도 배경의 세로 초점 — 시안이 같은 자리에서 쓰는 식 그대로다. */
export function prayerFocalY(focalY: string): string {
  const y = percentOf(focalY);
  if (y === null) return focalY;
  return `${Math.min(PRAYER_FOCAL_MAX, y + PRAYER_FOCAL_SHIFT)}%`;
}

/** 새 시안의 그림 한 장을 뽑기가 쓰는 모양으로 감싼다. */
export function worldArtPlate(plate: WorldPlate): ArtPlate {
  const focal = { x: plate.focal.x, y: plate.focal.y };
  const focus: Record<ArtSlot, { x: string; y: string }> = {
    login: focal,
    thumb: focal,
    prayer: { x: focal.x, y: prayerFocalY(focal.y) },
    finish: focal,
  };
  return { file: plate.file, source: plate.source, focus, excludedSlots: [] };
}

/**
 * 그 지역이 쓰는 그림들 — 시안의 `REGIONS[].images` 차례 그대로다.
 *
 * @param also 지역 목록에 없더라도 반드시 넣을 그림의 **파일 이름**들. 고정한 성화가 다른
 *   지역의 것일 때 쓴다 — 사람이 직접 고정한 그림은 지역이 바뀌어도 사라지지 않아야 한다.
 */
export function regionArtPlates(
  region: RegionKey,
  also: readonly string[] = [],
): ArtPlate[] {
  const plates = REGION_PLATES[region].map((id) => worldArtPlate(WORLD_PLATES[id]!));
  for (const file of also) {
    if (plates.some((plate) => plate.file === file)) continue;
    const found = Object.values(WORLD_PLATES).find((plate) => plate.file === file);
    if (found) plates.push(worldArtPlate(found));
  }
  return plates;
}
