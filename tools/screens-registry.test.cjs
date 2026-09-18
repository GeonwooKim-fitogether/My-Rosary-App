/**
 * 화면 사진 등록부 도구의 판단 시험.
 *
 * 돌리는 법: `node tools/screens-registry.test.cjs`
 *
 * 이 저장소의 훅들이 쓰는 방식(`python3 .claude/hooks/*.test.py`)과 같은 모양이다 — 판단을
 * 내리는 장치에는 그 판단을 붙드는 시험을 나란히 둔다. 여기서 붙드는 것은 세 가지다.
 *
 * 1. 얼린 자리와 살아 있는 자리를 실제로 갈라 보는가 (갈라 보지 못하면 막을 수도 없다).
 * 2. 지금 저장소가 검사를 통과하는가 (통과하지 못하면 목록이 현실과 어긋난 것이다).
 * 3. 막는 문장이 **왜 막혔고 대신 무엇을 보라**를 담고 있는가 (이유 없는 차단은 막힌 사람이
 *    우회로를 발명하게 만들고, 그것이 이 장치가 막으려는 사고와 같은 일이다).
 */
const { check, frozenEntryFor, frozenMessage, readRegistry, screenshotTargetsInSpecs } = require('./screens-registry.cjs');

let failed = 0;

function ok(label, condition, detail = '') {
  if (condition) {
    console.log(`  통과  ${label}`);
    return;
  }
  failed += 1;
  console.error(`  실패  ${label}${detail ? `\n        ${detail}` : ''}`);
}

console.log('화면 사진 등록부 도구 시험');

const registry = readRegistry();
ok('등록부를 읽는다', registry.live.length > 0 && registry.frozen.length > 0);

// 1. 얼린 자리와 살아 있는 자리를 가른다.
const frozenSample = 'docs/plan/rosary-full/pray-day-844.png';
const liveSample = 'docs/plan/w3-screens/journeys.png';
ok('얼린 자리를 얼린 것으로 판정한다', frozenEntryFor(frozenSample) !== null, frozenSample);
ok('살아 있는 자리는 막지 않는다', frozenEntryFor(liveSample) === null, liveSample);
ok(
  '얼린 폴더 안의 다른 파일도 함께 막힌다 (무늬가 폴더 단위로 걸린다)',
  frozenEntryFor('docs/plan/rosary-lit/pray-gold-day.png') !== null,
);
ok(
  '등록부에 없는 아무 경로나 막지는 않는다',
  frozenEntryFor('docs/plan/어디에도-없는-폴더/아무거나.png') === null,
);

// 2. 지금 저장소가 검사를 통과한다.
const problems = check();
ok('지금 저장소가 등록부 검사를 통과한다', problems.length === 0, problems.join('\n        '));

// 시험 코드에서 찍는 자리를 실제로 읽어 내는가 — 읽지 못하면 검사가 언제나 통과해 버린다.
const targets = screenshotTargetsInSpecs();
ok('시험 코드에서 사진 찍는 자리를 읽어 낸다', targets.length >= 40, `읽은 자리 ${targets.length}개`);

// 3. 막는 문장이 이유와 대안을 담는다.
const entry = frozenEntryFor(frozenSample);
const message = frozenMessage(frozenSample, entry);
ok('막는 문장이 막힌 경로를 담는다', message.includes(frozenSample));
ok('막는 문장이 얼린 까닭을 담는다', message.includes(entry.decision));
ok('막는 문장이 대신 볼 곳을 담는다', message.includes(entry.instead));
ok('막는 문장이 푸는 방법을 담는다', message.includes('docs/plan/screens.json'));

if (failed > 0) {
  console.error(`\n${failed}건 실패.`);
  process.exit(1);
}
console.log('\n모두 통과.');
