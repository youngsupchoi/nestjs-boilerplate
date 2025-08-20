import { EarthlyBranch, EARTHLY_BRANCH_INFO } from '../enums/earthly-branch.enum';
import { FiveElements } from '../enums/five-elements.enum';
import { EarthlyBranchInfo } from '../interfaces/earthly-branch-info.interface';

/**
 * 지지 관련 유틸리티 함수들
 */
export class EarthlyBranchUtils {
  /**
   * 지지의 상세 정보를 가져옵니다.
   */
  static getInfo(branch: EarthlyBranch): EarthlyBranchInfo {
    return EARTHLY_BRANCH_INFO[branch];
  }

  /**
   * 지지의 음양을 확인합니다.
   */
  static isYang(branch: EarthlyBranch): boolean {
    return EARTHLY_BRANCH_INFO[branch].isYang;
  }

  /**
   * 지지의 오행을 가져옵니다.
   */
  static getElement(branch: EarthlyBranch): FiveElements {
    return EARTHLY_BRANCH_INFO[branch].element;
  }

  /**
   * 지지의 기본 설명을 가져옵니다.
   */
  static getDescription(branch: EarthlyBranch): string {
    return EARTHLY_BRANCH_INFO[branch].description;
  }

  /**
   * 지지의 특성들을 가져옵니다.
   */
  static getCharacteristics(branch: EarthlyBranch): string[] {
    return EARTHLY_BRANCH_INFO[branch].characteristics;
  }

  /**
   * 특정 오행의 지지들을 가져옵니다.
   */
  static getBranchesByElement(element: FiveElements): EarthlyBranch[] {
    return Object.values(EarthlyBranch).filter(branch => 
      EARTHLY_BRANCH_INFO[branch].element === element
    );
  }

  /**
   * 양지들을 가져옵니다.
   */
  static getYangBranches(): EarthlyBranch[] {
    return Object.values(EarthlyBranch).filter(branch => 
      EARTHLY_BRANCH_INFO[branch].isYang
    );
  }

  /**
   * 음지들을 가져옵니다.
   */
  static getYinBranches(): EarthlyBranch[] {
    return Object.values(EarthlyBranch).filter(branch => 
      !EARTHLY_BRANCH_INFO[branch].isYang
    );
  }

  /**
   * 지지의 상세 정보를 문자열로 포맷팅합니다.
   */
  static formatBranchInfo(branch: EarthlyBranch): string {
    const info = EARTHLY_BRANCH_INFO[branch];
    const yinYang = info.isYang ? '양지' : '음지';
    
    return [
      `${info.character}(${branch}) - ${yinYang} ${info.element}`,
      `기본성격: ${info.description}`,
      `특성: ${info.characteristics.join(', ')}`
    ].join('\n');
  }

  /**
   * 모든 지지의 정보를 요약해서 보여줍니다.
   */
  static getAllBranchesInfo(): string {
    return Object.values(EarthlyBranch).map(branch => {
      const info = EARTHLY_BRANCH_INFO[branch];
      const yinYang = info.isYang ? '양' : '음';
      return `${branch}(${yinYang}${info.element}): ${info.description}`;
    }).join('\n');
  }
}
