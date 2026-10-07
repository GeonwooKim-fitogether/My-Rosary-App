/**
 * 배우기 두 편의 글을 읽어 화면이 그릴 수 있는 모양으로 내준다.
 *
 * 글 자체는 `spec/learn.json` 에 있다. 화면 파일에 글을 적지 않은 까닭은 둘이다. 첫째,
 * 글이 길어 화면 코드에 섞이면 코드도 글도 읽히지 않는다. 둘째, 이 글은 **아직 교회의
 * 검토를 받지 않은 글**이라 나중에 통째로 고쳐질 수 있고, 그때 고치는 자리가 한 곳이어야
 * 한다 (`docs/plan/learn-text-audit.md` 가 검토하는 자리다).
 *
 * **언어는 한국어와 영어 두 벌이 다 있다.** 신비 해설의 긴 글(`spec/mystery-commentary.ko.json`)
 * 이 한국어뿐인 것과 다른데, 까닭이 있다. 신비 해설은 그 언어의 신자들이 쓰는 고유한 어법이
 * 있어 함부로 옮기지 않는 편이 낫지만, 이 두 편은 처음 온 사람에게 사실과 배경을 알려 주는
 * 글이라 같은 내용을 두 언어로 적는 데 무리가 없다. 켜지지 않은 나머지 다섯 언어는 영어로
 * 떨어진다 — 지어내지 않는다는 규칙은 여기서도 같다.
 */
import learn from '../../spec/learn.json';
import type { LanguageKey } from '../i18n';

/** 항목 목록의 한 줄 — 이름과 설명. */
export interface LearnItem {
  term: string;
  text: string;
}

/** 글 한 편 안의 한 절. 네 칸 가운데 필요한 것만 갖는다. */
export interface LearnSection {
  /** 절의 제목. */
  heading: string;
  /** 문단 여럿. 없는 절도 있다. */
  body: readonly string[];
  /** 이름과 설명이 짝지어진 목록. 없는 절도 있다. */
  list: readonly LearnItem[];
  /** 번호가 매겨진 차례. 없는 절도 있다. */
  steps: readonly string[];
  /** 절 끝의 작은 덧말. 없는 절도 있다. */
  note: string | null;
}

/** 글 한 편. */
export interface LearnGuide {
  title: string;
  lead: string;
  sections: readonly LearnSection[];
}

/** 두 편의 이름. 화면 파일 둘이 각각 하나를 고른다. */
export type LearnGuideKey = 'basics' | 'background';

type RawSection = {
  heading: string;
  body?: readonly string[];
  list?: readonly LearnItem[];
  steps?: readonly string[];
  note?: string;
};
type RawGuide = { title: string; lead: string; sections: readonly RawSection[] };

const GUIDES = learn.guides as Readonly<Record<LearnGuideKey, Record<string, RawGuide>>>;

/**
 * 그 언어의 글 한 편. 그 언어가 없으면 영어로 떨어진다.
 *
 * 비어 있는 칸을 빈 배열로 채워 내주므로, 화면은 `section.body ?? []` 같은 방어를 하지
 * 않는다 — 방어가 화면마다 흩어지면 한 군데를 빠뜨렸을 때 그 자리만 조용히 깨진다.
 */
export function learnGuide(key: LearnGuideKey, language: LanguageKey): LearnGuide {
  const raw = GUIDES[key][language] ?? GUIDES[key].en;
  return {
    title: raw.title,
    lead: raw.lead,
    sections: raw.sections.map((section) => ({
      heading: section.heading,
      body: section.body ?? [],
      list: section.list ?? [],
      steps: section.steps ?? [],
      note: section.note ?? null,
    })),
  };
}
