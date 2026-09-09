/* 자체완결본 조립기 — index.html + art/ 를 그림이 박힌 한 파일로 만든다.
   실행: node docs/design/v5/build.mjs  (결과: docs/design/v5/dist/rosary-v5.html)

   왜 두 형태를 두나. index.html 은 사람이 읽고 고치는 원본이라 그림을 파일로
   두어야 diff 가 읽힌다. 반대로 아티팩트로 띄우거나 남에게 파일 하나로 건넬
   때는 그림이 안에 들어 있어야 한다. 그 변환이 이 파일이 하는 일 전부다.

   앱 코드(index.html)는 두 형태를 모두 견디게 쓰여 있다 — artUrl() 이
   window.__ART_INLINE 이 있으면 그 표를, 없으면 art/ 경로를 쓴다. */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const artDir = join(here, "art");
const outDir = join(here, "dist");

const html = readFileSync(join(here, "index.html"), "utf8");

const inline = {};
for (const file of readdirSync(artDir).filter((f) => f.endsWith(".jpg")).sort()) {
  const name = file.replace(/\.jpg$/, "");
  inline[name] = "data:image/jpeg;base64," + readFileSync(join(artDir, file)).toString("base64");
}

/* 마크업에 첫 화면용으로 박힌 art/ 경로도 함께 바꾼다 — 스크립트가 돌기 전에
   보이는 그림이라, 경로로 남겨 두면 자체완결본에서 깨진다. */
let out = html.replace(/url\('art\/([0-9A-Za-z_]+)\.jpg'\)/g, (m, name) =>
  inline[name] ? `url('${inline[name]}')` : m
);

const tag = `<script>window.__ART_INLINE=${JSON.stringify(inline)};</script>`;
/* 표는 앱 스크립트보다 먼저 와야 한다 — artUrl() 이 첫 렌더에서 이미 표를 읽는다.
   </body> 앞에 붙이면 순서가 뒤집혀 그림이 비어 나온다(실제로 겪은 결함). */
const appScript = out.lastIndexOf("<script>");
if (appScript < 0) throw new Error("앱 스크립트를 찾지 못했다 — index.html 구조가 바뀌었나 확인할 것");
out = out.slice(0, appScript) + tag + "\n" + out.slice(appScript);

mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "rosary-v5.html");
writeFileSync(outFile, out);

const mb = (out.length / 1024 / 1024).toFixed(2);
console.log(`rosary-v5.html — 그림 ${Object.keys(inline).length}장 포함, ${mb} MB`);
