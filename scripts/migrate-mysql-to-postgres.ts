/**
 * MySQL에서 PostgreSQL로 calenda_data 테이블 마이그레이션 스크립트
 * 
 * 실행 전에 .env 파일에 PostgreSQL 연결 정보를 설정해야 합니다:
 * - TYPEORM_HOST
 * - TYPEORM_PORT
 * - TYPEORM_USERNAME
 * - TYPEORM_PASSWORD
 * - TYPEORM_DATABASE
 */

import * as mysql from 'mysql2/promise';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// MySQL 연결 설정
const mysqlConfig = {
  host: 'localhost',
  user: 'myuser',
  password: 'mypassword',
  database: 'mydatabase',
  port: 3306,
};

// PostgreSQL 연결 설정 (환경 변수에서 읽기)
const pgConfig: any = {
  host: process.env.TYPEORM_HOST || 'localhost',
  port: parseInt(process.env.TYPEORM_PORT || '5432'),
  user: process.env.TYPEORM_USERNAME || 'postgres',
  password: process.env.TYPEORM_PASSWORD || 'postgres',
  database: process.env.TYPEORM_DATABASE || 'garden_of_fortune',
  ssl: process.env.TYPEORM_HOST !== 'localhost' ? {
    rejectUnauthorized: false
  } : false
};

// 배치 사이즈 (한 번에 처리할 레코드 수)
const BATCH_SIZE = 1000;

// PostgreSQL 테이블 생성 SQL
const createTableSQL = `
CREATE TABLE IF NOT EXISTS calenda_data (
  cd_no INTEGER PRIMARY KEY,
  cd_sgi INTEGER,
  cd_sy INTEGER,
  cd_sm VARCHAR(10),
  cd_sd VARCHAR(10),
  cd_ly INTEGER,
  cd_lm VARCHAR(10),
  cd_ld VARCHAR(10),
  cd_hyganjee VARCHAR(10),
  cd_kyganjee VARCHAR(10),
  cd_hmganjee VARCHAR(10),
  cd_kmganjee VARCHAR(10),
  cd_hdganjee VARCHAR(10),
  cd_kdganjee VARCHAR(10),
  cd_hweek VARCHAR(10),
  cd_kweek VARCHAR(10),
  cd_stars VARCHAR(10),
  cd_moon_state VARCHAR(20),
  cd_moon_time VARCHAR(20),
  cd_leap_month INTEGER,
  cd_month_size INTEGER,
  cd_hterms VARCHAR(20),
  cd_kterms VARCHAR(20),
  cd_terms_time VARCHAR(20),
  cd_keventday VARCHAR(50),
  cd_ddi VARCHAR(10),
  cd_sol_plan VARCHAR(100),
  cd_lun_plan VARCHAR(100),
  holiday INTEGER
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_calenda_sy_sm_sd ON calenda_data(cd_sy, cd_sm, cd_sd);
CREATE INDEX IF NOT EXISTS idx_calenda_ly_lm_ld ON calenda_data(cd_ly, cd_lm, cd_ld);
CREATE INDEX IF NOT EXISTS idx_calenda_sgi ON calenda_data(cd_sgi);
`;

async function migrateData() {
  let mysqlConnection: mysql.Connection | null = null;
  let pgClient: Client | null = null;

  try {
    // PostgreSQL 연결
    console.log('🔗 PostgreSQL 데이터베이스에 연결 중...');
    console.log(`   Host: ${pgConfig.host}:${pgConfig.port}`);
    console.log(`   Database: ${pgConfig.database}`);
    
    pgClient = new Client(pgConfig);
    await pgClient.connect();
    console.log('✅ PostgreSQL 연결 성공!\n');

    // 테이블 생성
    console.log('📊 PostgreSQL에 테이블 생성 중...');
    await pgClient.query(createTableSQL);
    console.log('✅ 테이블 및 인덱스 생성 완료!\n');

    // 기존 데이터 확인
    const existingDataResult = await pgClient.query('SELECT COUNT(*) FROM calenda_data');
    const existingCount = parseInt(existingDataResult.rows[0].count);
    
    if (existingCount > 0) {
      console.log(`⚠️  기존 데이터 ${existingCount}개가 발견되었습니다.`);
      console.log('   중단된 지점부터 마이그레이션을 계속합니다...\n');
    } else {
      console.log('   새로운 마이그레이션을 시작합니다...\n');
    }

    // MySQL 연결
    console.log('🔗 MySQL 데이터베이스에 연결 중...');
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('✅ MySQL 연결 성공!\n');

    // 전체 데이터 개수 확인
    const [countResult]: any = await mysqlConnection.execute(
      'SELECT COUNT(*) as total FROM calenda_data'
    );
    const totalCount = countResult[0].total;
    console.log(`📈 마이그레이션할 데이터: ${totalCount}개\n`);

    // 데이터 마이그레이션 (배치 처리)
    console.log('🚀 데이터 마이그레이션 시작...');
    console.log(`   배치 사이즈: ${BATCH_SIZE}개\n`);

    let offset = 0;
    let migratedCount = 0;
    const startTime = Date.now();

    // 기존 데이터가 있으면 중단된 지점부터 시작
    if (existingCount > 0) {
      const maxCdNoResult = await pgClient.query('SELECT MAX(cd_no) as max_cd_no FROM calenda_data');
      const maxCdNo = maxCdNoResult.rows[0].max_cd_no;
      offset = maxCdNo;
      migratedCount = existingCount;
      console.log(`   중단된 지점(cd_no: ${maxCdNo})부터 마이그레이션을 계속합니다...\n`);
    }

    while (offset < totalCount) {
      // MySQL에서 데이터 조회
      const [rows]: any = await mysqlConnection.execute(
        `SELECT * FROM calenda_data ORDER BY cd_no LIMIT ${BATCH_SIZE} OFFSET ${offset}`
      );

      if (rows.length === 0) break;

      // PostgreSQL에 데이터 삽입 (트랜잭션 사용)
      await pgClient.query('BEGIN');
      
      try {
        for (const row of rows) {
          const insertQuery = `
            INSERT INTO calenda_data (
              cd_no, cd_sgi, cd_sy, cd_sm, cd_sd, cd_ly, cd_lm, cd_ld,
              cd_hyganjee, cd_kyganjee, cd_hmganjee, cd_kmganjee,
              cd_hdganjee, cd_kdganjee, cd_hweek, cd_kweek, cd_stars,
              cd_moon_state, cd_moon_time, cd_leap_month, cd_month_size,
              cd_hterms, cd_kterms, cd_terms_time, cd_keventday,
              cd_ddi, cd_sol_plan, cd_lun_plan, holiday
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
              $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
              $23, $24, $25, $26, $27, $28, $29
            )
          `;

          const values = [
            row.cd_no,
            row.cd_sgi,
            row.cd_sy,
            row.cd_sm,
            row.cd_sd,
            row.cd_ly,
            row.cd_lm,
            row.cd_ld,
            row.cd_hyganjee,
            row.cd_kyganjee,
            row.cd_hmganjee,
            row.cd_kmganjee,
            row.cd_hdganjee,
            row.cd_kdganjee,
            row.cd_hweek,
            row.cd_kweek,
            row.cd_stars,
            row.cd_moon_state === 'NULL' ? null : row.cd_moon_state,
            row.cd_moon_time,
            row.cd_leap_month,
            row.cd_month_size,
            row.cd_hterms === 'NULL' ? null : row.cd_hterms,
            row.cd_kterms === 'NULL' ? null : row.cd_kterms,
            row.cd_terms_time,
            row.cd_keventday,
            row.cd_ddi,
            row.cd_sol_plan,
            row.cd_lun_plan,
            row.holiday
          ];

          await pgClient.query(insertQuery, values);
        }

        await pgClient.query('COMMIT');
        migratedCount += rows.length;

        // 진행 상황 표시
        const progress = ((migratedCount / totalCount) * 100).toFixed(1);
        const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
        process.stdout.write(
          `\r   진행률: ${progress}% (${migratedCount}/${totalCount}) - 경과 시간: ${elapsedTime}초`
        );

      } catch (error) {
        await pgClient.query('ROLLBACK');
        throw error;
      }

      offset += BATCH_SIZE;
    }

    console.log('\n');

    // 마이그레이션 검증
    console.log('🔍 마이그레이션 검증 중...');
    const pgCountResult = await pgClient.query('SELECT COUNT(*) FROM calenda_data');
    const pgCount = parseInt(pgCountResult.rows[0].count);

    if (pgCount === totalCount) {
      console.log(`✅ 마이그레이션 성공! ${pgCount}개 데이터가 정상적으로 이관되었습니다.`);
    } else {
      console.log(`⚠️  경고: MySQL(${totalCount}개) vs PostgreSQL(${pgCount}개) 데이터 개수 불일치`);
    }

    // 샘플 데이터 확인
    console.log('\n📋 PostgreSQL 샘플 데이터 (처음 5개):');
    const sampleResult = await pgClient.query('SELECT * FROM calenda_data ORDER BY cd_no LIMIT 5');
    console.table(sampleResult.rows);

    // 완료 시간 출력
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n⏱️  전체 소요 시간: ${totalTime}초`);

  } catch (error) {
    console.error('\n❌ 마이그레이션 실패:', error);
    if (error instanceof Error) {
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
    }
  } finally {
    // 연결 종료
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log('\n🔌 MySQL 연결 종료');
    }
    if (pgClient) {
      await pgClient.end();
      console.log('🔌 PostgreSQL 연결 종료');
    }
  }
}

// 스크립트 실행
console.log('===== MySQL to PostgreSQL 마이그레이션 시작 =====\n');
migrateData()
  .then(() => {
    console.log('\n===== 마이그레이션 완료 =====');
    process.exit(0);
  })
  .catch((error) => {
    console.error('스크립트 실행 실패:', error);
    process.exit(1);
  });
