import { HeavenlyStem, EarthlyBranch } from '../enums';

/**
 * 사주의 4개 기둥 (년월일시)
 */
export interface SajuPillars {
  /** 년주 */
  year: {
    heavenlyStem: HeavenlyStem;
    earthlyBranch: EarthlyBranch;
    ganzhi: string;
  };
  
  /** 월주 */
  month: {
    heavenlyStem: HeavenlyStem;
    earthlyBranch: EarthlyBranch;
    ganzhi: string;
  };
  
  /** 일주 */
  day: {
    heavenlyStem: HeavenlyStem;
    earthlyBranch: EarthlyBranch;
    ganzhi: string;
  };
  
  /** 시주 */
  hour: {
    heavenlyStem: HeavenlyStem;
    earthlyBranch: EarthlyBranch;
    ganzhi: string;
  };
}

/**
 * 8개 한자 배열 (천간 4개 + 지지 4개)
 */
export interface EightCharacters {
  /** 천간 4개: [년간, 월간, 일간, 시간] */
  heavenlyStems: [HeavenlyStem, HeavenlyStem, HeavenlyStem, HeavenlyStem];
  
  /** 지지 4개: [년지, 월지, 일지, 시지] */
  earthlyBranches: [EarthlyBranch, EarthlyBranch, EarthlyBranch, EarthlyBranch];
  
  /** 간지 조합 4개: [년주, 월주, 일주, 시주] */
  ganzhiCombinations: [string, string, string, string];
}
