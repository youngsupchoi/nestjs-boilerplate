# 챗 프롬프트 시스템 사용 가이드

## 개요

챗 서비스에 YAML 기반 프롬프트 템플릿 시스템이 추가되었습니다. 이 시스템을 통해 다양한 상황에 맞는 전문적인 프롬프트를 미리 정의하고, 동적 변수 주입을 통해 개인화된 상담을 제공할 수 있습니다.

## 주요 기능

- **YAML 기반 프롬프트 관리**: 프롬프트를 YAML 파일로 관리하여 쉽게 수정 가능
- **Handlebars 템플릿 엔진**: `{{variable}}` 형태의 변수 주입 지원
- **변수 검증**: 필수 변수 누락 시 자동으로 오류 반환
- **다양한 상담 템플릿**: 운세, 연애, 진로, 건강 등 다양한 분야별 전문 프롬프트
- **API 통합**: 기존 챗 API에 완전히 통합되어 쉽게 사용 가능

## 파일 구조

```
src/chat/
├── prompts/
│   └── chat-prompts.yaml          # 프롬프트 템플릿 정의
├── services/
│   └── prompt.service.ts          # 프롬프트 로더 및 처리 서비스
├── dto/
│   └── send-message-with-prompt.dto.ts  # 프롬프트용 DTO
├── chat.service.ts                # 메인 챗 서비스 (프롬프트 통합)
├── chat.controller.ts             # API 컨트롤러 (프롬프트 엔드포인트 추가)
└── chat.module.ts                 # 모듈 설정 (PromptService 추가)
```

## API 사용법

### 1. 사용 가능한 프롬프트 템플릿 목록 조회

```http
GET /chat/prompts
Authorization: Bearer {token}
```

**응답 예시:**
```json
[
  {
    "key": "fortune_telling",
    "name": "운세 상담",
    "description": "사용자의 생년월일과 성별을 기반으로 사주팔자 운세를 제공",
    "variables": ["birthDate", "gender", "year", "month"]
  },
  {
    "key": "relationship_counseling", 
    "name": "연애/결혼 상담",
    "description": "연애, 결혼, 인간관계 고민 상담",
    "variables": ["consultationType", "userAge", "userGender"]
  }
]
```

### 2. 프롬프트 템플릿을 사용한 메시지 전송

```http
POST /chat/messages/with-prompt
Authorization: Bearer {token}
Content-Type: application/json

{
  "sessionId": 1,
  "content": "1990년 3월 15일생 남성입니다. 2024년 운세를 알고 싶어요.",
  "promptTemplate": "fortune_telling",
  "promptVariables": {
    "birthDate": "1990년 3월 15일",
    "gender": "남성", 
    "year": "2024",
    "month": "12"
  }
}
```

**응답 예시:**
```json
{
  "reply": "1990년 3월 15일생 남성분의 2024년 12월 운세를 봐드리겠습니다...",
  "usedPromptTemplate": "fortune_telling",
  "systemPrompt": "당신은 30년 경력의 전문 사주명리학자입니다..."
}
```

### 3. 특정 프롬프트 템플릿 정보 조회

```http
GET /chat/prompts/fortune_telling
Authorization: Bearer {token}
```

### 4. 프롬프트 템플릿 예시 조회

```http
GET /chat/prompts/fortune_telling/example
Authorization: Bearer {token}
```

**응답 예시:**
```json
{
  "userMessage": "1990년 3월 15일생 남성입니다. 2024년 운세를 알고 싶어요.",
  "variablesUsed": {
    "birthDate": "1990년 3월 15일",
    "gender": "남성",
    "year": "2024", 
    "month": "12"
  },
  "generatedSystemPrompt": "당신은 30년 경력의 전문 사주명리학자입니다. 사용자의 1990년 3월 15일(생년월일)와 남성을 기반으로..."
}
```

## 프롬프트 템플릿 추가하기

### YAML 파일에 새 템플릿 추가

`src/chat/prompts/chat-prompts.yaml` 파일에 다음 형식으로 추가:

```yaml
new_template_key:
  name: "템플릿 이름"
  description: "템플릿 설명"
  system_prompt: |
    시스템 프롬프트 내용...
    변수는 {{variableName}} 형태로 사용
  variables:
    - variableName1
    - variableName2
  example:
    user_message: "예시 사용자 메시지"
    variables_injected:
      variableName1: "예시 값1"
      variableName2: "예시 값2"
```

### Handlebars 헬퍼 사용

템플릿에서 사용할 수 있는 헬퍼들:

```yaml
system_prompt: |
  현재 날짜: {{formatDate currentDate 'YYYY년 MM월 DD일'}}
  조건부: {{#if_equals gender '남성'}}남성용 조언{{else}}여성용 조언{{/if_equals}}
  기본값: {{default userName '고객'}}님 안녕하세요
```

## 내장 변수

모든 템플릿에서 자동으로 사용할 수 있는 변수들:

- `currentDate`: 현재 날짜 (YYYY-MM-DD)
- `currentYear`: 현재 연도
- `currentMonth`: 현재 월
- `currentDay`: 현재 일

## 실제 사용 예시

### 운세 상담 예시

```javascript
// 클라이언트 측 코드
const response = await fetch('/chat/messages/with-prompt', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: sessionId,
    content: '1985년 7월 20일생 여성입니다. 내년 연애운이 궁금해요.',
    promptTemplate: 'fortune_telling',
    promptVariables: {
      birthDate: '1985년 7월 20일',
      gender: '여성',
      year: '2025',
      month: '1'
    }
  })
});
```

### 진로 상담 예시

```javascript
const response = await fetch('/chat/messages/with-prompt', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: sessionId,
    content: 'IT 개발자로 전직하려고 합니다.',
    promptTemplate: 'career_guidance',
    promptVariables: {
      field: 'IT 개발',
      experience: '비전공 신입',
      currentTrends: 'AI, 풀스택, 클라우드'
    }
  })
});
```

## 개발 시 유용한 기능

### 프롬프트 파일 다시 로드

```http
POST /chat/prompts/reload
Authorization: Bearer {token}
```

개발 중 YAML 파일을 수정한 후 서버 재시작 없이 변경사항을 반영할 수 있습니다.

## 오류 처리

### 필수 변수 누락

```json
{
  "statusCode": 404,
  "message": "필수 변수가 누락되었습니다: birthDate, gender"
}
```

### 존재하지 않는 템플릿

```json
{
  "statusCode": 404, 
  "message": "존재하지 않는 프롬프트 템플릿: invalid_template"
}
```

## 주의사항

1. **변수명 일치**: YAML에서 정의한 변수명과 API 요청의 변수명이 정확히 일치해야 합니다.
2. **필수 변수**: `variables` 배열에 정의된 모든 변수는 필수입니다.
3. **한국어 지원**: 변수값에 한국어 사용 시 UTF-8 인코딩을 확인하세요.
4. **템플릿 캐싱**: 프롬프트 파일은 서비스 시작 시 로드되므로, 변경 후 `/prompts/reload` 호출이 필요합니다.
