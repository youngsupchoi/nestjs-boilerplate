import { EarthlyBranch } from '../enums/earthly-branch.enum';
import { HeavenlyStem } from '../enums/heavenly-stem.enum';
import { HiddenStems } from '../interfaces/hidden-stems.interface';

/**
 * 지장간(地藏干) 관련 유틸리티 함수들
 */
export class HiddenStemsUtils {
  /**
   * 각 지지의 지장간 정보
   */
  private static readonly HIDDEN_STEMS_MAP: Record<EarthlyBranch, HiddenStems> = {
    [EarthlyBranch.JA]: {      // 자(子)
      main: HeavenlyStem.IM,   // 임
    },
    [EarthlyBranch.CHUK]: {    // 축(丑)
      main: HeavenlyStem.GI,   // 기
      middle: HeavenlyStem.GYE, // 계
      weak: HeavenlyStem.SIN,  // 신
    },
    [EarthlyBranch.IN]: {      // 인(寅)
      main: HeavenlyStem.GAP,  // 갑
      middle: HeavenlyStem.BYEONG, // 병
      weak: HeavenlyStem.MU,   // 무
    },
    [EarthlyBranch.MYO]: {     // 묘(卯)
      main: HeavenlyStem.EUL,  // 을
    },
    [EarthlyBranch.JIN]: {     // 진(辰)
      main: HeavenlyStem.MU,   // 무
      middle: HeavenlyStem.EUL, // 을
      weak: HeavenlyStem.GYE,  // 계
    },
    [EarthlyBranch.SA]: {      // 사(巳)
      main: HeavenlyStem.BYEONG, // 병
      middle: HeavenlyStem.MU,  // 무
      weak: HeavenlyStem.GYEONG, // 경
    },
    [EarthlyBranch.O]: {       // 오(午)
      main: HeavenlyStem.JEONG, // 정
      middle: HeavenlyStem.GI,  // 기
    },
    [EarthlyBranch.MI]: {      // 미(未)
      main: HeavenlyStem.GI,   // 기
      middle: HeavenlyStem.JEONG, // 정
      weak: HeavenlyStem.EUL,  // 을
    },
    [EarthlyBranch.SHIN]: {    // 신(申)
      main: HeavenlyStem.GYEONG, // 경
      middle: HeavenlyStem.IM,  // 임
      weak: HeavenlyStem.MU,   // 무
    },
    [EarthlyBranch.YU]: {      // 유(酉)
      main: HeavenlyStem.SIN,  // 신
    },
    [EarthlyBranch.SUL]: {     // 술(戌)
      main: HeavenlyStem.MU,   // 무
      middle: HeavenlyStem.SIN, // 신
      weak: HeavenlyStem.JEONG, // 정
    },
    [EarthlyBranch.HAE]: {     // 해(亥)
      main: HeavenlyStem.IM,   // 임
      middle: HeavenlyStem.GAP, // 갑
    },
  };

  /**
   * 지지의 지장간을 가져옵니다.
   */
  static getHiddenStems(branch: EarthlyBranch): HiddenStems {
    return this.HIDDEN_STEMS_MAP[branch];
  }

  /**
   * 지장간을 문자열로 포맷팅합니다.
   */
  static formatHiddenStems(hiddenStems: HiddenStems): string {
    const parts = [hiddenStems.main];
    if (hiddenStems.middle) parts.push(hiddenStems.middle);
    if (hiddenStems.weak) parts.push(hiddenStems.weak);
    
    return parts.join('');
  }

  /**
   * 모든 지장간 정보를 반환합니다.
   */
  static getAllHiddenStems(): Record<EarthlyBranch, HiddenStems> {
    return { ...this.HIDDEN_STEMS_MAP };
  }
}
