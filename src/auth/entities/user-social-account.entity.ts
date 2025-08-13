import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SocialProvider {
  NAVER = 'naver',
  KAKAO = 'kakao',
  APPLE = 'apple',
}

@Entity({ name: 'user_social_accounts' })
@Unique('uq_provider_provider_user_id', ['provider', 'providerUserId'])
export class UserSocialAccount extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '소셜 계정 ID', example: 1 })
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: '연결된 사용자 ID', example: 1 })
  user: User;

  @Column({ type: 'enum', enum: SocialProvider })
  @ApiProperty({ description: '소셜 제공자', enum: SocialProvider, example: SocialProvider.KAKAO })
  provider: SocialProvider;

  @Column({ length: 191 })
  @Index('idx_provider_user_id')
  @ApiProperty({ description: '제공자 내 유저 식별자', example: '1234567890' })
  providerUserId: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  @ApiProperty({ description: '액세스 토큰(옵션)', example: 'ya29.a0...', nullable: true })
  accessToken: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  @ApiProperty({ description: '리프레시 토큰(옵션)', example: '1//0g...', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  @ApiProperty({ description: '액세스 토큰 만료 시각(옵션)', example: '2024-01-01T12:00:00.000Z', nullable: true })
  accessTokenExpiresAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @ApiProperty({ description: '수정일' })
  updatedAt: Date;
}


