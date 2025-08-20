# 데이터베이스 마이그레이션 스크립트

이 폴더는 데이터베이스 관련 독립적인 스크립트들을 포함합니다.
다른 애플리케이션 로직과 완전히 분리되어 있습니다.

## 포함된 스크립트

### 1. MySQL 테스트 스크립트 (`test-mysql-connection.ts`)
MySQL 데이터베이스 연결 및 데이터 조회 테스트

### 2. MySQL to PostgreSQL 마이그레이션 (`migrate-mysql-to-postgres.ts`)
MySQL의 calenda_data 테이블을 PostgreSQL로 마이그레이션

---

## MySQL 테스트 스크립트

### 사전 준비
로컬에 MySQL이 실행 중이어야 하며, 다음 설정이 되어 있어야 합니다:
- 데이터베이스: `mydatabase`
- 사용자: `myuser`
- 비밀번호: `mypassword`
- 테이블: `calenda_data`

### 실행
```bash
npm run test:mysql
```

---

## MySQL to PostgreSQL 마이그레이션

### 사전 준비

1. **PostgreSQL 연결 설정**
   프로젝트 루트의 `.env` 파일에 다음 환경 변수를 설정하세요:
   ```
   TYPEORM_HOST=localhost
   TYPEORM_PORT=5432
   TYPEORM_USERNAME=postgres
   TYPEORM_PASSWORD=yourpassword
   TYPEORM_DATABASE=garden_of_fortune
   ```

2. **MySQL 데이터베이스 준비**
   - 위의 MySQL 설정이 완료되어 있어야 합니다
   - `calenda_data` 테이블에 데이터가 있어야 합니다

### 실행
```bash
npm run migrate:mysql-to-pg
```

### 기능
- PostgreSQL에 `calenda_data` 테이블 자동 생성
- 인덱스 자동 생성 (연도/월/일 검색 최적화)
- 배치 처리로 대용량 데이터 효율적 마이그레이션 (1000개씩)
- 진행 상황 실시간 표시
- 데이터 검증 및 샘플 출력
- 트랜잭션 처리로 데이터 무결성 보장

## 제거 방법

이 테스트 스크립트가 더 이상 필요하지 않으면, 다음과 같이 제거하세요:

```bash
# scripts 폴더 전체 삭제
rm -rf scripts/

# package.json에서 스크립트 제거
# "test:mysql" 라인을 삭제하세요
```

## 주의사항
- 이 스크립트는 테스트 목적으로만 사용됩니다
- 프로덕션 환경에서는 사용하지 마세요
- 데이터베이스 연결 정보를 하드코딩하지 마세요 (실제 환경에서는 환경변수 사용)
