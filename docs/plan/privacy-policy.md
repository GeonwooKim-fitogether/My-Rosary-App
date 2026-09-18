# 개인정보 처리방침 초안 (한국어 · English)

> **초안 — 사람의 승인 전에는 제출하지 않는다.**

> 한 줄 요지: **이 앱은 어떤 개인정보도 수집하지 않는다.** 계정이 없고, 서버가 없고, 앱에서 바깥으로 나가는 통로가 아예 없다. 기도 기록과 설정은 **사용자의 기기 안에만** 저장된다.

## 이 문서를 읽는 법 — 무엇이 근거인가

아래 방침은 상상으로 쓴 것이 아니라 **실제 코드를 읽고 쓴 것**이다. 근거는 세 가지다.

1. **저장 층 전부를 읽었다** — `src/storage/` 의 일곱 파일. 기기에 담기는 값과 그 이름이 아래 §2 표의 그대로다.
2. **바깥으로 나가는 호출이 하나도 없다** — 앱 코드 전체에서 `fetch` · 통계 도구 · 광고 도구 · 오류 수집 도구를 찾아 **0건**이다.
3. **설치되는 부품 목록을 확인했다**(`package.json`) — 네트워크를 쓰는 부품이 없다.

**이 근거는 코드가 바뀌면 함께 바뀐다.** 나중에 계정이 붙거나(로드맵의 V1.5) 통계 도구가 들어오면 이 문서는 그 자리에서 다시 써야 한다. 그러지 않으면 방침이 곧 거짓말이 된다.

## 사람이 채워야 하는 빈칸 둘

지어내지 않고 비워 둔다.

1. **문의 받을 전자우편 주소.** 두 스토어 모두 방침 안에 연락처를 요구한다. 아래 원고에는 `[문의 주소]` 로 두었다.
2. **이 방침을 올릴 공개 주소.** 스토어 등록 화면이 주소 하나를 요구하며, 데이터를 수집하지 않아도 요구한다. 어디에 올릴지는 W5 에서 사람이 정한다.

---

## 1. 한국어 원고

```
개인정보 처리방침

최종 수정일: [승인일]

MyRosary World(이하 "이 앱")는 이용자의 개인정보를 수집하지 않습니다.

1. 수집하지 않는 것

이 앱에는 계정이 없습니다. 회원가입도 로그인도 없으며, 이름·전자우편
주소·전화번호·생년월일 등 이용자를 알아볼 수 있는 어떤 정보도 입력받지
않고 수집하지 않습니다.

이 앱에는 서버가 없습니다. 이 앱은 어떤 정보도 외부로 전송하지 않습니다.
이용 기록을 분석하는 도구, 광고 도구, 오류 수집 도구를 일절 포함하지
않습니다. 광고 식별자를 읽지 않으며 이용자를 추적하지 않습니다.

위치 정보, 연락처, 사진, 통화 기록, 마이크 녹음을 수집하지 않습니다.

2. 기기 안에만 저장되는 것

이 앱이 제 역할을 하려면 기억해야 하는 것들이 있습니다. 아래 값들은 모두
이용자의 기기 안에만 저장되며, 기기 밖으로 나가지 않습니다.

- 기도 여정: 이용자가 적은 지향(바람) 한 줄, 기도의 형식(54일·9일·날마다),
  시작일, 날마다의 완주 여부, 낭송 방식
- 오늘 어디까지 바쳤는가: 여정 번호, 며칠째인지, 몇 번째 단계·단·알인지,
  그날의 신비, 마지막으로 저장한 시각, 이어서 바친 횟수, 기도에 든 시간
- 설정: 낭송 방식, 받는 사이, 손 없이 조작 켬/끔, 묵주 종류, 낮/밤, 진동
  켬/끔, 움직임 줄이기, 지역, 언어, 글자 크기
- 성화: 고정한 성화의 파일 이름, 즐겨찾기에 담은 성화의 파일 이름 목록,
  바로 앞에 보여 준 성화의 파일 이름
- 소개 화면을 본 적이 있는지 여부

이 중 이용자가 직접 적는 것은 지향(바람) 한 줄뿐입니다. 여기에 사람의
이름을 적을 수 있으나, 그 글 역시 기기 밖으로 나가지 않습니다.

이 값들은 앱(iOS·Android)에서는 기기의 앱 저장 공간에, 웹 브라우저에서
쓸 때는 그 브라우저의 저장 공간에 보관됩니다.

3. 기록 내보내기와 들여오기

이용자는 설정 화면에서 자신의 기록을 파일 하나로 내보낼 수 있습니다. 이
파일에는 기도 여정, 설정, 고정한 성화, 즐겨찾기가 담깁니다. 이 파일을
만드는 것도 어디에 두는 것도 이용자의 선택이며, 이 앱은 그 파일을 어디로도
보내지 않습니다.

파일을 다른 곳(전자우편, 클라우드 저장소, 메신저 등)으로 옮기는 순간부터
그 파일은 그곳의 방침을 따릅니다. 이 앱은 그 뒤의 일에 관여하지 않습니다.

4. 기기 기능의 사용

이 앱은 아래 기기 기능을 사용합니다. 어느 것도 정보를 수집하거나 전송하기
위한 것이 아닙니다.

- 동작 감지: "손 없이 조작"을 켰을 때 폰을 흔드는 동작으로 다음 알로
  넘어가기 위해 사용합니다. 움직임 값은 그 판단에만 쓰이고 저장되지
  않습니다.
- 소리 내어 읽기: 기기에 내장된 음성 기능에 기도문을 건네 읽게 합니다.
  건네는 것은 기도문이며 이용자의 정보가 아닙니다. 그 음성 기능이 기기
  안에서 도는지 아닌지는 기기와 운영체제가 정하며, 이 앱이 정하지
  않습니다.
- 진동, 화면 켜짐 유지: 기도 중에만 씁니다.
- 파일 고르기와 공유: 위 3항의 기록 내보내기·들여오기에만 씁니다.

5. 아동

이 앱은 어떤 이용자로부터도 개인정보를 수집하지 않으므로, 아동으로부터도
수집하지 않습니다.

6. 기록을 지우는 방법

기도 여정은 앱 안에서 하나씩 지울 수 있습니다. 앱을 기기에서 삭제하면
위 2항의 모든 값이 함께 사라집니다. 이 앱은 서버에 아무것도 두지 않으므로,
따로 삭제를 요청할 곳이 없습니다.

7. 방침의 변경

이 앱에 계정이나 동기화 기능이 추가되는 등 위 내용이 달라지면, 이 방침을
고치고 수정일을 새로 적습니다.

8. 문의

[문의 주소]
```

---

## 2. English draft

```
Privacy Policy

Last updated: [date of approval]

MyRosary World ("the app") does not collect any personal information.

1. What we do not collect

The app has no accounts. There is no sign-up and no sign-in. We do not
ask for and do not collect your name, email address, phone number, date
of birth, or any other information that could identify you.

The app has no server. The app does not transmit any information
anywhere. It contains no analytics, no advertising, and no crash
reporting tools. It does not read the advertising identifier and does
not track you.

We do not collect your location, contacts, photos, call history, or
microphone recordings.

2. What is stored on your device only

For the app to do its work, some things have to be remembered. All of
the following are stored only on your device and never leave it.

- Your prayer journeys: the intention you wrote in one line, the format
  (fifty-four days, novena, or daily), the start date, whether each day
  was completed, and how the prayers are said
- Where you are today: which journey, which day, which step, decade and
  bead, the mysteries for that day, when it was last saved, how many
  times you resumed, and how long you prayed
- Your settings: recitation mode, pace, hands-free on or off, rosary
  material, day or night, haptics on or off, reduced motion, region,
  language, and text size
- Sacred art: the file name of the art you pinned, the list of file
  names you marked as favourites, and the file name shown most recently
- Whether you have seen the introduction screen

The only thing here that you write yourself is the one-line intention.
You may put a person's name in it; that text also never leaves your
device.

On iOS and Android these values are kept in the app's own storage on the
device. In a web browser they are kept in that browser's storage.

3. Exporting and importing your records

From the settings screen you can export your records to a single file.
That file contains your journeys, your settings, your pinned art, and
your favourites. Creating that file and deciding where to keep it is
entirely your choice; the app does not send it anywhere.

Once you move that file somewhere else (email, cloud storage, a
messaging app), it is governed by the policy of that place. The app has
no part in what happens to it afterwards.

4. Device features the app uses

The app uses the following device features. None of them exists to
collect or transmit information.

- Motion sensing: when hands-free is turned on, shaking the phone moves
  you to the next bead. The motion values are used only for that
  decision and are not stored.
- Speech: the app hands the prayer text to the speech feature built into
  your device so it can be read aloud. What is handed over is the prayer
  text, not your information. Whether that speech feature runs entirely
  on the device is decided by your device and its operating system, not
  by this app.
- Vibration and keeping the screen awake: used only while you are
  praying.
- File picking and sharing: used only for the export and import
  described in section 3.

5. Children

The app collects no personal information from any user, and therefore
none from children.

6. How to delete your records

You can delete prayer journeys one at a time inside the app. Removing
the app from your device deletes everything listed in section 2. Since
the app keeps nothing on a server, there is nowhere else to send a
deletion request.

7. Changes to this policy

If the app gains accounts or synchronisation, or anything else above
changes, we will revise this policy and update the date at the top.

8. Contact

[contact address]
```

---

## 3. 이 방침을 코드와 어긋나지 않게 지키는 법

방침은 코드가 아니라 **글**이므로, 코드가 앞서 바뀌면 조용히 거짓이 된다. 그 위험이 실제로 놓이는 자리 셋을 적어 둔다.

| 코드에서 이런 일이 생기면 | 이 방침의 어디가 거짓이 되나 |
|---|---|
| 계정·서버 동기화가 붙는다 (로드맵의 V1.5) | §1 전체 — "서버가 없습니다"가 무너진다 |
| 통계·오류 수집 도구가 들어온다 | §1 의 "분석 도구를 포함하지 않습니다" |
| 저장 자리가 늘거나 담는 값이 바뀐다 | §2 의 목록 |

저장 자리의 이름은 지금 일곱이다 — `myrosary.journeys.v1` · `myrosary.position.v1` · `myrosary.settings.v1` · `myrosary.pinnedArt.v1` · `myrosary.lastArt.v1` · `myrosary.favoriteArt.v1` · `myrosary.introSeen.v1`. 전부 `src/storage/` 안에 `*_KEY` 라는 이름의 상수로 선언돼 있으므로, **`grep -rn "_KEY = 'myrosary" src/storage/` 한 줄이 이 문서 §2 의 목록과 맞는지 재는 자**가 된다.
