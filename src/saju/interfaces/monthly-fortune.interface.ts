/**
 * 월운(月運) 응답 인터페이스
 */
export interface MonthlyFortune {
  /** 연도 */
  year: number;
  
  /** 월 */
  month: number;
  
  /** 월주 간지 (한자) */
  monthPillarChinese: string;
  
  /** 월주 간지 (한글) */
  monthPillarKorean: string;
  
  /** 해당 월의 절기 정보 (있는 경우) */
  solarTerm?: {
    /** 절기명 (한자) */
    termChinese: string;
    /** 절기명 (한글) */
    termKorean: string;
    /** 절기 시간 */
    termTime?: string;
  };
  
  /** 조회된 날짜 정보 */
  dateInfo: {
    /** 조회된 양력 년도 */
    solarYear: number;
    /** 조회된 양력 월 */
    solarMonth: number;
    /** 조회된 양력 일 */
    solarDay: number;
    /** 조회된 음력 년도 */
    lunarYear: number;
    /** 조회된 음력 월 */
    lunarMonth: number;
    /** 조회된 음력 일 */
    lunarDay: number;
  };
}

/**
 * 월운(月運) 리스트 응답 인터페이스
 */
export interface MonthlyFortuneList {
  /** 현재 기준 날짜 */
  baseDate: {
    year: number;
    month: number;
    day: number;
  };
  
  /** 총 월운 개수 */
  totalCount: number;
  
  /** 월운 리스트 */
  monthlyFortunes: MonthlyFortune[];
}
