import { HeavenlyStem } from '../enums/heavenly-stem.enum';
import { EarthlyBranch } from '../enums/earthly-branch.enum';
import { TwelveSpirits } from '../enums/twelve-spirits.enum';

/**
 * 12신살 관련 유틸리티 함수들
 */
export class TwelveSpiritsUtils {
  /**
   * 간단한 12신살 계산 (실제로는 더 복잡한 계산이 필요)
   * 여기서는 사진의 예시에 맞게 기본적인 신살들만 구현
   */
  static calculateSpirit(dayStem: HeavenlyStem, branch: EarthlyBranch, pillarType: 'year' | 'month' | 'day' | 'hour'): TwelveSpirits | null {
    // 간단한 예시 로직 - 실제로는 더 정확한 계산이 필요
    const branchIndex = Object.values(EarthlyBranch).indexOf(branch);
    const stemIndex = Object.values(HeavenlyStem).indexOf(dayStem);
    
    // 사진의 예시를 기반으로 한 간단한 매핑
    if (pillarType === 'year') {
      // 년주에 망신살이 오는 경우
      if (branch === EarthlyBranch.IN) {
        return TwelveSpirits.MANGSINAL; // 망신살
      }
    } else if (pillarType === 'month' || pillarType === 'day') {
      // 월주, 일주에 녹살이 오는 경우
      if (branch === EarthlyBranch.JA) {
        return TwelveSpirits.NOKSIN; // 녹살 (녹신과 유사)
      }
    } else if (pillarType === 'hour') {
      // 시주에 육해살이 오는 경우
      if (branch === EarthlyBranch.MYO) {
        return TwelveSpirits.YUKHASAL; // 육해살
      }
    }
    
    return null; // 특별한 신살이 없는 경우
  }

  /**
   * 12신살의 의미를 가져옵니다.
   */
  static getSpiritMeaning(spirit: TwelveSpirits): string {
    const meanings: Record<TwelveSpirits, string> = {
      [TwelveSpirits.CHEONDEOK]: '하늘의 덕, 큰 복',
      [TwelveSpirits.WOLDEOK]: '달의 덕, 온화함',
      [TwelveSpirits.CHEONEUL]: '귀인의 도움',
      [TwelveSpirits.TAEEUL]: '태을성의 보호',
      [TwelveSpirits.NOKSIN]: '녹봉, 관직운',
      [TwelveSpirits.YANGINEUL]: '강한 기운, 양날의 검',
      [TwelveSpirits.MANGSINAL]: '망신, 체면 손상',
      [TwelveSpirits.GEOPSSAL]: '겁탈, 재물 손실',
      [TwelveSpirits.JAEHWASAL]: '재화, 화재 위험',
      [TwelveSpirits.GUHAESAL]: '구설, 해로움',
      [TwelveSpirits.YUKHASAL]: '육해, 해로운 관계',
      [TwelveSpirits.HYEONGSAL]: '형벌, 법적 문제'
    };
    
    return meanings[spirit];
  }

  /**
   * 신살이 길신인지 흉신인지 판단합니다.
   */
  static isGoodSpirit(spirit: TwelveSpirits): boolean {
    const goodSpirits = [
      TwelveSpirits.CHEONDEOK,
      TwelveSpirits.WOLDEOK,
      TwelveSpirits.CHEONEUL,
      TwelveSpirits.TAEEUL,
      TwelveSpirits.NOKSIN
    ];
    
    return goodSpirits.includes(spirit);
  }
}
