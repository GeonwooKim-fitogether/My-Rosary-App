/**
 * 화면 사진 등록부를 읽고 지키는 도구.
 *
 * 저장소의 화면 사진에는 성격이 다른 두 종류가 섞여 있다. **살아 있는 사진**은 지금 앱의
 * 화면이라 e2e 가 돌 때마다 다시 찍히는 것이 맞고, **얼린 사진**은 그때 그 화면이 어땠는지의
 * 기록이라 다시 찍으면 그 기록이 사라진다. 둘의 구분이 글에만 있으면 세션마다 다시 추론해야
 * 하고, 실제로 세 번 연속 틀리게 추론했다 (`decisions.md` Q-80 · Q-83).
 *
 * 그래서 구분을 `docs/plan/screens.json` 에 기계가 읽는 목록으로 옮기고, 이 파일이 그 목록을
 * 두 가지 일에 쓴다.
 *
 * 1. **막는다.** e2e 가 얼린 자리에 사진을 찍으려 하면 `e2e/support/harness.ts` 의 감시가
 *    이 목록을 물어보고 그 자리에서 시험을 실패시킨다. 덮어쓴 뒤에 알아차리는 것이 아니라
 *    덮어쓰기 전에 멈춘다.
 * 2. **어긋남을 잡는다.** `node tools/screens-registry.cjs check` 가 목록과 실제 시험 코드를
 *    맞대어 본다. 새로 찍는 자리를 등재하지 않았거나, 얼린 자리를 찍는 시험이 생겼거나,
 *    목록에 있는 파일이 사라졌으면 실패한다. 자동 검사가 PR 마다 이것을 돌린다.
 *
 * 두 층이 서로를 받친다. 1번은 지금 돌고 있는 시험을 멈추고, 2번은 "아직 돌지 않았지만 곧
 * 얼린 자리를 찍게 될 코드"를 머지 전에 잡는다.
 */
const { existsSync, readFileSync, readdirSync, statSync } = require('node:fs');
const { dirname, join, relative, resolve } = require('node:path');

const REPO_ROOT = resolve(__dirname, '..');
const REGISTRY_PATH = join(REPO_ROOT, 'docs/plan/screens.json');

/** 등록부를 읽는다. 파일이 없으면 빈 등록부로 본다 — 없는 저장소에서 아무 일도 하지 않게. */
function readRegistry() {
  if (!existsSync(REGISTRY_PATH)) return { live: [], frozen: [] };
  const raw = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
  return { live: raw.live ?? [], frozen: raw.frozen ?? [] };
}

/**
 * 아주 작은 glob 대조. 이 등록부가 쓰는 무늬는 `폴더/*.png` 와 정확한 파일 이름 둘뿐이라
 * glob 라이브러리를 들이지 않고 그 둘만 다룬다 — 무늬를 더 쓰고 싶어지면 그때 늘린다.
 */
function matches(glob, path) {
  if (!glob.includes('*')) return glob === path;
  const [head, tail] = glob.split('*');
  if (!path.startsWith(head) || !path.endsWith(tail)) return false;
  // `*` 가 하위 폴더를 건너뛰지는 않게 한다.
  return !path.slice(head.length, path.length - tail.length).includes('/');
}

/** 저장소 뿌리 기준의 경로로 고친다. 시험은 상대 경로로 부르고 검사는 절대 경로로도 부른다. */
function toRepoPath(path) {
  const normalized = path.replaceAll('\\', '/');
  if (!normalized.startsWith('/')) return normalized;
  return relative(REPO_ROOT, normalized).replaceAll('\\', '/');
}

/**
 * 이 자리가 얼린 자리인가. 얼린 자리면 그 줄을 통째로 돌려주어, 막는 쪽이 **왜 막혔고 대신
 * 무엇을 보라**를 사람에게 말해 줄 수 있게 한다. 이유 없는 차단은 우회로를 발명하게 만든다.
 */
function frozenEntryFor(path, registry = readRegistry()) {
  const repoPath = toRepoPath(path);
  return registry.frozen.find((entry) => matches(entry.glob, repoPath)) ?? null;
}

/** 막힌 사람이 읽을 문장. 무엇이 막혔는지·왜 막혔는지·대신 무엇을 보는지·어떻게 푸는지. */
function frozenMessage(path, entry) {
  return [
    `얼린 화면 사진을 덮어쓰려 했다: ${toRepoPath(path)}`,
    `  이 사진을 얼린 까닭: ${entry.decision}`,
    `  지금 화면의 사진은 여기 있다: ${entry.instead}`,
    '',
    '  얼린 사진은 그때 그 화면이 어땠는지의 기록이라, 다시 찍으면 되살릴 수 없다.',
    '  정말로 다시 찍어야 한다면 docs/plan/screens.json 에서 그 줄을 frozen 에서 live 로',
    '  옮긴다. 그 편집이 커밋에 남아 리뷰에 보이는 것이 의도된 유일한 출구다.',
  ].join('\n');
}

/**
 * 시험 코드가 실제로 어느 자리에 사진을 찍는지 읽어 낸다.
 *
 * 정적 분석이라 한계가 분명하다 — `path:` 뒤의 글자를 읽고 `${상수}` 를 그 파일이 선언한
 * 문자열 상수로 바꿔 넣을 뿐이다. 그래서 값이 실행 중에 정해지는 자리(`${width}` 처럼 반복문의
 * 변수)는 `*` 로 바꿔 폴더 단위로만 본다. 이 느슨함은 의도한 것이다: 검사가 잡으려는 것은
 * "등재되지 않은 **폴더**에 찍는 것"과 "얼린 자리에 찍는 것"이고, 둘 다 폴더 수준에서 드러난다.
 */
function screenshotTargetsInSpecs() {
  const e2eDir = join(REPO_ROOT, 'e2e');
  if (!existsSync(e2eDir)) return [];
  const targets = [];
  for (const file of readdirSync(e2eDir)) {
    if (!file.endsWith('.spec.ts')) continue;
    const specPath = `e2e/${file}`;
    const source = readFileSync(join(e2eDir, file), 'utf8');

    const constants = new Map();
    for (const match of source.matchAll(/const (\w+) = '(docs\/plan[^']*)'/g)) {
      constants.set(match[1], match[2]);
    }

    for (const match of source.matchAll(/path: [`'"]([^`'"]+)[`'"]/g)) {
      let raw = match[1];
      if (!raw.includes('docs/plan') && !raw.includes('${')) continue;
      raw = raw.replaceAll(/\$\{(\w+)\}/g, (whole, name) => constants.get(name) ?? '*');
      if (!raw.startsWith('docs/plan')) continue;
      targets.push({ path: raw, spec: specPath });
    }
  }
  return targets;
}

/** 등록부에 적힌 자리에 파일이 실제로 있나. 없으면 목록이 현실과 어긋난 것이다. */
function registeredPathsExist(entry) {
  const glob = entry.glob;
  if (!glob.includes('*')) return existsSync(join(REPO_ROOT, glob));
  const dir = join(REPO_ROOT, dirname(glob));
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return false;
  const suffix = glob.slice(glob.lastIndexOf('*') + 1);
  return readdirSync(dir).some((name) => name.endsWith(suffix));
}

/** 검사 본체. 위반을 문장 배열로 돌려준다 — 빈 배열이면 통과다. */
function check() {
  const registry = readRegistry();
  const problems = [];

  for (const { path, spec } of screenshotTargetsInSpecs()) {
    const frozen = registry.frozen.find((entry) => matches(entry.glob, path));
    if (frozen) {
      problems.push(
        `${spec} 가 얼린 자리에 사진을 찍는다: ${path}\n` +
          `    얼린 까닭: ${frozen.decision}\n` +
          `    이 시험이 옳다면 docs/plan/screens.json 에서 그 줄을 live 로 옮긴다.`,
      );
      continue;
    }
    const live = registry.live.find((entry) => matches(entry.glob, path));
    if (!live) {
      problems.push(
        `${spec} 가 등재되지 않은 자리에 사진을 찍는다: ${path}\n` +
          `    docs/plan/screens.json 의 live 에 이 자리를 한 줄로 등재한다.`,
      );
    }
  }

  for (const entry of [...registry.live, ...registry.frozen]) {
    if (!registeredPathsExist(entry)) {
      problems.push(
        `등록부에 있는 자리에 파일이 없다: ${entry.glob}\n` +
          `    사진을 지웠다면 docs/plan/screens.json 에서도 그 줄을 지운다.`,
      );
    }
  }

  return problems;
}

module.exports = {
  REPO_ROOT,
  readRegistry,
  toRepoPath,
  frozenEntryFor,
  frozenMessage,
  screenshotTargetsInSpecs,
  check,
};

if (require.main === module && process.argv[2] === 'check') {
  const problems = check();
  if (problems.length === 0) {
    const registry = readRegistry();
    console.log(
      `화면 사진 등록부 검사 통과 — 살아 있는 자리 ${registry.live.length}줄, 얼린 자리 ${registry.frozen.length}줄.`,
    );
    process.exit(0);
  }
  console.error(`화면 사진 등록부 검사 실패 — ${problems.length}건.\n`);
  for (const problem of problems) console.error(`  · ${problem}\n`);
  process.exit(1);
}
