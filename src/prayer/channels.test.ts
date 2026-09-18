/**
 * 소리 채널 시험 — **"소리가 안 난다"는 사고를 다시 내지 않기 위한 시험이다.**
 *
 * 2026-09-09 에 공방장이 폰에서 기도를 바치는데 아무 소리도 나지 않았다. 원인은 음성이
 * 없는 기기가 아니라 이 파일의 판정이었다. 브라우저는 음성 목록을 페이지가 열린 뒤에
 * 뒤늦게 채우므로 처음 물으면 빈 목록이 돌아오는데, 그 빈 목록을 "이 기기에는 음성이
 * 없다"로 읽고 앱이 스스로 읽지 않기로 낮춰 버렸다. 오류는 한 줄도 나지 않았다.
 *
 * 그래서 여기서 못 박는 것은 하나다 — **모른다와 없다는 다르다.** 목록을 받지 못했으면
 * `unknown` 이어야 하고, 부르는 쪽은 그때 낮추지 않는다.
 */
const mockSpeak = jest.fn();
const mockVoices = jest.fn();

jest.mock('expo-speech', () => ({
  speak: (...args: unknown[]) => mockSpeak(...args),
  stop: jest.fn(),
  getAvailableVoicesAsync: () => mockVoices(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
  Vibration: { vibrate: jest.fn() },
}));

import { Vibration } from 'react-native';
import { koreanVoiceStatus, primeSpeech, setHapticEnabled, vibrate } from './channels';

beforeEach(() => {
  mockSpeak.mockClear();
  mockVoices.mockReset();
});

describe('한국어 음성이 있는지 묻기', () => {
  it('목록에 한국어가 있으면 yes 다', async () => {
    mockVoices.mockResolvedValue([
      { language: 'en-US' },
      { language: 'ko-KR' },
    ]);
    await expect(koreanVoiceStatus(500)).resolves.toBe('yes');
  });

  it('목록을 받았는데 한국어가 없으면 no 다 — 이때만 읽지 않기로 낮춘다', async () => {
    mockVoices.mockResolvedValue([{ language: 'en-US' }]);
    await expect(koreanVoiceStatus(500)).resolves.toBe('no');
  });

  it('목록이 끝내 비어 있으면 no 가 아니라 unknown 이다 — 이것이 소리가 사라진 원인이었다', async () => {
    mockVoices.mockResolvedValue([]);
    await expect(koreanVoiceStatus(500)).resolves.toBe('unknown');
  });

  it('처음에는 비었다가 뒤늦게 채워지면 채워진 목록으로 판정한다 — 브라우저가 이렇게 준다', async () => {
    mockVoices
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValue([{ language: 'ko-KR' }]);
    await expect(koreanVoiceStatus(3000)).resolves.toBe('yes');
  });

  it('묻는 일 자체가 실패해도 unknown 이지 no 가 아니다', async () => {
    mockVoices.mockRejectedValue(new Error('음성 기능이 없다'));
    await expect(koreanVoiceStatus(500)).resolves.toBe('unknown');
  });
});

describe('소리 엔진 깨우기', () => {
  it('웹에서는 들리지 않는 낭송 하나를 곧바로 내보낸다', () => {
    primeSpeech();
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockSpeak.mock.calls[0]![0]).toBe(' ');
  });

  it('음성을 지원하지 않는 브라우저에서도 오류를 내지 않는다', () => {
    mockSpeak.mockImplementationOnce(() => {
      throw new Error('speechSynthesis 가 없다');
    });
    expect(() => primeSpeech()).not.toThrow();
  });
});

/* ── 진동을 끄는 스위치 (W2 슬라이스 C — 설정의 `진동` 줄) ─────────────────────────
   이 시험이 있어야 하는 이유는 설정의 토글 하나가 **실제로 기기까지 닿는지**를 말로만
   적으면 확인할 수 없기 때문이다. 앱이 떨리는 자리는 `vibrate` 하나뿐이므로, 그 하나가
   스위치를 지키면 기도 전체가 조용해진다. ─────────────────────────────────────── */

describe('진동 스위치', () => {
  /*
    **기기로 나가는 마지막 한 걸음을 가로채서 센다.** 이 파일 맨 위의 `jest.mock('react-native')`
    으로는 진동을 가로챌 수 없다 — 시험이 도는 환경에서 `react-native` 는 `react-native-web` 으로
    이어지고, 그 판의 `Vibration` 은 위 흉내가 덮지 못한다(실측, 2026-09-18). 덮지 못한 채로 두면
    진짜 구현이 불려 `window` 가 없다는 오류를 내고, 그 오류를 `vibrate` 의 안전망이 삼켜서
    **시험은 조용히 "떨리지 않았다"로 읽는다.** 그래서 실제로 불리는 그 함수를 직접 감시한다.
  */
  const spy = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});

  beforeEach(() => {
    spy.mockClear();
    setHapticEnabled(true);
  });

  afterAll(() => spy.mockRestore());

  afterAll(() => setHapticEnabled(true));

  it('켜져 있으면 기기에 떨림을 요청한다', () => {
    vibrate([40]);
    expect(spy).toHaveBeenCalledWith(40);
  });

  it('끄면 기기에 아무것도 요청하지 않는다', () => {
    setHapticEnabled(false);
    vibrate([40]);
    vibrate([10, 20, 10]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('다시 켜면 그 자리에서 되돌아온다 — 앱을 다시 열 필요가 없다', () => {
    setHapticEnabled(false);
    vibrate([40]);
    setHapticEnabled(true);
    vibrate([40]);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
