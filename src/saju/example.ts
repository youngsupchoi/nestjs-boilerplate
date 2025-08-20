import { SajuService } from './saju.service';
import { Gender } from './enums';
import { UserBirthInfo } from './interfaces';

/**
 * 사주 서비스 사용 예제 (8개 한자 + 대운 + 세운)
 */
export function sajuServiceExample() {
  const sajuService = new SajuService();

  // 사용자 정보 예제
  const userInfo: UserBirthInfo = {
    gender: Gender.MALE,
    birthDateTime: new Date(1990, 0, 15, 14, 30), // 1990년 1월 15일 14시 30분
    isSolar: true, // 양력
    birthPlace: '서울특별시',
  };

  console.log('=== 기본 정보 ===');
  console.log('성별:', userInfo.gender);
  console.log('생년월일시:', userInfo.birthDateTime.toLocaleString('ko-KR'));
  console.log('양력/음력:', userInfo.isSolar ? '양력' : '음력');

  // 8개 한자 계산
  const eightCharacters = sajuService.calculateEightCharacters(userInfo);

  console.log('\n=== 사주 계산 결과 (8개 한자) ===');
  console.log('천간:', eightCharacters.heavenlyStems);
  console.log('지지:', eightCharacters.earthlyBranches);
  console.log('간지조합:', eightCharacters.ganzhiCombinations);
  
  // 보기 좋은 형태로 출력
  const formattedResult = sajuService.formatEightCharacters(eightCharacters);
  console.log('사주:', formattedResult);

  // 상세 기둥 정보
  const pillars = sajuService.calculateSajuPillars(userInfo);
  console.log('\n=== 상세 기둥 정보 ===');
  console.log('년주:', pillars.year);
  console.log('월주:', pillars.month);
  console.log('일주:', pillars.day);
  console.log('시주:', pillars.hour);

  // 대운 계산
  const daeunList = sajuService.calculateDaeunList(userInfo, 70);
  console.log('\n=== 대운 정보 ===');
  console.log(sajuService.formatDaeunList(daeunList));

  // 현재 나이(35세)의 대운
  const currentDaeun = sajuService.getCurrentDaeun(userInfo, 35);
  if (currentDaeun) {
    console.log('\n=== 35세 현재 대운 ===');
    console.log(`현재 나이: ${currentDaeun.currentAge}세`);
    console.log(`대운: ${currentDaeun.daeun.ganzhi} (${currentDaeun.daeun.startAge}-${currentDaeun.daeun.endAge}세)`);
    console.log(`대운 경과: ${currentDaeun.yearsInDaeun}년차`);
  }

  // 세운 계산 (최근 5년)
  const currentYear = new Date().getFullYear();
  const saeunList = sajuService.calculateSaeunList(userInfo, currentYear - 2, currentYear + 2);
  console.log('\n=== 세운 정보 (최근 5년) ===');
  console.log(sajuService.formatSaeunList(saeunList));

  // 현재 년도의 세운
  const currentSaeun = sajuService.getCurrentSaeun(userInfo, currentYear);
  console.log('\n=== 올해 세운 ===');
  console.log(`${currentSaeun.currentYear}년 (${currentSaeun.currentAge}세): ${currentSaeun.saeun.ganzhi}`);

  return {
    eightCharacters,
    daeunList,
    saeunList,
  };
}

// 여러 사용자 테스트 예제 (대운/세운 포함)
export function multipleUsersExample() {
  const sajuService = new SajuService();

  const users: UserBirthInfo[] = [
    {
      gender: Gender.MALE,
      birthDateTime: new Date(1985, 2, 10, 8, 0), // 1985년 3월 10일 8시
      isSolar: true,
    },
    {
      gender: Gender.FEMALE,
      birthDateTime: new Date(1992, 6, 25, 20, 15), // 1992년 7월 25일 20시 15분
      isSolar: true,
    },
    {
      gender: Gender.MALE,
      birthDateTime: new Date(1988, 10, 5, 12, 0), // 1988년 11월 5일 12시 (음력)
      isSolar: false,
    },
  ];

  console.log('=== 여러 사용자 사주/대운/세운 계산 ===');
  users.forEach((user, index) => {
    console.log(`\n📋 사용자 ${index + 1} (${user.gender}, ${user.isSolar ? '양력' : '음력'})`);
    
    // 사주 계산
    const result = sajuService.calculateEightCharacters(user);
    console.log('사주:', sajuService.formatEightCharacters(result));
    
    // 대운 계산 (40세까지)
    const daeunList = sajuService.calculateDaeunList(user, 40);
    console.log(`대운 시작: ${daeunList.daeunStartAge}세 (${daeunList.isForward ? '순행' : '역행'})`);
    console.log('대운 목록:');
    daeunList.daeunPeriods.slice(0, 3).forEach(daeun => {
      console.log(`  ${daeun.startAge}-${daeun.endAge}세: ${daeun.ganzhi}`);
    });
    
    // 현재 세운 (2024년)
    const currentSaeun = sajuService.getCurrentSaeun(user, 2024);
    console.log(`2024년 세운: ${currentSaeun.saeun.ganzhi} (${currentSaeun.currentAge}세)`);
  });
}

// 대운/세운 상세 분석 예제
export function daeunSaeunDetailExample() {
  const sajuService = new SajuService();

  const userInfo: UserBirthInfo = {
    gender: Gender.FEMALE,
    birthDateTime: new Date(1987, 4, 20, 10, 30), // 1987년 5월 20일 10시 30분
    isSolar: true,
  };

  console.log('=== 대운/세운 상세 분석 ===');
  console.log('대상자:', `${userInfo.gender}, ${userInfo.birthDateTime.toLocaleDateString('ko-KR')}`);

  // 사주
  const eightChars = sajuService.calculateEightCharacters(userInfo);
  console.log('\n사주:', sajuService.formatEightCharacters(eightChars));

  // 대운 전체 목록
  const daeunList = sajuService.calculateDaeunList(userInfo, 80);
  console.log('\n=== 대운 전체 목록 ===');
  console.log(sajuService.formatDaeunList(daeunList));

  // 특정 나이대의 대운
  const ages = [25, 35, 45, 55];
  console.log('\n=== 특정 나이대 대운 ===');
  ages.forEach(age => {
    const daeun = sajuService.getCurrentDaeun(userInfo, age);
    if (daeun) {
      console.log(`${age}세: ${daeun.daeun.ganzhi} (${daeun.yearsInDaeun}년차)`);
    }
  });

  // 10년간 세운
  const currentYear = new Date().getFullYear();
  const saeunList = sajuService.calculateSaeunList(userInfo, currentYear - 5, currentYear + 4);
  console.log('\n=== 10년간 세운 ===');
  console.log(sajuService.formatSaeunList(saeunList));

  return {
    userInfo,
    eightChars,
    daeunList,
    saeunList,
  };
}

// 천간 상세 분석 예제
export function heavenlyStemAnalysisExample() {
  const sajuService = new SajuService();

  const userInfo: UserBirthInfo = {
    gender: Gender.MALE,
    birthDateTime: new Date(1985, 4, 15, 9, 30), // 1985년 5월 15일 9시 30분
    isSolar: true,
  };

  console.log('=== 천간 상세 분석 예제 ===');
  
  // 천간만 분석
  const stemAnalysis = sajuService.analyzeSajuStems(userInfo);
  console.log(stemAnalysis);

  return userInfo;
}

// 지지 상세 분석 예제
export function earthlyBranchAnalysisExample() {
  const sajuService = new SajuService();

  const userInfo: UserBirthInfo = {
    gender: Gender.FEMALE,
    birthDateTime: new Date(1992, 8, 3, 16, 45), // 1992년 9월 3일 16시 45분
    isSolar: true,
  };

  console.log('=== 지지 상세 분석 예제 ===');
  
  // 지지 분석
  const branchAnalysis = sajuService.analyzeSajuBranches(userInfo);
  console.log(branchAnalysis);

  // 지지 오행 분포 분석
  console.log('\n' + sajuService.analyzeBranchElementDistribution(userInfo));

  // 지지 음양 분포 분석
  console.log('\n' + sajuService.analyzeBranchYinYangDistribution(userInfo));

  return userInfo;
}

// 천간+지지 종합 분석 예제
export function comprehensiveAnalysisExample() {
  const sajuService = new SajuService();

  const userInfo: UserBirthInfo = {
    gender: Gender.MALE,
    birthDateTime: new Date(1988, 11, 25, 11, 20), // 1988년 12월 25일 11시 20분
    isSolar: true,
  };

  console.log('=== 천간+지지 종합 분석 예제 ===');
  
  // 전체 종합 분석 (천간 + 지지)
  const comprehensiveAnalysis = sajuService.getComprehensiveAnalysis(userInfo);
  console.log(comprehensiveAnalysis);

  return userInfo;
}

// 절기 기반 정확한 사주 계산 예제 (NEW!)
export function accurateSajuWithSolarTermsExample() {
  const sajuService = new SajuService();

  console.log('=== 절기 기반 정확한 사주 계산 예제 ===\n');

  // 절기 경계 테스트 케이스들
  const testCases: UserBirthInfo[] = [
    {
      gender: Gender.MALE,
      birthDateTime: new Date(2024, 1, 3, 14, 30), // 입춘 전
      isSolar: true,
      birthPlace: '서울특별시',
    },
    {
      gender: Gender.MALE,
      birthDateTime: new Date(2024, 1, 5, 14, 30), // 입춘 후
      isSolar: true,
      birthPlace: '서울특별시',
    },
    {
      gender: Gender.FEMALE,
      birthDateTime: new Date(2024, 2, 4, 23, 45), // 경칩 전 + 야자시
      isSolar: true,
      birthPlace: '서울특별시',
    },
    {
      gender: Gender.FEMALE,
      birthDateTime: new Date(2024, 2, 6, 10, 15), // 경칩 후
      isSolar: true,
      birthPlace: '서울특별시',
    }
  ];

  testCases.forEach((userInfo, index) => {
    console.log(`🎯 테스트 케이스 ${index + 1}:`);
    console.log(`생년월일시: ${userInfo.birthDateTime.toLocaleString('ko-KR')}`);
    
    // 상세 분석 (디버깅 정보 포함)
    const detailedAnalysis = sajuService.getDetailedSajuAnalysis(userInfo);
    
    console.log(`📋 사주 결과: ${detailedAnalysis.formattedResult}`);
    
    console.log('\n🔍 절기 계산 정보:');
    console.log(`- 사주 연도: ${detailedAnalysis.debugInfo.sajuYear}년`);
    console.log(`- 사주 월: ${detailedAnalysis.debugInfo.sajuMonth + 1}월`);
    console.log(`- 현재 절기: ${detailedAnalysis.debugInfo.currentSolarTerm.current}`);
    console.log(`- 입춘 날짜: ${detailedAnalysis.debugInfo.yearPillarInfo.lichunDate.toLocaleString('ko-KR')}`);
    console.log(`- 입춘 이후: ${detailedAnalysis.debugInfo.yearPillarInfo.isAfterLichun ? 'Yes' : 'No'}`);
    console.log(`- 월 시작 절기: ${detailedAnalysis.debugInfo.monthPillarInfo.monthStartTerm}`);
    console.log(`- 야간 출생 (23시 이후): ${detailedAnalysis.debugInfo.nightTimeAdjustment.isNightTime ? 'Yes' : 'No'}`);
    
    if (detailedAnalysis.debugInfo.nightTimeAdjustment.isNightTime) {
      console.log('  ⚠️  야자시 적용: 일주가 다음 날로 계산됨');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  });

  return testCases;
}

// 실제 정확도 비교 예제
export function accuracyComparisonExample() {
  console.log('=== 개선 전후 정확도 비교 ===\n');
  
  // 절기 경계 날짜들로 테스트
  const criticalDates = [
    new Date(2024, 1, 3, 12, 0),  // 입춘 전 (년주 변경)
    new Date(2024, 1, 5, 12, 0),  // 입춘 후 (년주 변경)
    new Date(2024, 2, 4, 12, 0),  // 경칩 전 (월주 변경)
    new Date(2024, 2, 6, 12, 0),  // 경칩 후 (월주 변경)
    new Date(2024, 5, 15, 22, 30), // 야자시 전
    new Date(2024, 5, 15, 23, 30), // 야자시 후 (일주 변경)
  ];

  const sajuService = new SajuService();
  
  criticalDates.forEach((date, index) => {
    const userInfo: UserBirthInfo = {
      gender: Gender.MALE,
      birthDateTime: date,
      isSolar: true,
      birthPlace: '서울특별시',
    };
    
    const result = sajuService.calculateEightCharacters(userInfo);
    const debugInfo = sajuService.getCalculationDebugInfo(userInfo);
    
    console.log(`📅 ${date.toLocaleString('ko-KR')}`);
    console.log(`사주: ${sajuService.formatEightCharacters(result)}`);
    console.log(`절기: ${debugInfo.currentSolarTerm.current} → ${debugInfo.currentSolarTerm.next}`);
    console.log('');
  });
}
