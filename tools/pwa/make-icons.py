"""
설치형 웹앱의 아이콘을 그린다 (W4 슬라이스 A).

**이 아이콘은 자리 지킴이다.** 진짜 아이콘은 사람이 그릴 일이고, 여기서는 "홈 화면에
추가" 가 실제로 무엇을 놓는지 눈으로 확인할 수 있을 만큼만 그린다. 그림을 짓는 값은
둘 다 이 저장소에 이미 있는 것에서 가져왔다 — 바탕은 `app.json` 의 `backgroundColor`
(#EDE7D8, 시작 화면과 같은 종이색)이고, 십자가는 같은 파일의 `primaryColor`(#1F2530,
먹빛)다. 새 색을 지어내지 않았다.

**시안의 성화를 쓰지 않은 까닭.** 시안(`docs/design/world/manifest.webmanifest`)은
성화 한 장(`img/04-cross.jpg`)을 아이콘으로 적어 두었는데, 이 저장소에 있는 같은 그림
(`assets/art/world/04-cross.jpg`)에는 **그린 사람의 서명과 워터마크가 찍혀 있다.**
홈 화면에 남의 스튜디오 이름이 박힌 아이콘을 놓을 수는 없어 직접 그렸다.

**마스크 안쪽에 들어가게 그렸다.** 안드로이드는 아이콘을 동그라미·네모 등으로 잘라
내는데(maskable), 잘려도 살아남는 자리는 가운데 80% 뿐이다. 그래서 십자가를 한가운데
지름 80% 원 안에 들어가도록 두어, `purpose` 에 `any` 와 `maskable` 을 함께 적을 수 있다.

    python3 tools/pwa/make-icons.py

만들어지는 것: public/icons/icon-192.png · icon-512.png · apple-touch-icon-180.png
"""

from PIL import Image, ImageDraw

PAPER = (0xED, 0xE7, 0xD8)
INK = (0x1F, 0x25, 0x30)

# 그림을 한 번 크게 그린 뒤 줄인다 — 작은 판에서 직접 그리면 모서리가 거칠다.
MASTER = 1024


def draw_master() -> Image.Image:
    image = Image.new("RGB", (MASTER, MASTER), PAPER)
    pen = ImageDraw.Draw(image)
    size = MASTER

    # 세로 기둥과 가로 팔. 값은 모두 변의 비율이라 어느 크기로 줄여도 같은 모양이다.
    pen.rectangle([0.450 * size, 0.220 * size, 0.550 * size, 0.800 * size], fill=INK)
    pen.rectangle([0.280 * size, 0.360 * size, 0.720 * size, 0.460 * size], fill=INK)
    return image


def main() -> None:
    master = draw_master()
    for name, side in (
        ("public/icons/icon-192.png", 192),
        ("public/icons/icon-512.png", 512),
        ("public/icons/apple-touch-icon-180.png", 180),
    ):
        master.resize((side, side), Image.LANCZOS).save(name, "PNG", optimize=True)
        print(f"{name} ({side}×{side})")


if __name__ == "__main__":
    main()
