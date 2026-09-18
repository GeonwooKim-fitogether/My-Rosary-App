/**
 * 웹 빌드(`dist/`)를 그냥 띄워 주는 아주 작은 정적 서버.
 *
 * Playwright 가 화면을 열려면 파일을 http 로 내주는 무엇인가가 있어야 하는데, 그
 * 하나를 위해 서버 꾸러미를 새로 들이지 않았다. 노드에 이미 있는 http 모듈로 충분하다.
 *
 * 한 가지만 특별하다 — Expo 의 정적 내보내기는 화면마다 `pray.html` 같은 파일을 만드는데
 * 앱 안의 주소는 `/pray` 다. 그래서 확장자가 없는 주소가 오면 `.html` 을 붙여 찾는다.
 *
 *   node tools/e2e/serve-dist.mjs [포트]
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('../../dist/', import.meta.url).pathname;
const port = Number(process.argv[2] ?? 8081);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** 주소 하나로 실제 파일 하나를 찾는다. 못 찾으면 null. */
async function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidates = [];
  if (clean === '/' || clean === '') candidates.push('index.html');
  else {
    candidates.push(clean.slice(1));
    if (!extname(clean)) candidates.push(`${clean.slice(1)}.html`);
  }
  for (const candidate of candidates) {
    const full = join(root, candidate);
    try {
      const info = await stat(full);
      if (info.isFile()) return full;
    } catch {
      // 다음 후보로.
    }
  }
  return null;
}

createServer(async (request, response) => {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost');
  const file = await resolveFile(pathname);
  if (!file) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('없는 자리입니다');
    return;
  }
  response.writeHead(200, {
    'content-type': MIME[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  /*
   * 스트림을 응답과 함께 반드시 닫는다.
   *
   * `pipe` 만 걸어 두면 **받는 쪽이 중간에 끊었을 때 읽던 파일이 열린 채로 남는다.**
   * 브라우저는 화면을 옮길 때 받던 중인 그림 요청을 그냥 끊으므로, 이 일이 수백 번
   * 쌓이면 서버가 새 요청을 받지 못하게 된다. 기도 화면이 성화를 화면 전체 배경으로
   * 쓰게 된 뒤(W1) 큰 그림 요청이 크게 늘어 이 새는 자리가 실제로 드러났다.
   *
   * 그래서 셋을 함께 건다 — 응답이 닫히면 읽기를 멈추고, 읽다가 실패하면 응답을 끊고,
   * 스트림이 끝나면 아무 일도 하지 않는다(그때는 `pipe` 가 스스로 닫는다).
   */
  const stream = createReadStream(file);
  stream.on('error', () => response.destroy());
  response.on('close', () => stream.destroy());
  stream.pipe(response);
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(`dist 를 http://127.0.0.1:${port} 로 내보냅니다\n`);
});
