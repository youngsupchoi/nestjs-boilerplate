import { TwelveLifeStages } from '../enums/twelve-life-stages.enum';

/**
 * 12운성 정보
 */
export interface TwelveLifeStagesInfo {
  /** 년지의 12운성 */
  year: TwelveLifeStages;
  
  /** 월지의 12운성 */
  month: TwelveLifeStages;
  
  /** 일지의 12운성 */
  day: TwelveLifeStages;
  
  /** 시지의 12운성 */
  hour: TwelveLifeStages;
}
