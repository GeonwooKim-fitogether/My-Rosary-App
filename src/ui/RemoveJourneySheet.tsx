/**
 * 시트 S6 — 혼자 바치는 여정을 지우기 전에 한 번 묻는다 (FR-05 · 06-screen-spec 시트 일곱).
 *
 * 이 시트는 두 곳에서 열린다. 여정 상세의 `이 여정 그만두기` 와 홈 카드를 **길게 누를 때**다.
 * 문구도 지우는 길(`removeJourney`)도 같아야 하므로 한 곳에 두고 두 화면이 같은 것을 쓴다 —
 * 두 곳의 문구가 갈리면 같은 일을 두 이름으로 부르게 된다.
 *
 * 조 여정은 아직 없다. 요구사항 FR-05 는 조 여정을 만든 사람에게는 "조 해산", 조원에게는
 * "조에서 나가기"로 문구를 갈라 두었는데, 조 자체가 M3(계정·서버·조)의 일이라 이 시트는
 * 혼자 바치는 여정의 문구 하나만 안다. 조가 생기면 여정의 종류를 보고 문구를 고르는 일이
 * 여기 들어온다.
 */
import { removeJourney } from '../state/appStore';
import { ConfirmSheet } from './Sheet';

export function RemoveJourneySheet({
  journeyId,
  onRemoved,
  onClose,
}: {
  /** 지우려는 여정. null 이면 시트가 닫혀 있다. */
  journeyId: string | null;
  /** 지운 뒤에 불린다 — 화면이 자기 자리(닫기 · 돌아가기)를 정한다. */
  onRemoved: () => void;
  onClose: () => void;
}) {
  return (
    <ConfirmSheet
      visible={journeyId !== null}
      label="이 기도 지우기"
      message="이 기도를 지웁니다. 기록도 함께 지워집니다."
      confirmLabel="지우기"
      cancelLabel="두기"
      onConfirm={() => {
        if (journeyId !== null) removeJourney(journeyId);
        onRemoved();
      }}
      onClose={onClose}
      testID="sheet-quit"
    />
  );
}
