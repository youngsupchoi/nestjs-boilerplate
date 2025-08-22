import { Controller, Get, Query, HttpStatus, HttpException, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SajuService } from './saju.service';
import { SajuFromCalendar } from './interfaces/saju-from-calendar.interface';
import { ComprehensiveSaju } from './interfaces/comprehensive-saju.interface';
import { DaeunList } from './interfaces/daeun.interface';
import { MonthlyFortune, MonthlyFortuneList } from './interfaces/monthly-fortune.interface';
import { YearlyFortune, YearlyFortuneList } from './interfaces/yearly-fortune.interface';
import { TenStarsInfo } from './interfaces/ten-stars.interface';
import { TwelveLifeStagesInfo } from './interfaces/twelve-life-stages.interface';
import { TwelveSinsalResult } from './interfaces/twelve-sinsal.interface';
import { SajuHiddenStems, DetailedHiddenStems } from './interfaces/hidden-stems.interface';
import { TenStarsUtils } from './utils/ten-stars.utils';
import { TwelveLifeStagesUtils } from './utils/twelve-life-stages.utils';
import { HiddenStemsUtils } from './utils/hidden-stems.utils';
import { EarthlyBranch } from './enums/earthly-branch.enum';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { Gender } from './enums/gender.enum';

@ApiTags('사주')
@Controller('saju')
@AuthGuard(AuthType.None) // 공개 API로 설정
export class SajuController {
  constructor(private readonly sajuService: SajuService) {}

  /**
   * 만세력 기반 사주 추출 API (십성, 지장간, 12신살 정보 포함)
   */
  @Get('extract')
  @ApiOperation({ 
    summary: '만세력 기반 사주 추출 (십성, 지장간, 12운성, 12신살 포함)',
    description: '생년월일시를 입력받아 만세력 데이터베이스에서 사주 정보와 십성, 지장간, 12운성, 12신살을 추출합니다. 일간을 기준으로 각 문자의 십성을 계산하고, 각 지지의 지장간(本氣, 中氣, 餘氣), 12운성(장생, 목욕, 관대 등), 그리고 년지 기준 12신살을 함께 반환합니다.'
  })
  @ApiQuery({ name: 'year', description: '년도 (1900-2100)', type: Number })
  @ApiQuery({ name: 'month', description: '월 (1-12)', type: Number })
  @ApiQuery({ name: 'day', description: '일 (1-31)', type: Number })
  @ApiQuery({ name: 'hour', description: '시간 (0-23)', type: Number })
  @ApiQuery({ name: 'minute', description: '분 (0-59)', type: Number, required: false })
  @ApiQuery({ name: 'isSolar', description: '양력 여부 (true: 양력, false: 음력)', type: Boolean, required: false })
  @ApiQuery({ name: 'isLeapMonth', description: '윤달 여부 (음력인 경우만)', type: Boolean, required: false })
  @ApiResponse({
    status: 200,
    description: '사주 정보 추출 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' },
        formatted: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
  @ApiResponse({ status: 404, description: '해당 날짜의 만세력 데이터를 찾을 수 없음' })
  async extractSaju(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('day', ParseIntPipe) day: number,
    @Query('hour', ParseIntPipe) hour: number,
    @Query('minute') minute?: number,
    @Query('isSolar') isSolar?: boolean,
    @Query('isLeapMonth') isLeapMonth?: boolean,
  ) {
    try {
      // 입력 값 검증
      this.validateInput(year, month, day, hour, minute);

      // 기본 사주 정보 및 십성, 지장간 추출
      const result = await this.sajuService.getSajuWithTenStars(
        year,
        month,
        day,
        hour,
        minute || 0,
        isSolar ?? true, // 기본값: 양력
        isLeapMonth || false
      );

      // 12운성 정보 계산
      const twelveLifeStages = this.sajuService.calculateTwelveLifeStages(result);

      // 12신살 정보 계산
      const twelveSinsal = this.sajuService.calculateTwelveSinsalFromSaju(result);

      // 확장된 결과 객체 생성
      const extendedResult = {
        ...result,
        twelveLifeStages,
        twelveSinsal
      };

      return {
        success: true,
        message: '사주 추출이 성공적으로 완료되었습니다. (십성, 지장간, 12운성, 12신살 정보 포함)',
        data: extendedResult,
        formatted: this.formatSajuWithTenStarsLifeStagesAndSinsal(extendedResult)
      };
    } catch (error: any) {
      if (error.message?.includes('만세력 데이터에서 해당 날짜를 찾을 수 없습니다')) {
        throw new HttpException(
          '해당 날짜의 만세력 데이터를 찾을 수 없습니다. 1900년~2100년 범위 내의 날짜를 입력해주세요.',
          HttpStatus.NOT_FOUND
        );
      }
      
      if (error.message?.includes('CalendarDataRepository가 주입되지 않았습니다')) {
        throw new HttpException(
          '만세력 데이터베이스 연결에 문제가 있습니다.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      throw new HttpException(
        `사주 추출 중 오류가 발생했습니다: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 만세력 기반 완전한 사주 분석 API (십성, 지장간, 12운성, 12신살 포함)
   */
  @Get('comprehensive')
  @ApiOperation({ 
    summary: '완전한 사주 분석',
    description: '생년월일시를 입력받아 만세력 데이터베이스에서 사주 정보와 십성, 지장간, 12운성, 12신살을 포함한 완전한 분석을 제공합니다.'
  })
  @ApiQuery({ name: 'year', description: '년도 (1900-2100)', type: Number })
  @ApiQuery({ name: 'month', description: '월 (1-12)', type: Number })
  @ApiQuery({ name: 'day', description: '일 (1-31)', type: Number })
  @ApiQuery({ name: 'hour', description: '시간 (0-23)', type: Number })
  @ApiQuery({ name: 'minute', description: '분 (0-59)', type: Number, required: false })
  @ApiQuery({ name: 'isSolar', description: '양력 여부 (true: 양력, false: 음력)', type: Boolean, required: false })
  @ApiQuery({ name: 'isLeapMonth', description: '윤달 여부 (음력인 경우만)', type: Boolean, required: false })
  @ApiQuery({ name: 'includeTenStars', description: '십성 분석 포함 여부', type: Boolean, required: false })
  @ApiQuery({ name: 'includeHiddenStems', description: '지장간 분석 포함 여부', type: Boolean, required: false })
  @ApiQuery({ name: 'includeTwelveLifeStages', description: '12운성 분석 포함 여부', type: Boolean, required: false })
  @ApiQuery({ name: 'includeTwelveSpirits', description: '12신살 분석 포함 여부', type: Boolean, required: false })
  @ApiQuery({ name: 'includeDetailedAnalysis', description: '상세 분석 포함 여부', type: Boolean, required: false })
  @ApiResponse({
    status: 200,
    description: '완전한 사주 분석 정보',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' },
        formatted: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
  @ApiResponse({ status: 404, description: '해당 날짜의 만세력 데이터를 찾을 수 없음' })
  async extractComprehensiveSaju(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('day', ParseIntPipe) day: number,
    @Query('hour', ParseIntPipe) hour: number,
    @Query('minute') minute?: number,
    @Query('isSolar') isSolar?: boolean,
    @Query('isLeapMonth') isLeapMonth?: boolean,
    @Query('includeTenStars') includeTenStars?: boolean,
    @Query('includeHiddenStems') includeHiddenStems?: boolean,
    @Query('includeTwelveLifeStages') includeTwelveLifeStages?: boolean,
    @Query('includeTwelveSpirits') includeTwelveSpirits?: boolean,
    @Query('includeDetailedAnalysis') includeDetailedAnalysis?: boolean,
  ) {
    try {
      // 입력 값 검증
      this.validateInput(year, month, day, hour, minute);

      const result = await this.sajuService.extractComprehensiveSaju(
        {
          year,
          month,
          day,
          hour,
          minute: minute || 0,
          isSolar: isSolar ?? true,
          isLeapMonth: isLeapMonth || false
        },
        {
          includeTenStars: includeTenStars ?? true,
          includeHiddenStems: includeHiddenStems ?? true,
          includeTwelveLifeStages: includeTwelveLifeStages ?? true,
          includeTwelveSpirits: includeTwelveSpirits ?? true,
          includeDetailedAnalysis: includeDetailedAnalysis ?? true
        }
      );

      return {
        success: true,
        message: '완전한 사주 분석이 성공적으로 완료되었습니다.',
        data: result,
        formatted: this.sajuService.formatComprehensiveSaju(result)
      };
    } catch (error: any) {
      if (error.message?.includes('만세력 데이터에서 해당 날짜를 찾을 수 없습니다')) {
        throw new HttpException(
          '해당 날짜의 만세력 데이터를 찾을 수 없습니다. 1900년~2100년 범위 내의 날짜를 입력해주세요.',
          HttpStatus.NOT_FOUND
        );
      }
      
      if (error.message?.includes('CalendarDataRepository가 주입되지 않았습니다')) {
        throw new HttpException(
          '만세력 데이터베이스 연결에 문제가 있습니다.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      throw new HttpException(
        `완전한 사주 분석 중 오류가 발생했습니다: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 특정 간지일 찾기 API
   */
  @Get('find-ganzhi-day')
  @ApiOperation({ 
    summary: '특정 간지일 찾기',
    description: '특정 간지(갑자, 을축 등)에 해당하는 날짜들을 찾습니다.'
  })
  @ApiQuery({ name: 'ganzhi', description: '찾을 간지 (예: 甲子, 乙丑)', type: String })
  @ApiQuery({ name: 'year', description: '검색할 년도', type: Number, required: false })
  @ApiQuery({ name: 'limit', description: '결과 개수 제한 (기본값: 10)', type: Number, required: false })
  async findGanzhiDay(
    @Query('ganzhi') ganzhi: string,
    @Query('year') year?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      if (!ganzhi || ganzhi.length !== 2) {
        throw new HttpException(
          '올바른 간지를 입력해주세요 (예: 甲子, 乙丑)',
          HttpStatus.BAD_REQUEST
        );
      }

      // Repository를 통해 특정 간지일 찾기
      const repository = this.sajuService['calendarDataRepository'];
      if (!repository) {
        throw new HttpException(
          '만세력 데이터베이스 연결에 문제가 있습니다.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      const results = await repository.findByGanzhi(ganzhi, 'day', limit || 10);
      
      const formattedResults = results.map(data => ({
        date: `${data.cd_sy}년 ${data.cd_sm}월 ${data.cd_sd}일`,
        lunarDate: `${data.cd_ly}년 ${data.cd_lm}월 ${data.cd_ld}일`,
        dayPillar: `${data.cd_hdganjee} (${data.cd_kdganjee})`,
        weekElement: `${data.cd_hweek} (${data.cd_kweek})`,
        constellation: data.cd_stars,
        zodiacAnimal: data.cd_ddi,
        isLeapMonth: data.cd_leap_month === 1
      }));

      return {
        success: true,
        message: `${ganzhi}일에 해당하는 날짜를 ${results.length}개 찾았습니다.`,
        ganzhi,
        count: results.length,
        results: formattedResults
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `간지일 검색 중 오류가 발생했습니다: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 시주 계산 테스트 API
   */
  @Get('test-hour-pillar')
  @ApiOperation({ 
    summary: '시주 계산 테스트',
    description: '특정 일간과 시간을 기준으로 시주를 계산합니다.'
  })
  @ApiQuery({ name: 'dayStem', description: '일간 (예: 甲, 乙, 丙)', type: String })
  @ApiQuery({ name: 'hour', description: '시간 (0-23)', type: Number })
  @ApiQuery({ name: 'minute', description: '분 (0-59)', type: Number, required: false })
  async testHourPillar(
    @Query('dayStem') dayStem: string,
    @Query('hour', ParseIntPipe) hour: number,
    @Query('minute') minute?: number,
  ) {
    try {
      if (!dayStem || dayStem.length !== 1) {
        throw new HttpException(
          '올바른 일간을 입력해주세요 (예: 甲, 乙, 丙)',
          HttpStatus.BAD_REQUEST
        );
      }

      if (hour < 0 || hour > 23) {
        throw new HttpException(
          '시간은 0-23 범위로 입력해주세요.',
          HttpStatus.BAD_REQUEST
        );
      }

      const { HourPillarUtils } = await import('./utils/hour-pillar.utils');
      const result = HourPillarUtils.calculateHourPillar(dayStem, hour, minute || 0);

      return {
        success: true,
        message: '시주 계산이 완료되었습니다.',
        input: {
          dayStem,
          hour,
          minute: minute || 0,
          timePeriod: HourPillarUtils.getHourPeriodName(hour, minute || 0)
        },
        result: {
          heavenlyStem: result.heavenlyStem,
          earthlyBranch: result.earthlyBranch,
          ganzhi: result.ganzhi,
          ganzhiKorean: result.ganzhiKorean,
        }
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        `시주 계산 중 오류가 발생했습니다: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 십성과 지장간 정보를 포함한 사주 정보 포맷팅 메소드
   */
  private formatSajuWithTenStars(saju: SajuFromCalendar & { 
    tenStars: TenStarsInfo; 
    hiddenStems: SajuHiddenStems;
    detailedHiddenStems: {
      year: DetailedHiddenStems;
      month: DetailedHiddenStems;
      day: DetailedHiddenStems;
      hour: DetailedHiddenStems;
    };
  }): string {
    const basicFormatted = this.sajuService.formatSajuFromCalendar(saju);
    
    const tenStarsLines = [
      '',
      '=== 십성 (十星) 정보 ===',
      '** 천간 십성 **',
      `연간: ${saju.yearPillar.heavenlyStem} → ${saju.tenStars.heavenlyStems.year} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.heavenlyStems.year)})`,
      `월간: ${saju.monthPillar.heavenlyStem} → ${saju.tenStars.heavenlyStems.month} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.heavenlyStems.month)})`,
      `일간: ${saju.dayPillar.heavenlyStem} → ${saju.tenStars.heavenlyStems.day} ⭐`,
      `시간: ${saju.hourPillar.heavenlyStem} → ${saju.tenStars.heavenlyStems.hour} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.heavenlyStems.hour)})`,
      '',
      '** 지지 십성 (지장간 본기 기준) **',
      `연지: ${saju.yearPillar.earthlyBranch} → ${saju.tenStars.earthlyBranches.year} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.earthlyBranches.year)})`,
      `월지: ${saju.monthPillar.earthlyBranch} → ${saju.tenStars.earthlyBranches.month} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.earthlyBranches.month)})`,
      `일지: ${saju.dayPillar.earthlyBranch} → ${saju.tenStars.earthlyBranches.day} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.earthlyBranches.day)})`,
      `시지: ${saju.hourPillar.earthlyBranch} → ${saju.tenStars.earthlyBranches.hour} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.earthlyBranches.hour)})`,
    ];

    const hiddenStemsLines = [
      '',
      '=== 지장간 (地藏干) 정보 ===',
      `연지 ${saju.yearPillar.earthlyBranch}: ${HiddenStemsUtils.formatHiddenStems(saju.hiddenStems.year)}`,
      `  └ ${HiddenStemsUtils.formatDetailedHiddenStems(saju.detailedHiddenStems.year)}`,
      `월지 ${saju.monthPillar.earthlyBranch}: ${HiddenStemsUtils.formatHiddenStems(saju.hiddenStems.month)}`,
      `  └ ${HiddenStemsUtils.formatDetailedHiddenStems(saju.detailedHiddenStems.month)}`,
      `일지 ${saju.dayPillar.earthlyBranch}: ${HiddenStemsUtils.formatHiddenStems(saju.hiddenStems.day)}`,
      `  └ ${HiddenStemsUtils.formatDetailedHiddenStems(saju.detailedHiddenStems.day)}`,
      `시지 ${saju.hourPillar.earthlyBranch}: ${HiddenStemsUtils.formatHiddenStems(saju.hiddenStems.hour)}`,
      `  └ ${HiddenStemsUtils.formatDetailedHiddenStems(saju.detailedHiddenStems.hour)}`,
    ];

    return basicFormatted + '\n' + tenStarsLines.join('\n') + '\n' + hiddenStemsLines.join('\n');
  }

     /**
    * 십성, 지장간, 12운성, 12신살 정보를 모두 포함한 사주 정보 포맷팅 메소드
    */
   private formatSajuWithTenStarsLifeStagesAndSinsal(saju: SajuFromCalendar & { 
     tenStars: TenStarsInfo; 
     hiddenStems: SajuHiddenStems;
     twelveLifeStages: TwelveLifeStagesInfo;
     twelveSinsal: {
       year: TwelveSinsalResult;
       month: TwelveSinsalResult;
       day: TwelveSinsalResult;
       hour: TwelveSinsalResult;
     };
   }): string {
     // 기본 사주 포맷
     const basicFormatted = this.sajuService.formatSajuFromCalendar(saju);
     
     // 십성 포맷
     const tenStarsLines = [
       '',
       '=== 십성 (十星) 정보 ===',
       '** 천간 십성 **',
       `연간: ${saju.yearPillar.heavenlyStem} → ${saju.tenStars.heavenlyStems.year} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.heavenlyStems.year)})`,
       `월간: ${saju.monthPillar.heavenlyStem} → ${saju.tenStars.heavenlyStems.month} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.heavenlyStems.month)})`,
       `일간: ${saju.dayPillar.heavenlyStem} → ${saju.tenStars.heavenlyStems.day} ⭐`,
       `시간: ${saju.hourPillar.heavenlyStem} → ${saju.tenStars.heavenlyStems.hour} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.heavenlyStems.hour)})`,
       '',
       '** 지지 십성 (지장간 본기 기준) **',
       `연지: ${saju.yearPillar.earthlyBranch} → ${saju.tenStars.earthlyBranches.year} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.earthlyBranches.year)})`,
       `월지: ${saju.monthPillar.earthlyBranch} → ${saju.tenStars.earthlyBranches.month} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.earthlyBranches.month)})`,
       `일지: ${saju.dayPillar.earthlyBranch} → ${saju.tenStars.earthlyBranches.day} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.earthlyBranches.day)})`,
       `시지: ${saju.hourPillar.earthlyBranch} → ${saju.tenStars.earthlyBranches.hour} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.earthlyBranches.hour)})`,
     ];

     // 지장간 포맷
     const hiddenStemsLines = [
       '',
       '=== 지장간 (地藏干) 정보 ===',
       `연지 ${saju.yearPillar.earthlyBranch}: ${HiddenStemsUtils.formatHiddenStems(saju.hiddenStems.year)}`,
       `월지 ${saju.monthPillar.earthlyBranch}: ${HiddenStemsUtils.formatHiddenStems(saju.hiddenStems.month)}`,
       `일지 ${saju.dayPillar.earthlyBranch}: ${HiddenStemsUtils.formatHiddenStems(saju.hiddenStems.day)}`,
       `시지 ${saju.hourPillar.earthlyBranch}: ${HiddenStemsUtils.formatHiddenStems(saju.hiddenStems.hour)}`,
     ];

     // 12운성 포맷
     const twelveLifeStagesFormatted = this.sajuService.formatTwelveLifeStages(saju.twelveLifeStages, saju);

     // 12신살 포맷 (각 지지별)
     const sinsalFormatted = this.sajuService.formatAllTwelveSinsalResults(saju.twelveSinsal, saju);

     return basicFormatted + '\n' + tenStarsLines.join('\n') + '\n' + hiddenStemsLines.join('\n') + '\n\n' + twelveLifeStagesFormatted + '\n\n' + sinsalFormatted;
   }

   /**
    * 십성, 지장간, 12신살 정보를 모두 포함한 사주 정보 포맷팅 메소드
    */
   private formatSajuWithTenStarsAndSinsal(saju: SajuFromCalendar & { 
     tenStars: TenStarsInfo; 
     hiddenStems: SajuHiddenStems;
     twelveSinsal: {
       year: TwelveSinsalResult;
       month: TwelveSinsalResult;
       day: TwelveSinsalResult;
       hour: TwelveSinsalResult;
     };
   }): string {
    // 기본 사주 포맷
    const basicFormatted = this.sajuService.formatSajuFromCalendar(saju);
    
    // 십성 포맷
    const tenStarsLines = [
      '',
      '=== 십성 (十星) 정보 ===',
      '** 천간 십성 **',
      `연간: ${saju.yearPillar.heavenlyStem} → ${saju.tenStars.heavenlyStems.year} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.heavenlyStems.year)})`,
      `월간: ${saju.monthPillar.heavenlyStem} → ${saju.tenStars.heavenlyStems.month} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.heavenlyStems.month)})`,
      `일간: ${saju.dayPillar.heavenlyStem} → ${saju.tenStars.heavenlyStems.day} ⭐`,
      `시간: ${saju.hourPillar.heavenlyStem} → ${saju.tenStars.heavenlyStems.hour} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.heavenlyStems.hour)})`,
      '',
      '** 지지 십성 (지장간 본기 기준) **',
      `연지: ${saju.yearPillar.earthlyBranch} → ${saju.tenStars.earthlyBranches.year} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.earthlyBranches.year)})`,
      `월지: ${saju.monthPillar.earthlyBranch} → ${saju.tenStars.earthlyBranches.month} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.earthlyBranches.month)})`,
      `일지: ${saju.dayPillar.earthlyBranch} → ${saju.tenStars.earthlyBranches.day} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.earthlyBranches.day)})`,
      `시지: ${saju.hourPillar.earthlyBranch} → ${saju.tenStars.earthlyBranches.hour} (${TenStarsUtils.getTenStarMeaning(saju.tenStars.earthlyBranches.hour)})`,
    ];

    // 지장간 포맷
    const hiddenStemsLines = [
      '',
      '=== 지장간 (地藏干) 정보 ===',
      `연지 ${saju.yearPillar.earthlyBranch}: ${HiddenStemsUtils.formatHiddenStems(saju.hiddenStems.year)}`,
      `월지 ${saju.monthPillar.earthlyBranch}: ${HiddenStemsUtils.formatHiddenStems(saju.hiddenStems.month)}`,
      `일지 ${saju.dayPillar.earthlyBranch}: ${HiddenStemsUtils.formatHiddenStems(saju.hiddenStems.day)}`,
      `시지 ${saju.hourPillar.earthlyBranch}: ${HiddenStemsUtils.formatHiddenStems(saju.hiddenStems.hour)}`,
    ];

         // 12신살 포맷 (각 지지별)
     const sinsalFormatted = this.sajuService.formatAllTwelveSinsalResults(saju.twelveSinsal, saju);

     return basicFormatted + '\n' + tenStarsLines.join('\n') + '\n' + hiddenStemsLines.join('\n') + '\n\n' + sinsalFormatted;
  }

  // ==================== 대운(大運) 계산 API ====================

  /**
   * 대운 전체 목록 조회 API
   */
  @Get('daeun')
  @ApiOperation({ 
    summary: '대운(大運) 전체 목록 조회',
    description: '생년월일시와 성별을 입력받아 10년 단위 대운 목록을 계산합니다. 순행/역행, 대운수, 월주 기준 간지 순환을 모두 반영합니다.'
  })
  @ApiQuery({ name: 'year', description: '생년 (1900-2100)', type: Number })
  @ApiQuery({ name: 'month', description: '생월 (1-12)', type: Number })
  @ApiQuery({ name: 'day', description: '생일 (1-31)', type: Number })
  @ApiQuery({ name: 'hour', description: '생시 (0-23)', type: Number })
  @ApiQuery({ name: 'gender', description: '성별 (남성, 여성)', enum: Gender })
  @ApiQuery({ name: 'minute', description: '생분 (0-59)', type: Number, required: false })
  @ApiQuery({ name: 'isSolar', description: '양력 여부 (true: 양력, false: 음력)', type: Boolean, required: false })
  @ApiQuery({ name: 'isLeapMonth', description: '윤달 여부 (음력인 경우만)', type: Boolean, required: false })
  @ApiResponse({
    status: 200,
    description: '대운 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' },
        formatted: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
  @ApiResponse({ status: 404, description: '해당 날짜의 만세력 데이터를 찾을 수 없음' })
  async getDaeunList(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('day', ParseIntPipe) day: number,
    @Query('hour', ParseIntPipe) hour: number,
    @Query('gender') gender: Gender,
    @Query('minute') minute?: number,
    @Query('isSolar') isSolar?: boolean,
    @Query('isLeapMonth') isLeapMonth?: boolean,
  ) {
    try {
      // 입력 값 검증
      this.validateInput(year, month, day, hour, minute);
      this.validateGender(gender);

      const result = await this.sajuService.calculateDaeunList({
        year,
        month,
        day,
        hour,
        minute: minute || 0,
        isSolar: isSolar ?? true,
        isLeapMonth: isLeapMonth || false,
        gender
      });

      return {
        success: true,
        message: '대운 목록 계산이 성공적으로 완료되었습니다.',
        data: result,
        formatted: this.sajuService.formatDaeunList(result)
      };
    } catch (error: any) {
      if (error.message?.includes('만세력 데이터에서 해당 날짜를 찾을 수 없습니다')) {
        throw new HttpException(
          '해당 날짜의 만세력 데이터를 찾을 수 없습니다. 1900년~2100년 범위 내의 날짜를 입력해주세요.',
          HttpStatus.NOT_FOUND
        );
      }
      
      throw new HttpException(
        `대운 계산 중 오류가 발생했습니다: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }



  // ==================== 대운 계산 API 끝 ====================

  // ==================== 월운(月運) 조회 API ====================

  /**
   * 월운(月運) 리스트 조회 API
   */
  @Get('monthly-fortune')
  @ApiOperation({ 
    summary: '월운(月運) 리스트 조회',
    description: '현재 월부터 시작하여 향후 여러 달의 월운 정보를 리스트로 반환합니다. 절기 기준으로 월주가 결정됩니다.'
  })
  @ApiQuery({ name: 'count', description: '조회할 월 수 (기본값: 12개월, 최대: 36개월)', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: '월운 리스트 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' },
        formatted: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getMonthlyFortuneList(
    @Query('count') count?: number,
  ) {
    try {
      // count 기본값 및 제한 설정
      const requestedCount = count || 12;
      const validatedCount = Math.max(1, Math.min(36, requestedCount)); // 1-36 범위로 제한

      const result = await this.sajuService.getMonthlyFortuneList(validatedCount);

      return {
        success: true,
        message: `현재 월부터 ${result.totalCount}개월의 월운 리스트 조회가 성공적으로 완료되었습니다.`,
        data: result,
        formatted: this.sajuService.formatMonthlyFortuneList(result)
      };
    } catch (error: any) {
      if (error.message?.includes('CalendarDataRepository가 주입되지 않았습니다')) {
        throw new HttpException(
          '만세력 데이터베이스 연결에 문제가 있습니다.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      throw new HttpException(
        `월운 리스트 조회 중 오류가 발생했습니다: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==================== 월운 조회 API 끝 ====================

  // ==================== 연운(年運) 조회 API ====================

  /**
   * 연운(年運) 리스트 조회 API
   */
  @Get('yearly-fortune')
  @ApiOperation({ 
    summary: '연운(年運) 리스트 조회',
    description: '현재 년부터 시작하여 향후 여러 년의 연운 정보를 리스트로 반환합니다. 각 년도 1월 1일 데이터를 기준으로 년주 간지를 조회합니다.'
  })
  @ApiQuery({ name: 'count', description: '조회할 년 수 (기본값: 10년, 최대: 20년)', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: '연운 리스트 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' },
        formatted: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getYearlyFortuneList(
    @Query('count') count?: number,
  ) {
    try {
      // count 기본값 및 제한 설정
      const requestedCount = count || 10;
      const validatedCount = Math.max(1, Math.min(20, requestedCount)); // 1-20 범위로 제한

      const result = await this.sajuService.getYearlyFortuneList(validatedCount);

      return {
        success: true,
        message: `현재 년부터 ${result.totalCount}년의 연운 리스트 조회가 성공적으로 완료되었습니다.`,
        data: result,
        formatted: this.sajuService.formatYearlyFortuneList(result)
      };
    } catch (error: any) {
      if (error.message?.includes('CalendarDataRepository가 주입되지 않았습니다')) {
        throw new HttpException(
          '만세력 데이터베이스 연결에 문제가 있습니다.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      throw new HttpException(
        `연운 리스트 조회 중 오류가 발생했습니다: ${error.message || error}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==================== 연운 조회 API 끝 ====================

  /**
   * 입력 값 검증 메소드
   */
  private validateInput(year: number, month: number, day: number, hour: number, minute?: number) {
    if (year < 1900 || year > 2100) {
      throw new HttpException(
        '년도는 1900년~2100년 범위 내로 입력해주세요.',
        HttpStatus.BAD_REQUEST
      );
    }

    if (month < 1 || month > 12) {
      throw new HttpException(
        '월은 1~12 범위로 입력해주세요.',
        HttpStatus.BAD_REQUEST
      );
    }

    if (day < 1 || day > 31) {
      throw new HttpException(
        '일은 1~31 범위로 입력해주세요.',
        HttpStatus.BAD_REQUEST
      );
    }

    if (hour < 0 || hour > 23) {
      throw new HttpException(
        '시간은 0~23 범위로 입력해주세요.',
        HttpStatus.BAD_REQUEST
      );
    }

    if (minute !== undefined && (minute < 0 || minute > 59)) {
      throw new HttpException(
        '분은 0~59 범위로 입력해주세요.',
        HttpStatus.BAD_REQUEST
      );
    }
  }



  /**
   * 성별 검증 메소드
   */
  private validateGender(gender: Gender) {
    if (!gender || (gender !== Gender.MALE && gender !== Gender.FEMALE)) {
      throw new HttpException(
        '성별을 올바르게 입력해주세요. (남성 또는 여성)',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * 사주 12운성 계산 API
   */
  @Get('twelve-life-stages')
  @ApiOperation({ 
    summary: '사주 12운성 계산',
    description: '생년월일시를 입력받아 사주의 12운성을 계산합니다. 일간을 기준으로 각 지지의 12운성(장생, 목욕, 관대, 임관, 제왕, 쇠, 병, 사, 묘, 절, 태, 양)을 구합니다.'
  })
  @ApiQuery({ name: 'year', description: '년도 (1900-2100)', type: Number })
  @ApiQuery({ name: 'month', description: '월 (1-12)', type: Number })
  @ApiQuery({ name: 'day', description: '일 (1-31)', type: Number })
  @ApiQuery({ name: 'hour', description: '시간 (0-23)', type: Number })
  @ApiQuery({ name: 'minute', description: '분 (0-59)', type: Number, required: false })
  @ApiQuery({ name: 'isSolar', description: '양력 여부 (true: 양력, false: 음력)', type: Boolean, required: false })
  @ApiQuery({ name: 'isLeapMonth', description: '윤달 여부 (음력인 경우만)', type: Boolean, required: false })
  @ApiResponse({
    status: 200,
    description: '12운성 계산 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' },
        formatted: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getTwelveLifeStages(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('day', ParseIntPipe) day: number,
    @Query('hour', ParseIntPipe) hour: number,
    @Query('minute') minute?: number,
    @Query('isSolar') isSolar?: boolean,
    @Query('isLeapMonth') isLeapMonth?: boolean
  ) {
    try {
      // 파라미터 검증
      this.validateInput(year, month, day, hour, minute);

      // 기본값 설정
      const validMinute = minute ?? 0;
      const validIsSolar = isSolar ?? true;
      const validIsLeapMonth = isLeapMonth ?? false;

      // 사주 정보 추출
      const saju = await this.sajuService.getSajuByDateTime(
        year, month, day, hour, validMinute, validIsSolar, validIsLeapMonth
      );

      // 12운성 계산
      const twelveLifeStages = this.sajuService.calculateTwelveLifeStages(saju);

      // 포맷팅된 결과
      const formatted = this.sajuService.formatTwelveLifeStages(twelveLifeStages, saju);

      return {
        success: true,
        message: '12운성 계산이 완료되었습니다.',
        data: {
          basicSaju: saju,
          twelveLifeStages,
        },
        formatted
      };
    } catch (error) {
      console.error('12운성 계산 오류:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `12운성 계산 중 오류가 발생했습니다: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 단일 12운성 계산 API
   */
  @Get('calculate-single-life-stage')
  @ApiOperation({ 
    summary: '단일 12운성 계산',
    description: '일간과 지지를 직접 입력받아 12운성을 계산하는 유틸리티 API입니다. 예: 일간 甲, 지지 寅 → 임관'
  })
  @ApiQuery({ name: 'dayStem', description: '일간 (천간 한자: 甲乙丙丁戊己庚辛壬癸)', type: String })
  @ApiQuery({ name: 'branch', description: '지지 (지지 한자: 子丑寅卯辰巳午未申酉戌亥)', type: String })
  @ApiResponse({
    status: 200,
    description: '12운성 계산 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async calculateSingleLifeStage(
    @Query('dayStem') dayStem: string,
    @Query('branch') branch: string
  ) {
    try {
      if (!dayStem || !branch) {
        throw new HttpException(
          '일간과 지지를 모두 입력해주세요.',
          HttpStatus.BAD_REQUEST
        );
      }

      // 12운성 계산
      const lifeStage = this.sajuService.calculateSingleTwelveLifeStage(dayStem, branch);

      // 12운성 의미
      const meaning = TwelveLifeStagesUtils.getLifeStageMeaning(lifeStage);

      return {
        success: true,
        message: '12운성 계산이 완료되었습니다.',
        data: {
          dayStem,
          branch,
          lifeStage,
          meaning
        }
      };
    } catch (error) {
      console.error('단일 12운성 계산 오류:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `12운성 계산 중 오류가 발생했습니다: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 완전한 사주 분석 API (십성, 지장간, 12운성 모두 포함)
   */
  @Get('complete-analysis')
  @ApiOperation({ 
    summary: '완전한 사주 분석 (십성 + 지장간 + 12운성)',
    description: '생년월일시를 입력받아 사주의 모든 분석 정보(십성, 지장간, 12운성)를 한 번에 제공합니다.'
  })
  @ApiQuery({ name: 'year', description: '년도 (1900-2100)', type: Number })
  @ApiQuery({ name: 'month', description: '월 (1-12)', type: Number })
  @ApiQuery({ name: 'day', description: '일 (1-31)', type: Number })
  @ApiQuery({ name: 'hour', description: '시간 (0-23)', type: Number })
  @ApiQuery({ name: 'minute', description: '분 (0-59)', type: Number, required: false })
  @ApiQuery({ name: 'isSolar', description: '양력 여부 (true: 양력, false: 음력)', type: Boolean, required: false })
  @ApiQuery({ name: 'isLeapMonth', description: '윤달 여부 (음력인 경우만)', type: Boolean, required: false })
  @ApiResponse({
    status: 200,
    description: '완전한 사주 분석 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' },
        formatted: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getCompleteAnalysis(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('day', ParseIntPipe) day: number,
    @Query('hour', ParseIntPipe) hour: number,
    @Query('minute') minute?: number,
    @Query('isSolar') isSolar?: boolean,
    @Query('isLeapMonth') isLeapMonth?: boolean
  ) {
    try {
      // 파라미터 검증
      this.validateInput(year, month, day, hour, minute);

      // 기본값 설정
      const validMinute = minute ?? 0;
      const validIsSolar = isSolar ?? true;
      const validIsLeapMonth = isLeapMonth ?? false;

      // 모든 분석 정보 포함 사주 추출
      const completeData = await this.sajuService.getSajuWithAllAnalysis(
        year, month, day, hour, validMinute, validIsSolar, validIsLeapMonth
      );

      // 각각의 포맷팅된 결과
      const formattedBasic = this.sajuService.formatSajuFromCalendar(completeData);
      const formattedTwelveLifeStages = this.sajuService.formatTwelveLifeStages(completeData.twelveLifeStages, completeData);

      return {
        success: true,
        message: '완전한 사주 분석이 완료되었습니다.',
        data: completeData,
        formatted: {
          basicSaju: formattedBasic,
          twelveLifeStages: formattedTwelveLifeStages
        }
      };
    } catch (error) {
      console.error('완전한 사주 분석 오류:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `사주 분석 중 오류가 발생했습니다: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 사주 12신살 계산 API (각 지지별)
   */
  @Get('twelve-sinsal')
  @ApiOperation({ 
    summary: '사주 12신살 계산 (각 지지별)',
    description: '생년월일시를 입력받아 사주의 각 지지별 12신살을 모두 계산합니다. 연지, 월지, 일지, 시지를 각각 기준으로 하여 4개의 12신살 결과를 제공합니다.'
  })
  @ApiQuery({ name: 'year', description: '년도 (1900-2100)', type: Number })
  @ApiQuery({ name: 'month', description: '월 (1-12)', type: Number })
  @ApiQuery({ name: 'day', description: '일 (1-31)', type: Number })
  @ApiQuery({ name: 'hour', description: '시간 (0-23)', type: Number })
  @ApiQuery({ name: 'minute', description: '분 (0-59)', type: Number, required: false })
  @ApiQuery({ name: 'isSolar', description: '양력 여부 (true: 양력, false: 음력)', type: Boolean, required: false })
  @ApiQuery({ name: 'isLeapMonth', description: '윤달 여부 (음력인 경우만)', type: Boolean, required: false })
  @ApiResponse({
    status: 200,
    description: '12신살 계산 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' },
        formatted: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async getTwelveSinsal(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('day', ParseIntPipe) day: number,
    @Query('hour', ParseIntPipe) hour: number,
    @Query('minute') minute?: number,
    @Query('isSolar') isSolar?: boolean,
    @Query('isLeapMonth') isLeapMonth?: boolean
  ) {
    try {
      // 파라미터 검증
      this.validateInput(year, month, day, hour, minute);

      // 기본값 설정
      const validMinute = minute ?? 0;
      const validIsSolar = isSolar ?? true;
      const validIsLeapMonth = isLeapMonth ?? false;

      // 사주 정보 추출
      const saju = await this.sajuService.getSajuByDateTime(
        year, month, day, hour, validMinute, validIsSolar, validIsLeapMonth
      );

      // 12신살 계산 (각 지지별)
      const twelveSinsal = this.sajuService.calculateTwelveSinsalFromSaju(saju);

      // 포맷팅된 결과
      const formatted = this.sajuService.formatAllTwelveSinsalResults(twelveSinsal, saju);

      return {
        success: true,
        message: '12신살 계산이 완료되었습니다. (각 지지별)',
        data: {
          basicSaju: saju,
          twelveSinsal,
        },
        formatted
      };
    } catch (error) {
      console.error('12신살 계산 오류:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `12신살 계산 중 오류가 발생했습니다: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * 단일 지지 12신살 계산 API
   */
  @Get('calculate-single-sinsal')
  @ApiOperation({ 
    summary: '단일 지지 12신살 계산',
    description: '특정 지지를 기준으로 12신살을 계산하는 유틸리티 API입니다. 예: 진(辰) 기준 → 화개살'
  })
  @ApiQuery({ name: 'branch', description: '기준 지지 (지지 한자: 子丑寅卯辰巳午未申酉戌亥)', type: String })
  @ApiResponse({
    status: 200,
    description: '12신살 계산 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' },
        formatted: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async calculateSingleSinsal(
    @Query('branch') branch: string
  ) {
    try {
      if (!branch) {
        throw new HttpException(
          '기준 지지를 입력해주세요.',
          HttpStatus.BAD_REQUEST
        );
      }

      // 지지를 EarthlyBranch enum으로 변환
      const earthlyBranch = this.sajuService.convertChineseToEarthlyBranch(branch);

      // 12신살 계산
      const sinsalResult = this.sajuService.calculateTwelveSinsalResult(earthlyBranch);

      // 포맷팅된 결과
      const formatted = this.sajuService.formatTwelveSinsalResult(sinsalResult);

      return {
        success: true,
        message: '12신살 계산이 완료되었습니다.',
        data: {
          baseBranch: branch,
          sinsalResult
        },
        formatted
      };
    } catch (error) {
      console.error('단일 12신살 계산 오류:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `12신살 계산 중 오류가 발생했습니다: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
