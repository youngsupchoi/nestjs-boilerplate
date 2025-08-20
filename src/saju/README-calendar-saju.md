# 만세력 기반 사주 추출 기능

만세력 데이터베이스를 활용하여 생년월일시로부터 사주(연주, 월주, 일주, 시주)를 정확하게 추출하는 기능입니다.

## 주요 특징

- 🗓️ **정확한 데이터**: 1900년~2100년 만세력 데이터 기반
- 🌙 **양력/음력 지원**: 양력과 음력 모두 처리 가능
- 🕐 **시주 계산**: 오자시법에 따른 정확한 시주 계산
- 🎯 **완전한 사주**: 연주, 월주, 일주, 시주 모든 정보 제공

## 설치 및 설정

### 1. 만세력 데이터베이스 import

```sql
-- MySQL에 만세력 데이터 import
mysql -u username -p database_name < 20080402.sql
```

### 2. 모듈 사용

```typescript
import { SajuService } from './saju/saju.service';

// 의존성 주입을 통해 SajuService 사용
export class YourController {
  constructor(
    private readonly sajuService: SajuService,
  ) {}
}
```

## 사용법

### 기본 사용법

```typescript
// 양력 생년월일시로 사주 추출
const result = await sajuService.getSajuByDateTime(
  1990, // 년
  1,    // 월
  15,   // 일
  14,   // 시
  30,   // 분 (선택사항)
  true  // 양력 여부
);

console.log(result);
```

### 음력 생년월일시

```typescript
// 음력 생년월일시로 사주 추출
const result = await sajuService.getSajuByDateTime(
  1990, // 년
  12,   // 월
  1,    // 일
  10,   // 시
  0,    // 분
  false // 음력
);
```

### 상세 파라미터 사용

```typescript
// 상세 파라미터를 사용한 사주 추출
const result = await sajuService.extractSajuFromCalendar({
  year: 1990,
  month: 12,
  day: 1,
  hour: 10,
  minute: 0,
  isSolar: false,        // 음력
  isLeapMonth: false,    // 윤달 여부
});
```

## 결과 데이터 구조

```typescript
interface SajuFromCalendar {
  birthInfo: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    isSolar: boolean;
  };

  // 연주 (年柱)
  yearPillar: {
    heavenlyStem: string;    // 천간 (한자)
    earthlyBranch: string;   // 지지 (한자)
    ganzhi: string;          // 간지 조합 (한자)
    ganzhiKorean: string;    // 간지 조합 (한글)
  };

  // 월주 (月柱)
  monthPillar: { /* 동일한 구조 */ };
  
  // 일주 (日柱)  
  dayPillar: { /* 동일한 구조 */ };
  
  // 시주 (時柱)
  hourPillar: { /* 동일한 구조 */ };

  // 추가 정보
  additionalInfo: {
    solarYear: number;           // 양력 년도
    solarMonth: number;          // 양력 월
    solarDay: number;            // 양력 일
    lunarYear: number;           // 음력 년도
    lunarMonth: number;          // 음력 월
    lunarDay: number;            // 음력 일
    isLeapMonth: boolean;        // 윤달 여부
    weekElement: string;         // 일진 오행 (한자)
    weekElementKorean: string;   // 일진 오행 (한글)
    constellation: string;       // 28수 별자리
    zodiacAnimal: string;        // 띠 동물
  };
}
```

## 출력 예시

```typescript
// 보기 좋은 형태로 포맷팅
const formatted = sajuService.formatSajuFromCalendar(result);
console.log(formatted);

/*
=== 만세력 기반 사주 정보 ===
생년월일시: 1990년 1월 15일 14시 30분
입력 기준: 양력

=== 사주 (四柱) ===
연주 (年柱): 己巳 (기사)
월주 (月柱): 丁丑 (정축)
일주 (日柱): 甲辰 (갑진)
시주 (時柱): 辛未 (신미)

=== 추가 정보 ===
양력: 1990년 1월 15일
음력: 1989년 12월 19일
일진 오행: 木 (목)
28수: 房
띠: 뱀
*/
```

## 시주 계산 원리

시주는 **오자시법(五子時法)**에 따라 계산됩니다:

- **자시**: 23:00-01:00
- **축시**: 01:00-03:00  
- **인시**: 03:00-05:00
- **묘시**: 05:00-07:00
- **진시**: 07:00-09:00
- **사시**: 09:00-11:00
- **오시**: 11:00-13:00
- **미시**: 13:00-15:00
- **신시**: 15:00-17:00
- **유시**: 17:00-19:00
- **술시**: 19:00-21:00
- **해시**: 21:00-23:00

시간의 천간은 일간에 따라 결정됩니다:

- 갑/기일: 갑자시부터 시작
- 을/경일: 병자시부터 시작
- 병/신일: 무자시부터 시작
- 정/임일: 경자시부터 시작
- 무/계일: 임자시부터 시작

## 테스트

```bash
# 시주 계산 테스트 (DB 연결 불필요)
npm run ts-node src/saju/test-calendar-saju.ts

# 전체 기능 테스트 (DB 연결 필요)
# 테스트 파일에서 DB 설정 후 testCalendarBasedSaju() 함수 실행
```

## 에러 처리

```typescript
try {
  const result = await sajuService.getSajuByDateTime(2200, 1, 1, 12, 0, true);
} catch (error) {
  if (error.message.includes('만세력 데이터에서 해당 날짜를 찾을 수 없습니다')) {
    console.log('지원하지 않는 날짜 범위입니다 (1900-2100년)');
  }
}
```

## 지원 범위

- **년도**: 1900년 ~ 2100년
- **양력/음력**: 모두 지원
- **윤달**: 음력의 경우 윤달 처리
- **시간**: 24시간 (0-23시)

## 주의사항

1. 만세력 데이터베이스가 필요합니다
2. 1900년 이전이나 2100년 이후는 지원하지 않습니다
3. 음력의 경우 윤달 여부를 정확히 입력해야 합니다
4. 시간 계산은 한국 표준시 기준입니다
