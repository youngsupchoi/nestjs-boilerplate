import { HeavenlyStem, EarthlyBranch } from '../enums';

/**
 * 세운(년운) 정보
 */
export interface SaeunInfo {
  /** 해당 년도 */
  year: number;
  
  /** 나이 */
  age: number;
  
  /** 세운 천간 */
  heavenlyStem: HeavenlyStem;
  
  /** 세운 지지 */
  earthlyBranch: EarthlyBranch;
  
  /** 세운 간지 */
  ganzhi: string;
}

/**
 * 세운 목록
 */
export interface SaeunList {
  /** 시작 년도 */
  startYear: number;
  
  /** 종료 년도 */
  endYear: number;
  
  /** 세운 목록 */
  saeunPeriods: SaeunInfo[];
}

/**
 * 특정 년도의 세운
 */
export interface CurrentSaeun {
  /** 현재 년도 */
  currentYear: number;
  
  /** 현재 나이 */
  currentAge: number;
  
  /** 현재 세운 정보 */
  saeun: SaeunInfo;
}
