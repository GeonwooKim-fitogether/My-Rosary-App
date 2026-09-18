/**
 * 기록을 파일 하나로 꺼내고 다시 넣는 규칙 (W3 슬라이스 C · `docs/plan/w3-work-order.md` §2).
 *
 * ── 왜 이것이 있나 ─────────────────────────────────────────────────────────────
 *
 * 이 앱에는 계정이 없다(`decisions.md` 결정 12-2 카드 A). 그래서 기록은 기기 안에만 있고,
 * 기기를 바꾸거나 앱을 지우면 통째로 사라진다. 로드맵 §7 의 위험 표가 그 위험의 **절반을
 * 파일 하나로 보완하라**고 적어 둔 자리가 여기다. 서버 없이 되는 최소 보완이며, 카드 A 가
 * 계정을 V1.5 로 미루기로 한 것은 이 받침을 전제로 한 결정이다.
 *
 * ── 이 파일은 화면도 저장소도 모른다 ────────────────────────────────────────────
 *
 * 여기 있는 것은 **읽고 쓰는 규칙**뿐이다. 파일을 실제로 내려받고 고르는 일은
 * `backupFile.ts` 가, 읽어 들인 값을 앱에 앉히는 일은 `src/state/appStore.ts` 가 한다.
 * 가른 까닭은 하나다 — 이 규칙이 이 슬라이스에서 가장 위험한 자리이고, 가장 위험한 자리는
 * 브라우저도 기기도 없이 시험할 수 있어야 하기 때문이다(`backup.test.ts`).
 *
 * ── 들어오는 값을 믿지 않는다 ───────────────────────────────────────────────────
 *
 * 내보낸 파일은 사람의 손을 거쳐 돌아온다. 텍스트 편집기로 열어 고쳤을 수도, 다른 앱의
 * 파일일 수도, 앞으로 나올 새 판의 파일일 수도 있다. **어느 경우에도 앱이 멎지 않고
 * "읽을 수 없는 파일입니다" 로 끝나야 하며, 그때 기기의 기록은 한 줄도 건드리지 않는다.**
 * 그래서 `parseBackup` 은 예외를 던지지 않고 `null` 을 돌려준다 — 부르는 쪽이 성공과 실패를
 * 값으로만 가르게 하려는 것이다. `parsePinnedArt` · `parseFavoriteArt` · `parseJourney` 가
 * 같은 정신으로 쓰여 있고, 여기서는 그것들을 **다시 쓴다** — 저장 자리를 읽을 때와 파일을
 * 읽을 때의 판정이 갈리면 어느 쪽이 정본인지 알 수 없게 되기 때문이다.
 *
 * ── 판 번호를 담는 까닭 ─────────────────────────────────────────────────────────
 *
 * 앞으로 저장하는 모양이 바뀌어도 옛 파일을 알아볼 수 있어야 한다. 그래서 파일 머리에
 * `kind`(이 앱의 파일인가)와 `version`(몇 판인가) 둘을 적는다. **모르는 판, 즉 이 앱이
 * 아는 것보다 높은 판은 읽지 않고 거절한다** — 새 판에서 생긴 칸을 옛 앱이 조용히 버리면
 * 사용자는 기록이 줄어든 것을 모른 채 그 파일을 덮어쓰게 된다. 낮은 판은 읽는다(지금은
 * 1 판뿐이라 해당 사항이 없고, 판이 늘면 여기에 옮김 규칙을 적는다).
 */
import type { Journey } from '../journey/session';
import { parseJourney, serializeJourney, type StoredJourney } from './journeys';
import { parseFavoriteArt } from './favoriteArt';
import { parsePinnedArt } from './pinnedArt';
import { DEFAULT_SETTINGS, parseSettings, type AppSettings } from './settings';

/** 이 앱의 파일이라는 표. 다른 앱의 JSON 을 들여오는 것을 여기서 막는다. */
export const BACKUP_KIND = 'myrosary.backup';

/** 지금 쓰는 판. 담는 모양이 바뀌면 올린다. */
export const BACKUP_VERSION = 1;

/** 파일에 실제로 적히는 모양. */
export interface BackupFile {
  kind: typeof BACKUP_KIND;
  version: number;
  /** 언제 꺼냈나 (ISO 문자열). 읽을 때 쓰지는 않고 사람이 파일을 가릴 때 쓴다. */
  exportedAt: string;
  journeys: StoredJourney[];
  settings: AppSettings;
  /** 고정한 성화의 파일 이름. 고정한 적이 없으면 null. */
  pinnedArt: string | null;
  /** 즐겨찾기에 담은 성화들의 파일 이름. */
  favoriteArt: string[];
}

/** 파일에서 읽어 낸 것 — 앱에 그대로 앉힐 수 있는 모양이다. */
export interface ParsedBackup {
  journeys: Journey[];
  settings: AppSettings;
  pinnedArt: string | null;
  favoriteArt: string[];
}

/** 파일로 나가는 값 한 벌. */
export interface BackupInput {
  journeys: readonly Journey[];
  settings: AppSettings;
  pinnedArt: string | null;
  favoriteArt: readonly string[];
}

/**
 * 담는 것 넷과 담지 않는 것 하나.
 *
 * 담는 것은 **오래 남는 기록**이다 — 여정 목록, 설정, 고정한 성화, 즐겨찾기.
 *
 * 담지 않는 것은 **오늘 바치던 자리**(`position.ts`)다. 그것은 기록이 아니라 한 번의 기도가
 * 어디까지 왔는지를 적어 둔 쪽지이고(FR-17), 다른 기기에서 다른 날 열면 가리키는 날이 이미
 * 지나 있다. 오늘 바쳤다는 사실 자체는 여정의 날짜 칸에 이미 들어 있으므로 잃는 것도 없다.
 * 대신 들여올 때 그 쪽지를 **지운다** — 지우지 않으면 이 기기에 남아 있던 쪽지가 방금 들어온
 * 남의 여정 번호를 가리키게 되어, 이어가기가 없는 여정을 열려 한다(`appStore.importBackup`).
 */
export function buildBackup(input: BackupInput, now: Date = new Date()): BackupFile {
  return {
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    journeys: input.journeys.map(serializeJourney),
    settings: { ...input.settings },
    pinnedArt: input.pinnedArt,
    favoriteArt: [...input.favoriteArt],
  };
}

/** 파일에 적을 글. 사람이 열어 볼 수 있게 두 칸씩 들여 쓴다. */
export function backupText(input: BackupInput, now: Date = new Date()): string {
  return JSON.stringify(buildBackup(input, now), null, 2);
}

/**
 * 파일 이름 — `myrosary-backup-2026-09-18.json`.
 *
 * 한글을 쓰지 않는다. 내려받은 파일 이름은 기기의 파일 목록과 클라우드 저장소를 거치는데,
 * 그 길목마다 한글이 다르게 적히는 일이 있어 사람이 자기 파일을 못 찾을 수 있다.
 */
export function backupFileName(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `myrosary-backup-${now.getFullYear()}-${month}-${day}.json`;
}

/**
 * 읽어 들인 글을 기록으로 돌린다. **읽을 수 없으면 `null` 이고, 그때 기기의 기록은 그대로다.**
 *
 * `null` 로 끝나는 경우는 다섯이다. 파일이 JSON 이 아니거나, JSON 이지만 꾸러미가 아니거나,
 * 이 앱의 파일이라는 표(`kind`)가 없거나, 판 번호가 없거나 이 앱이 아는 것보다 높거나,
 * 여정 자리가 목록이 아닐 때다.
 *
 * **그 다섯이 아니면 읽을 수 있는 만큼 읽는다.** 여정 하나가 깨져 있으면(예: 날짜가
 * `2026-13-45`) 그 하나만 버리고 나머지는 살린다 — 하나가 깨졌다고 나머지 기도 기록까지
 * 잃게 할 수는 없기 때문이며, `parseJourneys` 가 저장 자리를 읽을 때 이미 같은 판단을 한다.
 * 설정과 성화 자리가 아예 없거나 엉뚱한 값이면 기본값으로 메운다.
 */
export function parseBackup(raw: string | null): ParsedBackup | null {
  if (typeof raw !== 'string' || raw.trim() === '') return null;

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const file = value as Partial<BackupFile>;
  if (file.kind !== BACKUP_KIND) return null;
  if (typeof file.version !== 'number' || !Number.isFinite(file.version)) return null;
  if (file.version > BACKUP_VERSION) return null;
  if (!Array.isArray(file.journeys)) return null;

  return {
    journeys: file.journeys.map(parseJourney).filter((journey): journey is Journey => journey !== null),
    // 아래 셋은 저장 자리를 읽는 판정을 그대로 다시 쓴다. 그 함수들이 글 하나를 받으므로
    // 꾸러미를 다시 글로 만들어 넘긴다 — 판정을 두 벌로 나누지 않으려는 것이다.
    settings:
      file.settings && typeof file.settings === 'object'
        ? parseSettings(JSON.stringify(file.settings))
        : { ...DEFAULT_SETTINGS },
    pinnedArt: parsePinnedArt(typeof file.pinnedArt === 'string' ? file.pinnedArt : null),
    favoriteArt: Array.isArray(file.favoriteArt) ? parseFavoriteArt(JSON.stringify(file.favoriteArt)) : [],
  };
}
