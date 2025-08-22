import { HeavenlyStem } from '../enums/heavenly-stem.enum';

/**
 * 지장간(地藏干) 정보 - 각 지지 안에 숨어있는 천간들
 */
export interface HiddenStems {
  /** 여기 (餘氣) - 이전 계절의 기운, 초기 */
  yeoGi?: HeavenlyStem;
  
  /** 중기 (中氣) - 해당 지지의 중간 기운 */
  jungGi?: HeavenlyStem;
  
  /** 정기 (正氣) - 해당 지지의 본래 기운, 주된 천간 */
  jeongGi: HeavenlyStem;
}

/**
 * 지장간 일수 정보
 */
export interface HiddenStemsDays {
  /** 여기 일수 */
  yeoGiDays?: number;
  
  /** 중기 일수 */
  jungGiDays?: number;
  
  /** 정기 일수 */
  jeongGiDays: number;
}

/**
 * 상세한 지장간 정보 (천간 + 일수)
 */
export interface DetailedHiddenStems {
  /** 여기 정보 */
  yeoGi?: {
    stem: HeavenlyStem;
    days: number;
  };
  
  /** 중기 정보 */
  jungGi?: {
    stem: HeavenlyStem;
    days: number;
  };
  
  /** 정기 정보 */
  jeongGi: {
    stem: HeavenlyStem;
    days: number;
  };
}

/**
 * 지지 유형
 */
export enum BranchType {
  /** 생지 (寅申巳亥) */
  SAENG = 'SAENG',
  /** 왕지 (子午卯酉) */
  WANG = 'WANG',
  /** 고지 (辰戌丑未) */
  GO = 'GO'
}

/**
 * 사주의 지장간 정보
 */
export interface SajuHiddenStems {
  /** 년지의 지장간 */
  year: HiddenStems;
  
  /** 월지의 지장간 */
  month: HiddenStems;
  
  /** 일지의 지장간 */
  day: HiddenStems;
  
  /** 시지의 지장간 */
  hour: HiddenStems;
}
