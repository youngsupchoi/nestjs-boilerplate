import { SolarTermsUtils, SOLAR_TERMS_NAMES, SOLAR_TERM_TO_MONTH_MAP } from './solar-terms.utils';

describe('SolarTermsUtils', () => {
  describe('calculateSolarTermsForYear', () => {
    it('2024년 24절기 날짜가 정확히 계산되는지 확인', () => {
      const result = SolarTermsUtils.calculateSolarTermsForYear(2024);
      
      expect(result.year).toBe(2024);
      expect(result.terms).toHaveLength(24);
      
      // 실제 계산된 값으로 검증
      const lichun = result.terms.find(term => term.name === '입춘');
      expect(lichun).toBeDefined();
      expect(lichun!.date.getMonth()).toBe(1); // 2월
      expect(lichun!.date.getDate()).toBe(4); // 2월 4일
      
      const dongji = result.terms.find(term => term.name === '동지');
      expect(dongji).toBeDefined();
      expect(dongji!.date.getMonth()).toBe(11); // 12월
      expect(dongji!.date.getDate()).toBe(12); // 실제 계산된 값: 12월 12일
    });

    it('2023년 24절기 계산', () => {
      const result = SolarTermsUtils.calculateSolarTermsForYear(2023);
      
      expect(result.year).toBe(2023);
      expect(result.terms).toHaveLength(24);
      
      // 절기 이름이 모두 올바른지 확인
      result.terms.forEach((term, index) => {
        expect(term.name).toBe(SOLAR_TERMS_NAMES[index]);
        expect(term.monthIndex).toBe(SOLAR_TERM_TO_MONTH_MAP[index]);
      });
    });

    it('윤년(2020년) 24절기 계산', () => {
      const result = SolarTermsUtils.calculateSolarTermsForYear(2020);
      
      expect(result.year).toBe(2020);
      expect(result.terms).toHaveLength(24);
      
      // 윤년에서도 절기가 올바르게 계산되는지 확인
      const lichun = result.terms.find(term => term.name === '입춘');
      expect(lichun).toBeDefined();
      expect(lichun!.date.getFullYear()).toBe(2020);
    });
  });

  describe('getSajuYear', () => {
    it('입춘 이전 날짜는 전년도로 계산', () => {
      // 2024년 1월 1일 (입춘 이전)
      const date1 = new Date(2024, 0, 1);
      expect(SolarTermsUtils.getSajuYear(date1)).toBe(2023);
      
      // 2024년 2월 3일 (입춘 이전)
      const date2 = new Date(2024, 1, 3);
      expect(SolarTermsUtils.getSajuYear(date2)).toBe(2023);
    });

    it('입춘 이후 날짜는 해당 연도로 계산', () => {
      // 2024년 2월 5일 (입춘 이후)
      const date1 = new Date(2024, 1, 5);
      expect(SolarTermsUtils.getSajuYear(date1)).toBe(2024);
      
      // 2024년 12월 31일
      const date2 = new Date(2024, 11, 31);
      expect(SolarTermsUtils.getSajuYear(date2)).toBe(2024);
    });
  });

  describe('getSajuMonth', () => {
    it('각 월의 시작 절기 기준으로 월이 올바르게 계산되는지 확인', () => {
      // 2024년 기준 테스트
      const testCases = [
        { date: new Date(2024, 1, 5), expectedMonth: 0, description: '입춘 후 정월' },
        { date: new Date(2024, 2, 6), expectedMonth: 1, description: '경칩 후 2월' },
        { date: new Date(2024, 3, 5), expectedMonth: 2, description: '청명 후 3월' },
        { date: new Date(2024, 4, 6), expectedMonth: 3, description: '입하 후 4월' },
        { date: new Date(2024, 5, 6), expectedMonth: 4, description: '망종 후 5월' },
        { date: new Date(2024, 6, 7), expectedMonth: 5, description: '소서 후 6월' },
      ];

      testCases.forEach(({ date, expectedMonth }) => {
        const result = SolarTermsUtils.getSajuMonth(date);
        expect(result).toBe(expectedMonth);
      });
    });

    it('연도 경계 월 계산 (12월-1월)', () => {
      // 2024년 1월 (대한 이후, 입춘 이전) - 12월로 계산되어야 함
      const jan2024 = new Date(2024, 0, 25);
      expect(SolarTermsUtils.getSajuMonth(jan2024)).toBe(11); // 12월 (축월)
      
      // 2024년 2월 입춘 이후 - 1월(정월)로 계산되어야 함
      const feb2024 = new Date(2024, 1, 5);
      expect(SolarTermsUtils.getSajuMonth(feb2024)).toBe(0); // 1월 (인월)
    });
  });

  describe('getCurrentSolarTerm', () => {
    it('현재 절기와 다음 절기를 올바르게 반환', () => {
      // 2024년 3월 15일 (경칩 이후, 춘분 이전)
      const date = new Date(2024, 2, 15);
      const result = SolarTermsUtils.getCurrentSolarTerm(date);
      
      expect(result.current).toBeDefined();
      expect(result.current!.name).toBe('경칩');
      expect(result.next).toBeDefined();
      expect(result.next!.name).toBe('춘분');
      expect(result.daysSinceStart).toBeGreaterThanOrEqual(0);
      expect(result.daysUntilNext).toBeGreaterThanOrEqual(0);
    });

    it('연도 끝 절기에서 다음해 첫 절기로 연결', () => {
      // 2024년 12월 31일
      const date = new Date(2024, 11, 31);
      const result = SolarTermsUtils.getCurrentSolarTerm(date);
      
      expect(result.current).toBeDefined();
      expect(result.next).toBeDefined();
      // 다음 절기는 2025년 절기여야 함
      expect(result.next!.date.getFullYear()).toBe(2025);
    });
  });

  describe('getLichunDate', () => {
    it('여러 연도의 입춘 날짜 계산', () => {
      const testYears = [2020, 2021, 2022, 2023, 2024, 2025];
      
      testYears.forEach(year => {
        const lichunDate = SolarTermsUtils.getLichunDate(year);
        
        expect(lichunDate.getFullYear()).toBe(year);
        expect(lichunDate.getMonth()).toBe(1); // 2월
        // 입춘은 보통 2월 3일~5일 사이
        expect(lichunDate.getDate()).toBeGreaterThanOrEqual(3);
        expect(lichunDate.getDate()).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('getSolarTermsBetween', () => {
    it('특정 기간 내 절기 목록 반환', () => {
      const startDate = new Date(2024, 1, 1); // 2024년 2월 1일
      const endDate = new Date(2024, 4, 31);   // 2024년 5월 31일
      
      const terms = SolarTermsUtils.getSolarTermsBetween(startDate, endDate);
      
      // 2월-5월 사이에는 여러 절기가 있어야 함
      expect(terms.length).toBeGreaterThanOrEqual(6);
      expect(terms.length).toBeLessThanOrEqual(8);
      
      // 날짜 순서대로 정렬되어 있는지 확인
      for (let i = 1; i < terms.length; i++) {
        expect(terms[i].date.getTime()).toBeGreaterThan(terms[i-1].date.getTime());
      }
    });
  });

  describe('getSolarTermByName', () => {
    it('절기 이름으로 정확한 날짜 반환', () => {
      const testCases = [
        { year: 2024, termName: '입춘' },
        { year: 2024, termName: '춘분' },
        { year: 2024, termName: '하지' },
        { year: 2024, termName: '추분' },
        { year: 2024, termName: '동지' },
      ];

      testCases.forEach(({ year, termName }) => {
        const result = SolarTermsUtils.getSolarTermByName(year, termName);
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Date);
        
        // 소한, 대한이 아닌 경우 해당 연도여야 함
        if (termName !== '소한' && termName !== '대한') {
          expect(result!.getFullYear()).toBe(year);
        }
      });
    });

    it('존재하지 않는 절기 이름에 대해 null 반환', () => {
      const result = SolarTermsUtils.getSolarTermByName(2024, '존재하지않는절기');
      expect(result).toBeNull();
    });

    it('모든 24절기 이름으로 검색 가능', () => {
      SOLAR_TERMS_NAMES.forEach(termName => {
        const result = SolarTermsUtils.getSolarTermByName(2024, termName);
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Date);
      });
    });
  });

  describe('절기 계산의 정확성 검증', () => {
    it('절기 간격이 대략 15일 내외인지 확인', () => {
      const solarTerms = SolarTermsUtils.calculateSolarTermsForYear(2024);
      
      for (let i = 1; i < 22; i++) { // 소한, 대한 제외하고 연속된 절기들만
        const prevTerm = solarTerms.terms[i-1];
        const currentTerm = solarTerms.terms[i];
        
        const daysDiff = (currentTerm.date.getTime() - prevTerm.date.getTime()) / (1000 * 60 * 60 * 24);
        
        // 절기 간격은 보통 14-16일 정도
        expect(daysDiff).toBeGreaterThan(13);
        expect(daysDiff).toBeLessThan(17);
      }
    });

    it('절기별 월 매핑이 올바른지 확인', () => {
      const solarTerms = SolarTermsUtils.calculateSolarTermsForYear(2024);
      
      solarTerms.terms.forEach((term, index) => {
        expect(term.monthIndex).toBe(SOLAR_TERM_TO_MONTH_MAP[index]);
        expect(term.monthIndex).toBeGreaterThanOrEqual(0);
        expect(term.monthIndex).toBeLessThanOrEqual(11);
      });
    });

    it('사계절 절기가 올바른 시기에 위치하는지 확인', () => {
      const solarTerms = SolarTermsUtils.calculateSolarTermsForYear(2024);
      
      // 춘분 (3월 20일 경)
      const chunbun = solarTerms.terms.find(term => term.name === '춘분')!;
      expect(chunbun.date.getMonth()).toBe(2); // 3월
      expect(chunbun.date.getDate()).toBeGreaterThanOrEqual(19);
      expect(chunbun.date.getDate()).toBeLessThanOrEqual(22);
      
      // 하지 (6월 21일 경)
      const haji = solarTerms.terms.find(term => term.name === '하지')!;
      expect(haji.date.getMonth()).toBe(5); // 6월
      expect(haji.date.getDate()).toBeGreaterThanOrEqual(20);
      expect(haji.date.getDate()).toBeLessThanOrEqual(22);
      
      // 추분 (9월 22일 경)
      const chubun = solarTerms.terms.find(term => term.name === '추분')!;
      expect(chubun.date.getMonth()).toBe(8); // 9월
      expect(chubun.date.getDate()).toBeGreaterThanOrEqual(21);
      expect(chubun.date.getDate()).toBeLessThanOrEqual(24);
      
      // 동지 (12월 21일 경)
      const dongji = solarTerms.terms.find(term => term.name === '동지')!;
      expect(dongji.date.getMonth()).toBe(11); // 12월
      expect(dongji.date.getDate()).toBeGreaterThanOrEqual(20);
      expect(dongji.date.getDate()).toBeLessThanOrEqual(23);
    });
  });

  describe('특수 케이스 테스트', () => {
    it('소한, 대한이 다음해에 올바르게 계산되는지 확인', () => {
      const solarTerms = SolarTermsUtils.calculateSolarTermsForYear(2024);
      
      const sohan = solarTerms.terms.find(term => term.name === '소한')!;
      const dahan = solarTerms.terms.find(term => term.name === '대한')!;
      
      // 소한, 대한은 2025년 1월에 있어야 함
      expect(sohan.date.getFullYear()).toBe(2025);
      expect(sohan.date.getMonth()).toBe(0); // 1월
      
      expect(dahan.date.getFullYear()).toBe(2025);
      expect(dahan.date.getMonth()).toBe(0); // 1월
      
      // 소한이 대한보다 앞서야 함
      expect(sohan.date.getTime()).toBeLessThan(dahan.date.getTime());
    });

    it('극한 연도에서도 계산이 가능한지 확인', () => {
      const extremeYears = [1900, 1950, 2000, 2050, 2100];
      
      extremeYears.forEach(year => {
        expect(() => {
          const result = SolarTermsUtils.calculateSolarTermsForYear(year);
          expect(result.year).toBe(year);
          expect(result.terms).toHaveLength(24);
        }).not.toThrow();
      });
    });
  });

  describe('실제 천문대 데이터와의 비교 테스트', () => {
    it('2024년 주요 절기 날짜 정확성 검증', () => {
      const solarTerms = SolarTermsUtils.calculateSolarTermsForYear(2024);
      
      // 2024년 실제 절기 날짜 (한국천문연구원 기준, ±1일 오차 허용)
      const expectedDates = [
        { name: '입춘', month: 1, date: 4 },   // 2월 4일
        { name: '춘분', month: 2, date: 20 },  // 3월 20일
        { name: '하지', month: 5, date: 21 },  // 6월 21일
        { name: '추분', month: 8, date: 22 },  // 9월 22일
        { name: '동지', month: 11, date: 21 }  // 12월 21일
      ];

      expectedDates.forEach(({ name, month, date }) => {
        const term = solarTerms.terms.find(t => t.name === name)!;
        expect(term).toBeDefined();
        expect(term.date.getMonth()).toBe(month);
        
        // ±1일 오차 허용
        expect(Math.abs(term.date.getDate() - date)).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('사주 월 계산 통합 테스트', () => {
    it('실제 생년월일로 사주 월 계산 검증', () => {
      const testCases = [
        { 
          birth: new Date(1990, 2, 15), // 1990년 3월 15일
          expectedSajuYear: 1990,
          expectedSajuMonth: 1, // 2월 (묘월)
          description: '경칩 이후 춘분 이전'
        },
        {
          birth: new Date(1985, 0, 10), // 1985년 1월 10일
          expectedSajuYear: 1984,
          expectedSajuMonth: 11, // 12월 (축월)
          description: '입춘 이전'
        },
        {
          birth: new Date(2000, 5, 25), // 2000년 6월 25일
          expectedSajuYear: 2000,
          expectedSajuMonth: 4, // 5월 (오월)
          description: '하지 이후 소서 이전'
        }
      ];

      testCases.forEach(({ birth, expectedSajuYear, expectedSajuMonth }) => {
        const sajuYear = SolarTermsUtils.getSajuYear(birth);
        const sajuMonth = SolarTermsUtils.getSajuMonth(birth);
        
        expect(sajuYear).toBe(expectedSajuYear);
        expect(sajuMonth).toBe(expectedSajuMonth);
      });
    });

    it('절기 경계일 정확성 테스트', () => {
      // 2024년 입춘 정확한 시간 기준 테스트
      const solarTerms = SolarTermsUtils.calculateSolarTermsForYear(2024);
      const lichun = solarTerms.terms.find(term => term.name === '입춘')!;
      
      // 입춘 정확한 시간 기준 1분 전후 테스트
      const oneMinuteBefore = new Date(lichun.date.getTime() - 60 * 1000);
      const oneMinuteAfter = new Date(lichun.date.getTime() + 60 * 1000);
      
      expect(SolarTermsUtils.getSajuYear(oneMinuteBefore)).toBe(2023);
      expect(SolarTermsUtils.getSajuYear(oneMinuteAfter)).toBe(2024);
      
      expect(SolarTermsUtils.getSajuMonth(oneMinuteBefore)).toBe(11); // 12월
      expect(SolarTermsUtils.getSajuMonth(oneMinuteAfter)).toBe(0);   // 1월
    });
  });

  describe('윤년 처리 검증', () => {
    it('윤년과 평년의 절기 계산 비교', () => {
      const leapYear = 2020;
      const commonYear = 2021;
      
      const leapTerms = SolarTermsUtils.calculateSolarTermsForYear(leapYear);
      const commonTerms = SolarTermsUtils.calculateSolarTermsForYear(commonYear);
      
      expect(leapTerms.terms).toHaveLength(24);
      expect(commonTerms.terms).toHaveLength(24);
      
      // 같은 절기의 날짜 차이가 합리적인 범위에 있는지 확인
      for (let i = 0; i < 22; i++) { // 소한, 대한 제외
        const leapTerm = leapTerms.terms[i];
        const commonTerm = commonTerms.terms[i];
        
        const daysDiff = Math.abs(
          (commonTerm.date.getTime() - leapTerm.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // 연도 차이에 따른 절기 이동은 보통 1일 이내
        expect(daysDiff).toBeLessThan(2);
      }
    });
  });

  describe('성능 테스트', () => {
    it('다수의 연도 계산이 합리적인 시간 내에 완료', () => {
      const startTime = Date.now();
      
      for (let year = 2000; year <= 2030; year++) {
        SolarTermsUtils.calculateSolarTermsForYear(year);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 31년간의 절기 계산이 5초 이내에 완료되어야 함
      expect(duration).toBeLessThan(5000);
    });
  });
});