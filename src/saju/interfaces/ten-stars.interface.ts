import { TenStars } from '../enums/ten-stars.enum';

/**
 * 십성 정보 (천간과 지지 모두 포함)
 */
export interface TenStarsInfo {
  /** 천간의 십성 */
  heavenlyStems: {
    year: TenStars;
    month: TenStars;
    day: string; // 일간은 기준이므로 "일간 (경)" 형태
    hour: TenStars;
  };

  /** 지지의 십성 (지장간 본기를 기준으로 계산) */
  earthlyBranches: {
    year: TenStars;
    month: TenStars;
    day: TenStars;
    hour: TenStars;
  };
}
