import { HeavenlyStem, EarthlyBranch } from '../enums';

/**
 * 대운 정보
 */
export interface DaeunInfo {
  /** 대운 시작 나이 */
  startAge: number;
  
  /** 대운 종료 나이 */
  endAge: number;
  
  /** 대운 천간 */
  heavenlyStem: HeavenlyStem;
  
  /** 대운 지지 */
  earthlyBranch: EarthlyBranch;
  
  /** 대운 간지 */
  ganzhi: string;
  
  /** 대운 시작 년도 */
  startYear: number;
  
  /** 대운 종료 년도 */
  endYear: number;
}

/**
 * 전체 대운 목록
 */
export interface DaeunList {
  /** 대운 시작 나이 (보통 3~8세) */
  daeunStartAge: number;
  
  /** 순행/역행 여부 (true: 순행, false: 역행) */
  isForward: boolean;
  
  /** 대운 목록 (10년 단위) */
  daeunPeriods: DaeunInfo[];
}

/**
 * 특정 나이의 대운
 */
export interface CurrentDaeun {
  /** 현재 나이 */
  currentAge: number;
  
  /** 현재 대운 정보 */
  daeun: DaeunInfo;
  
  /** 대운 내에서의 경과 년수 */
  yearsInDaeun: number;
}
