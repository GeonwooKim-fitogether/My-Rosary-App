# My-Rosary-App — 54일 묵주기도 앱 (MyRosary)

> **바람 하나를 정하고 54일 동안 날마다 묵주기도를 바치되, 묵주와 기도문 책 없이, 화면을 보지 않고도, 끊겨도 이어서, 혼자서든 다섯이 나눠서든 끝까지 갈 수 있게 하는 한국어 묵주기도 앱.** (PRD 제3판 §1-1)

이 저장소는 그 앱을 **iOS(App Store)와 Android(Google Play) 양쪽**에 출시하기 위해 실제로 개발하는 곳입니다. 상품기획(9단계 깔때기)은 atelier 저장소에서 끝났고, 2026-09-05에 제품 정본이 여기로 이관됐습니다.

## 지금 상태

| 단계 | 상태 |
|---|---|
| 관문 1 — 기획안 컨펌 | **닫힘** (2026-09-05, `decisions.md` 결정 1) |
| 관문 2 — 시안 컨펌 | **닫힘** (2026-09-08, 결정 2 — 정본은 [`docs/design/v5/`](docs/design/v5/)) |
| M0 — 프로젝트 바닥 | **작업완료** — Expo + TypeScript 골격, 기도 도메인 코어, 디자인 토큰, 성화 슬롯, 로그인 화면 한 장 |
| M1~M3 — 기도 루프 · 여정과 홈 · 계정과 조 | M0 뒤 |
| M4 — TestFlight·내부 테스트 배포로 08 검증 진입 (4주 실사용) | M3 뒤 |
| M5 — 스토어 정식 출시 | 3차 판정(Pass) 뒤 |

스택은 Expo(React Native · TypeScript) + EAS Build + Supabase 입니다(`decisions.md` 결정 3). M0 에서 만든 것과 통과 기준은 [`docs/plan/m0-work-order.md`](docs/plan/m0-work-order.md)가 정본입니다.

## 앱을 돌려 보기

Node 22 와 npm 이 있으면 됩니다. 처음 한 번 `npm install` 로 의존성을 갖춥니다.

| 하려는 것 | 명령 |
|---|---|
| 개발 서버 띄우기 (기기·시뮬레이터·웹 공용) | `npm start` |
| 브라우저에서 바로 보기 | `npm run web` |
| 웹 빌드 만들기 (`dist/` 에 나옵니다) | `npm run build:web` |
| 타입 검사 | `npm run typecheck` |
| 단위 테스트 | `npm test` |

웹 빌드를 눈으로 확인하려면 빌드한 뒤 `dist/` 를 정적 서버로 열면 됩니다 (예: `npx serve dist`). 같은 세 검사(`typecheck` · `test` · `build:web`)를 PR 마다 `.github/workflows/app-ci.yml` 이 다시 돌립니다.

### 네이티브 빌드는 아직 한 번도 실행하지 않았습니다

**iOS·Android 앱 파일을 만드는 빌드는 이 저장소에서 단 한 번도 돌지 않았습니다.** `app.json` 과 `eas.json` 은 갖춰 두었지만 검증되지 않은 설정이며, **Expo 계정과 Apple Developer·Google Play Console 계정을 연결한 뒤에 실행합니다.** 개발 환경이 리눅스 컨테이너라 맥이 없고, 애플이 iOS 빌드에 맥을 요구하기 때문입니다. 클라우드 빌드(EAS Build)는 사람이 만들어야 하는 계정을 전제로 하므로 그 세 계정이 준비되기 전에는 돌릴 수 없습니다. 필요한 계정과 절차는 [`docs/plan/m0-work-order.md`](docs/plan/m0-work-order.md) §8 에 있습니다.

앱 아이콘과 스플래시 이미지도 아직 없습니다. `app.json` 의 웹 파비콘은 배경색만 채운 임시 파일(`assets/images/favicon-placeholder.png`)이며, 실제 아이콘은 디자인 산출물로 따로 정합니다.

## 무엇이 어디 있나

| 폴더·파일 | 내용 |
|---|---|
| [`docs/product/`](docs/product/) | **제품 정본** — PRD 제3판(`06-prd.md`), 디자인 시스템, 서비스 설계, 화면 명세, 화면 지도, 프로토타입 핸드오프(`prototype/`). 이관 경위는 [`docs/product/README.md`](docs/product/README.md) |
| [`spec/`](spec/) | 프레임워크와 무관한 기도 도메인 데이터 — 77단계 순서, 신비 4종, 54일 규칙, 기도문(판본 미확정) |
| [`docs/plan/development-plan.md`](docs/plan/development-plan.md) | 개발 계획 — 지금은 컨펌 대기 기획안. 정합 확인표, 마일스톤, 프레임워크 결정 카드, 디자인 과제, 스토어 체크리스트 |
| [`decisions.md`](decisions.md) | 결정 로그와 결정 큐. 일을 시작하기 전에 주제어로 검색한다 |
| [`CLAUDE.md`](CLAUDE.md) | Claude Code 세션을 위한 프로젝트 안내 |
| [`docs/lessons.md`](docs/lessons.md) | 체계의 결함 기록 (창고 승격 후보) |
| `.claude/` | 팀 공용 규칙·스킬·에이전트·훅 — 창고(Template-repository)에서 동기화 봇이 내려보냄. **여기서 고치지 않음** |
| `.integration/` | 통합 현황판 설정 (아직 창고 기본값 — 이 프로젝트용으로 채워야 한다) |

## 이 저장소가 따르는 팀 규칙

세션 시작 시 자동으로 읽히는 `.claude/rules/*.md` 여덟입니다. 원본은 창고이며 여기서는 고치지 않습니다.

| 규칙 | 무엇을 정하나 |
|---|---|
| `communication.md` | 채팅·문서 어투 — 결론 먼저, 완전한 문장, 완료 어휘 세 단계와 노출 증명 |
| `escalation.md` | 언제 사람에게 묻나 — 관문 트리거 여섯, 결정 카드 서식, 결정 큐 |
| `stake-calibration.md` | 판돈에 맞는 엔진 크기 — 기본값은 최저 티어 |
| `upstream-first.md` | 공용 파일은 창고에서 고친다 |
| `past-decisions.md` | 폐기한 것이 되살아나지 않게 — `.claude/retired.json`과 훅 |
| `lessons-backport.md` | 체계의 결함을 `docs/lessons.md`에 3줄로 기록해 창고로 올린다 |
| `db-write-permission.md` | 데이터베이스 쓰기는 사용자가 쿼리를 보고 승인한 뒤에만 (Supabase 연결 뒤 적용) |
| `migration-naming.md` | 마이그레이션 파일명은 순번이 아니라 시각 |

## 자동 검사 (`.github/workflows/`)

앱 검사(`app-ci.yml` — 타입 검사·단위 테스트·웹 빌드) · PR 크로스컷 게이트(`pr-gate-check.yml`) · 파일 등록부(`file-registry.yml`, 등록부 없으면 no-op) · 브랜치 겹침 알림(`branch-overlap.yml`) · 자산 그래프 정합(`asset-graph.yml`) · 통합 현황판 게시(`integration-board.yml`) · 창고 동기화(`sync-skills.yml`). 창고 전용이던 README 스킬 표 검사는 제거했습니다(`decisions.md` Q-12).
