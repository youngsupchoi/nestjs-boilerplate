import { SajuService } from './saju.service';
import { Gender } from './enums';

// 진태양시 보정을 고려한 테스트
const testCase = {
  name: '2000년 3월 7일 12:34',
  input: {
    birthDateTime: new Date(2000, 2, 7, 12, 34),
    isSolar: true,
    gender: Gender.MALE,
    birthPlace: '서울'
  },
  expected: {
    천간: '경갑기경',
    지지: '오자묘진'
  }
};

async function test() {
  const sajuService = new SajuService();
  
  console.log('=== 2000년 3월 7일 테스트 ===\n');
  
  // 1. 보정 없이 계산
  console.log('1. 보정 없이 계산:');
  const result1 = sajuService.calculateEightCharacters(testCase.input);
  console.log(`  시주: ${result1.heavenlyStems[3]}${result1.earthlyBranches[3]}`);
  console.log(`  일주: ${result1.heavenlyStems[2]}${result1.earthlyBranches[2]}`);
  console.log(`  월주: ${result1.heavenlyStems[1]}${result1.earthlyBranches[1]}`);
  console.log(`  연주: ${result1.heavenlyStems[0]}${result1.earthlyBranches[0]}`);
  
  const 천간결과 = result1.heavenlyStems.reverse().join('');
  const 지지결과 = result1.earthlyBranches.reverse().join('');
  console.log(`  천간: ${천간결과} (정답: ${testCase.expected.천간})`);
  console.log(`  지지: ${지지결과} (정답: ${testCase.expected.지지})`);
  
  // 2. 시간 보정 정보
  console.log('\n2. 시간 보정 분석:');
  const correctionInfo = sajuService.correctBirthTime(testCase.input, '서울');
  console.log(`  원래 시간: ${correctionInfo.originalTime.toLocaleString('ko-KR')}`);
  console.log(`  보정된 시간: ${correctionInfo.correctedTime.toLocaleString('ko-KR')}`);
  console.log(`  보정 시간(분): ${correctionInfo.correctionMinutes}분`);
  
  // 3. 보정된 시간으로 계산
  console.log('\n3. 보정된 시간으로 계산:');
  const correctedInput = {
    ...testCase.input,
    birthDateTime: correctionInfo.correctedTime
  };
  const result2 = sajuService.calculateEightCharacters(correctedInput);
  console.log(`  시주: ${result2.heavenlyStems[3]}${result2.earthlyBranches[3]}`);
  console.log(`  일주: ${result2.heavenlyStems[2]}${result2.earthlyBranches[2]}`);
  console.log(`  월주: ${result2.heavenlyStems[1]}${result2.earthlyBranches[1]}`);
  console.log(`  연주: ${result2.heavenlyStems[0]}${result2.earthlyBranches[0]}`);
}

test().catch(console.error);

