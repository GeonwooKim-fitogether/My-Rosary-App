# 제품 정본 문서 — MyRosary (54일 묵주기도 앱)

> 한 줄 요지: **이 폴더가 MyRosary 제품 정의의 정본이다.** 2026-09-05 개발 착수 시점에 atelier 저장소의 PRD 패키지 제3판과 프로토타입 핸드오프를 이관했고, 그 시점부터 atelier 쪽은 freeze(더 고치지 않음)다. 개발 중 PRD를 정정해야 하면 **여기서 고치고** `decisions.md`에 사유를 남긴다.

## 어디서 왔나

| 파일 | 원본 | 이관 방식 |
|---|---|---|
| `06-prd.md` — 제품 요구사항 제3판 (FR-01~45, 화면·비기능·저장·예외·범위 밖·미확정) | atelier `idea/mobile-rosary/06-prd.md`, 커밋 `f39019b` (2026-09-05) | 사본 + 머리에 정본 안내 한 단락 |
| `06-design-system.md` — 색·서체·시그니처·모션·접근성·수용 기준 24항목 | 같은 폴더 | 같음 |
| `06-service-design.md` — 유저 스토리 US-01~11, 정보 구조, 백 오피스 | 같은 폴더 | 같음 |
| `06-screen-spec.md` — 화면 여덟·시트 일곱의 요소·문구·비화면 채널(소리·진동) 상수 | 같은 폴더 | 같음 |
| `06-screen-map.md` — 화면 지도, 시나리오 17개 검증, 결함 8~12 처방 | 같은 폴더 | 같음 |
| `prototype/README.md` · `prototype/screens-day.html` · `prototype/assets/*.jpg` | 공방장 전달 zip `design_handoff_rosary_hanji_day` | HTML·이미지는 바이트 단위 동일(md5 확인), README만 머리에 안내 한 단락 |

## 왜 이관하고 freeze 하나

atelier는 상품기획 공방이고 이 저장소는 그 결과물을 실제 앱으로 만드는 곳이다. 정본이 두 곳에 있으면 개발 중 정정이 한쪽에만 반영되어 두 문서가 조용히 갈라진다(원본 우선 규칙 `.claude/rules/upstream-first.md`와 같은 원리). 그래서 **개발이 시작되는 순간 정본을 개발 저장소로 옮기고 원본은 얼린다.** atelier `decisions.md`의 D6(어디서 개발하나) 결정 항목에 대해 공방장이 2026-09-05 "My-Rosary-App에서 바로 개발"을 택한 것이 이 이관의 근거다(이 저장소 `decisions.md` 결정 0).

## 읽을 때 주의할 것

- 다섯 문서는 서로를 `./06-xxx.md`로 가리키므로 같은 폴더에 있는 지금 링크가 그대로 살아 있다.
- 다섯 문서가 atelier의 **다른** 문서를 가리키는 링크는 여기서 끊어진다 — `02b-design-research.md`(경쟁사 실화면 조사), `05-prioritization.md`, `../../docs/prototype-vocabulary.md`(목업·프로토타입 어휘). 필요하면 atelier 저장소 `idea/mobile-rosary/`에서 읽는다. 개발에 필요한 결론은 PRD 본문에 이미 옮겨 적혀 있어 대개 원문까지 갈 필요는 없다.
- **PRD와 프로토타입 사이에 어긋난 것**과 **PRD §11의 미확정 사항**은 `prototype/README.md` 끝의 "확정이 필요한 것 6개"와 PRD §11에 있고, 각각의 채택 기본값은 이 저장소 `decisions.md`의 결정 큐가 갖는다. 문서 본문은 아직 고치지 않았다 — 공방장 컨펌 뒤에 한 번에 개정한다(`docs/plan/development-plan.md` 관문 1).
- 프레임워크 중립적인 기도 도메인 데이터(77단계 순서, 신비 4종, 54일 규칙)는 [`../../spec/`](../../spec/)에 따로 정리했다. 그것은 PRD의 §1-3·FR-43을 기계가 읽는 형태로 옮긴 것이며 PRD를 대신하지 않는다.
