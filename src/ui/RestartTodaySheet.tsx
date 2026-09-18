/**
 * 홈의 `다시 바치기` 앞에서 한 번 묻는 시트 — **시안의 결함 10 번을 여기서 고친다.**
 *
 * 무엇이 결함이었나. 「MyRosary World」 시안의 홈은 진행선 옆에 `다시 바치기` 를 두고,
 * 그것을 누르면 **아무것도 묻지 않고** 오늘 바치던 자리를 지우고 처음으로 되돌린다
 * (`restartToday: () => { this.save('session', null); … }`). 스무 단을 바치다 잘못 누른
 * 사람은 그 자리를 되찾을 길이 없다.
 *
 * 이 저장소는 자리를 지우는 조작 앞에 확인 시트를 두기로 이미 정해 두었고(FR-18), 같은
 * 일을 하는 여정 상세의 `오늘 처음부터` 는 그 시트를 이미 거친다. 홈만 묻지 않는 것은
 * 어긋남이므로 같은 문구의 확인 한 장을 여기에 세운다.
 *
 * **W1 의 `LeavePrayerSheet` 와 같은 어법이다.** 시트의 모양을 새로 그리지 않고, 이 저장소의
 * 시트 부품(`Sheet.tsx`)을 얇게 감싸 문구와 이름표만 정한다. 그래야 시트 일곱의 모양이
 * 한 곳에서만 바뀌고(§3 의 Q-56 이 그 한 곳을 시안의 어법으로 옮긴다), 감싼 부품들은
 * 손대지 않아도 함께 따라온다.
 *
 * 문구는 여정 상세의 `sheet-restart` 와 글자까지 같다 — 같은 일을 두 이름으로 부르지
 * 않기 위해서다. 이름표만 `sheet-again` 으로 갈라 두어, 어느 화면에서 뜬 시트인지
 * 시험이 가릴 수 있게 했다.
 */
import { ConfirmSheet } from './Sheet';

export function RestartTodaySheet({
  visible,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  /** 확인했다 — 오늘 자리를 지우고 처음부터 간다. */
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ConfirmSheet
      visible={visible}
      label="다시 바치기"
      message="오늘 자리를 지우고 처음부터 바칩니다."
      confirmLabel="처음부터"
      cancelLabel="아니요, 이어서"
      onConfirm={onConfirm}
      onClose={onClose}
      testID="sheet-again"
    />
  );
}
