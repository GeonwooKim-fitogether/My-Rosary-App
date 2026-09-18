/**
 * 이번 세션의 성화 뽑기 — 화면 여섯이 같은 그림을 보게 하는 한 곳.
 *
 * ── W2 슬라이스 C 에서 무엇이 달라졌나 ──────────────────────────────────────────
 *
 * 그전까지 이 파일은 v5 의 성화 열여섯 장에서 **무작위로** 한 번 섞고 끝이었다. 이제는
 * 새 시안의 **지역별 묶음**(`worldPlates.ts` 의 `REGION_PLATES`)에서 뽑고, 아래 셋을 지킨다.
 *
 * 1. **열 때마다 다른 그림.** 다만 바로 앞에 보여 준 그림은 이어서 나오지 않는다 —
 *    앱을 열 때 그 이름을 기억해 두었다가 다음 번 순서의 맨 앞에서 밀어낸다.
 * 2. **고정한 그림이 있으면 그것.** 하루 완주 화면의 `이 성화 고정하기` 가 남긴 이름이며
 *    (`src/storage/pinnedArt.ts`), **W1 이 값만 저장해 두었던 그 자리가 여기서 배선된다.**
 *    고정한 그림이 지금 지역의 묶음에 없어도 목록에 넣는다 — 사람이 직접 고른 것이기 때문이다.
 * 3. **기도 중에는 바뀌지 않는다.** 그림은 여정 번호로 배정되고 한 번 배정되면 그대로다.
 *    뽑기를 다시 여는 자리는 셋뿐이고(앱을 열 때 · 지역을 바꿀 때 · 성화를 고정할 때) 셋 다
 *    기도 화면 밖이다.
 *
 * ── 왜 상수가 아니라 갈아 끼울 수 있는 것인가 ───────────────────────────────────
 *
 * 지역이 바뀌면 그림 묶음이 통째로 바뀌어야 한다(W2 통과 조건 3). 그런데 화면들은 이 파일이
 * 내보내는 `artSession` 을 **이름으로** 들고 있으므로, 그 이름이 가리키는 것을 바꿔치기하면
 * 화면 여섯을 한 줄도 고치지 않고 묶음을 갈 수 있다. 그래서 진짜 뽑기(`session`)는 안에
 * 숨기고, 밖으로는 그것에 말을 거는 껍데기 하나만 내보낸다.
 *
 * ── 씨앗 (`decisions.md` Q-57) ──────────────────────────────────────────────────
 *
 * 뽑기가 난수라 화면 사진을 다시 찍을 때마다 그림이 달라져, 아무것도 고치지 않아도 사진
 * 커밋에 뜻 없는 변경이 섞였다. `configureArtSession` 에 씨앗을 넘기면 순서가 언제나 같아진다.
 * 씨앗을 넘기는 자리는 **웹 주소의 손잡이 `?art=<숫자>` 하나뿐**이고(`app/_layout.tsx`),
 * 실제 사용자는 그 주소를 지나가지 않는다 — `?demo=1` 과 같은 성격의 진단용 손잡이다.
 */
import { DEFAULT_SETTINGS } from '../storage/settings';
import type { RegionKey } from '../theme/worldTokens';
import type { ArtPlate } from './plates';
import { createArtSession, type ArtSession } from './session';
import { regionArtPlates } from './worldSession';

export interface ArtSessionConfig {
  /** 어느 지역의 묶음에서 뽑나. */
  region: RegionKey;
  /** 고정한 성화의 파일 이름. 있으면 그것이 맨 앞에 선다. */
  pinned?: string | null;
  /** 바로 앞에 보여 준 그림의 파일 이름. 그것이 이어서 다시 나오지 않게 한다. */
  avoid?: string | null;
  /** 씨앗. 주면 순서가 언제나 같아진다 (사진을 찍는 e2e 전용). */
  seed?: number;
}

/**
 * 주소에 걸린 씨앗을 읽는다 — `?art=<숫자>` (`app/_layout.tsx` 가 같은 손잡이를 읽는다).
 *
 * **왜 첫 뽑기도 이 값을 읽어야 하나.** 저장된 것을 읽는 일은 비동기라, 그것이 끝나기 전에
 * 첫 화면(로그인)이 이미 그림을 묻는다. 그 첫 뽑기에 씨앗이 없으면 **난수로** 답하고, 읽기가
 * 끝난 뒤 씨앗을 물린 새 뽑기로 갈린다. 즉 씨앗을 걸어 두어도 순서가 한 번은 난수로 정해지는
 * 구간이 남아 있었다. 이미 쓴 그림은 다시 집지 않는 방식이므로(비복원 추출), 그 구간에서
 * 누가 먼저 묻느냐에 따라 뒤의 배정까지 갈릴 수 있다.
 *
 * 첫 뽑기가 같은 씨앗을 읽으면 첫 순서와 다시 연 순서가 **같은 순서**가 되어 그 구간이
 * 사라진다. 씨앗이 걸리지 않은 실제 사용자에게는 아무 영향이 없다 — 아래 함수가
 * `undefined` 를 돌려주어 지금까지와 똑같이 난수로 열린다.
 *
 * **정직하게 적어 둘 것 하나.** 이 구간이 실제로 사진을 흔드는 것을 이 컨테이너에서는
 * 재현하지 못했다 — 이 줄을 넣기 전과 넣은 뒤 모두, 흔들린다던 두 장(`w2-screens/
 * home-resume.png` · `home-again-sheet.png`)이 열한 번을 돌려도 한 바이트도 달라지지
 * 않았고 두 상태의 결과가 서로 같았다(2026-09-18 실측). 그래도 이 줄을 두는 까닭은 위의
 * 난수 구간이 **글로 따져도 분명히 있는** 것이고, 없애는 값이 진단용 손잡이를 쓸 때만
 * 지나가는 길이라 잃는 것이 없기 때문이다.
 */
function seedFromLocation(): number | undefined {
  if (typeof window === 'undefined' || typeof window.location === 'undefined') return undefined;
  const value = new URLSearchParams(window.location.search).get('art');
  if (value === null) return undefined;
  const seed = Number(value);
  return Number.isFinite(seed) ? seed : undefined;
}

/** 아직 설정을 읽기 전의 뽑기. 기본 지역으로 열어 두어 첫 그림이 비지 않게 한다. */
let session = createArtSession({
  plates: regionArtPlates(DEFAULT_SETTINGS.region),
  seed: seedFromLocation(),
});

/**
 * 뽑기를 다시 연다. 앱을 열 때 · 지역을 바꿀 때 · 성화를 고정할 때 불린다.
 *
 * @returns 이번 순서에서 **맨 먼저 집히는 그림**. 부르는 쪽이 그 이름을 기억해 두면
 *   다음에 열 때 `avoid` 로 넘겨 같은 그림이 두 번 이어 나오는 것을 막을 수 있다.
 */
export function configureArtSession(config: ArtSessionConfig): ArtPlate | null {
  const pinned = config.pinned ?? null;
  session = createArtSession({
    plates: regionArtPlates(config.region, pinned ? [pinned] : []),
    forced: pinned ? [pinned] : undefined,
    avoid: config.avoid ?? undefined,
    seed: config.seed,
  });
  return session.order()[0] ?? null;
}

/**
 * 화면들이 들고 있는 이름. 안의 뽑기가 갈려도 이 껍데기는 그대로이므로,
 * 화면은 지역이 바뀌었다는 사실을 알 필요가 없다.
 */
export const artSession: ArtSession = {
  take: (slots) => session.take(slots),
  forKey: (key, slots) => session.forKey(key, slots),
  forJourney: (journeyId) => session.forJourney(journeyId),
  order: () => session.order(),
};
