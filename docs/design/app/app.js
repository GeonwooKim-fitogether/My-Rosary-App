/* MyRosary — 눌러 보는 실제 동작 앱 (바닐라 JS 하나, 빌드 없음).
   화면·색·간격은 docs/design/build.mjs 의 시안을 그대로 옮겼고, 여기서는 동작만 붙인다.
   기도 도메인 데이터(77단계·기도문·신비)는 spec/ 의 JSON 을 build-app.mjs 가 그대로 끼워 넣는다. */
(function () {
'use strict';

/* ── 0. spec 데이터 ──────────────────────────────────────────── */
var SPEC = JSON.parse(document.getElementById('spec-data').textContent);
var SEQ = SPEC.sequence.steps;
var PRAYERS = SPEC.prayers.prayers;
var MYST = SPEC.mysteries;
/* 사도신경은 spec/prayers.ko.json 에 첫 문장만 있다(D-4 판본 미확정).
   여기서 지어 넣지 않는다 — 있는 그대로 읽고 보여 준다. */

/* 시험용 배속 계수. 화면에 노출하지 않는다. ?fast=1 이면 아주 빠르게, ?fast=0.08 이면 12배 빠르게. */
var FASTQ = (location.search.match(/[?&]fast=([0-9.]+)/) || [])[1];
var FAST = FASTQ ? (Number(FASTQ) === 1 ? 0.005 : Number(FASTQ)) : 0;
function scale(ms, floor) { return FAST ? Math.max(floor || 12, ms * FAST) : ms; }

var PLATE = {
  joyful: '../product/prototype/assets/02_Mary_and_Child.jpg',
  sorrowful: '../product/prototype/assets/06_Side_Jesus.jpg',
  glorious: '../product/prototype/assets/01_Mary_Single.jpg',
  luminous: '../product/prototype/assets/07_Relief_Holy_Family.jpg'
};
var PACE = { slow: 0.75, normal: 1, fast: 1.35 };
var VIB = { bead: [18], decade: [28, 60, 28, 60, 28], silentOn: [20, 50, 20], finish: [200] };
var VIRTUAL = ['이모', '김요한', '박마리아'];
var VIRTUAL_DEMO = ['이모', '김요한', '박마리아', '최요셉'];
var DEMO_CODE = 'K7M42B';

/* ── 1. 저장 ─────────────────────────────────────────────────── */
var KEY = 'myrosary.v1';
var memOnly = false, mem = null;
function blank() {
  return {
    account: null,
    settings: { recite: 'alternate', pace: 'normal', handsFree: false, rosary: 'wood', version: 'catholic', theme: 'system' },
    prefs: { rosaryArt: 1, kindVariant: 'ribbon', rosaryRow: true, fs: 1 },
    journeys: [], dayOffset: 0
  };
}
function load() {
  if (memOnly) return mem;
  try {
    var raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    var o = JSON.parse(raw), b = blank();
    o.settings = Object.assign(b.settings, o.settings || {});
    o.prefs = Object.assign(b.prefs, o.prefs || {});
    o.journeys = o.journeys || [];
    o.dayOffset = o.dayOffset || 0;
    return o;
  } catch (e) { return blank(); }
}
function save() {
  if (memOnly) { mem = S; return; }
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { memOnly = true; mem = S; }   /* 사생활 보호 창 — 메모리로만 돈다 */
}
var S;
try { S = load(); } catch (e) { memOnly = true; S = blank(); mem = S; }

/* ── 2. 날짜·규칙 ────────────────────────────────────────────── */
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function nowD() { var d = new Date(); d.setDate(d.getDate() + (S.dayOffset || 0)); return d; }
function today() { return iso(nowD()); }
function parseISO(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function addDays(s, n) { var d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); }
function diffDays(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 86400000); }
function kdate(s) { var d = parseISO(s); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일'; }
function totalDays(j) { return j.format === 'fiftyfour' ? 54 : j.format === 'novena9' ? 9 : null; }
function dayIndex(j, date) { return diffDays(j.startDate, date || today()) + 1; }
function endDate(j) { var t = totalDays(j); return t ? addDays(j.startDate, t - 1) : null; }
function mysteryKey(j, di, date) {
  if (j.format === 'fiftyfour') {
    var c = MYST.rules.fiftyfour.cycle;
    return c[((di - 1) % c.length + c.length) % c.length];
  }
  return MYST.rules.weekday.by_weekday[parseISO(date || today()).getDay()];
}
function mysteryName(k) { return MYST.sets[k].name; }
function decadeTitle(k, d) { return MYST.sets[k].decades[d - 1]; }
function kindOf(j, di) { return j.format === 'fiftyfour' ? (di <= 27 ? '청원' : '감사') : ''; }
function dayLine(j, di) {
  if (j.mode === 'group') return di + '일째 · 함께 바치기';
  if (j.format === 'fiftyfour') return di + '일째 · ' + kindOf(j, di);
  if (j.format === 'novena9') return di + '일째';
  return di + '번째 날';
}
function relTime(ts) {
  if (!ts) return '';
  var m = Math.floor((Date.now() - ts) / 60000);
  if (m < 2) return '방금';
  if (m < 60) return m + '분 전';
  var d0 = new Date(ts), n0 = new Date();
  if (iso(d0) === iso(n0)) return Math.floor(m / 60) + '시간 전';
  var y = new Date(n0); y.setDate(y.getDate() - 1);
  if (iso(d0) === iso(y)) return d0.getHours() >= 17 ? '어제 저녁' : d0.getHours() >= 12 ? '어제 낮' : '어제 아침';
  return kdate(iso(d0));
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function hash(s) { var h = 0, i; for (i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return Math.abs(h); }
function findJ(id) { for (var i = 0; i < S.journeys.length; i++) if (S.journeys[i].id === id) return S.journeys[i]; return null; }

/* 조 배정 — 조원 인덱스에 날짜를 더해 돌린다. 다섯이 안 차면 그 단은 빈자리로 둔다(시안 G-1). */
function assignment(j, di) {
  var ms = j.group.members, out = [], i;
  for (i = 1; i <= 5; i++) out.push({ decade: i, name: null, me: false });
  for (i = 0; i < ms.length; i++) {
    var d = ((i + di - 1) % 5);
    out[d].name = ms[i].name; out[d].me = !!ms[i].me;
  }
  return out;
}
function myDecade(j, di) {
  var a = assignment(j, di);
  for (var i = 0; i < a.length; i++) if (a[i].me) return a[i].decade;
  return 1;
}
/* 다른 조원의 오늘 상태는 서버가 없어 흉내다 — 날짜와 이름으로 정해져 매번 같다. */
function otherDone(j, di, name) { return hash(j.id + '|' + di + '|' + name) % 3 !== 2; }
function groupK(j, di) {
  var rec = j.days[dateOfIndex(j, di)];
  if (rec && rec.k != null) return rec.k;
  var a = assignment(j, di), k = 0;
  for (var i = 0; i < a.length; i++) {
    if (!a[i].name || a[i].me) continue;
    if (otherDone(j, di, a[i].name)) k++;
  }
  return k;
}
function dateOfIndex(j, di) { return addDays(j.startDate, di - 1); }

/* ── 3. 소리 ─────────────────────────────────────────────────── */
var TTS = {
  voice: null, ok: false,
  init: function () {
    if (!('speechSynthesis' in window)) return;
    var pick = function () {
      var vs = [];
      try { vs = speechSynthesis.getVoices() || []; } catch (e) { }
      TTS.voice = null;
      for (var i = 0; i < vs.length; i++) if (/^ko/i.test(vs[i].lang || '')) { TTS.voice = vs[i]; break; }
      TTS.ok = !!TTS.voice;
    };
    pick();
    try { speechSynthesis.addEventListener('voiceschanged', pick); } catch (e) { }
  },
  speak: function (text, onEnd) {
    if (!this.ok) return false;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.voice = this.voice; u.lang = this.voice.lang; u.rate = 0.92;
      if (onEnd) { u.onend = onEnd; u.onerror = onEnd; }
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  },
  stop: function () { try { speechSynthesis.cancel(); } catch (e) { } }
};
TTS.init();
function buzz(pattern) {
  if (!navigator.vibrate) return;
  try { navigator.vibrate(pattern); } catch (e) { }
}

/* ── 4. 묵주 그림 ────────────────────────────────────────────── */
var BEADS = [[42, 128], [56, 93], [93, 74], [133, 65], [174, 61], [216, 61], [257, 65], [297, 74], [334, 93], [348, 128]];
var R = 18.4;
var BRE = 'transform-box:fill-box;transform-origin:center;animation:bre 4s ease-in-out infinite';
var PULSE = 'transform-box:fill-box;transform-origin:center;animation:pulse 1.6s ease-in-out infinite';

function beadShape(x, y, st, mat, extra, r) {
  r = r || R; extra = extra || '';
  var acc = 'var(--accent)', ink = 'var(--bead)', line = 'var(--bead-line)', c = [];
  if (mat === 'pearl') {
    if (st === 'future') c.push('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="var(--faint)" stroke="' + line + '" stroke-width="1.6"/>');
    else c.push('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (st === 'current' ? acc : ink) + '" ' + extra + '/>');
    c.push('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="var(--surface)" stroke-width="1.6" opacity=".5"/>');
    c.push('<circle cx="' + (x - r * 0.33) + '" cy="' + (y - r * 0.38) + '" r="' + (r * 0.27) + '" fill="var(--surface)" opacity="' + (st === 'future' ? .5 : .72) + '"/>');
  } else if (mat === 'glass') {
    if (st === 'future') c.push('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + line + '" stroke-width="1.4"/><circle cx="' + x + '" cy="' + y + '" r="' + (r - 6) + '" fill="none" stroke="' + line + '" stroke-width="1"/>');
    else {
      c.push('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (st === 'current' ? acc : ink) + '" opacity="' + (st === 'current' ? .72 : .28) + '" ' + extra + '/>');
      c.push('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + (st === 'current' ? acc : ink) + '" stroke-width="1.6"/>');
    }
  } else {
    if (st === 'future') c.push('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + line + '" stroke-width="1.6"/>');
    else c.push('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (st === 'current' ? acc : ink) + '" ' + extra + '/>');
  }
  return c.join('');
}

function ringMarkup(x, y, r) {
  var C = 2 * Math.PI * r;
  return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="var(--rule)" stroke-width="2.2"/>' +
    '<circle id="readRing" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="var(--accent)" stroke-width="2.2" ' +
    'stroke-linecap="butt" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '" ' +
    'transform="rotate(-90 ' + x + ' ' + y + ')" data-c="' + C.toFixed(1) + '"/>';
}

/* n = 이 단에서 지나온 알 수, focus = 'loop' 면 n 번째 알이 지금 알, 'big' 이면 큰 알이 지금 알 */
function rosarySVG(o) {
  var n = o.n || 0, focus = o.focus || 'loop', state = o.state || 'turn', mat = o.mat || 'wood';
  var tail = o.tail !== false, w = o.w || 340, h = o.h || 243, label = o.label || null, side = !!o.side;
  var vbH = tail ? 281 : 196, th = 'var(--thread)', g = [];
  var bigCur = focus === 'big';
  g.push('<path d="M42 128 C34 56 125 46 195 48 C265 46 356 56 348 128" fill="none" stroke="' + th + '" stroke-width="1.4"/>');
  if (!tail) g.push('<path d="M42 128 C50 166 130 182 195 182 C260 182 340 166 348 128" fill="none" stroke="' + th + '" stroke-width="1.4"/>');
  if (side) {
    g.push('<path d="M42 128 C20 118 8 112 2 108" fill="none" stroke="' + th + '" stroke-width="1.4" opacity=".55"/>');
    g.push('<path d="M348 128 C370 118 382 112 388 108" fill="none" stroke="' + th + '" stroke-width="1.4" opacity=".55"/>');
    g.push('<circle cx="16" cy="112" r="9" fill="none" stroke="var(--bead-line)" stroke-width="1.2" opacity=".5"/>');
    g.push('<circle cx="374" cy="112" r="9" fill="none" stroke="var(--bead-line)" stroke-width="1.2" opacity=".5"/>');
  }
  if (tail) {
    g.push('<path d="M42 128 C56 170 147 198 195 210" fill="none" stroke="' + th + '" stroke-width="1.4"/>');
    g.push('<path d="M348 128 C334 170 243 198 195 210" fill="none" stroke="' + th + '" stroke-width="1.4"/>');
    g.push('<path d="M195 231 L195 252" fill="none" stroke="' + th + '" stroke-width="1.4"/>');
    g.push('<path d="M195 252 L195 278 M180 262 L210 262" fill="none" stroke="var(--rule2)" stroke-width="2.4"/>');
    if (bigCur && state === 'shift') {
      g.push('<circle cx="195" cy="210" r="40" fill="var(--accent)" opacity=".14" style="' + PULSE + '"/>');
      g.push('<circle cx="195" cy="210" r="26" fill="var(--accent)" style="' + PULSE + '"/>');
    } else if (bigCur) {
      if (state === 'turn') g.push('<circle cx="195" cy="210" r="38" fill="var(--accent)" opacity=".14" style="' + BRE + '"/>');
      if (state === 'buzz') g.push('<circle cx="195" cy="210" r="30" fill="none" stroke="var(--accent)" stroke-width="1.6" style="animation:flash .6s ease-out forwards"/>');
      g.push(beadShape(195, 210, 'current', mat, state === 'turn' ? 'style="' + BRE + '"' : '', 21));
      if (state === 'reading') g.push(ringMarkup(195, 210, 27));
    } else {
      g.push('<circle cx="195" cy="210" r="21" fill="none" stroke="var(--bead-line)" stroke-width="1.6"/>');
    }
  }
  for (var i = 0; i < BEADS.length; i++) {
    var x = BEADS[i][0], y = BEADS[i][1], idx = i + 1;
    var isCur = !bigCur && idx === n;
    var st = idx < n ? 'past' : (idx > n ? 'future' : (bigCur ? 'past' : 'current'));
    var extra = '';
    if (isCur && state === 'turn') {
      g.push('<circle cx="' + x + '" cy="' + y + '" r="34" fill="var(--accent)" opacity=".14" style="' + BRE + '"/>');
      extra = 'style="' + BRE + '"';
    }
    if (isCur && state === 'buzz') g.push('<circle cx="' + x + '" cy="' + y + '" r="26" fill="none" stroke="var(--accent)" stroke-width="1.6" style="animation:flash .6s ease-out forwards"/>');
    g.push(beadShape(x, y, st, mat, extra));
    if (isCur && state === 'reading') g.push(ringMarkup(x, y, 24));
    if (isCur && label) {
      g.push('<text x="' + x + '" y="' + (y + 1) + '" text-anchor="middle" style="font:500 15px \'Noto Sans KR\';fill:var(--surface)">' + label.top + '</text>');
      if (label.bottom) g.push('<text x="' + x + '" y="' + (y + 12) + '" text-anchor="middle" style="font:400 9px \'Noto Sans KR\';fill:var(--surface);opacity:.85">' + label.bottom + '</text>');
    }
  }
  return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 390 ' + vbH + '"' + (state === 'pause' ? ' opacity=".38"' : '') + '>' + g.join('') + '</svg>';
}

function miniRosary(done) {
  var g = ['<ellipse cx="95" cy="34" rx="78" ry="26" fill="none" stroke="var(--thread)" stroke-width="1"/>'], i;
  for (i = 0; i < 50; i++) {
    var a = (i / 50) * Math.PI * 2 - Math.PI / 2;
    var x = 95 + Math.cos(a) * 78, y = 34 + Math.sin(a) * 26;
    g.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.1" fill="' + (i < done ? 'var(--bead)' : 'none') + '" stroke="var(--bead-line)" stroke-width=".8"/>');
  }
  var ac = ((done % 50) / 50) * Math.PI * 2 - Math.PI / 2;
  g.push('<circle cx="' + (95 + Math.cos(ac) * 78).toFixed(1) + '" cy="' + (34 + Math.sin(ac) * 26).toFixed(1) + '" r="5.4" fill="var(--accent)"/>');
  return '<svg width="190" height="72" viewBox="0 0 190 72">' + g.join('') + '</svg>';
}

/* 버전 패널의 묵주 그림 안 셋 */
function rosaryHTML(o, boxH) {
  var art = S.prefs.rosaryArt;
  if (art === 3) {
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:10px">' +
      miniRosary(o.passed || 0) +
      rosarySVG(Object.assign({}, o, { tail: false, w: 300, h: Math.max(90, boxH - 86) })) + '</div>';
  }
  return rosarySVG(Object.assign({}, o, { side: art === 2, h: boxH }));
}

/* ── 5. 조각 ─────────────────────────────────────────────────── */
function ribbon(j, opt) {
  opt = opt || {};
  var total = totalDays(j) || Math.max(14, dayIndex(j) + 3), h = opt.h || 22, s = '', i;
  var td = today();
  for (i = 1; i <= total; i++) {
    var d = dateOfIndex(j, i), rec = j.days[d], bg = 'var(--faint)';
    if (rec && rec.done) bg = (rec.k != null && rec.k < 5) ? 'var(--ash)' : 'var(--accent)';
    if (d === td && !(rec && rec.done)) bg = 'var(--ash)';
    s += '<i style="height:' + h + 'px;background:' + bg + '"></i>';
  }
  return '<div class="ribbon">' + s + '</div>';
}
function grid54(j) {
  var total = totalDays(j) || Math.max(18, dayIndex(j) + 6), s = '', i, td = today();
  for (i = 1; i <= total; i++) {
    var d = dateOfIndex(j, i), rec = j.days[d], st = 'background:var(--faint)';
    if (rec && rec.done) st = 'background:' + ((rec.k != null && rec.k < 5) ? 'var(--ash)' : 'var(--accent)');
    if (d === td) st += ';box-shadow:inset 0 0 0 2px var(--accent)';
    s += '<i data-act="day" data-d="' + d + '" title="' + d + '" style="' + st + '"></i>';
  }
  return '<div class="grid54">' + s + '</div>';
}
function bar5(cur, group) {
  var s = '', i;
  for (i = 1; i <= 5; i++) {
    var bg = 'var(--faint)';
    if (i === cur) bg = 'var(--accent)';
    else if (!group && i < cur) bg = 'var(--ash)';
    s += '<i style="background:' + bg + '"></i>';
  }
  return '<div class="bar5">' + s + '</div>';
}
function hd(left, right, act) {
  return '<div class="hd"><div class="lab">' + left + '</div>' +
    (right ? '<button class="tap" data-act="' + (act || 'back') + '" style="padding:30px 0 22px 44px;margin:-30px 0 -22px 0">' + right + '</button>' : '') + '</div>';
}
function opt(name, desc, o) {
  o = o || {};
  return '<button class="opt' + (o.on ? ' on' : '') + (o.info ? ' info' : '') + '"' +
    (o.act ? ' data-act="' + o.act + '"' : '') + (o.val ? ' data-v="' + esc(o.val) + '"' : '') + (o.id ? ' data-id="' + esc(o.id) + '"' : '') + '>' +
    '<span><span class="n" style="display:block">' + name + '</span>' + (desc ? '<span class="d" style="display:block">' + desc + '</span>' : '') + '</span>' +
    (o.right ? '<span class="r">' + o.right + '</span>' : '') + '</button>';
}
function stat(k, v) { return '<div class="stat"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>'; }
function plateDiv(mk, h, extra) {
  return '<div class="plate" style="height:' + h + 'px;background-image:url(\'' + PLATE[mk] + '\');background-position:50% 20%;' + (extra || '') + '"></div>';
}

/* ── 6. 화면 ─────────────────────────────────────────────────── */
var view = { name: 'login', p: {} };
var screensEl = document.getElementById('screens');
var deviceEl = document.getElementById('device');

function go(name, p) { view = { name: name, p: p || {} }; closeSheet(); render(); }

var SCREENS = {};

/* L 로그인 */
SCREENS.login = function () {
  return '<div class="scr" style="padding:0 0 26px">' +
    plateDiv('glorious', 340, 'background-position:50% 16%') +
    '<div style="padding:34px 24px 0;display:flex;flex-direction:column;flex:1">' +
    '<div class="lab">54일 기도</div>' +
    '<div class="ser t-huge" style="margin-top:16px">묵주</div>' +
    '<div class="bd" style="margin-top:16px">하나의 지향을 쉰네 날 동안 바칩니다.<br>오늘 어디까지 바쳤는지는 앱이 기억합니다.</div>' +
    '<div class="gr"></div>' +
    '<button class="btn p" data-act="signin" data-v="구글">구글로 계속</button>' +
    '<button class="btn o" data-act="signin" data-v="Apple" style="margin-top:12px">Apple로 계속</button>' +
    '<div class="sm" style="text-align:center;margin-top:20px">계정은 여정과 자리를 기기 사이에 맞추는 데만 씁니다.</div>' +
    '</div></div>';
};

/* A 홈 */
function countWord(n) { return ['없음', '하나', '둘', '셋', '넷', '다섯'][n] || (n + '개'); }
function todayLine(j) {
  var di = dayIndex(j), d = today(), rec = j.days[d];
  if (di <= 0) return { main: (1 - di) + '일 뒤에 시작합니다', sub: kdate(j.startDate) };
  if (rec && rec.done) return { main: '오늘 바쳤습니다', sub: '' };
  if (j.today && j.today.date === d) {
    var st = stepsOf(j, j.today.scope, j.today.decade)[j.today.idx];
    return { main: mysteryName(j.today.mystery) + '<br>' + (st ? st.label : '') + '부터 이어서', sub: relTime(j.today.savedAt) };
  }
  return { main: '아직', sub: mysteryName(mysteryKey(j, di, d)) };
}
function card(j) {
  var di = dayIndex(j), tl = todayLine(j), mk = mysteryKey(j, Math.max(1, di), today());
  var done = totalDays(j) && di > totalDays(j);
  var pre = di <= 0;
  var body = '<div style="display:flex;gap:16px;align-items:flex-start">' +
    plateDiv(mk, 124, 'width:96px') +
    '<div style="flex:1;min-width:0">' +
    '<div class="ser t-title">' + esc(j.intent) + '</div>' +
    (pre ? '' : '<div class="dayline" style="margin-top:10px">' + dayLine(j, di) + '</div>') +
    '<div class="cardsub" style="margin-top:12px">' + tl.main + '</div>' +
    (tl.sub ? '<div class="sm" style="margin-top:6px">' + tl.sub + '</div>' : '') +
    (j.mode === 'group' && !pre ? '<div class="sm" style="margin-top:6px">내 몫 제' + myDecade(j, di) + '단 · 오늘 다섯 중 ' + groupK(j, di) + '</div>' : '') +
    '</div></div>';
  var foot = '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:9px">' +
    '<span class="sm">' + kdate(j.startDate) + ' 시작' + (endDate(j) ? ' · ' + kdate(endDate(j)) + (done ? ' 마침' : ' 마칠 날') : '') + '</span>' +
    '<span class="tap" data-act="detail" data-id="' + j.id + '" style="padding:10px 0 10px 16px">자세히</span></div>';
  return '<div class="card' + (pre ? ' pre' : '') + '">' +
    '<button data-act="open" data-id="' + j.id + '" style="width:100%">' + body + '</button>' +
    (pre ? '' : ribbon(j, { h: 22 })) + foot + '</div>';
}
SCREENS.home = function () {
  var js = S.journeys.slice(), notice = '';
  if (!TTS.ok && S.settings.recite !== 'silent' && !FAST) notice =
    '<div class="sm acc" style="padding:10px 0 12px;border-bottom:1px solid var(--rule)">이 기기에 한국어 음성이 없어 소리 없이 진행됩니다. 진동과 받는 사이는 그대로 동작합니다.</div>';
  if (memOnly) notice += '<div class="sm" style="padding:10px 0 0">이 브라우저가 저장을 막고 있어 이번만 기억합니다.</div>';
  var list = js.length
    ? js.map(card).join('')
    : '<div class="gr" style="display:flex;flex-direction:column;justify-content:center;height:100%">' +
      '<div class="ser t-big">아직 바치는<br>기도가 없습니다.</div>' +
      '<div class="bd" style="margin-top:18px">바람 하나를 적고 시작해 보세요.<br>54일이든 하루든, 끊겨도 그 자리가 남습니다.</div></div>';
  return '<div class="scr">' +
    '<div class="hd"><div class="lab">내 기도 · ' + countWord(js.length) + '</div>' +
    '<div style="display:flex;align-items:center;gap:14px">' +
    '<button data-act="about" style="width:auto;padding:12px" aria-label="소개"><svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="none" stroke="var(--muted)" stroke-width="1.1"/><text x="10" y="14.5" text-anchor="middle" style="font:400 11px \'Noto Sans KR\';fill:var(--muted)">i</text></svg></button>' +
    '<button class="tap" data-act="settings" style="width:auto;letter-spacing:.1em;padding:12px 0 12px 12px">설정</button></div></div>' +
    notice +
    '<div class="sc">' + list + '</div>' +
    '<button class="btn p" data-act="new" style="margin-top:14px">새 기도</button>' +
    '<button class="btn t" data-act="invite">초대 코드로 들어가기</button>' +
    '</div>';
};

/* N 새 기도 */
var draft = null;
function newDraft() {
  return {
    intent: '', format: 'fiftyfour', mode: 'solo',
    recite: S.settings.recite, rosary: S.settings.rosary, version: S.settings.version,
    startDate: today()
  };
}
SCREENS.newjourney = function () {
  if (!draft) draft = newDraft();
  var d = draft, ok = d.intent.trim().length > 0;
  var di1 = 1, mk = d.format === 'fiftyfour'
    ? MYST.rules.fiftyfour.cycle[0]
    : MYST.rules.weekday.by_weekday[parseISO(d.startDate).getDay()];
  var end = d.format === 'fiftyfour' ? addDays(d.startDate, 53) : d.format === 'novena9' ? addDays(d.startDate, 8) : null;
  var kind = S.prefs.kindVariant === 'ribbon'
    ? '<div style="margin-top:14px"><div style="display:flex;gap:3px">' +
      '<div style="flex:27;height:12px;background:var(--accent)"></div><div style="flex:27;height:12px;background:var(--ash)"></div></div>' +
      '<div style="display:flex;justify-content:space-between;margin-top:7px"><span class="sm">1일째부터 청원 27일</span><span class="sm">28일째부터 감사 27일</span></div>' +
      '<div class="sm" style="margin-top:8px">앱이 날짜에 따라 스스로 바꿉니다. 고르지 않아도 됩니다.</div></div>'
    : '<div class="sm" style="margin-top:16px">1일째부터 27일까지 청원, 28일째부터 감사로 앱이 스스로 바꿉니다. 고르지 않아도 됩니다.</div>';

  return '<div class="scr edge">' +
    '<div class="px">' + hd('새 기도', '닫기', 'home') + '</div>' +
    '<div class="sc px">' +
    '<div class="zone"><div class="lab2">① 무엇을 위하여</div>' +
    '<input id="intentInput" maxlength="24" placeholder="누구를, 무엇을 위해 바치나요" value="' + esc(d.intent) + '">' +
    '<div style="display:flex;justify-content:space-between;margin-top:10px">' +
    '<span class="sm">' + (d.format === 'fiftyfour' ? '쉰네 날 동안' : d.format === 'novena9' ? '아홉 날 동안' : '날마다') + ' · 나만 봅니다</span>' +
    '<span class="sm" id="intentCount">' + d.intent.length + ' / 24</span></div>' +
    '<div class="sm acc" id="intentHint" style="margin-top:10px' + (ok ? ';display:none' : '') + '">바람을 한 줄 적어 주세요.</div>' +
    '</div>' +

    '<div class="zone"><div class="lab2">② 어떤 형식으로</div><div style="margin-top:12px">' +
    opt('54일 기도', '27일 청원, 27일 감사. 하루에 다섯 단.', { on: d.format === 'fiftyfour', right: '기본', act: 'dformat', val: 'fiftyfour' }) +
    opt('9일 기도', '아홉 날, 하루에 다섯 단.', { on: d.format === 'novena9', act: 'dformat', val: 'novena9' }) +
    opt('날마다', '끝나는 날을 정하지 않습니다.', { on: d.format === 'daily', act: 'dformat', val: 'daily' }) +
    '</div>' + (d.format === 'fiftyfour' ? kind : '') +
    '<div style="display:flex;gap:10px;margin-top:18px">' +
    '<button class="btn2 ' + (d.mode === 'solo' ? 'on' : 'off') + '" data-act="dmode" data-v="solo"><span class="t1">혼자</span><span class="t2">나 혼자 다섯 단</span></button>' +
    '<button class="btn2 ' + (d.mode === 'group' ? 'on' : 'off') + '" data-act="dmode" data-v="group"><span class="t1">함께 바치기</span><span class="t2">다섯이 한 단씩</span></button></div>' +
    '<div class="sm" style="margin-top:10px">다섯이 한 단씩 나눕니다. 초대 코드로 모입니다.</div></div>' +

    '<div class="zone"><div class="lab2">③ 낭송</div><div style="margin-top:12px">' +
    opt('교대로', '앞은 소리가 읽고 뒤는 내가 받습니다', { on: d.recite === 'alternate', right: '기본', act: 'drecite', val: 'alternate' }) +
    opt('전부 소리로', '처음부터 끝까지 읽어 줍니다', { on: d.recite === 'full', act: 'drecite', val: 'full' }) +
    opt('소리 없이', '진동으로만 넘어갑니다', { on: d.recite === 'silent', act: 'drecite', val: 'silent' }) +
    '</div></div>' +

    '<div class="zone"><div class="lab2">④ 묵주와 기도문</div><div style="margin-top:12px">' +
    (S.prefs.rosaryRow ? opt('묵주', rosaryName(d.rosary), { right: '고르기', act: 'sheet', val: 'rosary-draft' }) : '') +
    opt('기도문 판본', versionName(d.version), { right: '고르기', act: 'sheet', val: 'version-draft' }) +
    '</div><div class="sm" style="margin-top:10px">이 여정에만 적용됩니다. 설정의 값은 다음 기도의 기본값으로 남습니다.</div></div>' +

    '<div class="zone"><div class="lab2">⑤ 언제부터</div><div style="margin-top:12px">' +
    opt('시작일', (d.startDate === today() ? '오늘 · ' : '') + kdate(d.startDate), { right: '고르기', act: 'sheet', val: 'date' }) +
    '</div><div class="sm" style="margin-top:10px">지난 날을 고르면 그 날들은 비어 있는 채로 시작합니다.</div></div>' +
    '</div>' +

    '<div style="flex:none;border-top:1px solid var(--rule);padding:16px 24px 0">' +
    (end ? '<div class="bd">' + kdate(end) + '에 마칩니다.</div>' : '<div class="bd">끝나는 날을 정하지 않습니다.</div>') +
    '<div class="sm" style="margin-top:6px">첫날은 ' + mysteryName(mk) + '입니다</div>' +
    '<button class="btn ' + (ok ? 'p' : 'dis') + '" data-act="create" style="margin-top:14px">시작하기</button></div>' +
    '</div>';
};
function rosaryName(k) { return { wood: '나무', pearl: '진주', glass: '유리' }[k] || '나무'; }
function versionName(k) { return { catholic: '가톨릭 기도서', old: '옛 기도서' }[k] || '가톨릭 기도서'; }

/* I 초대 코드 */
var codeState = { code: '', err: '' };
SCREENS.invite = function () {
  var c = codeState.code, cells = '', i;
  for (i = 0; i < 6; i++) {
    var ch = c[i] || '';
    cells += '<i class="' + (ch ? 'has' : (i === c.length ? 'cur' : '')) + '">' + esc(ch) + '</i>';
  }
  var found = c.length === 6 ? lookupCode(c) : null;
  var preview = '';
  if (found && !codeState.err) {
    preview = '<div style="margin-top:32px;padding:22px 20px;border:1px solid var(--rule)">' +
      '<div class="lab2">들어갈 여정</div>' +
      '<div class="ser t-mid" style="margin-top:12px">' + esc(found.intent) + '</div>' +
      '<div class="bd" style="margin-top:10px">' + dayLine(found, Math.max(1, dayIndex(found))) + ' · 다섯 사람 중 ' + countWord(found.group.members.length) + '이 들어와 있습니다<br>' +
      '<span class="sm">' + found.group.members.map(function (m) { return m.me ? '나' : esc(m.name); }).join(' · ') + '</span></div></div>';
  }
  return '<div class="scr">' + hd('초대 코드', '닫기', 'home') +
    '<div class="ser t-big" style="margin-top:34px">받은 여섯 자리를<br>넣어 주세요</div>' +
    '<div class="cells' + (codeState.err ? ' err' : '') + '">' + cells +
    '<input id="codeInput" maxlength="6" autocomplete="off" autocapitalize="characters" value="' + esc(c) + '"></div>' +
    '<div class="sm" style="margin-top:14px">' + (codeState.err ? '<span class="acc">' + codeState.err + '</span>' : '대소문자를 가리지 않습니다. 붙여넣어도 됩니다.') + '</div>' +
    preview + '<div class="gr"></div>' +
    '<button class="btn ' + (found && !codeState.err ? 'p' : 'dis') + '" data-act="join">들어가기</button></div>';
};
function lookupCode(c) {
  var up = c.toUpperCase(), i;
  for (i = 0; i < S.journeys.length; i++) {
    var j = S.journeys[i];
    if (j.group && j.group.code === up) return j;
  }
  if (up === DEMO_CODE) return demoGroup();
  return null;
}
function demoGroup() {
  return {
    id: 'demo', intent: '아버지 세례를 위해', format: 'fiftyfour', mode: 'group',
    recite: S.settings.recite, rosary: S.settings.rosary, version: S.settings.version,
    startDate: addDays(today(), -5), days: {}, today: null,
    group: { code: DEMO_CODE, owner: false, members: VIRTUAL_DEMO.map(function (n) { return { name: n }; }) }
  };
}

/* G 함께 바치기 배정 */
SCREENS.assign = function () {
  var j = findJ(view.p.id); if (!j) return SCREENS.home();
  var di = dayIndex(j), a = assignment(j, di), mine = myDecade(j, di), k = groupK(j, di);
  var rec = j.days[today()], done = rec && rec.done;
  var rows = a.map(function (r) {
    var st = !r.name ? '빈자리' : r.me ? (done ? '바쳤습니다' : '아직') : (otherDone(j, di, r.name) ? '바쳤습니다' : '아직');
    return '<div class="arow' + (r.me ? ' mine' : '') + '"><div class="dn">제' + r.decade + '단</div>' +
      '<div class="nm">' + (r.me ? '나' : r.name ? esc(r.name) : '아직 아무도') + '</div><div class="sm">' + st + '</div></div>';
  }).join('');
  return '<div class="scr edge"><div class="px">' + hd('함께 바치기', '돌아가기', 'home') + '</div>' +
    '<div class="sc"><div class="px" style="padding-top:26px">' +
    '<div class="ser t-big">오늘 내 몫은<br>제' + mine + '단입니다</div>' +
    '<div class="sm" style="margin-top:14px">' + esc(j.intent) + ' · ' + di + '일째<br>다섯 사람이 한 단씩 나누어 하루를 채웁니다.</div></div>' +
    '<div style="margin-top:22px;border-top:1px solid var(--rule)">' + rows + '</div>' +
    '<div class="px sm" style="padding-top:16px">오늘 다섯 중 ' + k + ' · 남은 단은 자정까지 기다립니다</div></div>' +
    '<div class="px" style="flex:none;padding-top:14px">' +
    '<button class="btn ' + (done ? 'dis' : 'p') + '" data-act="prayMine" data-id="' + j.id + '">' + (done ? '오늘 바쳤습니다' : '내 몫 바치기') + '</button>' +
    '<button class="btn t" data-act="sheet" data-v="alone" data-id="' + j.id + '">다섯 단 모두 혼자 바치기</button></div></div>';
};

/* B 기도 — 뼈대만 그리고 속은 엔진이 갱신한다 */
SCREENS.pray = function () {
  return '<div class="scr edge">' +
    '<div class="px" id="prayHead"></div>' +
    '<div id="prayPlate"></div>' +
    '<div id="prayRosary" style="flex:1;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center"></div>' +
    '<div class="prayarea" id="prayText"></div>' +
    '<div class="px" id="prayFoot" style="display:flex;gap:12px;margin-top:16px"></div></div>';
};

/* C 하루 완주 */
SCREENS.done = function () {
  var p = view.p, j = findJ(p.id); if (!j) return SCREENS.home();
  var di = p.di, rec = j.days[dateOfIndex(j, di)] || {};
  var last = totalDays(j) && di >= totalDays(j);
  return '<div class="scr">' +
    '<div class="lab" style="padding-bottom:16px;border-bottom:1px solid var(--rule)">' + kdate(dateOfIndex(j, di)) + ' · ' + di + '일째</div>' +
    '<div class="ser t-huge" style="margin:44px 0 18px">다 바쳤습니다</div>' +
    '<div class="bd">' + esc(j.intent) + '을 위하여 · ' + di + '일째<br>' + mysteryName(rec.mystery || mysteryKey(j, di)) + ' ' + (p.scope === 'decade' ? '제' + p.decade + '단' : '다섯 단') + '</div>' +
    (j.mode === 'group' ? '<div class="sm" style="margin-top:14px">오늘 다섯 중 ' + (rec.k != null ? rec.k : 0) + '이 바쳐졌습니다</div>' : '') +
    '<div style="margin-top:30px">' + ribbon(j, { h: 26 }) + '</div>' +
    '<div class="sm" style="margin-top:10px">' + doneCount(j) + '일 바쳤습니다' + (totalDays(j) ? ' · 남은 ' + Math.max(0, totalDays(j) - di) + '일' : '') + '</div>' +
    '<div class="gr"></div>' +
    stat('성모송', (rec.hails || 0) + '번') +
    stat('걸린 시간', Math.max(1, Math.round((rec.ms || 0) / 60000)) + '분') +
    stat('이어서', (rec.resumes || 0) + '번') +
    '<button class="btn p" data-act="' + (last ? 'finishJourney' : 'home') + '" data-id="' + j.id + '" style="margin-top:26px">돌아가기</button></div>';
};
function doneCount(j) { var n = 0, d; for (d in j.days) if (j.days[d].done) n++; return n; }

/* C′ 여정 완주 */
SCREENS.donejourney = function () {
  var j = findJ(view.p.id); if (!j) return SCREENS.home();
  var t = totalDays(j) || dayIndex(j);
  return '<div class="scr edge">' + plateDiv(mysteryKey(j, t), 248, 'background-position:50% 18%') +
    '<div class="px" style="display:flex;flex-direction:column;flex:1;padding-top:30px">' +
    '<div class="lab">' + kdate(endDate(j) || today()) + ' · ' + t + '일째</div>' +
    '<div class="ser t-huge" style="margin-top:16px">' + (t === 54 ? '쉰네 날을' : t + '일을') + '<br>다 바쳤습니다</div>' +
    '<div class="bd" style="margin-top:16px">' + esc(j.intent) + '을 위하여</div>' +
    '<div style="margin-top:24px">' + ribbon(j, { h: 30 }) + '</div>' +
    '<div class="gr"></div>' +
    stat('첫날', kdate(j.startDate)) + stat('마지막 날', kdate(endDate(j) || today())) +
    stat('바친 날', t + '일 중 ' + doneCount(j) + '일') +
    '<button class="btn p" data-act="home" style="margin-top:22px">돌아가기</button></div></div>';
};

/* D 여정 상세 */
SCREENS.detail = function () {
  var j = findJ(view.p.id); if (!j) return SCREENS.home();
  var di = dayIndex(j), t = totalDays(j), hasToday = !!(j.today && j.today.date === today());
  var grp = j.mode === 'group';
  return '<div class="scr edge"><div class="px">' + hd(grp ? '함께 바치는 여정' : '여정', '돌아가기', 'home') + '</div>' +
    '<div class="sc px">' +
    '<div style="padding:22px 0 18px;border-bottom:1px solid var(--rule)">' +
    '<div class="ser t-big">' + esc(j.intent) + '</div>' +
    '<div class="sm" style="margin-top:12px">' + formatName(j.format) + ' · ' + kdate(j.startDate) + (endDate(j) ? ' ~ ' + kdate(endDate(j)) : '') + '<br>' + versionName(j.version) + ' · ' + rosaryName(j.rosary) + ' 묵주</div></div>' +
    '<div style="padding:18px 0"><div style="display:flex;align-items:baseline;gap:10px">' +
    '<span class="mono-n">' + Math.max(0, di) + '</span><span class="bd">일째' + (kindOf(j, di) ? ' · ' + kindOf(j, di) : '') + (t ? ' · 남은 ' + Math.max(0, t - di) + '일' : '') + '</span></div>' +
    '<div style="margin-top:16px">' + grid54(j) + '</div>' +
    '<div class="sm" style="margin-top:12px">채운 칸은 바친 날, 빈 칸은 바치지 않은 날입니다. 테두리 칸이 오늘입니다.<br>칸을 누르면 그날의 기록이 열립니다.</div></div>' +
    (grp ? '<div style="padding:4px 0 4px;border-top:1px solid var(--rule)"><div class="lab2" style="padding-top:18px">조</div><div style="margin-top:12px">' +
      opt('초대 코드 ' + j.group.code, '아는 사람만 들어옵니다', { right: '나누기', act: 'sheet', val: 'code', id: j.id }) +
      opt('조원 ' + j.group.members.length + ' / 5', j.group.members.map(function (m) { return m.me ? '나' : esc(m.name); }).join(' · '), { info: true }) +
      opt('오늘 배정', '내 몫 제' + myDecade(j, di) + '단 · 오늘 다섯 중 ' + groupK(j, di), { right: '보기', act: 'assign', val: j.id }) +
      '</div><div class="sm" style="margin-top:10px">누가 아직 바치지 않았는지는 적지 않습니다.</div></div>' : '') +
    '<div style="padding:18px 0 10px;border-top:1px solid var(--rule)">' +
    stat('바친 날', doneCount(j) + '일') +
    stat('바치지 않은 날', Math.max(0, Math.min(di, t || di) - doneCount(j)) + '일') +
    stat('성모송', hailTotal(j).toLocaleString('ko-KR') + '번') +
    (j.format === 'fiftyfour' ? stat('감사로 바뀌는 날', '28일째 · ' + kdate(addDays(j.startDate, 27))) : '') +
    (endDate(j) ? stat('마치는 날', kdate(endDate(j))) : '') +
    '</div></div>' +
    '<div class="px" style="flex:none;border-top:1px solid var(--rule);padding-top:14px">' +
    (hasToday ? '<button class="btn o" data-act="sheet" data-v="restart" data-id="' + j.id + '">오늘 처음부터</button>' : '') +
    '<button class="btn t" data-act="sheet" data-v="' + (grp ? (j.group.owner ? 'disband' : 'leave') : 'delete') + '" data-id="' + j.id + '">' +
    (grp ? (j.group.owner ? '조 해산' : '조에서 나가기') : '이 여정 지우기') + '</button></div></div>';
};
function formatName(f) { return { fiftyfour: '54일 기도', novena9: '9일 기도', daily: '날마다' }[f]; }
function hailTotal(j) { var n = 0, d; for (d in j.days) n += (j.days[d].hails || 0); return n; }

/* E 설정 */
SCREENS.settings = function () {
  var s = S.settings;
  var hasMotion = typeof window.DeviceMotionEvent !== 'undefined';
  return '<div class="scr edge"><div class="px">' + hd('설정', '돌아가기', 'home') + '</div>' +
    '<div class="sc px">' +
    '<div class="zone"><div class="lab2">바치는 방식</div><div style="margin-top:12px">' +
    opt('전부 읽기', '앱이 처음부터 끝까지 읽습니다', { on: s.recite === 'full', act: 'srecite', val: 'full' }) +
    opt('교대', '앞 절은 앱이, 뒷 절은 직접 바칩니다', { on: s.recite === 'alternate', right: '기본', act: 'srecite', val: 'alternate' }) +
    opt('읽지 않기', '소리 없이 진동으로만 넘어갑니다', { on: s.recite === 'silent', act: 'srecite', val: 'silent' }) +
    '</div><div style="margin-top:12px">' +
    opt('받는 사이', { slow: '느리게', normal: '보통', fast: '빠르게' }[s.pace], { right: '고르기', act: 'sheet', val: 'pace' }) +
    (hasMotion ? opt('손 없이 조작', '폰을 흔들면 다음 알로, 이어폰 버튼으로 앞뒤로', { right: s.handsFree ? '켜짐' : '꺼짐', act: 'shands' }) : '') +
    '</div>' + (hasMotion ? '<div class="sm" style="margin-top:10px">켜면 흔들기와 이어폰 버튼을 씁니다. 음량 버튼은 V1에서 쓰지 않습니다.</div>' : '') + '</div>' +
    '<div class="zone"><div class="lab2">보이는 것</div><div style="margin-top:12px">' +
    opt('묵주', rosaryName(s.rosary), { right: '고르기', act: 'sheet', val: 'rosary' }) +
    opt('기본 기도문 판본', versionName(s.version), { right: '고르기', act: 'sheet', val: 'version' }) +
    '</div><div class="sm" style="margin-top:10px">새로 만드는 기도에 적용됩니다.</div>' +
    '<div style="display:flex;margin-top:14px">' +
    ['system|기기 따름', 'night|밤', 'day|낮'].map(function (t, i) {
      var v = t.split('|')[0];
      return '<button class="btn2 ' + (s.theme === v ? 'on' : 'off') + '" data-act="stheme" data-v="' + v + '" style="' + (i ? 'margin-left:-1px' : '') + (s.theme === v ? ';position:relative;z-index:1' : '') + '"><span class="t1">' + t.split('|')[1] + '</span></button>';
    }).join('') + '</div></div>' +
    '<div class="zone"><div class="lab2">계정</div><div style="margin-top:12px">' +
    opt(esc(S.account ? S.account.name : ''), (S.account ? S.account.provider : '') + ' 계정 · 연결됨', { info: true }) +
    opt('로그아웃', '이 기기에서 나갑니다', { act: 'sheet', val: 'signout' }) +
    opt('계정 삭제', '서버의 모든 기도와 기록이 지워집니다', { act: 'sheet', val: 'deleteAccount' }) +
    opt('소개', '이 시제품이 무엇을 검증하는지', { right: '보기', act: 'about' }) +
    '</div></div></div></div>';
};

function render() {
  var f = SCREENS[view.name] || SCREENS.home;
  screensEl.innerHTML = '<div class="screen on">' + f() + '</div>';
  if (view.name === 'pray') Engine.paint();
  if (view.name === 'newjourney') wireIntent();
  if (view.name === 'invite') wireCode();
  applyTheme();
}

/* ── 7. 시트 ─────────────────────────────────────────────────── */
var sheetHost = document.getElementById('sheetHost');
function openSheet(inner) { sheetHost.innerHTML = '<div class="sheetwrap" data-act="closeSheetBg"><div class="sheet">' + inner + '</div></div>'; }
function closeSheet() { sheetHost.innerHTML = ''; }
function shHead(label) { return '<div class="hd" style="padding-bottom:14px;margin-bottom:6px"><div class="lab">' + label + '</div><button class="tap" data-act="closeSheet" style="width:auto;padding:12px 0 12px 24px">닫기</button></div>'; }
function confirm2(title, body, yes, no, act, id) {
  return '<div class="ser t-mid">' + title + '</div><div class="sm" style="margin-top:12px">' + body + '</div>' +
    '<div style="display:flex;gap:12px;margin-top:22px">' +
    '<button class="btn o" style="flex:1" data-act="' + act + '"' + (id ? ' data-id="' + id + '"' : '') + '>' + yes + '</button>' +
    '<button class="btn p" style="flex:1" data-act="closeSheet">' + no + '</button></div>';
}
var SHEETS = {
  pace: function () {
    return shHead('받는 사이') +
      opt('느리게', '천천히 바침', { on: S.settings.pace === 'slow', act: 'space', val: 'slow' }) +
      opt('보통', '기본', { on: S.settings.pace === 'normal', right: '선택', act: 'space', val: 'normal' }) +
      opt('빠르게', '익숙한 분', { on: S.settings.pace === 'fast', act: 'space', val: 'fast' });
  },
  rosary: function () { return rosarySheet('srosary', S.settings.rosary); },
  'rosary-draft': function () { return rosarySheet('drosary', draft ? draft.rosary : 'wood'); },
  version: function () { return versionSheet('sversion', S.settings.version); },
  'version-draft': function () { return versionSheet('dversion', draft ? draft.version : 'catholic'); },
  date: function () {
    return shHead('시작일') +
      opt('오늘', kdate(today()), { on: draft && draft.startDate === today(), act: 'ddate', val: today() }) +
      '<div class="sm" style="margin:14px 0 8px">다른 날</div>' +
      '<input type="date" id="dateInput" value="' + (draft ? draft.startDate : today()) + '">' +
      '<button class="btn p" style="margin-top:14px" data-act="ddateInput">이 날로</button>';
  },
  restart: function (id) {
    return shHead('오늘 처음부터') + confirm2('오늘 자리를 지우고<br>처음부터 바칩니다.',
      '지금까지 바친 오늘의 자리가 사라집니다. 지난 날의 기록은 그대로 있습니다.', '처음부터', '아니요, 이어서', 'doRestart', id);
  },
  'delete': function (id) {
    return shHead('여정 지우기') + confirm2('이 기도를 지웁니다.<br>기록도 함께 지워집니다.', '되돌릴 수 없습니다.', '지우기', '두기', 'doDelete', id);
  },
  disband: function (id) {
    return shHead('조 해산') + confirm2('조를 해산합니다.', '조원 모두의 카드에서 이 기도가 사라집니다.', '해산', '두기', 'doDelete', id);
  },
  leave: function (id) {
    return shHead('조에서 나가기') + confirm2('조에서 나옵니다.', '남은 조원에게 단이 다시 배정됩니다.', '나가기', '두기', 'doDelete', id);
  },
  alone: function (id) {
    return shHead('다섯 단 모두 혼자 바치기') + confirm2('오늘 다섯 단을<br>혼자 바칩니다.',
      '오늘 하루가 다 채워집니다. 다른 조원이 오늘 자기 단을 바쳐도 그 기록은 개인 기록으로 남습니다. 내일 배정은 그대로입니다.',
      '혼자 바치기', '두기', 'doAlone', id);
  },
  signout: function () {
    return shHead('로그아웃') + confirm2('이 기기에서 나갑니다.', '기도와 기록은 계정에 남습니다.', '나가기', '두기', 'doSignout');
  },
  deleteAccount: function () {
    return shHead('계정 삭제') + confirm2('계정을 지웁니다.', '서버의 모든 기도와 기록이 지워집니다. 조에 있었으면 조에서 빠집니다.', '지우기', '두기', 'doDeleteAccount');
  },
  code: function (id) {
    var j = findJ(id);
    return shHead('초대 코드') + '<div class="ser t-huge" style="letter-spacing:.12em">' + (j ? j.group.code : '') + '</div>' +
      '<div class="sm" style="margin-top:12px">이 여섯 자리를 받은 사람이 홈의 “초대 코드로 들어가기”에 넣으면 이 기도에 들어옵니다.</div>' +
      '<button class="btn o" style="margin-top:20px" data-act="closeSheet">닫기</button>';
  },
  about: function () {
    return shHead('소개') + '<div class="ser t-mid">이 시제품이 무엇을<br>검증하는지</div>' +
      '<div class="bd" style="margin-top:14px">교대로 바치는 낭송이 실제로 편한지, 끊긴 자리에서 이어 바치는 것이 도움이 되는지를 봅니다.</div>' +
      '<div class="sm" style="margin-top:14px">아직 아닌 것 — 기도문 공식 판본, 배경 성화의 최종 이미지, 알림. 셋은 검증 뒤에 채웁니다.</div>' +
      '<button class="btn o" style="margin-top:22px" data-act="closeSheet">닫기</button>';
  }
};
function rosarySheet(act, cur) {
  return shHead('묵주 고르기') + '<div style="display:flex;gap:10px">' +
    [['wood', '나무'], ['pearl', '진주'], ['glass', '유리']].map(function (m) {
      return '<button data-act="' + act + '" data-v="' + m[0] + '" style="flex:1;min-height:88px;padding:14px 0;display:flex;flex-direction:column;align-items:center;gap:10px;border:1px solid ' + (cur === m[0] ? 'var(--accent-line)' : 'var(--rule)') + ';' + (cur === m[0] ? 'background:var(--accent-bg);' : '') + '">' +
        '<svg width="40" height="40" viewBox="0 0 40 40">' + beadShape(20, 20, 'past', m[0], '', 15) + '</svg>' +
        '<span style="font-weight:500;font-size:13px;color:var(--ink)">' + m[1] + '</span></button>';
    }).join('') + '</div>' +
    '<div class="sm" style="margin-top:14px">어느 묵주를 골라도 알의 다섯 상태를 그대로 보여 줍니다.</div>';
}
function versionSheet(act, cur) {
  return shHead('기도문 판본') +
    [['catholic', '가톨릭 기도서', PRAYERS.hail.a], ['old', '옛 기도서', '은총을 가득히 입으신 마리아여, 기뻐하소서.']].map(function (v, i) {
      return '<button data-act="' + act + '" data-v="' + v[0] + '" style="min-height:88px;padding:16px;border:1px solid ' + (cur === v[0] ? 'var(--accent-line)' : 'var(--rule)') + ';' + (i ? 'border-top:none;' : '') + (cur === v[0] ? 'background:var(--accent-bg);' : '') + '">' +
        '<span style="display:flex;justify-content:space-between"><span style="font-weight:500;font-size:14px;color:var(--ink)">' + v[1] + '</span>' + (cur === v[0] ? '<span class="sm acc">선택</span>' : '') + '</span>' +
        '<span class="ser" style="display:block;font-size:15px;line-height:1.6;margin-top:8px;color:var(--muted)">' + esc(v[2]) + '</span></button>';
    }).join('') +
    '<div class="sm" style="margin-top:12px">진행 중인 여정의 문구는 바뀌지 않습니다.<br>판본 목록과 사용 권한은 아직 확정되지 않았습니다(D-4).</div>';
}

/* ── 8. 기도 엔진 ────────────────────────────────────────────── */
function stepsOf(j, scope, decade) {
  if (scope === 'decade') return SEQ.filter(function (s) { return s.section === 'decade' && s.decade === decade; });
  return SEQ;
}
function textOf(step, mk) {
  var p = PRAYERS[step.prayer], a = p.a, b = p.b || '';
  if (step.prayer === 'decl') a = a.replace('{mystery}', decadeTitle(mk, step.decade));
  return { name: p.name, a: a, b: b };
}
/* 받는 사이 — 06-screen-spec 비화면 채널: (900ms + 글자수 L × 132ms) ÷ 속도계수 */
function gapMs(L, pace) { return scale((900 + L * 132) / (PACE[pace] || 1)); }
/* 앱이 읽는 데 걸릴 시간의 어림값. 소리가 실제로 끝났다는 신호가 오면 그 신호가 이기고,
   신호가 오지 않는 기기에서는 이 값이 안전망이 된다. */
function readMs(text) { return scale(Math.max(900, text.length * 132)); }

var Engine = {
  s: null, timer: null, phase: 'idle', runFrom: 0, wake: null,
  /* 기기에 한국어 음성이 없으면 PRD §8 대로 '소리 없이'로 내려간다. */
  effRecite: function () {
    var r = this.s.recite;
    if (r !== 'silent' && !TTS.ok) return 'silent';
    return r;
  },
  start: function (j, o) {
    var d = today(), resume = o.resume && j.today && j.today.date === d;
    if (resume) {
      this.s = {
        jid: j.id, scope: j.today.scope, decade: j.today.decade, mystery: j.today.mystery,
        idx: j.today.idx, hails: j.today.hails || 0, ms: j.today.ms || 0,
        resumes: (j.today.resumes || 0) + 1, recite: j.today.recite || j.recite, pace: S.settings.pace
      };
    } else {
      var di = Math.max(1, dayIndex(j, d));
      this.s = {
        jid: j.id, scope: o.scope || 'all', decade: o.decade || 1, mystery: mysteryKey(j, di, d),
        idx: 0, hails: 0, ms: 0, resumes: 0, recite: j.recite, pace: S.settings.pace
      };
    }
    this.steps = stepsOf(j, this.s.scope, this.s.decade);
    this.state = 'reading'; this.paused = false; this.runFrom = Date.now();
    this.lockWake();
    go('pray');
    this.enter();
  },
  persist: function () {
    var j = findJ(this.s.jid); if (!j) return;
    j.today = {
      date: today(), scope: this.s.scope, decade: this.s.decade, mystery: this.s.mystery,
      idx: this.s.idx, hails: this.s.hails, ms: this.elapsed(), resumes: this.s.resumes,
      recite: this.s.recite, savedAt: Date.now()
    };
    save();
  },
  elapsed: function () { return this.s.ms + (this.paused ? 0 : Date.now() - this.runFrom); },
  enter: function () {
    var step = this.steps[this.s.idx];
    if (!step) return this.finish();
    var j = findJ(this.s.jid), t = textOf(step, this.s.mystery), mode = this.effRecite();
    this.persist();
    /* 신비 선포 — 단이 바뀐다. 진동 다섯 마디, 사이는 고정 2200ms. */
    if (step.prayer === 'decl') {
      this.state = 'shift'; buzz(VIB.decade);
      if (mode !== 'silent') TTS.speak(t.a);
      this.paint();
      return this.wait(scale(2200));
    }
    /* 소리 없이 — 알이 넘어갈 때 한 번 진동하고, 앞 절 + 뒷 절 길이만큼 사이를 둔다. */
    if (mode === 'silent') {
      this.state = 'buzz'; buzz(VIB.bead);
      this.paint();
      var self = this;
      setTimeout(function () {
        if (self.state === 'buzz' && !self.paused) { self.state = 'turn'; self.paint(); }
      }, scale(500, 4));
      return this.wait(gapMs((t.a + t.b).length, this.s.pace));
    }
    /* 전부 소리로 — 앞뒤를 다 읽고, 짧은 숨 하나(L = 0)만 둔다. */
    if (mode === 'full') {
      this.state = 'reading';
      this.paint();
      return this.read(t.b ? t.a + ' ' + t.b : t.a, gapMs(0, this.s.pace));
    }
    /* 교대 — 앞 절만 읽고, 뒷 절 글자수만큼 받는 사이를 둔다. */
    this.state = 'reading';
    this.paint();
    return this.read(t.a, gapMs(t.b.length, this.s.pace));
  },
  /* 읽지 않는 단계 — 정해진 시간이 지나면 다음 알로 */
  wait: function (ms) {
    var self = this;
    clearTimeout(this.timer);
    this.timer = setTimeout(function () { self.next(); }, ms);
  },
  /* 읽는 단계 — 소리가 끝나면(또는 안전망 시간이 지나면) '내 차례'로 넘어가고,
     받는 사이가 끝나면 다음 알로 간다. */
  read: function (text, turnMs) {
    var self = this, moved = false;
    clearTimeout(this.timer);
    var toTurn = function () {
      if (moved || self.paused) return;
      moved = true;
      clearTimeout(self.timer);
      self.state = 'turn'; self.paint();
      self.timer = setTimeout(function () { self.next(); }, turnMs);
    };
    TTS.speak(text, toTurn);
    this.timer = setTimeout(toTurn, FAST ? readMs(text) : readMs(text) * 1.5 + 2000);
  },
  next: function () {
    if (this.paused) return;
    var step = this.steps[this.s.idx];
    if (step && step.prayer === 'hail') this.s.hails++;
    if (step && step.prayer !== 'decl' && this.effRecite() === 'silent') buzz(VIB.bead);
    this.s.idx++;
    if (this.s.idx >= this.steps.length) return this.finish();
    this.enter();
  },
  prev: function () {
    clearTimeout(this.timer);
    if (this.s.idx > 0) {
      this.s.idx--;
      var step = this.steps[this.s.idx];
      if (step && step.prayer === 'hail') this.s.hails = Math.max(0, this.s.hails - 1);
    }
    this.enter();
  },
  skip: function () { clearTimeout(this.timer); TTS.stop(); this.next(); },
  pause: function () {
    if (this.paused) return;
    this.paused = true; clearTimeout(this.timer); TTS.stop();
    this.s.ms = this.elapsed(); this.state = 'pause';
    this.persist(); this.paint();
  },
  resume: function () {
    this.paused = false; this.runFrom = Date.now(); this.s.resumes++;
    this.enter();
  },
  leave: function () { this.pause(); this.releaseWake(); go('home'); },
  quit: function () {
    clearTimeout(this.timer); TTS.stop(); this.releaseWake();
    var j = findJ(this.s.jid); if (j) { j.today = null; save(); }
    this.s = null; go('home');
  },
  finish: function () {
    clearTimeout(this.timer); TTS.stop(); buzz(VIB.finish); this.releaseWake();
    var j = findJ(this.s.jid), d = today(), di = Math.max(1, dayIndex(j, d));
    var k = null;
    if (j.mode === 'group') k = this.s.scope === 'all' ? 5 : Math.min(5, groupK(j, di) + 1);
    j.days[d] = {
      done: true, mystery: this.s.mystery, hails: this.s.hails,
      ms: this.elapsed(), resumes: this.s.resumes,
      scope: this.s.scope, decade: this.s.decade, k: k
    };
    j.today = null; save();
    var scope = this.s.scope, dec = this.s.decade; this.s = null;
    go('done', { id: j.id, di: di, scope: scope, decade: dec });
  },
  lockWake: function () {
    var self = this;
    if (!navigator.wakeLock) return;
    try { navigator.wakeLock.request('screen').then(function (w) { self.wake = w; }, function () { }); } catch (e) { }
  },
  releaseWake: function () { try { if (this.wake) { this.wake.release(); this.wake = null; } } catch (e) { } },

  paint: function () {
    if (view.name !== 'pray' || !this.s) return;
    var j = findJ(this.s.jid); if (!j) return;
    var step = this.steps[this.s.idx] || this.steps[this.steps.length - 1];
    var t = textOf(step, this.s.mystery), di = Math.max(1, dayIndex(j));
    var grp = j.mode === 'group' && this.s.scope === 'decade';
    var dec = step.section === 'decade' ? step.decade : 0;
    var big = +(deviceEl.getAttribute('data-fs') || 1) >= 1.5;

    document.getElementById('prayHead').innerHTML =
      '<div class="hd" style="padding-bottom:12px">' +
      '<div style="font-size:calc(12.5px * var(--fs));line-height:1.4;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:62%">' + esc(j.intent) + ' <span class="sm">· ' + di + '일째</span></div>' +
      '<div class="lab season" style="letter-spacing:.16em">' + step.label + '</div></div>' +
      bar5(dec || 1, grp) + '<div style="height:14px"></div>';

    var pl = document.getElementById('prayPlate');
    pl.innerHTML = big ? '' : plateDiv(this.s.mystery, 132, 'background-position:50% 22%');

    var focus = step.prayer === 'hail' ? 'loop' : (step.prayer === 'glory' || step.prayer === 'save') ? 'loop' : 'big';
    var n = step.bead || (step.prayer === 'glory' || step.prayer === 'save' ? (step.section === 'opening' ? 3 : 10) : 0);
    var self = this;
    var drawRosary = function () {
    var box = document.getElementById('prayRosary');
    var boxH = Math.max(96, box.clientHeight || 243);
    box.innerHTML = rosaryHTML({
      n: n, focus: focus, state: self.state, mat: j.rosary, tail: !big, w: 340,
      label: step.prayer === 'hail' ? { top: String(step.bead), bottom: '/ ' + step.of } : { top: '·', bottom: '' },
      passed: dec ? (dec - 1) * 10 + (step.bead || 0) : (step.bead || 0)
    }, boxH);
    if (self.state === 'reading') {
      var ring = document.getElementById('readRing');
      if (ring) {
        var dur = self.effRecite() === 'full' ? readMs(t.a + t.b) : readMs(t.a);
        ring.style.transition = 'stroke-dashoffset ' + dur + 'ms linear';
        requestAnimationFrame(function () { ring.style.strokeDashoffset = '0'; });
      }
    }
    };

    var mine = this.state === 'turn' || this.state === 'buzz';
    var body;
    if (step.prayer === 'decl') {
      body = '<div class="pray-lead">' + esc(mysteryName(this.s.mystery)) + ' 제' + step.decade + '단</div>' +
        '<div class="sub" style="margin-top:12px">' + esc(decadeTitle(this.s.mystery, step.decade)) + '</div>';
    } else if (!t.b) {
      body = '<div class="pray-lead' + (mine ? ' acc' : '') + '">' + esc(t.a) + '</div>';
    } else if (mine && this.effRecite() !== 'full') {
      body = '<div class="pray-fold">' + esc(t.a) + '</div><div class="pray-mine" style="margin-top:12px">' + esc(t.b) + '</div>';
    } else {
      body = '<div class="pray-lead">' + esc(t.a) + '</div><div class="pray-fold" style="margin-top:12px">' + esc(t.b) + '</div>';
    }
    var pt = document.getElementById('prayText');
    pt.className = 'prayarea' + (this.state === 'pause' ? ' paused' : '');
    pt.innerHTML = body;
    /* 기도문이 고정 높이를 넘치면 글자만 단계적으로 줄여 끝까지 보이게 한다.
       상자의 높이는 건드리지 않으므로 FR-24(기도문 영역 높이 고정)는 그대로다.
       (긴 기도문을 큰 글자에서 담으려면 본래 '구절 나눔' 데이터가 필요하다 — 시안 README 판단 요청 3.) */
    var pf = 1, guard = 0;
    pt.style.setProperty('--pf', '1');
    while (pt.scrollHeight > pt.clientHeight + 1 && pf > 0.5 && guard++ < 20) {
      pf -= 0.05;
      pt.style.setProperty('--pf', pf.toFixed(2));
    }

    document.getElementById('prayFoot').innerHTML = this.paused
      ? '<button class="btn2 on" data-act="presume"><span class="t1">이어서 바치기</span><span class="t2">' + step.label + '</span></button>' +
      '<button class="btn2 line" data-act="pleave"><span class="t1">홈으로</span><span class="t2">자리가 남습니다</span></button>'
      : '<button class="btn2 line" data-act="ppause"><span class="t1">잠시 멈춤</span><span class="t2">자리가 남습니다</span></button>' +
      '<button class="btn2 line" data-act="pquit"><span class="t1" style="color:var(--muted)">여기서 끝내기</span><span class="t2">오늘 처음부터</span></button>';

    drawRosary();
  }
};

/* ── 9. 손 없이 조작 ─────────────────────────────────────────── */
var shake = { last: 0, prev: null };
window.addEventListener('devicemotion', function (e) {
  if (!S.settings.handsFree || view.name !== 'pray' || !Engine.s || Engine.paused) return;
  var a = e.accelerationIncludingGravity; if (!a) return;
  var m = Math.sqrt((a.x || 0) * (a.x || 0) + (a.y || 0) * (a.y || 0) + (a.z || 0) * (a.z || 0));
  if (shake.prev != null && Math.abs(m - shake.prev) > 14 && Date.now() - shake.last > 1200) {
    shake.last = Date.now(); Engine.skip();
  }
  shake.prev = m;
});
if ('mediaSession' in navigator) {
  try {
    navigator.mediaSession.setActionHandler('nexttrack', function () { if (Engine.s && S.settings.handsFree) Engine.skip(); });
    navigator.mediaSession.setActionHandler('previoustrack', function () { if (Engine.s && S.settings.handsFree) Engine.prev(); });
    navigator.mediaSession.setActionHandler('pause', function () { if (Engine.s && S.settings.handsFree) Engine.pause(); });
    navigator.mediaSession.setActionHandler('play', function () { if (Engine.s && S.settings.handsFree && Engine.paused) Engine.resume(); });
  } catch (e) { }
}
document.addEventListener('visibilitychange', function () {
  if (document.hidden && view.name === 'pray' && Engine.s && !Engine.paused) Engine.pause();
});

/* ── 10. 조작 배선 ───────────────────────────────────────────── */
var ACT = {
  signin: function (el) {
    S.account = { name: '김건우', provider: el.getAttribute('data-v') };
    save(); go('home');
  },
  home: function () { go('home'); },
  back: function () { go('home'); },
  settings: function () { go('settings'); },
  about: function () { openSheet(SHEETS.about()); },
  'new': function () { draft = newDraft(); go('newjourney'); },
  invite: function () { codeState = { code: '', err: '' }; go('invite'); },
  detail: function (el) { go('detail', { id: el.getAttribute('data-id') }); },
  assign: function (el) { go('assign', { id: el.getAttribute('data-v') || el.getAttribute('data-id') }); },
  open: function (el) {
    var j = findJ(el.getAttribute('data-id')); if (!j) return;
    var di = dayIndex(j);
    if (di <= 0) return toast((1 - di) + '일 뒤에 시작합니다');
    if (totalDays(j) && di > totalDays(j)) return go('detail', { id: j.id });
    if (j.days[today()] && j.days[today()].done) return go('detail', { id: j.id });
    if (j.mode === 'group' && !(j.today && j.today.date === today())) return go('assign', { id: j.id });
    Engine.start(j, { resume: true, scope: 'all' });
  },
  prayMine: function (el) {
    var j = findJ(el.getAttribute('data-id')); if (!j) return;
    Engine.start(j, { resume: true, scope: 'decade', decade: myDecade(j, dayIndex(j)) });
  },
  doAlone: function (el) {
    var j = findJ(el.getAttribute('data-id')); if (!j) return;
    closeSheet(); Engine.start(j, { scope: 'all' });
  },
  create: function () {
    var d = draft; if (!d || !d.intent.trim()) return;
    var j = {
      id: 'j' + Date.now().toString(36), intent: d.intent.trim(), format: d.format, mode: d.mode,
      recite: d.recite, rosary: d.rosary, version: d.version, startDate: d.startDate,
      days: {}, today: null, createdAt: Date.now(),
      group: d.mode === 'group' ? {
        code: makeCode(), owner: true,
        members: [{ name: S.account ? S.account.name : '나', me: true }].concat(VIRTUAL.map(function (n) { return { name: n }; }))
      } : null
    };
    S.journeys.unshift(j); draft = null; save();
    if (dayIndex(j) <= 0) return go('home');
    if (j.mode === 'group') return go('assign', { id: j.id });
    Engine.start(j, { scope: 'all' });
  },
  dformat: function (el) { draft.format = el.getAttribute('data-v'); render(); },
  dmode: function (el) { draft.mode = el.getAttribute('data-v'); render(); },
  drecite: function (el) { draft.recite = el.getAttribute('data-v'); render(); },
  drosary: function (el) { draft.rosary = el.getAttribute('data-v'); closeSheet(); render(); },
  dversion: function (el) { draft.version = el.getAttribute('data-v'); closeSheet(); render(); },
  ddate: function (el) { draft.startDate = el.getAttribute('data-v'); closeSheet(); render(); },
  ddateInput: function () {
    var v = document.getElementById('dateInput');
    if (v && v.value) draft.startDate = v.value;
    closeSheet(); render();
  },
  srecite: function (el) { S.settings.recite = el.getAttribute('data-v'); if (S.settings.recite === 'silent') buzz(VIB.silentOn); save(); render(); },
  space: function (el) { S.settings.pace = el.getAttribute('data-v'); save(); closeSheet(); render(); },
  shands: function () { S.settings.handsFree = !S.settings.handsFree; askMotion(); save(); render(); },
  srosary: function (el) { S.settings.rosary = el.getAttribute('data-v'); save(); closeSheet(); render(); },
  sversion: function (el) { S.settings.version = el.getAttribute('data-v'); save(); closeSheet(); render(); },
  stheme: function (el) { S.settings.theme = el.getAttribute('data-v'); save(); render(); paintPanel(); },
  join: function () {
    var j = lookupCode(codeState.code);
    if (!j) return;
    if (j.id === 'demo') {
      j.id = 'j' + Date.now().toString(36);
      j.group.members = j.group.members.concat([{ name: S.account ? S.account.name : '나', me: true }]);
      S.journeys.unshift(j); save();
    }
    go('assign', { id: j.id });
  },
  sheet: function (el) {
    var k = el.getAttribute('data-v'), f = SHEETS[k];
    if (f) openSheet(f(el.getAttribute('data-id')));
  },
  closeSheet: function () { closeSheet(); },
  closeSheetBg: function (el, ev) { if (ev.target === el) closeSheet(); },
  doRestart: function (el) {
    var j = findJ(el.getAttribute('data-id')); if (!j) return;
    j.today = null; save(); closeSheet(); Engine.start(j, { scope: 'all' });
  },
  doDelete: function (el) {
    var id = el.getAttribute('data-id');
    S.journeys = S.journeys.filter(function (x) { return x.id !== id; });
    save(); closeSheet(); go('home');
  },
  doSignout: function () { S.account = null; save(); closeSheet(); go('login'); },
  doDeleteAccount: function () {
    var keepPrefs = S.prefs;
    S = blank(); S.prefs = keepPrefs; save(); closeSheet(); go('login');
  },
  ppause: function () { Engine.pause(); },
  presume: function () { Engine.resume(); },
  pleave: function () { Engine.leave(); },
  pquit: function () { Engine.quit(); },
  finishJourney: function (el) { go('donejourney', { id: el.getAttribute('data-id') }); },
  day: function (el) {
    var j = findJ(view.p.id); if (!j) return;
    var d = el.getAttribute('data-d'), rec = j.days[d];
    var di = diffDays(j.startDate, d) + 1;
    openSheet(shHead(kdate(d)) +
      '<div class="ser t-mid">' + di + '일째' + (kindOf(j, di) ? ' · ' + kindOf(j, di) : '') + '</div>' +
      (rec && rec.done
        ? '<div class="bd" style="margin-top:12px">' + mysteryName(rec.mystery) + '<br>성모송 ' + (rec.hails || 0) + '번 · ' + Math.max(1, Math.round((rec.ms || 0) / 60000)) + '분' +
        (rec.k != null ? '<br>다섯 중 ' + rec.k : '') + '</div>'
        : '<div class="bd" style="margin-top:12px">' + (d > today() ? '아직 오지 않은 날입니다.' : '바치지 않은 날입니다.') + '</div>') +
      '<button class="btn o" style="margin-top:20px" data-act="closeSheet">닫기</button>');
  }
};
function makeCode() {
  var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '', i;
  for (i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}
function askMotion() {
  try {
    if (S.settings.handsFree && window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().catch(function () { });
    }
  } catch (e) { }
}
function toast(msg) {
  openSheet('<div class="bd">' + esc(msg) + '</div><button class="btn o" style="margin-top:20px" data-act="closeSheet">닫기</button>');
}

deviceEl.addEventListener('click', function (ev) {
  var el = ev.target.closest ? ev.target.closest('[data-act]') : null;
  if (!el) return;
  var f = ACT[el.getAttribute('data-act')];
  if (f) { ev.preventDefault(); f(el, ev); }
});

/* 카드 길게 누르기 = 여정 삭제 확인 */
var lp = null;
deviceEl.addEventListener('pointerdown', function (ev) {
  var el = ev.target.closest ? ev.target.closest('[data-act="open"]') : null;
  if (!el) return;
  lp = setTimeout(function () {
    lp = null;
    var j = findJ(el.getAttribute('data-id')); if (!j) return;
    var k = j.mode === 'group' ? (j.group.owner ? 'disband' : 'leave') : 'delete';
    openSheet(SHEETS[k](j.id));
  }, 650);
});
['pointerup', 'pointercancel', 'pointermove'].forEach(function (t) {
  deviceEl.addEventListener(t, function () { if (lp) { clearTimeout(lp); lp = null; } });
});

function wireIntent() {
  var i = document.getElementById('intentInput'); if (!i) return;
  i.addEventListener('input', function () {
    draft.intent = i.value;
    var c = document.getElementById('intentCount');
    if (c) c.textContent = i.value.length + ' / 24';
    var btn = document.querySelector('[data-act="create"]');
    if (btn) btn.className = 'btn ' + (i.value.trim() ? 'p' : 'dis');
    var hint = document.getElementById('intentHint');
    if (hint) hint.style.display = i.value.trim() ? 'none' : 'block';
  });
}
function wireCode() {
  var i = document.getElementById('codeInput'); if (!i) return;
  i.focus();
  i.addEventListener('input', function () {
    var v = i.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    codeState.code = v;
    codeState.err = '';
    if (v.length === 6) {
      var j = lookupCode(v);
      if (!j) codeState.err = '이 코드의 기도를 찾지 못했습니다.';
      else if (j.group.members.length >= 5) codeState.err = '이 기도는 다섯 명이 다 모였습니다.';
    }
    render();
  });
}

/* ── 11. 테마·버전 패널 ─────────────────────────────────────── */
var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function applyTheme() {
  var t = S.settings.theme;
  if (t === 'system') t = (mq && mq.matches) ? 'night' : 'day';
  document.documentElement.setAttribute('data-theme', t);
  deviceEl.setAttribute('data-fs', String(S.prefs.fs));
}
if (mq && mq.addEventListener) mq.addEventListener('change', applyTheme);

var verBtn = document.getElementById('verBtn'), verPanel = document.getElementById('verPanel');
function seg(title, act, items, cur) {
  return '<h4>' + title + '</h4><div class="seg">' + items.map(function (it) {
    return '<button data-vact="' + act + '" data-v="' + it[0] + '" aria-pressed="' + (String(cur) === String(it[0])) + '">' + it[1] + '</button>';
  }).join('') + '</div>';
}
function paintPanel() {
  verPanel.innerHTML =
    seg('색 벌', 'theme', [['day', '한지 낮'], ['night', '쪽빛 밤'], ['system', '기기 따름']], S.settings.theme) +
    seg('묵주 그림', 'art', [['1', '안 1 지금'], ['2', '안 2 실'], ['3', '안 3 전체']], S.prefs.rosaryArt) +
    seg('새 기도의 청원·감사', 'kind', [['ribbon', '리본'], ['line', '문장 한 줄']], S.prefs.kindVariant) +
    seg('새 기도의 묵주 줄', 'row', [['1', '둔다'], ['0', '뺀다']], S.prefs.rosaryRow ? '1' : '0') +
    seg('글자 크기', 'fs', [['1', '보통'], ['1.5', '150%'], ['2', '200%']], S.prefs.fs) +
    '<h4>시험 도구</h4><div class="seg">' +
    '<button data-vact="skip">하루 앞으로 감기</button>' +
    '<button data-vact="wipe">저장한 것 모두 지우기</button></div>' +
    '<div style="margin-top:8px;color:#6E7686;font-size:11px">오늘 ' + today() + (S.dayOffset ? ' (＋' + S.dayOffset + '일)' : '') + '</div>';
}
verBtn.addEventListener('click', function () {
  verPanel.hidden = !verPanel.hidden;
  if (!verPanel.hidden) paintPanel();
});
verPanel.addEventListener('click', function (ev) {
  var el = ev.target.closest ? ev.target.closest('[data-vact]') : null;
  if (!el) return;
  var a = el.getAttribute('data-vact'), v = el.getAttribute('data-v');
  if (a === 'theme') S.settings.theme = v;
  else if (a === 'art') S.prefs.rosaryArt = +v;
  else if (a === 'kind') S.prefs.kindVariant = v;
  else if (a === 'row') S.prefs.rosaryRow = v === '1';
  else if (a === 'fs') S.prefs.fs = +v;
  else if (a === 'skip') { S.dayOffset = (S.dayOffset || 0) + 1; }
  else if (a === 'wipe') {
    try { localStorage.removeItem(KEY); } catch (e) { }
    S = blank(); mem = S; Engine.s = null; save(); applyTheme(); paintPanel(); return go('login');
  }
  save(); applyTheme(); paintPanel();
  if (view.name === 'pray' && Engine.s) Engine.paint(); else render();
});

/* ── 12. 시작 ────────────────────────────────────────────────── */
applyTheme();
go(S.account ? 'home' : 'login');

})();
