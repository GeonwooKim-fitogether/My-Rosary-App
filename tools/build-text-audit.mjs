/**
 * 공방장이 「가톨릭 기도서」나 신부님과 맞대어 볼 수 있게, Claude 가 쓴 글 두 묶음을
 * 한자리에 모은 대조표를 만든다.
 *
 * **왜 손으로 적지 않고 기계로 만드나.** 대조표를 손으로 옮겨 적으면 앱이 말하는 글과
 * 대조표에 적힌 글이 갈라진다. 갈라지는 순간 그 대조표는 검토의 근거가 아니라 또 하나의
 * 믿을 수 없는 문서가 된다 — 이 저장소가 기도문 대조표를 만들 때 세운 원칙과 같다.
 * 그러므로 글을 고쳤으면 이 도구를 다시 돌린다.
 *
 * 쓰는 법:  node tools/build-text-audit.mjs
 * 만드는 것:
 *   docs/plan/mystery-commentary-audit.md  — 신비 스물의 긴 해설
 *   docs/plan/learn-text-audit.md          — 묵주기도 입문 · 배경 지식 두 편
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

const commentary = read('spec/mystery-commentary.ko.json');
const mysteries = read('spec/mysteries.json');
const learn = read('spec/learn.json');

const SET_LABEL = {
  joyful: '환희의 신비',
  luminous: '빛의 신비',
  sorrowful: '고통의 신비',
  glorious: '영광의 신비',
};

function mysteryDoc() {
  const out = [];
  out.push('# 신비 해설 대조표 — 앱이 말하는 스무 단의 해설');
  out.push('');
  out.push(
    '> 한 줄 요지: **이 문서는 앱의 `신비 해설` 화면이 한국어로 보여 주는 글 전부를, 화면에 서는 차례 그대로 모아 놓은 것이다.** 공방장이 「가톨릭 기도서」나 신부님과 맞대어 보시는 자리이며, 검토 전에는 이 글이 교회의 검토를 받지 않은 상태라는 사실이 앱 안에도 이 문서에도 그대로 남는다.',
  );
  out.push('');
  out.push('## 이 글이 어디서 왔나');
  out.push('');
  out.push(commentary.source);
  out.push('');
  out.push(
    `검토 상태는 **${commentary.verified ? '검토 완료' : '아직 검토받지 않음'}** 이다. ${commentary.verify_note}`,
  );
  out.push('');
  out.push('## 글쓴이가 먼저 밝히는 자리');
  out.push('');
  for (const gap of commentary.known_gaps) out.push(`- ${gap}`);
  out.push('');
  out.push('## 무엇을 보아 주시면 되나');
  out.push('');
  out.push(
    '세 가지다. 첫째, **사실이 틀린 곳**이 없는지 — 성경의 줄거리를 잘못 옮긴 자리. 둘째, **교회의 가르침과 어긋나는 곳**이 없는지 — 특히 `무엇을 묵상하나` 칸은 해석이 들어가는 자리라 여기서 어긋나기 쉽다. 셋째, **성경 구절 표기**가 한국 교회의 표기와 같은지.',
  );
  out.push('');
  out.push(
    '고칠 곳을 찾으시면 이 문서가 아니라 `spec/mystery-commentary.ko.json` 이 정본이다. 그 파일을 고치고 `node tools/build-text-audit.mjs` 를 다시 돌리면 이 문서가 따라 바뀐다.',
  );
  out.push('');

  for (const [key, rows] of Object.entries(commentary.commentary)) {
    out.push(`## ${SET_LABEL[key] ?? key}`);
    out.push('');
    const titles = mysteries.sets[key].decades;
    rows.forEach((row, index) => {
      out.push(`### 제${index + 1}단 · ${titles[index]}`);
      out.push('');
      out.push(`성경: ${row.verse}`);
      out.push('');
      out.push(`- **무슨 일이 있었나** — ${row.scene}`);
      out.push(`- **무엇을 묵상하나** — ${row.meaning}`);
      out.push(`- **오늘 나에게** — ${row.today}`);
      out.push('');
    });
  }
  return out.join('\n');
}

function guideBlock(guide) {
  const out = [];
  out.push(`### ${guide.title}`);
  out.push('');
  out.push(guide.lead);
  out.push('');
  for (const section of guide.sections) {
    out.push(`#### ${section.heading}`);
    out.push('');
    for (const paragraph of section.body ?? []) {
      out.push(paragraph);
      out.push('');
    }
    (section.steps ?? []).forEach((step, index) => out.push(`${index + 1}. ${step}`));
    if ((section.steps ?? []).length) out.push('');
    for (const item of section.list ?? []) out.push(`- **${item.term}** — ${item.text}`);
    if ((section.list ?? []).length) out.push('');
    if (section.note) {
      out.push(`> ${section.note}`);
      out.push('');
    }
  }
  return out.join('\n');
}

function learnDoc() {
  const out = [];
  out.push('# 배우기 두 편 대조표 — 묵주기도 입문 · 배경 지식');
  out.push('');
  out.push(
    '> 한 줄 요지: **이 문서는 앱의 `묵주기도 입문` 과 `배경 지식` 두 화면이 한국어로 보여 주는 글 전부다.** 두 화면은 처음 오는 사람이 읽는 자리라 사실이 틀리면 그대로 전해지므로, 공방장이 한 번 훑어 주시는 것을 전제로 만들었다.',
  );
  out.push('');
  out.push('## 이 글이 어디서 왔나');
  out.push('');
  out.push(learn.source);
  out.push('');
  out.push(
    `검토 상태는 **${learn.verified ? '검토 완료' : '아직 검토받지 않음'}** 이다. ${learn.verify_note}`,
  );
  out.push('');
  out.push('## 글쓴이가 먼저 밝히는 자리');
  out.push('');
  for (const gap of learn.known_gaps) out.push(`- ${gap}`);
  out.push('');
  out.push('## 무엇을 보아 주시면 되나');
  out.push('');
  out.push(
    '역사를 다루는 대목(배경 지식의 앞 네 절)은 **연도와 인과**가 틀리기 쉬운 자리이고, 교리를 다루는 대목(전구 · 권고되는 신심)은 **표현의 수위**가 어긋나기 쉬운 자리다. 그 둘을 먼저 보아 주시면 된다.',
  );
  out.push('');
  out.push(
    '고칠 곳을 찾으시면 이 문서가 아니라 `spec/learn.json` 이 정본이다. 그 파일을 고치고 `node tools/build-text-audit.mjs` 를 다시 돌리면 이 문서가 따라 바뀐다.',
  );
  out.push('');
  out.push('## 화면 하나 — 묵주기도 입문');
  out.push('');
  out.push(guideBlock(learn.guides.basics.ko));
  out.push('## 화면 둘 — 배경 지식');
  out.push('');
  out.push(guideBlock(learn.guides.background.ko));
  return out.join('\n');
}

writeFileSync(join(ROOT, 'docs/plan/mystery-commentary-audit.md'), mysteryDoc().trimEnd() + '\n');
writeFileSync(join(ROOT, 'docs/plan/learn-text-audit.md'), learnDoc().trimEnd() + '\n');
console.log('대조표 둘을 만들었다 — docs/plan/mystery-commentary-audit.md · docs/plan/learn-text-audit.md');
