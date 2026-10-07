/**
 * 소개 시트 (S7) — **이 앱이 무엇을 하는 앱인지 한 장으로 말한다.**
 *
 * ── 왜 부품으로 떼어 냈나 (W4 슬라이스 C) ──────────────────────────────────────
 *
 * 이 글은 이제 **두 자리에서 뜬다.** 하나는 설정의 `소개` 줄이고(W2 부터 있었다), 다른
 * 하나는 **앱을 처음 여는 자리**다. 두 자리가 같은 글을 보여야 하므로 — 한쪽만 고치면 두
 * 말이 갈린다 — 글과 모양을 이 파일 하나에 두고 두 자리가 함께 부른다.
 *
 * ── 처음 한 번만 뜬다 ─────────────────────────────────────────────────────────
 *
 * 처음 여는 자리에서 뜨는 것은 `app/_layout.tsx` 의 `IntroGate` 가 맡고, 본 적이 있는지는
 * 기기에 적어 둔다(`src/storage/introSeen.ts`). **닫는 순간 본 것으로 적으므로 다시 뜨지
 * 않는다** — 읽고 닫든, 읽지 않고 곧바로 닫든 같다. 기도하러 온 사람을 막지 않으려는 것이며,
 * 그래서 이 시트에는 "다음" 으로 이어지는 여러 장이 없고 한 장뿐이다.
 *
 * 한 번 보고 사라지는 설명은 나중에 찾을 수 없으므로, **설정의 `소개` 줄이 언제나 같은 글을
 * 다시 연다.** 그 줄은 이 슬라이스가 만든 것이 아니라 이미 있던 것이고, 이 부품이 그 자리에
 * 그대로 앉았다.
 *
 * ── 글이 어디서 왔나 ──────────────────────────────────────────────────────────
 *
 * 지어내지 않았다. 세 문단의 출처는 이렇다.
 *
 * | 문단 | 출처 |
 * |---|---|
 * | 이 앱이 하는 일 | `docs/product/06-prd.md` §1 의 제품 정의 한 문장과 `CLAUDE.md` 맨 위 줄 |
 * | 이 앱이 지금 묻는 것 | 08 검증의 중심 질문 (PRD §4-6 · W2 부터 이 시트에 있던 글 그대로) |
 * | 아직 아닌 것 | 같은 자리에 있던 글 그대로 — 결정 12-2 로 계정과 조가 V1.5 로 미뤄진 사실을 포함한다 |
 *
 * ── 색과 크기 ────────────────────────────────────────────────────────────────
 *
 * 판과 머리는 `Sheet.tsx` 의 `BottomSheet` 가 그대로 그린다(시트 일곱이 같은 뼈대를 쓴다).
 * 글의 색과 크기는 설정 화면이 이 글에 쓰던 값 그대로이며(`worldSettingsType` 의 줄 이름과
 * 작은 글), 그 지역의 색 벌에서 색을 고른다.
 */
import { Pressable, StyleSheet, Text } from 'react-native';
import { stringsFor } from '../i18n';
import { useAppState } from '../state/useAppState';
import {
  paletteFor,
  worldRadius,
  worldSettingsType,
  worldSheetType,
  type WorldPalette,
} from '../theme/worldTokens';
import { BottomSheet } from './Sheet';

export function AboutSheet({
  visible,
  onClose,
  /**
   * 앱을 처음 여는 자리에서 뜨는 것인가.
   *
   * 참이면 맨 아래에 `시작하기` 단추가 하나 선다. 설정에서 열었을 때는 그 단추를 두지
   * 않는다 — 그 자리에서는 이미 앱을 쓰고 있어 "시작" 이라는 말이 뜻을 갖지 않기 때문이며,
   * 닫는 길은 머리의 `닫기` 로 충분하다.
   */
  firstRun = false,
  testID,
}: {
  visible: boolean;
  onClose: () => void;
  firstRun?: boolean;
  testID?: string;
}) {
  const { settings } = useAppState();
  const strings = stringsFor(settings.language);
  const styles = aboutStyles(paletteFor(settings.region));
  return (
    <BottomSheet visible={visible} label={strings.about} onClose={onClose} testID={testID}>
      <Text style={styles.title}>{strings.aboutWhatTitle}</Text>
      <Text style={styles.body}>{strings.aboutWhatBody}</Text>
      <Text style={styles.title}>{strings.aboutAskTitle}</Text>
      <Text style={styles.body}>{strings.aboutAskBody}</Text>
      <Text style={styles.title}>{strings.aboutNotYetTitle}</Text>
      <Text style={styles.body}>{strings.aboutNotYetBody}</Text>
      {firstRun ? (
        <Pressable
          style={styles.start}
          onPress={onClose}
          accessibilityRole="button"
          testID="intro-start"
        >
          <Text style={styles.startLabel}>{strings.begin}</Text>
        </Pressable>
      ) : null}
    </BottomSheet>
  );
}

const aboutStyles = (palette: WorldPalette) =>
  StyleSheet.create({
    title: { ...worldSettingsType.rowLabel, color: palette.ink, marginBottom: 10 },
    body: { ...worldSettingsType.rowNote, color: palette.muted, marginBottom: 22 },
    /* 시트의 `확인` 단추와 같은 모양이다 — 먹빛으로 채운 56 높이 (`Sheet.tsx` 의 `confirm`). */
    start: {
      minHeight: 56,
      borderRadius: worldRadius.md,
      backgroundColor: palette.ink,
      alignItems: 'center',
      justifyContent: 'center',
    },
    startLabel: { ...worldSheetType.confirm, color: palette.paper },
  });
