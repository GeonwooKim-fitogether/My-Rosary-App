/**
 * 설정 — 「MyRosary World」 시안의 `data-screen-label="Settings"` 블록을 옮긴 화면
 * (W2 슬라이스 C · `docs/plan/w2-work-order.md` §2).
 *
 * 값(색·크기·간격·괘선)은 그 블록에서 그대로 가져왔고, 색은 지역 다섯의 색 벌
 * (`src/theme/worldTokens.ts`)에서 이름으로 고른다. 화면이 스스로 정하는 색은 없다.
 *
 * ── 이 화면이 2026-09-18 에 어떻게 달라졌나 ─────────────────────────────────────
 *
 * 그전까지 설정은 v5 시안의 **묶음 셋**(바치는 방식 · 보이는 것 · 계정)이었고, 줄마다
 * 높이 80 에 위 괘선 하나를 둔 한지 벌이었다. 새 시안은 같은 화면을 **묶음 없는 한 줄기**로
 * 그린다 — 큰 제목 아래로 줄이 곧장 이어지고, 켬/끔인 것은 오른쪽에 토글이 선다.
 *
 * | 무엇 | 옛 화면 (v5) | 이 화면 (World) |
 * |---|---|---|
 * | 맨 위 | 자간 넓은 라벨과 `닫기` 글자 | 앱 이름(작은 라벨)과 큰 제목 `설정` |
 * | 묶음 | 셋 (`바치는 방식` · `보이는 것` · `계정`) | 없다 — 줄이 곧장 이어진다 |
 * | 줄의 높이 | 80 | 56 (토글 줄) · 내용에 따라 (값이 붙는 줄) |
 * | 켬/끔 | 오른쪽에 `켜짐`·`꺼짐` 글자 | 오른쪽에 토글 (44×26) |
 * | 색 | 한지 벌 (낮·밤) | 그 지역의 색 벌 |
 *
 * ── 줄의 내용은 시안이 아니라 이 저장소의 요구를 따른다 (결정 12-2 카드 E) ────────
 *
 * 시안의 설정에는 켬/끔 토글이 넷 있다(`voice` · `autoAdvance` · `haptic` · `reduceMotion`).
 * 앞의 둘은 이 앱의 척추와 어긋난다 — 이 앱에서 "소리"는 켬/끔이 아니라 **낭송 방식 셋**
 * (전부 · 교대 · 읽지 않기, FR-06)이고, "자동으로 다음"은 켬/끔이 아니라 **받는 사이 셋**
 * (느리게 · 보통 · 빠르게, FR-07)이다. 카드 E 가 그 자리를 우리 것으로 바꾸라고 정했으므로,
 * 앞의 두 토글 자리에 고르는 줄 둘이 서고 뒤의 두 토글(`진동` · `움직임 줄이기`)은 그대로 남았다.
 *
 * ── 뺀 줄 넷과 그 근거 ─────────────────────────────────────────────────────────
 *
 * | 뺀 줄 | 근거 | 코드는 어떻게 했나 |
 * |---|---|---|
 * | 계정 삭제 (FR-45) | 결정 12-2 **카드 A** — 계정이 V1 에 없다. 지울 계정이 없는데 지우는 단추를 두면 눌러도 아무 일이 없는 줄이 된다. 애플 심사 5.1.1 이 요구하는 것은 **계정을 만드는 앱**의 삭제 경로이므로, 계정이 돌아오는 V1.5 에 이 줄도 함께 돌아온다 | 화면의 줄과 그 확인 시트를 이 파일에서 걷었다. 요구사항(FR-45)과 문구는 `docs/product/` 에 그대로 있다 |
 * | 로그아웃 | 같은 카드 A. 로그인한 계정이 없으므로 나갈 곳이 없다 | 위와 같다. 로그인 화면(`app/index.tsx`)은 지우지 않았다 — 카드 A 가 "진입점만 끊는다"고 적은 그대로다 |
 * | 낮과 밤 | 결정 12-2 **카드 F** — 밤 벌(쪽빛)을 접었다. 새 시안에는 지역 다섯의 색 벌만 있다 | **벌을 그리는 코드는 한 줄도 지우지 않았다** (`src/theme/tokens.ts` 의 `nightColors` 와 `ThemeProvider`). 고르는 자리만 끊었으므로, 되살리기로 하면 줄 하나를 다시 놓는 일이다 |
 * | 기도문 판본 | 같은 카드 F — 판본은 언어마다 한 벌이다 | 위와 같다 |
 *
 * ── 시안에 없는 줄 둘 — 기록 내보내기·들여오기 (W3 슬라이스 C) ────────────────
 *
 * 시안의 설정에는 이 둘이 없다. 시안에는 계정이 있어 기록이 서버에 남는다고 보았기 때문이다.
 * 이 앱은 결정 12-2 의 카드 A 로 **계정을 V1.5 로 미뤘고**, 그래서 기기를 바꾸거나 앱을 지우면
 * 기록이 통째로 사라진다. 로드맵 §7 의 위험 표가 그 위험의 절반을 파일 하나로 보완하라고
 * 적은 자리가 이 두 줄이며, 카드 A 는 이 받침을 전제로 계정을 미뤘다.
 *
 * **두 줄은 2026-09-18 부터 기기(iOS·안드로이드)에서도 선다** (W4 슬라이스 D · Q-73).
 * W3 때는 웹에서만 섰다 — 기기에서 파일을 사람에게 건네고 사람에게서 받는 부품 둘이 이
 * 저장소에 없었기 때문이다. W4 가 그 둘(`expo-sharing` · `expo-document-picker`)을 들여
 * 통로 한 파일(`src/storage/backupFile.ts`)만 갈아 끼웠고, 이 화면은 그 줄의 손잡이만
 * 기다리는 모양으로 바뀌었다(내보내기가 공유 시트를 여느라 시간이 걸린다).
 *
 * **다만 기기 쪽은 아직 한 번도 돌려 보지 못했다 — 웹에서만 확인했다.** 기기에서 돌려
 * 보려면 기기 빌드가 필요하고 그것은 스토어 계정이 있어야 한다. 무엇을 확인했고 무엇을
 * "될 것으로 보는지" 는 `src/storage/backupFile.ts` 의 머리글에 표로 갈라 적혀 있다.
 *
 * **들여오기는 확인 시트를 거친다.** 들여오면 지금 기기의 여정과 설정이 사라지므로, 이
 * 저장소가 자리를 지우는 조작마다 두어 온 관문을 여기에도 둔다 (FR-18 · 시트 S3·S6). 시트는
 * "정말 하시겠습니까" 로 묻지 않고 **무엇을 몇 개 잃는지 수로** 말한다 — 사람이 판단할 수
 * 있어야 관문이지, 한 번 더 누르게 하는 것만으로는 관문이 아니기 때문이다.
 *
 * ── `홈 화면에 추가` 가 2026-09-18 에 살아났다 (W4 슬라이스 A) ──────────────────
 *
 * 그전까지 이 줄은 **놓지 않은 자리**였다. 까닭은 "설치형 웹앱을 세우는 W4 의 일이라 지금
 * 놓으면 눌러도 아무 일이 없다" 였는데, W4 가 그 전제를 바꿨다 — `public/manifest.webmanifest`
 * 와 `public/sw.js` 가 서고 `app/+html.tsx` 가 그 둘을 가리키게 되면서, 이제 이 줄은 누르면
 * 실제로 무엇인가를 한다.
 *
 * **다만 무엇을 하는지는 브라우저마다 다르다.** 안드로이드 크롬 계열에서는 진짜 설치 창이
 * 뜨고, iOS 에서는 애플이 그 창을 앱에게 내주지 않으므로 **어떻게 하는지 알려 주는 시트**가
 * 뜬다. 스토어로 받은 앱에서는 홈 화면에 놓을 것이 없으므로 **줄 자체를 그리지 않는다.**
 * 가름은 `src/install/homeScreen.ts` 가 맡고 이 화면은 그 답만 쓴다.
 *
 * ── 시안에 있으나 아직 놓지 않은 줄 하나 ────────────────────────────────────────
 *
 * `진행 중인 기도 지우기`는 놓지 않았다. 이 앱에서 이미 홈의 `다시 바치기` 가 하는 일이라
 * (확인 시트까지 붙어 있다) 두 곳에서 같은 일을 하게 되기 때문이다. **없는 것이 아니라
 * 아직 아닌 것**이므로 여기 적어 둔다.
 */
import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fill, LANGUAGES, stringsFor, type Strings } from '../src/i18n';
import {
  installRowSupported,
  promptHomeScreenInstall,
  useHomeScreenInstall,
} from '../src/install/homeScreen';
import { countDays } from '../src/journey/rules';
import type { PaceKey, RecitationMode } from '../src/domain/types';
import { importBackup, updateSettings } from '../src/state/appStore';
import { useAppState } from '../src/state/useAppState';
import {
  backupFileName,
  backupText,
  parseBackup,
  type ParsedBackup,
} from '../src/storage/backup';
import { backupFileSupported, downloadTextFile, pickTextFile } from '../src/storage/backupFile';
import {
  PACE_KEYS,
  RECITATION_KEYS,
} from '../src/storage/settings';
import { FONT_SCALE_LABEL_KEYS, asFontScaleIndex, type FontScaleIndex } from '../src/theme/prayerFont';
import { TEXT_SCALE } from '../src/theme/fontScale';
import {
  FONT_SEG_PX,
  guideTitleSizeFor,
  koWordBreak,
  paletteFor,
  worldFontStack,
  worldRadius,
  worldSettingsType,
  type WorldPalette,
} from '../src/theme/worldTokens';
import { RosarySheet } from '../src/prayer/RosarySheet';
import { AboutSheet } from '../src/ui/AboutSheet';
import { BottomSheet, ChoiceSheet, ConfirmSheet } from '../src/ui/Sheet';
import { TAB_BAR_HEIGHT, WorldTabBar } from '../src/ui/WorldTabBar';

type Sheet = 'none' | 'recitation' | 'pace' | 'rosary' | 'about' | 'install';

/** 시안의 괘선 — 화면마다 쓰는 `rgba(0,0,0,.14)` 하나다. */
const RULE = 'rgba(0,0,0,.14)';

export default function SettingsScreen() {
  const { journeys, settings, pinnedArt, favoriteArt } = useAppState();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const palette = paletteFor(settings.region);
  const strings = stringsFor(settings.language);
  const styles = settingsStyles(palette, settings.language === 'ko');
  const [sheet, setSheet] = useState<Sheet>('none');
  const close = () => setSheet('none');
  /*
    기록 내보내기·들여오기가 쓰는 자리 둘 (W3 슬라이스 C).

    `pending` 은 **읽기는 끝났지만 아직 앉히지 않은** 파일이다. 파일을 먼저 읽고 그다음에
    확인 시트를 여는 순서인데, 그래야 시트가 "파일에 담긴 여정 5개" 처럼 들어올 것의 수까지
    말할 수 있다. 먼저 묻고 나중에 읽으면 시트는 잃을 것만 알고 얻을 것은 모른다.

    `notice` 는 두 줄 아래에 한 줄로 뜨는 알림이다. 내려받았다는 말과 읽을 수 없다는 말이
    같은 자리에 서는데, 둘 다 "방금 누른 것이 어떻게 됐나"라는 한 가지 물음의 답이라 자리를
    나누면 화면에 빈 줄만 는다.
  */
  const [pending, setPending] = useState<ParsedBackup | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /* 「홈 화면에 추가」 줄이 지금 무엇을 할 수 있는가 (W4 슬라이스 A). */
  const install = useHomeScreenInstall();

  const titleFontSize = guideTitleSizeFor(window.width) * TEXT_SCALE.font;

  /**
   * 완주 기록 — 지금까지 바친 날의 수.
   *
   * 시안은 이 자리에 "완주한 묵주기도의 수"를 두고 그 아래 성모송 수를 적는데, 시안에는
   * 여정이 없어 하루하루가 곧 한 번의 완주다. 이 앱에서 그것에 해당하는 것은 **여정들이
   * 바친 날의 합**이므로 그 수를 센다. 새 수를 지어내지 않고 이미 있는 셈(`countDays`)을 쓴다.
   */
  const prayedDays = journeys.reduce((sum, journey) => sum + countDays(journey.days).prayed, 0);

  /*
    고르개 시트에 세울 줄들. **차례는 `src/storage/settings.ts` 가, 말은 문구 표가 갖는다**
    (W4 슬라이스 E). 그전에는 이름과 설명까지 저장소 파일에 한국어로 박혀 있어서, 영어로
    바꾼 화면의 이 시트들이 한국어로 떴다.
  */
  const recitationChoices = RECITATION_KEYS.map((key) => ({
    key,
    name: strings.recitationName[key],
    note: strings.recitationNote[key],
  }));
  const paceChoices = PACE_KEYS.map((key) => ({
    key,
    name: strings.paceName[key],
    note: strings.paceNote[key],
  }));

  /**
   * 지금 기기의 기록을 글로 만들어 파일로 내보낸다.
   *
   * **웹과 기기가 서로 다른 일을 한다** (W4 슬라이스 D). 웹에서는 파일이 곧바로 내려받기
   * 폴더로 떨어지고, iOS·안드로이드에서는 공유 시트가 올라와 사람이 어디에 둘지 고른다.
   * 알림 문구가 「내려받았습니다」 대신 「파일로 내보냈습니다」인 까닭이다 — 어느 쪽에서도
   * 참인 말이어야 한다.
   */
  const exportRecords = async () => {
    const ok = await downloadTextFile(
      backupText({ journeys, settings, pinnedArt, favoriteArt }),
      backupFileName(),
      strings.backupDialogTitle,
    );
    setNotice(ok ? fill(strings.exportDone, { n: journeys.length }) : strings.exportFailed);
  };

  /**
   * 파일을 하나 고르게 하고, 읽을 수 있으면 확인 시트를 연다.
   *
   * **읽지 못했을 때 아무것도 바꾸지 않는 것**이 이 손잡이의 핵심이다. 들어오는 파일은 사람의
   * 손을 거쳐 돌아오므로 깨져 있을 수 있는데, 그때 기기의 기록까지 잃으면 되찾으려던 사람이
   * 가진 것마저 잃는다. 판정은 `parseBackup` 하나가 맡고 여기서는 그 답만 가른다.
   */
  const importRecords = async () => {
    setNotice(null);
    const text = await pickTextFile();
    if (text === null) return; // 고르지 않고 닫았다 — 알릴 것이 없다
    const read = parseBackup(text);
    if (!read) {
      setNotice(strings.importUnreadable);
      return;
    }
    setPending(read);
  };

  /**
   * 「홈 화면에 추가」를 눌렀다 (W4 슬라이스 A).
   *
   * 브라우저가 설치 창을 내주는 곳에서는 그 창을 띄우고, 내주지 않는 곳(iOS 가 그렇다)에서는
   * 방법을 알려 주는 시트를 연다. **어느 쪽이든 누르면 무엇인가가 일어난다** — 눌러도 아무
   * 일이 없는 단추를 두지 않는다는 이 저장소의 규칙이 여기에도 그대로 선다.
   */
  const addToHomeScreen = async () => {
    const outcome = await promptHomeScreenInstall();
    if (outcome === 'unavailable') setSheet('install');
  };

  /** 확인 시트에서 눌렀다 — 여기서부터는 되돌릴 수 없다. */
  const applyImport = () => {
    if (!pending) return;
    const count = pending.journeys.length;
    importBackup(pending);
    setPending(null);
    setNotice(fill(strings.importDone, { n: count }));
  };

  return (
    <View style={styles.screen} testID="settings-screen">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingTop: insets.top + 18, paddingBottom: TAB_BAR_HEIGHT + 24 },
        ]}
      >
        <Text style={styles.brand}>{strings.appName}</Text>
        <Text
          style={[styles.title, { fontSize: titleFontSize, lineHeight: titleFontSize * 1.05 }]}
        >
          {strings.settings}
        </Text>

        {/*
          ── 지역·언어 ───────────────────────────────────────────────────────
          시안의 첫 줄 그대로다 — 위아래에 괘선이 하나씩 있고, 오른쪽에 화살표가 선다.
          아래 작은 글은 지금 고른 지역과 언어를 함께 말한다(시안의 `regionName · langName`).
        */}
        <Pressable
          style={styles.linkRow}
          onPress={() => router.push('/region')}
          accessibilityRole="button"
          testID="settings-region"
        >
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{strings.regionLang}</Text>
            <Text style={styles.rowNote} testID="settings-region-value">
              {`${strings[settings.region]} · ${LANGUAGES[settings.language].name}`}
            </Text>
          </View>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d="m9 18 6-6-6-6"
              stroke={palette.ink}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Pressable>

        {/*
          ── 글자 크기 넉 칸 ─────────────────────────────────────────────────
          시안의 `seg` 그대로다 — 한 줄에 넉 칸, 칸마다 자기 크기의 글자로 이름을 적어
          고르기 전에 결과가 보이게 한다. 고른 칸은 강조색 테 하나로만 표시한다.

          **기도 화면의 `Aa` 단추와 같은 값을 고친다.** 두 곳에서 고칠 수 있는 유일한
          설정이며, 기도문을 보면서 고치는 쪽(기도 화면)과 미리 정해 두는 쪽(여기)이
          모두 필요하기 때문이다.
        */}
        <View style={styles.block}>
          <Text style={styles.rowLabel}>{strings.fontSize}</Text>
          <View style={styles.seg} testID="settings-font-scale">
            {FONT_SCALE_LABEL_KEYS.map((key, index) => {
              const value = asFontScaleIndex(index);
              const here = settings.fontScale === value;
              return (
                <Pressable
                  key={key}
                  style={[styles.segOption, index > 0 ? styles.segDivider : null, here ? styles.segOn : null]}
                  onPress={() => updateSettings({ fontScale: value as FontScaleIndex })}
                  accessibilityRole="radio"
                  /*
                    `aria-selected` 를 쓰는 이유. 이 저장소가 지금까지 쓰던
                    `accessibilityState` 는 **웹에서 해당 속성을 내보내지 않는 것이
                    실측됐다**(2026-09-18 — `role` 만 나오고 상태가 빠졌다). React Native 는
                    0.71 부터 `aria-*` 를 같은 뜻의 별칭으로 받으므로 웹·iOS·안드로이드가
                    함께 읽고, 화면 낭독기도 시험도 같은 것을 본다.
                  */
                  aria-selected={here}
                  testID={`settings-font-${index}`}
                >
                  <Text
                    style={[
                      styles.segLabel,
                      /*
                        줄 높이를 글자 크기의 1.25 배로 둔다. 1배(글자 크기와 같은 값)로 두면
                        **두 줄이 되는 순간 글자가 칸 밖으로 잘려 나간다** — 칸은 `overflow:
                        hidden` 이라 위 줄의 윗머리가 테두리에 잘리고 아래 줄은 아래 테두리를
                        넘는다. 영어로 바꾼 화면을 처음 찍어 보고 `Extra large` 에서 실제로
                        그렇게 잘리는 것을 확인했다 (W4 슬라이스 B, `docs/plan/w4-screens/`).
                        한국어에서도 좁은 기기(320)에서 `아주 크게` 가 두 줄이 되므로 같은 일이
                        일어나던 자리다.
                      */
                      { fontSize: FONT_SEG_PX[index], lineHeight: Math.round(FONT_SEG_PX[index]! * 1.25) },
                      here ? styles.segLabelOn : null,
                    ]}
                  >
                    {strings[key]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── 낭송 방식 · 받는 사이 · 묵주 (시안의 토글 자리에 앉은 이 저장소의 줄 셋) ── */}
        <ValueRow
          palette={palette}
          isKorean={settings.language === 'ko'}
          label={strings.recitationLabel}
          value={strings.recitationShort[settings.recitation]}
          onPress={() => setSheet('recitation')}
          testID="settings-recitation"
        />
        <ValueRow
          palette={palette}
          isKorean={settings.language === 'ko'}
          label={strings.paceLabel}
          value={strings.paceShort[settings.pace]}
          onPress={() => setSheet('pace')}
          testID="settings-pace"
        />
        <ValueRow
          palette={palette}
          isKorean={settings.language === 'ko'}
          label={strings.rosaryLabel}
          value={strings.rosaryName[settings.rosary]}
          onPress={() => setSheet('rosary')}
          testID="settings-rosary"
        />

        {/* ── 켬/끔 셋 ────────────────────────────────────────────────────── */}
        <ToggleRow
          palette={palette}
          isKorean={settings.language === 'ko'}
          strings={strings}
          label={strings.handsFree}
          on={settings.handsFree}
          onPress={() => updateSettings({ handsFree: !settings.handsFree })}
          testID="settings-handsfree"
        />
        {settings.handsFree ? (
          <Text style={styles.note} testID="settings-handsfree-note">
            {strings.handsFreeNote}
          </Text>
        ) : null}
        {/*
          이 줄만 문구를 i18n 표에서 가져오지 않았다. 시안의 표는 이 항목을 `햅틱` 이라
          적는데(기계로 옮긴 값이라 고치지 않는다), 작업 지시서가 이 줄의 이름을 `진동`
          으로 정했고 우리말로도 그쪽이 읽힌다. 영어 문구가 필요해지면 표에 따로 더한다.
        */}
        <ToggleRow
          palette={palette}
          isKorean={settings.language === 'ko'}
          strings={strings}
          label={strings.vibration}
          on={settings.haptic}
          onPress={() => updateSettings({ haptic: !settings.haptic })}
          testID="settings-haptic"
        />
        <ToggleRow
          palette={palette}
          isKorean={settings.language === 'ko'}
          strings={strings}
          label={strings.reduceMotion}
          on={settings.reduceMotion}
          onPress={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
          testID="settings-reduce-motion"
        />

        {/* ── 완주 기록 (시안의 `history` 줄) ─────────────────────────────── */}
        <View style={styles.countRow}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{strings.history}</Text>
            <Text style={styles.rowNote}>
              {prayedDays > 0
                ? fill(strings.historySome, { n: prayedDays })
                : strings.historyNone}
            </Text>
          </View>
          <Text style={styles.count} testID="settings-history-count">
            {prayedDays}
          </Text>
        </View>

        {/*
          ── 기록 내보내기·들여오기 (W3 슬라이스 C · W4 슬라이스 D) ──────────
          완주 기록 바로 아래에 둔다. 셋 다 "내 기록" 을 다루는 줄이라 한자리에 모이는 것이
          읽기 쉽고, 소개는 앱에 대한 줄이므로 맨 아래에 그대로 남는다.

          `backupFileSupported` 는 이제 표면 셋에서 모두 참이다(W4 슬라이스 D). 그래도 이
          가름을 **지우지 않고 남겨 둔다** — 넷째 표면이 생겼을 때 아무도 재 보지 않은 채
          줄이 서는 일을 막는 자리이기 때문이다. 까닭은 이 파일과
          `src/storage/backupFile.ts` 의 머리글에 있다.
        */}
        {backupFileSupported ? (
          <>
            <Pressable
              style={styles.countRow}
              onPress={() => {
                void exportRecords();
              }}
              accessibilityRole="button"
              testID="settings-export"
            >
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{strings.exportRecords}</Text>
                <Text style={styles.rowNote}>
                  {fill(strings.exportNote, { n: journeys.length })}
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.countRow}
              onPress={() => {
                void importRecords();
              }}
              accessibilityRole="button"
              testID="settings-import"
            >
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{strings.importRecords}</Text>
                <Text style={styles.rowNote}>{strings.importNote}</Text>
              </View>
            </Pressable>
            {notice ? (
              <Text style={styles.note} testID="settings-backup-notice">
                {notice}
              </Text>
            ) : null}
          </>
        ) : null}

        {/*
          ── 홈 화면에 추가 (W4 슬라이스 A) ──────────────────────────────────
          시안은 이 줄을 완주 기록 **바로 다음**에 두고, 아래 작은 글로 `오프라인 사용 가능`
          을 적고, 오른쪽에 단추 하나를 세운다. 이 화면에서는 완주 기록과 이 줄 사이에 기록
          내보내기·들여오기 두 줄이 끼어 있는데, 그 둘은 완주 기록과 같은 "내 기록" 묶음이라
          떼어 놓으면 오히려 읽기 어렵다. 그래서 **시안의 앞뒤 순서(기록 다음)는 지키되 그
          묶음 뒤로 물렸다.**

          오른쪽 단추를 따로 세우지 않고 **줄 전체를 누르게 했다.** 이 화면의 다른 줄들
          (지역·언어 · 소개 · 기록 두 줄)이 모두 그렇고, 한 화면 안에서 어떤 줄은 줄이
          눌리고 어떤 줄은 줄 안의 단추만 눌리면 손이 어디를 눌러야 할지 매번 다시 재야 한다.
        */}
        {installRowSupported ? (
          <Pressable
            style={styles.countRow}
            onPress={() => {
              void addToHomeScreen();
            }}
            accessibilityRole="button"
            testID="settings-install"
          >
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{strings.install}</Text>
              <Text style={styles.rowNote} testID="settings-install-note">
                {install.installed
                  ? strings.installedAlready
                  : install.canPrompt
                    ? `${strings.offline} · ${strings.installTapToAdd}`
                    : `${strings.offline} · ${strings.installShowHow}`}
              </Text>
            </View>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="m9 18 6-6-6-6"
                stroke={palette.ink}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Pressable>
        ) : null}

        {/* ── 소개 ────────────────────────────────────────────────────────── */}
        <Pressable
          style={styles.linkRow}
          onPress={() => setSheet('about')}
          accessibilityRole="button"
          testID="settings-about"
        >
          <Text style={styles.rowLabel}>{strings.about}</Text>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d="m9 18 6-6-6-6"
              stroke={palette.ink}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Pressable>
      </ScrollView>

      {/* 낭송 방식 — 이름과 설명은 06-screen-spec 화면 E 의 문구 표 그대로다. */}
      <ChoiceSheet
        visible={sheet === 'recitation'}
        label={strings.recitationLabel}
        choices={recitationChoices}
        selected={settings.recitation}
        note={strings.applyToNew}
        onSelect={(key: RecitationMode) => {
          updateSettings({ recitation: key });
          close();
        }}
        onClose={close}
        testID="sheet-recitation"
      />

      {/* S2 받는 사이 */}
      <ChoiceSheet
        visible={sheet === 'pace'}
        label={strings.paceLabel}
        choices={paceChoices}
        selected={settings.pace}
        onSelect={(key: PaceKey) => {
          updateSettings({ pace: key });
          close();
        }}
        onClose={close}
        testID="sheet-pace"
      />

      {/*
        S5 묵주 고르기. 다른 시트와 달리 전용 시트를 쓰는 이유는 **고른 묵주를 눈으로
        보여 줘야** 하기 때문이다 (`src/prayer/RosarySheet.tsx` 의 머리글).
      */}
      <RosarySheet
        visible={sheet === 'rosary'}
        selected={settings.rosary}
        note={strings.applyToAll}
        onSelect={(key) => {
          updateSettings({ rosary: key });
          close();
        }}
        onClose={close}
        testID="sheet-rosary"
      />

      {/*
        S7 소개 — 08 검증 참가자에게 이 빌드가 무엇을 묻는지 알린다.

        **W4 슬라이스 C 에서 글과 모양이 부품으로 떠났다**(`src/ui/AboutSheet.tsx`). 같은 글이
        이제 두 자리에서 뜨기 때문이다 — 이 줄과, 앱을 처음 여는 자리. 한쪽만 고치면 두 말이
        갈리므로 한 곳에 두고 둘이 함께 부른다. 이 줄이 여는 것은 `firstRun` 이 아닌 쪽이라
        맨 아래 `시작하기` 단추가 서지 않는다 — 이 자리에서는 이미 앱을 쓰고 있다.

        그전 판에서 이 시트의 글자색이 W2 슬라이스 C 에 고쳐진 일이 있었다(밤 벌에서 밝은
        종이 위에 밝은 글자가 얹혀 읽히지 않았다). 그 고침은 부품으로 그대로 옮겨 갔다.
      */}
      <AboutSheet visible={sheet === 'about'} onClose={close} testID="sheet-about" />

      {/*
        홈 화면에 추가 — 방법을 알려 주는 시트 (W4 슬라이스 A).

        이 시트는 브라우저가 설치 창을 내주지 않을 때만 열린다. 내주는 곳에서는 줄을 누른
        자리에서 진짜 설치 창이 뜨므로 이 시트를 볼 일이 없다.

        **아래 두 번째 문단이 작업 지시서가 요구한 "오프라인에서 무엇이 되고 무엇이 안
        되는지" 한 줄이다.** 되는 것만 적고 마는 것은 정직하지 않아, 되지 않는 둘(아직 한 번도
        보지 않은 성화 · 기기에 목소리가 없을 때의 소리 내어 읽기)을 함께 적었다.

        글은 한국어로만 적혀 있다. 이 화면의 다른 줄들(낭송 방식 · 받는 사이 · 기록 두 줄)이
        이미 그러하며, 언어 표에 문구를 더하는 일은 언어를 둘로 좁히는 **슬라이스 B** 의 몫이다.
      */}
      <BottomSheet
        visible={sheet === 'install'}
        label={strings.install}
        onClose={close}
        testID="sheet-install"
      >
        <Text style={styles.aboutTitle}>
          {install.guide === 'ios' ? strings.installIosTitle : strings.installBrowserTitle}
        </Text>
        <Text style={styles.aboutBody}>
          {install.guide === 'ios' ? strings.installIosBody : strings.installBrowserBody}
        </Text>
        <Text style={styles.aboutTitle}>{strings.installAfterTitle}</Text>
        <Text style={styles.aboutBody}>{strings.installAfterBody}</Text>
      </BottomSheet>

      {/*
        기록 들여오기 확인 (W3 슬라이스 C · FR-18 의 정신).

        문구가 **수 둘**을 함께 말한다 — 잃는 여정의 수와 들어올 여정의 수다. 시안에는 이
        시트가 없고 이 저장소가 세운 관문이므로, "정말 하시겠습니까" 로 묻는 대신 사람이
        판단할 재료를 준다. `그대로 두기` 가 취소인 것도 같은 까닭이다: `취소` 는 무엇이
        취소되는지 말하지 않지만 `그대로 두기` 는 누르면 무엇이 남는지 말한다.
      */}
      <ConfirmSheet
        visible={pending !== null}
        label={strings.importRecords}
        message={fill(strings.importConfirm, {
          a: journeys.length,
          b: pending?.journeys.length ?? 0,
        })}
        confirmLabel={strings.importConfirmYes}
        cancelLabel={strings.importConfirmNo}
        onConfirm={applyImport}
        onClose={() => setPending(null)}
        testID="sheet-import"
      />

      <WorldTabBar current="settings" />
    </View>
  );
}

/**
 * 값이 오른쪽에 적히는 줄 — 눌러 시트를 연다 (낭송 방식 · 받는 사이 · 묵주).
 *
 * 시안에는 이 모양의 줄이 없다. 시안의 설정 항목은 전부 켬/끔 토글이라 값을 적을 자리가
 * 없었기 때문이다. 그래서 **시안의 토글 줄에서 오른쪽 토글만 값 글자로 바꾼 것**이며,
 * 높이(56) · 위아래 여백(14) · 아래 괘선은 그 토글 줄과 같다.
 */
function ValueRow({
  palette,
  isKorean,
  label,
  value,
  onPress,
  testID,
}: {
  palette: WorldPalette;
  isKorean: boolean;
  label: string;
  value: string;
  onPress: () => void;
  testID: string;
}) {
  const styles = settingsStyles(palette, isKorean);
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button" testID={testID}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} testID={`${testID}-value`}>
        {value}
      </Text>
    </Pressable>
  );
}

/**
 * 켬/끔 줄 — 시안의 토글 그대로다 (44×26, 반지름 13, 손잡이 18, 200ms).
 *
 * **켠 토글의 바탕은 `accent` 를 그대로 쓴다.** 그 면은 글자가 아니라 색칠한 자리이기
 * 때문이다 (`decisions.md` Q-51 이 가른 기준). 손잡이는 종이색이라 켠 상태에서 강조색
 * 위에 종이색 점이 서고, 끈 상태에서는 흐린 테 안에 흐린 점이 선다.
 */
function ToggleRow({
  palette,
  isKorean,
  strings,
  label,
  on,
  onPress,
  testID,
}: {
  palette: WorldPalette;
  isKorean: boolean;
  strings: Strings;
  label: string;
  on: boolean;
  onPress: () => void;
  testID: string;
}) {
  const styles = settingsStyles(palette, isKorean);
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="switch"
      /* `aria-checked` 를 쓰는 까닭은 위 글자 크기 고르개의 주석과 같다. */
      aria-checked={on}
      testID={testID}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View
        style={[styles.track, on ? styles.trackOn : null]}
        testID={`${testID}-value`}
        accessibilityLabel={on ? strings.switchOn : strings.switchOff}
      >
        <View style={[styles.knob, on ? styles.knobOn : null]} />
      </View>
    </Pressable>
  );
}

/**
 * 크기와 간격은 시안의 `Settings` 마크업에서 그대로 옮겼다 — 좌우 24, 줄의 위아래 14~16,
 * 줄 높이 56, 아래 괘선 1px, 토글 44×26.
 *
 * 색은 지역의 색 벌에서만 온다. 글자에 쓰는 강조는 `accentText`, 테두리와 채운 면에 쓰는
 * 강조는 `accent` 다 (`decisions.md` Q-51).
 */
const settingsStyles = (palette: WorldPalette, isKorean: boolean) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.paper },
    scroll: { flex: 1 },
    scrollInner: { flexGrow: 1, paddingHorizontal: 24 },
    brand: { ...worldSettingsType.brand, color: palette.accentText, textTransform: 'uppercase' },
    title: {
      fontFamily: worldFontStack('heading', isKorean),
      color: palette.ink,
      marginTop: 6,
      marginBottom: 10,
      ...koWordBreak,
    },

    /* 줄 셋의 모양 — 값이 붙는 줄 · 토글 줄 · 화살표가 붙는 줄. */
    row: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: RULE,
    },
    linkRow: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: RULE,
      borderBottomWidth: 1,
      borderBottomColor: RULE,
    },
    countRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: RULE,
    },
    block: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: RULE, gap: 10 },

    rowText: { flex: 1, minWidth: 0 },
    rowLabel: { ...worldSettingsType.rowLabel, color: palette.ink, ...koWordBreak },
    rowNote: { ...worldSettingsType.rowNote, color: palette.muted, marginTop: 2, ...koWordBreak },
    rowValue: { ...worldSettingsType.rowValue, color: palette.accentText, textAlign: 'right' },
    count: { ...worldSettingsType.count, color: palette.accentText },
    note: { ...worldSettingsType.rowNote, color: palette.muted, paddingTop: 10, ...koWordBreak },

    /* 글자 크기 고르개 — 「Classical」 의 `.seg` (테 1px, 모서리 4, 칸 사이 세로선). */
    seg: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: RULE,
      borderRadius: worldRadius.md,
      overflow: 'hidden',
    },
    /*
      좌우 여백 4 는 두 줄이 된 이름이 칸 사이 선에 닿지 않게 하는 자리다 (W4 슬라이스 B).
    */
    segOption: {
      flex: 1,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    segDivider: { borderLeftWidth: 1, borderLeftColor: RULE },
    /* 고른 칸은 강조색 테 하나로만 표시한다 (「Classical」 의 `inset 0 0 0 1px`). */
    segOn: { borderWidth: 1, borderColor: palette.accent },
    /*
      `koWordBreak` 를 펴 넣는 자리다. 좁은 기기(320)에서는 넉 칸이 `아주 크게` 를 한 줄에
      담지 못하는데, 그냥 두면 브라우저가 한국어를 글자 단위로 끊어 `아주 크 / 게` 가 된다.
      이 값이 있으면 띄어쓰기에서만 끊겨 `아주 / 크게` 가 된다 — 줄이 하나 늘 뿐 낱말은 산다.
    */
    segLabel: {
      fontFamily: worldFontStack('body', isKorean),
      color: palette.ink,
      // 두 줄이 되면 줄끼리 가운데로 맞춘다. 한 줄일 때는 아무 차이가 없다.
      textAlign: 'center',
      ...koWordBreak,
    },
    segLabelOn: { color: palette.accentText },

    /* 토글 — 시안의 44×26. 켠 바탕은 글자가 아니므로 `accent` 를 그대로 쓴다. */
    track: {
      width: 44,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: RULE,
      backgroundColor: 'transparent',
      justifyContent: 'center',
    },
    trackOn: { borderColor: palette.accent, backgroundColor: palette.accent },
    knob: {
      position: 'absolute',
      top: 3,
      left: 3,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: palette.muted,
    },
    knobOn: { left: 23, backgroundColor: palette.paper },

    aboutTitle: { ...worldSettingsType.rowLabel, color: palette.ink, marginBottom: 10 },
    aboutBody: { ...worldSettingsType.rowNote, color: palette.muted, marginBottom: 22 },
  });
