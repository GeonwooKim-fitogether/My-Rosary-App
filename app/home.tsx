/**
 * A 홈 — 「MyRosary World」 시안의 `data-screen-label="Home"` 블록을 옮긴 화면 (W2 슬라이스 A).
 *
 * 값(색·크기·간격·문구)은 그 블록에서 그대로 가져왔고, 색은 지역 다섯의 색 벌
 * (`src/theme/worldTokens.ts`)에서 이름으로 고른다. 화면이 스스로 정하는 색은 없다.
 *
 * ── 이 화면이 2026-09-18 에 어떻게 달라졌나 ─────────────────────────────────────
 *
 * 그전까지 홈은 v5 시안의 **여정 목록**이었다. 머리(`내 기도 · 하나`)와 `설정` 글자 아래로
 * 큰 카드가 쌓였고, 카드마다 성화 썸네일 · 바람 · 며칠째 · 오늘 자리 · 54칸 리본 · 시작일과
 * 마치는 날이 들어 있었다. 새 시안은 같은 화면을 **오늘 하루를 여는 문**으로 다시 그렸다.
 *
 * | 무엇 | 옛 화면 (v5) | 이 화면 (World) |
 * |---|---|---|
 * | 맨 위 | 자간 넓은 라벨과 `설정` 글자 | 화면의 절반을 채우는 성화, 아래로 종이색에 녹아든다 |
 * | 무엇이 먼저 오나 | 여정 카드 목록 | **오늘의 신비**(큰 제목)와 기도를 여는 주 단추 |
 * | 여정 | 카드 — 썸네일·리본·날짜가 딸린 큰 덩어리 | 줄 — 바람 한 줄, 상태, 오른쪽에 며칠째 |
 * | 설정으로 가는 길 | 머리 오른쪽의 `설정` 글자 | **아래 탭 바**(`src/ui/WorldTabBar.tsx`) |
 *
 * ── 시안과 다르게 한 자리 여섯 (그리고 그 이유) ──────────────────────────────────
 *
 * 1. **`다시 바치기` 가 곧바로 지우지 않고 한 번 묻는다** — 시안의 결함 10 번을 고친 자리다.
 *    시안은 확인 없이 오늘 바치던 자리를 지운다. 자리를 지우는 조작에는 확인을 둔다는 것이
 *    이 저장소의 규칙이고(FR-18), 같은 일을 하는 여정 상세는 이미 묻는다.
 *    시트는 `src/ui/RestartTodaySheet.tsx` 에 있다.
 * 2. **끝난 여정도 목록에 남는다** — 시안은 진행 중인 여정만 추린다(`filter(x => x.i.active)`).
 *    이 앱에서 여정의 끝은 완주이지 사라짐이 아니므로, 끝난 것은 목록 **아래로 내리되**
 *    `54일 중 21일을 바쳤습니다` 처럼 결과를 말하게 둔다.
 * 3. **줄을 누르는 곳이 둘이다** — 왼쪽(바람)을 누르면 그 여정의 기도로 들어가고(FR-42),
 *    오른쪽(며칠째)을 누르면 여정 상세로 간다(FR-37). 시안의 줄은 누르는 곳이 하나인데,
 *    이 앱은 두 곳으로 가는 길이 모두 필요하다. 길게 누르면 지우는 확인 시트가 뜬다(FR-05).
 * 4. **`새 기도` 단추가 더 있다** — 시안의 홈에는 여정을 새로 만드는 자리가 아예 없다(계정도
 *    여정도 없는 시안이기 때문이다). 이 앱에서 그것을 빼면 **여정을 시작할 길이 없어진다.**
 *    그래서 주 단추 아래에 테두리 단추 하나로 두었다. 화면 맨 아래에 함께 있던
 *    `초대 코드로 들어가기` 한 줄은 슬라이스 C 에서 **뺐다**(`decisions.md` Q-59) — 조 기도가
 *    V1.5 로 밀려 그 줄이 여는 화면에 답해 줄 서버가 없기 때문이다. 자세한 사정은 그 줄이
 *    있던 자리(아래 4층 끝)의 주석에 적어 두었다.
 * 5. **`오늘의 신비 보기` 링크의 글자가 시안과 다르다** — 시안은 이 자리에 `신비 해설 →`
 *    이라 적어 놓고 누르면 **오늘의 신비** 화면으로 보낸다(`goMystery`). 이름과 목적지가
 *    어긋난 자리이고, 시안의 해설 화면은 그 때문에 어느 곳에서도 닿지 않는다. 이 저장소는
 *    둘을 갈랐다 — 이 링크는 가는 곳의 이름대로 `오늘의 신비 보기` 이고(`app/mystery.tsx`),
 *    해설 화면으로 가는 길은 그 화면 안에 둔다(`app/guide.tsx`).
 *    슬라이스 A 에서 비워 두었던 자리가 슬라이스 B 에서 이렇게 채워졌다.
 * 6. **오른쪽 위의 지역 표시에 테두리와 지구본이 없다** — 시안은 그 자리를 테두리 두른 작은
 *    단추로 그리는데, 이 화면은 글자만 둔다. 슬라이스 A 때는 갈 곳(지역·언어 화면)이 아직
 *    없어 "눌리지 않는 것이 단추처럼 보이면 고장으로 읽힌다"는 이유였고, 슬라이스 C 에서
 *    **목적지가 생겨 실제로 눌리게 됐다.** 모양을 글자로 둔 것은 성화 위의 얇은 글자가 시안의
 *    인상에 더 가깝고 이 화면의 다른 링크들도 테두리가 없기 때문이다. 성화를 전체 화면으로
 *    여는 단추는 여전히 놓지 않았다(그 화면은 W3 이다).
 */
import { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { artSession } from '../src/art';
import { MYSTERY_SETS, mysteryForWeekday } from '../src/domain/mysteries';
import { stringsFor } from '../src/i18n';
import { cardStatus, resumeLine, type CardStatus } from '../src/journey/card';
import { relativeTimeKo } from '../src/journey/format';
import { dayIndexOn, dayLabelOn, journeyLength, notStartedLabel } from '../src/journey/rules';
import { mysteryOf, type Journey } from '../src/journey/session';
import { todayLabelKo } from '../src/mystery/text';
import { primeSpeech } from '../src/prayer/channels';
import { buildDayQueue } from '../src/prayer/steps';
import { useAppState } from '../src/state/useAppState';
import { positionStore } from '../src/storage/asyncStore';
import type { PrayerPosition } from '../src/storage/position';
import { fonts } from '../src/theme';
import { TEXT_SCALE } from '../src/theme/fontScale';
import {
  homeArtHeightFor,
  homeTitleSizeFor,
  paletteFor,
  worldHomeType,
  worldRadius,
  type WorldPalette,
} from '../src/theme/worldTokens';
import { RemoveJourneySheet } from '../src/ui/RemoveJourneySheet';
import { RestartTodaySheet } from '../src/ui/RestartTodaySheet';
import { TAB_BAR_HEIGHT, WorldTabBar } from '../src/ui/WorldTabBar';

/** 성화 위에 얹는 글자의 색. 시안의 `color:#f6efe2`. */
const ON_ART_INK = '#f6efe2';

export default function HomeScreen() {
  const { ready, journeys, settings } = useAppState();
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const palette = paletteFor(settings.region);
  const strings = stringsFor(settings.language);
  const styles = homeStyles(palette);

  const [position, setPosition] = useState<PrayerPosition | null>(null);
  /** 길게 눌러 지우려는 여정. null 이면 시트가 닫혀 있다 (FR-05). */
  const [removing, setRemoving] = useState<Journey | null>(null);
  /** `다시 바치기` 확인 시트가 떠 있나 (시안 결함 10). */
  const [restarting, setRestarting] = useState(false);
  const today = new Date();

  // 화면으로 돌아올 때마다 오늘 자리를 다시 읽는다. 기도하다 나온 직후의 홈이
  // "어디까지 왔나"를 곧바로 말해야 하기 때문이다.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void positionStore.load().then((saved) => {
        if (alive) setPosition(saved);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  // 끝난 여정은 목록 아래로 내린다 (06-screen-spec: "마친 카드는 목록 아래").
  const ordered = [...journeys].sort((a, b) => {
    const rank = (j: Journey) => (cardStatus(j, today, position) === 'ended' ? 1 : 0);
    return rank(a) - rank(b);
  });

  /**
   * 주 단추가 여는 여정 — 오늘 바칠 수 있는 첫 번째 것.
   *
   * 시안은 여정이 없는 앱이라 주 단추가 언제나 "오늘의 기도"를 연다. 이 앱에서 기도는
   * 언제나 어떤 여정의 하루이므로, 아직 시작 전인 것과 이미 끝난 것을 빼고 첫 번째를 고른다.
   * 고를 것이 없으면(여정이 없거나 전부 끝났으면) 주 단추 자리에 `새 기도` 만 선다.
   */
  const openable = ordered.find((journey) => {
    const status = cardStatus(journey, today, position);
    return status !== 'notStarted' && status !== 'ended';
  });
  const openableStatus = openable ? cardStatus(openable, today, position) : null;
  const resuming = openableStatus === 'resume' && position !== null;

  /** 오늘의 신비. 여는 여정이 있으면 그 여정의 규칙을, 없으면 요일 규칙을 따른다 (FR-43). */
  const todaySet = openable ? mysteryOf(openable, today) : mysteryForWeekday(today.getDay());

  /** 성화. 여는 여정이 있으면 그 여정의 그림을 써서 홈과 기도 배경이 같은 그림으로 이어진다. */
  const plate = openable
    ? artSession.forJourney(openable.id)
    : artSession.forKey('screen:home', ['login']);

  const artHeight = homeArtHeightFor(window.height);
  const titleFontSize = homeTitleSizeFor(window.width) * TEXT_SCALE.font;

  /** 기도로 들어간다. 누른 자리에서 소리 엔진을 깨우는 것은 v5 부터의 배선 그대로다. */
  const openPrayer = (id: string) => {
    primeSpeech();
    router.push({ pathname: '/pray', params: { id } });
  };

  return (
    <View style={styles.screen} testID="home-screen">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: TAB_BAR_HEIGHT + 16 }]}
      >
        {/* ── 1층 · 성화 큰 그림 ───────────────────────────────────────────── */}
        <View style={[styles.art, { height: artHeight }]}>
          {plate ? (
            <Image
              source={plate.source}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              contentPosition={{ left: plate.focus.login.x, top: plate.focus.login.y }}
              accessible={false}
            />
          ) : null}
          {/*
            덮개 둘을 겹친다. 시안은 하나의 `linear-gradient` 로 검정에서 종이색까지 잇지만,
            SVG 의 그러데이션은 서로 다른 두 색 사이를 지날 때 잿빛 안개를 만든다. 그래서
            위(검정이 옅어지는 쪽)와 아래(종이색이 짙어지는 쪽)를 따로 그려 같은 결과를 낸다.
          */}
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
            <Defs>
              <LinearGradient id="homeTop" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000000" stopOpacity={0.34} />
                <Stop offset="0.28" stopColor="#000000" stopOpacity={0} />
              </LinearGradient>
              <LinearGradient id="homeBottom" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0.56" stopColor={palette.paper} stopOpacity={0} />
                <Stop offset="0.82" stopColor={palette.paper} stopOpacity={0.75} />
                <Stop offset="0.96" stopColor={palette.paper} stopOpacity={1} />
                <Stop offset="1" stopColor={palette.paper} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#homeTop)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#homeBottom)" />
          </Svg>

          {/*
            머리 두 조각. 왼쪽 앱 이름은 글자일 뿐이고, **오른쪽 지역 표시는 단추다** —
            누르면 지역·언어 화면으로 간다 (W2 슬라이스 C). 슬라이스 A 때는 그 화면이
            아직 없어 글자로만 두었고, 그때 테두리와 지구본을 뺀 것도 눌리지 않는 것이
            단추처럼 보이면 고장으로 읽히기 때문이었다. 이제 목적지가 생겼으므로 누를 수
            있게 하되, 모양은 시안의 테두리 단추 대신 지금의 글자를 그대로 둔다 —
            성화 위의 얇은 글자가 시안의 인상에 더 가깝고, 이 화면의 다른 자리들도
            테두리 없는 글자 링크를 쓰기 때문이다.

            `pointerEvents="none"` 를 칸 전체가 아니라 앱 이름 쪽에만 두는 까닭도 적어
            둔다. 칸에 두면 그 안의 단추까지 눌리지 않고, 빼 버리면 글자뿐인 왼쪽이
            성화를 덮어 아래로 미는 손짓을 가로챈다.
          */}
          <View style={[styles.artHeader, { paddingTop: insets.top + 14 }]}>
            <Text style={styles.brand} pointerEvents="none">
              {strings.appName}
            </Text>
            <Pressable
              onPress={() => router.push('/region')}
              accessibilityRole="button"
              hitSlop={10}
              testID="home-region"
            >
              <Text style={styles.region}>
                {`${settings.language.toUpperCase()} · ${strings[settings.region]}`}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.body}>
          {/*
            ── 2층 · 오늘의 신비 ──────────────────────────────────────────

            **저장된 것을 다 읽기 전까지는 그리지 않는다(`ready`).** 이 세 줄은 화면에서
            유일하게 "지금이 언제인가"에 따라 글이 달라지는 자리인데, 설치형 웹앱은 화면을
            **만들 때 미리 그려 둔 HTML** 로 먼저 뜨고 그 위에 앱이 얹힌다. 미리 그려 둔 글은
            빌드한 날의 날짜와 신비이므로, 앱이 오늘 날짜로 다시 그리면 두 글이 어긋나고
            브라우저 콘솔에 맞춤 실패(React #418)가 찍힌다 — 실제로 2026-09-18 에 e2e 셋이
            그 오류로 걸렸다. `ready` 가 false 인 동안은 양쪽 모두 이 블록을 그리지 않으므로
            어긋날 글 자체가 없고, 읽기가 끝난 뒤 한 번에 채워진다.
          */}
          {ready ? (
            <View style={styles.todayBlock}>
              <Text style={styles.todayLabel} testID="home-today-label">
                {`${strings.today} · ${todayLabelKo(today)}`}
              </Text>
              <Text
                style={[
                  styles.todayTitle,
                  { fontSize: titleFontSize, lineHeight: titleFontSize * 1.05 },
                ]}
                testID="home-today-set"
              >
                {MYSTERY_SETS[todaySet].name}
              </Text>
              <Text style={styles.todayFirst} testID="home-today-first">
                {MYSTERY_SETS[todaySet].decades[0]}
              </Text>
              {/*
                오늘 바칠 다섯 단을 다 펼쳐 보는 자리로 간다 (W2 슬라이스 B).
                값(13px · 자간 .04em · 밑줄 · 최소 높이 44)은 시안의 같은 자리에서 왔고,
                글자만 가는 곳의 이름으로 바꿨다 — 까닭은 이 파일 머리의 5 번에 있다.
              */}
              <Pressable
                style={styles.todayLink}
                onPress={() => router.push('/mystery')}
                accessibilityRole="button"
                testID="home-today-link"
              >
                <Text style={styles.todayLinkLabel}>오늘의 신비 보기 →</Text>
              </Pressable>
            </View>
          ) : null}

          {/* ── 3층 · 주 단추와 진행선 ───────────────────────────────────── */}
          <View style={styles.actions}>
            {openable ? (
              <Pressable
                style={styles.primary}
                onPress={() => openPrayer(openable.id)}
                accessibilityRole="button"
                testID="home-primary"
              >
                <Text style={styles.primaryLabel}>
                  {resuming ? strings.resume : strings.start}
                </Text>
              </Pressable>
            ) : null}

            {resuming && openable && position ? (
              <SessionRow
                palette={palette}
                position={position}
                againLabel={strings.again}
                onAgain={() => setRestarting(true)}
              />
            ) : null}

            {/*
              `새 기도` 는 여는 여정이 있을 때는 둘째 단추이고, 없을 때는 **화면에 하나뿐인
              단추**다. 하나뿐일 때까지 흐린 테두리로 두면 화면이 아무것도 권하지 않는 것처럼
              보이므로, 그때는 주 단추의 모양을 입는다.
            */}
            <Pressable
              style={openable ? styles.secondary : styles.primary}
              onPress={() => router.push('/new')}
              accessibilityRole="button"
              testID="home-new"
            >
              <Text style={openable ? styles.secondaryLabel : styles.primaryLabel}>새 기도</Text>
            </Pressable>
          </View>

          {/* ── 4층 · 여정 목록 ─────────────────────────────────────────── */}
          {ready && journeys.length === 0 ? (
            <View style={styles.empty} testID="home-empty">
              <Text style={styles.emptyTitle}>아직 바치는 기도가 없습니다.</Text>
              <Text style={styles.emptyNote}>
                바람 하나를 적고 시작해 보세요. 54일이든 하루든, 끊겨도 그 자리가 남습니다.
              </Text>
            </View>
          ) : null}

          {journeys.length > 0 ? (
            <View style={styles.list}>
              <Text style={styles.listLabel}>{strings.journeys}</Text>
              {ordered.map((journey, index) => (
                <JourneyRow
                  key={journey.id}
                  palette={palette}
                  journey={journey}
                  today={today}
                  position={position}
                  index={index}
                  onOpen={() => openPrayer(journey.id)}
                  onLongPress={() => setRemoving(journey)}
                />
              ))}
            </View>
          ) : null}

          {/*
            **여기 있던 `초대 코드로 들어가기` 줄을 뺐다** (`decisions.md` Q-59 ·
            결정 12-2 카드 A). 조 기도와 초대 코드가 V1.5 로 밀리면서 그 코드를 확인해 줄
            서버가 V1 에 없고, 그래서 그 줄은 언제 눌러도 "찾지 못했습니다"만 답한다.
            카드 A 가 적어 둔 그대로 **화면과 코드는 지우지 않고 진입점만 끊었다** —
            초대 코드 화면(`app/invite.tsx`)은 그 자리에 그대로 있으므로, 되살릴 때
            이 자리에 줄 하나를 다시 놓으면 된다. 끊긴 상태를 `e2e/settings.spec.ts` 의
            시험 하나가 붙들고 있어, 실수로 다시 이어지면 그 시험이 먼저 알려 준다.
          */}
        </View>
      </ScrollView>

      <WorldTabBar current="home" />

      {/* 시안 결함 10 — `다시 바치기` 는 묻고 나서 지운다. */}
      <RestartTodaySheet
        visible={restarting}
        onConfirm={() => {
          setRestarting(false);
          if (!openable) return;
          primeSpeech();
          void positionStore.clear().then(() => {
            setPosition(null);
            router.push({ pathname: '/pray', params: { id: openable.id } });
          });
        }}
        onClose={() => setRestarting(false)}
      />

      {/* S6 — 줄을 길게 누르면 뜨는 확인 시트. 여정 상세의 `이 여정 그만두기` 와 같은 것이다. */}
      <RemoveJourneySheet
        journeyId={removing?.id ?? null}
        onRemoved={() => setRemoving(null)}
        onClose={() => setRemoving(null)}
      />
    </View>
  );
}

/**
 * 진행선 한 줄 — 시안의 `hasSession` 블록.
 *
 * 왼쪽에 가는 선이 눕고 그 위로 바친 만큼이 강조색으로 덮인다. 오른쪽에 멈춘 자리와
 * `다시 바치기` 가 선다. **선은 글자가 아니므로 시안의 `accent` 를 그대로 쓴다**
 * (`decisions.md` Q-51 이 가른 기준이 바로 그것이다).
 */
function SessionRow({
  palette,
  position,
  againLabel,
  onAgain,
}: {
  palette: WorldPalette;
  position: PrayerPosition;
  againLabel: string;
  onAgain: () => void;
}) {
  const styles = homeStyles(palette);
  const queue = buildDayQueue(position.mystery);
  const stepName = queue[position.stepIndex]?.label.split(' · ')[1];
  // 시안의 `Math.round(sess.step / 80 * 100)` — 마지막 단계가 100% 가 되도록 나눈다.
  const percent = Math.max(
    0,
    Math.min(100, Math.round((position.stepIndex / Math.max(1, queue.length - 1)) * 100)),
  );

  return (
    <View style={styles.sessionRow}>
      <View style={styles.sessionTrack}>
        <View style={[styles.sessionFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.sessionWhere} numberOfLines={1} testID="home-session-where">
        {resumeLine(position, stepName)}
      </Text>
      <Pressable onPress={onAgain} accessibilityRole="button" testID="home-again" hitSlop={10}>
        <Text style={styles.sessionAgain}>{againLabel}</Text>
      </Pressable>
    </View>
  );
}

/**
 * 여정 한 줄 — 시안의 `homeJourneys` 줄.
 *
 * 왼쪽에 바람과 상태, 오른쪽에 며칠째. 이름표 넷(`home-card-*` · `home-ribbon-*`)은 옛
 * 카드에서 그대로 물려받았다. 카드가 줄이 되면서 모양은 바뀌었지만 **그 이름표들이 가리키던
 * 것과 말하던 글은 한 글자도 바뀌지 않았다** — 바람은 `home-card-title-*`, 오늘 자리는
 * `home-card-status-*`, 며칠째는 `home-card-meta-*` 다.
 *
 * `home-ribbon-*` 만 가리키는 것이 달라졌다. 옛 카드에서는 54칸 리본이었고 지금은 며칠째를
 * 감싼 누르는 자리인데, **하는 일(여정 상세로 간다)은 같다.** 새 시안의 줄에는 리본이 없고,
 * 여정 상세로 가는 길은 아래 탭 바에도 따로 났다.
 */
function JourneyRow({
  palette,
  journey,
  today,
  position,
  index,
  onOpen,
  onLongPress,
}: {
  palette: WorldPalette;
  journey: Journey;
  today: Date;
  position: PrayerPosition | null;
  index: number;
  onOpen: () => void;
  onLongPress: () => void;
}) {
  const styles = homeStyles(palette);
  const status = cardStatus(journey, today, position);
  const dayIndex = dayIndexOn(journey.startDate, today);

  const open = () => {
    if (status === 'notStarted') return;
    if (status === 'ended') {
      router.push({ pathname: '/journey', params: { id: journey.id } });
      return;
    }
    onOpen();
  };

  return (
    <View style={[styles.row, status === 'notStarted' ? styles.rowDim : null]}>
      <Pressable
        style={styles.rowMain}
        onPress={open}
        onLongPress={onLongPress}
        accessibilityRole="button"
        accessibilityHint="길게 누르면 이 기도를 지웁니다"
        testID={`home-card-${index}`}
      >
        <Text style={styles.rowTitle} numberOfLines={1} testID={`home-card-title-${index}`}>
          {journey.title}
        </Text>
        <RowStatus
          palette={palette}
          status={status}
          journey={journey}
          today={today}
          position={position}
          index={index}
        />
      </Pressable>

      <Pressable
        onPress={() => router.push({ pathname: '/journey', params: { id: journey.id } })}
        accessibilityRole="button"
        accessibilityLabel="여정 상세"
        testID={`home-ribbon-${index}`}
        style={styles.rowDayTap}
        hitSlop={8}
      >
        <Text style={styles.rowDay} testID={`home-card-meta-${index}`}>
          {status === 'notStarted' ? '시작 전' : dayLabelOn(journey, dayIndex)}
        </Text>
      </Pressable>
    </View>
  );
}

/** 줄의 둘째 줄 — 오늘 이 기도가 어디까지 왔나. 갈래와 글은 옛 카드의 것 그대로다. */
function RowStatus({
  palette,
  status,
  journey,
  today,
  position,
  index,
}: {
  palette: WorldPalette;
  status: CardStatus;
  journey: Journey;
  today: Date;
  position: PrayerPosition | null;
  index: number;
}) {
  const styles = homeStyles(palette);

  if (status === 'notStarted') {
    return <Text style={styles.rowState}>{notStartedLabel(journey, today)}</Text>;
  }
  if (status === 'ended') {
    const length = journeyLength(journey.format) ?? journey.days.length;
    const prayed = journey.days.filter((state) => state === 'prayed').length;
    return (
      <Text style={styles.rowState} testID={`home-card-status-${index}`}>
        {length}일 중 {prayed}일을 바쳤습니다
      </Text>
    );
  }
  if (status === 'prayedToday') {
    return (
      <Text style={styles.rowState} testID={`home-card-status-${index}`}>
        오늘 바쳤습니다
      </Text>
    );
  }
  if (status === 'resume' && position) {
    const step = buildDayQueue(position.mystery)[position.stepIndex];
    const name = step?.label.split(' · ')[1];
    return (
      <>
        <Text style={styles.rowState} testID={`home-card-status-${index}`}>
          {MYSTERY_SETS[position.mystery].name}
          {'\n'}
          {resumeLine(position, name)}
        </Text>
        <Text style={styles.rowWhen}>{relativeTimeKo(new Date(position.savedAt), today)}</Text>
      </>
    );
  }
  return (
    <Text style={styles.rowState} testID={`home-card-status-${index}`}>
      {MYSTERY_SETS[mysteryOf(journey, today)].name}
      {'\n'}
      아직
    </Text>
  );
}

/**
 * 크기와 간격은 시안의 홈 마크업에서 그대로 옮겼다 — 본문 좌우 여백 24, 위 16, 층 사이 18,
 * 주 단추 높이 56과 모서리 4, 여정 줄 높이 48과 아래 괘선 1px.
 *
 * 색은 지역의 색 벌에서만 온다. 글자에 쓰는 강조는 `accentText`, 선과 면에 쓰는 강조는
 * `accent` 다 (`decisions.md` Q-51).
 */
const homeStyles = (palette: WorldPalette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.paper },
    scroll: { flex: 1 },
    scrollInner: { flexGrow: 1 },
    art: { backgroundColor: palette.scrim, overflow: 'hidden' },
    artHeader: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    brand: { ...worldHomeType.brand, color: ON_ART_INK, textTransform: 'uppercase' },
    region: { ...worldHomeType.region, color: ON_ART_INK },
    body: { paddingHorizontal: 24, paddingTop: 16, gap: 18 },
    todayBlock: {},
    todayLabel: { ...worldHomeType.todayLabel, color: palette.accentText },
    todayTitle: {
      fontFamily: fonts.serif,
      color: palette.ink,
      marginTop: 8,
      marginBottom: 10,
      // 브라우저는 한국어를 글자 단위로 끊으므로 큰 제목이 낱말 가운데서 갈라진다.
      // iOS·안드로이드는 원래 띄어쓰기에서 끊으므로 웹에만 준다 (하루 완주 화면과 같다).
      ...Platform.select({ web: { wordBreak: 'keep-all' as const }, default: {} }),
    },
    todayFirst: { ...worldHomeType.todayFirst, color: palette.ink, opacity: 0.82 },
    todayLink: { marginTop: 8, minHeight: 44, justifyContent: 'center' },
    todayLinkLabel: {
      ...worldHomeType.todayLink,
      color: palette.accentText,
      textDecorationLine: 'underline',
    },
    actions: { gap: 10 },
    /*
      주 단추는 면을 채우지 않는다. 「Classical」 체계의 `.btn-primary` 가 **투명한 바탕에
      강조색 테두리와 강조색 글자**로 정의돼 있고(`_ds/…/styles.css` 129 행), 시안의 홈이
      그 class 를 그대로 쓴다. 테두리는 글자가 아니므로 시안의 `accent` 를, 글자는 밝은
      종이 위에 놓이므로 짙은 짝인 `accentText` 를 쓴다 (`decisions.md` Q-51).
    */
    primary: {
      minHeight: 56,
      borderRadius: worldRadius.md,
      borderWidth: 1,
      borderColor: palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryLabel: { ...worldHomeType.primary, color: palette.accentText },
    /* 둘째 단추는 같은 체계의 `.btn-secondary` — 테두리가 괘선 색이고 글자는 본문색이다. */
    secondary: {
      minHeight: 48,
      borderRadius: worldRadius.md,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,.14)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryLabel: { ...worldHomeType.secondary, color: palette.ink },
    sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sessionTrack: { flex: 1, height: 3, backgroundColor: 'rgba(0,0,0,.14)' },
    sessionFill: { height: 3, backgroundColor: palette.accent },
    sessionWhere: { ...worldHomeType.session, color: palette.muted, flexShrink: 1 },
    sessionAgain: {
      ...worldHomeType.session,
      color: palette.muted,
      textDecorationLine: 'underline',
    },
    empty: { paddingTop: 6 },
    emptyTitle: { ...worldHomeType.todayFirst, color: palette.ink },
    emptyNote: { ...worldHomeType.rowState, color: palette.muted, marginTop: 8 },
    list: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,.14)', paddingTop: 10 },
    listLabel: { ...worldHomeType.listLabel, color: palette.muted, marginBottom: 2 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      minHeight: 48,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,.09)',
      paddingVertical: 10,
    },
    rowDim: { opacity: 0.5 },
    rowMain: { flex: 1, minWidth: 0 },
    rowTitle: { ...worldHomeType.rowTitle, color: palette.ink },
    rowState: { ...worldHomeType.rowState, color: palette.muted, marginTop: 2 },
    rowWhen: { ...worldHomeType.rowState, color: palette.muted, marginTop: 2 },
    rowDayTap: { flexShrink: 0, justifyContent: 'center', minHeight: 44 },
    rowDay: { ...worldHomeType.rowDay, color: palette.accentText },
  });
