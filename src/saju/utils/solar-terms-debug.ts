/**
 * 24절기 계산 결과를 디버깅하기 위한 임시 파일
 */
import { SolarTermsUtils } from './solar-terms.utils';

// 2024년 절기 계산 결과 출력
console.log('=== 2024년 24절기 계산 결과 ===');
const solarTerms2024 = SolarTermsUtils.calculateSolarTermsForYear(2024);
solarTerms2024.terms.forEach((term, index) => {
  const date = term.date;
  console.log(`${index + 1}. ${term.name}: ${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} (사주월: ${term.monthIndex + 1}월)`);
});

console.log('\n=== 2020년 입춘 날짜 ===');
const lichun2020 = SolarTermsUtils.getLichunDate(2020);
console.log(`2020년 입춘: ${lichun2020.getFullYear()}-${(lichun2020.getMonth() + 1).toString().padStart(2, '0')}-${lichun2020.getDate().toString().padStart(2, '0')}`);

console.log('\n=== 2024년 주요 절기 날짜 ===');
const mainTerms = ['입춘', '춘분', '하지', '추분', '동지', '소한', '대한'];
mainTerms.forEach(termName => {
  const termDate = SolarTermsUtils.getSolarTermByName(2024, termName);
  if (termDate) {
    console.log(`${termName}: ${termDate.getFullYear()}-${(termDate.getMonth() + 1).toString().padStart(2, '0')}-${termDate.getDate().toString().padStart(2, '0')}`);
  }
});

console.log('\n=== 사주 월 계산 테스트 ===');
const testDates = [
  new Date(1990, 2, 15), // 1990년 3월 15일
  new Date(1985, 0, 10), // 1985년 1월 10일
  new Date(2000, 5, 25), // 2000년 6월 25일
];

testDates.forEach(date => {
  const sajuYear = SolarTermsUtils.getSajuYear(date);
  const sajuMonth = SolarTermsUtils.getSajuMonth(date);
  console.log(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} => 사주: ${sajuYear}년 ${sajuMonth + 1}월`);
});
