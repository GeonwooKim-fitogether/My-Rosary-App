/**
 * 시안의 내용 모듈(`docs/design/world/data.js`)을 이 저장소의 자리로 분해한다.
 *
 * 손으로 옮겨 적지 않는 이유는 하나다 — 일곱 언어 × 여덟 기도문을 손으로 옮기면
 * 반드시 한 글자가 틀리고, 그 한 글자가 기도문이다. 그래서 시안의 모듈을 그대로
 * 불러 값을 읽고 JSON 으로 쏟는다. 이 스크립트는 한 번 쓰고 버리는 것이 아니라
 * 시안이 갱신되면 다시 돌리는 통로다.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const D = await import('../../docs/design/world/data.js');

const OUT_SPEC = resolve('spec');
const OUT_I18N = resolve('src/i18n/strings');
mkdirSync(resolve(OUT_SPEC, 'prayers'), { recursive: true });
mkdirSync(OUT_I18N, { recursive: true });

const write = (path, value) => {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n', 'utf8');
  console.log('썼다:', path.replace(process.cwd() + '/', ''));
};

const SOURCE =
  'docs/design/world/data.js (Claude Design 인계본, 2026-09-16). 공식 기도서와 대조되지 않았다.';

/* ── 1. 기도문 일곱 벌 ─────────────────────────────────────────────── */
const langs = D.LANGS.map((l) => l.id);
for (const lang of langs) {
  const prayers = D.PRAYERS[lang];
  if (!prayers) throw new Error(`기도문이 없는 언어: ${lang}`);
  write(resolve(OUT_SPEC, 'prayers', `${lang}.world.json`), {
    $schema_note:
      '시안이 담아 온 기도문. 이 저장소의 spec/prayers.ko.json 과 달리 앞 절(a)·뒷 절(b)로 나뉘어 있지 않다. 교대 낭송(FR-11)은 그 나눔 위에 서 있으므로, 나누기 전에는 이 판본을 낭송에 연결하지 않는다.',
    language: lang,
    verified: false,
    split: false,
    source: SOURCE,
    todo:
      lang === 'ko'
        ? '한국어 정본은 spec/prayers.ko.json 이다. 이 파일은 대조용으로만 둔다.'
        : '① 공식 기도서와 대조해 verified 를 올린다(D-4). ② 그 언어의 전례 관습을 아는 사람이 앞 절·뒷 절로 나눈다.',
    prayers,
  });
}

/* ── 2. 신비 이름 · 성경 구절 · 묵상 노트 ──────────────────────────── */
write(resolve(OUT_SPEC, 'mysteries.world.json'), {
  $schema_note:
    '신비의 이름과 해설. 신비를 고르는 규칙(요일·54일 순환)은 여기가 아니라 spec/mysteries.json 이 정본이다 — 시안은 요일 규칙만 알고 54일 순환(FR-43)을 모른다.',
  verified: false,
  source: SOURCE,
  sets: D.MYSTERY_SETS,
  scripture: D.SCRIPTURE,
  names: D.MYSTERIES,
  meditations: D.MEDITATIONS,
});

/* ── 3. 화면 문구 일곱 벌 ──────────────────────────────────────────── */
const keysOf = (o) =>
  Object.entries(o)
    .flatMap(([k, v]) => (v && typeof v === 'object' ? Object.keys(v).map((s) => `${k}.${s}`) : [k]))
    .sort();
const base = keysOf(D.UI.ko);
for (const lang of langs) {
  const ui = D.UI[lang];
  if (!ui) throw new Error(`문구가 없는 언어: ${lang}`);
  const mine = keysOf(ui);
  const missing = base.filter((k) => !mine.includes(k));
  const extra = mine.filter((k) => !base.includes(k));
  if (missing.length || extra.length) {
    throw new Error(`문구 키가 어긋난다 (${lang}) — 빠진 것 ${missing} · 남는 것 ${extra}`);
  }
  write(resolve(OUT_I18N, `${lang}.json`), ui);
}

/* ── 4. 지역 다섯과 언어 일곱의 표 ─────────────────────────────────── */
write(resolve(OUT_SPEC, 'regions.world.json'), {
  $schema_note:
    '지역 다섯과 언어 일곱. 색 여섯은 src/theme/tokens.ts 가 토큰으로 옮겨 쓰고, 그림 목록은 src/art/worldPlates.ts 가 쓴다.',
  source: SOURCE,
  languages: D.LANGS,
  regions: D.REGIONS,
});

/* ── 5. 성화 열일곱 장 ─────────────────────────────────────────────── */
write(resolve(OUT_SPEC, 'plates.world.json'), {
  $schema_note:
    '성화와 초점 좌표. focal 은 CSS background-position 과 같은 뜻이다. 12번 그림에는 작가 서명(워터마크)이 있어 정식 자산에서 교체한다 (decisions.md Q-50 · D-1).',
  source: SOURCE,
  ids: D.IMAGE_IDS,
  images: D.IMAGES,
});

console.log(`\n언어 ${langs.length} · 문구 키 ${base.length} · 성화 ${D.IMAGE_IDS.length} 장`);
