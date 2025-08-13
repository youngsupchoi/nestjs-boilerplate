import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProductType } from './product.entity';

@Entity({ name: 'subscriptions' })
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '구독 ID', example: 1 })
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index('idx_subscriptions_user_id')
  user: User;

  @Column({ type: 'enum', enum: ProductType })
  @ApiProperty({ description: '구독 유형', enum: ProductType, example: ProductType.SUBSCRIPTION_2WEEK_UNLIMITED })
  type: ProductType;

  @Column({ type: 'timestamptz' })
  @ApiProperty({ description: '시작일' })
  startsAt: Date;

  @Column({ type: 'timestamptz' })
  @ApiProperty({ description: '종료일' })
  endsAt: Date;

  @Column({ type: 'boolean', default: true })
  @ApiProperty({ description: '활성 여부' })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}


