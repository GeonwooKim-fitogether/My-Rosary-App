/**
 * 하트 하나 — 즐겨찾기를 나타내는 그림 (W3 슬라이스 B).
 *
 * 선분은 「MyRosary World」 시안의 갤러리·감상 화면에 적힌 `<path>` 를 글자 하나 바꾸지
 * 않고 옮긴 것이다. **담겼으면 속을 같은 색으로 채우고, 아니면 테만 그린다** — 시안의
 * `favFill` 이 하는 일이 그것이고, 켜짐과 꺼짐이 색만으로 갈리지 않게 하는 장치이기도
 * 하다(색만으로 상태를 말하지 않는다).
 *
 * 화면 둘이 같은 그림을 쓰므로 부품으로 갈라 두었다 — 갤러리 격자의 18px 짜리와 감상
 * 화면 아래 띠의 20px 짜리다.
 */
import Svg, { Path } from 'react-native-svg';

export function Heart({ on, color, size }: { on: boolean; color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"
        fill={on ? color : 'none'}
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
