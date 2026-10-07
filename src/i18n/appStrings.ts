/**
 * 이 저장소가 스스로 쓰는 화면 문구 — 시안의 `UI` 표에 없는 자리들.
 *
 * ── 왜 `strings/*.json` 에 넣지 않고 파일을 따로 두나 ─────────────────────────
 *
 * `strings/*.json` 일곱 벌은 **손으로 쓰는 파일이 아니다.** 시안의 내용 모듈을
 * `tools/w0/extract-world-data.mjs` 가 읽어 통째로 쏟아 놓은 것이고, 시안이 갱신되면 다시
 * 돌려 덮어쓴다. 그 파일에 손으로 열쇠를 더하면 **다음에 그 도구를 돌리는 순간 조용히
 * 사라진다.** 게다가 그 도구는 일곱 벌의 열쇠가 어긋나면 멈추도록 돼 있어, 한 벌에만 더하면
 * 도구 자체가 돌지 않는다.
 *
 * 그래서 손으로 쓰는 문구는 이 파일에 모으고, `stringsFor` 가 두 벌을 겹쳐 하나로 내준다.
 * 시안이 가진 말은 시안에서 오고, 이 앱이 스스로 만든 말은 여기서 온다.
 *
 * ── 왜 한국어와 영어 두 벌뿐인가 ─────────────────────────────────────────────
 *
 * 이 앱이 지금 켜 둔 언어가 그 둘이기 때문이다(`index.ts` 의 `ENABLED_LANGUAGES` · 결정
 * 12-2 카드 C). 나머지 다섯은 **비워 두고 영어로 떨어진다.** 지어내지 않는 것이 이 저장소의
 * 규칙이고(`src/mystery/text.ts` 의 해설도 같은 방식으로 영어로 떨어진다), 애초에 그 다섯은
 * 고를 수 없으므로 화면에 설 일이 없다. 어느 언어를 켤 때 그 언어의 한 벌을 여기에 더한다.
 *
 * ── 값을 끼워 넣는 자리 ───────────────────────────────────────────────────────
 *
 * `{n}` 같은 자리는 `fill()` 이 채운다. **언어마다 필요한 값이 다른 자리가 있어서, 부르는
 * 쪽은 쓰이지 않을 값까지 함께 넘긴다.** 예를 들어 며칠째를 적는 자리에서 한국어는
 * `스물세 번째` 라는 우리말 차례수(`{ord}`)를 쓰고 영어는 숫자(`{n}`)를 쓰는데, 부르는 쪽이
 * 둘 다 넘기면 각 언어의 틀이 자기에게 필요한 것만 집어 간다. 쓰이지 않은 자리는 그 언어의
 * 틀에 아예 없으므로 화면에 남지 않는다.
 */
import type { LanguageKey } from './index';

/** 한국어 한 벌이 이 표의 모양을 정한다. */
export type AppStrings = typeof ko;

const ko = {
  /* ── 로그인 (app/index.tsx) ─────────────────────────────────────────── */
  loginTitle: '묵주',
  loginBody: '하나의 지향을 쉰네 날 동안 바칩니다.\n오늘 어디까지 바쳤는지는 앱이 기억합니다.',
  continueGoogle: 'Google로 계속하기',
  continueApple: 'Apple로 계속하기',
  loginTerms:
    '계속하면 이용약관과 개인정보 처리방침에 동의합니다.\n바람 문구는 서버에서 암호화해 보관합니다.',

  /* ── 홈 (app/home.tsx) ──────────────────────────────────────────────── */
  todayLink: '오늘의 신비 보기',
  newPrayer: '새 기도',
  homeEmptyTitle: '아직 바치는 기도가 없습니다.',
  homeEmptyNote: '바람 하나를 적고 시작해 보세요. 54일이든 하루든, 끊겨도 그 자리가 남습니다.',
  removeHint: '길게 누르면 이 기도를 지웁니다',
  journeyDetail: '여정 상세',
  notStarted: '시작 전',
  /** `{t}` 전체 날수 · `{p}` 바친 날수. */
  daysPrayedOf: '{t}일 중 {p}일을 바쳤습니다',
  prayedTodayDone: '오늘 바쳤습니다',
  notYetShort: '아직',
  /* 마지막으로 바친 때를 상대 표기로 (src/journey/format.ts 의 `relativeTime`). */
  justNow: '방금',
  minutesAgo: '{n}분 전',
  hoursAgo: '{n}시간 전',
  yesterdayAt: '어제 {part}',
  daysAgo: '{n}일 전',
  partOfDay: { night: '밤', morning: '아침', afternoon: '낮', evening: '저녁' },

  /* ── 여정 (app/journey.tsx) ─────────────────────────────────────────── */
  missingIntention: '무엇을 위하여 바치는지 한 줄 적어 주세요.',
  viewEndedJourney: '마친 여정 보기',
  /** `{d}` 며칠 뒤 · `{date}` 시작하는 날. */
  startsInDays: '{d}일 뒤에 시작합니다 · {date}',
  /** `{n}` 며칠째 · `{phase}` 청원인가 감사인가 (없으면 빈 글). */
  dayIndexLabel: '{n}일째',
  dayIndexWithPhase: '{n}일째 · {phase}',

  /* ── 하루 완주 (app/day-done.tsx) ──────────────────────────────────── */
  /** `{n}` 이어서 바친 횟수. */
  resumedCount: '이어서 {n}번',
  /** `{date}` 날짜 · `{ord}` 우리말 차례수 · `{n}` 며칠째. */
  dayDoneHead: '{date} · {ord} 날',
  /** `{t}` 전체 · `{p}` 바친 날 · `{r}` 남은 날. */
  dayDoneSummary: '{t}일 중 {p}일 바쳤습니다 · 남은 {r}일',

  /* ── 여정 완주 (app/all-done.tsx) ──────────────────────────────────── */
  /** `{count}` 우리말 셈 · `{n}` 숫자. */
  allDoneTitle: '{count} 날의 여정을 마쳤습니다',
  allDonePhaseThanks: '{count} 날 내내 감사',
  /** `{pc}`·`{tc}` 우리말 셈 · `{p}`·`{t}` 숫자. */
  allDonePhaseBoth: '청원 {pc} 날, 감사 {tc} 날',
  /** `{ord}` 우리말 차례수 · `{n}` 숫자 · `{date}` 마친 날 (없으면 빈 글). */
  allDoneHead: '{ord} 날',
  allDoneHeadWithDate: '{ord} 날 · {date}',
  againWithIntention: '이 지향으로 다시 시작하기',

  /* ── 성화 갤러리 (app/gallery.tsx) ─────────────────────────────────── */
  favoritesEmpty: '아직 즐겨찾기에 담은 성화가 없습니다. 그림 아래의 하트를 누르면 여기에 모입니다.',

  /* ── 신비 해설 (app/guide.tsx) ─────────────────────────────────────── */
  /** `{set}` 오늘의 신비 이름. */
  todayIsSet: '오늘 바치는 것은 {set}입니다.',
  /*
    긴 해설 세 칸의 작은 제목. 해설이 세 갈래로 나뉜다는 것을 읽는 사람이 알아야, 줄글
    석 문단을 한 덩어리로 흘려 읽지 않는다 (`spec/mystery-commentary.ko.json`).
  */
  commentaryScene: '무슨 일이 있었나',
  commentaryMeaning: '무엇을 묵상하나',
  commentaryToday: '오늘 나에게',

  /* ── 배우기 두 화면 (app/learn.tsx · app/background.tsx) ───────────── */
  /** 설정에서 두 화면을 묶는 절의 제목. */
  learnSection: '배우기',
  learnBasics: '묵주기도 입문',
  learnBasicsNote: '처음 바치는 분을 위한 설명서입니다.',
  learnBackground: '배경 지식',
  learnBackgroundNote: '이 기도가 어디서 왔고 왜 쉰네 날인지.',

  /* ── 기도 화면 (app/pray.tsx) ──────────────────────────────────────── */
  leavePrayer: '기도 나가기',
  prevBead: '앞 알',
  nextBead: '다음 알',
  atStart: '여기가 처음',
  atEnd: '여기가 끝',

  /* ── 지역·언어 (app/region.tsx) ────────────────────────────────────── */
  languageHere: '지금',
  languageComingSoon: '준비 중',

  /* ── 설정 (app/settings.tsx) ───────────────────────────────────────── */
  recitationLabel: '낭송 방식',
  paceLabel: '받는 사이',
  rosaryLabel: '묵주',
  handsFree: '손 없이 조작',
  handsFreeNote: '폰을 흔들면 다음 알로, 이어폰 버튼으로 앞뒤로 갑니다.',
  vibration: '진동',
  historyNone: '아직 바친 날이 없습니다',
  /** `{n}` 바친 날의 합. */
  historySome: '지금까지 {n}일을 바쳤습니다',
  exportRecords: '기록 내보내기',
  /** `{n}` 여정의 수. */
  exportNote: '여정 {n}개와 설정을 파일 하나로 내려받습니다',
  exportDone: '기록 파일로 내보냈습니다. 여정 {n}개와 설정이 담겼습니다.',
  exportFailed: '이 기기에서는 파일을 내보낼 수 없습니다.',
  importRecords: '기록 들여오기',
  importNote: '내려받아 둔 파일을 읽어 지금 기록을 갈아 끼웁니다',
  importUnreadable: '읽을 수 없는 파일입니다. 이 기기의 기록은 그대로 있습니다.',
  importDone: '여정 {n}개와 설정을 들여왔습니다.',
  /** `{a}` 지금 기기의 여정 수 · `{b}` 파일에 담긴 여정 수. */
  importConfirm:
    '지금 이 기기의 여정 {a}개와 설정이 사라지고, 파일에 담긴 여정 {b}개와 설정으로 바뀝니다. 되돌릴 수 없습니다.',
  importConfirmYes: '들여오기',
  importConfirmNo: '그대로 두기',
  backupDialogTitle: '기록 파일 저장하기',
  installedAlready: '이미 홈 화면에서 열고 있습니다',
  installTapToAdd: '눌러서 놓습니다',
  installShowHow: '놓는 방법을 알려 드립니다',
  installIosTitle: '아이폰·아이패드에서',
  installIosBody:
    '화면 아래쪽 가운데의 공유 단추(위로 향한 화살표)를 누르고, 목록을 내려 «홈 화면에 추가»를 고르면 됩니다. 사파리가 아닌 브라우저에서는 이 항목이 보이지 않을 수 있습니다.',
  installBrowserTitle: '이 브라우저에서',
  installBrowserBody:
    '브라우저의 차림표(⋮ 또는 ···)를 열고 «앱 설치» 또는 «홈 화면에 추가»를 고르면 됩니다. 항목이 보이지 않는 브라우저에서는 이 앱을 그대로 인터넷 주소로 쓰셔도 됩니다.',
  installAfterTitle: '놓고 나면',
  installAfterBody:
    '주소창 없이 앱처럼 열리고, 인터넷이 없어도 기도와 여정은 그대로 됩니다. 다만 성화는 한 번이라도 본 그림만 보이고, 소리 내어 읽기는 기기에 담긴 목소리일 때만 됩니다.',
  about: '소개',
  switchOn: '켜짐',
  switchOff: '꺼짐',
  applyToNew: '새로 만드는 기도에 적용됩니다',
  applyToAll: '모든 여정의 기도 화면에 적용됩니다',

  /* ── 소개 시트 (src/ui/AboutSheet.tsx) ─────────────────────────────── */
  aboutWhatTitle: '이 앱이 하는 일',
  aboutWhatBody:
    '바람 하나를 정하고 54일 동안 날마다 묵주기도를 바쳐 완주하게 합니다. 묵주와 기도문 책이 없어도, 화면을 보지 않고도, 중간에 끊겨도 이어서 끝까지 갈 수 있게 만들었습니다.',
  aboutAskTitle: '이 앱이 지금 묻는 것',
  aboutAskBody:
    '화면을 보지 않고 손을 쓰지 않고도 다섯 단을 끝까지 바칠 수 있는가 — 이 하나를 알아보려고 만든 검증 빌드입니다. 흔들기와 이어폰 단추로 알을 넘기고, 앱이 앞 절을 읽으면 뒷 절을 소리 내어 받습니다.',
  aboutNotYetTitle: '아직 아닌 것',
  aboutNotYetBody:
    '함께 바치기와 계정 연결은 아직 붙지 않았습니다. 기도문은 임시 판본이고, 성화도 검증 기간용입니다. 결제는 없습니다.',
  begin: '시작하기',

  /* ── 시트 넷 (src/ui/*Sheet.tsx) ───────────────────────────────────── */
  pauseName: '잠시 멈춤',
  pauseNote: '자리가 남습니다',
  endHereName: '여기서 끝내기',
  endHereNote: '오늘 처음부터',
  removeJourneyLabel: '이 기도 지우기',
  removeJourneyMessage: '이 기도를 지웁니다. 기록도 함께 지워집니다.',
  removeJourneyYes: '지우기',
  removeJourneyNo: '두기',
  restartTodayMessage: '오늘 자리를 지우고 처음부터 바칩니다.',
  restartTodayYes: '처음부터',
  restartTodayNo: '아니요, 이어서',
  mainScreens: '주요 화면',

  /* ── 이어서 바칠 자리 (src/journey/card.ts) ────────────────────────── */
  /** `{d}` 몇째 단 · `{i}` 몇 번째 알 · `{prayer}` 기도 이름. */
  resumeFromBead: '제{d}단 {i}번째 알부터 이어서',
  resumeFromPrayer: '제{d}단 {prayer}부터 이어서',
  resumeFromDecade: '제{d}단부터 이어서',
  resumeFromOpening: '시작 기도부터 이어서',

  /* ── 지금 알의 상태 (src/prayer/phase.ts) ──────────────────────────── */
  beadReading: '지금 알: 앱이 읽는 중',
  beadResponse: '지금 알: 내가 받을 차례',
  beadSilent: '지금 알: 소리 없이 진행 중',
  beadDecade: '지금 알: 단이 바뀌었습니다',
  beadPaused: '지금 알: 멈춤',

  /* ── 묵주 · 낭송 · 받는 사이의 이름과 설명 ────────────────────────── */
  rosaryName: { rose: '붉은 장미', wood: '나무', silver: '은', gold: '금' },
  rosaryNote: {
    rose: '장미꽃으로 조각한 알과 검은 끈',
    wood: '짙은 나무 알, 주님의 기도만 밝은 살구빛',
    silver: '은빛 구슬과 은 사슬',
    gold: '금빛 구슬과 금 사슬',
  },
  recitationName: { full: '전부 읽기', alternate: '교대', silent: '읽지 않기' },
  recitationNote: {
    full: '앱이 처음부터 끝까지 읽습니다',
    alternate: '앞 절은 앱이, 뒷 절은 직접 바칩니다',
    silent: '소리 없이 진동으로만 넘어갑니다',
  },
  /** 설정 줄의 오른쪽에 적히는 짧은 이름 — v5 는 `교대로` 로 적는다. */
  recitationShort: { full: '전부 소리로', alternate: '교대로', silent: '소리 없이' },
  paceName: { slow: '느리게', normal: '보통', fast: '빠르게' },
  paceNote: { slow: '천천히 바침', normal: '기본', fast: '익숙한 분' },
  paceShort: { slow: '느리게', normal: '보통', fast: '빠르게' },
};

const en: AppStrings = {
  loginTitle: 'Rosary',
  loginBody:
    'One intention, prayed for fifty-four days.\nThe app remembers where you left off today.',
  continueGoogle: 'Continue with Google',
  continueApple: 'Continue with Apple',
  loginTerms:
    'By continuing you agree to the Terms of Service and Privacy Policy.\nYour intention is stored encrypted on the server.',

  todayLink: "See today's mysteries",
  newPrayer: 'New prayer',
  homeEmptyTitle: 'No prayer in progress yet.',
  homeEmptyNote:
    'Write one intention and begin. Fifty-four days or a single day — if you miss one, your place stays.',
  removeHint: 'Press and hold to delete this prayer',
  journeyDetail: 'Journey details',
  notStarted: 'Not started',
  daysPrayedOf: 'Prayed {p} of {t} days',
  prayedTodayDone: 'Prayed today',
  notYetShort: 'Not yet',
  justNow: 'Just now',
  minutesAgo: '{n} min ago',
  hoursAgo: '{n} h ago',
  yesterdayAt: 'Yesterday {part}',
  daysAgo: '{n} days ago',
  partOfDay: { night: 'at night', morning: 'morning', afternoon: 'afternoon', evening: 'evening' },

  missingIntention: 'Write one line about what you are praying for.',
  viewEndedJourney: 'View the completed journey',
  startsInDays: 'Begins in {d} days · {date}',
  dayIndexLabel: 'Day {n}',
  dayIndexWithPhase: 'Day {n} · {phase}',

  resumedCount: 'Resumed {n} times',
  dayDoneHead: '{date} · Day {n}',
  dayDoneSummary: 'Prayed {p} of {t} days · {r} to go',

  allDoneTitle: 'You have completed a journey of {n} days',
  allDonePhaseThanks: '{n} days of thanksgiving',
  allDonePhaseBoth: '{p} days of petition, {t} of thanksgiving',
  allDoneHead: 'Day {n}',
  allDoneHeadWithDate: 'Day {n} · {date}',
  againWithIntention: 'Begin again with this intention',

  favoritesEmpty:
    'No sacred art in your favorites yet. Tap the heart under an image and it will gather here.',

  todayIsSet: 'Today you pray the {set}.',
  commentaryScene: 'What happened',
  commentaryMeaning: 'What to consider',
  commentaryToday: 'For today',

  learnSection: 'Learn',
  learnBasics: 'New to the Rosary',
  learnBasicsNote: 'A guide for praying it the first time.',
  learnBackground: 'Background',
  learnBackgroundNote: 'Where this prayer came from, and why fifty-four days.',

  leavePrayer: 'Leave the Rosary',
  prevBead: 'Previous bead',
  nextBead: 'Next bead',
  /*
    앞·뒤로 갈 데가 없을 때 알 넘기기 단추에 적히는 말. **짧아야 한다** — 화면 아래 단추 둘이
    한 줄에 나란히 서고 글이 한 줄로 잘리는 자리라, 영어 화면을 찍어 보니
    `This is the beginning` 이 `This is the beginn…` 으로 잘렸다 (W4 슬라이스 E).
  */
  atStart: 'The beginning',
  atEnd: 'The end',

  languageHere: 'Now',
  languageComingSoon: 'Coming soon',

  recitationLabel: 'Recitation',
  paceLabel: 'Response pace',
  rosaryLabel: 'Rosary',
  handsFree: 'Hands-free',
  handsFreeNote: 'Shake the phone for the next bead; the earphone button moves back and forward.',
  vibration: 'Vibration',
  historyNone: 'No days prayed yet',
  historySome: '{n} days prayed so far',
  exportRecords: 'Export records',
  exportNote: 'Download {n} journeys and your settings as a single file',
  exportDone: 'Exported to a records file. It holds {n} journeys and your settings.',
  exportFailed: 'This device cannot export a file.',
  importRecords: 'Import records',
  importNote: 'Read a file you downloaded and replace the records on this device',
  importUnreadable: 'This file cannot be read. The records on this device are unchanged.',
  importDone: 'Imported {n} journeys and your settings.',
  importConfirm:
    'The {a} journeys and settings on this device will be removed and replaced by the {b} journeys and settings in the file. This cannot be undone.',
  importConfirmYes: 'Import',
  importConfirmNo: 'Leave as is',
  backupDialogTitle: 'Save the records file',
  installedAlready: 'Already open from the Home Screen',
  installTapToAdd: 'tap to add it',
  installShowHow: 'we will show you how',
  installIosTitle: 'On iPhone and iPad',
  installIosBody:
    'Tap the share button at the bottom center of the screen (the arrow pointing up), scroll the list down and choose «Add to Home Screen». Browsers other than Safari may not show this item.',
  installBrowserTitle: 'In this browser',
  installBrowserBody:
    'Open the browser menu (⋮ or ···) and choose «Install app» or «Add to Home Screen». If your browser does not show the item, you can keep using this app at its web address.',
  installAfterTitle: 'Once it is there',
  installAfterBody:
    'It opens like an app with no address bar, and prayers and journeys work without the internet. Sacred art shows only the images you have already seen, and reading aloud works only with a voice installed on the device.',
  about: 'About',
  switchOn: 'On',
  switchOff: 'Off',
  applyToNew: 'Applies to prayers you start from now on',
  applyToAll: 'Applies to the prayer screen of every journey',

  aboutWhatTitle: 'What this app does',
  aboutWhatBody:
    'You choose one intention and pray the Rosary every day for fifty-four days, all the way to the end. It is made so you can do that without a rosary or a prayer book, without looking at the screen, and even if you miss a day.',
  aboutAskTitle: 'What this app is asking now',
  aboutAskBody:
    'Can you pray five decades to the end without looking at the screen and without using your hands? This build was made to find that out. Shake or use the earphone button to move between beads; the app reads the first half of each prayer and you answer with the second.',
  aboutNotYetTitle: 'Not here yet',
  aboutNotYetBody:
    'Praying together and account sign-in are not attached yet. The prayer texts are a provisional edition and the sacred art is for the trial period. There is no payment.',
  begin: 'Begin',

  pauseName: 'Pause for now',
  pauseNote: 'Your place is kept',
  endHereName: 'End here',
  endHereNote: 'Today starts over',
  removeJourneyLabel: 'Delete this prayer',
  removeJourneyMessage: 'This prayer will be deleted, and its record with it.',
  removeJourneyYes: 'Delete',
  removeJourneyNo: 'Keep',
  restartTodayMessage: "Today's place will be cleared and you will begin again.",
  restartTodayYes: 'From the start',
  restartTodayNo: 'No, continue',
  mainScreens: 'Main screens',

  resumeFromBead: 'Continue from bead {i} of decade {d}',
  resumeFromPrayer: 'Continue from {prayer} in decade {d}',
  resumeFromDecade: 'Continue from decade {d}',
  resumeFromOpening: 'Continue from the opening prayers',

  beadReading: 'Current bead: the app is reading',
  beadResponse: 'Current bead: your turn to answer',
  beadSilent: 'Current bead: moving on in silence',
  beadDecade: 'Current bead: the decade has changed',
  beadPaused: 'Current bead: paused',

  rosaryName: { rose: 'Red rose', wood: 'Wood', silver: 'Silver', gold: 'Gold' },
  rosaryNote: {
    rose: 'Beads carved as roses on a black cord',
    wood: 'Dark wooden beads; only the Our Father beads are pale apricot',
    silver: 'Silver beads on a silver chain',
    gold: 'Gold beads on a gold chain',
  },
  recitationName: { full: 'Read it all', alternate: 'Alternate', silent: 'Do not read' },
  recitationNote: {
    full: 'The app reads from beginning to end',
    alternate: 'The app reads the first half, you pray the second',
    silent: 'No sound; it moves on by vibration alone',
  },
  recitationShort: { full: 'All aloud', alternate: 'Alternating', silent: 'Silent' },
  paceName: { slow: 'Slow', normal: 'Normal', fast: 'Fast' },
  paceNote: { slow: 'Praying unhurried', normal: 'Default', fast: 'For those used to it' },
  paceShort: { slow: 'Slow', normal: 'Normal', fast: 'Fast' },
};

/**
 * 손으로 쓴 문구 한 벌. 아직 채우지 않은 언어는 영어로 떨어진다 (위 머리글).
 */
export function appStringsFor(language: LanguageKey): AppStrings {
  return language === 'ko' ? ko : en;
}
