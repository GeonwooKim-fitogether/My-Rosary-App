# 성화를 새로 만들 때 쓰는 프롬프트 열여섯 벌

> **초안이다. 그림을 실제로 바꾸는 것은 공방장의 결정 뒤에 한다.**

> 한 줄 요지: **Claude 는 이 작업 환경에서 그림을 만들 수 없다.** 그래서 대신, 공방장이 쓰시는 이미지 도구에 그대로 붙여 넣을 수 있는 프롬프트 열여섯 벌을 만들었다. 앱이 실제로 요구하는 세 가지 조건 — 세로 비율, 인물이 앉을 자리, 글자가 덮는 자리 — 을 코드에서 재서 프롬프트 안에 넣어 두었으므로, 나온 그림을 그대로 넣으면 지금 화면이 그대로 산다.

## 1. 먼저 바로잡을 것 — 글씨가 문제가 아니다

"글씨가 들어간 그림이 문제가 될 것 같다"는 직관은 방향은 맞지만 원인을 거꾸로 짚은 것이다. **글씨는 문제가 아니라 영수증이다.**

| | 사실 |
|---|---|
| 글씨가 있는 여섯 장 | 누구의 그림인지 **드러나 있다** |
| 글씨가 없는 열 장 | 누구의 그림인지 **알 수 없다** |

두 무리의 법적 처지는 같다. 어느 쪽도 쓸 권리를 확보한 적이 없고, 다만 한쪽은 주인이 누구인지 보이고 다른 쪽은 보이지 않을 뿐이다. 그래서 **글씨만 지우거나 글씨 있는 것만 바꾸면 상황이 나아지지 않는다.** 오히려 나빠지는 쪽이 있다 — 워터마크를 지우고 쓰는 것은 "몰랐다"고 말할 수 없게 만드는 행위라, 분쟁이 생겼을 때 훨씬 불리해진다. 그러니 지우는 길은 없다.

**그래서 "전부 새로 만든다"는 판단은 옳다.** 열여섯 장을 한 번에 새로 만들면 글씨 있는 것과 없는 것을 가릴 필요 자체가 사라지고, 출처가 하나로 정리되며, 앱의 그림이 처음으로 "우리 것"이 된다. 이 문서는 그 길을 위한 것이다.

## 2. Claude 가 할 수 있는 것과 없는 것

**없는 것: 그림을 만드는 일.** 이 작업 환경에는 이미지를 만드는 도구가 없다(도구 목록을 실제로 찾아 확인했다). 바깥 인터넷도 조직 정책으로 막혀 있어 이미지 생성 서비스를 부를 수도 없다.

**있는 것: 그 도구에 넣을 말을 정확히 만드는 일.** 아래 프롬프트에는 앱을 읽어서만 알 수 있는 조건이 들어 있다 — 인물이 화면의 어디에 앉아야 하는지, 아래쪽 몇 퍼센트가 기도문에 덮이는지, 어떤 비율로 만들어야 잘리지 않는지. 일반적인 "성모 마리아 그림" 프롬프트로는 이 조건이 들어가지 않아, 만들고 나서 화면에 넣어 보면 얼굴이 잘리거나 글자에 묻힌다.

**그리고: 받아서 앱에 넣는 일.** 그림이 오면 파일 이름을 맞추고, 초점 좌표를 다시 잡고, 화면 사진을 다시 찍어 전/후를 나란히 보여 드리는 것까지 제가 한다.

## 3. 앱이 요구하는 조건 — 코드에서 재서 확인한 셋

### 3-1. 아래쪽 40% 는 기도문이 덮는다

기도 화면은 그림 위에 덮개(어두운 그라데이션)를 얹어 글자를 읽게 한다. 그 덮개의 값을 `app/pray.tsx` 에서 읽으면 이렇다.

| 화면 높이의 위치 | 덮개의 불투명도 |
|---|---|
| 위쪽 0% | 0 (그림이 그대로 보인다) |
| 58% | 0.88 |
| 72% | 0.97 |
| 아래쪽 100% | 1.0 (그림이 전혀 보이지 않는다) |

즉 **화면의 아래 절반 가까이는 사실상 그림이 보이지 않는다.** 그러므로 인물·얼굴·중심 형상은 **위쪽 절반 안에** 있어야 하고, 아래쪽은 조용한 배경(구름·빛·천·물결)이어야 한다. 아래쪽에 중요한 것을 그리면 만든 보람 없이 덮인다.

### 3-2. 초점은 이미 정해져 있다

앱은 그림마다 "이 점이 화면 가운데 오게 하라"는 좌표를 갖고 있다(`src/art/worldPlates.ts` 의 `focal`). 지금 값은 세로 22%~55% 사이에 몰려 있는데, 이것이 곧 **얼굴이 있는 높이**다. 새 그림도 같은 높이에 얼굴이 오면 좌표를 고치지 않아도 된다.

### 3-3. 비율은 세로 9:16 하나로 통일하기를 권한다

지금 열여섯 장은 비율이 제각각이고(정사각형 둘, 3:4 셋, 9:16 셋 등), **정사각형 그림은 기도 화면의 세로 틀에 들어갈 때 좌우가 크게 잘린다.** 새로 만들 때는 전부 **세로 9:16(예: 1080×1920)** 으로 뽑는 것이 낫다. 갤러리의 격자에서는 세로 그림도 잘 보이므로 잃는 것이 없다.

## 4. 공통 스타일 — 열여섯 장이 한 벌로 보이게 하는 문장

**프롬프트마다 이 문단을 그대로 붙인다.** 이것이 빠지면 열여섯 장이 서로 다른 화가가 그린 것처럼 흩어지고, 갤러리를 넘길 때 한 벌로 읽히지 않는다.

```
Soft impasto oil painting on canvas. Thick visible palette-knife strokes and
tactile paint texture. Warm ivory, pale gold and soft cream light with a
luminous glow behind the figure. Serene simplified faces, no hard outlines,
gentle sfumato edges. Quiet devotional stillness, reverent and modern rather
than antique. Vertical 9:16 composition: the figure sits in the UPPER HALF of
the frame, and the LOWER 40% is calm, uncluttered and low-contrast so that
text can rest over it. No text, no lettering, no signature, no watermark, no
logo, no border, no frame.
```

마지막 한 줄(`No text, no lettering, no signature, no watermark, no logo`)을 **빼지 않는다.** 이번 일이 생긴 원인이 바로 그것이다.

## 5. 프롬프트 열여섯 벌

각 줄은 위 공통 스타일 문단 **뒤에** 붙인다. 번호는 지금 앱이 쓰는 파일 번호와 같으므로, 받은 그림을 그 번호로 저장하면 그대로 들어간다.

| # | 지금 제목 | 붙일 문장 (영어) |
|---|---|---|
| 01 | 빛 가운데 서신 성모 | `The Virgin Mary standing in radiant light, hands joined in prayer, flowing white and ivory veil, rising above soft luminous clouds that fill the lower half.` |
| 02 | 성모와 아기 예수 | `The Virgin Mary holding the infant Jesus close to her cheek, tender and quiet, warm golden light from the upper left, soft drapery falling into the lower frame.` |
| 03 | 기도하시는 예수 | `Jesus in prayer, head slightly bowed, hands joined, gentle light falling from above, simple robe, a still dim landscape fading into the lower frame.` |
| 04 | 빈 무덤의 십자가 | `A wooden cross standing against a wide dawn sky, the empty tomb suggested in soft shadow behind it, warm first light breaking across the upper frame.` |
| 05 | 착한 목자 | `The Good Shepherd carrying a lamb across his shoulders, walking in warm pastoral light, gentle hillside softening into the lower frame.` |
| 06 | 손을 내미시는 예수 | `Jesus seen from the side, one hand reaching outward toward the viewer, warm light catching the open palm, quiet dark ground below.` |
| 07 | 성가정 | `The Holy Family together — Mary, Joseph and the child Jesus — gathered close in warm lamplight, relief-like shallow depth, soft shadow filling the lower frame.` |
| 08 | 성모의 옆모습 | `The Virgin Mary in profile, eyes lowered in prayer, veil catching a rim of pale gold light, deep quiet background.` |
| 10 | 푸른 옷의 성모 | `The Virgin Mary in a deep blue mantle over an ivory robe, hands folded, calm frontal pose, cool blue light meeting warm gold at the edges.` |
| 11 | 묵주를 든 기도 | `A pair of hands holding a rosary in prayer, beads catching the light, warm shadow, the hands placed in the upper half with quiet dark cloth below.` |
| 12 | 성모와 아기 | `The Virgin Mary with the infant Jesus resting against her, both calm and still, neutral warm palette, soft veil filling the lower frame.` |
| 13 | 물 위를 걸으시는 예수 | `Jesus walking on water at dawn, robe moving in the wind, cool blue and slate water with a warm break of light on the horizon, the figure held in the upper half.` |
| 14 | 부활 | `The risen Christ rising in light, arms opening, brilliant white and gold radiance filling the upper frame, the stone and shadow of the tomb dissolving below.` |
| 15 | 빛을 향한 무리 | `A multitude of figures seen from behind, walking together toward a great warm light on the horizon, silhouettes softening into the lower frame.` |
| 16 | 성령 | `A descending dove in radiant light, wings open, rays of pale gold breaking outward across the upper frame, quiet luminous haze below.` |
| 17 | 빈 무덤 앞의 마리아 | `Mary standing before the empty tomb at daybreak, seen slightly from behind, dark stone and deep shadow with a narrow band of dawn light at the opening.` |

**`09` 번은 만들지 않는다.** 그 번호는 시안 단계에서 이미 빠져 앱에 실려 있지 않다.

## 6. 어떤 도구로 만드느냐가 권리를 가른다 — 이것만은 확인하고 시작한다

새로 만든다고 권리 문제가 저절로 풀리는 것은 아니다. **이미지 도구마다 "만든 그림을 상업적으로 써도 되는가"와 "그 그림의 권리가 누구에게 있는가"의 답이 다르다.** 유료 앱으로 팔 계획이면 특히 그렇다.

**시작하기 전에 쓰려는 도구의 약관에서 두 줄만 확인하십시오.**

1. 이 도구로 만든 그림을 **상업적으로** 써도 되는가 (무료 요금제에서는 안 되는 도구가 있다).
2. 만든 그림의 권리가 **사용자에게** 오는가.

**Claude 가 여기서 특정 도구를 추천하지 않는 이유를 밝혀 둔다.** 이 작업 환경은 바깥 인터넷에 나갈 수 없어 각 도구의 **현재** 약관을 직접 읽어 확인할 수 없다. 약관은 바뀌므로, 기억에 의존해 "이 도구는 괜찮다"고 적는 것은 이번에 문제가 된 것과 같은 종류의 근거 없는 확신이다. 대신 무엇을 확인해야 하는지만 정확히 적어 둔다.

확인한 답은 `decisions.md` 에 한 줄로 남긴다 — 나중에 "이 그림들을 어디서 얻었나"를 다시 묻는 일이 없게 하려는 것이며, 이번 일에서 가장 크게 잃은 것이 바로 그 기록이었다.

## 7. 그림이 오면 Claude 가 하는 일

1. 파일을 `assets/art/world/` 와 `docs/design/world/img/` 에 같은 번호로 넣는다(두 곳의 파일은 바이트까지 같아야 한다).
2. `src/art/worldPlates.ts` 의 초점 좌표(`focal`)와 밝기(`tone`)를 새 그림에 맞게 다시 잡고, 워터마크 표시(`mark`)를 지운다.
3. 그림의 출처를 적는 칸을 표에 새로 만든다 — 이번 일의 재발을 막는 장치다.
4. 화면 사진을 다시 찍어 **전/후를 나란히** 보여 드린다. 기도 화면·홈·갤러리 셋 다.
5. 스토어에 올릴 사진 열 장도 다시 찍는다.

**필요한 것은 그림 파일 열여섯 장뿐이다.** 번호를 파일 이름에 넣어 주시면(예: `01.jpg`) 나머지는 제가 맞춥니다.
