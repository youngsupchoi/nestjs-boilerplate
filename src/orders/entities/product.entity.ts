import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';

export enum ProductType {
  SUBSCRIPTION_MONTHLY_UNLIMITED = 'monthly_unlimited',
  SUBSCRIPTION_2WEEK_UNLIMITED = '2week_unlimited',
  ONE_TIME_UNLIMITED = 'one_time_unlimited',
  GOODS_A = 'goods_a',
  GOODS_B = 'goods_b',
}

@Entity({ name: 'products' })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '상품 ID', example: 1 })
  id: number;

  @Column({ type: 'varchar', length: 120 })
  @ApiProperty({ description: '상품명', example: '2주 무제한' })
  name: string;

  @Column({ type: 'enum', enum: ProductType })
  @ApiProperty({ description: '상품 유형', enum: ProductType, example: ProductType.SUBSCRIPTION_2WEEK_UNLIMITED })
  type: ProductType;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: '가격', example: 9900 })
  price: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: '설명', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ description: '주문 시 추가 입력값 스키마(미정)', example: { fields: [] }, nullable: true })
  orderFormSchema: Record<string, any> | null;

  @OneToMany(() => Order, (o) => o.product)
  @ApiProperty({ description: '해당 상품의 주문들', type: () => [Order] })
  orders: Order[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}


