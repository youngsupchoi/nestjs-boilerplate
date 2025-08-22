import { EarthlyBranch } from '../enums/earthly-branch.enum';
import { HeavenlyStem } from '../enums/heavenly-stem.enum';
import { HiddenStems, DetailedHiddenStems, BranchType, HiddenStemsDays } from '../interfaces/hidden-stems.interface';

/**
 * 지장간(地藏干) 관련 유틸리티 함수들
 */
export class HiddenStemsUtils {
  /**
   * 올바른 지장간 매핑 데이터
   * 여기(餘氣): 이전 계절의 기운, 초기
   * 중기(中氣): 해당 지지의 중간 기운
   * 정기(正氣): 해당 지지의 본래 기운
   */
  private static readonly HIDDEN_STEMS_MAP: Record<EarthlyBranch, HiddenStems> = {
    [EarthlyBranch.JA]: {      // 자(子)
      yeoGi: HeavenlyStem.IM,   // 여기: 임
      jeongGi: HeavenlyStem.GYE, // 정기: 계
    },
    [EarthlyBranch.CHUK]: {    // 축(丑)
      yeoGi: HeavenlyStem.GYE,  // 여기: 계
      jungGi: HeavenlyStem.SIN, // 중기: 신
      jeongGi: HeavenlyStem.GI, // 정기: 기
    },
    [EarthlyBranch.IN]: {      // 인(寅)
      yeoGi: HeavenlyStem.MU,   // 여기: 무
      jungGi: HeavenlyStem.BYEONG, // 중기: 병
      jeongGi: HeavenlyStem.GAP, // 정기: 갑
    },
    [EarthlyBranch.MYO]: {     // 묘(卯)
      yeoGi: HeavenlyStem.GAP,  // 여기: 갑
      jeongGi: HeavenlyStem.EUL, // 정기: 을
    },
    [EarthlyBranch.JIN]: {     // 진(辰)
      yeoGi: HeavenlyStem.EUL,  // 여기: 을
      jungGi: HeavenlyStem.GYE, // 중기: 계
      jeongGi: HeavenlyStem.MU, // 정기: 무
    },
    [EarthlyBranch.SA]: {      // 사(巳)
      yeoGi: HeavenlyStem.MU,   // 여기: 무
      jungGi: HeavenlyStem.GYEONG, // 중기: 경
      jeongGi: HeavenlyStem.BYEONG, // 정기: 병
    },
    [EarthlyBranch.O]: {       // 오(午)
      yeoGi: HeavenlyStem.BYEONG, // 여기: 병
      jungGi: HeavenlyStem.GI,  // 중기: 기
      jeongGi: HeavenlyStem.JEONG, // 정기: 정
    },
    [EarthlyBranch.MI]: {      // 미(未)
      yeoGi: HeavenlyStem.JEONG, // 여기: 정
      jungGi: HeavenlyStem.EUL, // 중기: 을
      jeongGi: HeavenlyStem.GI, // 정기: 기
    },
    [EarthlyBranch.SHIN]: {    // 신(申)
      yeoGi: HeavenlyStem.MU,   // 여기: 무
      jungGi: HeavenlyStem.IM,  // 중기: 임
      jeongGi: HeavenlyStem.GYEONG, // 정기: 경
    },
    [EarthlyBranch.YU]: {      // 유(酉)
      yeoGi: HeavenlyStem.GYEONG, // 여기: 경
      jeongGi: HeavenlyStem.SIN, // 정기: 신
    },
    [EarthlyBranch.SUL]: {     // 술(戌)
      yeoGi: HeavenlyStem.SIN,  // 여기: 신
      jungGi: HeavenlyStem.JEONG, // 중기: 정
      jeongGi: HeavenlyStem.MU, // 정기: 무
    },
    [EarthlyBranch.HAE]: {     // 해(亥)
      yeoGi: HeavenlyStem.MU,   // 여기: 무
      jungGi: HeavenlyStem.GAP, // 중기: 갑
      jeongGi: HeavenlyStem.IM, // 정기: 임
    },
  };

  /**
   * 지지 유형별 일수 매핑
   */
  private static readonly BRANCH_DAYS_MAP: Record<BranchType, HiddenStemsDays> = {
    [BranchType.SAENG]: {  // 생지 (寅申巳亥)
      yeoGiDays: 7,
      jungGiDays: 7,
      jeongGiDays: 16,
    },
    [BranchType.WANG]: {   // 왕지 (子午卯酉)
      yeoGiDays: 10,
      jeongGiDays: 20,
    },
    [BranchType.GO]: {     // 고지 (辰戌丑未)
      yeoGiDays: 9,
      jungGiDays: 3,
      jeongGiDays: 18,
    },
  };

  /**
   * 지지 유형 매핑
   */
  private static readonly BRANCH_TYPE_MAP: Record<EarthlyBranch, BranchType> = {
    [EarthlyBranch.IN]: BranchType.SAENG,   // 인(寅)
    [EarthlyBranch.SHIN]: BranchType.SAENG, // 신(申)
    [EarthlyBranch.SA]: BranchType.SAENG,   // 사(巳)
    [EarthlyBranch.HAE]: BranchType.SAENG,  // 해(亥)
    [EarthlyBranch.JA]: BranchType.WANG,    // 자(子)
    [EarthlyBranch.O]: BranchType.WANG,     // 오(午)
    [EarthlyBranch.MYO]: BranchType.WANG,   // 묘(卯)
    [EarthlyBranch.YU]: BranchType.WANG,    // 유(酉)
    [EarthlyBranch.JIN]: BranchType.GO,     // 진(辰)
    [EarthlyBranch.SUL]: BranchType.GO,     // 술(戌)
    [EarthlyBranch.CHUK]: BranchType.GO,    // 축(丑)
    [EarthlyBranch.MI]: BranchType.GO,      // 미(未)
  };

  /**
   * 지지의 지장간을 가져옵니다.
   */
  static getHiddenStems(branch: EarthlyBranch): HiddenStems {
    return this.HIDDEN_STEMS_MAP[branch];
  }

  /**
   * 지지의 유형을 가져옵니다.
   */
  static getBranchType(branch: EarthlyBranch): BranchType {
    return this.BRANCH_TYPE_MAP[branch];
  }

  /**
   * 지지의 상세한 지장간 정보 (천간 + 일수)를 가져옵니다.
   */
  static getDetailedHiddenStems(branch: EarthlyBranch): DetailedHiddenStems {
    const hiddenStems = this.HIDDEN_STEMS_MAP[branch];
    const branchType = this.BRANCH_TYPE_MAP[branch];
    const days = this.BRANCH_DAYS_MAP[branchType];
    
    const result: DetailedHiddenStems = {
      jeongGi: {
        stem: hiddenStems.jeongGi,
        days: days.jeongGiDays,
      },
    };
    
    if (hiddenStems.yeoGi && days.yeoGiDays) {
      result.yeoGi = {
        stem: hiddenStems.yeoGi,
        days: days.yeoGiDays,
      };
    }
    
    if (hiddenStems.jungGi && days.jungGiDays) {
      result.jungGi = {
        stem: hiddenStems.jungGi,
        days: days.jungGiDays,
      };
    }
    
    return result;
  }

  /**
   * 지장간을 문자열로 포맷팅합니다.
   * 여기 → 중기 → 정기 순서로 표시
   */
  static formatHiddenStems(hiddenStems: HiddenStems): string {
    const parts = [];
    if (hiddenStems.yeoGi) parts.push(hiddenStems.yeoGi);
    if (hiddenStems.jungGi) parts.push(hiddenStems.jungGi);
    parts.push(hiddenStems.jeongGi);
    
    return parts.join('');
  }

  /**
   * 상세한 지장간 정보를 문자열로 포맷팅합니다.
   */
  static formatDetailedHiddenStems(detailed: DetailedHiddenStems): string {
    const parts = [];
    
    if (detailed.yeoGi) {
      parts.push(`여기: ${detailed.yeoGi.stem}(${detailed.yeoGi.days}일)`);
    }
    
    if (detailed.jungGi) {
      parts.push(`중기: ${detailed.jungGi.stem}(${detailed.jungGi.days}일)`);
    }
    
    parts.push(`정기: ${detailed.jeongGi.stem}(${detailed.jeongGi.days}일)`);
    
    return parts.join(', ');
  }

  /**
   * 모든 지장간 정보를 반환합니다.
   */
  static getAllHiddenStems(): Record<EarthlyBranch, HiddenStems> {
    return { ...this.HIDDEN_STEMS_MAP };
  }

  /**
   * 모든 지지 유형 정보를 반환합니다.
   */
  static getAllBranchTypes(): Record<EarthlyBranch, BranchType> {
    return { ...this.BRANCH_TYPE_MAP };
  }
}
