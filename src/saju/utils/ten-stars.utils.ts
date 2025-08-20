import { HeavenlyStem, HEAVENLY_STEM_INFO } from '../enums/heavenly-stem.enum';
import { TenStars } from '../enums/ten-stars.enum';
import { FiveElements } from '../enums/five-elements.enum';

/**
 * 십성 관련 유틸리티 함수들
 */
export class TenStarsUtils {
  /**
   * 일간을 기준으로 다른 천간의 십성을 계산합니다.
   * @param dayStem 일간 (기준)
   * @param targetStem 대상 천간
   * @returns 십성
   */
  static calculateTenStar(dayStem: HeavenlyStem, targetStem: HeavenlyStem): TenStars {
    const dayInfo = HEAVENLY_STEM_INFO[dayStem];
    const targetInfo = HEAVENLY_STEM_INFO[targetStem];
    
    const dayElement = dayInfo.element;
    const targetElement = targetInfo.element;
    const dayYang = dayInfo.isYang;
    const targetYang = targetInfo.isYang;
    
    // 같은 오행인 경우 - 비견류
    if (dayElement === targetElement) {
      if (dayYang === targetYang) {
        return TenStars.BIGYEON; // 비견
      } else {
        return TenStars.GEOP; // 겁재
      }
    }
    
    // 내가 생하는 오행인 경우 - 식상류
    if (this.isGenerating(dayElement, targetElement)) {
      if (dayYang === targetYang) {
        return TenStars.SIGSIN; // 식신
      } else {
        return TenStars.SANGKWAN; // 상관
      }
    }
    
    // 내가 극하는 오행인 경우 - 재성류
    if (this.isDestroying(dayElement, targetElement)) {
      if (dayYang === targetYang) {
        return TenStars.PYEONJAE; // 편재
      } else {
        return TenStars.JEONGJAE; // 정재
      }
    }
    
    // 나를 극하는 오행인 경우 - 관성류
    if (this.isDestroying(targetElement, dayElement)) {
      if (dayYang === targetYang) {
        return TenStars.PYEONGWAN; // 편관(칠살)
      } else {
        return TenStars.JEONGGWAN; // 정관
      }
    }
    
    // 나를 생하는 오행인 경우 - 인성류
    if (this.isGenerating(targetElement, dayElement)) {
      if (dayYang === targetYang) {
        return TenStars.PYEONIN; // 편인
      } else {
        return TenStars.JEONGIN; // 정인
      }
    }
    
    // 이론적으로 여기에 도달하면 안됨
    throw new Error(`십성 계산 오류: ${dayStem} - ${targetStem}`);
  }
  
  /**
   * 오행 상생 관계 확인 (A가 B를 생하는가?)
   * 목생화, 화생토, 토생금, 금생수, 수생목
   */
  private static isGenerating(fromElement: FiveElements, toElement: FiveElements): boolean {
    const generationMap: Record<FiveElements, FiveElements> = {
      [FiveElements.WOOD]: FiveElements.FIRE,   // 목생화
      [FiveElements.FIRE]: FiveElements.EARTH,  // 화생토
      [FiveElements.EARTH]: FiveElements.METAL, // 토생금
      [FiveElements.METAL]: FiveElements.WATER, // 금생수
      [FiveElements.WATER]: FiveElements.WOOD,  // 수생목
    };
    
    return generationMap[fromElement] === toElement;
  }
  
  /**
   * 오행 상극 관계 확인 (A가 B를 극하는가?)
   * 목극토, 토극수, 수극화, 화극금, 금극목
   */
  private static isDestroying(fromElement: FiveElements, toElement: FiveElements): boolean {
    const destructionMap: Record<FiveElements, FiveElements> = {
      [FiveElements.WOOD]: FiveElements.EARTH,  // 목극토
      [FiveElements.EARTH]: FiveElements.WATER, // 토극수
      [FiveElements.WATER]: FiveElements.FIRE,  // 수극화
      [FiveElements.FIRE]: FiveElements.METAL,  // 화극금
      [FiveElements.METAL]: FiveElements.WOOD,  // 금극목
    };
    
    return destructionMap[fromElement] === toElement;
  }
  
  /**
   * 지지의 본기(지장간 주기)를 가져와서 십성을 계산합니다.
   * @param dayStem 일간 (기준)
   * @param earthlyBranch 지지
   * @returns 지지의 십성
   */
  static calculateBranchTenStar(dayStem: HeavenlyStem, earthlyBranch: any): TenStars {
    // EarthlyBranch enum 값을 한자로 매핑
    const branchToChineseMap: Record<string, string> = {
      '자': '子',  // JA
      '축': '丑',  // CHUK
      '인': '寅',  // IN
      '묘': '卯',  // MYO
      '진': '辰',  // JIN
      '사': '巳',  // SA
      '오': '午',  // O
      '미': '未',  // MI
      '신': '申',  // SHIN
      '유': '酉',  // YU
      '술': '戌',  // SUL
      '해': '亥',  // HAE
    };

    // 지장간 본기 매핑 (한자 기준)
    const branchMainStems: Record<string, HeavenlyStem> = {
      '子': HeavenlyStem.GYE,      // 자(子) → 계(癸)
      '丑': HeavenlyStem.GI,       // 축(丑) → 기(己)
      '寅': HeavenlyStem.GAP,      // 인(寅) → 갑(甲)
      '卯': HeavenlyStem.EUL,      // 묘(卯) → 을(乙)
      '辰': HeavenlyStem.MU,       // 진(辰) → 무(戊)
      '巳': HeavenlyStem.BYEONG,   // 사(巳) → 병(丙)
      '午': HeavenlyStem.JEONG,    // 오(午) → 정(丁)
      '未': HeavenlyStem.GI,       // 미(未) → 기(己)
      '申': HeavenlyStem.GYEONG,   // 신(申) → 경(庚)
      '酉': HeavenlyStem.SIN,      // 유(酉) → 신(辛)
      '戌': HeavenlyStem.MU,       // 술(戌) → 무(戊)
      '亥': HeavenlyStem.IM,       // 해(亥) → 임(壬)
    };

    // 지지 문자열을 한자로 변환
    const branchStr = earthlyBranch.toString();
    const chineseBranch = branchToChineseMap[branchStr];
    
    if (!chineseBranch) {
      throw new Error(`지지를 한자로 변환할 수 없습니다: ${branchStr}`);
    }
    
    const mainStem = branchMainStems[chineseBranch];
    
    if (!mainStem) {
      throw new Error(`지지의 본기를 찾을 수 없습니다: ${branchStr} (${chineseBranch})`);
    }

    return this.calculateTenStar(dayStem, mainStem);
  }

  /**
   * 십성의 의미를 가져옵니다.
   */
  static getTenStarMeaning(tenStar: TenStars): string {
    const meanings: Record<TenStars, string> = {
      [TenStars.BIGYEON]: '형제, 친구, 동료, 경쟁자',
      [TenStars.GEOP]: '형제자매, 동업자, 라이벌',
      [TenStars.SIGSIN]: '말, 표현, 재능, 자식',
      [TenStars.SANGKWAN]: '기술, 예술, 반항, 자유',
      [TenStars.PYEONJAE]: '유동재산, 사업, 투자',
      [TenStars.JEONGJAE]: '고정재산, 아내, 안정',
      [TenStars.PYEONGWAN]: '압박, 도전, 권위, 남편',
      [TenStars.JEONGGWAN]: '명예, 지위, 직업, 남편',
      [TenStars.PYEONIN]: '편모, 계모, 종교, 학문',
      [TenStars.JEONGIN]: '어머니, 학업, 명예, 후원'
    };
    
    return meanings[tenStar];
  }
}
