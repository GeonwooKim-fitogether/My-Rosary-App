/**
 * Playwright 설정 — 웹 빌드를 실제 브라우저로 열어 확인한다.
 *
 * 이 환경의 사실 두 가지가 설정을 이렇게 만들었다.
 *
 * 1. **브라우저를 새로 내려받지 않는다.** 컨테이너에 크로미움이 이미 깔려 있고
 *    (`/opt/pw-browsers`), Playwright 가 기대하는 판번호와 다르다. 그래서 실행 파일
 *    자리를 직접 가리킨다. `playwright install` 은 이 환경에서 돌리지 않는다.
 * 2. **화면 크기는 390×844 를 쓴다.** v5 시안이 그 크기의 기기 틀로 그려졌기 때문이고,
 *    헤드리스 크로미움의 `--window-size` 는 배치에 쓰이는 화면 크기와 1대1로 맞지 않아
 *    잘린 그림이 나오는 것을 이 저장소에서 실측했다. 그래서 창 크기가 아니라 Playwright
 *    의 `viewport` 로 정한다.
 */
import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * 이 컨테이너에 이미 깔려 있는 크로미움. 있으면 그것을 쓰고, 없으면(예: GitHub
 * Actions) Playwright 가 자기 것을 찾게 둔다. 그래서 이 설정 파일 하나가 두 곳에서
 * 모두 돈다 — 여기서만 도는 설정을 만들면 CI 에서 조용히 건너뛰어진다.
 */
const LOCAL_CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const launchOptions = existsSync(LOCAL_CHROMIUM) ? { executablePath: LOCAL_CHROMIUM } : {};

const PORT = 8081;

export default defineConfig({
  testDir: './e2e',
  /* 한 번 완주에 77단계가 걸린다. 가짜 시계로 시간을 앞당기지만 그래도 넉넉히 둔다. */
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    launchOptions,
  },
  projects: [
    {
      name: '기기 크기 브라우저',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
    },
  ],
  webServer: {
    command: `node tools/e2e/serve-dist.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
