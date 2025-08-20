// 간단한 API 테스트 스크립트
const https = require('https');

// PostgreSQL 연결 정보를 환경변수로 설정
process.env.TYPEORM_HOST = 'ep-wispy-thunder-a1m7u1ip.ap-southeast-1.pg.koyeb.app';
process.env.TYPEORM_PORT = '5432';
process.env.TYPEORM_USERNAME = 'admin';
process.env.TYPEORM_PASSWORD = 'npg_3okgMLbR5uJB';
process.env.TYPEORM_DATABASE = 'dev';
process.env.ANTHROPIC_API_KEY = 'dummy'; // 데모용

// NestJS 앱 실행
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module').AppModule;

async function bootstrap() {
  try {
    console.log('🚀 NestJS 애플리케이션 시작...');
    console.log('📊 데이터베이스 연결 정보:', {
      host: process.env.TYPEORM_HOST,
      port: process.env.TYPEORM_PORT,
      database: process.env.TYPEORM_DATABASE,
      username: process.env.TYPEORM_USERNAME
    });

    const app = await NestFactory.create(AppModule);
    app.enableCors();
    
    await app.listen(3000);
    console.log('✅ 애플리케이션이 http://localhost:3000 에서 실행 중입니다.');
    
    // API 테스트
    setTimeout(async () => {
      console.log('\n🧪 API 테스트 시작...');
      
      try {
        const response = await fetch('http://localhost:3000/saju/extract?year=1990&month=5&day=15&hour=14&minute=30&isSolar=true');
        const data = await response.json();
        
        console.log('✅ API 응답:', JSON.stringify(data, null, 2));
      } catch (error) {
        console.error('❌ API 테스트 실패:', error);
      }
    }, 3000);
    
  } catch (error) {
    console.error('❌ 애플리케이션 시작 실패:', error);
  }
}

bootstrap();
