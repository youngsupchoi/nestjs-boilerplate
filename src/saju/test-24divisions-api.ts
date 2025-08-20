import axios, { AxiosError } from 'axios';

// API 응답 타입 정의
interface DivisionItem {
  dateKind: string;
  dateName: string;
  isHoliday: string;
  kst?: string;
  locdate: string;
  seq: number;
  sunLongitude?: string | number;
}

interface APIResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item: DivisionItem | DivisionItem[];
      };
      totalCount?: number;
      pageNo?: number;
      numOfRows?: number;
    };
  };
}

// 24절기 정보를 조회하는 API 테스트
export async function test24DivisionsAPI() {
  const baseUrl = 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/get24DivisionsInfo';
  
  // 서비스키 (디코딩된 버전 시도)
  const serviceKey = 'U52zOniEkebS4vysyiilFo2jD+2fAdxhcN/mdb1x64+ecNGeegoBp7leRR1EFGPLCfozhYlT9vxOVj2APUwUAA==';
  
  // 테스트할 파라미터들
  const testCases = [
    { solYear: '2024', solMonth: '03' }, // 3월 - 경칩, 춘분
    { solYear: '2024', solMonth: '06' }, // 6월 - 망종, 하지
    { solYear: '2024', solMonth: '09' }, // 9월 - 백로, 추분
    { solYear: '2024', solMonth: '12' }, // 12월 - 대설, 동지
  ];

  console.log('🌅 24절기 정보 API 테스트를 시작합니다...\n');

  for (const testCase of testCases) {
    try {
      console.log(`📅 ${testCase.solYear}년 ${testCase.solMonth}월 24절기 정보 조회 중...`);
      
      const params = new URLSearchParams({
        solYear: testCase.solYear,
        solMonth: testCase.solMonth,
        ServiceKey: serviceKey,
        _type: 'json',
        numOfRows: '20'
      });

      const response = await axios.get<APIResponse>(`${baseUrl}?${params.toString()}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Garden-of-Fortune-API/1.0)'
        }
      });

      console.log(`✅ 응답 상태: ${response.status} ${response.statusText}`);
      
      if (response.data) {
        // JSON 형태로 응답받은 경우
        if (response.data.response) {
          const { header, body } = response.data.response;
          
          console.log(`📊 결과 코드: ${header?.resultCode || 'N/A'}`);
          console.log(`💬 결과 메시지: ${header?.resultMsg || 'N/A'}`);
          
          if (body?.items?.item) {
            const items = Array.isArray(body.items.item) ? body.items.item : [body.items.item];
            console.log(`🔢 총 ${items.length}개의 절기 정보를 찾았습니다:`);
            
            items.forEach((item: DivisionItem, index: number) => {
              console.log(`  ${index + 1}. ${item.dateName} (${item.locdate})`);
              console.log(`     - 종류: ${item.dateKind}`);
              console.log(`     - 휴일여부: ${item.isHoliday}`);
              console.log(`     - 한국표준시각: ${item.kst || 'N/A'}`);
              console.log(`     - 태양황경: ${item.sunLongitude || 'N/A'}도`);
              console.log('');
            });
          } else {
            console.log('❌ 절기 정보가 없습니다.');
          }
          
          console.log(`📄 총 개수: ${body?.totalCount || 0}`);
          console.log(`📑 페이지: ${body?.pageNo || 1}`);
        } else {
          console.log('🔍 응답 데이터 구조:');
          console.log(JSON.stringify(response.data, null, 2));
        }
      }
      
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`❌ ${testCase.solYear}년 ${testCase.solMonth}월 API 호출 실패:`, axiosError.message);
      
      if (axiosError.response) {
        console.error(`   - 상태 코드: ${axiosError.response.status}`);
        console.error(`   - 응답 데이터:`, axiosError.response.data);
      } else if (axiosError.request) {
        console.error('   - 네트워크 요청 오류');
      }
    }
    
    console.log('─'.repeat(80));
    console.log('');
  }

  console.log('🎉 24절기 API 테스트 완료!');
}

// 단독 실행 시
if (require.main === module) {
  test24DivisionsAPI().catch(console.error);
}
