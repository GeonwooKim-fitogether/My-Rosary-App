# My-Rosary-App — 프로젝트 안내

> 한 줄 요지: **MyRosary는 "바람 하나를 정하고 54일 동안 날마다 묵주기도를 바쳐 완주하게 하는" 한국어 묵주기도 앱**이고, 이 저장소는 그 앱을 iOS(App Store)와 Android(Google Play) 양쪽에 출시하기 위해 실제로 개발하는 곳이다. 상품기획은 atelier 저장소에서 끝났고, 정본은 2026-09-05에 여기로 이관됐다.

## 지금 어디까지 왔나

**관문 둘이 모두 닫혔다. 지금 열려 있는 것은 구현이다.** 관문 1(기획안 컨펌)은 2026-09-05에 닫혔고 — 화면 세 곳을 프로토타입 방식으로 가기로 해 화면이 여덟에서 열로 늘었다(결정 1) — 관문 2(시안)는 atelier v5 인계본이 정본 자리에 앉으면서 2026-09-08에 대체로 닫혔다(결정 2, `docs/design/v5/`). 같은 날 **프레임워크·스택이 A안(Expo + React Native + EAS Build + Supabase)으로 확정됐다**(결정 3). M0(바닥)·M1(기도 루프)·M2(여정과 홈)가 작업완료다 — Expo 골격과 도메인 코어 위에 v5 의 화면 여덟(로그인·기도·하루 완주·홈·새 기도·여정 상세·여정 완주·설정)과 초대 코드 화면이 서 있고, 여정과 설정이 기기에 저장되며, 바텀 시트 일곱과 밤 벌(쪽빛)이 v5 값에서 파생돼 붙었다(Q-14). 화면 사진은 `docs/plan/m1-screens/`와 `docs/plan/m2-screens/`에 있다. **실기기(iOS·Android) 확인은 아직 한 번도 하지 못했다** — 이 컨테이너에 맥도 폰도 없어 소리·진동·이어폰 단추는 사람이 확인해야 한다. 다음은 M3(계정·서버·조)다. 현재 상태와 다음 할 일은 언제나 `decisions.md`와 `docs/plan/development-plan.md`가 정본이다 — 이 파일의 이 절은 요약일 뿐이니, 어긋나면 그 두 파일을 믿는다.

## 정본 문서가 어디 있나

| 무엇 | 어디 |
|---|---|
| 제품 요구사항(PRD 제3판, FR-01~45), 디자인 시스템, 서비스 설계, 화면 명세, 화면 지도 | `docs/product/06-*.md` — 원본은 atelier `idea/mobile-rosary/`, 이관 뒤 atelier 쪽은 freeze. 이관 경위는 `docs/product/README.md` |
| 시안 계보 (v5 이전) | `docs/product/prototype/` (atelier 최초 핸드오프) · `docs/design/screens-day.html` · `screens-night.html` · `prototype.html`. **정본이 아니다** — 값이 어긋나면 v5 를 따른다(결정 2) |
| **화면 시안 정본 (atelier v5 인계본)** | `docs/design/v5/` — `index.html` 한 파일에 화면 열과 기도 엔진, `art/` 에 성화 열여섯 장. `node docs/design/v5/build.mjs` 로 파일 하나짜리 조립본을 만든다. 경위와 슬롯 체계는 `docs/design/v5/README.md` |
| 기도 도메인 데이터 (81단계, 신비 4종, 54일 규칙, 기도문 임시 판본) | `spec/` — 프레임워크 무관 JSON·마크다운. PRD에 없는 것은 지어 넣지 않았다 |
| 개발 계획 정본 (마일스톤 M0~M5, v5 값의 소재) | `docs/plan/development-plan.md` |
| **M0 작업 지시서** | `docs/plan/m0-work-order.md` |
| M1·M2 에서 찍은 화면 사진 | `docs/plan/m1-screens/`(기도 · 하루 완주) · `docs/plan/m2-screens/`(홈 · 새 기도 · 여정 상세 · 여정 완주 · 설정 · 초대 코드 · 시트 · 밤 벌) — v5 시안과 나란히 놓고 대조한다 |
| 알 쉰아홉을 다 그리고 단 넘기기를 붙인 뒤의 화면 사진 | `docs/plan/rosary-full/` — 낮·밤 두 벌과 390×844·390×640 두 크기, 모두 네 장. 무엇을 보며 확인하는지는 그 폴더의 `README.md` (결정 6) |
| 기도 순서를 한국 천주교 표준 도해에 맞춘 뒤의 화면 사진 | `docs/plan/prayer-order/` — 시작 기도의 구원을 비는 기도, 제1단 첫 알(오른쪽), 제5단 마지막 알(왼쪽), 마침 기도의 성모찬송, 모두 넉 장. 무엇을 보는 사진인지는 그 폴더의 `README.md` (결정 7) |
| 묵주 그림을 사실적으로 다듬은 일의 전/후 사진 | `docs/plan/rosary-before-after/` — 같은 성화 위에서 고치기 전과 후를 나란히 놓았다. 무엇을 왜 바꿨는지는 그 폴더의 `README.md` |
| **늘어진 묵주 모양과 재질 넷을 그린 뒤의 화면 사진** | `docs/plan/rosary-materials/` — 낮 벌 넉 장(붉은 장미·나무·은·금), 밤 벌 한 장, 묵주 고르기 시트 한 장, 새 기도 화면의 묵주 줄 한 장, 모두 일곱. 무엇을 보며 확인하는지는 그 폴더의 `README.md` (결정 8·9) |
| **알을 다 채우고 진행을 빛으로 말하게 된 뒤의 화면 사진** | `docs/plan/rosary-lit/` — 낮 벌 넉 장(붉은 장미·나무·은·금), 밤 벌 한 장, 묵주 고르기 시트 한 장, 모두 여섯. 무엇을 보며 확인하는지와 낮 벌의 정직한 한계는 그 폴더의 `README.md` (결정 10) |
| **지금 알의 다섯 상태를 구현한 뒤의 화면 사진** | `docs/plan/bead-phases/` — 읽는 중 · 내 차례 · 멈춤 · 단 전환 · 소리 없이 진행, 모두 다섯 장. 동작 줄이기 상태로 찍어 움직임 없이도 갈리는지를 본다. 값의 출처와 한계는 그 폴더의 `README.md` (FR-15) |
| **글자를 200% 로 키운 기도 화면 사진** | `docs/plan/font-scale/` — 100% 한 장과 200% 두 장(첫 화면 · 사도신경). 줄 간격과 자간이 글자와 같은 비율로 커지는지를 본다. 플랫폼마다 React Native 가 이미 키우는 것과 우리가 키우는 것의 표, 실기기 미확인 한계는 그 폴더의 `README.md` (FR-28) |
| 결정 로그·결정 큐·컨펌 필요 항목 | `decisions.md` — **일을 시작하기 전에 주제어로 한 번 검색한다** |
| 폐기 목록 (다시 쓰지 않기로 한 도구·자리) | `.claude/retired.json` — 훅이 차단한다 |
| 체계의 결함 기록 (창고 승격 후보) | `docs/lessons.md` |

## 이 저장소에서 일할 때 지킬 것

- **팀 공용 규칙은 `.claude/rules/*.md`가 세션 시작 시 자동으로 읽힌다.** 따로 `@`로 불러오지 않는다(창고 README 규정). 어투(communication), 에스컬레이션, 판돈, 원본 우선, 지난 결정, 교훈 백포트, DB 쓰기, 마이그레이션 파일명 — 여덟이다.
- **`.claude/` 아래 공용 자산은 여기서 고치지 않는다.** 원본은 창고(Template-repository)이고 동기화 봇이 내려보낸다. 이 저장소 소유는 `.claude/retired.json`, `.mcp.json`(Supabase 프로젝트가 생기면), `.github/workflows/`, `CLAUDE.md`, `decisions.md`, `docs/`, `spec/`, 그리고 앱 코드다.
- **PRD를 정정해야 하면 `docs/product/`에서 고치고 `decisions.md`에 사유를 남긴다.** 원문을 지우지 않고 개정 이력을 덧붙인다.
- **프레임워크·데이터 모델·인증 방향은 사람 관문이다**(에스컬레이션 §2 트리거 3). 결정 카드로 올리고, 답이 오기 전에는 그 결정에 의존하지 않는 일만 한다.
- **완료 어휘**: 작업완료(브랜치 푸시 + 검증 + 노출 증명) · 검토대기(PR) · 배포완료(main 머지 + 실환경 확인). 앱 화면이 생기면 "보는 법" 세 줄을 보고에 넣는다.
- **PR 자동 검사**가 `.github/workflows/`에 있다 — pr-gate-check(문서 갱신·배선), file-registry(등록부 없으면 no-op), branch-overlap(알림), asset-graph(자산 정합), integration-board(현황판 게시 — `.integration/` 설정을 이 프로젝트용으로 채워야 의미가 있다), sync-skills(창고 동기화). 창고 전용이던 readme-skills는 제거했다(decisions.md Q-12).

## 팀

`kimpm`(기획·결정·보고, 이 저장소의 리딩) · `kimdesigner`(구현된 화면을 v5와 대조 검수 — 결정 2로 역할이 바뀌었다) · `kimdeveloper`(구현 — 결정 3의 스택 위에서 M0부터) · `kimqa`(Playwright·qa-swarm 검증) · `doc-clarifier`(문서 정제). 큰 요청은 `/orchestrate`(KimLead)가 이들을 순서대로 지휘한다. 역할 상세는 `docs/plan/development-plan.md` §10.
