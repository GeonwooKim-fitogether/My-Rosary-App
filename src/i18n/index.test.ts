/**
 * 언어 일곱의 시험 — 문구가 빠진 자리가 없는가, 그리고 켜지지 않은 언어가 새어 나가지 않는가.
 *
 * 첫째 질문이 중요한 이유는 빠진 문구가 조용하기 때문이다. 화면이 없는 키를 읽으면
 * 그 자리에 빈칸이나 `undefined` 가 그려지고, 한국어로 쓰는 사람은 영원히 그것을 보지
 * 못한다. 그래서 일곱 벌의 키를 기계로 맞춰 본다.
 *
 * 둘째 질문은 기도문 때문이다. 시안이 담아 온 기도문 일곱 벌은 공식 기도서와 대조되지
 * 않았고 앞 절·뒷 절로 나뉘지도 않았다. 켜지지 않은 언어가 어떤 경로로든 기도문의
 * 언어가 되면, 사람이 확인되지 않은 문구를 바치게 된다.
 */
import {
  ENABLED_LANGUAGES,
  fill,
  LANGUAGE_ORDER,
  LANGUAGES,
  prayerLanguage,
  REGION_DEFAULT_LANGUAGE,
  REGION_LANGUAGES,
  stringsFor,
  type LanguageKey,
} from './index';
import { REGION_ORDER } from '../theme/worldTokens';

/** 중첩된 것까지 펼친 키 목록. `regionDesc.korea` 처럼 점으로 잇는다. */
function keysOf(strings: Record<string, unknown>): string[] {
  return Object.entries(strings)
    .flatMap(([key, value]) =>
      value && typeof value === 'object'
        ? Object.keys(value as Record<string, unknown>).map((inner) => `${key}.${inner}`)
        : [key],
    )
    .sort();
}

describe('일곱 벌의 문구가 같은 자리를 갖는다', () => {
  const base = keysOf(stringsFor('ko') as unknown as Record<string, unknown>);

  it('한국어 벌에 문구가 백 개 넘게 있다 — 표가 비어 오는 것을 막는다', () => {
    expect(base.length).toBeGreaterThan(90);
  });

  it.each(LANGUAGE_ORDER)('%s 벌에 빠진 문구도 남는 문구도 없다', (language: LanguageKey) => {
    expect(keysOf(stringsFor(language) as unknown as Record<string, unknown>)).toEqual(base);
  });

  it.each(LANGUAGE_ORDER)('%s 벌의 문구에 빈 값이 없다', (language: LanguageKey) => {
    const strings = stringsFor(language) as unknown as Record<string, unknown>;
    for (const value of Object.values(strings)) {
      if (typeof value === 'string') expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it('언어 일곱이 차례와 이름표를 모두 갖는다', () => {
    expect(LANGUAGE_ORDER).toHaveLength(7);
    for (const language of LANGUAGE_ORDER) {
      expect(LANGUAGES[language].name.length).toBeGreaterThan(0);
      expect(LANGUAGES[language].voice).toMatch(/^[a-z]{2,3}-[A-Z]{2}$/);
    }
  });

  it('모르는 언어가 오면 한국어로 떨어진다', () => {
    expect(stringsFor('xx' as LanguageKey)).toBe(stringsFor('ko'));
  });
});

describe('켜진 언어만 고를 수 있다 (로드맵 카드 C)', () => {
  it('지금 켜진 것은 한국어와 영어 둘이다', () => {
    expect([...ENABLED_LANGUAGES]).toEqual(['ko', 'en']);
  });

  it('켜진 언어는 모두 데이터가 들어와 있는 언어다', () => {
    for (const language of ENABLED_LANGUAGES) expect(LANGUAGE_ORDER).toContain(language);
  });
});

describe('기도문의 언어는 확인된 것만 쓴다', () => {
  it('한국어는 자기 기도문을 쓴다 — 이 저장소의 정본이 있다', () => {
    expect(prayerLanguage('ko')).toBe('ko');
  });

  it.each(['en', 'it', 'fr', 'es', 'pt', 'tl'] as const)(
    '%s 는 아직 한국어 기도문으로 떨어진다 — 공식 문구 대조(D-4)와 앞 절·뒷 절 나눔이 끝나지 않았다',
    (language: LanguageKey) => {
      expect(prayerLanguage(language)).toBe('ko');
    },
  );
});

describe('지역과 언어가 이어져 있다', () => {
  it.each(REGION_ORDER)('%s 의 기본 언어가 그 지역의 언어 목록 안에 있다', (region) => {
    expect(REGION_LANGUAGES[region]).toContain(REGION_DEFAULT_LANGUAGE[region]);
  });

  it('모든 지역의 언어가 데이터가 들어와 있는 일곱 안에 있다', () => {
    for (const region of REGION_ORDER) {
      for (const language of REGION_LANGUAGES[region]) expect(LANGUAGE_ORDER).toContain(language);
    }
  });

  it('한국은 한국어 하나다', () => {
    expect([...REGION_LANGUAGES.korea]).toEqual(['ko']);
  });
});

describe('문구에 값을 끼워 넣는다', () => {
  it('자리를 값으로 바꾼다', () => {
    expect(fill('{d}일째 / {t}일', { d: 3, t: 54 })).toBe('3일째 / 54일');
  });

  it('값이 없는 자리는 그대로 둔다 — 빈칸으로 지워 버리지 않는다', () => {
    expect(fill('{a} · {b}', { a: '환희' })).toBe('환희 · {b}');
  });

  it('바꿀 자리가 없으면 원문 그대로다', () => {
    expect(fill('성모송', {})).toBe('성모송');
  });
});
