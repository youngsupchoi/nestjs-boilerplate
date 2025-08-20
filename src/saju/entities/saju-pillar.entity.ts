import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { HeavenlyStem, EarthlyBranch, FiveElements } from '../enums';
import { SajuReading } from './saju-reading.entity';

/**
 * 사주의 기둥 (년주, 월주, 일주, 시주)
 */
@Entity('saju_pillars')
export class SajuPillar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SajuReading, (reading) => reading.pillars)
  reading: SajuReading;

  @Column({
    type: 'enum',
    enum: ['year', 'month', 'day', 'hour'],
    comment: '기둥 유형 (년주, 월주, 일주, 시주)',
  })
  pillarType: 'year' | 'month' | 'day' | 'hour';

  @Column({
    type: 'enum',
    enum: HeavenlyStem,
    comment: '천간',
  })
  heavenlyStem: HeavenlyStem;

  @Column({
    type: 'enum',
    enum: EarthlyBranch,
    comment: '지지',
  })
  earthlyBranch: EarthlyBranch;

  @Column({
    type: 'enum',
    enum: FiveElements,
    comment: '천간의 오행',
  })
  heavenlyStemElement: FiveElements;

  @Column({
    type: 'enum',
    enum: FiveElements,
    comment: '지지의 오행',
  })
  earthlyBranchElement: FiveElements;

  @Column({
    type: 'varchar',
    length: 10,
    comment: '간지 조합 (예: 갑자)',
  })
  ganzhi: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
