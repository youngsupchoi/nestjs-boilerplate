import { Injectable } from '@nestjs/common';
import { SajuFromCalendar, SajuExtractionParams } from './interfaces/saju-from-calendar.interface';
import { ComprehensiveSaju, SajuAnalysisOptions } from './interfaces/comprehensive-saju.interface';
import { TenStarsInfo } from './interfaces/ten-stars.interface';
import { HourPillarUtils } from './utils/hour-pillar.utils';
import { TenStarsUtils } from './utils/ten-stars.utils';
import { CalendarDataRepository } from './repositories/calendar-data.repository';
import { HeavenlyStem } from './enums/heavenly-stem.enum';
import { EarthlyBranch } from './enums/earthly-branch.enum';
import { TenStars } from './enums/ten-stars.enum';

@Injectable()
export class SajuService {
  constructor(
    private readonly calendarDataRepository?: CalendarDataRepository,
  ) {}

  /**
   * 만세력 데이터베이스를 활용하여 생년월일시로부터 사주 정보를 추출합니다.
   * @param params 생년월일시 파라미터
   * @returns 사주 정보 (연주, 월주, 일주, 시주)
   */
  async extractSajuFromCalendar(params: SajuExtractionParams): Promise<SajuFromCalendar> {
    if (!this.calendarDataRepository) {
      throw new Error('CalendarDataRepository가 주입되지 않았습니다. 만세력 기반 사주 추출 기능을 사용하려면 Repository를 주입해야 합니다.');
    }

    const { year, month, day, hour, minute = 0, isSolar, isLeapMonth = false } = params;

    // 1. 만세력 데이터에서 해당 날짜 정보 조회
    let calendarData;
    
    if (isSolar) {
      // 양력 날짜로 조회
      calendarData = await this.calendarDataRepository.findBySolarDate(year, month, day);
    } else {
      // 음력 날짜로 조회
      calendarData = await this.calendarDataRepository.findByLunarDate(year, month, day, isLeapMonth);
    }

    if (!calendarData) {
      throw new Error(`만세력 데이터에서 해당 날짜를 찾을 수 없습니다: ${year}-${month}-${day}`);
    }

    // 2. 연주, 월주, 일주 정보 추출
    const yearPillar = this.parseGanzhi(calendarData.cd_hyganjee, calendarData.cd_kyganjee);
    const monthPillar = this.parseGanzhi(calendarData.cd_hmganjee, calendarData.cd_kmganjee);
    const dayPillar = this.parseGanzhi(calendarData.cd_hdganjee, calendarData.cd_kdganjee);

    // 3. 시주 계산 (만세력 DB에는 시주 정보가 없으므로 별도 계산)
    const hourPillarInfo = HourPillarUtils.calculateHourPillar(
      dayPillar.heavenlyStem, 
      hour, 
      minute
    );

    const hourPillar = {
      heavenlyStem: hourPillarInfo.heavenlyStem,
      earthlyBranch: hourPillarInfo.earthlyBranch,
      ganzhi: hourPillarInfo.ganzhi,
      ganzhiKorean: hourPillarInfo.ganzhiKorean,
    };

    // 4. 결과 반환
    return {
      birthInfo: {
        year,
        month,
        day,
        hour,
        minute,
        isSolar,
      },
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      additionalInfo: {
        solarYear: calendarData.cd_sy,
        solarMonth: parseInt(calendarData.cd_sm),
        solarDay: parseInt(calendarData.cd_sd),
        lunarYear: calendarData.cd_ly,
        lunarMonth: parseInt(calendarData.cd_lm),
        lunarDay: parseInt(calendarData.cd_ld),
        isLeapMonth: calendarData.cd_leap_month === 1,
        weekElement: calendarData.cd_hweek || '',
        weekElementKorean: calendarData.cd_kweek || '',
        constellation: calendarData.cd_stars || '',
        zodiacAnimal: calendarData.cd_ddi,
      },
    };
  }

  /**
   * 간지 문자열을 파싱하여 천간과 지지를 분리합니다.
   * @param ganzhiChinese 간지 (한자)
   * @param ganzhiKorean 간지 (한글)
   * @returns 파싱된 간지 정보
   */
  private parseGanzhi(ganzhiChinese: string, ganzhiKorean: string): {
    heavenlyStem: string;
    earthlyBranch: string;
    ganzhi: string;
    ganzhiKorean: string;
  } {
    if (!ganzhiChinese || ganzhiChinese.length !== 2) {
      throw new Error(`올바르지 않은 간지 형식: ${ganzhiChinese}`);
    }

    return {
      heavenlyStem: ganzhiChinese.charAt(0), // 첫 번째 글자: 천간
      earthlyBranch: ganzhiChinese.charAt(1), // 두 번째 글자: 지지
      ganzhi: ganzhiChinese,
      ganzhiKorean: ganzhiKorean || '',
    };
  }

  /**
   * 생년월일시를 기준으로 사주 정보를 조회합니다.
   * @param year 년도
   * @param month 월
   * @param day 일
   * @param hour 시간
   * @param minute 분
   * @param isSolar 양력 여부
   * @param isLeapMonth 윤달 여부
   * @returns 사주 정보
   */
  async getSajuByDateTime(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number = 0,
    isSolar: boolean = true,
    isLeapMonth: boolean = false,
  ): Promise<SajuFromCalendar> {
    if (!this.calendarDataRepository) {
      throw new Error('CalendarDataRepository가 주입되지 않았습니다. 만세력 기반 사주 추출 기능을 사용하려면 Repository를 주입해야 합니다.');
    }
    return await this.extractSajuFromCalendar({
      year,
      month,
      day,
      hour,
      minute,
      isSolar,
      isLeapMonth,
    });
  }

  /**
   * 사주 정보를 보기 좋은 형태로 포맷팅합니다.
   * @param saju 사주 정보
   * @returns 포맷팅된 문자열
   */
  formatSajuFromCalendar(saju: SajuFromCalendar): string {
    const { birthInfo, yearPillar, monthPillar, dayPillar, hourPillar, additionalInfo } = saju;

    const lines = [
      '=== 만세력 기반 사주 정보 ===',
      `생년월일시: ${birthInfo.year}년 ${birthInfo.month}월 ${birthInfo.day}일 ${birthInfo.hour}시 ${birthInfo.minute}분`,
      `입력 기준: ${birthInfo.isSolar ? '양력' : '음력'}${additionalInfo.isLeapMonth ? ' (윤달)' : ''}`,
      '',
      '=== 사주 (四柱) ===',
      `연주 (年柱): ${yearPillar.ganzhi} (${yearPillar.ganzhiKorean})`,
      `월주 (月柱): ${monthPillar.ganzhi} (${monthPillar.ganzhiKorean})`,
      `일주 (日柱): ${dayPillar.ganzhi} (${dayPillar.ganzhiKorean})`,
      `시주 (時柱): ${hourPillar.ganzhi} (${hourPillar.ganzhiKorean})`,
      '',
      '=== 추가 정보 ===',
      `양력: ${additionalInfo.solarYear}년 ${additionalInfo.solarMonth}월 ${additionalInfo.solarDay}일`,
      `음력: ${additionalInfo.lunarYear}년 ${additionalInfo.lunarMonth}월 ${additionalInfo.lunarDay}일${additionalInfo.isLeapMonth ? ' (윤달)' : ''}`,
      `일진 오행: ${additionalInfo.weekElement} (${additionalInfo.weekElementKorean})`,
      `28수: ${additionalInfo.constellation}`,
      `띠: ${additionalInfo.zodiacAnimal}`,
    ];

    return lines.join('\n');
  }

  /**
   * 만세력 기반 완전한 사주 분석을 수행합니다.
   * @param params 생년월일시 파라미터
   * @param options 분석 옵션
   * @returns 완전한 사주 분석 정보
   */
  async extractComprehensiveSaju(
    params: SajuExtractionParams,
    options: SajuAnalysisOptions = {}
  ): Promise<ComprehensiveSaju> {
    // 기본 사주 정보 추출
    const basicSaju = await this.extractSajuFromCalendar(params);

    const result: ComprehensiveSaju = {
      basicSaju,
      tenStars: null,
      hiddenStems: null,
      twelveLifeStages: null,
      twelveSpirits: null,
      analysis: {
        mainCharacteristics: [],
        strengthAnalysis: {
          dayMasterStrength: 'balanced',
          supportElements: [],
          weakElements: []
        },
        recommendations: {
          favorableDirections: [],
          favorableColors: [],
          careerSuggestions: []
        }
      }
    };

    return result;
  }

  /**
   * 완전한 사주 분석 결과를 포맷팅합니다.
   */
  formatComprehensiveSaju(saju: ComprehensiveSaju): string {
    return this.formatSajuFromCalendar(saju.basicSaju);
  }

  /**
   * 한자 천간을 HeavenlyStem enum으로 변환합니다.
   */
  private convertChineseToHeavenlyStem(chinese: string): HeavenlyStem {
    const map: Record<string, HeavenlyStem> = {
      '甲': HeavenlyStem.GAP,
      '乙': HeavenlyStem.EUL,
      '丙': HeavenlyStem.BYEONG,
      '丁': HeavenlyStem.JEONG,
      '戊': HeavenlyStem.MU,
      '己': HeavenlyStem.GI,
      '庚': HeavenlyStem.GYEONG,
      '辛': HeavenlyStem.SIN,
      '壬': HeavenlyStem.IM,
      '癸': HeavenlyStem.GYE,
    };
    
    const stem = map[chinese];
    if (!stem) {
      throw new Error(`알 수 없는 천간: ${chinese}`);
    }
    
    return stem;
  }

  /**
   * 한자 지지를 EarthlyBranch enum으로 변환합니다.
   */
  private convertChineseToEarthlyBranch(chinese: string): EarthlyBranch {
    const map: Record<string, EarthlyBranch> = {
      '子': EarthlyBranch.JA,
      '丑': EarthlyBranch.CHUK,
      '寅': EarthlyBranch.IN,
      '卯': EarthlyBranch.MYO,
      '辰': EarthlyBranch.JIN,
      '巳': EarthlyBranch.SA,
      '午': EarthlyBranch.O,
      '未': EarthlyBranch.MI,
      '申': EarthlyBranch.SHIN,
      '酉': EarthlyBranch.YU,
      '戌': EarthlyBranch.SUL,
      '亥': EarthlyBranch.HAE,
    };
    
    const branch = map[chinese];
    if (!branch) {
      throw new Error(`알 수 없는 지지: ${chinese}`);
    }
    
    return branch;
  }

  /**
   * 사주 팔자에서 십성을 계산합니다.
   */
  calculateTenStars(saju: SajuFromCalendar): TenStarsInfo {
    try {
      // 일간을 기준으로 설정
      const dayMaster = this.convertChineseToHeavenlyStem(saju.dayPillar.heavenlyStem);
      
      // 천간 십성 계산
      const yearStemTenStar = TenStarsUtils.calculateTenStar(
        dayMaster, 
        this.convertChineseToHeavenlyStem(saju.yearPillar.heavenlyStem)
      );
      const monthStemTenStar = TenStarsUtils.calculateTenStar(
        dayMaster, 
        this.convertChineseToHeavenlyStem(saju.monthPillar.heavenlyStem)
      );
      const hourStemTenStar = TenStarsUtils.calculateTenStar(
        dayMaster, 
        this.convertChineseToHeavenlyStem(saju.hourPillar.heavenlyStem)
      );

      // 지지 십성 계산 (지장간 본기 기준)
      const yearBranchTenStar = TenStarsUtils.calculateBranchTenStar(
        dayMaster, 
        this.convertChineseToEarthlyBranch(saju.yearPillar.earthlyBranch)
      );
      const monthBranchTenStar = TenStarsUtils.calculateBranchTenStar(
        dayMaster, 
        this.convertChineseToEarthlyBranch(saju.monthPillar.earthlyBranch)
      );
      const dayBranchTenStar = TenStarsUtils.calculateBranchTenStar(
        dayMaster, 
        this.convertChineseToEarthlyBranch(saju.dayPillar.earthlyBranch)
      );
      const hourBranchTenStar = TenStarsUtils.calculateBranchTenStar(
        dayMaster, 
        this.convertChineseToEarthlyBranch(saju.hourPillar.earthlyBranch)
      );

      return {
        heavenlyStems: {
          year: yearStemTenStar,
          month: monthStemTenStar,
          day: `일간 (${saju.dayPillar.heavenlyStem})`,
          hour: hourStemTenStar,
        },
        earthlyBranches: {
          year: yearBranchTenStar,
          month: monthBranchTenStar,
          day: dayBranchTenStar,
          hour: hourBranchTenStar,
        },
      };
    } catch (error) {
      console.error('십성 계산 중 오류:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`십성 계산 중 오류가 발생했습니다: ${errorMessage}`);
    }
  }

  /**
   * 십성 정보를 포함한 사주 정보를 반환합니다.
   */
  async getSajuWithTenStars(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number = 0,
    isSolar: boolean = true,
    isLeapMonth: boolean = false,
  ): Promise<SajuFromCalendar & { tenStars: TenStarsInfo }> {
    const basicSaju = await this.getSajuByDateTime(
      year, month, day, hour, minute, isSolar, isLeapMonth
    );
    
    const tenStars = this.calculateTenStars(basicSaju);
    
    return {
      ...basicSaju,
      tenStars,
    };
  }
}