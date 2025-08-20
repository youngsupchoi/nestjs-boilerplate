import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * 만세력 데이터 엔티티 (1900년~2100년)
 * 테이블명: calenda_data
 */
@Entity('calenda_data')
export class CalendarData {
  @PrimaryColumn('integer')
  cd_no: number;

  @Column('smallint', { nullable: true })
  cd_sgi: number; // 단기 연도

  @Column('smallint', { nullable: true })
  cd_sy: number; // 양력 년도

  @Column('varchar', { length: 2, nullable: true })
  cd_sm: string; // 양력 월

  @Column('varchar', { length: 2, nullable: true })
  cd_sd: string; // 양력 일

  @Column('smallint', { nullable: true })
  cd_ly: number; // 음력 년도

  @Column('varchar', { length: 2, nullable: true })
  cd_lm: string; // 음력 월

  @Column('varchar', { length: 2, nullable: true })
  cd_ld: string; // 음력 일

  @Column('varchar', { length: 6, nullable: true })
  cd_hyganjee: string; // 년주 간지 (한자)

  @Column('varchar', { length: 6, nullable: true })
  cd_kyganjee: string; // 년주 간지 (한글)

  @Column('varchar', { length: 6, nullable: true })
  cd_hmganjee: string; // 월주 간지 (한자)

  @Column('varchar', { length: 6, nullable: true })
  cd_kmganjee: string; // 월주 간지 (한글)

  @Column('varchar', { length: 6, nullable: true })
  cd_hdganjee: string; // 일주 간지 (한자)

  @Column('varchar', { length: 6, nullable: true })
  cd_kdganjee: string; // 일주 간지 (한글)

  @Column('char', { length: 3, nullable: true })
  cd_hweek: string; // 일진 오행 (한자)

  @Column('char', { length: 3, nullable: true })
  cd_kweek: string; // 일진 오행 (한글)

  @Column('char', { length: 3, nullable: true })
  cd_stars: string; // 28수

  @Column('char', { length: 3, nullable: true })
  cd_moon_state: string; // 달의 상태

  @Column('varchar', { length: 12, nullable: true })
  cd_moon_time: string; // 달의 시간

  @Column('int', { width: 1, default: 0 })
  cd_leap_month: number; // 윤달 여부

  @Column('int', { width: 1, default: 0 })
  cd_month_size: number; // 월의 크기

  @Column('varchar', { length: 6, nullable: true })
  cd_hterms: string; // 24절기 (한자)

  @Column('varchar', { length: 6, nullable: true })
  cd_kterms: string; // 24절기 (한글)

  @Column('varchar', { length: 12, nullable: true })
  cd_terms_time: string; // 절기 시간

  @Column('varchar', { length: 6, nullable: true })
  cd_keventday: string; // 기념일/절기

  @Column('varchar', { length: 10, nullable: true })
  cd_ddi: string; // 12지지 동물

  @Column('varchar', { length: 50, nullable: true })
  cd_sol_plan: string; // 양력 기념일

  @Column('varchar', { length: 50, nullable: true })
  cd_lun_plan: string; // 음력 기념일

  @Column('int', { width: 1, nullable: true, default: 0 })
  holiday: number; // 공휴일 여부
}