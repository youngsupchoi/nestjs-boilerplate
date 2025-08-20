import { TwelveSpirits } from '../enums/twelve-spirits.enum';

/**
 * 12신살 정보
 */
export interface TwelveSpiritsInfo {
  /** 년주의 12신살 */
  year: TwelveSpirits | null;
  
  /** 월주의 12신살 */
  month: TwelveSpirits | null;
  
  /** 일주의 12신살 */
  day: TwelveSpirits | null;
  
  /** 시주의 12신살 */
  hour: TwelveSpirits | null;
}
