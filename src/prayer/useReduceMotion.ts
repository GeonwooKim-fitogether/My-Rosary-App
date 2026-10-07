/**
 * 기기의 "동작 줄이기" 설정을 한 번 읽는 갈고리.
 *
 * 묵주 그림(`Rosary.tsx`)이 다섯 상태를 움직임 대신 모양으로 갈라 그릴 때 쓰던 것인데,
 * 기도 화면(`app/pray.tsx`)도 같은 값을 알아야 해서 한 곳으로 옮겼다 — 받는 사이에
 * 기도문 칸을 뒷 절까지 굴릴 때, 이 설정이 켜져 있으면 굴리지 않고 곧바로 옮긴다.
 *
 * 기기 설정 값을 한 번만 읽는 이유는 그것이 기도하는 동안 바뀌는 일이 거의 없고,
 * 바뀌었다면 앱을 다시 열 때 따라오기 때문이다.
 *
 * **W2 슬라이스 C 에서 앱 안의 설정이 하나 더해졌다** (설정 화면의 `움직임 줄이기` 줄 —
 * 시안이 그 자리에 둔 토글이다). 두 값은 **더해져서** 쓰인다. 둘 중 하나만 켜져 있어도
 * 움직임이 멎는 이유는, 기기 설정을 찾지 못하거나 바꿀 수 없는 사람에게 앱 안에서 같은
 * 것을 줄 수 있어야 하기 때문이고, 반대로 앱에서 끈다고 기기가 이미 내린 결정을 무를
 * 수는 없기 때문이다.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useAppState } from '../state/useAppState';

export function useReduceMotion(): boolean {
  const { settings } = useAppState();
  const [still, setStill] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!cancelled && reduce) setStill(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return still || settings.reduceMotion;
}
