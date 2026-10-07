# 심사 메모 초안 — App Store · Google Play

> **초안 — 사람의 승인 전에는 제출하지 않는다.**

> 한 줄 요지: **심사자가 이 앱을 열었을 때 막힐 만한 자리는 로그인이 아니라 "무엇을 눌러야 기도가 시작되나" 하나다.** 계정이 없으므로 심사용 계정도 필요 없고, 애플이 계정 있는 앱에 요구하는 두 조항(4.8 · 5.1.1)은 해당되지 않는다. 아래 §2 의 다섯 줄을 그대로 심사 메모 칸에 붙이면 된다.

심사 메모(App Store Connect 의 `App Review Information > Notes`, Google Play Console 의 `앱 액세스 권한` 과 `테스트 안내`)는 심사자가 앱을 제대로 열어 보게 하는 글이다. 이 문서는 그 칸에 넣을 원고와, 그 원고가 왜 그렇게 쓰였는지의 근거를 함께 담는다.

## 1. 심사자가 이 앱에서 부딪힐 자리

앱을 처음 여는 사람이 보게 되는 것을 순서대로 적는다. 심사자도 처음 여는 사람이다.

1. **소개 시트가 한 번 뜬다.** 이 앱이 무엇을 하는지 세 문단으로 알리고 맨 아래에 `시작하기` 단추가 있다. 이 시트는 처음 한 번만 뜬다.
2. **홈 화면.** 큰 성화 한 장, 오늘의 신비 한 줄, 그리고 기도를 시작하는 주 단추가 있다. 진행 중인 여정이 있으면 그 목록도 함께 선다.
3. **기도 화면.** 화면 가운데의 원형 묵주 위에서 지금 알 하나가 밝아지고, 가운데를 누르면 다음 단계로 간다. 여든한 단계를 다 지나면 하루 완주 화면이 뜬다.

**막힐 만한 자리는 하나다** — 심사자가 "완주"까지 보려면 여든한 단계를 넘겨야 한다. 그래서 아래 메모에 **가운데를 계속 누르면 끝까지 간다**는 것을 적었다.

## 2. 심사 메모 원고

### 2-1. 애플 (App Review Information > Notes)

```
This app is a Catholic Rosary prayer app. A few notes for review.

1. No account is required. There is no sign-up or sign-in anywhere in
   the app, so no demo account is needed. All records are stored on the
   device only; nothing is sent to a server.

2. How to see the main flow: open the app, close the introduction
   sheet with "Begin", then tap the main button on the home screen to
   start praying. Tapping the centre of the on-screen rosary moves to
   the next step. Tapping through all eighty-one steps reaches the
   completion screen. You can also drag around the rosary ring to move
   between beads.

3. The app does not use the volume buttons for any purpose and does not
   alter their normal behaviour.

4. Guidelines 4.8 (Sign in with Apple) and 5.1.1(v) (account deletion)
   do not apply: the app has no accounts of any kind.

5. The app reads prayer texts aloud using the system speech feature and
   can vibrate at each bead. Both can be turned off in Settings. Motion
   sensing is used only for the optional "hands-free" shake gesture.
```

### 2-2. 구글 플레이

구글은 칸이 둘로 나뉘어 있다.

**앱 액세스 권한 (App access)** — `로그인 없이 모든 기능을 사용할 수 있음`을 고른다. 이 앱에는 자격 증명 뒤에 숨은 화면이 하나도 없다.

**테스트 안내 / 기타 (Instructions)**

```
This app is a Catholic Rosary prayer app. No sign-in is required and
every screen is reachable without credentials.

To see the main flow: open the app, close the introduction sheet with
"Begin", tap the main button on the home screen, then tap the centre of
the on-screen rosary repeatedly. Eighty-one taps reaches the completion
screen.

All records are stored on the device only. The app does not contact any
server, and contains no analytics, advertising, or crash reporting.

The app does not use the volume buttons and does not alter their
behaviour.
```

## 3. 각 줄의 근거 — 왜 이렇게 쓸 수 있나

심사 메모는 사실이 아니면 곧바로 반려로 돌아오는 글이므로, 줄마다 근거를 적어 둔다.

| 메모의 줄 | 근거 |
|---|---|
| 계정이 없다 | 결정 12-2 의 카드 A 가 계정과 조를 V1.5 로 미뤘다. 앱에 로그인 화면이 없다 |
| 서버로 아무것도 보내지 않는다 | 앱 코드에 바깥으로 나가는 호출이 0건이다. 자세한 것은 [`privacy-policy.md`](./privacy-policy.md) |
| 음량 버튼을 쓰지 않는다 | [`volume-buttons.md`](./volume-buttons.md) 가 조사해 **붙이지 못한다**고 판정했다 — Expo SDK 57 과 React Native 에 Android 음량 키를 앱에 알려 주는 통로가 없다. 요구사항 FR-38 의 음량 버튼 부분은 구현돼 있지 않다 |
| 4.8 · 5.1.1(v) 해당 없음 | 두 조항 모두 계정이 있는 앱에만 적용된다 |
| 여든한 번 누르면 완주 화면 | 기도 한 번은 여든한 단계다(결정 7, `06-prd.md` §1-3 개정). e2e 시험 `pray-loop` 이 실제로 여든한 단계를 완주한다 |
| 소리·진동을 끌 수 있다 | 설정 화면에 낭송 방식(`읽지 않기` 포함)과 진동 토글이 있다 |

## 4. 심사에서 물어 올 수 있는 것 넷 — 미리 답을 준비해 둔다

이것은 메모에 넣는 글이 아니라, **물어 오면 답할 말**이다.

### 4-1. "안드로이드 앱이 인터넷 권한을 선언했는데 서버가 없다고요?"

Expo 가 안드로이드 빌드를 만들 때 **`INTERNET` 권한이 기본으로 들어간다.** 이 앱은 그 권한을 실제로 쓰지 않지만, 권한 목록만 보는 사람에게는 모순으로 보일 수 있다. 답은 "빌드 도구의 기본값이고 앱은 네트워크를 쓰지 않는다"이며, 필요하면 `app.json` 에서 권한 목록을 좁혀 제출할 수 있다. **좁힐지 말지는 사람이 정한다** — 좁히면 나중에 계정 기능이 붙을 때 되돌려야 한다.

### 4-2. "기도문의 출처가 어디입니까?"

**지금 실려 있는 기도문은 임시 판본이다.** 소개 시트도 그렇게 적고 있다("기도문은 임시 판본이고"). 로드맵의 D-4 가 **공식 판본 대조를 사람의 몫**으로 남겨 두었고, 그 대조가 끝나기 전에는 이 질문에 정직하게 답할 수 없다. **출시 전에 반드시 닫아야 하는 자리다.**

### 4-3. "화면의 그림은 누구 것입니까?"

**성화 열여섯 장 중 여섯 장에 다른 스튜디오의 로고나 작가 서명이 그대로 남아 있다.** 어느 장에 무엇이 있는지는 [`art-watermark-audit.md`](./art-watermark-audit.md) 가 적는다. **이 여섯을 정리하기 전에는 제출하지 않는다** — 심사가 묻지 않더라도 권리 문제이기 때문이다.

### 4-4. "종교 콘텐츠 분류는 어떻게 됩니까?"

가톨릭 묵주기도를 돕는 앱이며, 특정 단체를 대신해 모금하거나 기부를 받지 않는다. 결제 기능이 없다. 두 스토어 모두 종교 앱을 정상 분류로 받는다.

## 5. 이 메모가 아직 답하지 못하는 것

- **실기기에서 소리·진동·흔들기·이어폰 단추가 실제로 동작하는지 확인되지 않았다.** 이 컨테이너에는 맥도 폰도 없다. 로드맵 W4 가 그 확인을 사람의 몫으로 적어 두었고, 확인 전에는 위 메모의 다섯째 줄("reads prayer texts aloud… can vibrate")이 실기기에서 참인지 아무도 모른다.
- **앱 아이콘이 아직 없다.** 아이콘 없이는 제출 자체가 되지 않는다.
