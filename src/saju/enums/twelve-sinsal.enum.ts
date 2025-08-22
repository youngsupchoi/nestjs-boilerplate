/**
 * 12신살 (十二神殺) - 12가지 신살
 */
export enum TwelveSinsal {
  JANGSEONGSAL = '장성살', // 長星殺
  BANANSAL = '반안살',     // 半安殺  
  YEOKMASAL = '역마살',    // 驛馬殺
  YUKHAESAL = '육해살',    // 六害殺
  HWAGAESAL = '화개살',    // 華蓋殺
  GEOBSAL = '겁살',        // 劫殺
  JAESAL = '재살',         // 災殺
  CHEONSAL = '천살',       // 天殺
  JISAL = '지살',          // 地殺
  NYEONSAL = '년살',       // 年殺
  WOLSAL = '월살',         // 月殺
  MANGSINSAL = '망신살'    // 亡神殺
}

/**
 * 삼합 그룹별 장성살 지지 매핑
 */
export const SAMHAP_GROUPS = {
  '신자진': '자',  // 申子辰 → 子
  '해묘미': '묘',  // 亥卯未 → 卯
  '인오술': '오',  // 寅午戌 → 午
  '사유축': '유'   // 巳酉丑 → 酉
} as const;

/**
 * 12신살 순서 (장성살부터 시작)
 */
export const TWELVE_SINSAL_ORDER: TwelveSinsal[] = [
  TwelveSinsal.JANGSEONGSAL, // 장성살
  TwelveSinsal.BANANSAL,     // 반안살
  TwelveSinsal.YEOKMASAL,    // 역마살
  TwelveSinsal.YUKHAESAL,    // 육해살
  TwelveSinsal.HWAGAESAL,    // 화개살
  TwelveSinsal.GEOBSAL,      // 겁살
  TwelveSinsal.JAESAL,       // 재살
  TwelveSinsal.CHEONSAL,     // 천살
  TwelveSinsal.JISAL,        // 지살
  TwelveSinsal.NYEONSAL,     // 년살
  TwelveSinsal.WOLSAL,       // 월살
  TwelveSinsal.MANGSINSAL    // 망신살
];
