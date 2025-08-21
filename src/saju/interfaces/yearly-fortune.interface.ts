/**
 * 연운(年運) 응답 인터페이스
 */
export interface YearlyFortune {
  /** 연도 */
  year: number;
  
  /** 년주 간지 (한자) */
  yearPillarChinese: string;
  
  /** 년주 간지 (한글) */
  yearPillarKorean: string;
  
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
 * 연운(年運) 리스트 응답 인터페이스
 */
export interface YearlyFortuneList {
  /** 현재 기준 날짜 */
  baseDate: {
    year: number;
    month: number;
    day: number;
  };
  
  /** 총 연운 개수 */
  totalCount: number;
  
  /** 연운 리스트 */
  yearlyFortunes: YearlyFortune[];
}
