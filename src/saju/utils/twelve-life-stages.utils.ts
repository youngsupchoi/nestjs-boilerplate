import { HeavenlyStem } from '../enums/heavenly-stem.enum';
import { EarthlyBranch } from '../enums/earthly-branch.enum';
import { TwelveLifeStages } from '../enums/twelve-life-stages.enum';

/**
 * 12운성 관련 유틸리티 함수들
 */
export class TwelveLifeStagesUtils {
  /**
   * 각 천간별 12운성 순서 (양간은 순행, 음간은 역행)
   */
  private static readonly LIFE_STAGES_MAP: Record<HeavenlyStem, Record<EarthlyBranch, TwelveLifeStages>> = {
    [HeavenlyStem.GAP]: { // 갑목 (양간)
      [EarthlyBranch.HAE]: TwelveLifeStages.JANG,   // 해 - 장생
      [EarthlyBranch.JA]: TwelveLifeStages.MOK,     // 자 - 목욕
      [EarthlyBranch.CHUK]: TwelveLifeStages.GWAN,  // 축 - 관대
      [EarthlyBranch.IN]: TwelveLifeStages.IM,      // 인 - 임관
      [EarthlyBranch.MYO]: TwelveLifeStages.JE,     // 묘 - 제왕
      [EarthlyBranch.JIN]: TwelveLifeStages.SUE,    // 진 - 쇠
      [EarthlyBranch.SA]: TwelveLifeStages.BYEONG,  // 사 - 병
      [EarthlyBranch.O]: TwelveLifeStages.SA,       // 오 - 사
      [EarthlyBranch.MI]: TwelveLifeStages.MYO,     // 미 - 묘
      [EarthlyBranch.SHIN]: TwelveLifeStages.JEOL,  // 신 - 절
      [EarthlyBranch.YU]: TwelveLifeStages.TAE,     // 유 - 태
      [EarthlyBranch.SUL]: TwelveLifeStages.YANG,   // 술 - 양
    },
    [HeavenlyStem.EUL]: { // 을목 (음간)
      [EarthlyBranch.O]: TwelveLifeStages.JANG,     // 오 - 장생
      [EarthlyBranch.SA]: TwelveLifeStages.MOK,     // 사 - 목욕
      [EarthlyBranch.JIN]: TwelveLifeStages.GWAN,   // 진 - 관대
      [EarthlyBranch.MYO]: TwelveLifeStages.IM,     // 묘 - 임관
      [EarthlyBranch.IN]: TwelveLifeStages.JE,      // 인 - 제왕
      [EarthlyBranch.CHUK]: TwelveLifeStages.SUE,   // 축 - 쇠
      [EarthlyBranch.JA]: TwelveLifeStages.BYEONG,  // 자 - 병
      [EarthlyBranch.HAE]: TwelveLifeStages.SA,     // 해 - 사
      [EarthlyBranch.SUL]: TwelveLifeStages.MYO,    // 술 - 묘
      [EarthlyBranch.YU]: TwelveLifeStages.JEOL,    // 유 - 절
      [EarthlyBranch.SHIN]: TwelveLifeStages.TAE,   // 신 - 태
      [EarthlyBranch.MI]: TwelveLifeStages.YANG,    // 미 - 양
    },
    [HeavenlyStem.BYEONG]: { // 병화 (양간)
      [EarthlyBranch.IN]: TwelveLifeStages.JANG,    // 인 - 장생
      [EarthlyBranch.MYO]: TwelveLifeStages.MOK,    // 묘 - 목욕
      [EarthlyBranch.JIN]: TwelveLifeStages.GWAN,   // 진 - 관대
      [EarthlyBranch.SA]: TwelveLifeStages.IM,      // 사 - 임관
      [EarthlyBranch.O]: TwelveLifeStages.JE,       // 오 - 제왕
      [EarthlyBranch.MI]: TwelveLifeStages.SUE,     // 미 - 쇠
      [EarthlyBranch.SHIN]: TwelveLifeStages.BYEONG, // 신 - 병
      [EarthlyBranch.YU]: TwelveLifeStages.SA,      // 유 - 사
      [EarthlyBranch.SUL]: TwelveLifeStages.MYO,    // 술 - 묘
      [EarthlyBranch.HAE]: TwelveLifeStages.JEOL,   // 해 - 절
      [EarthlyBranch.JA]: TwelveLifeStages.TAE,     // 자 - 태
      [EarthlyBranch.CHUK]: TwelveLifeStages.YANG,  // 축 - 양
    },
    [HeavenlyStem.JEONG]: { // 정화 (음간)
      [EarthlyBranch.YU]: TwelveLifeStages.JANG,    // 유 - 장생
      [EarthlyBranch.SHIN]: TwelveLifeStages.MOK,   // 신 - 목욕
      [EarthlyBranch.MI]: TwelveLifeStages.GWAN,    // 미 - 관대
      [EarthlyBranch.O]: TwelveLifeStages.IM,       // 오 - 임관
      [EarthlyBranch.SA]: TwelveLifeStages.JE,      // 사 - 제왕
      [EarthlyBranch.JIN]: TwelveLifeStages.SUE,    // 진 - 쇠
      [EarthlyBranch.MYO]: TwelveLifeStages.BYEONG, // 묘 - 병
      [EarthlyBranch.IN]: TwelveLifeStages.SA,      // 인 - 사
      [EarthlyBranch.CHUK]: TwelveLifeStages.MYO,   // 축 - 묘
      [EarthlyBranch.JA]: TwelveLifeStages.JEOL,    // 자 - 절
      [EarthlyBranch.HAE]: TwelveLifeStages.TAE,    // 해 - 태
      [EarthlyBranch.SUL]: TwelveLifeStages.YANG,   // 술 - 양
    },
    [HeavenlyStem.MU]: { // 무토 (양간)
      [EarthlyBranch.IN]: TwelveLifeStages.JANG,    // 인 - 장생
      [EarthlyBranch.MYO]: TwelveLifeStages.MOK,    // 묘 - 목욕
      [EarthlyBranch.JIN]: TwelveLifeStages.GWAN,   // 진 - 관대
      [EarthlyBranch.SA]: TwelveLifeStages.IM,      // 사 - 임관
      [EarthlyBranch.O]: TwelveLifeStages.JE,       // 오 - 제왕
      [EarthlyBranch.MI]: TwelveLifeStages.SUE,     // 미 - 쇠
      [EarthlyBranch.SHIN]: TwelveLifeStages.BYEONG, // 신 - 병
      [EarthlyBranch.YU]: TwelveLifeStages.SA,      // 유 - 사
      [EarthlyBranch.SUL]: TwelveLifeStages.MYO,    // 술 - 묘
      [EarthlyBranch.HAE]: TwelveLifeStages.JEOL,   // 해 - 절
      [EarthlyBranch.JA]: TwelveLifeStages.TAE,     // 자 - 태
      [EarthlyBranch.CHUK]: TwelveLifeStages.YANG,  // 축 - 양
    },
    [HeavenlyStem.GI]: { // 기토 (음간)
      [EarthlyBranch.YU]: TwelveLifeStages.JANG,    // 유 - 장생
      [EarthlyBranch.SHIN]: TwelveLifeStages.MOK,   // 신 - 목욕
      [EarthlyBranch.MI]: TwelveLifeStages.GWAN,    // 미 - 관대
      [EarthlyBranch.O]: TwelveLifeStages.IM,       // 오 - 임관
      [EarthlyBranch.SA]: TwelveLifeStages.JE,      // 사 - 제왕
      [EarthlyBranch.JIN]: TwelveLifeStages.SUE,    // 진 - 쇠
      [EarthlyBranch.MYO]: TwelveLifeStages.BYEONG, // 묘 - 병
      [EarthlyBranch.IN]: TwelveLifeStages.SA,      // 인 - 사
      [EarthlyBranch.CHUK]: TwelveLifeStages.MYO,   // 축 - 묘
      [EarthlyBranch.JA]: TwelveLifeStages.JEOL,    // 자 - 절
      [EarthlyBranch.HAE]: TwelveLifeStages.TAE,    // 해 - 태
      [EarthlyBranch.SUL]: TwelveLifeStages.YANG,   // 술 - 양
    },
    [HeavenlyStem.GYEONG]: { // 경금 (양간)
      [EarthlyBranch.SA]: TwelveLifeStages.JANG,    // 사 - 장생
      [EarthlyBranch.O]: TwelveLifeStages.MOK,      // 오 - 목욕
      [EarthlyBranch.MI]: TwelveLifeStages.GWAN,    // 미 - 관대
      [EarthlyBranch.SHIN]: TwelveLifeStages.IM,    // 신 - 임관
      [EarthlyBranch.YU]: TwelveLifeStages.JE,      // 유 - 제왕
      [EarthlyBranch.SUL]: TwelveLifeStages.SUE,    // 술 - 쇠
      [EarthlyBranch.HAE]: TwelveLifeStages.BYEONG, // 해 - 병
      [EarthlyBranch.JA]: TwelveLifeStages.SA,      // 자 - 사
      [EarthlyBranch.CHUK]: TwelveLifeStages.MYO,   // 축 - 묘
      [EarthlyBranch.IN]: TwelveLifeStages.JEOL,    // 인 - 절
      [EarthlyBranch.MYO]: TwelveLifeStages.TAE,    // 묘 - 태
      [EarthlyBranch.JIN]: TwelveLifeStages.YANG,   // 진 - 양
    },
    [HeavenlyStem.SIN]: { // 신금 (음간)
      [EarthlyBranch.JA]: TwelveLifeStages.JANG,    // 자 - 장생
      [EarthlyBranch.HAE]: TwelveLifeStages.MOK,    // 해 - 목욕
      [EarthlyBranch.SUL]: TwelveLifeStages.GWAN,   // 술 - 관대
      [EarthlyBranch.YU]: TwelveLifeStages.IM,      // 유 - 임관
      [EarthlyBranch.SHIN]: TwelveLifeStages.JE,    // 신 - 제왕
      [EarthlyBranch.MI]: TwelveLifeStages.SUE,     // 미 - 쇠
      [EarthlyBranch.O]: TwelveLifeStages.BYEONG,   // 오 - 병
      [EarthlyBranch.SA]: TwelveLifeStages.SA,      // 사 - 사
      [EarthlyBranch.JIN]: TwelveLifeStages.MYO,    // 진 - 묘
      [EarthlyBranch.MYO]: TwelveLifeStages.JEOL,   // 묘 - 절
      [EarthlyBranch.IN]: TwelveLifeStages.TAE,     // 인 - 태
      [EarthlyBranch.CHUK]: TwelveLifeStages.YANG,  // 축 - 양
    },
    [HeavenlyStem.IM]: { // 임수 (양간)
      [EarthlyBranch.SHIN]: TwelveLifeStages.JANG,  // 신 - 장생
      [EarthlyBranch.YU]: TwelveLifeStages.MOK,     // 유 - 목욕
      [EarthlyBranch.SUL]: TwelveLifeStages.GWAN,   // 술 - 관대
      [EarthlyBranch.HAE]: TwelveLifeStages.IM,     // 해 - 임관
      [EarthlyBranch.JA]: TwelveLifeStages.JE,      // 자 - 제왕
      [EarthlyBranch.CHUK]: TwelveLifeStages.SUE,   // 축 - 쇠
      [EarthlyBranch.IN]: TwelveLifeStages.BYEONG,  // 인 - 병
      [EarthlyBranch.MYO]: TwelveLifeStages.SA,     // 묘 - 사
      [EarthlyBranch.JIN]: TwelveLifeStages.MYO,    // 진 - 묘
      [EarthlyBranch.SA]: TwelveLifeStages.JEOL,    // 사 - 절
      [EarthlyBranch.O]: TwelveLifeStages.TAE,      // 오 - 태
      [EarthlyBranch.MI]: TwelveLifeStages.YANG,    // 미 - 양
    },
    [HeavenlyStem.GYE]: { // 계수 (음간)
      [EarthlyBranch.MYO]: TwelveLifeStages.JANG,   // 묘 - 장생
      [EarthlyBranch.IN]: TwelveLifeStages.MOK,     // 인 - 목욕
      [EarthlyBranch.CHUK]: TwelveLifeStages.GWAN,  // 축 - 관대
      [EarthlyBranch.JA]: TwelveLifeStages.IM,      // 자 - 임관
      [EarthlyBranch.HAE]: TwelveLifeStages.JE,     // 해 - 제왕
      [EarthlyBranch.SUL]: TwelveLifeStages.SUE,    // 술 - 쇠
      [EarthlyBranch.YU]: TwelveLifeStages.BYEONG,  // 유 - 병
      [EarthlyBranch.SHIN]: TwelveLifeStages.SA,    // 신 - 사
      [EarthlyBranch.MI]: TwelveLifeStages.MYO,     // 미 - 묘
      [EarthlyBranch.O]: TwelveLifeStages.JEOL,     // 오 - 절
      [EarthlyBranch.SA]: TwelveLifeStages.TAE,     // 사 - 태
      [EarthlyBranch.JIN]: TwelveLifeStages.YANG,   // 진 - 양
    }
  };

  /**
   * 일간을 기준으로 특정 지지의 12운성을 계산합니다.
   */
  static calculateLifeStage(dayStem: HeavenlyStem, branch: EarthlyBranch): TwelveLifeStages {
    return this.LIFE_STAGES_MAP[dayStem][branch];
  }

  /**
   * 12운성의 의미를 가져옵니다.
   */
  static getLifeStageMeaning(lifeStage: TwelveLifeStages): string {
    const meanings: Record<TwelveLifeStages, string> = {
      [TwelveLifeStages.JANG]: '새로운 시작, 희망, 성장 가능성',
      [TwelveLifeStages.MOK]: '정화, 변화, 불안정',
      [TwelveLifeStages.GWAN]: '성장, 학습, 발전',
      [TwelveLifeStages.IM]: '건강, 성숙, 능력 발휘',
      [TwelveLifeStages.JE]: '절정, 권력, 최고조',
      [TwelveLifeStages.SUE]: '쇠퇴 시작, 조심',
      [TwelveLifeStages.BYEONG]: '병약, 어려움, 시련',
      [TwelveLifeStages.SA]: '정지, 막힘, 죽음',
      [TwelveLifeStages.MYO]: '저장, 잠재력, 무덤',
      [TwelveLifeStages.JEOL]: '절멸, 끝, 소멸',
      [TwelveLifeStages.TAE]: '잉태, 새 생명, 준비',
      [TwelveLifeStages.YANG]: '양육, 보호, 성장'
    };
    
    return meanings[lifeStage];
  }
}
