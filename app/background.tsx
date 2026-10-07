/**
 * 배경 지식 — 묵주기도가 어디서 왔고 왜 지금의 모양인지.
 *
 * 그리는 일은 `src/learn/LearnPage.tsx` 가 하고, 글은 `spec/learn.json` 의 `background` 다.
 *
 * **이 화면으로 들어오는 길은 둘이다.** 설정 화면의 `배우기` 절과, 오늘의 신비 화면의
 * 링크다 — 묵주기도 입문 화면과 같은 자리에 나란히 선다.
 */
import { LearnPage } from '../src/learn/LearnPage';
import { stringsFor } from '../src/i18n';
import { useAppState } from '../src/state/useAppState';

export default function BackgroundScreen() {
  const { settings } = useAppState();
  return (
    <LearnPage
      guide="background"
      label={stringsFor(settings.language).learnBackground}
      testID="background-screen"
    />
  );
}
