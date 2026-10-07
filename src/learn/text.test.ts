/**
 * 배우기 두 편의 글이 **비어 있지 않은가**를 잰다.
 *
 * 이 시험이 막는 것은 코드의 버그가 아니라 **글의 구멍**이다. 글은 JSON 파일에 있으므로
 * 한 절의 본문을 통째로 지워도 타입 검사가 잡지 못하고, 화면은 오류 없이 그 자리를
 * 비운 채로 그린다. 사람이 그 화면을 다시 열어 보기 전에는 아무도 모른다.
 *
 * 그래서 여기서는 글의 내용이 아니라 **글이 있다는 사실**을 잰다 — 두 편이 한국어와
 * 영어 두 벌씩 있고, 절마다 제목이 있고, 절마다 셋(문단 · 목록 · 차례) 가운데 적어도
 * 하나는 채워져 있는가.
 */
import { learnGuide, type LearnGuideKey } from './text';

const GUIDES: LearnGuideKey[] = ['basics', 'background'];

describe('배우기 두 편의 글', () => {
  for (const key of GUIDES) {
    for (const language of ['ko', 'en'] as const) {
      describe(`${key} · ${language}`, () => {
        const guide = learnGuide(key, language);

        it('제목과 머리말이 있다', () => {
          expect(guide.title.length).toBeGreaterThan(0);
          expect(guide.lead.length).toBeGreaterThan(40);
        });

        it('절이 여섯 이상이다', () => {
          expect(guide.sections.length).toBeGreaterThanOrEqual(6);
        });

        it('절마다 제목이 있고, 알맹이가 적어도 하나는 있다', () => {
          for (const section of guide.sections) {
            expect(section.heading.length).toBeGreaterThan(0);
            const filled =
              section.body.length + section.list.length + section.steps.length;
            expect(filled).toBeGreaterThan(0);
          }
        });

        it('빈 문단이나 빈 항목이 섞여 있지 않다', () => {
          for (const section of guide.sections) {
            for (const paragraph of section.body) expect(paragraph.trim().length).toBeGreaterThan(0);
            for (const step of section.steps) expect(step.trim().length).toBeGreaterThan(0);
            for (const item of section.list) {
              expect(item.term.trim().length).toBeGreaterThan(0);
              expect(item.text.trim().length).toBeGreaterThan(0);
            }
          }
        });
      });
    }
  }

  it('한국어와 영어가 같은 수의 절을 갖는다', () => {
    for (const key of GUIDES) {
      expect(learnGuide(key, 'ko').sections.length).toBe(learnGuide(key, 'en').sections.length);
    }
  });

  /*
    켜지지 않은 언어는 영어로 떨어진다. 빈 화면이 아니라 영어가 서는 것이 의도이며,
    그 언어의 글을 지어내지 않는다는 규칙과 짝을 이룬다.
  */
  it('글이 없는 언어는 영어로 떨어진다', () => {
    expect(learnGuide('basics', 'it')).toEqual(learnGuide('basics', 'en'));
  });
});
