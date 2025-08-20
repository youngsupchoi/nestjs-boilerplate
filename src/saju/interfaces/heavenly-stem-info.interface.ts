import { FiveElements } from '../enums';

/**
 * 천간의 상세 정보
 */
export interface HeavenlyStemInfo {
  /** 천간 한자 */
  character: string;
  
  /** 음양 구분 (true: 양간, false: 음간) */
  isYang: boolean;
  
  /** 오행 */
  element: FiveElements;
  
  /** 기본 설명 */
  description: string;
  
  /** 상세 특성 */
  characteristics: string[];
}
