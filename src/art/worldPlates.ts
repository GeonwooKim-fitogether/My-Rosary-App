/**
 * 성화 열여섯 장과 지역 다섯이 쓰는 목록 — 「MyRosary World」 시안의 표를 옮긴 것이다.
 *
 * v5 의 표(`plates.ts`)와 **함께 있고 대신하지 않는다.** 둘은 그림도 다르고 슬롯 체계도
 * 다르다 — v5 는 한 그림이 네 자리(로그인·썸네일·기도·완주)마다 다른 초점을 갖는 반면,
 * 이 표는 그림마다 초점 하나를 갖고 자리에 따라 그 값을 조금 옮겨 쓴다. 기존 화면이 v5
 * 표로 서 있는 동안 두 표가 나란히 있어야 하므로 지우지 않는다.
 *
 * 출처: `docs/design/world/data.js` 의 `IMAGES` 와 `REGIONS` (`tools/w0/extract-world-data.mjs`
 * 가 기계로 뽑아 `spec/plates.world.json` 에 적었고, 이 파일이 그것을 코드로 옮긴다).
 *
 * **권리는 미확정이다 (PRD D-1).** 그중 넷에는 작가 서명이나 스톡 워터마크가 눈에 보여
 * 아래 표에 `mark` 로 적어 두었다. 검증 단계까지는 그대로 쓰되 정식 출시 자산에서는
 * 교체 대상이다 — 시안을 만든 지시문 자신이 워터마크 이미지를 쓰지 말라고 적었다.
 */
import type { ImageSourcePropType } from 'react-native';
import type { RegionKey } from '../theme/worldTokens';

/** 성화 한 장. */
export interface WorldPlate {
  /** 시안의 표에서 쓰는 두 자리 번호. */
  id: string;
  /** 파일 이름. `assets/art/world/<file>` 와 같아야 한다. */
  file: string;
  /** 번들에 들어가는 그림. Metro 는 require 경로가 정적이어야 하므로 표에 함께 적는다. */
  source: ImageSourcePropType;
  /** 초점. CSS 의 `background-position` 과 같은 뜻이며 x 가 가로 y 가 세로다. */
  focal: { x: string; y: string };
  /** 그림의 이름. 화면에 보이고 스크린리더가 읽는다. */
  title: { ko: string; en: string };
  /** 그림의 밝기. 글자를 얹을 때 스크림의 짙기를 정하는 데 쓴다. */
  tone: 'light' | 'mid' | 'dark';
  /** 눈으로 확인된 작가 서명·워터마크. 있으면 정식 자산에서 교체한다 (D-1). */
  mark?: string;
}

/** 성화 표. 시안의 `IMAGES` 를 그대로 옮겼다. */
export const WORLD_PLATES: Readonly<Record<string, WorldPlate>> = {
  '01': {
    id: '01',
    file: '01-mary-single.jpg',
    source: require('../../assets/art/world/01-mary-single.jpg'),
    focal: { x: '50%', y: '22%' },
    title: { ko: '빛 가운데 서신 성모', en: "Our Lady in Light" },
    tone: 'light',
  },
  '02': {
    id: '02',
    file: '02-mary-child.jpg',
    source: require('../../assets/art/world/02-mary-child.jpg'),
    focal: { x: '55%', y: '30%' },
    title: { ko: '성모와 아기 예수', en: "Mother and Child" },
    tone: 'light',
    mark: 'ANGELA GIL · VELVET WHISPERS STUDIO 워터마크가 오른쪽 아래에 있다',
  },
  '03': {
    id: '03',
    file: '03-praying-jesus.jpg',
    source: require('../../assets/art/world/03-praying-jesus.jpg'),
    focal: { x: '50%', y: '30%' },
    title: { ko: '기도하시는 예수', en: "Christ in Prayer" },
    tone: 'light',
  },
  '04': {
    id: '04',
    file: '04-cross.jpg',
    source: require('../../assets/art/world/04-cross.jpg'),
    focal: { x: '50%', y: '45%' },
    title: { ko: '빈 무덤의 십자가', en: "The Cross at the Tomb" },
    tone: 'light',
    mark: '같은 스튜디오의 워터마크가 오른쪽 아래에 있다',
  },
  '05': {
    id: '05',
    file: '05-jesus-sheep.jpg',
    source: require('../../assets/art/world/05-jesus-sheep.jpg'),
    focal: { x: '40%', y: '35%' },
    title: { ko: '착한 목자', en: "The Good Shepherd" },
    tone: 'light',
  },
  '06': {
    id: '06',
    file: '06-side-jesus.jpg',
    source: require('../../assets/art/world/06-side-jesus.jpg'),
    focal: { x: '60%', y: '25%' },
    title: { ko: '손을 내미시는 예수', en: "Christ Reaching Out" },
    tone: 'light',
  },
  '07': {
    id: '07',
    file: '07-relief-holy-family.jpg',
    source: require('../../assets/art/world/07-relief-holy-family.jpg'),
    focal: { x: '50%', y: '45%' },
    title: { ko: '성가정', en: "The Holy Family" },
    tone: 'light',
  },
  '08': {
    id: '08',
    file: '08-mary-profile.jpg',
    source: require('../../assets/art/world/08-mary-profile.jpg'),
    focal: { x: '50%', y: '30%' },
    title: { ko: '성모의 옆모습', en: "Our Lady in Profile" },
    tone: 'light',
  },
  '10': {
    id: '10',
    file: '10-blue-mary.jpg',
    source: require('../../assets/art/world/10-blue-mary.jpg'),
    focal: { x: '50%', y: '40%' },
    title: { ko: '푸른 옷의 성모', en: "Our Lady in Blue" },
    tone: 'light',
  },
  '11': {
    id: '11',
    file: '11-prayer-rosary.jpg',
    source: require('../../assets/art/world/11-prayer-rosary.jpg'),
    focal: { x: '45%', y: '30%' },
    title: { ko: '묵주를 든 기도', en: "Prayer with Rosary" },
    tone: 'light',
    mark: '같은 스튜디오의 워터마크가 오른쪽 아래에 있다',
  },
  '12': {
    id: '12',
    file: '12-mary-child-neutral.jpg',
    source: require('../../assets/art/world/12-mary-child-neutral.jpg'),
    focal: { x: '50%', y: '30%' },
    title: { ko: '성모와 아기', en: "Mother and Child" },
    tone: 'light',
  },
  '13': {
    id: '13',
    file: '13.jpg',
    source: require('../../assets/art/world/13.jpg'),
    focal: { x: '50%', y: '30%' },
    title: { ko: '물 위를 걸으시는 예수', en: "Christ Walking on Water" },
    tone: 'mid',
    mark: '그림 안에 붓으로 그려진 작가 서명이 오른쪽 아래에 있다',
  },
  '14': {
    id: '14',
    file: '14.jpg',
    source: require('../../assets/art/world/14.jpg'),
    focal: { x: '50%', y: '40%' },
    title: { ko: '부활', en: "The Resurrection" },
    tone: 'mid',
  },
  '15': {
    id: '15',
    file: '15.jpg',
    source: require('../../assets/art/world/15.jpg'),
    focal: { x: '50%', y: '55%' },
    title: { ko: '빛을 향한 무리', en: "The Multitude Toward the Light" },
    tone: 'mid',
  },
  '16': {
    id: '16',
    file: '16.jpg',
    source: require('../../assets/art/world/16.jpg'),
    focal: { x: '50%', y: '35%' },
    title: { ko: '성령', en: "The Holy Spirit" },
    tone: 'light',
  },
  '17': {
    id: '17',
    file: '17.jpg',
    source: require('../../assets/art/world/17.jpg'),
    focal: { x: '40%', y: '45%' },
    title: { ko: '빈 무덤 앞의 마리아', en: "Mary at the Empty Tomb" },
    tone: 'dark',
  },
};

/** 표에 오른 번호들. 시안의 `IMAGE_IDS` 와 같은 순서다. */
export const WORLD_PLATE_IDS: readonly string[] = ['10', '11', '12', '13', '14', '15', '16', '17', '01', '02', '03', '04', '05', '06', '07', '08'];

/**
 * 지역마다 쓰는 그림. 한 지역이 예닐곱 장을 돌려 쓰며, 같은 그림이 여러 지역에 든다.
 */
export const REGION_PLATES: Readonly<Record<RegionKey, readonly string[]>> = {
  europe: ['03', '04', '13', '17', '07', '06', '11'],
  northamerica: ['05', '16', '13', '06', '03', '17'],
  southamerica: ['15', '14', '17', '02', '13', '05'],
  asia: ['07', '10', '11', '06', '01', '16'],
  korea: ['01', '12', '10', '02', '11', '08', '07'],
};

/** 서명·워터마크가 눈으로 확인된 그림들. 정식 자산 교체(D-1)에서 먼저 볼 목록이다. */
export const MARKED_PLATES: readonly string[] = Object.values(WORLD_PLATES)
  .filter((plate) => plate.mark)
  .map((plate) => plate.id);

/**
 * 그림의 이름을 지금 언어로 고른다 (W3 슬라이스 B).
 *
 * 표에는 이름이 **한국어와 영어 둘**뿐인데 이 앱의 언어는 일곱이다. 시안도 마찬가지이고
 * (`data.js` 의 `IMAGES` 가 `ko` 와 `en` 만 갖는다), 그래서 한국어가 아닌 언어는 모두 영어
 * 이름을 본다. 없는 번역을 지어 넣지 않는 것이 이 저장소의 규칙이므로 그대로 둔다 —
 * 실제로 켜진 언어도 한국어와 영어 둘이다(결정 12-C).
 */
export function plateTitle(plate: WorldPlate, language: string): string {
  return language === 'ko' ? plate.title.ko : plate.title.en;
}

/** 파일 이름으로 그림을 찾는다. 표에 없는 이름이면 undefined 다. */
export function plateByFile(file: string | null | undefined): WorldPlate | undefined {
  if (!file) return undefined;
  return Object.values(WORLD_PLATES).find((plate) => plate.file === file);
}
