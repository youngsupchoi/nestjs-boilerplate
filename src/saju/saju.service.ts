import { Injectable } from '@nestjs/common';
import { HeavenlyStem, EarthlyBranch, Gender, TenStars, TwelveLifeStages, TwelveSpirits } from './enums';
import { 
  UserBirthInfo, 
  SajuPillars, 
  EightCharacters,
  DaeunInfo,
  DaeunList,
  CurrentDaeun,
  SaeunInfo,
  SaeunList,
  CurrentSaeun,
  TenStarsInfo,
  SajuHiddenStems,
  TwelveLifeStagesInfo,
  TwelveSpiritsInfo,
  TimeCorrection
} from './interfaces';
import { SajuFromCalendar, SajuExtractionParams } from './interfaces/saju-from-calendar.interface';
import { ComprehensiveSaju, SajuAnalysisOptions } from './interfaces/comprehensive-saju.interface';
import { 
  HeavenlyStemUtils, 
  EarthlyBranchUtils, 
  TenStarsUtils, 
  HiddenStemsUtils,
  TwelveLifeStagesUtils,
  TwelveSpiritsUtils,
  TimeCorrectionUtils,
  SolarTermsUtils
} from './utils';
import { HourPillarUtils } from './utils/hour-pillar.utils';
import { CalendarDataRepository } from './repositories/calendar-data.repository';

@Injectable()
export class SajuService {
  constructor(
    private readonly calendarDataRepository?: CalendarDataRepository,
  ) {}

  // 기준일: 1999년 12월 14일 KST = 경자(庚子)일
  private readonly MODERN_BASE_DATE_KST = new Date('1999-12-14T00:00:00+09:00');
  private readonly MODERN_BASE_STEM_INDEX = 6; // 경(庚)
  private readonly MODERN_BASE_BRANCH_INDEX = 0; // 자(子)

  // 십간 배열
  private readonly HEAVENLY_STEMS = [
    HeavenlyStem.GAP,      // 갑
    HeavenlyStem.EUL,      // 을
    HeavenlyStem.BYEONG,   // 병
    HeavenlyStem.JEONG,    // 정
    HeavenlyStem.MU,       // 무
    HeavenlyStem.GI,       // 기
    HeavenlyStem.GYEONG,   // 경
    HeavenlyStem.SIN,      // 신
    HeavenlyStem.IM,       // 임
    HeavenlyStem.GYE,      // 계
  ];

  // 십이지 배열
  private readonly EARTHLY_BRANCHES = [
    EarthlyBranch.JA,      // 자
    EarthlyBranch.CHUK,    // 축
    EarthlyBranch.IN,      // 인
    EarthlyBranch.MYO,     // 묘
    EarthlyBranch.JIN,     // 진
    EarthlyBranch.SA,      // 사
    EarthlyBranch.O,       // 오
    EarthlyBranch.MI,      // 미
    EarthlyBranch.SHIN,    // 신
    EarthlyBranch.YU,      // 유
    EarthlyBranch.SUL,     // 술
    EarthlyBranch.HAE,     // 해
  ];

  // 월지 배열 (정월=인월부터 시작)
  private readonly MONTH_BRANCHES = [
    EarthlyBranch.IN,   // 1월 (정월)
    EarthlyBranch.MYO,  // 2월
    EarthlyBranch.JIN,  // 3월
    EarthlyBranch.SA,   // 4월
    EarthlyBranch.O,    // 5월
    EarthlyBranch.MI,   // 6월
    EarthlyBranch.SHIN, // 7월
    EarthlyBranch.YU,   // 8월
    EarthlyBranch.SUL,  // 9월
    EarthlyBranch.HAE,  // 10월
    EarthlyBranch.JA,   // 11월
    EarthlyBranch.CHUK, // 12월
  ];

  /**
   * 사용자 정보를 받아 8개 한자(사주)를 계산합니다.
   * @param userInfo 사용자 생년월일시 정보
   * @returns 8개 한자 정보
   */
  calculateEightCharacters(userInfo: UserBirthInfo): EightCharacters {
    const pillars = this.calculateSajuPillars(userInfo);
    
    return {
      heavenlyStems: [
        pillars.year.heavenlyStem,
        pillars.month.heavenlyStem,
        pillars.day.heavenlyStem,
        pillars.hour.heavenlyStem,
      ],
      earthlyBranches: [
        pillars.year.earthlyBranch,
        pillars.month.earthlyBranch,
        pillars.day.earthlyBranch,
        pillars.hour.earthlyBranch,
      ],
      ganzhiCombinations: [
        pillars.year.ganzhi,
        pillars.month.ganzhi,
        pillars.day.ganzhi,
        pillars.hour.ganzhi,
      ],
    };
  }

  /**
   * 사주 4개 기둥을 계산합니다.
   * @param userInfo 사용자 생년월일시 정보
   * @returns 사주 기둥 정보
   */
  calculateSajuPillars(userInfo: UserBirthInfo): SajuPillars {
    const birthDate = userInfo.birthDateTime;
    
    // 시간대 처리: 한국 표준시(KST) 기준으로 통일
    // 사주는 한국 전통 명리학이므로 KST 기준으로 계산
    const kstOffset = 9 * 60; // KST는 UTC+9
    const localOffset = birthDate.getTimezoneOffset();
    const kstDate = new Date(birthDate.getTime() + (kstOffset + localOffset) * 60 * 1000);
    
    // 양력 변환 (음력인 경우 양력으로 변환 - 간단한 근사치 사용)
    const solarDate = userInfo.isSolar ? kstDate : this.convertLunarToSolar(kstDate);
    
    // 각 기둥 계산
    const yearPillar = this.calculateYearPillar(solarDate);
    const monthPillar = this.calculateMonthPillar(solarDate, yearPillar.heavenlyStem);
    const dayPillar = this.calculateDayPillar(solarDate);
    const hourPillar = this.calculateHourPillar(solarDate, dayPillar.heavenlyStem);

    return {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
    };
  }

  /**
   * 년주 계산 (절기 기준) - 수정된 알고리즘
   */
  private calculateYearPillar(date: Date) {
    const sajuYear = SolarTermsUtils.getSajuYear(date);

    // 1984년 갑자년을 기준으로 계산
    const baseYear = 1984; // 갑자년
    const yearDiff = sajuYear - baseYear;

    const stemIndex = (yearDiff % 10 + 10) % 10; // 0: 갑, 1: 을 ...
    const branchIndex = (yearDiff % 12 + 12) % 12; // 0: 자, 1: 축 ...

    const heavenlyStem = this.HEAVENLY_STEMS[stemIndex];
    const earthlyBranch = this.EARTHLY_BRANCHES[branchIndex];

    return {
      heavenlyStem,
      earthlyBranch,
      ganzhi: `${heavenlyStem}${earthlyBranch}`,
    };
  }

  /**
   * 월주 계산 (절기 기준)
   */
  private calculateMonthPillar(date: Date, yearStem: HeavenlyStem) {
    // 절기 기준으로 정확한 사주 월 계산
    const sajuMonth = SolarTermsUtils.getSajuMonth(date);
    const earthlyBranch = this.MONTH_BRANCHES[sajuMonth];

    // 년간에 따른 월간 계산
    const yearStemIndex = this.HEAVENLY_STEMS.indexOf(yearStem);
    let monthStemIndex: number;

    // 갑기년, 을경년, 병신년, 정임년, 무계년의 정월 천간 계산
    if (yearStemIndex === 0 || yearStemIndex === 5) { // 갑년, 기년
      monthStemIndex = 2; // 정월이 병인
    } else if (yearStemIndex === 1 || yearStemIndex === 6) { // 을년, 경년
      monthStemIndex = 4; // 정월이 무인
    } else if (yearStemIndex === 2 || yearStemIndex === 7) { // 병년, 신년
      monthStemIndex = 6; // 정월이 경인
    } else if (yearStemIndex === 3 || yearStemIndex === 8) { // 정년, 임년
      monthStemIndex = 8; // 정월이 임인
    } else { // 무년, 계년
      monthStemIndex = 0; // 정월이 갑인
    }

    // 절기 기준 월에 따라 천간 조정
    monthStemIndex = (monthStemIndex + sajuMonth) % 10;
    const heavenlyStem = this.HEAVENLY_STEMS[monthStemIndex];

    return {
      heavenlyStem,
      earthlyBranch,
      ganzhi: `${heavenlyStem}${earthlyBranch}`,
    };
  }

  /**
   * 율리우스일(Julian Day Number)을 계산하는 헬퍼 함수
   * @param year 년
   * @param month 월 (1-12)
   * @param day 일
   * @returns JDN
   */
  private getJDN(year: number, month: number, day: number): number {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    const jdn =
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045;
    return jdn;
  }

  /**
   * 일주 계산 (야자시 로직 적용) - JDN 기반 최종 알고리즘
   */
  private calculateDayPillar(date: Date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1; // 1-12
    let day = date.getDate();

    // 야자시(23시 이후) 처리: 날짜를 하루 증가시킵니다.
    if (date.getHours() >= 23) {
      // Date 객체는 시간대 문제로 불안정하므로, 날짜를 수동으로 계산합니다.
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day + 1 > daysInMonth) {
        day = 1;
        if (month + 1 > 12) {
          month = 1;
          year = year + 1;
        } else {
          month = month + 1;
        }
      } else {
        day = day + 1;
      }
    }

    // 기준일: 1999년 12월 14일 = 경자(庚子)일 (검증된 데이터)
    const baseJDN = this.getJDN(1999, 12, 14);
    const baseStem = 6; // 庚
    const baseBranch = 0; // 子

    const targetJDN = this.getJDN(year, month, day);
    const daysDiff = targetJDN - baseJDN;

    const stemIndex = (baseStem + daysDiff) % 10;
    const branchIndex = (baseBranch + daysDiff) % 12;

    const finalStemIndex = (stemIndex + 10) % 10;
    const finalBranchIndex = (branchIndex + 12) % 12;
    
    const heavenlyStem = this.HEAVENLY_STEMS[finalStemIndex];
    const earthlyBranch = this.EARTHLY_BRANCHES[finalBranchIndex];

    return {
      heavenlyStem,
      earthlyBranch,
      ganzhi: `${heavenlyStem}${earthlyBranch}`,
    };
  }

  /**
   * 시주 계산
   */
  private calculateHourPillar(date: Date, dayStem: HeavenlyStem) {
    const hour = date.getHours();
    
    // 시지 계산 (23-1시:자, 1-3시:축, ...)
    let branchIndex: number;
    if (hour >= 23 || hour < 1) branchIndex = 0; // 자시
    else branchIndex = Math.floor((hour + 1) / 2);

    const earthlyBranch = this.EARTHLY_BRANCHES[branchIndex];

    // 일간에 따른 시간 천간 계산
    const dayStemIndex = this.HEAVENLY_STEMS.indexOf(dayStem);
    let hourStemIndex: number;

    // 갑기일, 을경일, 병신일, 정임일, 무계일의 자시 천간 계산
    if (dayStemIndex === 0 || dayStemIndex === 5) { // 갑일, 기일
      hourStemIndex = 0; // 자시가 갑자
    } else if (dayStemIndex === 1 || dayStemIndex === 6) { // 을일, 경일
      hourStemIndex = 2; // 자시가 병자
    } else if (dayStemIndex === 2 || dayStemIndex === 7) { // 병일, 신일
      hourStemIndex = 4; // 자시가 무자
    } else if (dayStemIndex === 3 || dayStemIndex === 8) { // 정일, 임일
      hourStemIndex = 6; // 자시가 경자
    } else { // 무일, 계일
      hourStemIndex = 8; // 자시가 임자
    }

    // 시지에 따라 천간 조정
    hourStemIndex = (hourStemIndex + branchIndex) % 10;
    const heavenlyStem = this.HEAVENLY_STEMS[hourStemIndex];

    return {
      heavenlyStem,
      earthlyBranch,
      ganzhi: `${heavenlyStem}${earthlyBranch}`,
    };
  }

  /**
   * 음력을 양력으로 변환 (간단한 근사치)
   * 실제로는 정확한 음양력 변환 라이브러리를 사용해야 합니다.
   */
  private convertLunarToSolar(lunarDate: Date): Date {
    // 간단한 근사치: 음력은 양력보다 평균 11일 정도 빠름
    const approximateDays = 11;
    return new Date(lunarDate.getTime() + approximateDays * 24 * 60 * 60 * 1000);
  }

  /**
   * 간지 조합을 문자열로 변환
   */
  formatGanzhi(stem: HeavenlyStem, branch: EarthlyBranch): string {
    return `${stem}${branch}`;
  }

  /**
   * 8개 한자를 보기 좋은 형태로 출력
   */
  formatEightCharacters(eightChars: EightCharacters): string {
    const { heavenlyStems, earthlyBranches } = eightChars;
    
    return [
      `년주: ${heavenlyStems[0]}${earthlyBranches[0]}`,
      `월주: ${heavenlyStems[1]}${earthlyBranches[1]}`,
      `일주: ${heavenlyStems[2]}${earthlyBranches[2]}`,
      `시주: ${heavenlyStems[3]}${earthlyBranches[3]}`,
    ].join(' | ');
  }

  // ============ 대운(大運) 관련 메서드 ============

  /**
   * 대운 목록을 계산합니다.
   * @param userInfo 사용자 생년월일시 정보
   * @param maxAge 계산할 최대 나이 (기본값: 100세)
   * @returns 대운 목록
   */
  calculateDaeunList(userInfo: UserBirthInfo, maxAge: number = 100): DaeunList {
    const pillars = this.calculateSajuPillars(userInfo);
    const birthDate = userInfo.birthDateTime;
    
    // 대운 시작 나이 계산
    const daeunStartAge = this.calculateDaeunStartAge(userInfo, pillars);
    
    // 순행/역행 판단 (양간양년, 음간음년 = 순행 / 양간음년, 음간양년 = 역행)
    const yearStemIndex = this.HEAVENLY_STEMS.indexOf(pillars.year.heavenlyStem);
    const yearBranchIndex = this.EARTHLY_BRANCHES.indexOf(pillars.year.earthlyBranch);
    const isYangStem = yearStemIndex % 2 === 0; // 갑, 병, 무, 경, 임 = 양간
    const isYangBranch = yearBranchIndex % 2 === 0; // 자, 인, 진, 오, 신, 술 = 양지
    const isYangYear = isYangStem && isYangBranch;
    const isYinYear = !isYangStem && !isYangBranch;
    
    let isForward: boolean;
    if (userInfo.gender === Gender.MALE) {
      isForward = isYangYear || isYinYear; // 남성: 양간양년, 음간음년 = 순행
    } else {
      isForward = !(isYangYear || isYinYear); // 여성: 양간음년, 음간양년 = 순행
    }

    // 월주를 기준으로 대운 계산
    const monthStemIndex = this.HEAVENLY_STEMS.indexOf(pillars.month.heavenlyStem);
    const monthBranchIndex = this.EARTHLY_BRANCHES.indexOf(pillars.month.earthlyBranch);
    
    const daeunPeriods: DaeunInfo[] = [];
    const birthYear = birthDate.getFullYear();
    
    for (let period = 0; period * 10 < maxAge - daeunStartAge; period++) {
      const startAge = daeunStartAge + (period * 10);
      const endAge = Math.min(startAge + 9, maxAge);
      
      // 순행/역행에 따른 간지 계산
      const direction = isForward ? 1 : -1;
      const stemIndex = (monthStemIndex + (direction * (period + 1)) + 10) % 10;
      const branchIndex = (monthBranchIndex + (direction * (period + 1)) + 12) % 12;
      
      const heavenlyStem = this.HEAVENLY_STEMS[stemIndex];
      const earthlyBranch = this.EARTHLY_BRANCHES[branchIndex];
      
      daeunPeriods.push({
        startAge,
        endAge,
        heavenlyStem,
        earthlyBranch,
        ganzhi: `${heavenlyStem}${earthlyBranch}`,
        startYear: birthYear + startAge,
        endYear: birthYear + endAge,
      });
    }
    
    return {
      daeunStartAge,
      isForward,
      daeunPeriods,
    };
  }

  /**
   * 특정 나이의 대운을 구합니다.
   * @param userInfo 사용자 생년월일시 정보
   * @param age 나이
   * @returns 현재 대운 정보
   */
  getCurrentDaeun(userInfo: UserBirthInfo, age: number): CurrentDaeun | null {
    const daeunList = this.calculateDaeunList(userInfo);
    
    const currentDaeun = daeunList.daeunPeriods.find(
      daeun => age >= daeun.startAge && age <= daeun.endAge
    );
    
    if (!currentDaeun) {
      return null;
    }
    
    return {
      currentAge: age,
      daeun: currentDaeun,
      yearsInDaeun: age - currentDaeun.startAge + 1,
    };
  }

  /**
   * 대운 시작 나이를 계산합니다.
   * @param userInfo 사용자 생년월일시 정보
   * @param pillars 사주 기둥 정보
   * @returns 대운 시작 나이
   */
  private calculateDaeunStartAge(userInfo: UserBirthInfo, pillars: SajuPillars): number {
    const birthDate = userInfo.birthDateTime;
    const birthMonth = birthDate.getMonth() + 1;
    const birthDay = birthDate.getDate();
    
    // 간단한 대운 시작 나이 계산 (실제로는 더 정확한 계산 필요)
    // 일반적으로 3~8세 사이에서 시작
    let startAge = 3;
    
    // 생월과 절기를 고려한 대략적인 계산
    if (birthMonth <= 2) {
      startAge = 8;
    } else if (birthMonth <= 4) {
      startAge = 6;
    } else if (birthMonth <= 6) {
      startAge = 4;
    } else if (birthMonth <= 8) {
      startAge = 3;
    } else if (birthMonth <= 10) {
      startAge = 5;
    } else {
      startAge = 7;
    }
    
    return startAge;
  }

  // ============ 세운(歲運) 관련 메서드 ============

  /**
   * 세운 목록을 계산합니다.
   * @param userInfo 사용자 생년월일시 정보
   * @param startYear 시작 년도
   * @param endYear 종료 년도
   * @returns 세운 목록
   */
  calculateSaeunList(userInfo: UserBirthInfo, startYear: number, endYear: number): SaeunList {
    const birthYear = userInfo.birthDateTime.getFullYear();
    const saeunPeriods: SaeunInfo[] = [];
    
    for (let year = startYear; year <= endYear; year++) {
      const age = year - birthYear + 1;
      const saeun = this.calculateYearSaeun(year);
      
      saeunPeriods.push({
        year,
        age,
        heavenlyStem: saeun.heavenlyStem,
        earthlyBranch: saeun.earthlyBranch,
        ganzhi: saeun.ganzhi,
      });
    }
    
    return {
      startYear,
      endYear,
      saeunPeriods,
    };
  }

  /**
   * 특정 년도의 세운을 구합니다.
   * @param userInfo 사용자 생년월일시 정보
   * @param year 년도
   * @returns 현재 세운 정보
   */
  getCurrentSaeun(userInfo: UserBirthInfo, year: number): CurrentSaeun {
    const birthYear = userInfo.birthDateTime.getFullYear();
    const age = year - birthYear + 1;
    const saeun = this.calculateYearSaeun(year);
    
    return {
      currentYear: year,
      currentAge: age,
      saeun: {
        year,
        age,
        heavenlyStem: saeun.heavenlyStem,
        earthlyBranch: saeun.earthlyBranch,
        ganzhi: saeun.ganzhi,
      },
    };
  }

  /**
   * 특정 년도의 간지를 계산합니다.
   * @param year 년도
   * @returns 해당 년도의 간지
   */
  private calculateYearSaeun(year: number) {
    // 1900년 기준으로 계산 (1900년 = 경자년)
    const yearDiff = year - 1900;
    const stemIndex = (this.MODERN_BASE_STEM_INDEX + yearDiff) % 10;
    const branchIndex = (this.MODERN_BASE_BRANCH_INDEX + yearDiff) % 12;

    // 음수 처리
    const finalStemIndex = stemIndex < 0 ? stemIndex + 10 : stemIndex;
    const finalBranchIndex = branchIndex < 0 ? branchIndex + 12 : branchIndex;

    const heavenlyStem = this.HEAVENLY_STEMS[finalStemIndex];
    const earthlyBranch = this.EARTHLY_BRANCHES[finalBranchIndex];

    return {
      heavenlyStem,
      earthlyBranch,
      ganzhi: `${heavenlyStem}${earthlyBranch}`,
    };
  }

  /**
   * 대운 정보를 보기 좋은 형태로 출력
   */
  formatDaeunList(daeunList: DaeunList): string {
    const direction = daeunList.isForward ? '순행' : '역행';
    const header = `대운 시작: ${daeunList.daeunStartAge}세 (${direction})`;
    
    const periods = daeunList.daeunPeriods.map(daeun => 
      `${daeun.startAge}-${daeun.endAge}세: ${daeun.ganzhi} (${daeun.startYear}-${daeun.endYear}년)`
    ).join('\n');
    
    return `${header}\n${periods}`;
  }

  /**
   * 세운 정보를 보기 좋은 형태로 출력
   */
  formatSaeunList(saeunList: SaeunList): string {
    const header = `세운 (${saeunList.startYear}-${saeunList.endYear}년)`;
    
    const periods = saeunList.saeunPeriods.map(saeun => 
      `${saeun.year}년 (${saeun.age}세): ${saeun.ganzhi}`
    ).join('\n');
    
    return `${header}\n${periods}`;
  }

  // ============ 천간 분석 관련 메서드 ============

  /**
   * 천간의 상세 정보를 가져옵니다.
   */
  getHeavenlyStemInfo(stem: HeavenlyStem): string {
    return HeavenlyStemUtils.formatStemInfo(stem);
  }

  /**
   * 사주의 천간들을 분석합니다.
   */
  analyzeSajuStems(userInfo: UserBirthInfo): string {
    const eightChars = this.calculateEightCharacters(userInfo);
    const stems = eightChars.heavenlyStems;
    
    const analysis = [
      '=== 사주 천간 분석 ===',
      `일간(본인): ${this.getHeavenlyStemInfo(stems[2])}`,
      '',
      `년간(조상/부모): ${HeavenlyStemUtils.getDescription(stems[0])} (${HeavenlyStemUtils.isYang(stems[0]) ? '양' : '음'}${HeavenlyStemUtils.getElement(stems[0])})`,
      `월간(형제/동료): ${HeavenlyStemUtils.getDescription(stems[1])} (${HeavenlyStemUtils.isYang(stems[1]) ? '양' : '음'}${HeavenlyStemUtils.getElement(stems[1])})`,
      `시간(자녀/부하): ${HeavenlyStemUtils.getDescription(stems[3])} (${HeavenlyStemUtils.isYang(stems[3]) ? '양' : '음'}${HeavenlyStemUtils.getElement(stems[3])})`
    ];
    
    return analysis.join('\n');
  }

  /**
   * 사주의 오행 분포를 분석합니다.
   */
  analyzeElementDistribution(userInfo: UserBirthInfo): string {
    const eightChars = this.calculateEightCharacters(userInfo);
    const stems = eightChars.heavenlyStems;
    
    // 오행별 개수 계산
    const elementCount = new Map();
    stems.forEach(stem => {
      const element = HeavenlyStemUtils.getElement(stem);
      elementCount.set(element, (elementCount.get(element) || 0) + 1);
    });
    
    const analysis = [
      '=== 천간 오행 분포 ===',
      ...Array.from(elementCount.entries()).map(([element, count]) => 
        `${element}: ${count}개`
      ),
      '',
      '=== 오행 특성 ===',
      ...Array.from(elementCount.entries()).map(([element, count]) => {
        const intensity = count >= 3 ? '매우 강함' : count === 2 ? '강함' : '보통';
        return `${element} (${intensity}): ${this.getElementCharacteristic(element)}`;
      })
    ];
    
    return analysis.join('\n');
  }

  /**
   * 음양 분포를 분석합니다.
   */
  analyzeYinYangDistribution(userInfo: UserBirthInfo): string {
    const eightChars = this.calculateEightCharacters(userInfo);
    const stems = eightChars.heavenlyStems;
    
    const yangCount = stems.filter(stem => HeavenlyStemUtils.isYang(stem)).length;
    const yinCount = 4 - yangCount;
    
    let balance = '';
    if (yangCount > yinCount) {
      balance = '양기가 강함 - 적극적이고 외향적인 성향';
    } else if (yinCount > yangCount) {
      balance = '음기가 강함 - 차분하고 내성적인 성향';
    } else {
      balance = '음양이 균형잡힘 - 조화로운 성격';
    }
    
    return [
      '=== 천간 음양 분포 ===',
      `양간: ${yangCount}개`,
      `음간: ${yinCount}개`,
      `특성: ${balance}`
    ].join('\n');
  }

  /**
   * 오행별 특성 설명을 가져옵니다.
   */
  private getElementCharacteristic(element: string): string {
    const characteristics: Record<string, string> = {
      '목': '성장과 발전을 추구, 창의적이고 진취적',
      '화': '열정과 활동력, 사교적이고 밝은 성격',
      '토': '안정과 신뢰, 책임감 있고 현실적',
      '금': '정의와 원칙, 체계적이고 완벽주의적',
      '수': '지혜와 적응력, 유연하고 직관적'
    };
    
    return characteristics[element] || '특성 정보 없음';
  }

  // ============ 지지 분석 관련 메서드 ============

  /**
   * 지지의 상세 정보를 가져옵니다.
   */
  getEarthlyBranchInfo(branch: EarthlyBranch): string {
    return EarthlyBranchUtils.formatBranchInfo(branch);
  }

  /**
   * 사주의 지지들을 분석합니다.
   */
  analyzeSajuBranches(userInfo: UserBirthInfo): string {
    const eightChars = this.calculateEightCharacters(userInfo);
    const branches = eightChars.earthlyBranches;
    
    const analysis = [
      '=== 사주 지지 분석 ===',
      `일지(배우자/환경): ${this.getEarthlyBranchInfo(branches[2])}`,
      '',
      `년지(조상/뿌리): ${EarthlyBranchUtils.getDescription(branches[0])} (${EarthlyBranchUtils.isYang(branches[0]) ? '양' : '음'}${EarthlyBranchUtils.getElement(branches[0])})`,
      `월지(부모/사회): ${EarthlyBranchUtils.getDescription(branches[1])} (${EarthlyBranchUtils.isYang(branches[1]) ? '양' : '음'}${EarthlyBranchUtils.getElement(branches[1])})`,
      `시지(자녀/미래): ${EarthlyBranchUtils.getDescription(branches[3])} (${EarthlyBranchUtils.isYang(branches[3]) ? '양' : '음'}${EarthlyBranchUtils.getElement(branches[3])})`
    ];
    
    return analysis.join('\n');
  }

  /**
   * 지지의 오행 분포를 분석합니다.
   */
  analyzeBranchElementDistribution(userInfo: UserBirthInfo): string {
    const eightChars = this.calculateEightCharacters(userInfo);
    const branches = eightChars.earthlyBranches;
    
    // 오행별 개수 계산
    const elementCount = new Map();
    branches.forEach(branch => {
      const element = EarthlyBranchUtils.getElement(branch);
      elementCount.set(element, (elementCount.get(element) || 0) + 1);
    });
    
    const analysis = [
      '=== 지지 오행 분포 ===',
      ...Array.from(elementCount.entries()).map(([element, count]) => 
        `${element}: ${count}개`
      ),
      '',
      '=== 지지 오행 특성 ===',
      ...Array.from(elementCount.entries()).map(([element, count]) => {
        const intensity = count >= 3 ? '매우 강함' : count === 2 ? '강함' : '보통';
        return `${element} (${intensity}): ${this.getBranchElementCharacteristic(element)}`;
      })
    ];
    
    return analysis.join('\n');
  }

  /**
   * 지지의 음양 분포를 분석합니다.
   */
  analyzeBranchYinYangDistribution(userInfo: UserBirthInfo): string {
    const eightChars = this.calculateEightCharacters(userInfo);
    const branches = eightChars.earthlyBranches;
    
    const yangCount = branches.filter(branch => EarthlyBranchUtils.isYang(branch)).length;
    const yinCount = 4 - yangCount;
    
    let balance = '';
    if (yangCount > yinCount) {
      balance = '양기가 강함 - 외향적이고 활동적인 환경 선호';
    } else if (yinCount > yangCount) {
      balance = '음기가 강함 - 내향적이고 안정적인 환경 선호';
    } else {
      balance = '음양이 균형잡힘 - 다양한 환경에 적응 가능';
    }
    
    return [
      '=== 지지 음양 분포 ===',
      `양지: ${yangCount}개`,
      `음지: ${yinCount}개`,
      `환경 특성: ${balance}`
    ].join('\n');
  }

  /**
   * 지지 오행별 특성 설명을 가져옵니다.
   */
  private getBranchElementCharacteristic(element: string): string {
    const characteristics: Record<string, string> = {
      '목': '성장과 발전 환경, 자유롭고 창의적인 분위기',
      '화': '활동적이고 역동적인 환경, 사교적이고 밝은 분위기',
      '토': '안정적이고 현실적인 환경, 신뢰와 책임감 있는 분위기',
      '금': '체계적이고 정확한 환경, 원칙과 질서가 있는 분위기',
      '수': '유연하고 적응적인 환경, 지혜와 학습이 있는 분위기'
    };
    
    return characteristics[element] || '특성 정보 없음';
  }

  // ============ 십성(十星) 관련 메서드 ============

  /**
   * 사주의 십성을 계산합니다 (천간과 지지 모두).
   */
  calculateTenStars(userInfo: UserBirthInfo): TenStarsInfo {
    const eightChars = this.calculateEightCharacters(userInfo);
    const dayStem = eightChars.heavenlyStems[2]; // 일간
    
    // 천간의 십성
    const heavenlyStems = {
      year: TenStarsUtils.calculateTenStar(dayStem, eightChars.heavenlyStems[0]),
      month: TenStarsUtils.calculateTenStar(dayStem, eightChars.heavenlyStems[1]),
      day: `일간 (${dayStem})`, // 일간은 기준
      hour: TenStarsUtils.calculateTenStar(dayStem, eightChars.heavenlyStems[3]),
    };

    // 지지의 십성 (지장간 본기 기준)
    const earthlyBranches = {
      year: TenStarsUtils.calculateBranchTenStar(dayStem, eightChars.earthlyBranches[0]),
      month: TenStarsUtils.calculateBranchTenStar(dayStem, eightChars.earthlyBranches[1]),
      day: TenStarsUtils.calculateBranchTenStar(dayStem, eightChars.earthlyBranches[2]),
      hour: TenStarsUtils.calculateBranchTenStar(dayStem, eightChars.earthlyBranches[3]),
    };
    
    return {
      heavenlyStems,
      earthlyBranches,
      // 기존 호환성 유지
      yearStem: heavenlyStems.year,
      monthStem: heavenlyStems.month,
      dayStem: heavenlyStems.day,
      hourStem: heavenlyStems.hour,
    };
  }

  /**
   * 십성 정보를 문자열로 포맷팅합니다.
   */
  formatTenStars(tenStars: TenStarsInfo): string {
    const lines = [
      '=== 천간의 십성 ===',
      `연간: ${tenStars.heavenlyStems.year} (${TenStarsUtils.getTenStarMeaning(tenStars.heavenlyStems.year)})`,
      `월간: ${tenStars.heavenlyStems.month} (${TenStarsUtils.getTenStarMeaning(tenStars.heavenlyStems.month)})`,
      `일간: ${tenStars.heavenlyStems.day}`,
      `시간: ${tenStars.heavenlyStems.hour} (${TenStarsUtils.getTenStarMeaning(tenStars.heavenlyStems.hour)})`,
      '',
      '=== 지지의 십성 ===',
      `연지: ${tenStars.earthlyBranches.year} (${TenStarsUtils.getTenStarMeaning(tenStars.earthlyBranches.year)})`,
      `월지: ${tenStars.earthlyBranches.month} (${TenStarsUtils.getTenStarMeaning(tenStars.earthlyBranches.month)})`,
      `일지: ${tenStars.earthlyBranches.day} (${TenStarsUtils.getTenStarMeaning(tenStars.earthlyBranches.day)})`,
      `시지: ${tenStars.earthlyBranches.hour} (${TenStarsUtils.getTenStarMeaning(tenStars.earthlyBranches.hour)})`
    ];
    
    return lines.join('\n');
  }

  // ============ 지장간(地藏干) 관련 메서드 ============

  /**
   * 사주의 지장간을 계산합니다.
   */
  calculateHiddenStems(userInfo: UserBirthInfo): SajuHiddenStems {
    const eightChars = this.calculateEightCharacters(userInfo);
    const branches = eightChars.earthlyBranches;
    
    return {
      year: HiddenStemsUtils.getHiddenStems(branches[0]),
      month: HiddenStemsUtils.getHiddenStems(branches[1]),
      day: HiddenStemsUtils.getHiddenStems(branches[2]),
      hour: HiddenStemsUtils.getHiddenStems(branches[3]),
    };
  }

  /**
   * 지장간 정보를 문자열로 포맷팅합니다.
   */
  formatHiddenStems(hiddenStems: SajuHiddenStems): string {
    return [
      `년지: ${HiddenStemsUtils.formatHiddenStems(hiddenStems.year)}`,
      `월지: ${HiddenStemsUtils.formatHiddenStems(hiddenStems.month)}`,
      `일지: ${HiddenStemsUtils.formatHiddenStems(hiddenStems.day)}`,
      `시지: ${HiddenStemsUtils.formatHiddenStems(hiddenStems.hour)}`
    ].join('\n');
  }

  // ============ 사주판 출력 관련 메서드 ============

  /**
   * 사주판 형태로 출력합니다.
   */
  formatSajuBoard(userInfo: UserBirthInfo): string {
    const eightChars = this.calculateEightCharacters(userInfo);
    const tenStars = this.calculateTenStars(userInfo);
    const hiddenStems = this.calculateHiddenStems(userInfo);
    
    const header = [
      '┌─────────────────────────────────────┐',
      '│               사 주 판               │',
      '├─────┬─────┬─────┬─────┬─────┤',
      '│     │ 생시 │ 생일 │ 생월 │ 생년 │',
    ].join('\n');
    
    const tianganRow = `│천간 │ ${eightChars.heavenlyStems[3]} │ ${eightChars.heavenlyStems[2]} │ ${eightChars.heavenlyStems[1]} │ ${eightChars.heavenlyStems[0]} │`;
    
    const tenStarsRow = `│십성 │${tenStars.hourStem.padStart(3)}│  본인 │${tenStars.monthStem.padStart(3)}│${tenStars.yearStem.padStart(3)}│`;
    
    const dizhiRow = `│지지 │ ${eightChars.earthlyBranches[3]} │ ${eightChars.earthlyBranches[2]} │ ${eightChars.earthlyBranches[1]} │ ${eightChars.earthlyBranches[0]} │`;
    
    const hiddenRow = `│지장간│${HiddenStemsUtils.formatHiddenStems(hiddenStems.hour).padStart(4)}│${HiddenStemsUtils.formatHiddenStems(hiddenStems.day).padStart(4)}│${HiddenStemsUtils.formatHiddenStems(hiddenStems.month).padStart(4)}│${HiddenStemsUtils.formatHiddenStems(hiddenStems.year).padStart(4)}│`;
    
    const footer = '└─────┴─────┴─────┴─────┴─────┘';
    
    return [header, tianganRow, tenStarsRow, dizhiRow, hiddenRow, footer].join('\n');
  }

  // ============ 12운성(十二運星) 관련 메서드 ============

  /**
   * 사주의 12운성을 계산합니다.
   */
  calculateTwelveLifeStages(userInfo: UserBirthInfo): TwelveLifeStagesInfo {
    const eightChars = this.calculateEightCharacters(userInfo);
    const dayStem = eightChars.heavenlyStems[2]; // 일간
    const branches = eightChars.earthlyBranches;
    
    return {
      year: TwelveLifeStagesUtils.calculateLifeStage(dayStem, branches[0]),
      month: TwelveLifeStagesUtils.calculateLifeStage(dayStem, branches[1]),
      day: TwelveLifeStagesUtils.calculateLifeStage(dayStem, branches[2]),
      hour: TwelveLifeStagesUtils.calculateLifeStage(dayStem, branches[3]),
    };
  }

  /**
   * 12운성 정보를 문자열로 포맷팅합니다.
   */
  formatTwelveLifeStages(lifeStages: TwelveLifeStagesInfo): string {
    return [
      `년지: ${lifeStages.year} (${TwelveLifeStagesUtils.getLifeStageMeaning(lifeStages.year)})`,
      `월지: ${lifeStages.month} (${TwelveLifeStagesUtils.getLifeStageMeaning(lifeStages.month)})`,
      `일지: ${lifeStages.day} (${TwelveLifeStagesUtils.getLifeStageMeaning(lifeStages.day)})`,
      `시지: ${lifeStages.hour} (${TwelveLifeStagesUtils.getLifeStageMeaning(lifeStages.hour)})`
    ].join('\n');
  }

  // ============ 12신살(十二神殺) 관련 메서드 ============

  /**
   * 사주의 12신살을 계산합니다.
   */
  calculateTwelveSpirits(userInfo: UserBirthInfo): TwelveSpiritsInfo {
    const eightChars = this.calculateEightCharacters(userInfo);
    const dayStem = eightChars.heavenlyStems[2]; // 일간
    const branches = eightChars.earthlyBranches;
    
    return {
      year: TwelveSpiritsUtils.calculateSpirit(dayStem, branches[0], 'year'),
      month: TwelveSpiritsUtils.calculateSpirit(dayStem, branches[1], 'month'),
      day: TwelveSpiritsUtils.calculateSpirit(dayStem, branches[2], 'day'),
      hour: TwelveSpiritsUtils.calculateSpirit(dayStem, branches[3], 'hour'),
    };
  }

  /**
   * 12신살 정보를 문자열로 포맷팅합니다.
   */
  formatTwelveSpirits(spirits: TwelveSpiritsInfo): string {
    const formatSpirit = (spirit: TwelveSpirits | null) => {
      if (!spirit) return '없음';
      const isGood = TwelveSpiritsUtils.isGoodSpirit(spirit);
      const mark = isGood ? '(길신)' : '(흉신)';
      return `${spirit} ${mark} - ${TwelveSpiritsUtils.getSpiritMeaning(spirit)}`;
    };
    
    return [
      `년주: ${formatSpirit(spirits.year)}`,
      `월주: ${formatSpirit(spirits.month)}`,
      `일주: ${formatSpirit(spirits.day)}`,
      `시주: ${formatSpirit(spirits.hour)}`
    ].join('\n');
  }

  // ============ 완전한 사주 정보 조회 메서드 ============

  /**
   * 사진과 같은 모든 데이터를 포함한 완전한 사주 정보를 반환합니다.
   */
  getCompleteSajuData(userInfo: UserBirthInfo) {
    const eightChars = this.calculateEightCharacters(userInfo);
    const tenStars = this.calculateTenStars(userInfo);
    const hiddenStems = this.calculateHiddenStems(userInfo);
    const lifeStages = this.calculateTwelveLifeStages(userInfo);
    const spirits = this.calculateTwelveSpirits(userInfo);
    
    return {
      // 기본 정보
      basicInfo: {
        gender: userInfo.gender,
        birthDateTime: userInfo.birthDateTime,
        isSolar: userInfo.isSolar,
      },
      
      // 8개 한자
      eightCharacters: eightChars,
      
      // 십성
      tenStars,
      
      // 지장간
      hiddenStems,
      
      // 12운성
      twelveLifeStages: lifeStages,
      
      // 12신살
      twelveSpirits: spirits,
    };
  }

  /**
   * 완전한 사주 정보를 보기 좋은 형태로 출력합니다.
   */
  formatCompleteSajuData(userInfo: UserBirthInfo): string {
    const data = this.getCompleteSajuData(userInfo);
    
    const basicInfo = [
      '=== 완전한 사주 정보 ===',
      `성별: ${data.basicInfo.gender}`,
      `생년월일시: ${data.basicInfo.birthDateTime.toLocaleString('ko-KR')}`,
      `양력/음력: ${data.basicInfo.isSolar ? '양력' : '음력'}`,
      ''
    ];
    
    const sajuBoard = [
      this.formatSajuBoard(userInfo),
      ''
    ];
    
    const detailInfo = [
      '=== 십성 ===',
      this.formatTenStars(data.tenStars),
      '',
      '=== 지장간 ===',
      this.formatHiddenStems(data.hiddenStems),
      '',
      '=== 12운성 ===',
      this.formatTwelveLifeStages(data.twelveLifeStages),
      '',
      '=== 12신살 ===',
      this.formatTwelveSpirits(data.twelveSpirits)
    ];
    
    return [...basicInfo, ...sajuBoard, ...detailInfo].join('\n');
  }

  // ============ 시간 보정 관련 메서드 ============

  /**
   * 진태양시로 시간을 보정합니다.
   * @param userInfo 사용자 정보
   * @param locationName 출생지 (선택사항)
   * @returns 보정된 시간 정보
   */
  correctBirthTime(userInfo: UserBirthInfo, locationName?: string): TimeCorrection {
    if (locationName) {
      return TimeCorrectionUtils.correctTimeByLocation(userInfo.birthDateTime, locationName);
    } else {
      // 출생지 정보가 있으면 사용, 없으면 기본 보정
      const location = userInfo.birthPlace || '서울';
      return TimeCorrectionUtils.correctTimeByLocation(userInfo.birthDateTime, location);
    }
  }

  /**
   * 시간 보정을 적용한 사주를 계산합니다.
   * @param userInfo 사용자 정보
   * @param locationName 출생지 (선택사항)
   * @returns 보정된 시간으로 계산한 완전한 사주 데이터
   */
  getCompleteSajuDataWithTimeCorrection(userInfo: UserBirthInfo, locationName?: string) {
    // 시간 보정
    const timeCorrection = this.correctBirthTime(userInfo, locationName);
    
    // 보정된 시간으로 새로운 UserBirthInfo 생성
    const correctedUserInfo: UserBirthInfo = {
      ...userInfo,
      birthDateTime: timeCorrection.correctedTime
    };
    
    // 보정된 시간으로 사주 계산
    const sajuData = this.getCompleteSajuData(correctedUserInfo);
    
    return {
      ...sajuData,
      timeCorrection, // 시간 보정 정보 추가
    };
  }

  /**
   * 시간 보정을 포함한 완전한 사주 정보를 출력합니다.
   * @param userInfo 사용자 정보
   * @param locationName 출생지 (선택사항)
   * @returns 보정 정보와 사주 정보
   */
  formatCompleteSajuDataWithTimeCorrection(userInfo: UserBirthInfo, locationName?: string): string {
    const timeCorrection = this.correctBirthTime(userInfo, locationName);
    
    // 시주 변경 여부 확인
    const hourPillarChanged = TimeCorrectionUtils.checkHourPillarChange(
      timeCorrection.originalTime,
      timeCorrection.correctedTime
    );
    
    const correctedUserInfo: UserBirthInfo = {
      ...userInfo,
      birthDateTime: timeCorrection.correctedTime
    };
    
    const basicInfo = [
      '=== 진태양시 보정 사주 정보 ===',
      `성별: ${userInfo.gender}`,
      `출생지: ${locationName || userInfo.birthPlace || '서울'}`,
      '',
      '=== 시간 보정 정보 ===',
      TimeCorrectionUtils.formatTimeCorrection(timeCorrection),
      hourPillarChanged ? '⚠️ 시주가 변경되었습니다!' : '✅ 시주 변경 없음',
      ''
    ];
    
    const sajuBoard = [
      this.formatSajuBoard(correctedUserInfo),
      ''
    ];
    
    const detailInfo = [
      '=== 십성 ===',
      this.formatTenStars(this.calculateTenStars(correctedUserInfo)),
      '',
      '=== 지장간 ===',
      this.formatHiddenStems(this.calculateHiddenStems(correctedUserInfo)),
      '',
      '=== 12운성 ===',
      this.formatTwelveLifeStages(this.calculateTwelveLifeStages(correctedUserInfo)),
      '',
      '=== 12신살 ===',
      this.formatTwelveSpirits(this.calculateTwelveSpirits(correctedUserInfo))
    ];
    
    return [...basicInfo, ...sajuBoard, ...detailInfo].join('\n');
  }

  /**
   * 사용 가능한 출생지 목록을 가져옵니다.
   */
  getAvailableLocations(): string[] {
    return TimeCorrectionUtils.getAvailableLocations();
  }

  /**
   * 전체 사주 종합 분석 (모든 기능 포함)
   */
  getComprehensiveAnalysis(userInfo: UserBirthInfo): string {
    return this.formatCompleteSajuData(userInfo);
  }

  /**
   * 시간 보정을 포함한 종합 분석
   */
  getComprehensiveAnalysisWithTimeCorrection(userInfo: UserBirthInfo, locationName?: string): string {
    return this.formatCompleteSajuDataWithTimeCorrection(userInfo, locationName);
  }

  /**
   * 절기 기반 사주 계산 디버깅 정보를 제공합니다.
   * @param userInfo 사용자 생년월일시 정보
   * @returns 계산 과정과 절기 정보
   */
  getCalculationDebugInfo(userInfo: UserBirthInfo): {
    originalDate: Date;
    kstDate: Date;
    solarDate: Date;
    sajuYear: number;
    sajuMonth: number;
    currentSolarTerm: {
      current: string | null;
      next: string | null;
      daysSinceStart: number;
      daysUntilNext: number;
    };
    yearPillarInfo: {
      lichunDate: Date;
      isAfterLichun: boolean;
    };
    monthPillarInfo: {
      monthStartTerm: string;
      monthStartDate: Date;
    };
    nightTimeAdjustment: {
      isNightTime: boolean;
      adjustedForNightTime: boolean;
    };
  } {
    const birthDate = userInfo.birthDateTime;
    
    // 시간대 처리
    const kstOffset = 9 * 60;
    const localOffset = birthDate.getTimezoneOffset();
    const kstDate = new Date(birthDate.getTime() + (kstOffset + localOffset) * 60 * 1000);
    
    // 양력 변환
    const solarDate = userInfo.isSolar ? kstDate : this.convertLunarToSolar(kstDate);
    
    // 절기 정보
    const sajuYear = SolarTermsUtils.getSajuYear(solarDate);
    const sajuMonth = SolarTermsUtils.getSajuMonth(solarDate);
    const currentTerm = SolarTermsUtils.getCurrentSolarTerm(solarDate);
    
    // 입춘 정보
    const lichunDate = SolarTermsUtils.getLichunDate(solarDate.getFullYear());
    const isAfterLichun = solarDate >= lichunDate;
    
    // 월 절기 정보
    const monthTermNames = ['입춘', '경칩', '청명', '입하', '망종', '소서', '입추', '백로', '한로', '입동', '대설', '소한'];
    const monthStartTerm = monthTermNames[sajuMonth];
    const monthStartDate = SolarTermsUtils.getSolarTermByName(solarDate.getFullYear(), monthStartTerm) || lichunDate;
    
    // 야자시 정보
    const isNightTime = solarDate.getHours() >= 23;
    
    return {
      originalDate: birthDate,
      kstDate,
      solarDate,
      sajuYear,
      sajuMonth,
      currentSolarTerm: {
        current: currentTerm.current?.name || null,
        next: currentTerm.next?.name || null,
        daysSinceStart: currentTerm.daysSinceStart,
        daysUntilNext: currentTerm.daysUntilNext
      },
      yearPillarInfo: {
        lichunDate,
        isAfterLichun
      },
      monthPillarInfo: {
        monthStartTerm,
        monthStartDate
      },
      nightTimeAdjustment: {
        isNightTime,
        adjustedForNightTime: isNightTime
      }
    };
  }

  /**
   * 절기 정보를 포함한 상세 사주 분석 결과를 반환합니다.
   * @param userInfo 사용자 생년월일시 정보
   * @returns 절기 정보가 포함된 사주 분석
   */
  getDetailedSajuAnalysis(userInfo: UserBirthInfo) {
    const eightCharacters = this.calculateEightCharacters(userInfo);
    const debugInfo = this.getCalculationDebugInfo(userInfo);
    const formattedResult = this.formatEightCharacters(eightCharacters);
    
    return {
      eightCharacters,
      debugInfo,
      formattedResult
    };
  }

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
   * 생년월일시 정보를 간단하게 입력받아 사주를 추출하는 편의 함수
   * @param year 년도
   * @param month 월
   * @param day 일
   * @param hour 시간
   * @param minute 분 (선택사항, 기본값: 0)
   * @param isSolar 양력 여부 (기본값: true)
   * @param isLeapMonth 윤달 여부 (선택사항, 기본값: false)
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

    // UserBirthInfo 형태로 변환하여 기존 함수들 활용
    const userInfo = this.convertToUserBirthInfo(params);

    // 기본 옵션 설정
    const {
      includeTenStars = true,
      includeHiddenStems = true,
      includeTwelveLifeStages = true,
      includeTwelveSpirits = true,
      includeDetailedAnalysis = true
    } = options;

    const result: ComprehensiveSaju = {
      basicSaju,
      tenStars: null as any,
      hiddenStems: null as any,
      twelveLifeStages: null as any,
      twelveSpirits: null as any,
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

    // 십성 분석
    if (includeTenStars) {
      result.tenStars = this.calculateTenStars(userInfo);
    }

    // 지장간 분석
    if (includeHiddenStems) {
      result.hiddenStems = this.calculateHiddenStems(userInfo);
    }

    // 12운성 분석
    if (includeTwelveLifeStages) {
      result.twelveLifeStages = this.calculateTwelveLifeStages(userInfo);
    }

    // 12신살 분석
    if (includeTwelveSpirits) {
      result.twelveSpirits = this.calculateTwelveSpirits(userInfo);
    }

    // 상세 분석
    if (includeDetailedAnalysis) {
      result.analysis = this.performDetailedAnalysis(basicSaju, result);
    }

    return result;
  }

  /**
   * SajuExtractionParams를 UserBirthInfo로 변환합니다.
   */
  private convertToUserBirthInfo(params: SajuExtractionParams): UserBirthInfo {
    const { year, month, day, hour, minute = 0, isSolar } = params;
    
    // 시간 정보를 Date 객체로 변환
    const birthDateTime = new Date(year, month - 1, day, hour, minute);

    return {
      gender: Gender.MALE, // 기본값 (실제로는 파라미터로 받아야 함)
      birthDateTime,
      isSolar,
      birthPlace: '서울' // 기본값
    };
  }

  /**
   * 상세 사주 분석을 수행합니다.
   */
  private performDetailedAnalysis(basicSaju: SajuFromCalendar, analysis: ComprehensiveSaju): ComprehensiveSaju['analysis'] {
    const { dayPillar, additionalInfo } = basicSaju;
    const characteristics: string[] = [];
    const supportElements: string[] = [];
    const weakElements: string[] = [];
    const favorableDirections: string[] = [];
    const favorableColors: string[] = [];
    const careerSuggestions: string[] = [];

    // 일간 분석
    const dayMaster = dayPillar.heavenlyStem;
    
    // 오행별 특성 분석
    switch (dayMaster) {
      case '甲': // 갑목
        characteristics.push('성격이 곧고 정직함', '리더십이 강함', '새로운 일에 도전적');
        supportElements.push('수(水)', '목(木)');
        weakElements.push('금(金)', '토(土)');
        favorableDirections.push('동쪽', '북쪽');
        favorableColors.push('초록색', '청색');
        careerSuggestions.push('경영자', '교육자', '환경 관련 업무');
        break;
        
      case '乙': // 을목
        characteristics.push('부드럽고 유연함', '적응력이 뛰어남', '예술적 감각');
        supportElements.push('수(水)', '목(木)');
        weakElements.push('금(金)', '토(土)');
        favorableDirections.push('동쪽', '북쪽');
        favorableColors.push('연두색', '청색');
        careerSuggestions.push('예술가', '상담사', '의료진');
        break;

      case '丙': // 병화
        characteristics.push('밝고 활발함', '추진력이 강함', '사교적');
        supportElements.push('목(木)', '화(火)');
        weakElements.push('수(水)', '토(土)');
        favorableDirections.push('남쪽', '동쪽');
        favorableColors.push('빨간색', '주황색');
        careerSuggestions.push('영업직', '연예계', '요식업');
        break;

      case '丁': // 정화
        characteristics.push('섬세하고 지적임', '창의력이 뛰어남', '인간미가 풍부');
        supportElements.push('목(木)', '화(火)');
        weakElements.push('수(水)', '토(土)');
        favorableDirections.push('남쪽', '동쪽');
        favorableColors.push('분홍색', '주황색');
        careerSuggestions.push('작가', '디자이너', '요리사');
        break;

      case '戊': // 무토
        characteristics.push('안정적이고 신뢰감', '포용력이 큼', '현실적');
        supportElements.push('화(火)', '토(土)');
        weakElements.push('목(木)', '수(水)');
        favorableDirections.push('중앙', '남쪽');
        favorableColors.push('황색', '갈색');
        careerSuggestions.push('건설업', '부동산', '농업');
        break;

      case '己': // 기토
        characteristics.push('세심하고 배려심', '인내력이 강함', '봉사정신');
        supportElements.push('화(火)', '토(土)');
        weakElements.push('목(木)', '수(水)');
        favorableDirections.push('중앙', '남쪽');
        favorableColors.push('노란색', '갈색');
        careerSuggestions.push('서비스업', '의료진', '교육자');
        break;

      case '庚': // 경금
        characteristics.push('의지가 강함', '결단력이 빠름', '정의감');
        supportElements.push('토(土)', '금(金)');
        weakElements.push('화(火)', '목(木)');
        favorableDirections.push('서쪽', '중앙');
        favorableColors.push('흰색', '금색');
        careerSuggestions.push('법조계', '군인', '기계 관련');
        break;

      case '辛': // 신금
        characteristics.push('세련되고 품위 있음', '예민한 감각', '완벽주의');
        supportElements.push('토(土)', '금(金)');
        weakElements.push('화(火)', '목(木)');
        favorableDirections.push('서쪽', '중앙');
        favorableColors.push('은색', '흰색');
        careerSuggestions.push('보석상', '미용사', '의사');
        break;

      case '壬': // 임수
        characteristics.push('지혜롭고 융통성', '포용력이 큼', '직관력');
        supportElements.push('금(金)', '수(水)');
        weakElements.push('토(土)', '화(火)');
        favorableDirections.push('북쪽', '서쪽');
        favorableColors.push('검정색', '남색');
        careerSuggestions.push('연구원', '언론인', '물류업');
        break;

      case '癸': // 계수
        characteristics.push('온화하고 신중함', '깊이 있는 사고', '감수성');
        supportElements.push('금(金)', '수(水)');
        weakElements.push('토(土)', '화(火)');
        favorableDirections.push('북쪽', '서쪽');
        favorableColors.push('회색', '남색');
        careerSuggestions.push('학자', '상담사', 'IT업');
        break;

      default:
        characteristics.push('다양한 재능을 가진 인물');
        break;
    }

    // 계절과 월령 고려한 강약 판단
    let dayMasterStrength: 'strong' | 'weak' | 'balanced' = 'balanced';
    const month = basicSaju.birthInfo.month;

    if (dayMaster === '甲' || dayMaster === '乙') { // 목일간
      if (month >= 3 && month <= 5) { // 봄
        dayMasterStrength = 'strong';
      } else if (month >= 9 && month <= 11) { // 가을
        dayMasterStrength = 'weak';
      }
    } else if (dayMaster === '丙' || dayMaster === '丁') { // 화일간
      if (month >= 6 && month <= 8) { // 여름
        dayMasterStrength = 'strong';
      } else if (month >= 12 || month <= 2) { // 겨울
        dayMasterStrength = 'weak';
      }
    } else if (dayMaster === '庚' || dayMaster === '辛') { // 금일간
      if (month >= 9 && month <= 11) { // 가을
        dayMasterStrength = 'strong';
      } else if (month >= 3 && month <= 5) { // 봄
        dayMasterStrength = 'weak';
      }
    } else if (dayMaster === '壬' || dayMaster === '癸') { // 수일간
      if (month >= 12 || month <= 2) { // 겨울
        dayMasterStrength = 'strong';
      } else if (month >= 6 && month <= 8) { // 여름
        dayMasterStrength = 'weak';
      }
    }

    return {
      mainCharacteristics: characteristics,
      strengthAnalysis: {
        dayMasterStrength,
        supportElements,
        weakElements
      },
      recommendations: {
        favorableDirections,
        favorableColors,
        careerSuggestions
      }
    };
  }

  /**
   * 완전한 사주 분석 결과를 포맷팅합니다.
   */
  formatComprehensiveSaju(saju: ComprehensiveSaju): string {
    const lines = [
      // 기본 사주 정보
      this.formatSajuFromCalendar(saju.basicSaju),
      ''
    ];

    // 십성 정보
    if (saju.tenStars) {
      lines.push('=== 십성 (十星) ===');
      lines.push(this.formatTenStars(saju.tenStars));
      lines.push('');
    }

    // 지장간 정보
    if (saju.hiddenStems) {
      lines.push('=== 지장간 (地藏干) ===');
      lines.push(this.formatHiddenStems(saju.hiddenStems));
      lines.push('');
    }

    // 12운성 정보
    if (saju.twelveLifeStages) {
      lines.push('=== 12운성 (十二運星) ===');
      lines.push(this.formatTwelveLifeStages(saju.twelveLifeStages));
      lines.push('');
    }

    // 12신살 정보
    if (saju.twelveSpirits) {
      lines.push('=== 12신살 (十二神殺) ===');
      lines.push(this.formatTwelveSpirits(saju.twelveSpirits));
      lines.push('');
    }

    // 상세 분석
    if (saju.analysis) {
      lines.push('=== 상세 분석 ===');
      lines.push(`일간 강약: ${this.getStrengthText(saju.analysis.strengthAnalysis.dayMasterStrength)}`);
      lines.push(`주요 특징: ${saju.analysis.mainCharacteristics.join(', ')}`);
      lines.push(`도움되는 오행: ${saju.analysis.strengthAnalysis.supportElements.join(', ')}`);
      lines.push(`약한 오행: ${saju.analysis.strengthAnalysis.weakElements.join(', ')}`);
      lines.push('');
      
      lines.push('=== 추천사항 ===');
      lines.push(`길한 방향: ${saju.analysis.recommendations.favorableDirections.join(', ')}`);
      lines.push(`길한 색상: ${saju.analysis.recommendations.favorableColors.join(', ')}`);
      lines.push(`적합한 직업: ${saju.analysis.recommendations.careerSuggestions.join(', ')}`);
    }

    return lines.join('\n');
  }

  private getStrengthText(strength: 'strong' | 'weak' | 'balanced'): string {
    switch (strength) {
      case 'strong': return '강함 (身强)';
      case 'weak': return '약함 (身弱)';
      case 'balanced': return '중화 (中和)';
      default: return '분석 중';
    }
  }
}