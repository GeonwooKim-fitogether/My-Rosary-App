/**
 * 기도 화면을 나가는 방법을 묻는 시트 (W1 지시서 §4-2 의 3번 · FR-18).
 *
 * **왜 시트인가.** 기도 화면을 벗어나는 길은 시안에서 머리 왼쪽의 뒤로 화살표 하나뿐인데,
 * 이 앱에는 나가는 방법이 둘이다 — 자리를 남기고 나가는 `잠시 멈춤` 과 오늘 바친 자리를
 * 지우고 나가는 `여기서 끝내기`. W1 의 첫 판은 뒤로 화살표에 뒤의 것(자리를 지우는 쪽)을
 * 곧바로 걸었는데, 그것이 결함이었다. **뒤로 화살표를 누른 사람은 되돌아가기를 기대하지
 * 오늘 바친 것이 지워지기를 기대하지 않는다.** 그래서 화살표는 묻기만 하고, 무엇을 할지는
 * 사람이 시트 안에서 고른다.
 *
 * **왜 고르는 줄(`ChoiceRow`)인가.** 이 저장소의 확인 시트(`ConfirmSheet`)는 "한 가지 일을
 * 할까요, 말까요"를 묻는 모양이라 여기 맞지 않는다. 지금 묻는 것은 **나가는 두 길 중
 * 어느 쪽인가**이고, 그것은 시트 S2·S4·S5 가 이미 쓰는 고르는 줄의 모양이다. 줄마다
 * 이름과 설명 한 줄이 서는 것도 그대로 맞는다 — `자리가 남습니다` 와 `오늘 처음부터` 가
 * 두 길의 차이를 그 자리에서 말해 준다.
 *
 * 이름표 `pray-pause` 와 `pray-stop` 은 머리의 두 단추에서 이 두 줄로 옮겨 왔다. 두 줄이
 * 하던 일은 한 줄도 바뀌지 않았고, 누르기 전에 시트를 한 번 여는 것만 달라졌다.
 */
import { BottomSheet, ChoiceRow } from './Sheet';

export function LeavePrayerSheet({
  visible,
  onPause,
  onStop,
  onClose,
}: {
  visible: boolean;
  /** 잠시 멈춤 — 자리를 남기고 나간다. */
  onPause: () => void;
  /** 여기서 끝내기 — 오늘 바친 자리를 지우고 나간다. */
  onStop: () => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet visible={visible} label="기도 나가기" onClose={onClose} testID="sheet-leave">
      <ChoiceRow
        name="잠시 멈춤"
        note="자리가 남습니다"
        selected={false}
        first
        onPress={onPause}
        testID="pray-pause"
      />
      <ChoiceRow
        name="여기서 끝내기"
        note="오늘 처음부터"
        selected={false}
        first={false}
        onPress={onStop}
        testID="pray-stop"
      />
    </BottomSheet>
  );
}
