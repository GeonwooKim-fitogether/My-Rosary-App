/**
 * 기록 내보내기·들여오기 e2e (W3 슬라이스 C).
 *
 * 단위 시험(`src/storage/backup.test.ts`)이 답하지 못하는 물음이 둘 있어서 이 파일이 있다.
 *
 * 1. **사용자가 그 두 줄에 닿는가.** 단위 시험은 "부르면 맞게 도나" 만 답한다. 여기서는 아래
 *    탭 바의 `설정` 을 눌러 들어간 자리에서 두 줄을 찾는다 — 주소를 직접 열지 않는다.
 * 2. **파일이 정말 기기 밖으로 나가고 다시 들어오는가.** 브라우저의 내려받기와 파일 고르기는
 *    브라우저 없이는 확인할 수 없다.
 *
 * 세 갈래를 모두 지난다 — 깨진 파일을 넣었을 때, 확인 시트에서 물러섰을 때, 그리고 들여왔을 때.
 * 가운데 갈래가 특히 중요하다: **묻기만 하고 아직 바꾸지 않는다**는 것을 보이는 자리다.
 */
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { collectConsoleErrors, enterHome, openApp, openSettings } from './support/harness';

test.use({ reducedMotion: 'reduce' });

/** 파일 고르개에 글 하나를 건넨다 — 사람이 파일을 골라 준 것과 같다. */
async function chooseFile(page: import('@playwright/test').Page, text: string) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('settings-import').click();
  await (
    await chooser
  ).setFiles({ name: 'myrosary-backup.json', mimeType: 'application/json', buffer: Buffer.from(text, 'utf-8') });
}

test('설정에서 기록을 파일로 내보내고 그 파일을 다시 들여온다', async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await openApp(page);
  await enterHome(page);
  await openSettings(page);

  // ── 두 줄이 설정 화면에 서 있다 (탭으로 들어온 자리다) ──────────────────────
  await expect(page.getByTestId('settings-export')).toBeVisible();
  await expect(page.getByTestId('settings-export')).toContainText('여정 1개와 설정을 파일 하나로');
  await expect(page.getByTestId('settings-import')).toBeVisible();

  // 들여온 뒤에 달라지는 것을 보려고, 먼저 설정 하나를 바꿔 파일에 담는다.
  await page.getByTestId('settings-pace').click();
  await page.getByTestId('sheet-choice-slow').click();
  await expect(page.getByTestId('settings-pace-value')).toHaveText('느리게');

  // ── 내보내기 — 실제로 파일이 내려온다 ──────────────────────────────────────
  const download = page.waitForEvent('download');
  await page.getByTestId('settings-export').click();
  const file = await download;
  // 이름은 한글 없이 날짜로 짓는다. 시험의 오늘이 2026년 9월 5일이므로 값이 고정된다.
  expect(file.suggestedFilename()).toBe('myrosary-backup-2026-09-05.json');
  await expect(page.getByTestId('settings-backup-notice')).toContainText('내려받았습니다');

  // 내려온 글을 열어 본다 — 파일이 만들어졌다는 것만으로는 무엇이 담겼는지 알 수 없다.
  const saved = JSON.parse(readFileSync((await file.path())!, 'utf-8'));
  expect(saved.kind).toBe('myrosary.backup');
  expect(saved.version).toBe(1);
  expect(saved.journeys).toHaveLength(1);
  expect(saved.journeys[0].title).toBe('어머니 병환 회복');
  expect(saved.settings.pace).toBe('slow');

  // ── 깨진 파일을 넣으면 앱이 멎지 않고 기록도 그대로다 ───────────────────────
  await chooseFile(page, '이건 기록 파일이 아닙니다');
  await expect(page.getByTestId('settings-backup-notice')).toContainText('읽을 수 없는 파일입니다');
  // 확인 시트는 뜨지 않았고, 여정 수도 그대로다.
  await expect(page.getByTestId('sheet-import')).toBeHidden();
  await expect(page.getByTestId('settings-export')).toContainText('여정 1개');

  /*
    ── 확인 시트에서 물러서면 아무것도 바뀌지 않는다 ─────────────────────────
    이 갈래가 이 시험의 핵심이다. 들여오기는 되돌릴 수 없으므로, 고른 것만으로는 아무 일도
    일어나지 않고 사람이 시트에서 한 번 더 눌러야 한다는 것을 여기서 못 박는다.
  */
  const twoJourneys = JSON.parse(readFileSync((await file.path())!, 'utf-8'));
  twoJourneys.journeys.push({ ...twoJourneys.journeys[0], id: 'j2', title: '아버지를 위하여' });
  twoJourneys.settings.pace = 'fast';

  await chooseFile(page, JSON.stringify(twoJourneys));
  await expect(page.getByTestId('sheet-import')).toBeVisible();
  // 시트는 잃을 것과 얻을 것을 수로 말한다.
  await expect(page.getByTestId('sheet-import')).toContainText('여정 1개와 설정이 사라지고');
  await expect(page.getByTestId('sheet-import')).toContainText('여정 2개와 설정으로 바뀝니다');
  await page.getByTestId('sheet-cancel').click();
  await expect(page.getByTestId('sheet-import')).toBeHidden();
  await expect(page.getByTestId('settings-export')).toContainText('여정 1개');
  await expect(page.getByTestId('settings-pace-value')).toHaveText('느리게');

  // ── 들여오기 — 이제 정말 갈아 끼운다 ──────────────────────────────────────
  await chooseFile(page, JSON.stringify(twoJourneys));
  await expect(page.getByTestId('sheet-import')).toBeVisible();
  await page.getByTestId('sheet-confirm').click();
  await expect(page.getByTestId('sheet-import')).toBeHidden();
  await expect(page.getByTestId('settings-backup-notice')).toContainText('여정 2개와 설정을 들여왔습니다');
  await expect(page.getByTestId('settings-export')).toContainText('여정 2개');
  await expect(page.getByTestId('settings-pace-value')).toHaveText('빠르게');

  // 들여온 것은 기기에 남는다 — 화면을 다시 열어도 그대로다.
  await page.reload();
  await expect(page.getByTestId('settings-screen')).toBeVisible();
  await expect(page.getByTestId('settings-export')).toContainText('여정 2개');
  await expect(page.getByTestId('settings-pace-value')).toHaveText('빠르게');

  expect(errors).toEqual([]);
});
