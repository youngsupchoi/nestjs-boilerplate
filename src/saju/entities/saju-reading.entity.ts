import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { Gender } from '../enums';
import { SajuPillar } from './saju-pillar.entity';
import { SajuAnalysis } from './saju-analysis.entity';
import { User } from '../../users/entities/user.entity';

/**
 * 사주 해석 정보
 */
@Entity('saju_readings')
export class SajuReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '이름',
  })
  name: string;

  @Column({
    type: 'enum',
    enum: Gender,
    comment: '성별',
  })
  gender: Gender;

  @Column({
    type: 'timestamp',
    comment: '생년월일시',
  })
  birthDateTime: Date;

  @Column({
    type: 'boolean',
    default: false,
    comment: '양력/음력 구분 (true: 양력, false: 음력)',
  })
  isSolar: boolean;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '출생지',
  })
  birthPlace: string;

  @OneToMany(() => SajuPillar, (pillar) => pillar.reading, { cascade: true })
  pillars: SajuPillar[];

  @OneToMany(() => SajuAnalysis, (analysis) => analysis.reading, { cascade: true })
  analyses: SajuAnalysis[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
