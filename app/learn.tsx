/**
 * 묵주기도 입문 — 처음 바치는 사람을 위한 설명서.
 *
 * 그리는 일은 `src/learn/LearnPage.tsx` 가 하고, 글은 `spec/learn.json` 의 `basics` 다.
 * 이 파일이 하는 일은 그 둘을 잇는 것 하나뿐이다.
 *
 * **이 화면으로 들어오는 길은 둘이다.** 설정 화면의 `배우기` 절에 줄 하나가 있고,
 * 오늘의 신비 화면에 링크 한 줄이 있다. 오늘의 신비에도 둔 까닭은, 처음 온 사람이
 * "신비가 뭐지" 하고 그 화면에 닿았을 때 바로 옆에 설명서가 보여야 하기 때문이다.
 */
import { LearnPage } from '../src/learn/LearnPage';
import { stringsFor } from '../src/i18n';
import { useAppState } from '../src/state/useAppState';

export default function LearnScreen() {
  const { settings } = useAppState();
  return (
    <LearnPage
      guide="basics"
      label={stringsFor(settings.language).learnBasics}
      testID="learn-screen"
    />
  );
}
