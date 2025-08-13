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
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from './product.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

@Entity({ name: 'orders' })
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '주문 ID', example: 1 })
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  @Index('idx_orders_user_id')
  @ApiProperty({ description: '주문자', type: () => User })
  user: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  @ApiProperty({ description: '주문 상태', enum: OrderStatus })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiProperty({ description: '외부 결제사 주문 ID', nullable: true })
  externalOrderId: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: '총액' })
  totalAmount: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ description: '주문 시 입력값(미정 스키마)', nullable: true })
  orderFormValues: Record<string, any> | null;

  @ManyToOne(() => Product, { eager: true, nullable: false })
  @JoinColumn({ name: 'product_id' })
  @ApiProperty({ description: '주문 상품', type: () => Product })
  product: Product;

  @Column({ type: 'int', default: 1 })
  @ApiProperty({ description: '수량', example: 1 })
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: '단가' })
  unitPrice: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}


