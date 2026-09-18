/**
 * 기록 파일을 실제로 **내려받고 고르는** 통로 (W3 슬라이스 C · W4 슬라이스 D).
 *
 * 규칙(무엇을 담고 무엇을 거절하나)은 `backup.ts` 에 있고, 여기에는 그 글을 기기 밖으로
 * 내보내고 기기 밖에서 들여오는 일만 있다. 가른 까닭은 이 파일이 **브라우저나 기기 없이는
 * 시험할 수 없는 유일한 자리**이기 때문이다 — 위험한 판정은 모두 저쪽에 두어 단위 시험으로
 * 덮고, 여기는 얇게 남겼다. 그 가름 덕분에 W4 가 기기를 여는 데 **이 한 파일만** 갈아
 * 끼우면 됐다(`decisions.md` Q-73).
 *
 * ━━ 기기(iOS·안드로이드)에서 아직 한 번도 돌려 보지 못했다 — 웹에서만 확인했다 ━━━━━
 *
 * 이 경고를 파일의 맨 위에 두는 까닭을 분명히 적는다. **아래 기기 쪽 길은 이 컨테이너에서
 * 한 번도 실행된 적이 없다.** 기기에서 돌려 보려면 기기 빌드(EAS)를 돌려야 하는데 그것은
 * 스토어 계정이 있어야 하고, 2026-09-18 현재 그 계정이 아직 없다(`docs/plan/w4-work-order.md`
 * §1-1). 웹 쪽 길만 실제 브라우저에서 확인했다.
 *
 * 그래도 넣은 까닭은 Q-73 이 적은 그대로다 — 넣지 않으면 **앱 스토어로 받은 사람이 폰을
 * 바꿀 때 54일 기도 기록을 통째로 잃는** 위험이 그대로 남고, 그 위험은 계정 유무와 무관하게
 * 실재한다. 계정이 생기는 즉시 빌드로 확인할 수 있도록 코드가 먼저 준비돼 있어야 한다.
 *
 * **"될 것으로 본다" 와 "확인했다" 를 갈라 적는다.**
 *
 * | 무엇 | 웹 | iOS·안드로이드 |
 * |---|---|---|
 * | 파일을 사람에게 건네기 | **확인했다** — 실제 브라우저에서 내려받기가 일어나고, e2e 가 내려온 파일의 내용까지 열어 본다 | **될 것으로 본다** — 근거는 `expo-sharing` 이 SDK 57 의 공식 모듈이고 이 앱의 판(`~57.0.18`)이 다른 expo 모듈들과 같은 묶음에서 왔다는 것뿐이다 |
 * | 사람이 고른 파일을 받기 | **확인했다** — e2e 가 고르개에 파일을 건네고 앱이 읽는 것을 본다 | **될 것으로 본다** — 근거는 `expo-document-picker` 가 같은 묶음의 공식 모듈이라는 것뿐이다 |
 * | 고르지 않고 닫았을 때 멈추지 않기 | **확인했다** | **될 것으로 본다** — 기기에서는 `canceled: true` 로 돌아온다고 문서가 적는다. 다만 웹에서는 그 값이 오지 않는다고 같은 문서가 적어, 웹은 아래처럼 따로 다룬다 |
 *
 * ── 왜 웹은 브라우저의 것을 그대로 쓰고 부품을 쓰지 않나 ──────────────────────────
 *
 * `expo-document-picker` 는 웹에서도 돌지만, 그 문서가 **"브라우저에서는 취소 사건이 돌아오지
 * 않는다"** 고 못박는다. 이 앱은 사람이 고르개를 닫았을 때 화면이 기다리는 상태에 멈추지 않는
 * 것을 W3 에서 이미 세웠고(아래 `cancel` 을 듣는 자리), 그것을 버릴 이유가 없다. 그래서
 * **웹은 W3 이 세운 길을 한 줄도 바꾸지 않고 그대로 두고, 기기 쪽 갈래만 새로 더했다.**
 * 이미 확인된 길을 확인되지 않은 길로 갈아 끼우는 것은 이득 없이 위험만 옮기는 일이다.
 */
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * 이 기기에서 기록 파일을 주고받을 수 있나. 설정 화면이 줄을 놓을지 이 값으로 가른다.
 *
 * 표면 셋을 하나씩 적었다. `true` 한 글자로 적지 않은 까닭은, 나중에 넷째 표면이 생겼을 때
 * **아무도 재 보지 않은 채 "된다" 고 말하게 되는 것**을 막기 위해서다.
 */
export const backupFileSupported =
  Platform.OS === 'web' || Platform.OS === 'ios' || Platform.OS === 'android';

/** 브라우저의 문서. 웹이 아니면 없다. */
function browserDocument(): Document | null {
  return Platform.OS === 'web' && typeof document !== 'undefined' ? document : null;
}

/**
 * 글 하나를 파일로 내보낸다. 웹에서는 내려받고, 기기에서는 공유 시트로 건넨다.
 *
 * @returns 내보내기를 시작했으면 true. 이 기기에서 할 수 없으면 false.
 */
export async function downloadTextFile(text: string, fileName: string): Promise<boolean> {
  if (Platform.OS === 'web') return downloadInBrowser(text, fileName);
  return shareOnDevice(text, fileName);
}

/**
 * 브라우저에서 글 하나를 파일로 내려받는다 (W3 슬라이스 C · 실제로 확인된 길).
 *
 * 브라우저에는 "이 글을 파일로 저장해 달라"는 곧은 길이 없어, 글을 잠깐 주소 하나로 만들고
 * 그 주소를 가리키는 보이지 않는 링크를 눌러 준다. 다 쓴 주소는 곧바로 버린다 — 버리지
 * 않으면 그 글이 화면을 닫을 때까지 메모리에 남는다.
 */
function downloadInBrowser(text: string, fileName: string): boolean {
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
 * 기기에서 글 하나를 파일로 만들어 공유 시트로 건넨다 (W4 슬라이스 D · **기기 미확인**).
 *
 * 두 걸음이다. 먼저 앱의 임시 자리에 파일을 하나 쓰고, 그다음 그 파일을 공유 시트에 얹는다.
 * 한 걸음으로 줄일 수 없는 까닭은 **공유 시트가 글이 아니라 파일을 받기 때문**이다.
 *
 * 임시 자리(`Paths.cache`)에 쓰는 것이 옳은 자리다. 이 파일은 사람이 다른 앱(파일·메일·
 * 클라우드)으로 옮기고 나면 앱 안에 남아 있을 이유가 없고, 임시 자리는 기기가 저장 공간이
 * 모자랄 때 스스로 비운다. 문서 자리(`Paths.document`)에 쓰면 사람이 지울 수 없는 사본이
 * 앱 안에 쌓인다.
 *
 * **공유 시트가 없는 기기에서는 아무것도 하지 않고 false 를 돌려준다.** 파일만 써 놓고
 * "내보냈습니다" 라고 말하면 사람은 있지도 않은 파일을 찾으러 다니게 된다.
 */
async function shareOnDevice(text: string, fileName: string): Promise<boolean> {
  try {
    if (!(await Sharing.isAvailableAsync())) return false;
    const file = new File(Paths.cache, fileName);
    // 같은 날 두 번 내보내면 이름이 같다. 덮어쓰지 않으면 둘째 번이 실패한다.
    if (file.exists) file.delete();
    file.create();
    file.write(text);
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      // iOS 는 MIME 형식이 아니라 자기 식 형식 이름(UTI)으로 무엇인지 가린다.
      UTI: 'public.json',
      dialogTitle: '기록 파일 저장하기',
    });
    return true;
  } catch {
    /*
      여기서 삼키는 것은 **사람이 시트를 닫은 것과 쓰기가 실패한 것**이다. 둘을 가릴 방법이
      없고, 가릴 필요도 없다 — 어느 쪽이든 부르는 쪽이 할 일은 "되지 않았다" 한 줄을 띄우는
      것뿐이기 때문이다. 앱이 멈추는 것만은 막는다.
    */
    return false;
  }
}

/** 사람에게 파일을 하나 고르게 하고 그 글을 읽어 온다. 고르지 않고 닫으면 `null`. */
export function pickTextFile(): Promise<string | null> {
  if (Platform.OS === 'web') return pickInBrowser();
  return pickOnDevice();
}

/**
 * 브라우저에서 파일을 하나 고르게 한다 (W3 슬라이스 C · 실제로 확인된 길).
 *
 * 파일 고르개는 화면에 두지 않고 이 함수가 그때그때 만든다 — 설정 화면에 보이지 않는
 * 부품이 하나 서 있는 것보다, 누를 때만 생겼다 사라지는 편이 화면을 읽기 쉽다.
 *
 * **`cancel` 을 함께 듣는 까닭.** 사람이 고르개를 열었다가 아무것도 고르지 않고 닫으면
 * `change` 는 오지 않는다. 그것만 들으면 약속이 영영 끝나지 않아 화면이 기다리는 상태에
 * 멈춘다. 크로미움·사파리·파이어폭스가 모두 그때 `cancel` 을 보낸다.
 */
function pickInBrowser(): Promise<string | null> {
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

/**
 * 기기에서 파일을 하나 고르게 한다 (W4 슬라이스 D · **기기 미확인**).
 *
 * `copyToCacheDirectory` 를 켜 두는 까닭은, 사람이 고른 파일이 **앱 바깥에 있어 곧바로 읽을
 * 수 없기 때문**이다. 켜 두면 고르는 순간 앱의 임시 자리로 한 벌 복사되고 그것을 읽는다.
 *
 * 걸러 내는 형식을 `application/json` 으로 좁혔다. 다만 안드로이드는 클라우드 저장소에서 온
 * 파일의 형식을 모르는 것으로 내려 줄 때가 있어, **좁힌 것만으로 이 길이 막히지는 않는지는
 * 기기에서 확인해야 한다** — 지금 확인할 수 없는 자리 가운데 하나다.
 */
async function pickOnDevice(): Promise<string | null> {
  try {
    const picked = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (picked.canceled) return null;
    const asset = picked.assets?.[0];
    if (!asset) return null;
    return await new File(asset.uri).text();
  } catch {
    // 읽지 못한 것도 "읽을 수 없는 파일" 과 같은 끝이다. 판정은 `parseBackup` 하나가 맡는다.
    return null;
  }
}
