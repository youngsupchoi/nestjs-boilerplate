import { FiveElements } from './five-elements.enum';
import { HeavenlyStemInfo } from '../interfaces/heavenly-stem-info.interface';

/**
 * 십간 (天干) - 10개의 천간
 */
export enum HeavenlyStem {
  GAP = '갑', // 甲
  EUL = '을', // 乙
  BYEONG = '병', // 丙
  JEONG = '정', // 丁
  MU = '무', // 戊
  GI = '기', // 己
  GYEONG = '경', // 庚
  SIN = '신', // 辛
  IM = '임', // 壬
  GYE = '계', // 癸
}

/**
 * 천간별 상세 정보 (음양, 오행, 기본 설명 포함)
 */
export const HEAVENLY_STEM_INFO: Record<HeavenlyStem, HeavenlyStemInfo> = {
  [HeavenlyStem.GAP]: {
    character: '갑',
    isYang: true,
    element: FiveElements.WOOD,
    description: '진취적이고 솔직함',
    characteristics: [
      '굳고 직선적인 기운, 추진력과 개척정신, 정직함',
      '강한 의지력과 리더십을 가짐',
      '새로운 일을 시작하는 것을 좋아함',
      '때로는 고집이 세고 독선적일 수 있음',
      '큰 나무처럼 든든하고 믿음직함'
    ]
  },
  
  [HeavenlyStem.EUL]: {
    character: '을',
    isYang: false,
    element: FiveElements.WOOD,
    description: '유연하고 섬세함',
    characteristics: [
      '유연하고 부드러운 기운, 배려와 순응, 융통성',
      '적응력이 뛰어나고 감수성이 풍부함',
      '협조적이고 조화를 중시함',
      '때로는 우유부단하고 의존적일 수 있음',
      '풀처럼 부드럽고 생명력이 강함'
    ]
  },
  
  [HeavenlyStem.BYEONG]: {
    character: '병',
    isYang: true,
    element: FiveElements.FIRE,
    description: '열정적이고 카리스마 있음',
    characteristics: [
      '뜨겁고 밝은 에너지, 외향적이고 카리스마 있음',
      '열정적이고 에너지가 넘침',
      '사교적이고 인기가 많음',
      '때로는 성급하고 감정적일 수 있음',
      '태양처럼 따뜻하고 생명력을 줌'
    ]
  },
  
  [HeavenlyStem.JEONG]: {
    character: '정',
    isYang: false,
    element: FiveElements.FIRE,
    description: '예술적이고 감성적임',
    characteristics: [
      '섬세하고 감성적인 불, 감정표현이 풍부, 따뜻함',
      '집중력이 뛰어나고 완벽주의적',
      '예술적 감각이 뛰어남',
      '때로는 신경질적이고 예민할 수 있음',
      '촛불처럼 따뜻하고 정밀함'
    ]
  },
  
  [HeavenlyStem.MU]: {
    character: '무',
    isYang: true,
    element: FiveElements.EARTH,
    description: '의지가 강하고 책임감 있음',
    characteristics: [
      '묵직한 대지의 기운, 책임감과 중심력, 넓은 법위의 성장 지향',
      '안정적이고 신뢰할 수 있음',
      '포용력이 크고 너그러움',
      '때로는 완고하고 변화를 싫어할 수 있음',
      '산처럼 웅장하고 든든함'
    ]
  },
  
  [HeavenlyStem.GI]: {
    character: '기',
    isYang: false,
    element: FiveElements.EARTH,
    description: '섬세하고 틈틈이 있음',
    characteristics: [
      '따뜻한 흙, 포용성과 실속 추구, 좁은 범위의 깊이 성장',
      '배려심이 깊고 봉사정신이 강함',
      '실용적이고 현실적임',
      '때로는 소극적이고 걱정이 많을 수 있음',
      '밭처럼 생산적이고 풍요로움'
    ]
  },
  
  [HeavenlyStem.GYEONG]: {
    character: '경',
    isYang: true,
    element: FiveElements.METAL,
    description: '결단력 있고 단호함',
    characteristics: [
      '날카롭고 단단한 금속, 이성적이고 전략적, 강력한 추진',
      '정의감이 강하고 용감함',
      '원칙을 중시하고 공정함',
      '때로는 경직되고 융통성이 부족할 수 있음',
      '칼처럼 날카롭고 정확함'
    ]
  },
  
  [HeavenlyStem.SIN]: {
    character: '신',
    isYang: false,
    element: FiveElements.METAL,
    description: '분석력 있고 냉철함',
    characteristics: [
      '잘 깎은 반짝이는 보석, 날카로운 분석력과 표현력 탁월',
      '미적 감각이 뛰어남',
      '분석력이 좋고 꼼꼼함',
      '때로는 까다롭고 비판적일 수 있음',
      '보석처럼 아름답고 가치 있음'
    ]
  },
  
  [HeavenlyStem.IM]: {
    character: '임',
    isYang: true,
    element: FiveElements.WATER,
    description: '직관력 좋고 에너지 큼',
    characteristics: [
      '깊고 강한 물, 목표지향적이고 추진력 있음, 포용력, 지식, 학습력 탁월',
      '지혜롭고 통찰력이 있음',
      '변화를 잘 받아들임',
      '때로는 변덕스럽고 일관성이 부족할 수 있음',
      '바다처럼 광활하고 깊음'
    ]
  },
  
  [HeavenlyStem.GYE]: {
    character: '계',
    isYang: false,
    element: FiveElements.WATER,
    description: '감성적이고 신비로움',
    characteristics: [
      '유연하고 차가운 물, 내면적 사고와 감성, 지혜로움',
      '직관력이 뛰어나고 신비로움',
      '순수하고 깨끗한 성격',
      '때로는 우울하고 내성적일 수 있음',
      '이슬처럼 맑고 순수함'
    ]
  }
};
