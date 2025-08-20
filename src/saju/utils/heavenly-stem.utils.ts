import { HeavenlyStem, HEAVENLY_STEM_INFO } from '../enums/heavenly-stem.enum';
import { FiveElements } from '../enums/five-elements.enum';
import { HeavenlyStemInfo } from '../interfaces/heavenly-stem-info.interface';

/**
 * 천간 관련 유틸리티 함수들
 */
export class HeavenlyStemUtils {
  /**
   * 천간의 상세 정보를 가져옵니다.
   */
  static getInfo(stem: HeavenlyStem): HeavenlyStemInfo {
    return HEAVENLY_STEM_INFO[stem];
  }

  /**
   * 천간의 음양을 확인합니다.
   */
  static isYang(stem: HeavenlyStem): boolean {
    return HEAVENLY_STEM_INFO[stem].isYang;
  }

  /**
   * 천간의 오행을 가져옵니다.
   */
  static getElement(stem: HeavenlyStem): FiveElements {
    return HEAVENLY_STEM_INFO[stem].element;
  }

  /**
   * 천간의 기본 설명을 가져옵니다.
   */
  static getDescription(stem: HeavenlyStem): string {
    return HEAVENLY_STEM_INFO[stem].description;
  }

  /**
   * 천간의 특성들을 가져옵니다.
   */
  static getCharacteristics(stem: HeavenlyStem): string[] {
    return HEAVENLY_STEM_INFO[stem].characteristics;
  }

  /**
   * 특정 오행의 천간들을 가져옵니다.
   */
  static getStemsByElement(element: FiveElements): HeavenlyStem[] {
    return Object.values(HeavenlyStem).filter(stem => 
      HEAVENLY_STEM_INFO[stem].element === element
    );
  }

  /**
   * 양간들을 가져옵니다.
   */
  static getYangStems(): HeavenlyStem[] {
    return Object.values(HeavenlyStem).filter(stem => 
      HEAVENLY_STEM_INFO[stem].isYang
    );
  }

  /**
   * 음간들을 가져옵니다.
   */
  static getYinStems(): HeavenlyStem[] {
    return Object.values(HeavenlyStem).filter(stem => 
      !HEAVENLY_STEM_INFO[stem].isYang
    );
  }

  /**
   * 천간의 상세 정보를 문자열로 포맷팅합니다.
   */
  static formatStemInfo(stem: HeavenlyStem): string {
    const info = HEAVENLY_STEM_INFO[stem];
    const yinYang = info.isYang ? '양간' : '음간';
    
    return [
      `${info.character}(${stem}) - ${yinYang} ${info.element}`,
      `기본성격: ${info.description}`,
      `특성: ${info.characteristics.join(', ')}`
    ].join('\n');
  }

  /**
   * 모든 천간의 정보를 요약해서 보여줍니다.
   */
  static getAllStemsInfo(): string {
    return Object.values(HeavenlyStem).map(stem => {
      const info = HEAVENLY_STEM_INFO[stem];
      const yinYang = info.isYang ? '양' : '음';
      return `${stem}(${yinYang}${info.element}): ${info.description}`;
    }).join('\n');
  }
}
