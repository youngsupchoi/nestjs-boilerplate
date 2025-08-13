import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum ConsultantType {
  SAJU = 'saju',
  TAROT = 'tarot',
}

@Entity({ name: 'consultants' })
export class Consultant extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '상담사 ID', example: 1 })
  id: number;

  @Column({ type: 'varchar', length: 60 })
  @ApiProperty({ description: '이름', example: '신점가' })
  name: string;

  @Column({ type: 'enum', enum: ConsultantType })
  @ApiProperty({ description: '분류', enum: ConsultantType, example: ConsultantType.SAJU })
  type: ConsultantType;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: '소개', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({ description: '프로필 이미지 URL', nullable: true })
  avatarUrl: string | null;

  // 단순 리스트 용도: 별도 관계/전문분야 테이블 제거

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}


