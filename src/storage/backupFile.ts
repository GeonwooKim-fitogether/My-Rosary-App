/**
 * 기록 파일을 실제로 **내려받고 고르는** 통로 (W3 슬라이스 C).
 *
 * 규칙(무엇을 담고 무엇을 거절하나)은 `backup.ts` 에 있고, 여기에는 그 글을 기기 밖으로
 * 내보내고 기기 밖에서 들여오는 일만 있다. 가른 까닭은 이 파일이 **브라우저 없이는 시험할
 * 수 없는 유일한 자리**이기 때문이다 — 위험한 판정은 모두 저쪽에 두어 단위 시험으로 덮고,
 * 여기는 얇게 남겼다.
 *
 * ── 지금 이 통로는 웹에서만 열린다 (정직하게 적어 둔다) ─────────────────────────
 *
 * 이 저장소에 지금 깔린 것으로 **iOS·안드로이드에서는 파일을 꺼내 주고 고르게 할 수 없다.**
 * 2026-09-18 에 실제로 재서 확인한 것은 이렇다.
 *
 * | 무엇이 필요한가 | 지금 있나 |
 * |---|---|
 * | 파일을 기기 저장소에 쓰는 것 (`expo-file-system`) | 있다 — `expo` 묶음이 함께 들여온다 |
 * | 쓴 파일을 **사람에게 건네는 것** (공유 시트 · `expo-sharing`) | **없다** |
 * | 사람이 고른 파일을 **받는 것** (문서 고르기 · `expo-document-picker`) | **없다** |
 *
 * 앞의 하나만으로는 파일을 앱 안쪽에 쓸 수 있을 뿐 사람이 그 파일에 닿지 못하고, 되돌아오는
 * 길은 아예 없다. 그래서 **웹에서 되는 데까지만 만들고 기기에서는 줄을 놓지 않았다** — 눌러도
 * 아무 일이 없는 줄을 놓는 것은 기능이 있는 척하는 일이기 때문이다. 이 앱의 표면 셋 가운데
 * 하나가 설치형 웹앱이므로(`decisions.md` 결정 12-2 카드 B) 웹만 되는 것에도 값이 있다.
 * 기기까지 열려면 의존성 둘을 더해야 하고, 그것은 지휘 세션이 판단할 일이다.
 */
import { Platform } from 'react-native';

/** 이 기기에서 기록 파일을 주고받을 수 있나. 설정 화면이 줄을 놓을지 이 값으로 가른다. */
export const backupFileSupported = Platform.OS === 'web';

/** 브라우저의 문서. 웹이 아니면 없다. */
function browserDocument(): Document | null {
  return Platform.OS === 'web' && typeof document !== 'undefined' ? document : null;
}

/**
 * 글 하나를 파일로 내려받는다.
 *
 * 브라우저에는 "이 글을 파일로 저장해 달라"는 곧은 길이 없어, 글을 잠깐 주소 하나로 만들고
 * 그 주소를 가리키는 보이지 않는 링크를 눌러 준다. 다 쓴 주소는 곧바로 버린다 — 버리지
 * 않으면 그 글이 화면을 닫을 때까지 메모리에 남는다.
 *
 * @returns 내려받기를 시작했으면 true. 웹이 아니면 false.
 */
export function downloadTextFile(text: string, fileName: string): boolean {
  const doc = browserDocument();
  if (!doc) return false;
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = doc.createElement('a');
  link.href = url;
  link.download = fileName;
  doc.body.appendChild(link);
  link.click();
  doc.body.removeChild(link);
  // 링크를 누른 그 자리에서 주소를 버리면 내려받기가 끊기는 브라우저가 있어 한 박자 둔다.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

/**
 * 사람에게 파일을 하나 고르게 하고 그 글을 읽어 온다. 고르지 않고 닫으면 `null`.
 *
 * 파일 고르개는 화면에 두지 않고 이 함수가 그때그때 만든다 — 설정 화면에 보이지 않는
 * 부품이 하나 서 있는 것보다, 누를 때만 생겼다 사라지는 편이 화면을 읽기 쉽다.
 *
 * **`cancel` 을 함께 듣는 까닭.** 사람이 고르개를 열었다가 아무것도 고르지 않고 닫으면
 * `change` 는 오지 않는다. 그것만 들으면 약속이 영영 끝나지 않아 화면이 기다리는 상태에
 * 멈춘다. 크로미움·사파리·파이어폭스가 모두 그때 `cancel` 을 보낸다.
 */
export function pickTextFile(): Promise<string | null> {
  const doc = browserDocument();
  if (!doc) return Promise.resolve(null);

  return new Promise((resolve) => {
    const input = doc.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';
    doc.body.appendChild(input);

    let done = false;
    const finish = (text: string | null) => {
      if (done) return;
      done = true;
      if (input.parentNode) input.parentNode.removeChild(input);
      resolve(text);
    };

    input.addEventListener('cancel', () => finish(null));
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return finish(null);
      file
        .text()
        .then((text) => finish(text))
        // 읽다 실패한 것도 "읽을 수 없는 파일" 과 같은 끝이다 — 부르는 쪽이 한 갈래만 다룬다.
        .catch(() => finish(null));
    });

    input.click();
  });
}
