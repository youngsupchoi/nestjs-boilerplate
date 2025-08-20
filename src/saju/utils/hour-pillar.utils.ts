/**
 * 시주 계산을 위한 유틸리티
 */
export class HourPillarUtils {
  // 십간 배열 (한자)
  private static readonly HEAVENLY_STEMS_CHINESE = [
    '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'
  ];

  // 십간 배열 (한글)
  private static readonly HEAVENLY_STEMS_KOREAN = [
    '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'
  ];

  // 십이지 배열 (한자)
  private static readonly EARTHLY_BRANCHES_CHINESE = [
    '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
  ];

  // 십이지 배열 (한글)
  private static readonly EARTHLY_BRANCHES_KOREAN = [
    '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'
  ];

  // 시간대별 지지 매핑 (자시: 23:00-01:00, 축시: 01:00-03:00, ...)
  private static readonly HOUR_TO_BRANCH_MAP = [
    { start: 23, end: 1, branch: 0 },   // 자시
    { start: 1, end: 3, branch: 1 },    // 축시
    { start: 3, end: 5, branch: 2 },    // 인시
    { start: 5, end: 7, branch: 3 },    // 묘시
    { start: 7, end: 9, branch: 4 },    // 진시
    { start: 9, end: 11, branch: 5 },   // 사시
    { start: 11, end: 13, branch: 6 },  // 오시
    { start: 13, end: 15, branch: 7 },  // 미시
    { start: 15, end: 17, branch: 8 },  // 신시
    { start: 17, end: 19, branch: 9 },  // 유시
    { start: 19, end: 21, branch: 10 }, // 술시
    { start: 21, end: 23, branch: 11 }, // 해시
  ];

  /**
   * 시간을 기준으로 지지 인덱스를 구합니다
   * @param hour 시간 (0-23)
   * @param minute 분 (0-59)
   * @returns 지지 인덱스 (0-11)
   */
  static getEarthlyBranchIndex(hour: number, minute: number = 0): number {
    // 정각 처리: 1시 정각은 축시, 3시 정각은 인시가 됨
    const adjustedHour = minute === 0 && hour % 2 === 1 ? hour : hour;

    if (hour >= 23 || hour < 1) {
      return 0; // 자시
    } else if (hour >= 1 && hour < 3) {
      return 1; // 축시
    } else if (hour >= 3 && hour < 5) {
      return 2; // 인시
    } else if (hour >= 5 && hour < 7) {
      return 3; // 묘시
    } else if (hour >= 7 && hour < 9) {
      return 4; // 진시
    } else if (hour >= 9 && hour < 11) {
      return 5; // 사시
    } else if (hour >= 11 && hour < 13) {
      return 6; // 오시
    } else if (hour >= 13 && hour < 15) {
      return 7; // 미시
    } else if (hour >= 15 && hour < 17) {
      return 8; // 신시
    } else if (hour >= 17 && hour < 19) {
      return 9; // 유시
    } else if (hour >= 19 && hour < 21) {
      return 10; // 술시
    } else {
      return 11; // 해시
    }
  }

  /**
   * 일간과 시간을 기준으로 시간의 천간을 계산합니다
   * 시간의 천간은 일간에 따라 결정됩니다 (오자시법)
   * @param dayHeavenlyStem 일간 (한자)
   * @param hourBranchIndex 시지 인덱스 (0-11)
   * @returns 시간의 천간 인덱스 (0-9)
   */
  static getHourHeavenlyStemIndex(dayHeavenlyStem: string, hourBranchIndex: number): number {
    // 일간별 시간 천간 시작점
    const dayToHourStemStart: { [key: string]: number } = {
      '甲': 0, '己': 0, // 갑기일 -> 갑자시부터 시작
      '乙': 2, '庚': 2, // 을경일 -> 병자시부터 시작  
      '丙': 4, '辛': 4, // 병신일 -> 무자시부터 시작
      '丁': 6, '壬': 6, // 정임일 -> 경자시부터 시작
      '戊': 8, '癸': 8, // 무계일 -> 임자시부터 시작
    };

    const startStemIndex = dayToHourStemStart[dayHeavenlyStem];
    return (startStemIndex + hourBranchIndex) % 10;
  }

  /**
   * 시주 정보를 계산합니다
   * @param dayHeavenlyStem 일간 (한자)
   * @param hour 시간 (0-23)
   * @param minute 분 (0-59)
   * @returns 시주 정보
   */
  static calculateHourPillar(
    dayHeavenlyStem: string, 
    hour: number, 
    minute: number = 0
  ): {
    heavenlyStem: string;
    heavenlyStemKorean: string;
    earthlyBranch: string;
    earthlyBranchKorean: string;
    ganzhi: string;
    ganzhiKorean: string;
  } {
    const branchIndex = this.getEarthlyBranchIndex(hour, minute);
    const stemIndex = this.getHourHeavenlyStemIndex(dayHeavenlyStem, branchIndex);

    const heavenlyStem = this.HEAVENLY_STEMS_CHINESE[stemIndex];
    const heavenlyStemKorean = this.HEAVENLY_STEMS_KOREAN[stemIndex];
    const earthlyBranch = this.EARTHLY_BRANCHES_CHINESE[branchIndex];
    const earthlyBranchKorean = this.EARTHLY_BRANCHES_KOREAN[branchIndex];

    return {
      heavenlyStem,
      heavenlyStemKorean,
      earthlyBranch,
      earthlyBranchKorean,
      ganzhi: heavenlyStem + earthlyBranch,
      ganzhiKorean: heavenlyStemKorean + earthlyBranchKorean,
    };
  }

  /**
   * 시간대 이름을 반환합니다
   * @param hour 시간 (0-23)
   * @param minute 분 (0-59)
   * @returns 시간대 이름 (한글)
   */
  static getHourPeriodName(hour: number, minute: number = 0): string {
    const branchIndex = this.getEarthlyBranchIndex(hour, minute);
    const periodNames = [
      '자시', '축시', '인시', '묘시', '진시', '사시',
      '오시', '미시', '신시', '유시', '술시', '해시'
    ];
    return periodNames[branchIndex];
  }
}
