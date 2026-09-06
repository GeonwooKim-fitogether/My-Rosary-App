// MyRosary 앱 조립기 — docs/design/app/ 의 셸·스타일·코드와 spec/ 의 도메인 JSON 을
// 한 파일 docs/design/app.html 로 묶는다. 빌드 도구·의존성 없음. node docs/design/build-app.mjs 로 돌린다.
//
// spec/ 의 JSON 은 **손으로 고치지 않고 그대로** 끼워 넣는다. 앱은 파일을 읽지 않고
// 이 스크립트가 넣어 둔 <script type="application/json"> 하나만 읽으므로 자체완결이다.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const SPEC = join(ROOT, 'spec');

const read = (p) => readFileSync(p, 'utf8');
const json = (p) => JSON.parse(read(p));

// 원본 세 벌을 그대로 담는다. 키 이름만 감싸고 내용은 건드리지 않는다.
const data = {
  sequence: json(join(SPEC, 'prayer-sequence.json')),
  prayers: json(join(SPEC, 'prayers.ko.json')),
  mysteries: json(join(SPEC, 'mysteries.json'))
};

// 77단계·기도문 키·신비 셋이 실제로 맞물리는지 조립 시점에 확인한다(조용히 어긋나는 것을 막는다).
const steps = data.sequence.steps;
if (steps.length !== data.sequence.total) throw new Error(`단계 수가 ${steps.length}, total 은 ${data.sequence.total}`);
for (const s of steps) {
  if (!data.prayers.prayers[s.prayer]) throw new Error(`기도문 키 없음: ${s.prayer}`);
}
for (const k of Object.keys(data.mysteries.sets)) {
  if (data.mysteries.sets[k].decades.length !== 5) throw new Error(`${k} 의 단이 다섯이 아니다`);
}

const html = read(join(HERE, 'app', 'shell.html'))
  .replace('/*__CSS__*/', () => read(join(HERE, 'app', 'app.css')))
  .replace('/*__DATA__*/', () => JSON.stringify(data))
  .replace('/*__JS__*/', () => read(join(HERE, 'app', 'app.js')));

writeFileSync(join(HERE, 'app.html'), html);
console.log(`docs/design/app.html 를 썼다. (${(html.length / 1024).toFixed(0)} KB · ${steps.length}단계)`);
