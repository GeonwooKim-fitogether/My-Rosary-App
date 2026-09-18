/**
 * B 기도 — 「MyRosary World」 시안의 `data-screen-label="Prayer"` 블록을 옮긴 화면.
 *
 * 값(색·크기·간격·문구)은 그 블록에서 그대로 가져왔고, 색은 지역 다섯의 색 벌
 * (`src/theme/worldTokens.ts`)에서 이름으로 고른다. 화면이 스스로 정하는 색은 없다.
 *
 * ── 이 화면이 2026-09-17 에 어떻게 달라졌나 (W1 · `decisions.md` 결정 11·12) ──────
 *
 * 그전까지 이 화면은 v5 시안의 한지 벌이었다. 위에서부터 머리 · 성화 띠(높이 267) ·
 * 한 알씩 옮기는 줄 · 기도문 상자 · 단추 둘이 세로로 쌓이고, 화면이 짧으면 전체가
 * 아래로 흘렀다. 새 시안은 같은 화면을 **몰입형**으로 다시 그렸다.
 *
 * | 무엇 | 옛 화면 (v5) | 이 화면 (World) |
 * |---|---|---|
 * | 성화 | 높이 267 의 띠 하나 | 화면 전체를 덮는 배경, 그 위에 어두운 덮개 |
 * | 바탕 | 한지(밝은 종이) | 지역의 덮개 색(`scrim`) — 어둡다 |
 * | 묵주 | 물방울 고리, 지금 알만 크게 부푼다 | 원형 고리, 알은 제자리에 있고 빛만 옮겨 간다 |
 * | 조작 | 앞·뒤 단추 두 칸 | 앞·뒤 단추 두 칸 **더하기** 고리 돌리기와 가운데 누르기 |
 * | 넘침 | 화면 전체가 스크롤된다 | 화면은 고정이고 **기도문만** 스크롤된다 |
 *
 * ── 시안과 다르게 한 자리 다섯 (그리고 그 이유) ────────────────────────────────
 *
 * 1. **머리 가운데의 두 줄이 시안과 다른 것을 적는다.** 시안은 계정도 여정도 없는 앱이라
 *    그 자리에 `신비 이름 · 구간` 과 `n / 81` 을 적는다. 이 앱은 여정이 척추이므로 첫 줄에
 *    **여정의 바람과 며칠째인가**를 적고, 둘째 줄에 `구간 · 기도문` 과 `n / 81` 을 나란히
 *    적는다. 이름표 `pray-title` 과 `pray-step` 이 가리키는 것이 그 두 줄이다.
 * 2. **교대 낭송의 두 절을 한 문단 안에 위아래로 둔다** (로드맵 §3 의 카드 E). 시안은
 *    기도문을 한 덩어리로 보여 주지만 이 앱은 앞 절(앱이 읽는다)과 뒷 절(사용자가 받는다)로
 *    나뉜다. 지금 차례가 아닌 절은 **흐리게** 물러나게 해, 한 덩어리라는 인상을 지키면서
 *    교대가 보이게 했다.
 * 3. **잠시 멈춤과 여기서 끝내기가 시안에 없다.** 시안은 그 두 단추를 그리지 않았지만
 *    FR-18 이 요구하는 것이라 없앨 수 없다. 그래서 **뒤로 화살표가 나가는 방법을 묻는
 *    시트를 열고**, 그 안에 두 길이 글자로 선다(`src/ui/LeavePrayerSheet.tsx`).
 *
 *    이 자리는 한 번 고쳤다. 첫 판은 뒤로 화살표에 `여기서 끝내기`(오늘 바친 자리를
 *    지운다)를 곧바로 걸었는데, **되돌아가려고 누른 사람의 오늘이 한 번의 오조작으로
 *    사라지는** 자리였다. 옛 화면에서는 같은 일이 글자로 쓰인 단추에 걸려 있어 오해할 수
 *    없었다는 점이 그 결함을 드러냈다. 지금은 화살표가 묻기만 하고 사람이 고른다.
 * 4. **오른쪽 단추 둘 중 하나만 세웠다.** 시안의 머리 오른쪽에는 글자 크기(`Aa`)와 음성
 *    켜고 끄기가 있는데, 음성은 이 앱에서 여정마다 고정되는 값이라(FR-34) 화면에서 켜고
 *    끄지 않는다. 그래서 `Aa` 하나만 선다.
 * 5. **CSS 에만 있는 것 셋을 다른 수단으로 풀었다.** `dvh`(화면 높이 비율)는 화면 크기를
 *    직접 재서 계산하고, `color-mix()`(색 섞기)는 그러데이션의 정지점 불투명도로 풀고,
 *    `mask-image`(아래쪽을 흐리게 지우는 가리개)는 React Native 에 없어 **넣지 않았다** —
 *    기도문이 아래에서 부드럽게 사라지는 효과가 빠진 것이며, 글이 잘리지는 않는다.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type GestureResponderEvent,
} from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { artSession } from '../src/art';
import { MYSTERY_SETS } from '../src/domain/mysteries';
import { PRAYERS } from '../src/domain/sequence';
import { HAPTIC_PATTERNS } from '../src/domain/pacing';
import { Rosary } from '../src/prayer/Rosary';
import { estimateSpeechMs, vibrate } from '../src/prayer/channels';
import { PHASE_LABEL } from '../src/prayer/phase';
import {
  BEAD_COUNT,
  DRAG_THRESHOLD_DEG,
  RING_GRAB,
  VIEWBOX,
  LOOP,
  loopBeadAtAngle,
  loopBeadIndex,
  ringAngleDeg,
  rosaryStateFor,
  type RosaryPlacement,
} from '../src/prayer/rosaryState';
import { sectionLabel, sectionOf } from '../src/prayer/sections';
import { useReduceMotion } from '../src/prayer/useReduceMotion';
import { buildDayQueue } from '../src/prayer/steps';
import type { PrayerKey } from '../src/domain/types';
import { usePrayerSession, type DayResult } from '../src/prayer/usePrayerSession';
import type { RosaryKey } from '../src/storage/settings';
import type { PaceKey } from '../src/domain/types';
import { stringsFor, type Strings } from '../src/i18n';
import { dayIndexOn, dayLabelOn } from '../src/journey/rules';
import type { Journey } from '../src/journey/session';
import { leaveToHome } from '../src/navigation/leaveToHome';
import { finishTodayFor, updateSettings } from '../src/state/appStore';
import { useAppState } from '../src/state/useAppState';
import { LeavePrayerSheet } from '../src/ui/LeavePrayerSheet';
import {
  OFF_TURN_OPACITY,
  onScrim,
  paletteFor,
  worldPrayType,
  type WorldPalette,
} from '../src/theme/worldTokens';
import {
  FONT_SCALE_LABEL_KEYS,
  nextFontScale,
  prayerTextStyle,
  type FontScaleIndex,
} from '../src/theme/prayerFont';
import { TEXT_SCALE } from '../src/theme/fontScale';
import { fonts, type } from '../src/theme';

/**
 * 성화 배경의 초점을 아래로 미는 정도 — 시안의 `Math.min(60, +m[2] + 14)`.
 *
 * 그림의 초점을 그대로 쓰면 인물의 얼굴이 화면 맨 위, 머리 단추 뒤에 걸린다. 그래서 세로
 * 초점만 14 만큼 아래로 밀되 60% 를 넘기지 않는다 — 더 내리면 인물이 기도문에 가린다.
 */
const FOCUS_SHIFT = { by: 14, max: 60 };

/** 성화의 짙기. 시안의 `opacity:.92`. */
const PLATE_OPACITY = 0.92;

/** 머리가 안전 영역 아래로 더 내려오는 만큼. 시안의 `calc(env(safe-area-inset-top) + 6px)`. */
const HEADER_TOP_GAP = 6;

/** 아래 안내 한 줄이 안전 영역 위로 띄우는 만큼. 시안의 `calc(env(safe-area-inset-bottom) + 10px)`. */
const HINT_BOTTOM_GAP = 10;

/**
 * 받는 사이에 뒷 절까지 굴러갈 때, 뒷 절 **위로** 남겨 두는 여백(px).
 *
 * 0 으로 두면 뒷 절이 칸의 맨 위 선에 딱 붙어, 앞 절이 한 글자도 보이지 않는다. 그러면
 * 받을 글이 어디에서 이어지는지가 끊기므로 앞 절의 끝자락이 한 줄쯤 남을 만큼만 띄운다.
 */
const RESPONSE_SCROLL_GAP = 24;

/**
 * 묵주 그림의 높이 — 시안의 `min(38dvh, calc(66vw * 1.35), 400px)`.
 *
 * React Native 에는 `dvh`·`vw` 가 없으므로 화면 크기를 직접 재서 같은 값을 계산한다.
 * 390×844 에서 320.7, 390×640 에서 243.2 이 나온다.
 */
function rosaryHeightFor(width: number, height: number): number {
  return Math.min(0.38 * height, 0.66 * width * 1.35, 400);
}

/**
 * 바깥 껍데기 — 저장소에서 여정을 찾아 안쪽 화면에 넘긴다.
 *
 * 여정을 찾기 전에는 기도를 시작하지 않는다. 저장된 여정을 읽어 오는 데 한 틱이 걸리는데,
 * 그 사이에 진행기를 세우면 **엉뚱한 여정의 자리를 저장하고** 곧바로 다시 세우게 된다.
 * 그래서 안쪽(`PraySession`)이 여정을 필수로 받게 갈라 두었다.
 */
export default function PrayScreen() {
  const params = useLocalSearchParams();
  const requestedId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { ready, journeys, settings } = useAppState();
  const palette = paletteFor(settings.region);

  const journey = journeys.find((item) => item.id === requestedId) ?? journeys[0];
  if (!ready || !journey) {
    return <View style={{ flex: 1, backgroundColor: palette.scrim }} testID="pray-screen" />;
  }

  return (
    <PraySession
      key={journey.id}
      journey={journey}
      pace={settings.pace}
      handsFree={settings.handsFree}
      rosary={settings.rosary}
      palette={palette}
      strings={stringsFor(settings.language)}
      fontScale={settings.fontScale}
    />
  );
}

function PraySession({
  journey,
  pace,
  handsFree,
  rosary,
  palette,
  strings,
  fontScale,
}: {
  journey: Journey;
  pace: PaceKey;
  handsFree: boolean;
  /** 설정에서 고른 묵주 (FR-39). 그림의 재질을 정한다. */
  rosary: RosaryKey;
  /** 지역의 색 벌. 덮개 색이 여기서 온다. */
  palette: WorldPalette;
  /** 고른 언어의 화면 문구 한 벌. 아래 안내 한 줄과 단추의 낭독 이름이 여기서 온다. */
  strings: Strings;
  /** 앱 안 글자 크기 넷 중 지금 자리 (§3-5). 머리의 `Aa` 단추가 이 값을 돌린다. */
  fontScale: FontScaleIndex;
}) {
  const styles = useMemo(() => prayStyles(palette), [palette]);
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const plate = artSession.forJourney(journey.id);

  const onFinish = useCallback(
    (result: DayResult) => {
      // 하루 완주 화면이 "방금 바친 날"을 적을 수 있도록 먼저 그 번호를 붙든 뒤,
      // 오늘 칸을 바친 칸으로 새긴다. 그것으로 여정이 끝났으면 여정 완주 화면으로 간다.
      const today = new Date();
      const prayedDay = dayIndexOn(journey.startDate, today);
      const { ended } = finishTodayFor(journey.id, today);
      if (ended) {
        router.replace({ pathname: '/all-done', params: { id: journey.id } });
        return;
      }
      router.replace({
        pathname: '/day-done',
        params: {
          id: journey.id,
          dayIndex: String(prayedDay),
          hails: String(result.hails),
          elapsedMs: String(result.elapsedMs),
          resumeCount: String(result.resumeCount),
          mystery: result.mystery,
        },
      });
    },
    [journey],
  );

  const session = usePrayerSession({
    journey,
    mode: journey.recitation,
    pace,
    handsFree,
    onFinish,
  });
  const step = session.step;
  const placement: RosaryPlacement = step
    ? rosaryStateFor(step)
    : { done: 0, current: -1, focus: 'cross', label: null };
  /*
   * 읽는 중 테가 차오르는 시간 (FR-15). 기기는 낭송이 얼마나 걸릴지 미리 말해 주지
   * 않으므로, 소리 통로가 안전망에 쓰는 어림식(`estimateSpeechMs`)을 그대로 쓴다. 전부 읽기는
   * 앞 절과 뒷 절을 이어 읽으니 둘을 더한다.
   */
  const readingMs = step
    ? estimateSpeechMs(step.a) + (session.mode === 'full' && step.b ? estimateSpeechMs(step.b) : 0)
    : 0;

  /*
   * 앞뒤 단추에 적을 이름과, 고리를 돌렸을 때 뛸 자리를 얻는 데 쓰는 큐.
   *
   * 큐를 여기서 다시 만드는 것이 낭비로 보일 수 있지만, `usePrayerSession` 은 지금 단계
   * 하나만 내보내고 큐 전체는 내보내지 않는다. 큐는 그날의 신비 하나로 정해지는 값이라
   * (`buildDayQueue`) 같은 신비로 다시 만들면 진행기가 쓰는 것과 글자까지 같다.
   */
  const queue = useMemo(() => buildDayQueue(session.mystery), [session.mystery]);
  const nameOf = (at: number): string | null => {
    const found = queue[at];
    return found ? PRAYERS[found.prayer as PrayerKey].name : null;
  };
  const previousName = nameOf(session.index - 1);
  const nextName = nameOf(session.index + 1);

  /**
   * 알마다 **그 알에서 처음 바치는 단계**가 몇 번째인가.
   *
   * 고리를 돌려 알 하나를 집으면 그 알의 첫 단계로 간다(§3-4 의 4번). 한 알에 여러 단계가
   * 걸리는 자리가 있기 때문이다 — 각 단의 열째 알에는 성모송·영광송·구원을 비는 기도 셋이
   * 함께 걸려 있고, 큰 알에는 신비 선포와 주님의 기도가 걸려 있다. 그 알을 집었을 때 가운데
   * 단계로 뛰면 앞의 기도를 건너뛴 것이 되므로 언제나 첫 단계로 간다.
   */
  const firstStepForBead = useMemo(() => {
    const map = new Array<number>(BEAD_COUNT).fill(-1);
    queue.forEach((item, at) => {
      const { current } = rosaryStateFor(item);
      if (current >= 0 && map[current] === -1) map[current] = at;
    });
    return map;
  }, [queue]);

  /**
   * 나가는 방법을 묻는 시트가 열려 있나 (§4-2 의 3번).
   *
   * 머리의 뒤로 화살표는 **묻기만 한다.** 첫 판은 그 화살표에 `여기서 끝내기`(오늘 바친
   * 자리를 지운다)를 곧바로 걸었는데, 되돌아가려고 누른 사람의 오늘이 한 번의 오조작으로
   * 사라지는 자리였다. 무엇을 할지는 이제 사람이 시트 안에서 고른다.
   */
  const [leaveOpen, setLeaveOpen] = useState(false);

  /** 잠시 멈춤 — 자리를 남기고 나간다 (FR-18). */
  const pauseAndLeave = useCallback(() => {
    setLeaveOpen(false);
    session.pause();
    leaveToHome();
  }, [session]);

  /** 여기서 끝내기 — 오늘 자리를 지우고 나간다. 다음에 열면 오늘 처음부터다 (FR-18). */
  const discardAndLeave = useCallback(() => {
    setLeaveOpen(false);
    void session.discard().then(leaveToHome);
  }, [session]);

  /**
   * 기도문의 글자 크기 — 앱 안에서 고른 자리와 기기 배율을 함께 셈한 값 (§3-5).
   *
   * 웹에서는 `TEXT_SCALE.font` 가 기기 배율이고, iOS·Android 에서는 1 이다(React Native 가
   * 스스로 곱하기 때문이며, 그쪽의 상한은 `maxFontSizeMultiplier` 로 걸린다). 두 경우를
   * 가르는 일은 `src/theme/prayerFont.ts` 가 하고 화면은 결과만 쓴다.
   */
  const prayerText = useMemo(() => prayerTextStyle(fontScale, TEXT_SCALE.font), [fontScale]);

  /** `Aa` 를 한 번 누르면 한 칸 커지고, 넷째에서 처음으로 돌아온다. */
  const cycleFont = useCallback(() => {
    updateSettings({ fontScale: nextFontScale(fontScale) });
  }, [fontScale]);

  /**
   * 고리에서 집은 알로 옮긴다.
   *
   * 옮기는 통로는 `goToSection` 하나뿐이다 — 이름은 구간용이지만 실제로 쓰는 것은 `index`
   * 이고(`usePrayerSession` 이 진행기의 `goTo` 에 그대로 넘긴다), 이 마일스톤에서는
   * 진행기 쪽 파일을 고치지 않기로 했으므로 있는 통로를 쓴다. 그래서 넘기는 값도
   * 거짓말이 되지 않게 **그 단계가 실제로 속한 구간**으로 채운다.
   */
  const goToBead = useCallback(
    (loopBead: number) => {
      const at = firstStepForBead[loopBeadIndex(loopBead)];
      if (at === undefined || at < 0 || at === session.index) return;
      const target = queue[at];
      if (!target) return;
      // 알을 옮길 때마다 짧게 떤다. 진동 값은 화면이 정하지 않고 사전에서 고른다 —
      // `beadAdvance`(18ms)가 바로 "알이 넘어갔다"를 뜻하는 값이다.
      vibrate(HAPTIC_PATTERNS.beadAdvance);
      const section = sectionOf(target);
      session.goToSection({ section, index: at, label: sectionLabel(section) });
    },
    [firstStepForBead, queue, session],
  );

  /*
   * 손가락 처리에 쓰는 값들.
   *
   * `actions` 를 참조로 두는 이유는 하나다 — `PanResponder` 는 한 번만 만들어야 제스처
   * 도중에 손잡이가 바뀌지 않는데, 옮기는 일(`goToBead`)은 그릴 때마다 새로 만들어진다.
   * 그래서 손잡이를 참조에 담아 두고 `PanResponder` 는 그 참조를 들여다본다.
   */
  const actions = useRef({ goToBead, advance: session.advance });
  actions.current = { goToBead, advance: session.advance };

  /** 묵주 칸이 화면의 어디에 얼마만큼 놓였나. 손가락 자리를 각도로 바꾸는 데 쓴다. */
  const stageBox = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const stageRef = useRef<View>(null);
  const measureStage = useCallback(() => {
    stageRef.current?.measureInWindow((x, y, width, height) => {
      stageBox.current = { x, y, width, height };
    });
  }, []);

  /** 끌고 있는 동안의 상태. 누르고만 있으면 null 이 아니라 `moved: false` 다. */
  const drag = useRef<{ last: number; accumulated: number; moved: boolean; at: number | null } | null>(
    null,
  );
  /** 고리 안쪽(가운데)을 누른 채인가. 떼는 순간 다음 단계로 간다. */
  const pressedCenter = useRef(false);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          drag.current = null;
          pressedCenter.current = false;
          const hit = ringHit(stageBox.current, event);
          if (!hit) return;
          if (hit.distance < hit.radius * RING_GRAB.inner) {
            pressedCenter.current = true;
            return;
          }
          if (hit.distance > hit.radius * RING_GRAB.outer) return; // 꼬리와 단추의 자리다
          drag.current = { last: hit.screenAngle, accumulated: 0, moved: false, at: null };
        },
        onPanResponderMove: (event) => {
          const state = drag.current;
          if (!state) return;
          const hit = ringHit(stageBox.current, event);
          if (!hit) return;
          // 각도의 차이를 누적한다. −180~180 으로 접어 12시를 지날 때 값이 튀지 않게 한다.
          let delta = hit.screenAngle - state.last;
          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;
          state.last = hit.screenAngle;
          state.accumulated += delta;
          if (Math.abs(state.accumulated) > DRAG_THRESHOLD_DEG) state.moved = true;
          if (!state.moved) return;
          const bead = loopBeadAtAngle(hit.ringAngle);
          if (bead === state.at) return;
          state.at = bead;
          actions.current.goToBead(bead);
        },
        onPanResponderRelease: (event) => {
          const state = drag.current;
          drag.current = null;
          if (state) {
            // 끌지 않고 뗐으면 그 자리의 알로 한 번 옮긴다.
            if (!state.moved) {
              const hit = ringHit(stageBox.current, event);
              if (hit) actions.current.goToBead(loopBeadAtAngle(hit.ringAngle));
            }
            return;
          }
          if (pressedCenter.current) {
            pressedCenter.current = false;
            actions.current.advance();
          }
        },
        onPanResponderTerminate: () => {
          drag.current = null;
          pressedCenter.current = false;
        },
      }),
    [],
  );

  const rosaryHeight = rosaryHeightFor(window.width, window.height);
  const focal = plate ? plate.focus.prayer : null;
  const prayerName = step ? PRAYERS[step.prayer as PrayerKey].name : '';
  /** 세는 줄 — 그 단의 몇째 성모송인가. 옛 판이 알 안에 적던 숫자가 이 자리로 옮겨 왔다. */
  const counter =
    step && step.prayer === 'hail' && step.bead !== null && step.of
      ? `${step.bead} / ${step.of}`
      : '';
  /** 신비 한 줄 — 지금 단에서 무엇을 묵상하는가. 신비 선포는 그 문구를 이미 읽으므로 뺀다. */
  const mysteryLine =
    step && step.section === 'decade' && step.prayer !== 'decl'
      ? (MYSTERY_SETS[session.mystery].decades[(step.decade ?? 1) - 1] ?? '')
      : '';
  const responding = session.phase === 'response';
  const progress = Math.round(((session.index + 1) / queue.length) * 100);

  /*
   * 받을 절이 화면 밖에 있지 않게 한다.
   *
   * 앞 절이 길면(성모송 · 주님의 기도 · 사도신경) 내 차례가 됐을 때 **받아야 할 뒷 절이
   * 스크롤 아래에 있다.** 교대 낭송이 이 앱의 차별점인데 받을 글이 안 보이면 그 차별점이
   * 그 자리에서 무너지므로, 차례가 넘어오는 순간 기도문 칸이 스스로 뒷 절까지 굴러간다.
   *
   * 뒷 절의 자리는 그 글이 놓일 때(`onLayout`) 적어 둔다. 재는 시점과 차례가 넘어오는
   * 시점 중 **어느 쪽이 먼저일지는 정해져 있지 않으므로**(아래 `live` 의 주석), 두 곳
   * 모두에서 굴린다 — 늦게 온 쪽이 굴리면 된다.
   */
  const scrollRef = useRef<ScrollView>(null);
  const still = useReduceMotion();

  /**
   * 그리기마다 갱신하는 지금 값들 — 자를 재는 일(`onLayout`)처럼 **그리기 밖에서 늦게
   * 오는 일**이 읽는다.
   *
   * 왜 필요한지 적어 둔다. 뒷 절의 자리를 재 주는 `onLayout` 은 브라우저가 배치를 끝낸
   * 뒤에 부르는데, 그 시점이 갈고리(`useEffect`)보다 **뒤일 때가 있다**. 실제로 이
   * 컨테이너에서 재 보니 차례가 넘어온 갈고리가 먼저 돌고 자리가 그 뒤에 재어졌다. 그때
   * 붙들고 있는 값이 그리기 당시의 것이면 이미 지난 값이라, 굴려야 할 때 굴리지 못한다.
   * 참조에 담아 두면 어느 쪽이 먼저 오든 언제나 지금 값을 읽는다. 이 화면이 손가락 처리
   * (`actions`)에 쓰는 것과 같은 수법이다.
   */
  const live = useRef({ index: session.index, responding, still });
  live.current = { index: session.index, responding, still };

  /**
   * 뒷 절이 놓인 자리와, **그것을 어느 단계에서 쟀는가.**
   *
   * 단계 번호를 함께 적어 두는 이유가 있다. 자리를 재는 일은 뒷 절의 **크기가 바뀔 때만**
   * 일어나므로, 크기가 같은 두 단계가 이어지면 다음 단계에서는 재지 않는다. 번호를 함께
   * 적어 두면 다른 단계에서 잰 값을 쓰는 일이 없다.
   */
  const responseTop = useRef<{ at: number; y: number } | null>(null);

  /** 받을 절이 보이게 칸을 굴린다. 잰 적이 없거나 다른 단계에서 잰 값이면 아무것도 안 한다. */
  const scrollToResponse = useCallback(() => {
    const measured = responseTop.current;
    if (!measured || measured.at !== live.current.index) return;
    scrollRef.current?.scrollTo({
      y: Math.max(0, measured.y - RESPONSE_SCROLL_GAP),
      animated: !live.current.still,
    });
  }, []);

  // 단계가 바뀌면 맨 위로 되돌린다. 되돌리지 않으면 긴 기도문을 내려 읽은 다음 단계가
  // 중간부터 열려, 새 기도문의 첫 줄을 사람이 직접 찾아 올려야 한다.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [session.index]);

  // 내 차례가 되면 뒷 절까지 굴러간다. 움직임 줄이기가 켜져 있으면 굴리지 않고 곧바로 옮긴다.
  useEffect(() => {
    if (responding) scrollToResponse();
  }, [responding, session.index, scrollToResponse]);

  return (
    <View style={styles.screen} testID="pray-screen">
      {/* 성화와 어두운 덮개. 손가락을 받지 않으므로 통째로 막아 둔다. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {plate && focal ? (
          <Image
            source={plate.source}
            style={[StyleSheet.absoluteFill, { opacity: PLATE_OPACITY }]}
            contentFit="cover"
            contentPosition={{ left: focal.x, top: shiftDown(focal.y) }}
            accessible={false}
          />
        ) : null}
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            {/*
              위에서 아래로 여섯 마디. 맨 위는 검정 55% 로 머리 글자를 받치고, 58% 아래부터
              지역의 덮개 색으로 가라앉아 100% 에서 완전히 그 색이 된다. 시안의 `color-mix`
              는 "덮개 색을 88% 만큼 섞는다"는 뜻이라, 여기서는 같은 색에 불투명도를 준다.
            */}
            <LinearGradient id="prayScrim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity={0.55} />
              <Stop offset="0.18" stopColor="#000000" stopOpacity={0.18} />
              <Stop offset="0.4" stopColor="#000000" stopOpacity={0.28} />
              <Stop offset="0.58" stopColor={palette.scrim} stopOpacity={0.88} />
              <Stop offset="0.72" stopColor={palette.scrim} stopOpacity={0.97} />
              <Stop offset="1" stopColor={palette.scrim} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#prayScrim)" />
        </Svg>
      </View>

      <View style={[styles.header, { paddingTop: insets.top + HEADER_TOP_GAP }]}>
        {/*
          뒤로 화살표 — 나가는 방법을 **묻는다** (§4-2 의 3번). 시안에는 화면을 벗어나는
          길이 이 화살표 하나뿐인데 이 앱에는 나가는 방법이 둘이므로(자리를 남기는 잠시
          멈춤과 자리를 지우는 여기서 끝내기), 화살표는 시트를 열고 사람이 그 안에서
          고른다. 파괴적인 일을 화살표에 곧바로 걸지 않는 것이 이 자리의 요점이다.
        */}
        <Pressable
          style={styles.iconButton}
          onPress={() => setLeaveOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`${strings.back}, 기도 나가기`}
          testID="pray-back"
        >
          <Icon path="M15 18 L9 12 L15 6" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1} testID="pray-title">
            {journey.title}{' '}
            <Text style={styles.headerTitleDim}>
              · {dayLabelOn(journey, dayIndexOn(journey.startDate, new Date()))}
            </Text>
          </Text>
          <View style={styles.headerLine}>
            <Text style={styles.headerStep} numberOfLines={1} testID="pray-step">
              {step?.head ?? ''}
            </Text>
            <Text style={styles.headerCount}>
              {session.index + 1} / {queue.length}
            </Text>
          </View>
        </View>

        {/*
          글자 크기 — 한 번 누를 때마다 한 칸 커지고 넷째에서 처음으로 돌아온다 (§3-5).
          시안은 이 자리에 `Aa` 와 음성 단추 둘을 두는데, 음성은 이 앱에서 여정마다
          고정되는 값이라(FR-34) 화면에서 켜고 끄지 않는다. 그래서 `Aa` 하나만 선다.
        */}
        <Pressable
          style={styles.iconButton}
          onPress={cycleFont}
          accessibilityRole="button"
          accessibilityLabel={`${strings.fontSize}, ${strings[FONT_SCALE_LABEL_KEYS[fontScale]]}`}
          testID="pray-font"
        >
          <Text style={styles.fontButton}>Aa</Text>
        </Pressable>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View
        ref={stageRef}
        onLayout={measureStage}
        style={[styles.stage, { height: rosaryHeight }]}
        testID="pray-stage"
        {...pan.panHandlers}
      >
        {/*
          지금 알의 상태 이름을 이 상자에 붙인다 (FR-15 · 06-design-system §7). 그림은 색과
          움직임으로 말하고, 화면 낭독기는 이 글로 같은 것을 듣는다.
        */}
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={PHASE_LABEL[session.phase]}
          testID="pray-rosary"
        >
          <Rosary
            {...placement}
            rosary={rosary}
            phase={session.phase}
            readingMs={readingMs}
            height={rosaryHeight}
          />
        </View>
      </View>

      <View style={styles.prayerBox}>
        <View style={styles.prayerHead}>
          <Text style={styles.prayerName} numberOfLines={1}>
            {prayerName}
          </Text>
          <Text style={styles.prayerCounter} testID="pray-counter">
            {counter}
          </Text>
        </View>
        <View style={styles.prayerScrollBox}>
        <ScrollView
          ref={scrollRef}
          style={styles.prayerScroll}
          contentContainerStyle={styles.prayerScrollInner}
        >
          {mysteryLine ? <Text style={styles.mysteryLine}>{mysteryLine}</Text> : null}
          {/*
            교대 낭송의 두 절 (카드 E). 지금 차례가 아닌 절은 흐리게 물러난다 — 앞 절은 앱이
            읽고 뒷 절은 사용자가 받으므로, 받는 사이(`response`)에는 뒷 절이 앞으로 나온다.

            두 절의 **크기는 같다.** 시안의 기도문은 크기 하나짜리 한 덩어리이고, 이 앱이
            더한 교대는 색과 흐림으로만 갈린다. 이 저장소의 옛 서체 계단은 앞 절 26px ·
            뒷 절 21px 로 갈라 두었는데, 그 값을 그대로 두면 앱 안 글자 크기를 아무리 키워도
            **사람이 직접 받는 절이 앱이 읽는 절보다 언제나 작다.**
          */}
          <Text
            style={[
              styles.prayerLead,
              { fontSize: prayerText.fontSize, lineHeight: prayerText.lineHeight },
              responding ? styles.offTurn : null,
            ]}
            maxFontSizeMultiplier={prayerText.maxFontSizeMultiplier}
            testID="pray-a"
          >
            {step?.a ?? ''}
          </Text>
          {step?.b ? (
            <Text
              style={[
                styles.prayerResponse,
                { fontSize: prayerText.fontSize, lineHeight: prayerText.lineHeight },
                responding ? null : styles.offTurn,
              ]}
              maxFontSizeMultiplier={prayerText.maxFontSizeMultiplier}
              onLayout={(event) => {
                responseTop.current = { at: live.current.index, y: event.nativeEvent.layout.y };
                // 자리가 차례보다 **늦게** 재어지는 일이 실제로 있다(위 `live` 의 주석).
                // 그때는 차례를 알리는 갈고리가 이미 지나갔으므로 여기서 굴린다.
                if (live.current.responding) scrollToResponse();
              }}
              testID="pray-b"
            >
              {step.b}
            </Text>
          ) : null}
        </ScrollView>
        {/*
          기도문의 아래 끝이 사라지는 효과. 시안은 `mask-image` 로 마지막 22px 을 지우는데
          React Native 에는 그 속성이 없어, 같은 높이만큼 **덮개 색 그러데이션을 얹어** 같은
          인상을 만든다. 글을 가리는 것이 아니라 잘린 자리를 부드럽게 만드는 것이므로 손가락은
          통과시킨다.
        */}
        <View style={styles.prayerFade} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="prayFade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={palette.scrim} stopOpacity={0} />
                <Stop offset="1" stopColor={palette.scrim} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#prayFade)" />
          </Svg>
        </View>
        </View>
      </View>

      <View style={styles.stepNav} testID="pray-step-nav">
        <StepButton
          styles={styles}
          onPress={session.back}
          to={previousName}
          action="앞 알"
          empty="여기가 처음"
          direction="back"
          testID="pray-previous-step"
        />
        <StepButton
          styles={styles}
          onPress={session.advance}
          to={nextName}
          action="다음 알"
          empty="여기가 끝"
          direction="forward"
          testID="pray-next-step"
        />
      </View>

      {/*
        두 줄까지 허용한다. 한 줄로 못박아 두면 **한국어보다 긴 언어에서 말이 잘린다** —
        영어로 바꾼 화면을 처음 찍어 보고 `Turn the loop to mov…` 로 끊기는 것을 확인했다
        (W4 슬라이스 B, `docs/plan/w4-screens/en-pray.png` 의 앞 판). 한국어는 여전히 한 줄에
        들어가므로 한국어 화면의 모양은 그대로다.
      */}
      <Text
        style={[styles.hint, { paddingBottom: insets.bottom + HINT_BOTTOM_GAP }]}
        numberOfLines={2}
      >
        {`${strings.tapHint} · ${strings.dragHint}`}
      </Text>

      <LeavePrayerSheet
        visible={leaveOpen}
        onPause={pauseAndLeave}
        onStop={discardAndLeave}
        onClose={() => setLeaveOpen(false)}
      />
    </View>
  );
}

/**
 * 성화의 세로 초점을 아래로 민다. 값은 시안의 규칙 그대로이고, 퍼센트가 아닌 값(예: `center`)
 * 이면 손대지 않는다 — 이 저장소의 성화 표는 모두 퍼센트지만, 아닌 값이 들어와도 깨지지 않게 한다.
 */
function shiftDown(value: string): string {
  const matched = /^(-?\d+(?:\.\d+)?)%$/.exec(value.trim());
  if (!matched) return value;
  return `${Math.min(FOCUS_SHIFT.max, Number(matched[1]) + FOCUS_SHIFT.by)}%`;
}

/**
 * 손가락이 묵주의 어디를 짚었나.
 *
 * 묵주 칸은 화면 가로의 한가운데에 서고 세로로는 칸을 꽉 채우므로, 고리의 중심과 반지름을
 * 칸의 크기에서 곧바로 얻을 수 있다 — 좌표계가 240×324 이고 고리가 (120, 118, 96)이라
 * 중심은 칸 높이의 118/324 자리이고 반지름은 칸 높이의 96/324 이다.
 *
 * 칸을 아직 재지 못했으면 null 을 돌려준다. 재기 전에 손가락이 닿는 일은 거의 없지만,
 * 그때 0 으로 나눠 엉뚱한 알로 뛰는 것보다 아무 일도 하지 않는 편이 낫다.
 */
function ringHit(
  box: { x: number; y: number; width: number; height: number },
  event: GestureResponderEvent,
): { distance: number; radius: number; screenAngle: number; ringAngle: number } | null {
  if (box.width <= 0 || box.height <= 0) return null;
  const dx = event.nativeEvent.pageX - (box.x + box.width / 2);
  const dy = event.nativeEvent.pageY - (box.y + box.height * (LOOP.cy / VIEWBOX.height));
  return {
    distance: Math.hypot(dx, dy),
    radius: box.height * (LOOP.r / VIEWBOX.height),
    // 얼마나 돌았는지를 세는 각도. 기준이 어디든 상관없고 이어지기만 하면 된다.
    screenAngle: (Math.atan2(dy, dx) * 180) / Math.PI,
    // 어느 알 위인지를 읽는 각도. 맨 아래가 0 이고 오른쪽으로 돌수록 커진다.
    ringAngle: ringAngleDeg(dx, dy),
  };
}

/** 머리와 단추의 아이콘. 시안의 선 아이콘 어법(굵기 1.6 · 둥근 끝 · 24 좌표계)을 따른다. */
function Icon({ path, size = 22, color = onScrim.ink }: { path: string; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * 한 알 옮기는 단추 하나.
 *
 * 갈 데가 없으면(첫 단계에서의 앞 알, 마지막 단계에서의 다음 알) 감추지 않고 **흐리게
 * 둔다.** 감추면 남은 단추가 자리를 옮겨, 같은 자리를 눌렀는데 다른 일이 일어난다.
 *
 * 단추에 적는 것은 **갈 곳의 기도문 이름**(`성모송` · `영광송`)이다. 화살표만 있으면 누르기
 * 전에는 무엇이 나올지 알 수 없어, 되짚어 보려는 사람이 화면을 여러 번 넘기게 된다.
 */
function StepButton({
  styles,
  onPress,
  to,
  action,
  empty,
  direction,
  testID,
}: {
  styles: ReturnType<typeof prayStyles>;
  onPress: () => void;
  /** 갈 곳의 기도문 이름. 갈 데가 없으면 null 이다. */
  to: string | null;
  /** 소리로 읽어 줄 때의 이름. 화살표가 없는 쪽이다 — 화면 낭독기가 화살표를 읽으면 방해가 된다. */
  action: string;
  /** 갈 데가 없을 때 적을 말. */
  empty: string;
  /** 앞으로 가는 단추인가 뒤로 가는 단추인가. 화살표의 방향과 테의 색이 갈린다. */
  direction: 'back' | 'forward';
  testID: string;
}) {
  const forward = direction === 'forward';
  return (
    <Pressable
      style={[styles.stepButton, forward ? styles.stepButtonNext : null, to ? null : styles.stepButtonEmpty]}
      onPress={to ? onPress : undefined}
      disabled={!to}
      accessibilityRole="button"
      accessibilityState={{ disabled: !to }}
      accessibilityLabel={`${action}, ${to ?? empty}`}
      testID={testID}
    >
      {forward ? null : <Icon path="M15 18 L9 12 L15 6" size={18} />}
      <Text style={forward ? styles.stepLabelNext : styles.stepLabel} numberOfLines={1}>
        {to ?? empty}
      </Text>
      {forward ? <Icon path="M9 18 L15 12 L9 6" size={18} color={onScrim.accent} /> : null}
    </Pressable>
  );
}

/**
 * 색은 지역의 덮개 위에 얹히는 값들(`onScrim`)과 그 지역의 덮개 색(`palette.scrim`)에서만
 * 온다. 크기와 간격은 시안의 기도 화면 마크업에서 그대로 옮겼다.
 *
 * **기도문의 크기는 여기에 없다.** 그 값만은 사람이 화면에서 고르는 값이라(§3-5) 화면이
 * 그릴 때 `prayerTextStyle` 로 셈해 얹는다. 여기 남는 것은 글꼴과 색뿐이다. 구간 라벨
 * (`pray-step`)은 그대로 이 저장소의 서체 계단(`type.stepLabel`)을 쓴다 — 시안의 같은
 * 자리(11px)와 크기가 가깝고, 전례색을 입히는 유일한 글자라 계단 쪽이 정본이다.
 */
const prayStyles = (palette: WorldPalette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: palette.scrim,
      overflow: 'hidden',
    },
    /*
     * 머리. 위 여백은 시안과 같이 **안전 영역 + 6** 이다 — 노치나 상태 표시줄에 가리지
     * 않는 자리가 어디서 시작하는지를 `useSafeAreaInsets()` 가 재 주고, 화면이 그 값에
     * 6 을 더해 쓴다(`HEADER_TOP_GAP`). 그 값은 기기마다 다르므로 여기 고정값으로 적지
     * 않고 그릴 때 얹는다. 웹에서는 안전 영역이 0 이라 여백이 6 이 된다.
     */
    header: {
      paddingHorizontal: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexGrow: 0,
      flexShrink: 0,
    },
    iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    // 시안의 `Aa` — `font-family:var(--font-heading); font-size:20px`. 라틴 제목 글꼴 대신
    // 한글 명조를 쓰는 이유는 이 화면의 다른 제목들과 같다(`worldPrayType.title` 의 주석).
    fontButton: { ...worldPrayType.fontButton, color: onScrim.ink },
    headerCenter: { flex: 1, alignItems: 'center', minWidth: 0 },
    // 시안의 `font-size:12px; letter-spacing:.12em`.
    headerTitle: { ...worldPrayType.header, color: onScrim.ink, textAlign: 'center' },
    headerTitleDim: { color: onScrim.accent },
    headerLine: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 3 },
    // 이 줄의 글자 크기는 서체 계단의 `stepLabel`(10.5px · 자간 .16em) 그대로다.
    headerStep: { ...type.stepLabel, color: onScrim.ink, flexShrink: 1 },
    // 시안의 `font-size:11px; opacity:.65`.
    headerCount: { ...worldPrayType.count, color: onScrim.ink, opacity: 0.65, flexShrink: 0 },

    // 진행선. 시안의 `height:1; margin:6px 16px 0`.
    progressTrack: {
      height: 1,
      marginTop: 6,
      marginHorizontal: 16,
      backgroundColor: 'rgba(255,255,255,.18)',
      flexGrow: 0,
      flexShrink: 0,
    },
    progressFill: { height: 1, backgroundColor: onScrim.accent },

    // 묵주 칸. 높이는 화면 크기가 정하므로 여기서는 비워 둔다.
    stage: {
      marginTop: 6,
      alignItems: 'center',
      justifyContent: 'center',
      flexGrow: 0,
      flexShrink: 0,
    },

    // 기도문 칸 — 남는 자리를 전부 가져가고, 넘치는 만큼은 이 안에서 스크롤된다.
    prayerBox: { flex: 1, minHeight: 0, paddingHorizontal: 24, paddingTop: 10 },
    prayerHead: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,.16)',
    },
    // 시안의 `font-family:var(--font-heading); font-size:22px`. 한글은 명조로 받는다.
    prayerName: { ...worldPrayType.title, color: onScrim.ink, flexShrink: 1 },
    // 시안의 `font-size:13px; letter-spacing:.06em; color:#e9c877`.
    prayerCounter: { ...worldPrayType.counter, color: onScrim.accent, flexShrink: 0 },
    prayerScrollBox: { flex: 1, minHeight: 0 },
    prayerScroll: { flex: 1, minHeight: 0 },
    /** 시안의 `mask-image: linear-gradient(..., #000 calc(100% - 22px), transparent)` 의 22px. */
    prayerFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 22 },
    prayerScrollInner: { paddingTop: 12, paddingBottom: 16 },
    // 시안의 `font-size:13px; color:#e9c877` — 지금 단에서 무엇을 묵상하는가.
    mysteryLine: { ...worldPrayType.mystery, color: onScrim.accent, marginBottom: 10 },
    // 크기와 줄 높이는 그릴 때 얹는다 (위 주석). 여기 있는 것은 글꼴과 색뿐이다.
    prayerLead: { fontFamily: fonts.serif, color: onScrim.ink },
    prayerResponse: { fontFamily: fonts.serif, color: onScrim.accent, marginTop: 12 },
    offTurn: { opacity: OFF_TURN_OPACITY },

    // 앞·뒤 단추. 시안의 두 칸 격자 — 최소 높이 48, 둥근 알약, 다음 쪽만 강조색 테.
    stepNav: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 6,
      flexGrow: 0,
      flexShrink: 0,
    },
    stepButton: {
      flex: 1,
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,.35)',
      borderRadius: 999,
      backgroundColor: 'rgba(0,0,0,.25)',
    },
    stepButtonNext: { borderColor: onScrim.accent },
    stepButtonEmpty: { opacity: 0.35 },
    stepLabel: { ...worldPrayType.button, color: onScrim.ink, flexShrink: 1 },
    stepLabelNext: { ...worldPrayType.button, color: onScrim.accent, flexShrink: 1 },

    // 안내 한 줄. 시안의 `font-size:11px; letter-spacing:.06em; opacity:.5`.
    hint: {
      ...worldPrayType.hint,
      color: onScrim.ink,
      opacity: 0.5,
      textAlign: 'center',
      paddingHorizontal: 16,
      paddingTop: 6,
      // 아래 여백은 안전 영역 위로 10 을 띄운 값이다 (`HINT_BOTTOM_GAP`, 시안과 같다).
      flexGrow: 0,
      flexShrink: 0,
    },
  });
