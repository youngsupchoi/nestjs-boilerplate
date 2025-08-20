import { HeavenlyStem } from '../enums/heavenly-stem.enum';

/**
 * 지장간(地藏干) 정보 - 각 지지 안에 숨어있는 천간들
 */
export interface HiddenStems {
  /** 본기 (주된 천간) */
  main: HeavenlyStem;
  
  /** 중기 (보조 천간) */
  middle?: HeavenlyStem;
  
  /** 여기 (약한 천간) */
  weak?: HeavenlyStem;
}

/**
 * 사주의 지장간 정보
 */
export interface SajuHiddenStems {
  /** 년지의 지장간 */
  year: HiddenStems;
  
  /** 월지의 지장간 */
  month: HiddenStems;
  
  /** 일지의 지장간 */
  day: HiddenStems;
  
  /** 시지의 지장간 */
  hour: HiddenStems;
}
