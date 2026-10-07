#!/usr/bin/env node
/**
 * 기획 문서를 검토용 PDF 한 권으로 묶는다.
 *
 * 왜 있나. 공방장이 기획 문서를 밖에 보내 검토받으려 했는데, 문서는 저장소 안에
 * 마크다운 여덟 개로 흩어져 있다. 저장소를 열 줄 모르는 검토자에게는 그것이 없는 것과
 * 같다. 그래서 정해진 순서로 이어 붙여 표지·차례·구분 쪽이 있는 PDF 한 권을 만든다.
 *
 * 어떻게 하나. 마크다운을 HTML 로 바꾸고(marked), 저장소에 든 Noto 한국어 글꼴을
 * file:// 로 물려 Chromium(Playwright)으로 A4 PDF 를 찍는다. 글꼴을 파일에 심지 않고
 * 경로로 물리는 이유는 이 HTML 이 배포물이 아니라 PDF 를 찍기 위한 중간물이기 때문이다.
 *
 * 쓰는 법.  node tools/pack/pack-docs.mjs            → dist-docs/myrosary-docs.pdf
 *          node tools/pack/pack-docs.mjs --html      → PDF 와 함께 중간 HTML 도 남긴다
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const outDir = resolve(root, 'dist-docs');
const keepHtml = process.argv.includes('--html');

/** 검토자가 읽을 순서. 제품이 무엇인지 → 무엇을 만들기로 했나 → 어디까지 왔나 → 무엇을 정했나. */
const DOCS = [
  { file: 'docs/product/README.md', part: '들어가며', note: '문서 묶음이 어디서 왔고 어떤 순서로 읽는지' },
  { file: 'docs/product/06-prd.md', part: '제품', note: '무엇을 만들고 왜 이기는가 — 요구사항 마흔둘의 정본' },
  { file: 'docs/product/06-service-design.md', part: '제품', note: '사업 모델과 서비스 구조' },
  { file: 'docs/product/06-screen-map.md', part: '제품', note: '화면 지도와 시나리오 검증' },
  { file: 'docs/product/06-screen-spec.md', part: '제품', note: '화면 하나하나의 명세' },
  { file: 'docs/product/06-design-system.md', part: '제품', note: '색·글꼴·간격·묵주 그림의 규칙' },
  { file: 'spec/journey-rules.md', part: '제품', note: '54일 여정과 하루 81단계의 도메인 규칙' },
  { file: 'docs/plan/development-plan.md', part: '개발', note: '마일스톤과 팀' },
  { file: 'docs/plan/implementation-audit.md', part: '개발', note: '요구사항 마흔둘 대비 지금 구현된 것' },
  { file: 'docs/plan/edge-plan.md', part: '기획', note: '우위가 어디서 나올 것인가 — 다시 묻는 기획안' },
  { file: 'decisions.md', part: '결정', note: '결정 로그와 결정 큐 — 무엇을 왜 정했나' },
];

/** 마크다운 → HTML. marked 를 프로젝트에 설치하지 않고 npx 로 부른다. */
function markdownToHtml(markdown) {
  return execFileSync('npx', ['--yes', 'marked', '--gfm'], {
    input: markdown,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

/** 첫 번째 `# ` 제목을 문서 제목으로 뽑는다. 없으면 파일 이름. */
function titleOf(markdown, file) {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : file;
}

const fontCss = ['NotoSerifKR-Regular', 'NotoSansKR-Regular', 'NotoSansKR-Medium']
  .map(
    (name) =>
      `@font-face{font-family:'${name}';src:url('file://${resolve(root, 'assets/fonts', name + '.ttf')}') format('truetype');}`,
  )
  .join('\n');

const today = new Date().toISOString().slice(0, 10);
const included = [];
const missing = [];

const sections = DOCS.map((doc, i) => {
  const path = resolve(root, doc.file);
  if (!existsSync(path)) {
    missing.push(doc.file);
    return '';
  }
  const md = readFileSync(path, 'utf8');
  const title = titleOf(md, doc.file);
  included.push({ ...doc, title, index: i });
  const body = markdownToHtml(md);
  return `
    <section class="doc" id="doc-${i}">
      <div class="divider">
        <div class="part">${doc.part}</div>
        <h1 class="doc-title">${title}</h1>
        <p class="doc-note">${doc.note}</p>
        <p class="doc-path">저장소 경로 · <code>${doc.file}</code></p>
      </div>
      <article class="md">${body}</article>
    </section>`;
}).join('\n');

const toc = included
  .map(
    (d) =>
      `<li><span class="toc-part">${d.part}</span><a href="#doc-${d.index}">${d.title}</a><span class="toc-note">${d.note}</span></li>`,
  )
  .join('\n');

const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<title>MyRosary 기획 문서 묶음</title>
<style>
${fontCss}
:root{--ground:#F5F1E6;--ink:#1F2530;--dusk:#5C6272;--rule:rgba(31,37,48,.16);--rule2:rgba(31,37,48,.34);--chija:#82600F;}
@page{size:A4;margin:18mm 16mm 20mm 16mm;}
html,body{margin:0;background:#fff;color:var(--ink);font-family:'NotoSansKR-Regular',sans-serif;font-size:10.5pt;line-height:1.75;}
.cover{height:257mm;display:flex;flex-direction:column;justify-content:flex-end;page-break-after:always;background:var(--ground);padding:22mm;box-sizing:border-box;}
.cover .eyebrow{font-size:9pt;letter-spacing:.14em;color:var(--dusk);margin-bottom:8mm;}
.cover h1{font-family:'NotoSerifKR-Regular',serif;font-size:30pt;line-height:1.3;margin:0 0 6mm;}
.cover p{margin:0 0 3mm;max-width:60ch;}
.cover .meta{margin-top:12mm;padding-top:5mm;border-top:1px solid var(--rule2);color:var(--dusk);font-size:9pt;}
.toc{page-break-after:always;}
.toc h2{font-family:'NotoSerifKR-Regular',serif;font-size:16pt;margin:0 0 6mm;}
.toc ol{list-style:none;padding:0;margin:0;counter-reset:n;}
.toc li{display:grid;grid-template-columns:14mm 1fr;column-gap:4mm;padding:3mm 0;border-bottom:1px solid var(--rule);counter-increment:n;}
.toc li::before{content:counter(n);font-family:'NotoSerifKR-Regular',serif;font-size:14pt;color:var(--chija);grid-row:1/3;}
.toc-part{display:none;}
.toc a{color:var(--ink);text-decoration:none;font-family:'NotoSansKR-Medium',sans-serif;}
.toc-note{color:var(--dusk);font-size:9pt;}
.doc{page-break-before:always;}
.divider{padding:30mm 0 10mm;border-bottom:2px solid var(--rule2);margin-bottom:8mm;page-break-after:avoid;}
.divider .part{font-size:9pt;letter-spacing:.14em;color:var(--dusk);}
.doc-title{font-family:'NotoSerifKR-Regular',serif;font-size:20pt;line-height:1.35;margin:3mm 0 3mm;}
.doc-note{margin:0;color:var(--ink);}
.doc-path{margin:2mm 0 0;color:var(--dusk);font-size:8.5pt;}
.md h1{font-family:'NotoSerifKR-Regular',serif;font-size:17pt;margin:10mm 0 4mm;page-break-after:avoid;}
.md h2{font-family:'NotoSerifKR-Regular',serif;font-size:14pt;margin:9mm 0 3mm;padding-bottom:1.5mm;border-bottom:1px solid var(--rule2);page-break-after:avoid;}
.md h3{font-family:'NotoSansKR-Medium',sans-serif;font-size:11.5pt;margin:7mm 0 2mm;page-break-after:avoid;}
.md h4{font-family:'NotoSansKR-Medium',sans-serif;font-size:10.5pt;margin:5mm 0 1.5mm;page-break-after:avoid;}
.md p,.md li{orphans:3;widows:3;}
.md blockquote{margin:4mm 0;padding:3mm 5mm;background:var(--ground);border-left:2px solid var(--chija);}
.md blockquote p{margin:0;}
.md code{font-family:ui-monospace,Menlo,monospace;font-size:8.8pt;background:rgba(31,37,48,.06);padding:0 .3em;}
.md pre{background:var(--ground);padding:3mm 4mm;overflow:hidden;white-space:pre-wrap;word-break:break-all;font-size:8.5pt;line-height:1.5;page-break-inside:avoid;}
.md pre code{background:none;padding:0;}
.md table{border-collapse:collapse;width:100%;font-size:9pt;line-height:1.55;margin:3mm 0 5mm;page-break-inside:auto;}
.md th,.md td{border:1px solid var(--rule2);padding:1.6mm 2.2mm;vertical-align:top;text-align:left;}
.md th{background:var(--ground);font-family:'NotoSansKR-Medium',sans-serif;}
.md tr{page-break-inside:avoid;}
.md a{color:var(--chija);text-decoration:none;}
.md del{color:var(--dusk);}
.md hr{border:0;border-top:1px solid var(--rule);margin:6mm 0;}
.md img{max-width:100%;}
.missing{color:var(--dusk);font-size:9pt;}
</style></head><body>
<div class="cover">
  <div class="eyebrow">MYROSARY · 검토용 문서 묶음</div>
  <h1>묵주 — 54일 기도<br>기획 문서 묶음</h1>
  <p>바람 하나를 정하고 54일 동안 날마다 묵주기도를 바쳐 완주하게 하는 한국어 묵주기도 앱의 기획 문서 전부다. 제품이 무엇인지, 무엇을 만들기로 했는지, 지금 어디까지 왔는지, 그리고 무엇을 왜 정했는지를 읽는 순서대로 이어 붙였다.</p>
  <p>이 묶음은 저장소의 마크다운 파일을 그대로 옮긴 것이며, 각 문서의 첫 쪽에 저장소 경로를 적어 두었다.</p>
  <div class="meta">묶은 날 ${today} · 문서 ${included.length}편${missing.length ? ` · 빠진 것 ${missing.length}편(아직 쓰이지 않음)` : ''}</div>
</div>
<div class="toc">
  <h2>차례</h2>
  <ol>${toc}</ol>
  ${missing.length ? `<p class="missing">이번 묶음에 들어오지 못한 문서: ${missing.map((m) => `<code>${m}</code>`).join(', ')} — 아직 쓰이지 않았다.</p>` : ''}
</div>
${sections}
</body></html>`;

mkdirSync(outDir, { recursive: true });
const htmlPath = resolve(outDir, 'myrosary-docs.html');
writeFileSync(htmlPath, html);

const { chromium } = await import('playwright');
// e2e 설정(`playwright.config.ts`)과 같은 이유다 — 이 컨테이너에 깔린 Chromium 이 Playwright 가
// 기대하는 판과 달라, 있는 것을 경로로 직접 가리킨다. 없는 환경에서는 기본값으로 돈다.
const LOCAL_CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(existsSync(LOCAL_CHROMIUM) ? { executablePath: LOCAL_CHROMIUM } : {});
const page = await browser.newPage();
await page.goto('file://' + htmlPath, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const pdfPath = resolve(outDir, 'myrosary-docs.pdf');
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate:
    '<div style="width:100%;font-size:8px;color:#5C6272;padding:0 16mm;display:flex;justify-content:space-between;font-family:sans-serif;"><span>MyRosary 기획 문서 묶음</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
});
await browser.close();

console.log(`묶었다 → ${pdfPath}`);
console.log(`  문서 ${included.length}편${missing.length ? `, 빠진 것: ${missing.join(', ')}` : ''}`);
if (!keepHtml) {
  const { unlinkSync } = await import('node:fs');
  unlinkSync(htmlPath);
} else {
  console.log(`  중간 HTML → ${htmlPath}`);
}
