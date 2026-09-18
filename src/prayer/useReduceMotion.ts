/**
 * 기기의 "동작 줄이기" 설정을 한 번 읽는 갈고리.
 *
 * 묵주 그림(`Rosary.tsx`)이 다섯 상태를 움직임 대신 모양으로 갈라 그릴 때 쓰던 것인데,
 * 기도 화면(`app/pray.tsx`)도 같은 값을 알아야 해서 한 곳으로 옮겼다 — 받는 사이에
 * 기도문 칸을 뒷 절까지 굴릴 때, 이 설정이 켜져 있으면 굴리지 않고 곧바로 옮긴다.
 *
 * 값을 한 번만 읽는 이유는 이것이 기기 설정이라 기도하는 동안 바뀌는 일이 거의 없고,
 * 바뀌었다면 앱을 다시 열 때 따라오기 때문이다.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReduceMotion(): boolean {
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
  return still;
}
