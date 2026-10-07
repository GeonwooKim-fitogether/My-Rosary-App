# 공방장이 처음 올린 성화 열일곱 장 — 원본 파일 이름

> 한 줄 요지: **이 폴더의 그림은 앱이 쓰는 성화와 바이트까지 같고, 다른 것은 파일 이름 하나뿐이다.** 그리고 그 이름이 이 그림들이 어디서 왔는지를 말한다.

이 폴더는 「MyRosary World」 인계 zip 의 `project/uploads/01_Approved_Sacred_Images/` 를 그대로 옮긴 것이다. 2026-09-18 까지 이 폴더는 저장소에 없었고, 그래서 **성화의 출처를 묻는 일이 몇 주 동안 답을 찾지 못했다**(`decisions.md` Q-86, `docs/plan/art-rights.md` §1-2).

## 이름이 말하는 것

| 원본 파일 이름 | 앱에서 쓰는 이름 | 이름이 말하는 것 |
|---|---|---|
| `01_Mary_Single.jpg` | `01-mary-single.jpg` | 공방장이 번호를 붙여 정리한 이름. 원래 이름은 지워졌다 |
| `02_Mary_and_Child.jpg` | `02-mary-child.jpg` | 공방장이 번호를 붙여 정리한 이름. 원래 이름은 지워졌다 |
| `03_Prating_Jesus.jpg` | `03-praying-jesus.jpg` | 공방장이 번호를 붙여 정리한 이름. 원래 이름은 지워졌다 |
| `04_Cross.jpg` | `04-cross.jpg` | 공방장이 번호를 붙여 정리한 이름. 원래 이름은 지워졌다 |
| `05_Jesus_and_Sheep.jpg` | `05-jesus-sheep.jpg` | 공방장이 번호를 붙여 정리한 이름. 원래 이름은 지워졌다 |
| `06_Side_Jesus.jpg` | `06-side-jesus.jpg` | 공방장이 번호를 붙여 정리한 이름. 원래 이름은 지워졌다 |
| `07_Relief_Holy_Family.jpg` | `07-relief-holy-family.jpg` | 공방장이 번호를 붙여 정리한 이름. 원래 이름은 지워졌다 |
| `08_Mary_Profile.jpg` | `08-mary-profile.jpg` | 공방장이 번호를 붙여 정리한 이름. 원래 이름은 지워졌다 |
| `09_Color_Jesus.jpg` | `09-color-jesus.jpg` | 공방장이 번호를 붙여 정리한 이름. 원래 이름은 지워졌다 |
| `10_Blue_Mary.jpg` | `10-blue-mary.jpg` | 공방장이 번호를 붙여 정리한 이름. 원래 이름은 지워졌다 |
| `Christian Prayer Art With Rosary _ Faith Inspired Religious Wall Decor.jpg` | `11-prayer-rosary.jpg` | **판매·공유 사이트 게시물의 제목.** 검색에 걸리게 하려고 붙이는 긴 설명형 제목이 그대로 파일 이름이 됐다 |
| `Virgin Mary with child wall art neutral tones, modern Christian decor for warm family homes.jpg` | `12-mary-child-neutral.jpg` | **판매·공유 사이트 게시물의 제목.** 검색에 걸리게 하려고 붙이는 긴 설명형 제목이 그대로 파일 이름이 됐다 |
| `다운로드 (13).jpg` | `13.jpg` | **브라우저 내려받기 기본 이름.** 크롬이 한국어 환경에서 같은 이름을 거듭 받을 때 붙인다 |
| `다운로드 (14).jpg` | `14.jpg` | **브라우저 내려받기 기본 이름.** 크롬이 한국어 환경에서 같은 이름을 거듭 받을 때 붙인다 |
| `다운로드 (15).jpg` | `15.jpg` | **브라우저 내려받기 기본 이름.** 크롬이 한국어 환경에서 같은 이름을 거듭 받을 때 붙인다 |
| `다운로드 (16).jpg` | `16.jpg` | **브라우저 내려받기 기본 이름.** 크롬이 한국어 환경에서 같은 이름을 거듭 받을 때 붙인다 |
| `다운로드 (17).jpg` | `17.jpg` | **브라우저 내려받기 기본 이름.** 크롬이 한국어 환경에서 같은 이름을 거듭 받을 때 붙인다 |

## 대조는 해시로 했다

위 표의 짝은 눈으로 고른 것이 아니라 **파일 내용의 md5 지문을 맞춰 얻은 것**이다. 같은 줄의 두 파일은 바이트까지 같다. 다시 확인하려면 이렇게 한다.

```bash
md5sum 'docs/design/world/uploads/01_Approved_Sacred_Images/다운로드 (13).jpg' assets/art/world/13.jpg
```

## 이 폴더를 지우지 않는다

그림 자체는 `assets/art/world/` 와 중복이다. 그런데도 남겨 두는 이유는 **이름이 증거이기 때문**이다. 성화의 권리를 정리하는 일에서, "이 그림을 어디서 얻었나"에 답하는 유일한 물증이 이 파일 이름들이다. 그림이 새 것으로 바뀌어도 이 폴더는 기록으로 남는다.
