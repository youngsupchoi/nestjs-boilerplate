import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarData } from '../entities/calendar-data.entity';

/**
 * 만세력 데이터 조회를 위한 Repository
 */
@Injectable()
export class CalendarDataRepository {
  constructor(
    @InjectRepository(CalendarData)
    private readonly repository: Repository<CalendarData>,
  ) {}

  /**
   * 양력 날짜로 만세력 데이터 조회
   * @param year 년도
   * @param month 월
   * @param day 일
   * @returns 해당 날짜의 만세력 데이터
   */
  async findBySolarDate(year: number, month: number, day: number): Promise<CalendarData | null> {
    return await this.repository.findOne({
      where: {
        cd_sy: year,
        cd_sm: month.toString(),
        cd_sd: day.toString(),
      },
    });
  }

  /**
   * 음력 날짜로 만세력 데이터 조회
   * @param year 년도
   * @param month 월
   * @param day 일
   * @param isLeapMonth 윤달 여부
   * @returns 해당 날짜의 만세력 데이터
   */
  async findByLunarDate(
    year: number, 
    month: number, 
    day: number, 
    isLeapMonth: boolean = false
  ): Promise<CalendarData | null> {
    return await this.repository.findOne({
      where: {
        cd_ly: year,
        cd_lm: month.toString(),
        cd_ld: day.toString(),
        cd_leap_month: isLeapMonth ? 1 : 0,
      },
    });
  }

  /**
   * 특정 년월의 모든 데이터 조회 (양력 기준)
   * @param year 년도
   * @param month 월
   * @returns 해당 년월의 모든 만세력 데이터
   */
  async findByYearMonth(year: number, month: number): Promise<CalendarData[]> {
    return await this.repository.find({
      where: {
        cd_sy: year,
        cd_sm: month.toString(),
      },
      order: {
        cd_sd: 'ASC',
      },
    });
  }

  /**
   * 특정 간지의 날짜들 조회
   * @param ganzhi 간지 (한자 또는 한글)
   * @param pillarType 기둥 타입 ('year' | 'month' | 'day')
   * @param limit 조회 제한 수
   * @returns 해당 간지의 날짜 데이터들
   */
  async findByGanzhi(
    ganzhi: string,
    pillarType: 'year' | 'month' | 'day',
    limit: number = 100
  ): Promise<CalendarData[]> {
    const whereCondition: any = {};

    if (pillarType === 'year') {
      whereCondition.cd_hyganjee = ganzhi;
    } else if (pillarType === 'month') {
      whereCondition.cd_hmganjee = ganzhi;
    } else if (pillarType === 'day') {
      whereCondition.cd_hdganjee = ganzhi;
    }

    return await this.repository.find({
      where: whereCondition,
      order: {
        cd_sy: 'ASC',
        cd_sm: 'ASC',
        cd_sd: 'ASC',
      },
      take: limit,
    });
  }

  /**
   * 특정 기간의 데이터 조회
   * @param startYear 시작 년도
   * @param endYear 종료 년도
   * @returns 해당 기간의 만세력 데이터
   */
  async findByYearRange(startYear: number, endYear: number): Promise<CalendarData[]> {
    return await this.repository
      .createQueryBuilder('calendar')
      .where('calendar.cd_sy >= :startYear AND calendar.cd_sy <= :endYear', {
        startYear,
        endYear,
      })
      .orderBy('calendar.cd_sy', 'ASC')
      .addOrderBy('calendar.cd_sm', 'ASC')
      .addOrderBy('calendar.cd_sd', 'ASC')
      .getMany();
  }

  // ==================== 대운 계산을 위한 절기 관련 메소드 ====================

  /**
   * 특정 날짜 주변의 절기일 찾기 (월주 변화점 기준)
   * @param year 년도
   * @param month 월
   * @param day 일
   * @returns 이전 절기와 다음 절기 정보
   */
  async findSolarTermsAroundDate(
    year: number, 
    month: number, 
    day: number
  ): Promise<{
    previousTerm: { date: number, monthPillar: string } | null;
    nextTerm: { date: number, monthPillar: string } | null;
  }> {
    // 이전 달, 현재 달, 다음 달 데이터 조회
    const prevMonth = month === 1 ? 12 : month - 1;
    const nextMonth = month === 12 ? 1 : month + 1;
    const prevYear = month === 1 ? year - 1 : year;
    const nextYear = month === 12 ? year + 1 : year;
    
    const prevData = await this.findByYearMonth(prevYear, prevMonth);
    const currentData = await this.findByYearMonth(year, month);
    const nextData = await this.findByYearMonth(nextYear, nextMonth);
    
    // 현재 달에서 절기 변화점 찾기
    const currentTermChange = this.findMonthPillarChange(currentData);
    const nextTermChange = this.findMonthPillarChange(nextData);
    
    // 이전 달에서 절기점 찾기 (역방향)
    const prevTermChange = this.findMonthPillarChange(prevData, true);
    
    return {
      previousTerm: prevTermChange ? {
        date: prevTermChange.date,
        monthPillar: prevTermChange.monthPillar
      } : null,
      nextTerm: currentTermChange ? {
        date: currentTermChange.date, 
        monthPillar: currentTermChange.monthPillar
      } : (nextTermChange ? {
        date: nextTermChange.date,
        monthPillar: nextTermChange.monthPillar  
      } : null)
    };
  }

  /**
   * 월주 변화점 찾기 (절기일 탐지)
   * @param monthData 특정 월의 만세력 데이터
   * @param reverse 역방향 탐색 여부
   * @returns 월주 변화점 정보
   */
  private findMonthPillarChange(
    monthData: CalendarData[], 
    reverse: boolean = false
  ): { date: number, monthPillar: string } | null {
    if (monthData.length === 0) return null;
    
    const data = reverse ? [...monthData].reverse() : monthData;
    let previousMonthPillar = data[0].cd_hmganjee;
    
    for (let i = 1; i < data.length; i++) {
      const currentMonthPillar = data[i].cd_hmganjee;
      
      if (previousMonthPillar !== currentMonthPillar) {
        return {
          date: parseInt(data[i].cd_sd),
          monthPillar: currentMonthPillar
        };
      }
      previousMonthPillar = currentMonthPillar;
    }
    
    return null;
  }

  /**
   * 생일과 절기일 사이의 거리 계산
   * @param year 년도
   * @param month 월  
   * @param day 일
   * @param isForward 순행 여부
   * @returns 절기까지의 일수
   */
  async calculateDistanceToSolarTerm(
    year: number,
    month: number, 
    day: number,
    isForward: boolean
  ): Promise<number> {
    try {
      const solarTerms = await this.findSolarTermsAroundDate(year, month, day);
      
      let distance: number;
      
      if (isForward) {
        // 순행: 다음 절기까지의 일수
        if (solarTerms.nextTerm) {
          if (solarTerms.nextTerm.date > day) {
            // 현재 달의 절기까지
            distance = solarTerms.nextTerm.date - day;
          } else {
            // 다음 달 절기까지 (현재 달 절기를 이미 지남)
            const daysInMonth = this.getDaysInMonth(year, month);
            distance = (daysInMonth - day) + (solarTerms.nextTerm.date || 5);
          }
        } else {
          // 절기 정보 없으면 기본값
          distance = 30 - day + 5; // 대략적인 다음 절기까지
        }
      } else {
        // 역행: 이전 절기부터의 일수
        if (solarTerms.previousTerm) {
          distance = day - solarTerms.previousTerm.date;
          if (distance <= 0) {
            // 이전 달에서 계산
            const prevMonth = month === 1 ? 12 : month - 1;
            const prevYear = month === 1 ? year - 1 : year;
            const daysInPrevMonth = this.getDaysInMonth(prevYear, prevMonth);
            distance = daysInPrevMonth + distance;
          }
        } else {
          // 절기 정보 없으면 기본값
          distance = day;
        }
      }
      
      return Math.max(1, distance); // 최소 1일
      
    } catch (error) {
      console.error('절기 거리 계산 오류:', error);
      // DB 오류 시 기본값 반환
      return isForward ? (30 - day + 5) : day;
    }
  }

  /**
   * 특정 월의 일수 계산
   * @param year 년도
   * @param month 월
   * @returns 해당 월의 일수
   */
  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  // ==================== 절기 관련 메소드 끝 ====================
}
