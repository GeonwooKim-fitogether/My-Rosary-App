/**
 * 이번 세션의 성화 뽑기.
 *
 * 모듈이 처음 불릴 때 한 번 만들어지고 앱이 살아 있는 동안 같은 것이 쓰인다.
 * 그래서 화면을 오가도 같은 여정에는 같은 그림이 따라붙는다 (FR-23 의 취지).
 */
import { createArtSession } from './session';

export const artSession = createArtSession();
