import { SajuService } from './saju.service';
import { Gender } from './enums';

// 테스트 케이스 정의
const testCases = [
  {
    name: '1954년 8월 23일 12:33',
    input: {
      birthDateTime: new Date(1954, 7, 23, 12, 33), // JS month is 0-indexed
      isSolar: true,
      gender: Gender.MALE
    },
    expected: {
      천간: '갑신임갑',
      지지: '오해신오'
    }
  },
  {
    name: '1962년 3월 4일 01:25',
    input: {
      birthDateTime: new Date(1962, 2, 4, 1, 25),
      isSolar: true,
      gender: Gender.MALE
    },
    expected: {
      천간: '무신임임',
      지지: '자축인인'
    }
  },
  {
    name: '1972년 9월 16일 17:25',
    input: {
      birthDateTime: new Date(1972, 8, 16, 17, 25),
      isSolar: true,
      gender: Gender.MALE
    },
    expected: {
      천간: '기경기임',
      지지: '묘술유자'
    }
  },
  {
    name: '1988년 6월 3일 08:32',
    input: {
      birthDateTime: new Date(1988, 5, 3, 8, 32),
      isSolar: true,
      gender: Gender.MALE
    },
    expected: {
      천간: '무기정무',
      지지: '진축사진'
    }
  },
  {
    name: '1993년 10월 12일 03:40',
    input: {
      birthDateTime: new Date(1993, 9, 12, 3, 40),
      isSolar: true,
      gender: Gender.MALE
    },
    expected: {
      천간: '경병임계',
      지지: '인인술유'
    }
  },
  {
    name: '2000년 3월 7일 12:34',
    input: {
      birthDateTime: new Date(2000, 2, 7, 12, 34),
      isSolar: true,
      gender: Gender.MALE
    },
    expected: {
      천간: '경갑기경',
      지지: '오자묘진'
    }
  }
];

// 테스트 실행
async function runTests() {
  const sajuService = new SajuService();
  
  console.log('='.repeat(60));
  console.log('사주 계산 로직 테스트 시작');
  console.log('='.repeat(60));
  
  let passCount = 0;
  let failCount = 0;
  
  for (const testCase of testCases) {
    console.log(`\n테스트: ${testCase.name}`);
    console.log('-'.repeat(40));
    
    const eightChars = sajuService.calculateEightCharacters(testCase.input);
    
    // 천간과 지지를 문자열로 변환
    const 천간결과 = eightChars.heavenlyStems.reverse().join('');
    const 지지결과 = eightChars.earthlyBranches.reverse().join('');
    
    console.log(`입력: ${testCase.input.birthDateTime.toLocaleString('ko-KR')}`);
    console.log(`예상 천간: ${testCase.expected.천간}`);
    console.log(`계산 천간: ${천간결과}`);
    console.log(`예상 지지: ${testCase.expected.지지}`);
    console.log(`계산 지지: ${지지결과}`);
    
    const 천간일치 = 천간결과 === testCase.expected.천간;
    const 지지일치 = 지지결과 === testCase.expected.지지;
    
    if (천간일치 && 지지일치) {
      console.log('✅ 통과');
      passCount++;
    } else {
      console.log('❌ 실패');
      if (!천간일치) {
        console.log(`  천간 불일치: ${천간결과} !== ${testCase.expected.천간}`);
      }
      if (!지지일치) {
        console.log(`  지지 불일치: ${지지결과} !== ${testCase.expected.지지}`);
      }
      failCount++;
    }
    
    // 상세 결과 출력
    console.log(`\n상세 결과:`);
    console.log(`  시주: ${eightChars.heavenlyStems[3]}${eightChars.earthlyBranches[3]}`);
    console.log(`  일주: ${eightChars.heavenlyStems[2]}${eightChars.earthlyBranches[2]}`);
    console.log(`  월주: ${eightChars.heavenlyStems[1]}${eightChars.earthlyBranches[1]}`);
    console.log(`  연주: ${eightChars.heavenlyStems[0]}${eightChars.earthlyBranches[0]}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`테스트 완료: 통과 ${passCount}개, 실패 ${failCount}개`);
  console.log('='.repeat(60));
}

// 테스트 실행
runTests().catch(console.error);

