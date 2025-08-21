import { Gender } from '../enums/gender.enum';

/**
 * 대운 계산을 위한 파라미터
 */
export interface DaeunCalculationParams {
  /** 생년 */
  year: number;
  
  /** 생월 */
  month: number;
  
  /** 생일 */
  day: number;
  
  /** 생시 */
  hour: number;
  
  /** 생분 */
  minute?: number;
  
  /** 양력 여부 (true: 양력, false: 음력) */
  isSolar?: boolean;
  
  /** 윤달 여부 (음력인 경우만) */
  isLeapMonth?: boolean;
  
  /** 성별 (대운 순행/역행 결정에 필요) */
  gender: Gender;
}
