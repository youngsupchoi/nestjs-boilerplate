import { EarthlyBranch } from '../enums/earthly-branch.enum';
import { TwelveSinsal } from '../enums/twelve-sinsal.enum';

/**
 * 12신살 정보 인터페이스
 */
export interface TwelveSinsalInfo {
  /** 년지 (띠) */
  yearBranch: EarthlyBranch;
  
  /** 년지의 한글명 */
  yearBranchKorean: string;
  
  /** 년지의 한자명 */
  yearBranchChinese: string;
  
  /** 삼합 그룹명 */
  samhapGroup: string;
  
  /** 장성살이 위치한 지지 */
  jangseonsalBranch: EarthlyBranch;
  
  /** 지지별 신살 매핑 */
  sinsalMapping: Record<EarthlyBranch, TwelveSinsal>;
}

/**
 * 12신살 계산 결과 인터페이스
 */
export interface TwelveSinsalResult {
  /** 기본 신살 정보 */
  sinsalInfo: TwelveSinsalInfo;
  
  /** 각 신살별 해당 지지들 */
  sinsalByType: Record<TwelveSinsal, EarthlyBranch[]>;
  
  /** 지지별 신살 설명 */
  descriptions: Record<EarthlyBranch, {
    sinsal: TwelveSinsal;
    description: string;
  }>;
}

/**
 * 12신살 설명 정보
 */
export const TWELVE_SINSAL_DESCRIPTIONS: Record<TwelveSinsal, string> = {
  [TwelveSinsal.JANGSEONGSAL]: '장성살 - 권위와 지위를 상징하며, 관리나 지도자 역할에 적합',
  [TwelveSinsal.BANANSAL]: '반안살 - 안정과 평온을 추구하며, 조화로운 성격',
  [TwelveSinsal.YEOKMASAL]: '역마살 - 이동과 변화를 좋아하며, 여행이나 이주 운이 강함',
  [TwelveSinsal.YUKHAESAL]: '육해살 - 인간관계에서 갈등이나 해로움을 받기 쉬움',
  [TwelveSinsal.HWAGAESAL]: '화개살 - 예술적 재능과 종교적 성향, 고독을 좋아함',
  [TwelveSinsal.GEOBSAL]: '겁살 - 재물 손실이나 도난을 조심해야 함',
  [TwelveSinsal.JAESAL]: '재살 - 재해나 사고를 당하기 쉬우므로 조심해야 함',
  [TwelveSinsal.CHEONSAL]: '천살 - 하늘의 살기로 건강이나 우환을 조심해야 함',
  [TwelveSinsal.JISAL]: '지살 - 땅의 살기로 부동산이나 거주지 관련 문제 주의',
  [TwelveSinsal.NYEONSAL]: '년살 - 해마다 찾아오는 흉운으로 조심스러운 행동 필요',
  [TwelveSinsal.WOLSAL]: '월살 - 매달 찾아오는 흉운으로 계획적인 행동 필요',
  [TwelveSinsal.MANGSINSAL]: '망신살 - 체면이나 명예에 손상을 입기 쉬우므로 언행 주의'
} as const;
