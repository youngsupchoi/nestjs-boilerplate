import { SajuService } from './saju.service';
import { Gender } from './enums';

// SajuService를 상속받아 디버깅 정보를 출력하는 클래스
class DebugSajuService extends SajuService {
  // private 메서드를 public으로 노출
  public debugGetJDN(year: number, month: number, day: number): number {
    return (this as any).getJDN(year, month, day);
  }
  
  public debugCalculateDayPillar(date: Date) {
    return (this as any).calculateDayPillar(date);
  }
}

// 디버깅 실행
async function debug() {
  const service = new DebugSajuService();
  
  console.log('=== JDN 계산 테스트 ===');
  
  // 기준일 테스트: 1982년 4월 16일 = 기사(己巳)일
  const baseJDN = service.debugGetJDN(1982, 4, 16);
  console.log(`1982-04-16 JDN: ${baseJDN}`);
  
  // 검증된 날짜 테스트: 1999년 12월 14일 = 경자(庚子)일
  const testJDN1 = service.debugGetJDN(1999, 12, 14);
  console.log(`1999-12-14 JDN: ${testJDN1}`);
  console.log(`일수 차이: ${testJDN1 - baseJDN}`);
  
  // 문제가 있는 날짜 테스트: 1954년 8월 23일
  const testJDN2 = service.debugGetJDN(1954, 8, 23);
  console.log(`1954-08-23 JDN: ${testJDN2}`);
  console.log(`일수 차이: ${testJDN2 - baseJDN}`);
  
  console.log('\n=== 일주 계산 테스트 ===');
  
  // 1982년 4월 16일 테스트 (기사일이 나와야 함)
  const date1 = new Date(1982, 3, 16, 12, 0);
  const pillar1 = service.debugCalculateDayPillar(date1);
  console.log(`1982-04-16: ${pillar1.ganzhi}`);
  
  // 1999년 12월 14일 테스트 (경자일이 나와야 함)
  const date2 = new Date(1999, 11, 14, 12, 0);
  const pillar2 = service.debugCalculateDayPillar(date2);
  console.log(`1999-12-14: ${pillar2.ganzhi}`);
  
  // 1954년 8월 23일 테스트
  const date3 = new Date(1954, 7, 23, 12, 33);
  const pillar3 = service.debugCalculateDayPillar(date3);
  console.log(`1954-08-23: ${pillar3.ganzhi}`);
  
  // 2000년 3월 7일 테스트 (기묘일이 나와야 함)
  const date4 = new Date(2000, 2, 7, 12, 34);
  const pillar4 = service.debugCalculateDayPillar(date4);
  console.log(`2000-03-07: ${pillar4.ganzhi} (정답: 기묘)`);
}

debug().catch(console.error);

