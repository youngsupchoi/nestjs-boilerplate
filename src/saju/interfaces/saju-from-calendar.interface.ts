/**
 * 만세력 데이터를 기반으로 한 사주 정보 인터페이스
 */
export interface SajuFromCalendar {
  /** 입력된 생년월일시 정보 */
  birthInfo: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    isSolar: boolean; // true: 양력, false: 음력
  };

  /** 연주 정보 */
  yearPillar: {
    heavenlyStem: string; // 천간 (한자)
    earthlyBranch: string; // 지지 (한자)
    ganzhi: string; // 간지 조합 (한자)
    ganzhiKorean: string; // 간지 조합 (한글)
  };

  /** 월주 정보 */
  monthPillar: {
    heavenlyStem: string; // 천간 (한자)
    earthlyBranch: string; // 지지 (한자)
    ganzhi: string; // 간지 조합 (한자)
    ganzhiKorean: string; // 간지 조합 (한글)
  };

  /** 일주 정보 */
  dayPillar: {
    heavenlyStem: string; // 천간 (한자)
    earthlyBranch: string; // 지지 (한자)
    ganzhi: string; // 간지 조합 (한자)
    ganzhiKorean: string; // 간지 조합 (한글)
  };

  /** 시주 정보 */
  hourPillar: {
    heavenlyStem: string; // 천간 (한자)
    earthlyBranch: string; // 지지 (한자)
    ganzhi: string; // 간지 조합 (한자)
    ganzhiKorean: string; // 간지 조합 (한글)
  };

  /** 추가 정보 */
  additionalInfo: {
    solarYear: number; // 양력 년도
    solarMonth: number; // 양력 월
    solarDay: number; // 양력 일
    lunarYear: number; // 음력 년도
    lunarMonth: number; // 음력 월
    lunarDay: number; // 음력 일
    isLeapMonth: boolean; // 윤달 여부
    weekElement: string; // 일진 오행 (한자)
    weekElementKorean: string; // 일진 오행 (한글)
    constellation: string; // 28수 별자리
    zodiacAnimal: string; // 띠 동물
  };
}

/**
 * 사주 추출 요청 파라미터
 */
export interface SajuExtractionParams {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  isSolar: boolean; // true: 양력, false: 음력
  isLeapMonth?: boolean; // 음력인 경우 윤달 여부
}
