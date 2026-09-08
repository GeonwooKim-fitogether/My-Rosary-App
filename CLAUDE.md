# My-Rosary-App — 프로젝트 안내

> 한 줄 요지: **MyRosary는 "바람 하나를 정하고 54일 동안 날마다 묵주기도를 바쳐 완주하게 하는" 한국어 묵주기도 앱**이고, 이 저장소는 그 앱을 iOS(App Store)와 Android(Google Play) 양쪽에 출시하기 위해 실제로 개발하는 곳이다. 상품기획은 atelier 저장소에서 끝났고, 정본은 2026-09-05에 여기로 이관됐다.

## 지금 어디까지 왔나

**시안 확정 · 구현 착수 대기.** atelier 가 확정한 v5 시안을 2026-09-08 에 인계받아 `docs/design/v5/` 에 정본으로 앉혔다(`decisions.md` 결정 2). 관문 1(기획안 컨펌)은 2026-09-05에 닫혔다 — 화면 세 곳을 프로토타입 방식으로 가기로 해 화면이 여덟에서 열로 늘었다(`decisions.md` 결정 1). 프레임워크·스택은 아직 답 대기다. 코드는 아직 없다. 현재 상태와 다음 할 일은 언제나 `decisions.md`와 `docs/plan/development-plan.md`가 정본이다 — 이 파일의 이 절은 요약일 뿐이니, 어긋나면 그 두 파일을 믿는다.

## 정본 문서가 어디 있나

| 무엇 | 어디 |
|---|---|
| 제품 요구사항(PRD 제3판, FR-01~45), 디자인 시스템, 서비스 설계, 화면 명세, 화면 지도 | `docs/product/06-*.md` — 원본은 atelier `idea/mobile-rosary/`, 이관 뒤 atelier 쪽은 freeze. 이관 경위는 `docs/product/README.md` |
| 시안 계보 (v5 이전) | `docs/product/prototype/` (atelier 최초 핸드오프) · `docs/design/screens-day.html` · `screens-night.html` · `prototype.html`. **정본이 아니다** — 값이 어긋나면 v5 를 따른다(결정 2) |
| **화면 시안 정본 (atelier v5 인계본)** | `docs/design/v5/` — `index.html` 한 파일에 화면 열과 기도 엔진, `art/` 에 성화 열여섯 장. `node docs/design/v5/build.mjs` 로 파일 하나짜리 조립본을 만든다. 경위와 슬롯 체계는 `docs/design/v5/README.md` |
| 기도 도메인 데이터 (77단계, 신비 4종, 54일 규칙, 기도문 임시 판본) | `spec/` — 프레임워크 무관 JSON·마크다운. PRD에 없는 것은 지어 넣지 않았다 |
| 개발 계획 (컨펌용 기획안 → 컨펌 뒤 정본) | `docs/plan/development-plan.md` |
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

`kimpm`(기획·결정·보고, 이 저장소의 리딩) · `kimdesigner`(시안 확정·보완, 관문 2) · `kimdeveloper`(구현, 관문 2 뒤) · `kimqa`(Playwright·qa-swarm 검증) · `doc-clarifier`(문서 정제). 큰 요청은 `/orchestrate`(KimLead)가 이들을 순서대로 지휘한다. 역할 상세는 `docs/plan/development-plan.md` §10.
