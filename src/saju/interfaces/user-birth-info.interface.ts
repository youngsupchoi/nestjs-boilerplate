import { Gender } from '../enums';

/**
 * 사주 계산을 위한 사용자 생년월일시 정보
 */
export interface UserBirthInfo {
  /** 성별 */
  gender: Gender;
  
  /** 생년월일시 */
  birthDateTime: Date;
  
  /** 양력/음력 구분 (true: 양력, false: 음력) */
  isSolar: boolean;
  
  /** 출생지 (시간대 계산용, 선택사항) */
  birthPlace?: string;
}
