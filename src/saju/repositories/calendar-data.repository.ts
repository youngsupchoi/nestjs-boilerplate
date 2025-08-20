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
}
