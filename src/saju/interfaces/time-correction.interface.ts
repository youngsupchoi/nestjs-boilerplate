/**
 * 시간 보정 관련 인터페이스
 */
export interface TimeCorrection {
  /** 원본 시간 */
  originalTime: Date;
  
  /** 보정된 시간 */
  correctedTime: Date;
  
  /** 보정 분(minute) */
  correctionMinutes: number;
  
  /** 보정 이유 */
  reason: string;
}

/**
 * 지역 정보
 */
export interface LocationInfo {
  /** 지역명 */
  name: string;
  
  /** 경도 */
  longitude: number;
  
  /** 위도 */
  latitude: number;
  
  /** 표준시와의 차이(분) */
  timeDifferenceMinutes: number;
}
