import { TimeCorrection, LocationInfo } from '../interfaces/time-correction.interface';

/**
 * 시간 보정 관련 유틸리티 함수들
 */
export class TimeCorrectionUtils {
  /**
   * 한국 주요 지역별 경도 정보
   */
  private static readonly KOREA_LOCATIONS: Record<string, LocationInfo> = {
    '서울': { name: '서울', longitude: 126.9780, latitude: 37.5665, timeDifferenceMinutes: -32 },
    '부산': { name: '부산', longitude: 129.0756, latitude: 35.1796, timeDifferenceMinutes: -24 },
    '대구': { name: '대구', longitude: 128.6014, latitude: 35.8714, timeDifferenceMinutes: -26 },
    '인천': { name: '인천', longitude: 126.7052, latitude: 37.4563, timeDifferenceMinutes: -33 },
    '광주': { name: '광주', longitude: 126.8526, latitude: 35.1595, timeDifferenceMinutes: -32 },
    '대전': { name: '대전', longitude: 127.3845, latitude: 36.3504, timeDifferenceMinutes: -30 },
    '울산': { name: '울산', longitude: 129.3114, latitude: 35.5384, timeDifferenceMinutes: -23 },
    '수원': { name: '수원', longitude: 127.0286, latitude: 37.2636, timeDifferenceMinutes: -32 },
    '창원': { name: '창원', longitude: 128.6811, latitude: 35.2281, timeDifferenceMinutes: -25 },
    '고양': { name: '고양', longitude: 126.8356, latitude: 37.6564, timeDifferenceMinutes: -33 },
    '용인': { name: '용인', longitude: 127.1776, latitude: 37.2411, timeDifferenceMinutes: -31 },
    '성남': { name: '성남', longitude: 127.1378, latitude: 37.4449, timeDifferenceMinutes: -31 },
    '청주': { name: '청주', longitude: 127.4890, latitude: 36.6424, timeDifferenceMinutes: -30 },
    '전주': { name: '전주', longitude: 127.1480, latitude: 35.8242, timeDifferenceMinutes: -31 },
    '안산': { name: '안산', longitude: 126.8219, latitude: 37.3219, timeDifferenceMinutes: -33 },
    '천안': { name: '천안', longitude: 127.1522, latitude: 36.8151, timeDifferenceMinutes: -31 },
    '포항': { name: '포항', longitude: 129.3435, latitude: 36.0190, timeDifferenceMinutes: -23 },
    '의정부': { name: '의정부', longitude: 127.0477, latitude: 37.7380, timeDifferenceMinutes: -32 },
    '원주': { name: '원주', longitude: 127.9202, latitude: 37.3422, timeDifferenceMinutes: -28 },
    '춘천': { name: '춘천', longitude: 127.7298, latitude: 37.8813, timeDifferenceMinutes: -29 }
  };

  /**
   * 기본 한국 평균 경도로 시간을 보정합니다.
   * @param standardTime 표준시
   * @param longitude 경도 (기본값: 127도 - 한국 평균)
   * @returns 보정된 시간 정보
   */
  static correctTimeForTrueSolarTime(standardTime: Date, longitude: number = 127): TimeCorrection {
    // 한국 표준시는 동경 135도 기준
    // 경도 1도당 4분 차이 (지구 자전: 360도/24시간 = 15도/1시간 = 1도/4분)
    const correctionMinutes = (135 - longitude) * 4;
    
    const correctedTime = new Date(standardTime.getTime() - correctionMinutes * 60 * 1000);
    
    return {
      originalTime: standardTime,
      correctedTime,
      correctionMinutes,
      reason: `경도 ${longitude}도 기준 진태양시 보정 (표준시 대비 ${correctionMinutes}분 차이)`
    };
  }

  /**
   * 지역명으로 시간을 보정합니다.
   * @param standardTime 표준시
   * @param locationName 지역명
   * @returns 보정된 시간 정보
   */
  static correctTimeByLocation(standardTime: Date, locationName: string): TimeCorrection {
    const location = this.KOREA_LOCATIONS[locationName];
    
    if (!location) {
      // 지역 정보가 없으면 기본 보정 적용
      return this.correctTimeForTrueSolarTime(standardTime);
    }
    
    const correctedTime = new Date(standardTime.getTime() + location.timeDifferenceMinutes * 60 * 1000);
    
    return {
      originalTime: standardTime,
      correctedTime,
      correctionMinutes: Math.abs(location.timeDifferenceMinutes),
      reason: `${location.name}(경도 ${location.longitude}도) 진태양시 보정`
    };
  }

  /**
   * 사용 가능한 지역 목록을 가져옵니다.
   */
  static getAvailableLocations(): string[] {
    return Object.keys(this.KOREA_LOCATIONS);
  }

  /**
   * 지역 정보를 가져옵니다.
   */
  static getLocationInfo(locationName: string): LocationInfo | null {
    return this.KOREA_LOCATIONS[locationName] || null;
  }

  /**
   * 시간 보정 정보를 문자열로 포맷팅합니다.
   */
  static formatTimeCorrection(correction: TimeCorrection): string {
    return [
      `원본 시간: ${correction.originalTime.toLocaleString('ko-KR')}`,
      `보정 시간: ${correction.correctedTime.toLocaleString('ko-KR')}`,
      `보정량: ${correction.correctionMinutes}분`,
      `보정 이유: ${correction.reason}`
    ].join('\n');
  }

  /**
   * 시주가 바뀌는지 확인합니다.
   */
  static checkHourPillarChange(originalTime: Date, correctedTime: Date): boolean {
    const getHourPillar = (time: Date) => {
      const hour = time.getHours();
      if (hour >= 23 || hour < 1) return 0; // 자시
      return Math.floor((hour + 1) / 2);
    };
    
    return getHourPillar(originalTime) !== getHourPillar(correctedTime);
  }
}
