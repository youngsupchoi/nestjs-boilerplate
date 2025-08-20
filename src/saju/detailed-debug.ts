// 간단한 일주 계산 검증
const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

function getJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  return jdn;
}

function calculateDayPillar(year: number, month: number, day: number, hour: number) {
  // 야자시 처리
  if (hour >= 23) {
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day + 1 > daysInMonth) {
      day = 1;
      if (month + 1 > 12) {
        month = 1;
        year = year + 1;
      } else {
        month = month + 1;
      }
    } else {
      day = day + 1;
    }
  }

  // 기준일: 1999년 12월 14일 = 경자(庚子)일
  const baseJDN = getJDN(1999, 12, 14);
  const baseStem = 6; // 庚
  const baseBranch = 0; // 子

  const targetJDN = getJDN(year, month, day);
  const daysDiff = targetJDN - baseJDN;

  console.log(`  기준 JDN: ${baseJDN}`);
  console.log(`  대상 JDN: ${targetJDN}`);
  console.log(`  일수 차이: ${daysDiff}`);

  const stemIndex = (baseStem + daysDiff) % 10;
  const branchIndex = (baseBranch + daysDiff) % 12;

  console.log(`  천간 계산: (${baseStem} + ${daysDiff}) % 10 = ${stemIndex}`);
  console.log(`  지지 계산: (${baseBranch} + ${daysDiff}) % 12 = ${branchIndex}`);

  const finalStemIndex = (stemIndex + 10) % 10;
  const finalBranchIndex = (branchIndex + 12) % 12;

  console.log(`  최종 천간 인덱스: ${finalStemIndex} (${HEAVENLY_STEMS[finalStemIndex]})`);
  console.log(`  최종 지지 인덱스: ${finalBranchIndex} (${EARTHLY_BRANCHES[finalBranchIndex]})`);

  return {
    stem: HEAVENLY_STEMS[finalStemIndex],
    branch: EARTHLY_BRANCHES[finalBranchIndex],
    ganzhi: HEAVENLY_STEMS[finalStemIndex] + EARTHLY_BRANCHES[finalBranchIndex]
  };
}

console.log('=== 상세 일주 계산 디버깅 ===\n');

// 테스트 케이스 1: 2000년 3월 7일 (정답: 기묘)
console.log('1. 2000년 3월 7일 12:34');
const result1 = calculateDayPillar(2000, 3, 7, 12);
console.log(`  결과: ${result1.ganzhi}`);
console.log(`  정답: 기묘\n`);

// 테스트 케이스 2: 1954년 8월 23일 (정답: 신해)
console.log('2. 1954년 8월 23일 12:33');
const result2 = calculateDayPillar(1954, 8, 23, 12);
console.log(`  결과: ${result2.ganzhi}`);
console.log(`  정답: 신해\n`);

// 기준일 자체 검증
console.log('3. 1999년 12월 14일 (기준일 검증)');
const result3 = calculateDayPillar(1999, 12, 14, 12);
console.log(`  결과: ${result3.ganzhi}`);
console.log(`  정답: 경자\n`);

