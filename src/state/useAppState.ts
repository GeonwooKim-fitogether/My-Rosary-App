/**
 * 화면이 앱 상태를 구독하는 갈고리.
 *
 * `useSyncExternalStore` 는 리액트가 "화면 밖에 있는 상태"를 안전하게 읽으라고 준 것이다.
 * 상태를 통째로 돌려주므로 화면은 필요한 것만 꺼내 쓴다.
 */
import { useSyncExternalStore } from 'react';
import { getAppState, subscribeApp, type AppState } from './appStore';

export function useAppState(): AppState {
  return useSyncExternalStore(subscribeApp, getAppState, getAppState);
}
