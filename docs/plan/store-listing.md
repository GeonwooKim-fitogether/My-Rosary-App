# 스토어 메타 초안 — App Store · Google Play

> **초안 — 사람의 승인 전에는 제출하지 않는다.**

> 한 줄 요지: **여기 적힌 글은 전부 이 저장소가 이미 가진 문장에서 가져와 스토어의 말투로 옮긴 것이고, 새로 기획한 것은 한 줄도 없다.** 출처는 `CLAUDE.md` 맨 위 한 줄, `docs/product/06-prd.md` §1, 그리고 앱 안 소개 시트의 실제 문구(`src/i18n/appStrings.ts` 의 `aboutWhat*` · `aboutAsk*` · `aboutNotYet*`)다.

이 문서는 W5(출시)가 열렸을 때 바로 쓸 수 있게 미리 적어 두는 초안이다. **W5 는 아직 열리지 않았다** — 3차 판정이 앞에 있다(`docs/plan/roadmap-world.md`). 그러니 이 글은 제출용 원고가 아니라 **사람이 고치고 승인할 재료**다.

## 0. 먼저 사람이 정해야 하는 것 둘

글을 쓰기 전에 걸린 자리가 둘 있다. 지어내지 않고 그대로 올린다.

1. **앱 이름은 `MyRosary` 다 (2026-09-18 공방장 결정, `decisions.md` Q-82).** 그전에는 저장소 안에서 두 가지였다 — 앱 설정 파일의 이름이 `묵주`, 화면에 보이는 이름이 `MyRosary World` 였다. 지금은 다섯 자리를 모두 `MyRosary` 로 맞췄다: `app.json` · 화면 문구 일곱 벌 · 설치형 웹앱 설명서의 이름과 짧은 이름 · 웹 껍데기의 애플용 제목.
2. **부제의 한국어를 무엇으로 할지.** 앱 안에 이미 있는 한 줄(`tagline`)이 `손에 든 묵주, 눈앞의 성화` 인데, 이것은 시안이 지은 분위기 문구이지 "이 앱이 무엇을 해 주는가"를 말하지 않는다. 아래에 둘을 나란히 적었으니 사람이 고른다.

## 1. 이름과 부제

| 칸 | 한국어 | 영어 | 글자 수 제한 |
|---|---|---|---|
| **앱 이름** | MyRosary | MyRosary | 두 스토어 모두 30자 |
| **부제 (안) 가** | 손에 든 묵주, 눈앞의 성화 | A rosary in hand, sacred art before the eyes | 애플 30자 |
| **부제 (안) 나** | 54일을 끝까지 바치는 묵주기도 (17자) | 54 days of the Rosary (21자) | 애플 30자 |

**안 가**는 앱 안에 이미 있는 문구 그대로이고, **안 나**는 `CLAUDE.md` 맨 위 한 줄에서 옮긴 것이다.

**영어 안 가는 그대로 쓸 수 없다.** `A rosary in hand, sacred art before the eyes` 는 44자라 애플의 부제 칸(30자)에 들어가지 않는다. 영어에서 안 가를 고르려면 `A rosary in hand` (16자)처럼 줄여야 하고, 그 줄임을 승인하는 것도 사람의 몫이다. 한국어 안 가(`손에 든 묵주, 눈앞의 성화`, 14자)는 그대로 들어간다.

구글 플레이에는 부제 칸이 없고 대신 **짧은 설명**(80자)이 그 자리를 한다.

## 2. 짧은 설명 (구글 플레이 · 80자)

| | 글 | 글자 수 |
|---|---|---|
| 한국어 | 바람 하나를 정하고 54일 동안 날마다 묵주기도를 바쳐 끝까지 갑니다. | 39 |
| 영어 | Choose one intention and pray the Rosary every day for fifty-four days. | 71 |

## 3. 긴 설명

두 스토어 모두 4,000자까지다. 아래 원고는 한국어 약 700자, 영어 약 1,300자로 한참 짧은데, **없는 기능을 적지 않으려고 실제로 있는 것만 적었기** 때문이다.

### 3-1. 한국어

```
MyRosary 는 바람 하나를 정하고 54일 동안 날마다 묵주기도를 바쳐
완주하게 하는 묵주기도 앱입니다.

묵주와 기도문 책이 없어도, 화면을 보지 않고도, 중간에 끊겨도 이어서
끝까지 갈 수 있게 만들었습니다.

■ 여정
바람(지향)을 한 줄 적고 형식을 고르면 완료일이 정해집니다. 54일 기도
(27일 청원 + 27일 감사) · 9일 기도 · 기간 없이 날마다 중에서 고릅니다.
오늘이 며칠째인지, 청원 중인지 감사 중인지가 늘 보입니다.

■ 하루의 기도
오늘 무슨 신비로 바칠지는 앱이 정해 알려 줍니다. 시작 기도부터 마침
기도까지 여든한 단계를 순서대로 넘기고, 화면의 묵주 위에서 지금 알
하나가 밝아집니다.

■ 화면을 보지 않고
낭송 방식을 고를 수 있습니다 — 전부 읽어 주기, 읽지 않기, 그리고 앱이
앞 절을 읽으면 뒷 절을 소리 내어 받는 교대 낭송. 손 없이 조작을 켜면
폰을 흔들거나 이어폰 단추로 알을 넘깁니다.

■ 끊겨도 이어서
알을 넘길 때마다 자리가 저장됩니다. 전화가 오거나 앱이 꺼져도 바치던
자리에서 다시 시작합니다.

■ 성화
지역(한국·아시아·유럽·남북아메리카)에 따라 다른 성화가 기도의 배경이
됩니다. 갤러리에서 모아 보고, 마음에 드는 한 장을 고정할 수 있습니다.

■ 이 앱이 담지 않는 것
계정이 없습니다. 회원가입도, 로그인도, 서버로 올라가는 기록도 없습니다.
모든 기록은 이 폰 안에만 있습니다. 기기를 바꿀 때를 위해 기록을 파일
하나로 내보내고 들여올 수 있습니다.

한국어와 영어를 지원합니다.
```

### 3-2. 영어

```
MyRosary helps you choose one intention and pray the Rosary every
day for fifty-four days, all the way to the end.

It is made so you can do that without a rosary or a prayer book, without
looking at the screen, and even if you miss a day.

■ The journey
Write your intention in one line, choose a format, and the completion
date is set for you. Choose the fifty-four day devotion (27 days of
petition and 27 days of thanksgiving), a nine-day novena, or simply
every day with no end date. Which day you are on, and whether you are
in petition or thanksgiving, is always in view.

■ One day of prayer
The app decides which mysteries today calls for and tells you. You move
through all eighty-one steps in order, from the opening prayers to the
closing ones, and one bead on the on-screen rosary glows as your place.

■ Without looking at the screen
Choose how the prayers are said: read everything aloud, read nothing, or
alternate, where the app reads the first half of each prayer and you
answer with the second. Turn on hands-free and a shake of the phone or
the earphone button moves you to the next bead.

■ Interrupted, then continued
Your place is saved at every bead. If a call comes in or the app closes,
you begin again exactly where you left off.

■ Sacred art
The art behind your prayer changes with the region you choose (Korea,
Asia, Europe, North America, South America). Browse it in the gallery
and pin the one you want to keep.

■ What this app does not have
There is no account. No sign-up, no sign-in, and nothing uploaded to a
server. Every record stays on this phone. For when you change devices,
you can export your records to a single file and bring them back.

Available in Korean and English.
```

## 4. 키워드 (애플 · 쉼표를 포함해 100자)

애플의 키워드 칸은 검색에만 쓰이고 사용자에게 보이지 않는다. 앱 이름과 부제에 이미 든 말은 넣지 않는 것이 관행이므로 뺐다.

| | 키워드 | 글자 수 |
|---|---|---|
| 한국어 | 묵주,묵주기도,로사리오,가톨릭,천주교,기도,성모,54일,구일기도,묵상,신비,성화 | 44 |
| 영어 | rosary,catholic,prayer,novena,mysteries,devotion,virgin mary,beads,meditation | 77 |

구글 플레이에는 키워드 칸이 없다 — 설명 본문의 말이 그대로 검색에 쓰인다.

## 5. 개인정보 라벨 — 무엇을 **수집하지 않는지**가 답이다

이 앱에는 계정도 서버도 없고 네트워크로 나가는 통로가 아예 없다. 저장 층 전부(`src/storage/`)를 읽어 확인했고, 앱 코드 어디에도 바깥으로 무엇을 보내는 호출이 없다(`fetch` · 통계 도구 · 오류 수집 도구 0건). 그래서 두 스토어의 라벨은 모두 **"수집하지 않음"** 한 줄로 끝난다.

자세한 근거와 기기에 실제로 담기는 것의 목록은 [`privacy-policy.md`](./privacy-policy.md) 에 있다.

### 5-1. 애플 App Privacy

애플은 먼저 **"이 앱에서 데이터를 수집합니까?"** 를 묻고, `아니요` 를 고르면 나머지 항목이 전부 닫힌다.

| 애플이 묻는 것 | 답 | 근거 |
|---|---|---|
| 데이터를 수집합니까 | **아니요 (Data Not Collected)** | 앱이 기기 밖으로 어떤 값도 보내지 않는다 |
| 제삼자 도구가 수집합니까 | 아니요 | 통계·광고·오류 수집 도구를 하나도 넣지 않았다 |
| 추적(App Tracking Transparency) | 아니요 | 광고 식별자를 읽지 않는다 |

애플은 "수집"을 **기기 밖으로 내보내는 것**으로 정의하고, 기기 안에만 두고 밖으로 보내지 않는 값은 수집이 아니라고 명시한다. 이 앱의 여정·설정 기록이 정확히 그 경우다.

### 5-2. 구글 플레이 데이터 보안

| 구글이 묻는 것 | 답 |
|---|---|
| 데이터를 수집하거나 공유합니까 | **아니요** |
| 전송 중 암호화 | 해당 없음 — 전송 자체가 없다 |
| 사용자가 데이터 삭제를 요청할 수 있습니까 | 해당 없음 — 기록이 기기에만 있으므로 앱 안에서 여정을 지우거나 앱을 지우면 함께 사라진다 |
| 데이터 수집이 앱 사용에 필수입니까 | 해당 없음 |

**구글의 심사에서 한 가지를 미리 밝혀 둔다.** 데이터 보안 양식은 "수집하지 않음"으로 답하더라도 **개인정보 처리방침 주소는 언제나 요구한다.** 그 주소를 어디에 올릴지가 W5 에서 사람이 정할 일이고, 올릴 글은 [`privacy-policy.md`](./privacy-policy.md) 에 이미 준비돼 있다.

## 6. 아직 비어 있는 칸

이 문서가 채우지 못하는 칸을 감추지 않고 적는다.

| 칸 | 왜 비었나 |
|---|---|
| 스크린샷 | [`store-screenshots/`](./store-screenshots/) 에 있다. 다만 **실기기에서 찍은 것이 아니라 웹 빌드를 폰 크기로 띄워 찍은 것**이므로, 제출 전에 실기기 사진으로 바꿀지는 사람이 정한다 |
| 앱 아이콘 | 아직 없다. `assets/images/` 에 자리 지킴이만 있다 |
| 미리보기 영상 | 만들지 않았다. 두 스토어 모두 선택 사항이다 |
| 연령 등급 설문 | 사람이 스토어 화면에서 직접 답하는 항목이다 |
| 카테고리 | `참고` 또는 `라이프스타일` 이 후보다. 두 스토어의 분류가 서로 달라 사람이 고른다 |
