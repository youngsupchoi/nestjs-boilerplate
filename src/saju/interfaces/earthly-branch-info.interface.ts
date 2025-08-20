import { FiveElements } from '../enums';

/**
 * 지지의 상세 정보
 */
export interface EarthlyBranchInfo {
  /** 지지 한자 */
  character: string;
  
  /** 음양 구분 (true: 양지, false: 음지) */
  isYang: boolean;
  
  /** 오행 */
  element: FiveElements;
  
  /** 기본 설명 */
  description: string;
  
  /** 상세 특성 */
  characteristics: string[];
}
