import { SajuService } from './saju.service';
import { CalendarDataRepository } from './repositories/calendar-data.repository';
import { DataSource } from 'typeorm';
import { CalendarData } from './entities/calendar-data.entity';

/**
 * 만세력 기반 사주 추출 기능 테스트
 * 
 * 사용법:
 * 1. 데이터베이스 연결 설정
 * 2. testCalendarBasedSaju() 함수 실행
 */
export async function testCalendarBasedSaju() {
  try {
    console.log('=== 만세력 기반 사주 추출 테스트 시작 ===\n');

    // 테스트용 DataSource 설정 (실제 환경에서는 앱의 DataSource를 사용)
    const dataSource = new DataSource({
      type: 'mysql', // 또는 사용 중인 DB 타입
      host: 'localhost',
      port: 3306,
      username: 'your_username',
      password: 'your_password', 
      database: 'your_database',
      entities: [CalendarData],
      synchronize: false, // 만세력 데이터는 이미 있으므로 false
    });

    await dataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    // Repository와 Service 생성
    const calendarRepository = new CalendarDataRepository(
      dataSource.getRepository(CalendarData)
    );
    const sajuService = new SajuService(calendarRepository);

    // 테스트 케이스 1: 양력 생년월일시
    console.log('\n=== 테스트 1: 양력 1990년 1월 15일 14시 30분 ===');
    const result1 = await sajuService.getSajuByDateTime(
      1990, 1, 15, 14, 30, true // 양력
    );
    console.log(sajuService.formatSajuFromCalendar(result1));

    // 테스트 케이스 2: 음력 생년월일시
    console.log('\n=== 테스트 2: 음력 1990년 12월 1일 오전 10시 ===');
    const result2 = await sajuService.getSajuByDateTime(
      1990, 12, 1, 10, 0, false // 음력
    );
    console.log(sajuService.formatSajuFromCalendar(result2));

    // 테스트 케이스 3: 2100년 11월 20일 (데이터 예시와 같은 날짜)
    console.log('\n=== 테스트 3: 양력 2100년 11월 20일 오후 3시 ===');
    const result3 = await sajuService.getSajuByDateTime(
      2100, 11, 20, 15, 0, true // 양력
    );
    console.log(sajuService.formatSajuFromCalendar(result3));

    // 테스트 케이스 4: 시주 계산 검증
    console.log('\n=== 테스트 4: 다양한 시간대의 시주 검증 ===');
    const testTimes = [
      { hour: 1, minute: 0, name: '축시(01:00)' },
      { hour: 7, minute: 30, name: '진시(07:30)' },
      { hour: 13, minute: 15, name: '미시(13:15)' },
      { hour: 23, minute: 45, name: '자시(23:45)' },
    ];

    for (const time of testTimes) {
      const result = await sajuService.getSajuByDateTime(
        2000, 1, 1, time.hour, time.minute, true
      );
      console.log(`${time.name} -> 시주: ${result.hourPillar.ganzhi} (${result.hourPillar.ganzhiKorean})`);
    }

    await dataSource.destroy();
    console.log('\n✅ 테스트 완료 및 데이터베이스 연결 종료');

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
  }
}

/**
 * 간단한 시주 계산 테스트 (DB 연결 불필요)
 */
export function testHourPillarCalculation() {
  console.log('=== 시주 계산 테스트 ===\n');

  const { HourPillarUtils } = require('./utils/hour-pillar.utils');
  
  // 다양한 일간과 시간에 대한 시주 테스트
  const testCases = [
    { dayStem: '甲', hour: 0, minute: 30, expected: '甲子' },  // 갑일 자시
    { dayStem: '乙', hour: 2, minute: 0, expected: '丁丑' },   // 을일 축시
    { dayStem: '丙', hour: 6, minute: 45, expected: '辛卯' },  // 병일 묘시
    { dayStem: '丁', hour: 12, minute: 0, expected: '丙午' },  // 정일 오시
    { dayStem: '戊', hour: 18, minute: 30, expected: '辛酉' }, // 무일 유시
  ];

  for (const testCase of testCases) {
    const result = HourPillarUtils.calculateHourPillar(
      testCase.dayStem, 
      testCase.hour, 
      testCase.minute
    );
    
    const isCorrect = result.ganzhi === testCase.expected;
    const status = isCorrect ? '✅' : '❌';
    
    console.log(`${status} 일간: ${testCase.dayStem}, 시간: ${testCase.hour}:${testCase.minute.toString().padStart(2, '0')}`);
    console.log(`   계산 결과: ${result.ganzhi} (${result.ganzhiKorean})`);
    console.log(`   예상 결과: ${testCase.expected}`);
    console.log('');
  }
}

// 스크립트로 직접 실행할 경우
if (require.main === module) {
  console.log('시주 계산 테스트 실행...\n');
  testHourPillarCalculation();
  
  console.log('\n만세력 기반 사주 추출 테스트를 실행하려면 데이터베이스 설정 후 testCalendarBasedSaju() 함수를 호출하세요.');
}
