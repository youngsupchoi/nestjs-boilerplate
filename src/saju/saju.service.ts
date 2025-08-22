import { Injectable } from '@nestjs/common';
import { SajuFromCalendar, SajuExtractionParams } from './interfaces/saju-from-calendar.interface';
import { ComprehensiveSaju, SajuAnalysisOptions } from './interfaces/comprehensive-saju.interface';
import { DaeunList, DaeunInfo } from './interfaces/daeun.interface';
import { DaeunCalculationParams } from './interfaces/daeun-calculation.interface';
import { MonthlyFortune, MonthlyFortuneList } from './interfaces/monthly-fortune.interface';
import { YearlyFortune, YearlyFortuneList } from './interfaces/yearly-fortune.interface';
import { TenStarsInfo } from './interfaces/ten-stars.interface';
import { TwelveLifeStagesInfo } from './interfaces/twelve-life-stages.interface';
import { TwelveSinsalInfo, TwelveSinsalResult, TWELVE_SINSAL_DESCRIPTIONS } from './interfaces/twelve-sinsal.interface';
import { HourPillarUtils } from './utils/hour-pillar.utils';
import { TenStarsUtils } from './utils/ten-stars.utils';
import { HiddenStemsUtils } from './utils/hidden-stems.utils';
import { CalendarDataRepository } from './repositories/calendar-data.repository';
import { HeavenlyStem, HEAVENLY_STEM_INFO } from './enums/heavenly-stem.enum';
import { EarthlyBranch } from './enums/earthly-branch.enum';
import { TenStars } from './enums/ten-stars.enum';
import { TwelveLifeStages } from './enums/twelve-life-stages.enum';
import { Gender } from './enums/gender.enum';
import { TwelveSinsal, SAMHAP_GROUPS, TWELVE_SINSAL_ORDER } from './enums/twelve-sinsal.enum';
import { TwelveLifeStagesUtils } from './utils/twelve-life-stages.utils';
import { SajuHiddenStems, DetailedHiddenStems } from './interfaces/hidden-stems.interface';

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
  convertChineseToEarthlyBranch(chinese: string): EarthlyBranch {
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
   * 사주 팔자에서 지장간을 계산합니다.
   */
  calculateHiddenStems(saju: SajuFromCalendar): SajuHiddenStems {
    try {
      // 각 지지의 지장간을 계산
      const yearBranch = this.convertChineseToEarthlyBranch(saju.yearPillar.earthlyBranch);
      const monthBranch = this.convertChineseToEarthlyBranch(saju.monthPillar.earthlyBranch);
      const dayBranch = this.convertChineseToEarthlyBranch(saju.dayPillar.earthlyBranch);
      const hourBranch = this.convertChineseToEarthlyBranch(saju.hourPillar.earthlyBranch);

      return {
        year: HiddenStemsUtils.getHiddenStems(yearBranch),
        month: HiddenStemsUtils.getHiddenStems(monthBranch),
        day: HiddenStemsUtils.getHiddenStems(dayBranch),
        hour: HiddenStemsUtils.getHiddenStems(hourBranch),
      };
    } catch (error) {
      console.error('지장간 계산 중 오류:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`지장간 계산 중 오류가 발생했습니다: ${errorMessage}`);
    }
  }

  /**
   * 사주 팔자에서 상세한 지장간 정보(일수 포함)를 계산합니다.
   */
  calculateDetailedHiddenStems(saju: SajuFromCalendar): {
    year: DetailedHiddenStems;
    month: DetailedHiddenStems;
    day: DetailedHiddenStems;
    hour: DetailedHiddenStems;
  } {
    try {
      // 각 지지의 상세한 지장간을 계산
      const yearBranch = this.convertChineseToEarthlyBranch(saju.yearPillar.earthlyBranch);
      const monthBranch = this.convertChineseToEarthlyBranch(saju.monthPillar.earthlyBranch);
      const dayBranch = this.convertChineseToEarthlyBranch(saju.dayPillar.earthlyBranch);
      const hourBranch = this.convertChineseToEarthlyBranch(saju.hourPillar.earthlyBranch);

      return {
        year: HiddenStemsUtils.getDetailedHiddenStems(yearBranch),
        month: HiddenStemsUtils.getDetailedHiddenStems(monthBranch),
        day: HiddenStemsUtils.getDetailedHiddenStems(dayBranch),
        hour: HiddenStemsUtils.getDetailedHiddenStems(hourBranch),
      };
    } catch (error) {
      console.error('상세 지장간 계산 중 오류:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`상세 지장간 계산 중 오류가 발생했습니다: ${errorMessage}`);
    }
  }

  /**
   * 십성과 지장간 정보를 포함한 사주 정보를 반환합니다.
   */
  async getSajuWithTenStars(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number = 0,
    isSolar: boolean = true,
    isLeapMonth: boolean = false,
  ): Promise<SajuFromCalendar & { 
    tenStars: TenStarsInfo; 
    hiddenStems: SajuHiddenStems;
    detailedHiddenStems: {
      year: DetailedHiddenStems;
      month: DetailedHiddenStems;
      day: DetailedHiddenStems;
      hour: DetailedHiddenStems;
    };
  }> {
    const basicSaju = await this.getSajuByDateTime(
      year, month, day, hour, minute, isSolar, isLeapMonth
    );
    
    const tenStars = this.calculateTenStars(basicSaju);
    const hiddenStems = this.calculateHiddenStems(basicSaju);
    const detailedHiddenStems = this.calculateDetailedHiddenStems(basicSaju);
    
    return {
      ...basicSaju,
      tenStars,
      hiddenStems,
      detailedHiddenStems,
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

  // ==================== 월운(月運) 계산 관련 메소드 ====================

  /**
   * 월운(月運) 조회
   * 특정 연월의 간지를 조회하여 월운 정보를 반환합니다.
   * 절기 기준으로 월주가 결정되므로, 각 월의 첫 절기가 포함된 날짜를 기준으로 조회합니다.
   * @param year 조회할 연도
   * @param month 조회할 월 (1-12)
   * @returns 월운 정보
   */
  async getMonthlyFortune(year: number, month: number): Promise<MonthlyFortune> {
    if (!this.calendarDataRepository) {
      throw new Error('CalendarDataRepository가 주입되지 않았습니다. 월운 조회 기능을 사용하려면 Repository를 주입해야 합니다.');
    }

    try {
      // 각 월의 중간 시점을 기준으로 조회
      // 절기가 확실히 바뀐 시점을 보장하기 위해 15일을 기준으로 사용
      const referenceDay = 15;
      
      const calendarData = await this.calendarDataRepository.findBySolarDate(year, month, referenceDay);
      
      if (!calendarData) {
        throw new Error(`월운 데이터를 찾을 수 없습니다: ${year}년 ${month}월`);
      }

      return {
        year,
        month,
        monthPillarChinese: calendarData.cd_hmganjee || '',
        monthPillarKorean: calendarData.cd_kmganjee || '',
        solarTerm: calendarData.cd_hterms ? {
          termChinese: calendarData.cd_hterms,
          termKorean: calendarData.cd_kterms || '',
          termTime: calendarData.cd_terms_time || undefined
        } : undefined,
        dateInfo: {
          solarYear: calendarData.cd_sy,
          solarMonth: parseInt(calendarData.cd_sm),
          solarDay: parseInt(calendarData.cd_sd),
          lunarYear: calendarData.cd_ly,
          lunarMonth: parseInt(calendarData.cd_lm),
          lunarDay: parseInt(calendarData.cd_ld)
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`월운 조회 중 오류가 발생했습니다: ${errorMessage}`);
    }
  }

  /**
   * 현재 월부터 시작하는 월운 리스트 조회
   * @param count 조회할 월 수 (기본값: 12개월)
   * @returns 월운 리스트
   */
  async getMonthlyFortuneList(count: number = 12): Promise<MonthlyFortuneList> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-based를 1-based로 변환
    const currentDay = now.getDate();

    const monthlyFortunes: MonthlyFortune[] = [];

    for (let i = 0; i < count; i++) {
      // 현재 월로부터 i개월 후 계산
      const targetDate = new Date(currentYear, currentMonth - 1 + i, 1); // month는 0-based
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth() + 1; // 0-based를 1-based로 변환

      try {
        const fortune = await this.getMonthlyFortune(targetYear, targetMonth);
        monthlyFortunes.push(fortune);
      } catch (error) {
        console.warn(`월운 조회 실패 ${targetYear}년 ${targetMonth}월:`, error);
        // 에러가 발생해도 계속 진행
      }
    }

    return {
      baseDate: {
        year: currentYear,
        month: currentMonth,
        day: currentDay
      },
      totalCount: monthlyFortunes.length,
      monthlyFortunes
    };
  }



  /**
   * 월운 리스트를 보기 좋은 형태로 포맷팅합니다.
   * @param fortuneList 월운 리스트
   * @returns 포맷팅된 문자열
   */
  formatMonthlyFortuneList(fortuneList: MonthlyFortuneList): string {
    const lines = [
      `=== 월운(月運) 리스트 ===`,
      `기준 날짜: ${fortuneList.baseDate.year}년 ${fortuneList.baseDate.month}월 ${fortuneList.baseDate.day}일`,
      `총 ${fortuneList.totalCount}개월`,
      '',
      '** 월별 월운 정보 **'
    ];

    fortuneList.monthlyFortunes.forEach((fortune, index) => {
      lines.push(
        `${index + 1}. ${fortune.year}년 ${fortune.month}월: ${fortune.monthPillarChinese} (${fortune.monthPillarKorean})`
      );
      lines.push(`    └ 조회 기준: ${fortune.dateInfo.solarYear}년 ${fortune.dateInfo.solarMonth}월 ${fortune.dateInfo.solarDay}일`);
      if (fortune.solarTerm) {
        lines.push(`    └ 절기: ${fortune.solarTerm.termChinese} (${fortune.solarTerm.termKorean})`);
      }
    });

    return lines.join('\n');
  }

  // ==================== 월운 계산 메소드 끝 ====================

  // ==================== 연운(年運) 계산 관련 메소드 ====================

  /**
   * 연운(年運) 조회
   * 특정 연도의 간지를 조회하여 연운 정보를 반환합니다.
   * 연운은 입춘 기준으로 바뀌므로, 해당 년도의 3월 1일 데이터를 기준으로 년주 간지를 조회합니다.
   * (1월 1일은 아직 전년도 연운일 수 있기 때문)
   * @param year 조회할 연도
   * @returns 연운 정보
   */
  async getYearlyFortune(year: number): Promise<YearlyFortune> {
    if (!this.calendarDataRepository) {
      throw new Error('CalendarDataRepository가 주입되지 않았습니다. 연운 조회 기능을 사용하려면 Repository를 주입해야 합니다.');
    }

    try {
      // 해당 연도 6월 1일 데이터를 기준으로 년주 간지 조회
      // (입춘이 확실히 지난 중간 시점을 사용하여 정확한 연운 확보)
      const calendarData = await this.calendarDataRepository.findBySolarDate(year, 6, 1);
      
      if (!calendarData) {
        throw new Error(`연운 데이터를 찾을 수 없습니다: ${year}년`);
      }

      return {
        year,
        yearPillarChinese: calendarData.cd_hyganjee || '',
        yearPillarKorean: calendarData.cd_kyganjee || '',
        dateInfo: {
          solarYear: calendarData.cd_sy,
          solarMonth: parseInt(calendarData.cd_sm),
          solarDay: parseInt(calendarData.cd_sd),
          lunarYear: calendarData.cd_ly,
          lunarMonth: parseInt(calendarData.cd_lm),
          lunarDay: parseInt(calendarData.cd_ld)
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`연운 조회 중 오류가 발생했습니다: ${errorMessage}`);
    }
  }

  /**
   * 현재 년부터 시작하는 연운 리스트 조회
   * @param count 조회할 년 수 (기본값: 10년)
   * @returns 연운 리스트
   */
  async getYearlyFortuneList(count: number = 10): Promise<YearlyFortuneList> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-based를 1-based로 변환
    const currentDay = now.getDate();

    const yearlyFortunes: YearlyFortune[] = [];

    for (let i = 0; i < count; i++) {
      const targetYear = currentYear + i;

      try {
        const fortune = await this.getYearlyFortune(targetYear);
        yearlyFortunes.push(fortune);
      } catch (error) {
        console.warn(`연운 조회 실패 ${targetYear}년:`, error);
        // 에러가 발생해도 계속 진행
      }
    }

    return {
      baseDate: {
        year: currentYear,
        month: currentMonth,
        day: currentDay
      },
      totalCount: yearlyFortunes.length,
      yearlyFortunes
    };
  }



  /**
   * 연운 리스트를 보기 좋은 형태로 포맷팅합니다.
   * @param fortuneList 연운 리스트
   * @returns 포맷팅된 문자열
   */
  formatYearlyFortuneList(fortuneList: YearlyFortuneList): string {
    const lines = [
      `=== 연운(年運) 리스트 ===`,
      `기준 날짜: ${fortuneList.baseDate.year}년 ${fortuneList.baseDate.month}월 ${fortuneList.baseDate.day}일`,
      `총 ${fortuneList.totalCount}년`,
      '',
      '** 연별 연운 정보 **'
    ];

    fortuneList.yearlyFortunes.forEach((fortune, index) => {
      lines.push(
        `${index + 1}. ${fortune.year}년: ${fortune.yearPillarChinese} (${fortune.yearPillarKorean})`
      );
      lines.push(`    └ 조회 기준: ${fortune.dateInfo.solarYear}년 ${fortune.dateInfo.solarMonth}월 ${fortune.dateInfo.solarDay}일`);
    });

    return lines.join('\n');
  }

  // ==================== 연운 계산 메소드 끝 ====================

  // ==================== 12운성(十二運星) 계산 관련 메소드 ====================

  /**
   * 사주 팔자에서 12운성을 계산합니다.
   * 일간을 기준으로 각 지지의 12운성을 구합니다.
   * @param saju 사주 정보
   * @returns 12운성 정보
   */
  calculateTwelveLifeStages(saju: SajuFromCalendar): TwelveLifeStagesInfo {
    try {
      // 일간을 기준으로 설정 (일주의 천간)
      const dayMaster = this.convertChineseToHeavenlyStem(saju.dayPillar.heavenlyStem);
      
      // 각 지지의 12운성 계산
      const yearLifeStage = TwelveLifeStagesUtils.calculateLifeStage(
        dayMaster, 
        this.convertChineseToEarthlyBranch(saju.yearPillar.earthlyBranch)
      );
      
      const monthLifeStage = TwelveLifeStagesUtils.calculateLifeStage(
        dayMaster, 
        this.convertChineseToEarthlyBranch(saju.monthPillar.earthlyBranch)
      );
      
      const dayLifeStage = TwelveLifeStagesUtils.calculateLifeStage(
        dayMaster, 
        this.convertChineseToEarthlyBranch(saju.dayPillar.earthlyBranch)
      );
      
      const hourLifeStage = TwelveLifeStagesUtils.calculateLifeStage(
        dayMaster, 
        this.convertChineseToEarthlyBranch(saju.hourPillar.earthlyBranch)
      );

      return {
        year: yearLifeStage,
        month: monthLifeStage,
        day: dayLifeStage,
        hour: hourLifeStage,
      };
    } catch (error) {
      console.error('12운성 계산 중 오류:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`12운성 계산 중 오류가 발생했습니다: ${errorMessage}`);
    }
  }

  /**
   * 특정 일간과 지지로 12운성을 계산하는 유틸리티 메소드
   * @param dayStemChinese 일간 (한자)
   * @param branchChinese 지지 (한자)
   * @returns 12운성
   */
  calculateSingleTwelveLifeStage(dayStemChinese: string, branchChinese: string): TwelveLifeStages {
    try {
      const dayStem = this.convertChineseToHeavenlyStem(dayStemChinese);
      const branch = this.convertChineseToEarthlyBranch(branchChinese);
      
      return TwelveLifeStagesUtils.calculateLifeStage(dayStem, branch);
    } catch (error) {
      console.error('12운성 계산 중 오류:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`12운성 계산 중 오류가 발생했습니다 (일간: ${dayStemChinese}, 지지: ${branchChinese}): ${errorMessage}`);
    }
  }

  /**
   * 12운성과 십성, 지장간 정보를 모두 포함한 사주 정보를 반환합니다.
   */
  async getSajuWithAllAnalysis(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number = 0,
    isSolar: boolean = true,
    isLeapMonth: boolean = false,
  ): Promise<SajuFromCalendar & { 
    tenStars: TenStarsInfo; 
    hiddenStems: SajuHiddenStems;
    twelveLifeStages: TwelveLifeStagesInfo;
  }> {
    const basicSaju = await this.getSajuByDateTime(
      year, month, day, hour, minute, isSolar, isLeapMonth
    );
    
    const tenStars = this.calculateTenStars(basicSaju);
    const hiddenStems = this.calculateHiddenStems(basicSaju);
    const twelveLifeStages = this.calculateTwelveLifeStages(basicSaju);
    
    return {
      ...basicSaju,
      tenStars,
      hiddenStems,
      twelveLifeStages,
    };
  }

  /**
   * 12운성 결과를 보기 좋은 형태로 포맷팅합니다.
   * @param lifeStages 12운성 정보
   * @param saju 사주 정보 (optional, 추가 정보 표시용)
   * @returns 포맷팅된 문자열
   */
  formatTwelveLifeStages(lifeStages: TwelveLifeStagesInfo, saju?: SajuFromCalendar): string {
    const lines = [
      '=== 12운성(十二運星) 분석 ===',
    ];

    if (saju) {
      lines.push(`일간 기준: ${saju.dayPillar.heavenlyStem} (${saju.dayPillar.ganzhiKorean.charAt(0)})`);
      lines.push('');
    }

    lines.push('** 각 지지별 12운성 **');
    
    if (saju) {
      lines.push(`연지 (${saju.yearPillar.earthlyBranch}): ${lifeStages.year} - ${TwelveLifeStagesUtils.getLifeStageMeaning(lifeStages.year)}`);
      lines.push(`월지 (${saju.monthPillar.earthlyBranch}): ${lifeStages.month} - ${TwelveLifeStagesUtils.getLifeStageMeaning(lifeStages.month)}`);
      lines.push(`일지 (${saju.dayPillar.earthlyBranch}): ${lifeStages.day} - ${TwelveLifeStagesUtils.getLifeStageMeaning(lifeStages.day)}`);
      lines.push(`시지 (${saju.hourPillar.earthlyBranch}): ${lifeStages.hour} - ${TwelveLifeStagesUtils.getLifeStageMeaning(lifeStages.hour)}`);
    } else {
      lines.push(`연지: ${lifeStages.year} - ${TwelveLifeStagesUtils.getLifeStageMeaning(lifeStages.year)}`);
      lines.push(`월지: ${lifeStages.month} - ${TwelveLifeStagesUtils.getLifeStageMeaning(lifeStages.month)}`);
      lines.push(`일지: ${lifeStages.day} - ${TwelveLifeStagesUtils.getLifeStageMeaning(lifeStages.day)}`);
      lines.push(`시지: ${lifeStages.hour} - ${TwelveLifeStagesUtils.getLifeStageMeaning(lifeStages.hour)}`);
    }

    return lines.join('\n');
  }

  // ==================== 12운성 계산 메소드 끝 ====================

  // ==================== 12신살 계산 관련 메소드 ====================

  /**
   * 년지(띠)를 기준으로 12신살을 계산합니다.
   * @param yearBranch 년지 (EarthlyBranch enum)
   * @returns 12신살 정보
   */
  calculateTwelveSinsal(yearBranch: EarthlyBranch): TwelveSinsalInfo {
    // 12지 배열 (한글)
    const earthlyBranches = [
      EarthlyBranch.JA,    // 자
      EarthlyBranch.CHUK,  // 축
      EarthlyBranch.IN,    // 인
      EarthlyBranch.MYO,   // 묘
      EarthlyBranch.JIN,   // 진
      EarthlyBranch.SA,    // 사
      EarthlyBranch.O,     // 오
      EarthlyBranch.MI,    // 미
      EarthlyBranch.SHIN,  // 신
      EarthlyBranch.YU,    // 유
      EarthlyBranch.SUL,   // 술
      EarthlyBranch.HAE    // 해
    ];

    // 년지에 따른 삼합 그룹 찾기
    let samhapGroup: string | null = null;
    let jangseonsalBranch: EarthlyBranch | null = null;

    if ([EarthlyBranch.SHIN, EarthlyBranch.JA, EarthlyBranch.JIN].includes(yearBranch)) {
      samhapGroup = '신자진';
      jangseonsalBranch = EarthlyBranch.JA; // 자
    } else if ([EarthlyBranch.HAE, EarthlyBranch.MYO, EarthlyBranch.MI].includes(yearBranch)) {
      samhapGroup = '해묘미';
      jangseonsalBranch = EarthlyBranch.MYO; // 묘
    } else if ([EarthlyBranch.IN, EarthlyBranch.O, EarthlyBranch.SUL].includes(yearBranch)) {
      samhapGroup = '인오술';
      jangseonsalBranch = EarthlyBranch.O; // 오
    } else if ([EarthlyBranch.SA, EarthlyBranch.YU, EarthlyBranch.CHUK].includes(yearBranch)) {
      samhapGroup = '사유축';
      jangseonsalBranch = EarthlyBranch.YU; // 유
    }

    if (!samhapGroup || !jangseonsalBranch) {
      throw new Error(`유효하지 않은 년지입니다: ${yearBranch}`);
    }

    // 장성살 시작 인덱스 찾기
    const startIndex = earthlyBranches.indexOf(jangseonsalBranch);
    
    if (startIndex === -1) {
      throw new Error(`장성살 지지를 찾을 수 없습니다: ${jangseonsalBranch}`);
    }

    // 12신살 매핑 생성
    const sinsalMapping: Record<EarthlyBranch, TwelveSinsal> = {} as Record<EarthlyBranch, TwelveSinsal>;
    
    for (let i = 0; i < 12; i++) {
      const branchIndex = (startIndex + i) % 12;
      const branch = earthlyBranches[branchIndex];
      const sinsal = TWELVE_SINSAL_ORDER[i];
      sinsalMapping[branch] = sinsal;
    }

    // 년지별 한자 매핑
    const branchChineseMap: Record<EarthlyBranch, string> = {
      [EarthlyBranch.JA]: '子',
      [EarthlyBranch.CHUK]: '丑', 
      [EarthlyBranch.IN]: '寅',
      [EarthlyBranch.MYO]: '卯',
      [EarthlyBranch.JIN]: '辰',
      [EarthlyBranch.SA]: '巳',
      [EarthlyBranch.O]: '午',
      [EarthlyBranch.MI]: '未',
      [EarthlyBranch.SHIN]: '申',
      [EarthlyBranch.YU]: '酉',
      [EarthlyBranch.SUL]: '戌',
      [EarthlyBranch.HAE]: '亥'
    };

    return {
      yearBranch,
      yearBranchKorean: yearBranch,
      yearBranchChinese: branchChineseMap[yearBranch],
      samhapGroup,
      jangseonsalBranch,
      sinsalMapping
    };
  }

  /**
   * 12신살 계산 결과를 완전한 형태로 반환합니다.
   * @param yearBranch 년지 (EarthlyBranch enum)
   * @returns 완전한 12신살 결과
   */
  calculateTwelveSinsalResult(yearBranch: EarthlyBranch): TwelveSinsalResult {
    const sinsalInfo = this.calculateTwelveSinsal(yearBranch);
    
    // 신살별 해당 지지들 그룹핑
    const sinsalByType: Record<TwelveSinsal, EarthlyBranch[]> = {} as Record<TwelveSinsal, EarthlyBranch[]>;
    
    // 초기화
    TWELVE_SINSAL_ORDER.forEach(sinsal => {
      sinsalByType[sinsal] = [];
    });
    
    // 매핑
    Object.entries(sinsalInfo.sinsalMapping).forEach(([branchKey, sinsal]) => {
      const branch = branchKey as EarthlyBranch;
      sinsalByType[sinsal].push(branch);
    });

    // 지지별 신살 설명
    const descriptions: Record<EarthlyBranch, { sinsal: TwelveSinsal; description: string }> = {} as Record<EarthlyBranch, { sinsal: TwelveSinsal; description: string }>;
    
    Object.entries(sinsalInfo.sinsalMapping).forEach(([branchKey, sinsal]) => {
      const branch = branchKey as EarthlyBranch;
      descriptions[branch] = {
        sinsal,
        description: TWELVE_SINSAL_DESCRIPTIONS[sinsal]
      };
    });

    return {
      sinsalInfo,
      sinsalByType,
      descriptions
    };
  }

  /**
   * 사주로부터 각 지지별 12신살을 계산합니다.
   * @param saju 사주 정보
   * @returns 각 지지별 12신살 결과
   */
  calculateTwelveSinsalFromSaju(saju: SajuFromCalendar): {
    year: TwelveSinsalResult;
    month: TwelveSinsalResult;
    day: TwelveSinsalResult;
    hour: TwelveSinsalResult;
  } {
    const yearBranch = this.convertChineseToEarthlyBranch(saju.yearPillar.earthlyBranch);
    const monthBranch = this.convertChineseToEarthlyBranch(saju.monthPillar.earthlyBranch);
    const dayBranch = this.convertChineseToEarthlyBranch(saju.dayPillar.earthlyBranch);
    const hourBranch = this.convertChineseToEarthlyBranch(saju.hourPillar.earthlyBranch);

    return {
      year: this.calculateTwelveSinsalResult(yearBranch),
      month: this.calculateTwelveSinsalResult(monthBranch),
      day: this.calculateTwelveSinsalResult(dayBranch),
      hour: this.calculateTwelveSinsalResult(hourBranch),
    };
  }

  /**
   * 12신살 결과를 보기 좋은 형태로 포맷팅합니다.
   * @param result 12신살 결과
   * @returns 포맷팅된 문자열
   */
  formatTwelveSinsalResult(result: TwelveSinsalResult): string {
    const { sinsalInfo, sinsalByType, descriptions } = result;
    
    const lines = [
      '=== 12신살 계산 결과 ===',
      `기준지: ${sinsalInfo.yearBranchChinese} (${sinsalInfo.yearBranchKorean})`,
      `삼합 그룹: ${sinsalInfo.samhapGroup}`,
      `장성살 위치: ${sinsalInfo.jangseonsalBranch}`,
      '',
      '=== 지지별 신살 정보 ===',
    ];

    // 12지 순서대로 정렬하여 출력
    const earthlyBranches = [
      EarthlyBranch.JA, EarthlyBranch.CHUK, EarthlyBranch.IN, EarthlyBranch.MYO,
      EarthlyBranch.JIN, EarthlyBranch.SA, EarthlyBranch.O, EarthlyBranch.MI,
      EarthlyBranch.SHIN, EarthlyBranch.YU, EarthlyBranch.SUL, EarthlyBranch.HAE
    ];

    earthlyBranches.forEach(branch => {
      const info = descriptions[branch];
      if (info) {
        lines.push(`${branch}: ${info.sinsal} - ${info.description}`);
      }
    });

    lines.push('');
    lines.push('=== 신살별 해당 지지 ===');

    TWELVE_SINSAL_ORDER.forEach(sinsal => {
      const branches = sinsalByType[sinsal];
      if (branches.length > 0) {
        lines.push(`${sinsal}: ${branches.join(', ')}`);
      }
    });

    return lines.join('\n');
  }

  /**
   * 각 지지별 12신살 결과를 보기 좋은 형태로 포맷팅합니다.
   * @param results 각 지지별 12신살 결과
   * @param saju 사주 정보 (선택사항)
   * @returns 포맷팅된 문자열
   */
  formatAllTwelveSinsalResults(results: {
    year: TwelveSinsalResult;
    month: TwelveSinsalResult;
    day: TwelveSinsalResult;
    hour: TwelveSinsalResult;
  }, saju?: SajuFromCalendar): string {
    const lines = [
      '=== 사주 12신살 종합 분석 ===',
    ];

    if (saju) {
      lines.push(`사주: ${saju.yearPillar.ganzhi} ${saju.monthPillar.ganzhi} ${saju.dayPillar.ganzhi} ${saju.hourPillar.ganzhi}`);
      lines.push('');
    }

    // 각 지지에서 나타나는 신살들
    const branchChineseMap: Record<EarthlyBranch, string> = {
      [EarthlyBranch.JA]: '子', [EarthlyBranch.CHUK]: '丑', [EarthlyBranch.IN]: '寅', [EarthlyBranch.MYO]: '卯',
      [EarthlyBranch.JIN]: '辰', [EarthlyBranch.SA]: '巳', [EarthlyBranch.O]: '午', [EarthlyBranch.MI]: '未',
      [EarthlyBranch.SHIN]: '申', [EarthlyBranch.YU]: '酉', [EarthlyBranch.SUL]: '戌', [EarthlyBranch.HAE]: '亥'
    };

    // 각 기둥별 신살 정보
    if (saju) {
      const yearBranch = this.convertChineseToEarthlyBranch(saju.yearPillar.earthlyBranch);
      const monthBranch = this.convertChineseToEarthlyBranch(saju.monthPillar.earthlyBranch);
      const dayBranch = this.convertChineseToEarthlyBranch(saju.dayPillar.earthlyBranch);
      const hourBranch = this.convertChineseToEarthlyBranch(saju.hourPillar.earthlyBranch);

      lines.push('=== 각 기둥에서 받는 신살 ===');
      lines.push(`연주 ${saju.yearPillar.ganzhi}: ${this.getBranchSinsalInfo(yearBranch, results)}`);
      lines.push(`월주 ${saju.monthPillar.ganzhi}: ${this.getBranchSinsalInfo(monthBranch, results)}`);
      lines.push(`일주 ${saju.dayPillar.ganzhi}: ${this.getBranchSinsalInfo(dayBranch, results)}`);
      lines.push(`시주 ${saju.hourPillar.ganzhi}: ${this.getBranchSinsalInfo(hourBranch, results)}`);
      lines.push('');
    }

    // 각 지지 기준별 상세 정보
    lines.push('=== 지지별 12신살 상세 ===');
    
    if (saju) {
      lines.push(`\n** 연지 (${saju.yearPillar.earthlyBranch}) 기준 **`);
      lines.push(this.formatTwelveSinsalResult(results.year).replace('=== 12신살 계산 결과 ===\n', ''));
      
      lines.push(`\n** 월지 (${saju.monthPillar.earthlyBranch}) 기준 **`);
      lines.push(this.formatTwelveSinsalResult(results.month).replace('=== 12신살 계산 결과 ===\n', ''));
      
      lines.push(`\n** 일지 (${saju.dayPillar.earthlyBranch}) 기준 **`);
      lines.push(this.formatTwelveSinsalResult(results.day).replace('=== 12신살 계산 결과 ===\n', ''));
      
      lines.push(`\n** 시지 (${saju.hourPillar.earthlyBranch}) 기준 **`);
      lines.push(this.formatTwelveSinsalResult(results.hour).replace('=== 12신살 계산 결과 ===\n', ''));
    }

    return lines.join('\n');
  }

  /**
   * 특정 지지가 각 기준에서 받는 신살 정보를 가져옵니다.
   */
  private getBranchSinsalInfo(targetBranch: EarthlyBranch, results: {
    year: TwelveSinsalResult;
    month: TwelveSinsalResult;
    day: TwelveSinsalResult;
    hour: TwelveSinsalResult;
  }): string {
    const sinsals: string[] = [];

    // 연지 기준에서 받는 신살
    const yearSinsal = results.year.descriptions[targetBranch];
    if (yearSinsal) {
      sinsals.push(`연지 기준: ${yearSinsal.sinsal}`);
    }

    // 월지 기준에서 받는 신살
    const monthSinsal = results.month.descriptions[targetBranch];
    if (monthSinsal) {
      sinsals.push(`월지 기준: ${monthSinsal.sinsal}`);
    }

    // 일지 기준에서 받는 신살
    const daySinsal = results.day.descriptions[targetBranch];
    if (daySinsal) {
      sinsals.push(`일지 기준: ${daySinsal.sinsal}`);
    }

    // 시지 기준에서 받는 신살
    const hourSinsal = results.hour.descriptions[targetBranch];
    if (hourSinsal) {
      sinsals.push(`시지 기준: ${hourSinsal.sinsal}`);
    }

    return sinsals.length > 0 ? sinsals.join(' | ') : '해당 없음';
  }

  // ==================== 12신살 계산 메소드 끝 ====================
}