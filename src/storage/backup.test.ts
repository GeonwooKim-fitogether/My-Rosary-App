/**
 * 기록 내보내기·들여오기 시험 (W3 슬라이스 C).
 *
 * 이 시험의 무게는 **깨진 파일** 쪽에 있다. 내보낸 파일은 사람의 손을 거쳐 돌아오므로
 * 텍스트 편집기로 고쳐졌을 수도, 다른 앱의 파일일 수도, 앞으로 나올 새 판의 파일일 수도
 * 있다. 그때 앱이 멎으면 사람은 기록을 되찾으려다 앱을 잃는다. 그래서 읽을 수 없는
 * 모양마다 한 줄씩 두어, `parseBackup` 이 **예외 대신 `null`** 을 돌려주는 것을 못 박는다.
 *
 * 나머지 절반은 "꺼낸 것이 그대로 돌아오는가"다. 이것이 서지 않으면 파일은 있으나 기록은
 * 없는 것과 같다.
 */
import {
  BACKUP_KIND,
  BACKUP_VERSION,
  backupFileName,
  backupText,
  buildBackup,
  parseBackup,
  type BackupInput,
} from './backup';
import { DEFAULT_SETTINGS } from './settings';
import type { Journey } from '../journey/session';

const journey: Journey = {
  id: 'j1',
  title: '어머니 병환 회복',
  format: 'fiftyfour',
  startDate: new Date(2026, 7, 14),
  days: ['prayed', 'missed', 'today'],
  kind: 'petition',
  recitation: 'alternate',
};

const input: BackupInput = {
  journeys: [journey],
  settings: { ...DEFAULT_SETTINGS, pace: 'slow', region: 'southamerica' },
  pinnedArt: '04-cross.jpg',
  favoriteArt: ['10-blue-mary.jpg', '01-mary-single.jpg'],
};

/** 파일 한 벌을 손으로 지어 글로 만든다. 깨뜨릴 자리를 인자로 덮어쓴다. */
function fileText(patch: Record<string, unknown> = {}): string {
  return JSON.stringify({ ...buildBackup(input), ...patch });
}

describe('기록 파일 — 꺼낸 것이 그대로 돌아온다', () => {
  it('여정·설정·고정한 성화·즐겨찾기 넷이 그대로 돌아온다', () => {
    const read = parseBackup(backupText(input));
    expect(read).not.toBeNull();
    expect(read!.journeys).toHaveLength(1);
    expect(read!.journeys[0]).toEqual(journey);
    expect(read!.settings.pace).toBe('slow');
    expect(read!.settings.region).toBe('southamerica');
    expect(read!.pinnedArt).toBe('04-cross.jpg');
    expect(read!.favoriteArt).toEqual(['10-blue-mary.jpg', '01-mary-single.jpg']);
  });

  it('파일 머리에 이 앱의 표와 판 번호가 적힌다', () => {
    const file = buildBackup(input, new Date(2026, 8, 18, 10, 0, 0));
    expect(file.kind).toBe(BACKUP_KIND);
    expect(file.version).toBe(BACKUP_VERSION);
    expect(file.exportedAt).toContain('2026-09-18');
    // 여정의 날짜는 시각이 아니라 날짜 문자열로 담긴다 (`journeys.ts` 와 같은 규칙).
    expect(file.journeys[0]!.startDate).toBe('2026-08-14');
  });

  it('파일 이름은 한글 없이 날짜로 짓는다', () => {
    expect(backupFileName(new Date(2026, 8, 18))).toBe('myrosary-backup-2026-09-18.json');
    expect(backupFileName(new Date(2026, 11, 3))).toBe('myrosary-backup-2026-12-03.json');
  });

  it('여정이 하나도 없어도 꺼내고 다시 넣을 수 있다', () => {
    const read = parseBackup(backupText({ ...input, journeys: [] }));
    expect(read).not.toBeNull();
    expect(read!.journeys).toEqual([]);
  });
});

describe('기록 파일 — 깨진 것을 넣으면 읽지 않고 거절한다', () => {
  it('빈 글이면 읽을 수 없다', () => {
    expect(parseBackup('')).toBeNull();
    expect(parseBackup('   ')).toBeNull();
    expect(parseBackup(null)).toBeNull();
  });

  it('JSON 이 아니면 읽을 수 없다', () => {
    expect(parseBackup('이건 그냥 글입니다')).toBeNull();
    expect(parseBackup('{')).toBeNull();
  });

  it('JSON 이지만 꾸러미가 아니면 읽을 수 없다', () => {
    expect(parseBackup('[]')).toBeNull();
    expect(parseBackup('12')).toBeNull();
    expect(parseBackup('null')).toBeNull();
  });

  it('이 앱의 파일이라는 표가 없으면 읽을 수 없다', () => {
    expect(parseBackup(fileText({ kind: undefined }))).toBeNull();
    expect(parseBackup(fileText({ kind: 'other.app.backup' }))).toBeNull();
    // 여정 목록만 담긴 다른 앱의 파일이 우연히 모양이 같아도 표가 없으면 들어오지 못한다.
    expect(parseBackup('{"journeys":[]}')).toBeNull();
  });

  it('판 번호가 없거나 이 앱이 아는 것보다 높으면 읽을 수 없다', () => {
    expect(parseBackup(fileText({ version: undefined }))).toBeNull();
    expect(parseBackup(fileText({ version: '1' }))).toBeNull();
    expect(parseBackup(fileText({ version: BACKUP_VERSION + 1 }))).toBeNull();
  });

  it('여정 자리가 목록이 아니면 읽을 수 없다', () => {
    expect(parseBackup(fileText({ journeys: undefined }))).toBeNull();
    expect(parseBackup(fileText({ journeys: '어머니 병환 회복' }))).toBeNull();
    expect(parseBackup(fileText({ journeys: { j1: journey } }))).toBeNull();
  });
});

describe('기록 파일 — 읽을 수 있는 만큼만 읽는다', () => {
  it('날짜가 말이 안 되는 여정 하나만 버리고 나머지는 살린다', () => {
    const broken = { ...buildBackup(input).journeys[0]!, id: 'j2', startDate: '2026-13-45' };
    const read = parseBackup(fileText({ journeys: [broken, buildBackup(input).journeys[0]] }));
    expect(read).not.toBeNull();
    expect(read!.journeys.map((j) => j.id)).toEqual(['j1']);
  });

  it('여정 안에 여정 아닌 것이 섞여 있어도 나머지를 살린다', () => {
    const read = parseBackup(fileText({ journeys: [null, 3, '글', buildBackup(input).journeys[0]] }));
    expect(read!.journeys.map((j) => j.id)).toEqual(['j1']);
  });

  it('설정이 없거나 엉뚱하면 기본값으로 메운다', () => {
    expect(parseBackup(fileText({ settings: undefined }))!.settings).toEqual(DEFAULT_SETTINGS);
    expect(parseBackup(fileText({ settings: '보통' }))!.settings).toEqual(DEFAULT_SETTINGS);
    // 아는 값만 골라 쓴다 — 모르는 낭송 방식은 기본값으로 떨어진다 (`parseSettings` 의 규칙).
    const odd = parseBackup(fileText({ settings: { pace: 'slow', recitation: '아주 빠르게' } }));
    expect(odd!.settings.pace).toBe('slow');
    expect(odd!.settings.recitation).toBe(DEFAULT_SETTINGS.recitation);
  });

  it('성화 두 자리가 깨져 있어도 읽힌다', () => {
    const read = parseBackup(fileText({ pinnedArt: 42, favoriteArt: '목록이 아님' }));
    expect(read!.pinnedArt).toBeNull();
    expect(read!.favoriteArt).toEqual([]);
    // 목록 안에 이름 아닌 것이 섞여 있으면 그것만 빠진다.
    expect(parseBackup(fileText({ favoriteArt: ['a.jpg', 7, '', 'a.jpg', 'b.jpg'] }))!.favoriteArt).toEqual([
      'a.jpg',
      'b.jpg',
    ]);
  });
});
