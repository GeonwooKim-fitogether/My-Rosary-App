// MyRosary 화면 시안 — 낮 벌과 밤 벌을 같은 마크업에서 만들어 내는 조립기.
// 두 벌의 차이는 아래 THEME 의 CSS 변수 한 벌뿐이다. node docs/design/build.mjs 로 돌린다.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const OUT = dirname(fileURLToPath(import.meta.url));

/* ── 1. 토큰 두 벌 ─────────────────────────────────────────────── */
const THEME = {
  day: {
    name: '한지 낮 (Hanji Day)',
    lead: '한지 바탕 #EDE7D8 위 먹빛 잉크 #1F2530. 강조는 치자-d #82600F 하나. 전례색 자색 #63507F.',
    v: {
      '--bg': '#EDE7D8', '--surface': '#F5F1E6', '--surface2': '#E2DAC7',
      '--ink': '#1F2530', '--muted': '#5C6272',
      '--accent': '#82600F', '--accent-bg': 'rgba(130,96,15,.06)', '--accent-line': '#82600F',
      '--rule': 'rgba(31,37,48,.16)', '--rule2': 'rgba(31,37,48,.30)', '--faint': 'rgba(31,37,48,.10)',
      '--ash': 'rgba(31,37,48,.26)',
      '--season': '#63507F',
      '--fill': '#1F2530', '--on-fill': '#F5F1E6', '--on-fill-muted': '#C9C2B0',
      '--bead': '#5C6272', '--bead-line': 'rgba(31,37,48,.30)', '--thread': 'rgba(31,37,48,.22)',
      '--plate-veil': 'rgba(0,0,0,0)',
      '--scrim': 'rgba(31,37,48,.46)'
    }
  },
  night: {
    name: '쪽빛 밤 (Jjok Night)',
    lead: '쪽빛 바탕 #10161F 위 한지 글자 #F0EAD9. 강조는 치자 #D9AE4C 하나. 전례색 자색은 대비 실측으로 #9683B5 로 올렸다.',
    v: {
      '--bg': '#10161F', '--surface': '#18202C', '--surface2': '#222C3B',
      '--ink': '#F0EAD9', '--muted': '#8E93A3',
      '--accent': '#D9AE4C', '--accent-bg': 'rgba(217,174,76,.09)', '--accent-line': '#D9AE4C',
      '--rule': 'rgba(240,234,217,.14)', '--rule2': 'rgba(240,234,217,.30)', '--faint': 'rgba(240,234,217,.10)',
      '--ash': 'rgba(240,234,217,.22)',
      '--season': '#9683B5',
      '--fill': '#DCD6C4', '--on-fill': '#10161F', '--on-fill-muted': '#3F4757',
      '--bead': '#8E93A3', '--bead-line': 'rgba(240,234,217,.34)', '--thread': 'rgba(240,234,217,.24)',
      '--plate-veil': 'rgba(16,22,31,.56)',
      '--scrim': 'rgba(6,9,14,.62)'
    }
  }
};

/* ── 2. 공통 스타일 ────────────────────────────────────────────── */
const CSS = `
*{box-sizing:border-box}
body{margin:0;padding:40px 44px 80px;word-break:keep-all;overflow-wrap:break-word;background:#07090d;font-family:'Noto Sans KR',system-ui,sans-serif}
h1{margin:0 0 10px;font:500 17px/1.4 'Noto Sans KR';color:#F0EAD9}
p.lead{margin:0 0 26px;font:400 12.5px/1.8 'Noto Sans KR';color:#9AA0B0;max-width:900px}
h2{margin:44px 0 4px;font:500 14px/1.5 'Noto Sans KR';color:#F0EAD9;border-top:1px solid rgba(240,234,217,.14);padding-top:20px}
p.note{margin:0 0 18px;font:400 12px/1.8 'Noto Sans KR';color:#8E93A3;max-width:900px}
.row{display:flex;flex-wrap:wrap;gap:26px;align-items:flex-start}
figure{margin:0}
figcaption{font:400 11.5px/1.5 'Noto Sans KR';color:#A7ACBA;letter-spacing:.04em;margin-top:9px;text-align:center;max-width:390px}
figcaption b{color:#F0EAD9;font-weight:500}

/* 기기 프레임 — 시안용 목업이며 앱 UI 가 아니다 (라디우스 0 규칙은 화면 안쪽에 적용된다) */
.frame{width:390px;height:844px;border-radius:42px;overflow:hidden;position:relative;
  background:var(--bg);color:var(--ink);box-shadow:0 22px 56px rgba(0,0,0,.55)}
.panel{width:376px;height:274px;background:var(--bg);border:1px solid rgba(240,234,217,.14);
  display:flex;align-items:center;justify-content:center}

.scr{height:100%;display:flex;flex-direction:column;padding:56px 24px 26px}
.scr.edge{padding-left:0;padding-right:0}
.px{padding-left:24px;padding-right:24px}
.gr{flex:1}
.sc{flex:1;min-height:0;overflow-y:auto}

.hd{display:flex;align-items:baseline;justify-content:space-between;padding-bottom:16px;border-bottom:1px solid var(--rule)}
.lab{font:400 10.5px/1 'Noto Sans KR';color:var(--muted);letter-spacing:.12em}
.lab2{font:400 10.5px/1 'Noto Sans KR';color:var(--muted);letter-spacing:.12em}
.tap{font:400 11px/1 'Noto Sans KR';color:var(--muted)}
.ser{font-family:'Noto Serif KR',serif;font-weight:400;color:var(--ink)}
.sub{font:400 12.5px/1.7 'Noto Sans KR';color:var(--muted)}
.bd{font:400 13px/1.7 'Noto Sans KR';color:var(--ink)}
.sm{font:400 11px/1.6 'Noto Sans KR';color:var(--muted)}
.acc{color:var(--accent)}
.season{color:var(--season)}
.mono-n{font:700 34px/1 'Noto Sans KR';color:var(--accent)}

.btn{height:88px;display:flex;align-items:center;justify-content:center;font:500 15px/1 'Noto Sans KR';flex:none}
.btn.p{background:var(--fill);color:var(--on-fill)}
.btn.o{border:1px solid var(--rule2);color:var(--ink)}
.btn.t{color:var(--muted);font:400 12.5px/1 'Noto Sans KR'}
.btn.dis{background:var(--faint);color:var(--muted)}
.btn2{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;height:88px;flex:1}
.btn2 .t1{font:500 14px/1 'Noto Sans KR';color:var(--ink)}
.btn2 .t2{font:400 11px/1 'Noto Sans KR';color:var(--muted)}

/* 고르는 줄 — 88px 터치 영역 (Q-06b) */
.opt{min-height:88px;display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:0 16px;border:1px solid var(--rule)}
.opt + .opt{border-top:none}
.opt.on{border:1px solid var(--accent-line);background:var(--accent-bg)}
.opt.on + .opt{border-top:none}
.opt .n{font:500 14px/1.35 'Noto Sans KR';color:var(--ink)}
.opt .d{font:400 11px/1.5 'Noto Sans KR';color:var(--muted);margin-top:5px}
.opt .r{font:400 11px/1 'Noto Sans KR';color:var(--muted);flex:none}
.opt.on .r{color:var(--accent)}

.zone{padding:18px 0 16px;border-bottom:1px solid var(--rule)}
.zone:last-child{border-bottom:none}

.ribbon{display:flex;gap:1px}
.ribbon i{flex:1;display:block}
.grid54{display:grid;grid-template-columns:repeat(9,1fr);gap:4px}
.grid54 i{height:22px;display:block}

.plate{flex:none;background-size:cover;background-repeat:no-repeat;box-shadow:inset 0 0 0 2000px var(--plate-veil)}
.stat{display:flex;align-items:baseline;justify-content:space-between;padding:15px 0;border-top:1px solid var(--rule)}
.stat .k{font:400 12.5px/1 'Noto Sans KR';color:var(--muted)}
.stat .v{font:400 14px/1 'Noto Sans KR';color:var(--ink)}

.bar5{display:flex;gap:3px;margin-top:12px}
.bar5 i{flex:1;height:4px;display:block}

.sheetwrap{position:absolute;inset:0;background:var(--scrim);display:flex;flex-direction:column;justify-content:flex-end}
.sheet{background:var(--surface);border-top:1px solid var(--rule2);padding:26px 24px 26px}
.dim{filter:saturate(.9)}

@keyframes bre{0%,100%{opacity:.42;transform:scale(1)}50%{opacity:1;transform:scale(1.12)}}
@keyframes pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.95;transform:scale(1.22)}}
@media (prefers-reduced-motion:reduce){
  [style*="animation"]{animation:none !important}
}
`;

/* ── 3. 조각 만들기 ────────────────────────────────────────────── */
const A = '../product/prototype/assets';
const IMG = {
  mary: `${A}/01_Mary_Single.jpg`,
  child: `${A}/02_Mary_and_Child.jpg`,
  jesus: `${A}/06_Side_Jesus.jpg`,
  family: `${A}/07_Relief_Holy_Family.jpg`
};

// 리본 — 하루 한 칸. done 만큼 채우고, blank 목록은 빈 칸, today 는 먹빛.
function ribbon(total, done, { h = 22, blanks = [], today = null } = {}) {
  let s = '';
  for (let i = 1; i <= total; i++) {
    let bg = 'var(--faint)';
    if (i === today) bg = 'var(--fill)';
    else if (blanks.includes(i)) bg = 'var(--faint)';
    else if (i <= done) bg = 'var(--accent)';
    s += `<i style="height:${h}px;background:${bg}"></i>`;
  }
  return `<div class="ribbon">${s}</div>`;
}
function grid54(done, { blanks = [], today = null } = {}) {
  let s = '';
  for (let i = 1; i <= 54; i++) {
    let st = 'background:var(--faint)';
    if (i === today) st = 'background:var(--faint);box-shadow:inset 0 0 0 2px var(--accent)';
    else if (blanks.includes(i)) st = 'background:var(--faint)';
    else if (i <= done) st = 'background:var(--accent)';
    s += `<i style="${st}"></i>`;
  }
  return `<div class="grid54">${s}</div>`;
}
const plate = (src, h, pos = '50% 20%') =>
  `<div class="plate" style="height:${h}px;background-image:url('${src}');background-position:${pos}"></div>`;

const hd = (left, right = '') =>
  `<div class="hd"><div class="lab">${left}</div><div class="tap">${right}</div></div>`;

const opt = (name, desc, { on = false, right = '' } = {}) =>
  `<div class="opt${on ? ' on' : ''}"><div><div class="n">${name}</div>${desc ? `<div class="d">${desc}</div>` : ''}</div>${right ? `<div class="r">${right}</div>` : ''}</div>`;

const stat = (k, v) => `<div class="stat"><span class="k">${k}</span><span class="v">${v}</span></div>`;

// 5단 막대 — 지금 단만 강조. group=true 면 내 단 하나만 강조하고 나머지는 조원 몫으로 흐리게.
function bar5(current, { group = false } = {}) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    let bg = 'var(--faint)';
    if (i === current) bg = 'var(--accent)';
    else if (!group && i < current) bg = 'var(--ash)';
    s += `<i style="background:${bg}"></i>`;
  }
  return `<div class="bar5">${s}</div>`;
}

/* ── 4. 묵주 그림 ──────────────────────────────────────────────
   좌표는 프로토타입 v4 의 등호장(equal arc length) 배치를 그대로 잇는다.
   알 지름 36.8px = 화면 폭 390 의 9.4% (FR-26 의 8% 이상).
   SVG 원에 호흡을 걸 때 transform-box:fill-box 가 반드시 필요하다(프로토타입 실측 교훈). */
const BEADS = [[42,128],[56,93],[93,74],[133,65],[174,61],[216,61],[257,65],[297,74],[334,93],[348,128]];
const R = 18.4;
const BRE = 'transform-box:fill-box;transform-origin:center;animation:bre 4s ease-in-out infinite';
const PULSE = 'transform-box:fill-box;transform-origin:center;animation:pulse 1.6s ease-in-out infinite';

// 알 하나. state: past | future | current | 그리고 재질 셋.
function bead(x, y, state, mat, extra = '') {
  const c = [];
  const acc = 'var(--accent)', ink = 'var(--bead)', line = 'var(--bead-line)';
  if (mat === 'pearl') {
    if (state === 'future') c.push(`<circle cx="${x}" cy="${y}" r="${R}" fill="var(--faint)" stroke="${line}" stroke-width="1.6"/>`);
    else c.push(`<circle cx="${x}" cy="${y}" r="${R}" fill="${state === 'current' ? acc : ink}" ${extra}/>`);
    c.push(`<circle cx="${x}" cy="${y}" r="${R}" fill="none" stroke="var(--surface)" stroke-width="1.6" opacity=".5"/>`);
    c.push(`<circle cx="${x - 6}" cy="${y - 7}" r="5" fill="var(--surface)" opacity="${state === 'future' ? .5 : .72}"/>`);
  } else if (mat === 'glass') {
    if (state === 'future') c.push(`<circle cx="${x}" cy="${y}" r="${R}" fill="none" stroke="${line}" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="${R - 6}" fill="none" stroke="${line}" stroke-width="1"/>`);
    else {
      c.push(`<circle cx="${x}" cy="${y}" r="${R}" fill="${state === 'current' ? acc : ink}" opacity="${state === 'current' ? .72 : .28}" ${extra}/>`);
      c.push(`<circle cx="${x}" cy="${y}" r="${R}" fill="none" stroke="${state === 'current' ? acc : ink}" stroke-width="1.6"/>`);
    }
  } else { // wood — 기본
    if (state === 'future') c.push(`<circle cx="${x}" cy="${y}" r="${R}" fill="none" stroke="${line}" stroke-width="1.6"/>`);
    else c.push(`<circle cx="${x}" cy="${y}" r="${R}" fill="${state === 'current' ? acc : ink}" ${extra}/>`);
  }
  return c.join('');
}

// 지금 알의 다섯 상태 = reading | turn | buzz | shift | pause
function rosary(o = {}) {
  const { n = 4, state = 'reading', mat = 'wood', tail = true, w = 340, h = 245, still = false } = o;
  const vbH = tail ? 281 : 196;
  const paused = state === 'pause';
  const shift = state === 'shift';
  const g = [];
  const th = 'var(--thread)';
  g.push(`<path d="M42 128 C34 56 125 46 195 48 C265 46 356 56 348 128" fill="none" stroke="${th}" stroke-width="1.4"/>`);
  if (!tail) g.push(`<path d="M42 128 C50 166 130 182 195 182 C260 182 340 166 348 128" fill="none" stroke="${th}" stroke-width="1.4"/>`);
  if (tail) {
    g.push(`<path d="M42 128 C56 170 147 198 195 210" fill="none" stroke="${th}" stroke-width="1.4"/>`);
    g.push(`<path d="M348 128 C334 170 243 198 195 210" fill="none" stroke="${th}" stroke-width="1.4"/>`);
    g.push(`<path d="M195 231 L195 252" fill="none" stroke="${th}" stroke-width="1.4"/>`);
    g.push(`<path d="M195 252 L195 278 M180 262 L210 262" fill="none" stroke="var(--rule2)" stroke-width="2.4"/>`);
    // 주님의 기도 알 — 단이 바뀔 때 여기로 초점이 옮겨 가며 확장 맥동한다
    if (shift) {
      g.push(`<circle cx="195" cy="210" r="40" fill="var(--accent)" opacity=".14" style="${PULSE}"/>`);
      g.push(`<circle cx="195" cy="210" r="26" fill="var(--accent)" style="${PULSE}"/>`);
    } else {
      g.push(`<circle cx="195" cy="210" r="21" fill="none" stroke="var(--bead-line)" stroke-width="1.6"/>`);
    }
  }
  BEADS.forEach(([x, y], i) => {
    const idx = i + 1;
    const isCur = idx === n && !shift;
    let st = idx < n ? 'past' : idx > n ? 'future' : 'current';
    if (shift) st = 'past';
    let extra = '';
    if (isCur && state === 'turn' && !still) extra = `style="${BRE}"`;
    if (isCur && state === 'turn') g.push(`<circle cx="${x}" cy="${y}" r="34" fill="var(--accent)" opacity=".14"${still ? '' : ` style="${BRE}"`}/>`);
    if (isCur && state === 'buzz') g.push(`<circle cx="${x}" cy="${y}" r="26" fill="none" stroke="var(--accent)" stroke-width="1.6" opacity=".55"/>`);
    g.push(bead(x, y, st, mat, extra));
    if (isCur && state === 'reading') {
      // 읽는 중 — 테두리가 시계 방향으로 차오른다 (지금 62%)
      const r = 24, C = 2 * Math.PI * r;
      g.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="var(--rule)" stroke-width="2.2"/>`);
      g.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="butt" stroke-dasharray="${(C * .62).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${x} ${y})"/>`);
    }
    if (isCur) {
      g.push(`<text x="${x}" y="${y + 1}" text-anchor="middle" style="font:500 15px 'Noto Sans KR';fill:var(--surface)">${n}</text>`);
      g.push(`<text x="${x}" y="${y + 12}" text-anchor="middle" style="font:400 9px 'Noto Sans KR';fill:var(--surface);opacity:.85">/ 10</text>`);
    }
  });
  return `<svg width="${w}" height="${h}" viewBox="0 0 390 ${vbH}"${paused ? ' opacity=".38"' : ''}>${g.join('')}</svg>`;
}

// D-E 대안 3 — 전체 59알을 작게 그린 미니 묵주
function miniRosary() {
  const g = [`<ellipse cx="95" cy="34" rx="78" ry="26" fill="none" stroke="var(--thread)" stroke-width="1"/>`];
  for (let i = 0; i < 50; i++) {
    const a = (i / 50) * Math.PI * 2 - Math.PI / 2;
    const x = 95 + Math.cos(a) * 78, y = 34 + Math.sin(a) * 26;
    const done = i < 23;
    g.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.1" fill="${done ? 'var(--bead)' : 'none'}" stroke="var(--bead-line)" stroke-width=".8"/>`);
  }
  g.push(`<circle cx="${(95 + Math.cos((23 / 50) * Math.PI * 2 - Math.PI / 2) * 78).toFixed(1)}" cy="${(34 + Math.sin((23 / 50) * Math.PI * 2 - Math.PI / 2) * 26).toFixed(1)}" r="5.4" fill="var(--accent)"/>`);
  return `<svg width="190" height="72" viewBox="0 0 190 72">${g.join('')}</svg>`;
}

/* ── 5. 화면 ──────────────────────────────────────────────────── */

/* L 로그인 — 초대 코드 진입점은 두지 않는다(계정 필수, 정합표 #9) */
const L = (err = false) => `
<div class="scr" style="padding:0 0 26px">
  ${plate(IMG.mary, 340, '50% 16%')}
  <div style="padding:34px 24px 0;display:flex;flex-direction:column;flex:1">
    <div class="lab">54일 기도</div>
    <div class="ser" style="font-size:38px;line-height:1.25;margin-top:16px">묵주</div>
    <div class="bd" style="margin-top:16px">하나의 지향을 쉰네 날 동안 바칩니다.<br>오늘 어디까지 바쳤는지는 앱이 기억합니다.</div>
    ${err ? `<div class="sm acc" style="margin-top:18px">로그인이 되지 않았습니다. 다시 시도해 주세요.<br>연결이 필요합니다</div>` : ''}
    <div class="gr"></div>
    <div class="btn ${err ? 'dis' : 'p'}">구글로 계속</div>
    <div class="btn ${err ? 'dis' : 'o'}" style="margin-top:12px">Apple로 계속</div>
    <div class="sm" style="text-align:center;margin-top:20px">계정은 여정과 자리를 기기 사이에 맞추는 데만 씁니다.<br>계속하면 이용약관과 개인정보 처리방침에 동의합니다.<br>바람 문구는 서버에서 암호화해 보관합니다.</div>
  </div>
</div>`;

/* A 홈 — 여정 목록 */
const cardSolo = () => `
<div style="padding:24px 0 22px;border-bottom:1px solid var(--rule)">
  <div style="display:flex;gap:16px;align-items:flex-start">
    ${plate(IMG.child, 124, '50% 20%').replace('class="plate"', 'class="plate" ').replace('style="height:124px', 'style="width:96px;height:124px')}
    <div style="flex:1;min-width:0">
      <div class="ser" style="font-size:24px;line-height:1.3">어머니 병환 회복</div>
      <div style="font:500 12px/1 'Noto Sans KR';color:var(--accent);letter-spacing:.06em;margin-top:10px">23일째 · 청원</div>
      <div style="font:400 12.5px/1.6 'Noto Sans KR';color:var(--ink);margin-top:12px">고통의 신비<br>제3단 4번째 알부터 이어서</div>
      <div class="sm" style="margin-top:6px">어제 저녁</div>
    </div>
  </div>
  ${ribbon(54, 22, { h: 22, blanks: [8, 16] })}
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:9px">
    <span class="sm">7월 14일 시작 · 9월 5일 마칠 날</span><span class="tap">자세히</span>
  </div>
</div>`;

const cardGroup = () => `
<div style="padding:24px 0 22px;border-bottom:1px solid var(--rule)">
  <div style="display:flex;gap:16px;align-items:flex-start">
    ${plate(IMG.family, 124, '50% 30%').replace('style="height:124px', 'style="width:96px;height:124px')}
    <div style="flex:1;min-width:0">
      <div class="ser" style="font-size:24px;line-height:1.3">아버지 세례를 위해</div>
      <div style="font:500 12px/1 'Noto Sans KR';color:var(--accent);letter-spacing:.06em;margin-top:10px">6일째 · 함께 바치기</div>
      <div style="font:400 12.5px/1.6 'Noto Sans KR';color:var(--ink);margin-top:12px">오늘 바쳤습니다</div>
      <div class="sm" style="margin-top:6px">내 몫 제2단 · 오늘 다섯 중 셋</div>
    </div>
  </div>
  ${ribbon(54, 6, { h: 22 })}
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:9px">
    <span class="sm">7월 31일 시작 · 9월 22일 마칠 날</span><span class="tap">자세히</span>
  </div>
</div>`;

const homeHead = (count) => `
<div class="hd">
  <div class="lab">내 기도 · ${count}</div>
  <div style="display:flex;align-items:center;gap:14px">
    <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="none" stroke="var(--muted)" stroke-width="1.1"/><text x="10" y="14.5" text-anchor="middle" style="font:400 11px 'Noto Sans KR';fill:var(--muted)">i</text></svg>
    <span class="tap" style="letter-spacing:.1em">설정</span>
  </div>
</div>`;

const A_home = () => `
<div class="scr">
  ${homeHead('둘')}
  <div class="sc">${cardSolo()}${cardGroup()}</div>
  <div class="btn p" style="margin-top:14px">새 기도</div>
  <div class="btn t">초대 코드로 들어가기</div>
</div>`;

const A_states = () => `
<div class="scr">
  ${homeHead('넷')}
  <div class="sm" style="padding:12px 0 0">연결되면 맞춰 둡니다.</div>
  <div class="sm acc" style="padding:6px 0 12px;border-bottom:1px solid var(--rule)">이 기기에 한국어 음성이 없어 소리 없이 진행됩니다. 진동과 받는 사이는 그대로 동작합니다.</div>
  <div class="sc">
    <div style="padding:22px 0 20px;border-bottom:1px solid var(--rule)">
      <div style="display:flex;gap:16px;align-items:flex-start">
        ${plate(IMG.child, 96, '50% 20%').replace('style="height:96px', 'style="width:74px;height:96px')}
        <div style="flex:1;min-width:0">
          <div class="ser" style="font-size:24px;line-height:1.3">어머니 병환 회복</div>
          <div style="font:500 12px/1 'Noto Sans KR';color:var(--accent);margin-top:10px">23일째 · 청원</div>
          <div class="bd" style="margin-top:12px">오늘 바쳤습니다</div>
        </div>
      </div>
      ${ribbon(54, 23, { h: 18, blanks: [8, 16] })}
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:9px">
        <span class="sm">7월 14일 시작 · 9월 5일 마칠 날</span><span class="tap">자세히</span>
      </div>
    </div>
    <div style="padding:22px 0 20px;border-bottom:1px solid var(--rule);opacity:.44">
      <div style="display:flex;gap:16px;align-items:flex-start">
        ${plate(IMG.mary, 96, '50% 16%').replace('style="height:96px', 'style="width:74px;height:96px')}
        <div style="flex:1;min-width:0">
          <div class="ser" style="font-size:24px;line-height:1.3">형의 취업을 위하여</div>
          <div class="sm" style="margin-top:12px">3일 뒤에 시작합니다<br>8월 8일</div>
        </div>
      </div>
    </div>
    <div style="padding:22px 0 20px;border-bottom:1px solid var(--rule)">
      <div class="lab2" style="margin-bottom:12px">마침</div>
      <div style="display:flex;gap:16px;align-items:flex-start">
        ${plate(IMG.family, 96, '50% 30%').replace('style="height:96px', 'style="width:74px;height:96px')}
        <div style="flex:1;min-width:0">
          <div class="ser" style="font-size:22px;line-height:1.3">할머니를 위하여</div>
          <div class="sm" style="margin-top:12px">5월 8일 ~ 6월 30일 · 51일</div>
        </div>
      </div>
      ${ribbon(54, 54, { h: 14, blanks: [8, 16, 31] })}
      <div style="display:flex;justify-content:flex-end;margin-top:9px"><span class="tap">자세히</span></div>
    </div>
  </div>
  <div class="btn p" style="margin-top:14px">새 기도</div>
  <div class="btn t">초대 코드로 들어가기</div>
</div>`;

const A_empty = () => `
<div class="scr">
  ${homeHead('없음')}
  <div class="gr" style="display:flex;flex-direction:column;justify-content:center">
    <div class="ser" style="font-size:26px;line-height:1.45">아직 바치는<br>기도가 없습니다.</div>
    <div class="bd" style="margin-top:18px">바람 하나를 적고 시작해 보세요.<br>54일이든 하루든, 끊겨도 그 자리가 남습니다.</div>
  </div>
  <div class="btn p">새 기도</div>
  <div class="btn t">초대 코드로 들어가기</div>
</div>`;

/* N 새 기도 — 프로토타입의 네 구역을 잇고 PRD 가 요구하는 것을 그 안에 채웠다.
   구역 목록만 스크롤하고, 아래의 요약 두 줄과 `시작하기`는 고정이다. */
const zIntent = (empty = false) => `
<div class="zone">
  <div class="lab2">① 무엇을 위하여</div>
  ${empty
    ? `<div class="ser" style="font-size:23px;line-height:1.3;margin-top:12px;color:var(--muted)">누구를, 무엇을 위해 바치나요</div>
       <div class="sm acc" style="margin-top:10px">바람을 한 줄 적어 주세요.</div>`
    : `<div class="ser" style="font-size:23px;line-height:1.3;margin-top:12px">어머니 병환 회복<span class="acc">|</span></div>
       <div style="display:flex;justify-content:space-between;margin-top:10px">
         <span class="sm">쉰네 날 동안 · 나만 봅니다</span><span class="sm">9 / 24</span>
       </div>`}
</div>`;

// 청원/감사 — PRD FR-35 는 54일 기도에서 자동이다. 고르는 칸이 아니라 '이렇게 흐른다'는 표시.
const kindRibbon = () => `
<div style="margin-top:14px">
  <div style="display:flex;gap:3px">
    <div style="flex:27;height:12px;background:var(--accent)"></div>
    <div style="flex:27;height:12px;background:var(--ash)"></div>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:7px">
    <span class="sm">1일째부터 청원 27일</span><span class="sm">28일째부터 감사 27일</span>
  </div>
  <div class="sm" style="margin-top:8px">앱이 날짜에 따라 스스로 바꿉니다. 고르지 않아도 됩니다.</div>
</div>`;
const kindLine = () => `
<div class="sm" style="margin-top:16px">
  1일째부터 27일까지 청원, 28일째부터 감사로 앱이 스스로 바꿉니다. 고르지 않아도 됩니다.
</div>`;

const zKind = (variant = 'ribbon', offline = false) => `
<div class="zone">
  <div class="lab2">② 어떤 형식으로</div>
  <div style="margin-top:12px">
    ${opt('54일 기도', '27일 청원, 27일 감사. 하루에 다섯 단.', { on: true, right: '기본' })}
    ${opt('9일 기도', '아홉 날, 하루에 다섯 단.')}
    ${opt('날마다', '끝나는 날을 정하지 않습니다.')}
  </div>
  ${variant === 'ribbon' ? kindRibbon() : kindLine()}
  <div style="display:flex;gap:10px;margin-top:18px">
    <div class="btn2" style="border:1px solid var(--accent-line);background:var(--accent-bg)">
      <span class="t1">혼자</span><span class="t2">나 혼자 다섯 단</span></div>
    <div class="btn2" style="border:1px solid var(--rule)${offline ? ';opacity:.45' : ''}">
      <span class="t1">함께 바치기</span><span class="t2">다섯이 한 단씩</span></div>
  </div>
  <div class="sm" style="margin-top:10px">${offline
    ? '<span class="acc">조는 연결된 뒤 만들 수 있습니다.</span>'
    : '다섯이 한 단씩 나눕니다. 초대 코드로 모입니다.'}</div>
</div>`;

const zRecite = () => `
<div class="zone">
  <div class="lab2">③ 낭송</div>
  <div style="margin-top:12px">
    ${opt('교대로', '앞은 소리가 읽고 뒤는 내가 받습니다', { on: true, right: '기본' })}
    ${opt('전부 소리로', '처음부터 끝까지 읽어 줍니다')}
    ${opt('소리 없이', '진동으로만 넘어갑니다')}
  </div>
</div>`;

const zRosaryVersion = () => `
<div class="zone">
  <div class="lab2">④ 묵주와 기도문</div>
  <div style="margin-top:12px">
    ${opt('묵주', '나무', { right: '고르기' })}
    ${opt('기도문 판본', '가톨릭 기도서', { right: '고르기' })}
  </div>
  <div class="sm" style="margin-top:10px">이 여정에만 적용됩니다. 설정의 값은 다음 기도의 기본값으로 남습니다.</div>
</div>`;

const zStart = () => `
<div class="zone">
  <div class="lab2">⑤ 언제부터</div>
  <div style="margin-top:12px">
    ${opt('시작일', '오늘 · 8월 5일', { right: '고르기' })}
  </div>
  <div class="sm" style="margin-top:10px">지난 날을 고르면 그 날들은 비어 있는 채로 시작합니다.</div>
</div>`;

const nFoot = (ok = true) => `
<div style="flex:none;border-top:1px solid var(--rule);padding:16px 24px 0">
  <div class="bd">9월 27일에 마칩니다.</div>
  <div class="sm" style="margin-top:6px">첫날은 환희의 신비입니다</div>
  <div class="btn ${ok ? 'p' : 'dis'}" style="margin-top:14px">시작하기</div>
</div>`;

const N_top = (variant = 'ribbon') => `
<div class="scr edge">
  <div class="px">${hd('새 기도', '닫기')}</div>
  <div class="sc px">${zIntent()}${zKind(variant)}</div>
  ${nFoot()}
</div>`;
const N_scroll = (zones) => `
<div class="scr edge">
  <div class="px">${hd('새 기도', '닫기')}</div>
  <div class="sc px">${zones}</div>
  ${nFoot()}
</div>`;
const N_error = () => `
<div class="scr edge">
  <div class="px">${hd('새 기도', '닫기')}</div>
  <div class="sc px">${zIntent(true)}${zKind('ribbon', true)}</div>
  ${nFoot(false)}
</div>`;

/* B 기도 — 이 화면의 세로 예산 (390 × 844)
   56 위 + 머리 31 + 5단 막대 16 + 성화 도판 132 + 묵주(남는 만큼 243)
   + 기도문 236(고정) + 사이 16 + 나가는 길 88 + 아래 26 = 844
   묵주 SVG 는 340 × 243, viewBox 390 × 262 → 알 지름 32.1px = 화면 폭의 8.2% (FR-26) */
const PRAY = {
  lead: '은총이 가득하신 마리아님, 기뻐하소서!',
  mine: '천주의 성모 마리아님, 이제와 저희 죽을 때에 저희 죄인을 위하여 빌어주소서. 아멘.'
};
const collapsed = (t) => `<div style="font:400 15px/1.6 'Noto Sans KR';color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</div>`;

function prayerArea(state) {
  const inner = state === 'turn' || state === 'buzz'
    ? `${collapsed('은총이 가득하신 마리아님, 기뻐하소서!')}
       <div class="ser acc" style="font-size:21px;line-height:1.7;margin-top:12px">${PRAY.mine}</div>`
    : state === 'shift'
      ? `<div class="ser" style="font-size:26px;line-height:1.7">고통의 신비 제4단</div>
         <div class="sub" style="margin-top:12px">예수님께서 우리를 위하여 십자가 지심</div>`
      : `<div class="ser" style="font-size:26px;line-height:1.7">${PRAY.lead}</div>
         <div style="margin-top:12px">${collapsed(PRAY.mine)}</div>`;
  return `<div style="flex:none;height:236px;overflow:hidden;padding:16px 24px 0;border-top:1px solid var(--rule);display:flex;flex-direction:column;justify-content:flex-start${state === 'pause' ? ';opacity:.38' : ''}">${inner}</div>`;
}

function B(o = {}) {
  const { state = 'reading', mat = 'wood', group = false, n = 4 } = o;
  const paused = state === 'pause';
  const step = group ? '제2단 · 성모송' : state === 'shift' ? '제4단 · 신비 선포' : '제3단 · 성모송';
  return `
<div class="scr edge">
  <div class="px">
    <div class="hd" style="padding-bottom:12px">
      <div style="font:400 12.5px/1.4 'Noto Sans KR';color:var(--ink)">${group ? '아버지 세례를 위해 <span class="sm">· 6일째</span>' : '어머니 병환 회복 <span class="sm">· 23일째</span>'}</div>
      <div class="lab season" style="letter-spacing:.16em">${step}</div>
    </div>
    ${bar5(group ? 2 : (state === 'shift' ? 4 : 3), { group })}
    <div style="height:14px"></div>
  </div>
  ${plate(IMG.jesus, 132, '50% 22%')}
  <div style="flex:1;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center">
    ${rosary({ n, state, mat, w: 340, h: 243 })}
  </div>
  ${prayerArea(state)}
  <div class="px" style="display:flex;gap:12px;margin-top:16px">
    ${paused
      ? `<div class="btn2" style="border:1px solid var(--accent-line);background:var(--accent-bg)"><span class="t1">이어서 바치기</span><span class="t2">제3단 4번째 알</span></div>
         <div class="btn2" style="border:1px solid var(--rule2)"><span class="t1">홈으로</span><span class="t2">자리가 남습니다</span></div>`
      : `<div class="btn2" style="border:1px solid var(--rule2)"><span class="t1">잠시 멈춤</span><span class="t2">자리가 남습니다</span></div>
         <div class="btn2" style="border:1px solid var(--rule2)"><span class="t1" style="color:var(--muted)">여기서 끝내기</span><span class="t2">오늘 처음부터</span></div>`}
  </div>
</div>`;
}

/* B — 시스템 글자 200% 확대. 도판을 접고 묵주는 고리만 남겨 기도문 영역을 키운다.
   기도문의 표시 단위가 '절'에서 '구절'로 바뀐다(README 접근성 절). */
const B_200 = () => `
<div class="scr edge">
  <div class="px">
    <div class="hd" style="padding-bottom:12px">
      <div style="font:400 25px/1.35 'Noto Sans KR';color:var(--ink)">어머니 병환 회복</div>
    </div>
    <div class="lab season" style="font-size:21px;letter-spacing:.1em;margin-top:12px">제3단 · 성모송</div>
    ${bar5(3)}
  </div>
  <div style="flex:none;height:140px;display:flex;align-items:center;justify-content:center;overflow:hidden">
    ${rosary({ n: 4, state: 'turn', tail: false, w: 340, h: 132 })}
  </div>
  <div style="flex:1;min-height:0;overflow:hidden;padding:16px 24px 0;border-top:1px solid var(--rule)">
    <div style="font:400 30px/1.6 'Noto Sans KR';color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">은총이 가득하신…</div>
    <div class="ser acc" style="font-size:42px;line-height:1.65;margin-top:14px">천주의 성모 마리아님,</div>
    <div class="sm" style="font-size:20px;margin-top:16px">구절 단위로 넘어갑니다</div>
  </div>
  <div class="px" style="display:flex;gap:12px;margin-top:16px">
    <div class="btn2" style="border:1px solid var(--rule2);height:104px"><span class="t1" style="font-size:22px">잠시 멈춤</span></div>
    <div class="btn2" style="border:1px solid var(--rule);height:104px"><span class="t1" style="font-size:22px;color:var(--muted)">여기서 끝내기</span></div>
  </div>
</div>`;

/* C 하루 완주 · C′ 여정 완주 */
const C = (group = false) => `
<div class="scr">
  <div class="lab" style="padding-bottom:16px;border-bottom:1px solid var(--rule)">8월 5일 · 스물세 번째 날</div>
  <div class="ser" style="font-size:34px;line-height:1.35;margin:44px 0 18px">다 바쳤습니다</div>
  <div class="bd">어머니 병환 회복을 위하여 · 23일째<br>고통의 신비 ${group ? '제2단' : '다섯 단'}</div>
  ${group ? `<div class="sm" style="margin-top:14px">오늘 다섯 중 셋이 바쳐졌습니다</div>` : ''}
  <div style="margin-top:30px">${ribbon(54, 23, { h: 26, blanks: [8, 16] })}</div>
  <div class="sm" style="margin-top:10px">54일 중 21일 바쳤습니다 · 남은 31일</div>
  <div class="gr"></div>
  ${stat('성모송', group ? '10번' : '50번')}
  ${stat('걸린 시간', group ? '5분' : '18분')}
  ${stat('이어서', '2번')}
  <div class="btn p" style="margin-top:26px">돌아가기</div>
</div>`;

const Cprime = () => `
<div class="scr edge">
  ${plate(IMG.child, 248, '50% 18%')}
  <div class="px" style="display:flex;flex-direction:column;flex:1;padding-top:30px">
    <div class="lab">9월 5일 · 쉰네 번째 날</div>
    <div class="ser" style="font-size:36px;line-height:1.35;margin-top:16px">쉰네 날을<br>다 바쳤습니다</div>
    <div class="bd" style="margin-top:16px">어머니 병환 회복을 위하여</div>
    <div style="margin-top:24px">${ribbon(54, 54, { h: 30, blanks: [8, 16, 31] })}</div>
    <div class="gr"></div>
    ${stat('첫날', '7월 14일')}
    ${stat('마지막 날', '9월 5일')}
    ${stat('바친 날', '54일 중 51일')}
    <div class="btn p" style="margin-top:22px">돌아가기</div>
  </div>
</div>`;

/* D 여정 상세 — 한 화면에 다 들어가지 않으므로 스크롤 위/아래 두 장으로 보인다 */
const dHead = (group) => `
    <div style="padding:22px 0 18px;border-bottom:1px solid var(--rule)">
      <div class="ser" style="font-size:27px;line-height:1.3">${group ? '아버지 세례를 위해' : '어머니 병환 회복'}</div>
      <div class="sm" style="margin-top:12px">54일 기도 · ${group ? '7월 31일 ~ 9월 22일' : '7월 14일 ~ 9월 5일'}<br>가톨릭 기도서 · 나무 묵주</div>
    </div>`;
const dFoot = (group) => `
  <div class="px" style="flex:none;border-top:1px solid var(--rule);padding-top:14px">
    <div class="btn o">오늘 처음부터</div>
    <div class="btn t">${group ? '조에서 나가기' : '이 여정 지우기'}</div>
  </div>`;

const D_top = (group = false) => `
<div class="scr edge">
  <div class="px">${hd(group ? '함께 바치는 여정' : '여정', '돌아가기')}</div>
  <div class="sc px">
    ${dHead(group)}
    <div style="padding:18px 0">
      <div style="display:flex;align-items:baseline;gap:10px">
        <span class="mono-n">${group ? 6 : 23}</span><span class="bd">일째 · ${group ? '청원 · 남은 48일' : '청원 · 남은 31일'}</span>
      </div>
      <div style="margin-top:16px">${group ? grid54(5, { today: 6 }) : grid54(22, { blanks: [8, 16], today: 23 })}</div>
      <div class="sm" style="margin-top:12px">채운 칸은 바친 날, 빈 칸은 바치지 않은 날입니다. 테두리 칸이 오늘입니다.<br>칸을 누르면 그날의 기록이 열립니다.</div>
    </div>
    <div style="border-top:1px solid var(--rule)">
      ${stat('바친 날', group ? '5일' : '20일')}
      ${stat('바치지 않은 날', group ? '0일' : '2일')}
    </div>
  </div>
  ${dFoot(group)}
</div>`;

const D_bottom = (group = false) => `
<div class="scr edge">
  <div class="px">${hd(group ? '함께 바치는 여정' : '여정', '돌아가기')}</div>
  <div class="sc px">
    ${group ? `
    <div style="padding:22px 0 4px">
      <div class="lab2">조</div>
      <div style="margin-top:12px">
        ${opt('초대 코드 K7M42B', '아는 사람만 들어옵니다', { right: '나누기' })}
        ${opt('조원 4 / 5', '이모 · 김요한 · 박마리아 · 나')}
        ${opt('오늘 배정', '내 몫 제2단 · 오늘 다섯 중 셋', { right: '보기' })}
      </div>
      <div class="sm" style="margin-top:10px">누가 아직 바치지 않았는지는 적지 않습니다.</div>
    </div>` : ''}
    <div style="padding:${group ? '14px' : '18px'} 0 10px;border-top:1px solid var(--rule)">
      ${stat('바친 날', group ? '5일' : '20일')}
      ${stat('바치지 않은 날', group ? '0일' : '2일')}
      ${stat('성모송', group ? '50번' : '1,000번')}
      ${stat('감사로 바뀌는 날', group ? '28일째 · 8월 27일' : '28일째 · 8월 10일')}
      ${stat('마치는 날', group ? '9월 22일' : '9월 5일')}
    </div>
    ${group ? '' : `<div class="sm" style="padding-bottom:10px">지난 기록은 칸을 눌러 하나씩 볼 수 있습니다.</div>`}
  </div>
  ${dFoot(group)}
</div>`;

/* E 설정 — 묶음 셋. 한 화면에 다 들어가지 않으므로 위/아래 두 장으로 보인다. */
const E_top = () => `
<div class="scr edge">
  <div class="px">${hd('설정', '돌아가기')}</div>
  <div class="sc px">
    <div class="zone">
      <div class="lab2">바치는 방식</div>
      <div style="margin-top:12px">
        ${opt('전부 읽기', '앱이 처음부터 끝까지 읽습니다')}
        ${opt('교대', '앞 절은 앱이, 뒷 절은 직접 바칩니다', { on: true, right: '기본' })}
        ${opt('읽지 않기', '소리 없이 진동으로만 넘어갑니다')}
      </div>
      <div style="margin-top:12px">
        ${opt('받는 사이', '보통', { right: '고르기' })}
        ${opt('손 없이 조작', '폰을 흔들면 다음 알로, 이어폰 버튼으로 앞뒤로', { right: '꺼짐' })}
      </div>
      <div class="sm" style="margin-top:10px">켜면 흔들기와 이어폰 버튼을 씁니다. 음량 버튼은 V1에서 쓰지 않습니다.</div>
    </div>
    <div class="zone">
      <div class="lab2">보이는 것</div>
      <div style="margin-top:12px">
        ${opt('묵주', '나무', { right: '고르기' })}
        ${opt('기본 기도문 판본', '가톨릭 기도서', { right: '고르기' })}
      </div>
    </div>
  </div>
</div>`;

const E_bottom = () => `
<div class="scr edge">
  <div class="px">${hd('설정', '돌아가기')}</div>
  <div class="sc px">
    <div class="zone">
      <div class="lab2">보이는 것</div>
      <div style="margin-top:12px">
        ${opt('묵주', '나무', { right: '고르기' })}
        ${opt('기본 기도문 판본', '가톨릭 기도서', { right: '고르기' })}
      </div>
      <div class="sm" style="margin-top:10px">새로 만드는 기도에 적용됩니다.</div>
      <div style="display:flex;margin-top:14px">
        <div class="btn2" style="border:1px solid var(--rule);box-shadow:inset 0 0 0 1px var(--accent-line);background:var(--accent-bg);position:relative;z-index:1"><span class="t1">기기 따름</span></div>
        <div class="btn2" style="border:1px solid var(--rule);margin-left:-1px"><span class="t1">밤</span></div>
        <div class="btn2" style="border:1px solid var(--rule);margin-left:-1px"><span class="t1">낮</span></div>
      </div>
    </div>
    <div class="zone">
      <div class="lab2">계정</div>
      <div style="margin-top:12px">
        <div class="opt" style="min-height:64px"><div><div class="n">김건우</div><div class="d">구글 계정 · 연결됨 · 마지막 맞춤 방금</div></div></div>
        ${opt('로그아웃', '이 기기에서 나갑니다')}
        ${opt('계정 삭제', '서버의 모든 기도와 기록이 지워집니다')}
        ${opt('소개', '이 시제품이 무엇을 검증하는지', { right: '보기' })}
      </div>
    </div>
  </div>
</div>`;

/* I 초대 코드 입력 */
const codeCells = (filled, active = -1, err = false) => {
  const chars = ['K', '7', 'M', '4', '2', 'B'];
  let s = '';
  for (let i = 0; i < 6; i++) {
    const on = i === active;
    const has = i < filled;
    s += `<div style="flex:1;height:88px;display:flex;align-items:center;justify-content:center;
      border:1px solid ${on || err ? 'var(--accent-line)' : has ? 'var(--ink)' : 'var(--rule2)'};
      ${on ? 'background:var(--accent-bg);' : ''}
      font:500 28px/1 'Noto Sans KR';color:${on || err ? 'var(--accent)' : 'var(--ink)'}">${has || on ? chars[i] : ''}</div>`;
  }
  return `<div style="display:flex;gap:8px;margin-top:30px">${s}</div>`;
};

const I = (kind) => {
  const filled = kind === 'empty' ? 0 : kind === 'typing' ? 3 : 6;
  const active = kind === 'typing' ? 3 : -1;
  const preview = kind === 'ready' ? `
    <div style="margin-top:32px;padding:22px 20px;border:1px solid var(--rule)">
      <div class="lab2">들어갈 여정</div>
      <div class="ser" style="font-size:22px;line-height:1.35;margin-top:12px">아버지 세례를 위해</div>
      <div class="bd" style="margin-top:10px">6일째 · 다섯 사람 중 넷이 들어와 있습니다<br><span class="sm">이모 · 김요한 · 박마리아 · 나</span></div>
    </div>` : '';
  const err = kind === 'bad' ? '이 코드의 기도를 찾지 못했습니다.'
    : kind === 'full' ? '이 기도는 다섯 명이 다 모였습니다.' : '';
  return `
<div class="scr">
  ${hd('초대 코드', '닫기')}
  <div class="ser" style="font-size:28px;line-height:1.4;margin-top:34px">받은 여섯 자리를<br>넣어 주세요</div>
  ${codeCells(filled, active, !!err)}
  <div class="sm" style="margin-top:14px">${err ? `<span class="acc">${err}</span>` : '대소문자를 가리지 않습니다. 붙여넣어도 됩니다.'}</div>
  ${preview}
  <div class="gr"></div>
  <div class="btn ${kind === 'ready' ? 'p' : 'dis'}">들어가기</div>
</div>`;
};

/* G 함께 바치기 배정 */
const assignRow = (n, name, statev, mine = false) => `
<div style="min-height:64px;display:flex;align-items:center;gap:14px;padding:0 16px;
  border-bottom:1px solid var(--rule)${mine ? ';background:var(--accent-bg);border-left:2px solid var(--accent-line)' : ''}">
  <div style="width:74px;flex:none;white-space:nowrap;font:${mine ? '500' : '400'} 22px/1 'Noto Sans KR';color:${mine ? 'var(--accent)' : 'var(--muted)'}">${n}</div>
  <div style="flex:1;font:400 14px/1.4 'Noto Sans KR';color:var(--ink)">${name}</div>
  <div class="sm">${statev}</div>
</div>`;

const G = (kind = 'base') => `
<div class="scr edge">
  <div class="px">${hd('함께 바치기', '돌아가기')}</div>
  <div class="sc">
    <div class="px" style="padding-top:26px">
      <div class="ser" style="font-size:26px;line-height:1.35">${kind === 'offline' ? '오늘 배정을 아직<br>받지 못했습니다' : '오늘 내 몫은<br>제2단입니다'}</div>
      <div class="sm" style="margin-top:14px">${kind === 'offline'
        ? '연결이 없어 어제와 같은 단을 바칩니다.<br>연결되면 서버 배정과 맞춥니다.'
        : '아버지 세례를 위해 · 6일째<br>다섯 사람이 한 단씩 나누어 하루를 채웁니다.'}</div>
    </div>
    <div style="margin-top:22px;border-top:1px solid var(--rule)">
      ${assignRow('제1단', '이모', '바쳤습니다')}
      ${assignRow('제2단', '나', kind === 'offline' ? '어제와 같은 단' : '아직', true)}
      ${assignRow('제3단', '김요한', '바쳤습니다')}
      ${assignRow('제4단', '박마리아', '아직')}
      ${assignRow('제5단', '아직 아무도', '빈자리')}
    </div>
    <div class="px sm" style="padding-top:16px">오늘 다섯 중 둘 · 남은 단은 자정까지 기다립니다</div>
  </div>
  <div class="px" style="flex:none;padding-top:14px">
    <div class="btn p">내 몫 바치기</div>
    <div class="btn t">다섯 단 모두 혼자 바치기</div>
  </div>
</div>`;

/* ── 6. 시트 일곱 ─────────────────────────────────────────────── */
const sheetOver = (parent, sheet) => `${parent}<div class="sheetwrap"><div class="sheet">${sheet}</div></div>`;
const shHead = (label) => `<div class="hd" style="padding-bottom:14px;margin-bottom:6px"><div class="lab">${label}</div><div class="tap">닫기</div></div>`;
const confirm2 = (title, body, yes, no) => `
  <div class="ser" style="font-size:22px;line-height:1.45">${title}</div>
  <div class="sm" style="margin-top:12px">${body}</div>
  <div style="display:flex;gap:12px;margin-top:22px">
    <div class="btn o" style="flex:1">${yes}</div>
    <div class="btn p" style="flex:1">${no}</div>
  </div>`;

const S2 = () => sheetOver(E_top(), `${shHead('받는 사이')}
  ${opt('느리게', '천천히 바침')}
  ${opt('보통', '기본', { on: true, right: '선택' })}
  ${opt('빠르게', '익숙한 분')}`);

const S3 = () => sheetOver(D_top(false), `${shHead('오늘 처음부터')}
  ${confirm2('오늘 자리를 지우고<br>처음부터 바칩니다.', '지금까지 바친 오늘의 자리가 사라집니다. 지난 날의 기록은 그대로 있습니다.', '처음부터', '아니요, 이어서')}`);

const S4 = () => sheetOver(E_bottom(), `${shHead('기도문 판본')}
  <div style="min-height:88px;padding:16px;border:1px solid var(--accent-line);background:var(--accent-bg)">
    <div style="display:flex;justify-content:space-between"><span class="opt-n" style="font:500 14px/1 'Noto Sans KR';color:var(--ink)">가톨릭 기도서</span><span class="sm acc">선택</span></div>
    <div class="ser" style="font-size:15px;line-height:1.6;margin-top:8px;color:var(--muted)">은총이 가득하신 마리아님, 기뻐하소서!</div>
  </div>
  <div style="min-height:88px;padding:16px;border:1px solid var(--rule);border-top:none">
    <div style="font:500 14px/1 'Noto Sans KR';color:var(--ink)">옛 기도서</div>
    <div class="ser" style="font-size:15px;line-height:1.6;margin-top:8px;color:var(--muted)">은총을 가득히 입으신 마리아여, 기뻐하소서.</div>
  </div>
  <div class="sm" style="margin-top:12px">진행 중인 여정의 문구는 바뀌지 않습니다.<br>판본 목록과 사용 권한은 아직 확정되지 않았습니다(D-4).</div>`);

const beadStrip = (mat) => {
  const xs = [44, 112, 180, 248, 316], y = 44;
  const states = ['reading', 'turn', 'buzz', 'shift', 'pause'];
  let g = '';
  xs.forEach((x, i) => {
    const st = states[i];
    if (st === 'turn') g += `<circle cx="${x}" cy="${y}" r="34" fill="var(--accent)" opacity=".2"/>`;
    if (st === 'buzz') g += `<circle cx="${x}" cy="${y}" r="26" fill="none" stroke="var(--accent)" stroke-width="1.6" opacity=".55"/>`;
    if (st === 'shift') g += `<circle cx="${x}" cy="${y}" r="30" fill="var(--accent)" opacity=".2"/>`;
    const op = st === 'pause' ? ' opacity=".38"' : '';
    g += `<g${op}${st === 'shift' ? ' transform="translate(' + x + ' ' + y + ') scale(1.3) translate(' + (-x) + ' ' + (-y) + ')"' : ''}>${bead(x, y, st === 'pause' ? 'past' : 'current', mat)}</g>`;
    if (st === 'reading') {
      const rr = 24, C = 2 * Math.PI * rr;
      g += `<circle cx="${x}" cy="${y}" r="${rr}" fill="none" stroke="var(--rule)" stroke-width="2.2"/>
            <circle cx="${x}" cy="${y}" r="${rr}" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-dasharray="${(C * .62).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${x} ${y})"/>`;
    }
  });
  const names = ['읽는 중', '내 차례', '진동', '단 전환', '멈춤'];
  return `<div style="width:340px">
    <svg width="340" height="86" viewBox="0 0 360 86">${g}</svg>
    <div style="display:flex">${names.map(t => `<div style="flex:1;text-align:center;font:400 10px/1.4 'Noto Sans KR';color:var(--muted)">${t}</div>`).join('')}</div>
  </div>`;
};

const S5 = () => sheetOver(E_bottom(), `${shHead('묵주 고르기')}
  <div style="display:flex;gap:10px">
    ${['나무', '진주', '유리'].map((nm, i) => `
      <div style="flex:1;min-height:88px;padding:14px 0;display:flex;flex-direction:column;align-items:center;gap:10px;
        border:1px solid ${i === 0 ? 'var(--accent-line)' : 'var(--rule)'};${i === 0 ? 'background:var(--accent-bg);' : ''}">
        <svg width="40" height="40" viewBox="0 0 40 40">${bead(20, 20, 'past', ['wood', 'pearl', 'glass'][i]).replace(/cx="20" cy="20" r="18.4"/g, 'cx="20" cy="20" r="15"').replace(/cx="14" cy="13" r="4.2"/g, 'cx="15" cy="14" r="3.6"').replace(/r="12.4"/g, 'r="9"')}</svg>
        <span style="font:500 13px/1 'Noto Sans KR';color:var(--ink)">${nm}</span>
      </div>`).join('')}
  </div>
  <div class="sm" style="margin-top:14px">어느 묵주를 골라도 알의 다섯 상태를 그대로 보여 줍니다.</div>
  <div style="margin-top:10px;display:flex;justify-content:center">${beadStrip('wood')}</div>`);

const S6 = (kind) => {
  const map = {
    solo: ['이 기도를 지웁니다.<br>기록도 함께 지워집니다.', '되돌릴 수 없습니다.', '지우기', '두기'],
    disband: ['조를 해산합니다.', '조원 모두의 카드에서 이 기도가 사라집니다.', '해산', '두기'],
    leave: ['조에서 나옵니다.', '남은 조원에게 단이 다시 배정됩니다.', '나가기', '두기']
  }[kind];
  return sheetOver(kind === 'solo' ? A_home() : D_top(true), `${shHead(kind === 'solo' ? '여정 지우기' : kind === 'disband' ? '조 해산' : '조에서 나가기')}
    ${confirm2(map[0], map[1], map[2], map[3])}`);
};

const S7 = () => sheetOver(A_home(), `${shHead('소개')}
  <div class="ser" style="font-size:22px;line-height:1.45">이 시제품이 무엇을<br>검증하는지</div>
  <div class="bd" style="margin-top:14px">교대로 바치는 낭송이 실제로 편한지, 끊긴 자리에서 이어 바치는 것이 도움이 되는지를 봅니다.</div>
  <div class="sm" style="margin-top:14px">아직 아닌 것 — 기도문 공식 판본, 배경 성화의 최종 이미지, 알림. 셋은 검증 뒤에 채웁니다.</div>
  <div class="btn o" style="margin-top:22px">닫기</div>`);

const SDel = () => sheetOver(E_bottom(), `${shHead('계정 삭제')}
  ${confirm2('계정을 지웁니다.', '서버의 모든 기도와 기록이 지워집니다. 조에 있었으면 조에서 빠집니다.', '지우기', '두기')}`);

const GConfirm = () => sheetOver(G('base'), `${shHead('다섯 단 모두 혼자 바치기')}
  ${confirm2('오늘 다섯 단을<br>혼자 바칩니다.', '오늘 하루가 다 채워집니다. 다른 조원이 오늘 자기 단을 바쳐도 그 기록은 개인 기록으로 남습니다. 내일 배정은 그대로입니다.', '혼자 바치기', '두기')}`);

/* ── 7. 견줌 패널 — 묵주 그림 대안(D-E) · 묵주 3종(D-F) · 성화 슬롯(D-J) ── */
const panel = (inner) => `<div class="panel">${inner}</div>`;
const altA = () => panel(rosary({ n: 4, state: 'turn', w: 320, h: 236, still: true }));
const altB = () => panel(`<svg width="320" height="236" viewBox="0 0 390 281">
  ${rosary({ n: 4, state: 'turn', w: 320, h: 236, still: true }).replace(/^<svg[^>]*>/, '').replace('</svg>', '')}
  <path d="M42 128 C20 118 8 112 2 108" fill="none" stroke="var(--thread)" stroke-width="1.4" opacity=".55"/>
  <path d="M348 128 C370 118 382 112 388 108" fill="none" stroke="var(--thread)" stroke-width="1.4" opacity=".55"/>
  <circle cx="16" cy="112" r="9" fill="none" stroke="var(--bead-line)" stroke-width="1.2" opacity=".5"/>
  <circle cx="374" cy="112" r="9" fill="none" stroke="var(--bead-line)" stroke-width="1.2" opacity=".5"/>
</svg>`);
const altC = () => panel(`<div style="display:flex;flex-direction:column;align-items:center;gap:14px">
  ${miniRosary()}
  ${rosary({ n: 4, state: 'turn', tail: false, w: 300, h: 118, still: true })}
</div>`);

const matPanel = (mat) => panel(`<div style="display:flex;flex-direction:column;align-items:center;gap:16px">
  ${rosary({ n: 4, state: 'turn', mat, tail: false, w: 300, h: 118, still: true })}
  ${beadStrip(mat)}
</div>`);

const slotPanel = () => `<div style="display:flex;gap:14px;flex-wrap:wrap">
  ${[['환희의 신비', IMG.child], ['고통의 신비', IMG.jesus], ['영광의 신비', IMG.mary], ['빛의 신비', IMG.family]].map(([nm, src]) => `
  <figure><div style="width:180px;height:132px;position:relative;overflow:hidden;background:var(--bg)">
    <div class="plate" style="height:132px;background-image:url('${src}');background-position:50% 22%"></div>
    <div style="position:absolute;left:24%;top:14%;width:52%;height:46%;border:1px dashed var(--accent)"></div>
  </div><figcaption style="max-width:180px">${nm}</figcaption></figure>`).join('')}
</div>`;

/* ── 8. 조립 ──────────────────────────────────────────────────── */
const fr = (cap, inner) => `<figure><div class="frame">${inner}</div><figcaption>${cap}</figcaption></figure>`;
const pc = (cap, inner) => `<figure>${inner}<figcaption>${cap}</figcaption></figure>`;

const SECTIONS = [
  ['L 로그인', '계정이 필수이므로(FR-32) 로그인 화면에는 초대 코드 진입점을 두지 않는다. 프로토타입에 있던 그 한 줄은 결정 1-1에 따라 홈으로 옮겼다.', [
    fr('<b>L-1</b> 기본', L(false)),
    fr('<b>L-2</b> 연결 없음 · 로그인 실패', L(true))
  ]],
  ['A 홈 — 여정 목록', '카드 한 줄을 누르면 곧 기도다. 카드 오른쪽의 “자세히”만 여정 상세로 간다.', [
    fr('<b>A-1</b> 기본 — 혼자 여정과 조 여정', A_home()),
    fr('<b>A-2</b> 오늘 바쳤음 · 시작 전 · 마침 · 연결 없음 · 음성 없음', A_states()),
    fr('<b>A-3</b> 빈 홈 — 이것이 정상 상태다', A_empty())
  ]],
  ['N 새 기도', '프로토타입의 네 구역을 잇고 PRD가 요구하던 것을 그 안에 채웠다. 구역 목록만 스크롤하고 아래의 요약 두 줄과 “시작하기”는 고정이다.', [
    fr('<b>N-1</b> 구역 ①② (스크롤 위) — 청원/감사는 <u>추천안</u>인 리본 표시', N_top('ribbon')),
    fr('<b>N-2</b> 구역 ③ 낭송 (스크롤 가운데)', N_scroll(zRecite() + zRosaryVersion())),
    fr('<b>N-3</b> 구역 ④⑤ (스크롤 아래)', N_scroll(zRosaryVersion() + zStart())),
    fr('<b>N-4</b> 청원/감사 <u>대안</u> — 문장 한 줄', N_top('line')),
    fr('<b>N-5</b> 바람 비어 있음 · 연결 없어 함께 바치기 불가', N_error())
  ]],
  ['I 초대 코드 입력 (새 화면 · 결정 1-1)', '진입점은 홈의 “초대 코드로 들어가기” 하나뿐이다.', [
    fr('<b>I-1</b> 빈 칸', I('empty')),
    fr('<b>I-2</b> 입력 중', I('typing')),
    fr('<b>I-3</b> 여섯 칸 채움 + 여정 미리보기', I('ready')),
    fr('<b>I-4</b> 코드를 찾지 못함', I('bad')),
    fr('<b>I-5</b> 정원이 다 참', I('full'))
  ]],
  ['G 함께 바치기 배정 (새 화면 · 결정 1-3)', '“다섯 단 모두 혼자 바치기”는 조 진척 계산에 새 경우를 만들므로(Q-03) 확인 시트를 반드시 거친다.', [
    fr('<b>G-1</b> 오늘 배정을 받은 상태', G('base')),
    fr('<b>G-2</b> 오프라인 — 배정을 받지 못함', G('offline')),
    fr('<b>G-3</b> 다섯 단 모두 혼자 바치기 확인', GConfirm())
  ]],
  ['B 기도 — 알의 다섯 상태', '화면 안에 고르는 조작이 하나도 없다. 나가는 길은 둘뿐이고, 멈춤 상태에서만 그 둘이 바뀐다.', [
    fr('<b>B-1</b> 읽는 중 — 테두리가 시계 방향으로 차오른다', B({ state: 'reading' })),
    fr('<b>B-2</b> 내 차례 — 4초 호흡', B({ state: 'turn' })),
    fr('<b>B-3</b> 진동 진행(읽지 않기) — 한 번 반짝', B({ state: 'buzz' })),
    fr('<b>B-4</b> 단 전환 — 주님의 기도 알로 초점이 옮겨 가며 확장 맥동', B({ state: 'shift' })),
    fr('<b>B-5</b> 멈춤 — 호흡이 멎고 흐려진다. 나가는 길이 바뀐다', B({ state: 'pause' })),
    fr('<b>B-6</b> 조 기도 — 5단 막대에 내 단만 강조, 나머지 넷은 조원 몫', B({ state: 'turn', group: true, n: 6 })),
    fr('<b>B-7</b> 시스템 글자 200% — 도판을 접고 기도문이 구절 단위가 된다', B_200())
  ]],
  ['C 하루 완주 · C′ 여정 완주', '축하 어휘를 쓰지 않는다. 빈 날은 빈 채로 남기고 말을 붙이지 않는다.', [
    fr('<b>C-1</b> 하루 완주', C(false)),
    fr('<b>C-2</b> 하루 완주 — 조 기도', C(true)),
    fr('<b>C′</b> 여정 완주 (쉰네 날째)', Cprime())
  ]],
  ['D 여정 상세', '기도로 들어가는 자리가 아니다. 그것은 홈 카드다. 아래의 두 조작은 스크롤과 무관하게 고정이다.', [
    fr('<b>D-1</b> 혼자 여정 (스크롤 위)', D_top(false)),
    fr('<b>D-2</b> 혼자 여정 (스크롤 아래) — 기록', D_bottom(false)),
    fr('<b>D-3</b> 조 여정 (스크롤 위)', D_top(true)),
    fr('<b>D-4</b> 조 여정 (스크롤 아래) — 초대 코드·조원·오늘 배정', D_bottom(true))
  ]],
  ['E 설정', '묶음 셋으로 위계를 준다. 한 화면에 다 담기지 않으므로 스크롤 위/아래 두 장으로 보인다.', [
    fr('<b>E-1</b> 바치는 방식', E_top()),
    fr('<b>E-2</b> 보이는 것 · 계정', E_bottom())
  ]],
  ['시트 일곱', 'S1은 결번이다(Q-01). 시트는 언제나 부모 화면 위에 뜬다.', [
    fr('<b>S2</b> 받는 사이', S2()),
    fr('<b>S3</b> 오늘 처음부터', S3()),
    fr('<b>S4</b> 기도문 판본', S4()),
    fr('<b>S5</b> 묵주 고르기', S5()),
    fr('<b>S6-가</b> 여정 지우기 (혼자)', S6('solo')),
    fr('<b>S6-나</b> 조 해산 (만든 사람)', S6('disband')),
    fr('<b>S6-다</b> 조에서 나가기 (조원)', S6('leave')),
    fr('<b>S7</b> 소개', S7()),
    fr('<b>계정 삭제 확인</b>', SDel())
  ]],
  ['묵주 그림의 나머지 알 — 대안 셋 (D-E · 공방장 판단 필요)', '어느 안이든 지금 알의 지름은 32.1px(화면 폭의 8.2%)로 FR-26을 넘는다. 추천과 근거는 README에 있다.', [
    pc('<b>안 1</b> 지금 방식 유지 — 현재 단 열 알과 큰 알만 실제 크기, 나머지는 실선 <b>(추천)</b>', altA()),
    pc('<b>안 2</b> 이어지는 실 — 고리 좌우로 실과 작은 알이 흘러나가 “더 큰 묵주의 한 토막”임을 알린다', altB()),
    pc('<b>안 3</b> 작은 전체 + 큰 현재 — 위에 59알 전체, 아래에 현재 단', altC())
  ]],
  ['묵주 3종 (D-F)', '색을 늘리지 않고 형태로만 가른다. 각 재질이 알의 다섯 상태(읽는 중 · 내 차례 · 진동 · 단 전환 · 멈춤)를 그대로 표현한다.', [
    pc('<b>나무</b> — 채운 원', matPanel('wood')),
    pc('<b>진주</b> — 채운 원 + 빛점', matPanel('pearl')),
    pc('<b>유리</b> — 반투명 + 이중 테두리', matPanel('glass'))
  ]],
  ['성화 슬롯 (D-J)', '신비 4종마다 갈아 끼우는 고정 높이 도판이다. 점선은 <b>이목구비가 들어와야 하는 자리</b>다 — 그림은 이목구비가 이 틀 안에 오도록 잘라 넣고(도판의 background-position 으로 맞춘다), 묵주·글자·그라디언트는 이 안에 두지 않는다(FR-23). 아래 넉 장은 저작권 미확정 목업이라 신비에 맞는 그림이 아니며 자리만 채운 것이다.', [
    pc('네 신비의 슬롯 — 자산은 저작권 미확정 목업(D-1)', slotPanel())
  ]]
];

function page(key) {
  const t = THEME[key];
  const vars = Object.entries(t.v).map(([k, v]) => `${k}:${v}`).join(';');
  const body = SECTIONS.map(([h, note, items]) =>
    `<h2>${h}</h2><p class="note">${note}</p><div class="row">${items.join('')}</div>`).join('\n');
  return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8">
<title>묵주 — ${t.name} · 화면 열 + 시트 일곱</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<style>:root{${vars}}
${CSS}</style></head>
<body>
<h1>묵주 · ${t.name} — 화면 열 + 시트 일곱 (390 × 844)</h1>
<p class="lead">${t.lead} 라디우스 0, 그림자 0, 구역을 나누는 것은 카드가 아니라 얇은 괘선. 모든 주 조작의 터치 영역은 88px이다(결정 큐 Q-06b).<br>
이 파일과 <code>screens-${key === 'day' ? 'night' : 'day'}.html</code>은 <b>같은 마크업</b>에서 나왔고 다른 것은 맨 위 CSS 변수 한 벌뿐이다. 조립기는 <code>build.mjs</code>, 값·규칙·판단 요청은 <code>README.md</code>에 있다.</p>
${body}
</body></html>`;
}

for (const key of ['day', 'night']) {
  writeFileSync(join(OUT, `screens-${key}.html`), page(key));
  console.log(`docs/design/screens-${key}.html 를 썼다.`);
}
