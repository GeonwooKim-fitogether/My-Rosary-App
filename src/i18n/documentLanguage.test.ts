/**
 * 문서의 언어를 앱의 언어와 맞추는 일의 시험 (W4 슬라이스 B).
 *
 * 재는 것은 둘이다. **웹에서는 실제로 고쳐 쓰는가**, 그리고 **문서가 없는 곳(iOS·안드로이드
 * 앱과 이 시험 환경)에서는 조용히 물러나는가.** 뒤의 것이 없으면 앱이 켜지자마자 멈춘다.
 *
 * 이 시험 환경(jest-expo/node)에는 문서가 없으므로, 웹을 재는 자리는 **문서를 흉내 낸 값**을
 * 잠시 세워 두고 잰다 — 브라우저를 띄우지 않고 이 함수의 판단만 보려는 것이다. 실제 브라우저
 * 에서 `<html lang>` 이 정말 바뀌는지는 e2e 가 따로 확인한다(`e2e/language.spec.ts`).
 */
import { syncDocumentLanguage } from './documentLanguage';

/** 문서를 흉내 낸 값을 세우고, 시험이 끝나면 걷는다. */
function withFakeDocument(initial: string, run: (root: { lang: string }) => void): void {
  const root = { lang: initial };
  const target = globalThis as unknown as { document?: unknown };
  const before = target.document;
  target.document = { documentElement: root };
  try {
    run(root);
  } finally {
    if (before === undefined) delete target.document;
    else target.document = before;
  }
}

describe('문서의 언어를 앱의 언어와 맞춘다', () => {
  it('문서가 없으면 아무 일도 하지 않는다 — 앱(iOS·안드로이드)에서 멈추지 않는다', () => {
    expect(typeof document).toBe('undefined');
    expect(() => syncDocumentLanguage('ko')).not.toThrow();
  });

  it('한국어로 쓰는 사람의 문서는 한국어라고 말한다', () => {
    withFakeDocument('en', (root) => {
      syncDocumentLanguage('ko');
      expect(root.lang).toBe('ko');
    });
  });

  it('영어로 바꾸면 문서도 따라 바뀐다', () => {
    withFakeDocument('ko', (root) => {
      syncDocumentLanguage('en');
      expect(root.lang).toBe('en');
    });
  });

  it('이미 같은 값이면 그대로 둔다 — 쓰지 않아도 되는 것은 쓰지 않는다', () => {
    withFakeDocument('ko', (root) => {
      let writes = 0;
      Object.defineProperty(root, 'lang', {
        configurable: true,
        get: () => 'ko',
        set: () => {
          writes += 1;
        },
      });
      syncDocumentLanguage('ko');
      expect(writes).toBe(0);
    });
  });
});
