import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { SajuReading } from './saju-reading.entity';

/**
 * 사주 분석 결과
 */
@Entity('saju_analyses')
export class SajuAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SajuReading, (reading) => reading.analyses)
  reading: SajuReading;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '분석 카테고리 (성격, 운세, 건강, 재물운 등)',
  })
  category: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '분석 제목',
  })
  title: string;

  @Column({
    type: 'text',
    comment: '분석 내용',
  })
  content: string;

  @Column({
    type: 'integer',
    nullable: true,
    comment: '점수 (1-100)',
  })
  score: number;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '등급 (매우좋음, 좋음, 보통, 나쁨, 매우나쁨)',
  })
  grade: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '조언 및 개선방안',
  })
  advice: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
