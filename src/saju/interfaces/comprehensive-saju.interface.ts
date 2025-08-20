import { SajuFromCalendar } from './saju-from-calendar.interface';
import { TenStarsInfo } from './ten-stars.interface';
import { SajuHiddenStems } from './hidden-stems.interface';
import { TwelveLifeStagesInfo } from './twelve-life-stages.interface';
import { TwelveSpiritsInfo } from './twelve-spirits.interface';

/**
 * 만세력 기반 완전한 사주 분석 정보
 * 기본 사주 정보 + 십성, 지장간, 12운성, 12신살
 */
export interface ComprehensiveSaju {
  /** 기본 사주 정보 (만세력 기반) */
  basicSaju: SajuFromCalendar;

  /** 십성 정보 */
  tenStars: TenStarsInfo;

  /** 지장간 정보 */
  hiddenStems: SajuHiddenStems;

  /** 12운성 정보 */
  twelveLifeStages: TwelveLifeStagesInfo;

  /** 12신살 정보 */
  twelveSpirits: TwelveSpiritsInfo;

  /** 분석 요약 */
  analysis: {
    /** 주요 특징 */
    mainCharacteristics: string[];
    
    /** 강약 분석 */
    strengthAnalysis: {
      dayMasterStrength: 'strong' | 'weak' | 'balanced';
      supportElements: string[];
      weakElements: string[];
    };

    /** 추천사항 */
    recommendations: {
      favorableDirections: string[];
      favorableColors: string[];
      careerSuggestions: string[];
    };
  };
}

/**
 * 사주 분석 옵션
 */
export interface SajuAnalysisOptions {
  /** 십성 분석 포함 여부 */
  includeTenStars?: boolean;

  /** 지장간 분석 포함 여부 */
  includeHiddenStems?: boolean;

  /** 12운성 분석 포함 여부 */
  includeTwelveLifeStages?: boolean;

  /** 12신살 분석 포함 여부 */
  includeTwelveSpirits?: boolean;

  /** 상세 분석 포함 여부 */
  includeDetailedAnalysis?: boolean;
}
