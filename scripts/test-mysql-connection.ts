/**
 * MySQL 데이터베이스 연결 테스트 스크립트
 * 이 파일은 독립적으로 실행되며 다른 로직과 분리되어 있습니다.
 * 사용 후 scripts 폴더 전체를 삭제하면 됩니다.
 */

import * as mysql from 'mysql2/promise';

// 데이터베이스 연결 설정
const dbConfig = {
  host: 'localhost',
  user: 'myuser',
  password: 'mypassword',
  database: 'mydatabase',
  port: 3306,
};

// 메인 함수
async function fetchCalendarData() {
  let connection: mysql.Connection | null = null;

  try {
    // 데이터베이스 연결
    console.log('🔗 MySQL 데이터베이스에 연결 중...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 데이터베이스 연결 성공!\n');

    // 테이블 정보 확인
    console.log('📊 테이블 정보 확인 중...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('테이블 목록:', tables);
    console.log('');

    // calenda_data 테이블 구조 확인
    console.log('🔍 calenda_data 테이블 구조:');
    const [columns] = await connection.execute('DESCRIBE calenda_data');
    console.table(columns);
    console.log('');

    // 데이터 개수 확인
    const [countResult]: any = await connection.execute(
      'SELECT COUNT(*) as total FROM calenda_data'
    );
    console.log(`📈 전체 데이터 개수: ${countResult[0].total}개\n`);

    // 100개 데이터 조회
    console.log('📥 100개 데이터 조회 중...');
    const [rows] = await connection.execute(
      'SELECT * FROM calenda_data LIMIT 100'
    );

    // 결과 출력
    console.log(`✅ ${(rows as any[]).length}개 데이터 조회 완료!\n`);
    console.log('========== 조회된 데이터 ==========\n');

    // 데이터를 보기 좋게 출력
    (rows as any[]).forEach((row, index) => {
      console.log(`[${index + 1}번째 데이터]`);
      console.log(JSON.stringify(row, null, 2));
      console.log('-----------------------------------');
    });

    // 첫 5개 데이터만 테이블 형태로도 출력
    console.log('\n========== 처음 5개 데이터 (테이블) ==========');
    console.table((rows as any[]).slice(0, 5));

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    if (error instanceof Error) {
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
    }
  } finally {
    // 연결 종료
    if (connection) {
      await connection.end();
      console.log('\n🔌 데이터베이스 연결 종료');
    }
  }
}

// 스크립트 실행
console.log('===== MySQL 연결 테스트 시작 =====\n');
fetchCalendarData()
  .then(() => {
    console.log('\n===== 테스트 완료 =====');
    process.exit(0);
  })
  .catch((error) => {
    console.error('스크립트 실행 실패:', error);
    process.exit(1);
  });
