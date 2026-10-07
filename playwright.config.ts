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
  /*
   * CI 에서는 GitHub 리포터를 함께 켠다. 이 리포터는 실패를 GitHub 의 주석(annotation)
   * 으로 올려 주는데, 그 주석은 API 로 읽을 수 있다 — 이 개발 환경에서는 Actions 의
   * 로그 파일을 내려받는 통로가 막혀 있어(저장소 호스트가 프록시에 걸린다) 실패 이유를
   * 볼 수 있는 유일한 창이 그 주석이다.
   */
  reporter: process.env.CI ? [['github'], ['line']] : 'list',
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
  /*
   * 서버는 **언제나 새로 띄운다.** 이미 떠 있는 것을 재사용하지 않는다.
   *
   * 원래는 `reuseExistingServer: !process.env.CI` 로 두어 지역에서는 재사용했는데, 그
   * 편의가 2026-09-18 에 같은 함정으로 두 번 물었다. 한 번은 **낡은 `dist`** 를 내주는
   * 서버가 남아 있어 고친 화면이 아니라 옛 화면을 시험했고, 한 번은 **낡은 서버 코드**가
   * 남아 있어 이미 고친 결함(끊긴 응답에 서버가 죽는 것)이 계속 재현됐다. 두 경우 다
   * 오류가 나지 않고 **시험 결과만 조용히 틀려서**, 원인을 찾는 데 오래 걸렸다.
   *
   * 재사용을 끄면 포트가 이미 쓰이고 있을 때 Playwright 가 **소리 내어 멈춘다.** 조용히
   * 엉뚱한 것을 시험하는 것보다 그 편이 낫다.
   */
  webServer: {
    command: `node tools/e2e/serve-dist.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
