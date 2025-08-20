# 🎯 만세력 기반 사주 추출 API - 완성된 통합 가이드

PostgreSQL 데이터베이스와 완전히 통합된 만세력 기반 사주 추출 기능이 구현되었습니다.

## 📊 구현된 기능 요약

### ✅ 완료된 작업들

1. **CalendarData Entity** - PostgreSQL에 최적화
2. **CalendarDataRepository** - 데이터 조회 로직
3. **SajuService** - 만세력 기반 사주 추출 함수들
4. **SajuController** - REST API 엔드포인트들
5. **SajuModule** - 완전한 모듈 설정
6. **App.module.ts** - 전체 애플리케이션 통합

### 🌟 제공되는 API 엔드포인트

## 1. 사주 추출 API

```http
GET /saju/extract?year=1990&month=5&day=15&hour=14&minute=30&isSolar=true
```

**파라미터:**
- `year`: 년도 (1900-2100)
- `month`: 월 (1-12)
- `day`: 일 (1-31)
- `hour`: 시간 (0-23)
- `minute`: 분 (0-59, 선택사항)
- `isSolar`: 양력 여부 (true: 양력, false: 음력)
- `isLeapMonth`: 윤달 여부 (음력인 경우만)

**응답 예시:**
```json
{
  "success": true,
  "message": "사주 추출이 성공적으로 완료되었습니다.",
  "data": {
    "birthInfo": {
      "year": 1990,
      "month": 5,
      "day": 15,
      "hour": 14,
      "minute": 30,
      "isSolar": true
    },
    "yearPillar": {
      "heavenlyStem": "庚",
      "earthlyBranch": "午",
      "ganzhi": "庚午",
      "ganzhiKorean": "경오"
    },
    "monthPillar": {
      "heavenlyStem": "辛",
      "earthlyBranch": "巳",
      "ganzhi": "辛巳",
      "ganzhiKorean": "신사"
    },
    "dayPillar": {
      "heavenlyStem": "庚",
      "earthlyBranch": "辰",
      "ganzhi": "庚辰",
      "ganzhiKorean": "경진"
    },
    "hourPillar": {
      "heavenlyStem": "癸",
      "earthlyBranch": "未",
      "ganzhi": "癸未",
      "ganzhiKorean": "계미"
    },
    "additionalInfo": {
      "solarYear": 1990,
      "solarMonth": 5,
      "solarDay": 15,
      "lunarYear": 1990,
      "lunarMonth": 4,
      "lunarDay": 21,
      "isLeapMonth": false,
      "weekElement": "火",
      "weekElementKorean": "화",
      "constellation": "翼",
      "zodiacAnimal": "말"
    }
  },
  "formatted": "=== 만세력 기반 사주 정보 ===\n생년월일시: 1990년 5월 15일 14시 30분\n..."
}
```

## 2. 특정 간지일 찾기 API

```http
GET /saju/find-ganzhi-day?ganzhi=甲子&limit=5
```

**응답 예시:**
```json
{
  "success": true,
  "message": "甲子일에 해당하는 날짜를 5개 찾았습니다.",
  "ganzhi": "甲子",
  "count": 5,
  "results": [
    {
      "date": "1900년 10월 18일",
      "lunarDate": "1900년 9월 25일",
      "dayPillar": "甲子 (갑자)",
      "weekElement": "木 (목)",
      "constellation": "奎",
      "zodiacAnimal": "돼지",
      "isLeapMonth": false
    }
  ]
}
```

## 3. 시주 계산 테스트 API

```http
GET /saju/test-hour-pillar?dayStem=甲&hour=14&minute=30
```

**응답 예시:**
```json
{
  "success": true,
  "message": "시주 계산이 완료되었습니다.",
  "input": {
    "dayStem": "甲",
    "hour": 14,
    "minute": 30,
    "timePeriod": "미시"
  },
  "result": {
    "heavenlyStem": "辛",
    "earthlyBranch": "未",
    "ganzhi": "辛未",
    "ganzhiKorean": "신미"
  }
}
```

## 🛠 서비스에서 직접 사용

Controller를 통하지 않고 서비스에서 직접 사용하는 방법:

```typescript
import { Injectable } from '@nestjs/common';
import { SajuService } from '../saju/saju.service';

@Injectable()
export class YourService {
  constructor(private readonly sajuService: SajuService) {}

  async getUserSaju(userId: number) {
    // 사용자 정보 조회 후
    const userBirthData = await this.getUserBirthData(userId);

    // 사주 추출
    const saju = await this.sajuService.getSajuByDateTime(
      userBirthData.year,
      userBirthData.month,
      userBirthData.day,
      userBirthData.hour,
      userBirthData.minute,
      userBirthData.isSolar
    );

    return saju;
  }
}
```

## 🔧 데이터베이스 설정

현재 설정된 PostgreSQL 연결 정보:

```typescript
// app.module.ts에서 설정됨
{
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  // ...
}
```

## 📚 주요 파일들

### Entity
- `src/saju/entities/calendar-data.entity.ts` - 만세력 데이터 엔티티

### Repository
- `src/saju/repositories/calendar-data.repository.ts` - 데이터 조회 로직

### Service
- `src/saju/saju.service.ts` - 사주 추출 비즈니스 로직

### Controller
- `src/saju/saju.controller.ts` - REST API 엔드포인트

### Utils
- `src/saju/utils/hour-pillar.utils.ts` - 시주 계산 유틸리티

### Interfaces
- `src/saju/interfaces/saju-from-calendar.interface.ts` - 타입 정의

## 🎯 특징

### 1. 정확성
- 200년간의 만세력 데이터 기반 (1900-2100년)
- 양력/음력 모두 지원
- 오자시법에 따른 정확한 시주 계산

### 2. 완전성
- 연주, 월주, 일주, 시주 모두 제공
- 일진 오행, 28수, 띠 정보 포함
- 양력/음력 변환 정보

### 3. 안정성
- 입력 값 검증
- 상세한 에러 처리
- PostgreSQL 연결 최적화

### 4. 확장성
- 모듈화된 구조
- 재사용 가능한 컴포넌트들
- 쉬운 기능 확장

## 🚀 사용 시작하기

1. **애플리케이션 실행**
```bash
npm run start
```

2. **API 테스트**
```bash
curl "http://localhost:3000/saju/extract?year=1990&month=5&day=15&hour=14&minute=30&isSolar=true"
```

3. **Swagger 문서 확인**
```
http://localhost:3000/api
```

이제 완전히 통합된 만세력 기반 사주 추출 시스템을 사용하실 수 있습니다! 🎉
