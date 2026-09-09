/**
 * 성화 열여섯 장과 슬롯별 초점 좌표.
 *
 * 이 표의 값은 사람이 눈으로 정한 것이라 이 저장소에서 가장 값진 인계 자산 중 하나다.
 * 같은 그림이라도 띠의 세로 비율이 달라지면 얼굴이 걸리는 자리가 달라지고, 묵주 알이
 * 인물의 이목구비를 가리면 FR-23 위반이다. v5 시안은 열여섯 장을 네 기하에 실제로
 * 넣어 렌더한 뒤 눈으로 보며 좌표를 하나씩 정했다. **그 노동의 결과이므로 값을 다시
 * 정하지 않고 그대로 옮긴다.**
 *
 * 출처: `docs/design/v5/index.html` 의 `ART` 배열 (기계로 추출해 옮겼다).
 * 파일 번호에 09 가 없는 것은 결함이 아니다 — 워터마크가 그림 전면에 있어 v5 가 풀에서 뺐다.
 */
import type { ImageSourcePropType } from 'react-native';

/** 성화가 쓰이는 네 자리. 자리마다 기하가 다르다. */
export type ArtSlot = 'login' | 'thumb' | 'prayer' | 'finish';

/** 슬롯의 기하 (논리 픽셀). 초점 좌표는 이 비율을 전제로 정해졌다. */
export const SLOT_GEOMETRY: Readonly<Record<ArtSlot, { width: number; height: number }>> = {
  login: { width: 390, height: 340 },
  thumb: { width: 96, height: 124 },
  prayer: { width: 390, height: 148 },
  finish: { width: 390, height: 248 },
};

/**
 * 초점 좌표. CSS 의 `background-position` 과 같은 뜻이며, x 가 가로 y 가 세로다.
 * 예: `{ x: '50%', y: '24%' }` 는 `background-position: 50% 24%`.
 */
export interface ArtFocus {
  x: string;
  y: string;
}

/** 성화 한 장. */
export interface ArtPlate {
  /** 파일 이름(확장자 없이). `assets/art/<file>.jpg` 와 같아야 한다. */
  file: string;
  /** 번들에 들어가는 그림. Metro 는 require 경로가 정적이어야 하므로 표에 함께 적는다. */
  source: ImageSourcePropType;
  /** 슬롯별 초점 좌표. */
  focus: Readonly<Record<ArtSlot, ArtFocus>>;
  /**
   * 이 그림을 쓰지 않는 슬롯. 슬롯의 세로 비율이 극단적이면 초점을 어디에 두어도
   * 이목구비가 들어오지 않는 그림이 있어서 그런 조합을 미리 빼 둔 것이다.
   */
  excludedSlots: readonly ArtSlot[];
}

/** 열여섯 장. */
export const ART_PLATES: readonly ArtPlate[] = [
  {
    file: '01_Mary_Single',
    source: require('../../assets/art/01_Mary_Single.jpg'),
    focus: { login: { x: '50%', y: '24%' }, thumb: { x: '50%', y: '0%' }, prayer: { x: '50%', y: '30%' }, finish: { x: '50%', y: '33%' } },
    excludedSlots: [],
  },
  {
    file: '02_Mary_and_Child',
    source: require('../../assets/art/02_Mary_and_Child.jpg'),
    focus: { login: { x: '50%', y: '0%' }, thumb: { x: '16%', y: '50%' }, prayer: { x: '50%', y: '19%' }, finish: { x: '50%', y: '25%' } },
    excludedSlots: [],
  },
  {
    file: '03_Prating_Jesus',
    source: require('../../assets/art/03_Prating_Jesus.jpg'),
    focus: { login: { x: '50%', y: '0%' }, thumb: { x: '50%', y: '50%' }, prayer: { x: '50%', y: '34%' }, finish: { x: '50%', y: '18%' } },
    excludedSlots: [],
  },
  {
    file: '04_Cross',
    source: require('../../assets/art/04_Cross.jpg'),
    focus: { login: { x: '50%', y: '50%' }, thumb: { x: '50%', y: '50%' }, prayer: { x: '50%', y: '8%' }, finish: { x: '50%', y: '24%' } },
    excludedSlots: [],
  },
  {
    file: '05_Jesus_and_Sheep',
    source: require('../../assets/art/05_Jesus_and_Sheep.jpg'),
    focus: { login: { x: '50%', y: '11%' }, thumb: { x: '50%', y: '0%' }, prayer: { x: '50%', y: '19%' }, finish: { x: '50%', y: '22%' } },
    excludedSlots: [],
  },
  {
    file: '06_Side_Jesus',
    source: require('../../assets/art/06_Side_Jesus.jpg'),
    focus: { login: { x: '50%', y: '12%' }, thumb: { x: '50%', y: '0%' }, prayer: { x: '50%', y: '17%' }, finish: { x: '50%', y: '20%' } },
    excludedSlots: ['prayer'],
  },
  {
    file: '07_Relief_Holy_Family',
    source: require('../../assets/art/07_Relief_Holy_Family.jpg'),
    focus: { login: { x: '50%', y: '0%' }, thumb: { x: '50%', y: '0%' }, prayer: { x: '50%', y: '4%' }, finish: { x: '50%', y: '9%' } },
    excludedSlots: [],
  },
  {
    file: '08_Mary_Profile',
    source: require('../../assets/art/08_Mary_Profile.jpg'),
    focus: { login: { x: '50%', y: '38%' }, thumb: { x: '50%', y: '42%' }, prayer: { x: '50%', y: '40%' }, finish: { x: '50%', y: '42%' } },
    excludedSlots: [],
  },
  {
    file: '10_Blue_Mary',
    source: require('../../assets/art/10_Blue_Mary.jpg'),
    focus: { login: { x: '50%', y: '49%' }, thumb: { x: '50%', y: '60%' }, prayer: { x: '50%', y: '48%' }, finish: { x: '50%', y: '50%' } },
    excludedSlots: [],
  },
  {
    file: '11_Mary_Rosary_White_Gold',
    source: require('../../assets/art/11_Mary_Rosary_White_Gold.jpg'),
    focus: { login: { x: '100%', y: '50%' }, thumb: { x: '71%', y: '50%' }, prayer: { x: '50%', y: '54%' }, finish: { x: '50%', y: '61%' } },
    excludedSlots: ['prayer'],
  },
  {
    file: '12_Mary_Child_Neutral',
    source: require('../../assets/art/12_Mary_Child_Neutral.jpg'),
    focus: { login: { x: '50%', y: '63%' }, thumb: { x: '50%', y: '100%' }, prayer: { x: '50%', y: '59%' }, finish: { x: '50%', y: '60%' } },
    excludedSlots: ['prayer'],
  },
  {
    file: '13_Mosaic_Jesus_Water',
    source: require('../../assets/art/13_Mosaic_Jesus_Water.jpg'),
    focus: { login: { x: '50%', y: '40%' }, thumb: { x: '50%', y: '56%' }, prayer: { x: '50%', y: '42%' }, finish: { x: '50%', y: '44%' } },
    excludedSlots: [],
  },
  {
    file: '14_Swirl_Jesus_Arms',
    source: require('../../assets/art/14_Swirl_Jesus_Arms.jpg'),
    focus: { login: { x: '50%', y: '27%' }, thumb: { x: '50%', y: '50%' }, prayer: { x: '50%', y: '34%' }, finish: { x: '50%', y: '38%' } },
    excludedSlots: [],
  },
  {
    file: '15_Pastel_Crowd',
    source: require('../../assets/art/15_Pastel_Crowd.jpg'),
    focus: { login: { x: '50%', y: '95%' }, thumb: { x: '50%', y: '50%' }, prayer: { x: '50%', y: '78%' }, finish: { x: '50%', y: '79%' } },
    excludedSlots: [],
  },
  {
    file: '16_Dove_Clouds',
    source: require('../../assets/art/16_Dove_Clouds.jpg'),
    focus: { login: { x: '50%', y: '59%' }, thumb: { x: '50%', y: '79%' }, prayer: { x: '50%', y: '56%' }, finish: { x: '50%', y: '58%' } },
    excludedSlots: [],
  },
  {
    file: '17_Oil_Mary_Tomb',
    source: require('../../assets/art/17_Oil_Mary_Tomb.jpg'),
    focus: { login: { x: '50%', y: '62%' }, thumb: { x: '50%', y: '50%' }, prayer: { x: '50%', y: '56%' }, finish: { x: '50%', y: '58%' } },
    excludedSlots: [],
  },
];

/**
 * 여정용 그림이 통과해야 하는 슬롯 셋.
 * 홈에서 본 그림이 그 여정의 기도와 완주에서도 같은 그림으로 이어져야 하므로,
 * 세 슬롯 모두에서 쓸 수 있는 그림만 여정에 배정한다.
 */
export const JOURNEY_SLOTS: readonly ArtSlot[] = ['thumb', 'prayer', 'finish'];

/** 그 그림을 그 슬롯에 쓸 수 있는가. */
export function fitsSlot(plate: ArtPlate, slot: ArtSlot): boolean {
  return !plate.excludedSlots.includes(slot);
}
