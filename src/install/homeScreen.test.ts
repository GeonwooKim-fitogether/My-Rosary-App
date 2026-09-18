/**
 * 「홈 화면에 추가」의 가름 두 가지를 잰다 (W4 슬라이스 A).
 *
 * 브라우저가 있어야 하는 것(설치 창을 붙드는 일, 지금 놓여 있는지 보는 일)은 여기서 재지
 * 않는다 — 그것은 e2e 가 실제 브라우저에서 본다. 여기서 재는 것은 **브라우저 없이 답이
 * 정해지는 부분**, 곧 사용자 문자열 하나로 iOS 를 가려내는 셈이다.
 */
import { installGuideFor } from './homeScreen';

describe('installGuideFor — 어떤 방법을 알려 줄 것인가', () => {
  it('아이폰과 아이패드(옛 표기)는 iOS 로 본다', () => {
    expect(installGuideFor('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toBe('ios');
    expect(installGuideFor('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')).toBe('ios');
    expect(installGuideFor('Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X)')).toBe(
      'ios',
    );
  });

  it('iOS 의 크롬도 iOS 로 본다 — 속이 웹킷이라 설치 창이 없는 것은 같다', () => {
    expect(
      installGuideFor('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) CriOS/130.0'),
    ).toBe('ios');
  });

  /*
    아이패드가 자기를 맥이라고 말하는 자리(iPadOS 13 부터). 손가락 자리의 수로만 가를 수 있다.
  */
  it('맥이라고 말해도 손가락 자리가 여럿이면 아이패드로 본다', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/18.0 Safari/605.1.15';
    expect(installGuideFor(ua, 5)).toBe('ios');
  });

  it('진짜 맥은 손가락 자리가 없으므로 브라우저 안내로 간다', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/18.0 Safari/605.1.15';
    expect(installGuideFor(ua, 0)).toBe('browser');
  });

  it('안드로이드와 데스크톱은 브라우저 안내로 간다', () => {
    expect(installGuideFor('Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/130.0')).toBe(
      'browser',
    );
    expect(installGuideFor('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0')).toBe(
      'browser',
    );
  });
});
