/**
 * 기기의 저장 자리 — 앱이 실제로 쓰는 자리 창고 한 벌.
 *
 * `position.ts` 는 저장소를 모르게 만들어 두었고(그래야 시험이 기기 없이 돈다), 이
 * 파일이 그 구멍에 실제 저장소를 끼운다. AsyncStorage 는 iOS·Android 에서는 기기의
 * 저장소를, 웹에서는 브라우저의 localStorage 를 쓴다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPositionStore } from './position';

export const positionStore = createPositionStore(AsyncStorage);
