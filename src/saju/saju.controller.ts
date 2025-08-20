import { Controller, Get, Query, HttpStatus, HttpException, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SajuService } from './saju.service';
import { SajuFromCalendar } from './interfaces/saju-from-calendar.interface';
import { ComprehensiveSaju } from './interfaces/comprehensive-saju.interface';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';

@ApiTags('사주')
@Controller('saju')
@AuthGuard(AuthType.None) // 공개 API로 설정
export class SajuController {
  constructor(private readonly sajuService: SajuService) {}

  /**
   * 만세력 기반 사주 추출 API (기본 정보만)
   */
  @Get('extract')
  @ApiOperation({ 
    summary: '만세력 기반 사주 추출 (기본)',
    description: '생년월일시를 입력받아 만세력 데이터베이스에서 기본 사주 정보를 추출합니다.'
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

      const result = await this.sajuService.getSajuByDateTime(
        year,
        month,
        day,
        hour,
        minute || 0,
        isSolar ?? true, // 기본값: 양력
        isLeapMonth || false
      );

      return {
        success: true,
        message: '사주 추출이 성공적으로 완료되었습니다.',
        data: result,
        formatted: this.sajuService.formatSajuFromCalendar(result)
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
}
