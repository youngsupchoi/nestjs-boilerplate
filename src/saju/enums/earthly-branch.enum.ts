import { FiveElements } from './five-elements.enum';
import { EarthlyBranchInfo } from '../interfaces/earthly-branch-info.interface';

/**
 * 십이지 (地支) - 12개의 지지
 */
export enum EarthlyBranch {
  JA = '자', // 子
  CHUK = '축', // 丑
  IN = '인', // 寅
  MYO = '묘', // 卯
  JIN = '진', // 辰
  SA = '사', // 巳
  O = '오', // 午
  MI = '미', // 未
  SHIN = '신', // 申
  YU = '유', // 酉
  SUL = '술', // 戌
  HAE = '해', // 亥
}

/**
 * 지지별 상세 정보 (음양, 오행, 기본 설명 포함)
 */
export const EARTHLY_BRANCH_INFO: Record<EarthlyBranch, EarthlyBranchInfo> = {
  [EarthlyBranch.JA]: {
    character: '자',
    isYang: true,
    element: FiveElements.WATER,
    description: '사교적이고 민감함',
    characteristics: [
      '지혜와 감성, 변화의 시작, 트렌드에 민감',
      '적응력이 뛰어나고 변화를 잘 받아들임',
      '사교적이고 인맥이 넓음',
      '때로는 변덕스럽고 일관성이 부족할 수 있음',
      '물처럼 유연하고 흐름을 따름'
    ]
  },

  [EarthlyBranch.CHUK]: {
    character: '축',
    isYang: false,
    element: FiveElements.EARTH,
    description: '인내심 강하고 현실적임',
    characteristics: [
      '인내와 현실감, 신중함, 무게감',
      '꾸준하고 성실한 성격',
      '현실적이고 실용적인 판단력',
      '때로는 고집이 세고 변화를 싫어할 수 있음',
      '소처럼 묵묵히 일하는 타입'
    ]
  },

  [EarthlyBranch.IN]: {
    character: '인',
    isYang: true,
    element: FiveElements.WOOD,
    description: '열정적이고 추진력 있음',
    characteristics: [
      '의지와 추진력, 개척정신',
      '리더십이 강하고 독립적',
      '새로운 도전을 좋아함',
      '때로는 성급하고 무모할 수 있음',
      '호랑이처럼 용맹하고 당당함'
    ]
  },

  [EarthlyBranch.MYO]: {
    character: '묘',
    isYang: false,
    element: FiveElements.WOOD,
    description: '섬세하고 감성적',
    characteristics: [
      '감성적이고 유연한 기질',
      '예술적 감각이 뛰어남',
      '부드럽고 온화한 성격',
      '때로는 우유부단하고 소극적일 수 있음',
      '토끼처럼 조심스럽고 민첩함'
    ]
  },

  [EarthlyBranch.JIN]: {
    character: '진',
    isYang: true,
    element: FiveElements.EARTH,
    description: '의욕적이고 강직함',
    characteristics: [
      '복잡하고 다면적인 사고, 다양한 기질, 성향이 뚜렷함',
      '강한 의지력과 추진력',
      '복합적이고 다재다능함',
      '때로는 복잡하고 예측하기 어려울 수 있음',
      '용처럼 역동적이고 변화무쌍함'
    ]
  },

  [EarthlyBranch.SA]: {
    character: '사',
    isYang: false,
    element: FiveElements.FIRE,
    description: '감각적이고 화려함',
    characteristics: [
      '열정적이고 민감한 감정, 때로 급격히 변하는 공격성, 결단',
      '감각적이고 세련된 취향',
      '직감력이 뛰어남',
      '때로는 변덕스럽고 감정적일 수 있음',
      '뱀처럼 신비롭고 예리함'
    ]
  },

  [EarthlyBranch.O]: {
    character: '오',
    isYang: true,
    element: FiveElements.FIRE,
    description: '낙천적이고 추진력',
    characteristics: [
      '자기중심적이고 리더십 있음',
      '밝고 활동적인 성격',
      '추진력이 강하고 적극적',
      '때로는 성급하고 독선적일 수 있음',
      '말처럼 역동적이고 자유로움'
    ]
  },

  [EarthlyBranch.MI]: {
    character: '미',
    isYang: false,
    element: FiveElements.EARTH,
    description: '온화하고 타인 배려',
    characteristics: [
      '안정과 조화, 봉사정신',
      '배려심이 깊고 친화력이 좋음',
      '평화를 추구하고 조화로움',
      '때로는 우유부단하고 의존적일 수 있음',
      '양처럼 온순하고 따뜻함'
    ]
  },

  [EarthlyBranch.SHIN]: {
    character: '신',
    isYang: true,
    element: FiveElements.METAL,
    description: '분석력 뛰어나고 명확',
    characteristics: [
      '이성적이고 분석적, 냉철함',
      '논리적이고 체계적인 사고',
      '정확하고 꼼꼼한 성격',
      '때로는 비판적이고 까다로울 수 있음',
      '원숭이처럼 영리하고 재치있음'
    ]
  },

  [EarthlyBranch.YU]: {
    character: '유',
    isYang: false,
    element: FiveElements.METAL,
    description: '지적이고 깔끔함',
    characteristics: [
      '세련됨과 표현력, 사교성, 분석적이지만 아주 날카롭지는 않음',
      '미적 감각이 뛰어남',
      '사교적이고 표현력이 좋음',
      '때로는 허영심이 있고 외면을 중시할 수 있음',
      '닭처럼 깔끔하고 정확함'
    ]
  },

  [EarthlyBranch.SUL]: {
    character: '술',
    isYang: true,
    element: FiveElements.EARTH,
    description: '보수적이고 책임감',
    characteristics: [
      '현실적이고 방어적인 태도, 안정 지향형',
      '책임감이 강하고 신뢰할 수 있음',
      '보수적이고 안정을 추구함',
      '때로는 완고하고 융통성이 부족할 수 있음',
      '개처럼 충성스럽고 성실함'
    ]
  },

  [EarthlyBranch.HAE]: {
    character: '해',
    isYang: false,
    element: FiveElements.WATER,
    description: '직관적이고 상상력 풍부',
    characteristics: [
      '감성적이지만 내향적인 성향',
      '직관력이 뛰어나고 신비로움',
      '상상력이 풍부하고 창의적',
      '때로는 현실도피적이고 우유부단할 수 있음',
      '돼지처럼 순수하고 관대함'
    ]
  }
};
