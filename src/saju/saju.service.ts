import { Injectable } from '@nestjs/common';
import { SajuFromCalendar, SajuExtractionParams } from './interfaces/saju-from-calendar.interface';
import { ComprehensiveSaju, SajuAnalysisOptions } from './interfaces/comprehensive-saju.interface';
import { DaeunList, DaeunInfo } from './interfaces/daeun.interface';
import { DaeunCalculationParams } from './interfaces/daeun-calculation.interface';
import { TenStarsInfo } from './interfaces/ten-stars.interface';
import { HourPillarUtils } from './utils/hour-pillar.utils';
import { TenStarsUtils } from './utils/ten-stars.utils';
import { CalendarDataRepository } from './repositories/calendar-data.repository';
import { HeavenlyStem, HEAVENLY_STEM_INFO } from './enums/heavenly-stem.enum';
import { EarthlyBranch } from './enums/earthly-branch.enum';
import { TenStars } from './enums/ten-stars.enum';
import { Gender } from './enums/gender.enum';

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

  // ==================== 대운(大運) 계산 관련 메소드 ====================

  /**
   * 1단계: 대운의 순행/역행 결정 (연주 천간의 음양 + 성별)
   * @param gender 성별
   * @param yearStem 연주 천간
   * @returns true: 순행, false: 역행
   */
  private determineDaeunDirection(gender: Gender, yearStem: HeavenlyStem): boolean {
    const stemInfo = HEAVENLY_STEM_INFO[yearStem];
    const isYangStem = stemInfo.isYang;
    
    if (gender === Gender.MALE) {
      // 남자: 양간년생=순행, 음간년생=역행
      return isYangStem;
    } else {
      // 여자: 음간년생=순행, 양간년생=역행
      return !isYangStem;
    }
  }

  /**
   * 2단계: 대운수(첫 대운 시작 나이) 계산 - DB 기반 절기 거리 활용
   * @param year 생년
   * @param month 생월
   * @param day 생일
   * @param isForward 순행 여부
   * @returns 대운수 (첫 대운 시작 나이)
   */
  private async calculateDaeunNumber(
    year: number,
    month: number,
    day: number,
    isForward: boolean
  ): Promise<number> {
    if (!this.calendarDataRepository) {
      // DB 없으면 기본값 반환
      return isForward ? 5 : 4;
    }

    try {
      // DB에서 절기까지의 거리 계산
      const distanceToSolarTerm = await this.calendarDataRepository
        .calculateDistanceToSolarTerm(year, month, day, isForward);
      
      // 3일 = 1년 공식 적용 (올림 처리)
      const daeunNumber = Math.ceil(distanceToSolarTerm / 3);
      
      // 대운수는 보통 3~8세 범위로 조정
      return Math.max(3, Math.min(8, daeunNumber));
      
    } catch (error) {
      console.error('대운수 계산 오류:', error);
      // 오류 시 기본값 반환
      return isForward ? 5 : 4;
    }
  }

  /**
   * 3단계: 육십갑자 배열 생성
   * @returns 육십갑자 배열
   */
  private generateSixtyGanzhi(): string[] {
    const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    const sixtyGanzhi: string[] = [];
    
    for (let i = 0; i < 60; i++) {
      const stem = heavenlyStems[i % 10];
      const branch = earthlyBranches[i % 12];
      sixtyGanzhi.push(stem + branch);
    }
    
    return sixtyGanzhi;
  }

  /**
   * 3단계: 대운 간지 목록 생성 (월주 기준 + 순행/역행)
   * @param monthPillar 월주 간지
   * @param isForward 순행 여부
   * @returns 대운 간지 목록 (10개 고정)
   */
  private generateDaeunGanzhi(
    monthPillar: string,
    isForward: boolean
  ): string[] {
    const sixtyGanzhi = this.generateSixtyGanzhi();
    
    // 월주의 육십갑자 인덱스 찾기
    const currentIndex = sixtyGanzhi.indexOf(monthPillar);
    
    if (currentIndex === -1) {
      throw new Error(`올바르지 않은 월주 간지: ${monthPillar}`);
    }
    
    const daeunGanzhiList: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      let targetIndex;
      
      if (isForward) {
        // 순행: 월주 다음 간지부터 순서대로
        targetIndex = (currentIndex + i + 1) % 60;
      } else {
        // 역행: 월주 이전 간지부터 역순으로
        targetIndex = (currentIndex - i - 1 + 60) % 60;
      }
      
      daeunGanzhiList.push(sixtyGanzhi[targetIndex]);
    }
    
    return daeunGanzhiList;
  }

  /**
   * 대운 전체 목록 계산 (메인 함수)
   * @param params 대운 계산 파라미터
   * @returns 대운 전체 목록
   */
  async calculateDaeunList(params: DaeunCalculationParams): Promise<DaeunList> {
    // 1. 기본 사주 정보 추출
    const basicSaju = await this.extractSajuFromCalendar({
      year: params.year,
      month: params.month,
      day: params.day,
      hour: params.hour,
      minute: params.minute || 0,
      isSolar: params.isSolar ?? true,
      isLeapMonth: params.isLeapMonth || false
    });
    
    // 2. 1단계: 순행/역행 결정 (연주 천간의 음양 + 성별)
    const yearStem = this.convertChineseToHeavenlyStem(basicSaju.yearPillar.heavenlyStem);
    const isForward = this.determineDaeunDirection(params.gender, yearStem);
    
    // 3. 2단계: 대운수 계산 (DB 기반 절기 거리)
    const daeunStartAge = await this.calculateDaeunNumber(
      params.year,
      params.month,
      params.day,
      isForward
    );
    
    // 4. 3단계: 월주 기준 대운 간지 생성
    const daeunGanzhiList = this.generateDaeunGanzhi(
      basicSaju.monthPillar.ganzhi,
      isForward
    );
    
    // 5. 대운 정보 객체 생성
    const daeunPeriods: DaeunInfo[] = [];
    let currentAge = daeunStartAge;
    
    for (let i = 0; i < daeunGanzhiList.length; i++) {
      const ganzhi = daeunGanzhiList[i];
      
      const daeunInfo: DaeunInfo = {
        startAge: currentAge,
        endAge: currentAge + 9, // 10년 단위 (예: 3-12세, 13-22세)
        heavenlyStem: this.convertChineseToHeavenlyStem(ganzhi.charAt(0)),
        earthlyBranch: this.convertChineseToEarthlyBranch(ganzhi.charAt(1)),
        ganzhi,
        startYear: params.year + currentAge,
        endYear: params.year + currentAge + 9
      };
      
      daeunPeriods.push(daeunInfo);
      currentAge += 10; // 다음 대운은 10년 후
    }
    
    return {
      daeunStartAge,
      isForward,
      daeunPeriods
    };
  }



  /**
   * 대운 목록을 보기 좋은 형태로 포맷팅
   * @param daeunList 대운 목록
   * @returns 포맷팅된 문자열
   */
  formatDaeunList(daeunList: DaeunList): string {
    const lines = [
      '=== 대운(大運) 목록 ===',
      `대운 시작 나이: ${daeunList.daeunStartAge}세`,
      `대운 방향: ${daeunList.isForward ? '순행(順行)' : '역행(逆行)'}`,
      '',
      '** 대운 기간별 간지 **'
    ];
    
    daeunList.daeunPeriods.forEach((daeun, index) => {
      lines.push(
        `${index + 1}운: ${daeun.startAge}-${daeun.endAge}세 (${daeun.startYear}-${daeun.endYear}년) → ${daeun.ganzhi}`
      );
    });
    
    return lines.join('\n');
  }



  // ==================== 대운 계산 메소드 끝 ====================
}