import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Product, ProductType } from './entities/product.entity';
import { Subscription } from './entities/subscription.entity';
import { User } from '@/users/entities/user.entity';

interface CreateOrderInput {
  productId: number;
  quantity?: number;
  orderFormValues?: Record<string, any>;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Subscription) private readonly subRepo: Repository<Subscription>,
  ) {}

  async seedProductsIfEmpty() {
    const count = await this.productRepo.count();
    if (count > 0) return;
    const now = new Date();
    await this.productRepo.save([
      this.productRepo.create({ name: '월 무제한', type: ProductType.SUBSCRIPTION_MONTHLY_UNLIMITED, price: '19900', description: '한 달 무제한 이용' }),
      this.productRepo.create({ name: '2주 무제한', type: ProductType.SUBSCRIPTION_2WEEK_UNLIMITED, price: '12900', description: '2주 무제한 이용' }),
      this.productRepo.create({ name: '1회 무제한', type: ProductType.ONE_TIME_UNLIMITED, price: '3900', description: '1회 상담 패스' }),
      this.productRepo.create({ name: '상품 A', type: ProductType.GOODS_A, price: '9900', description: '굿즈 A' }),
      this.productRepo.create({ name: '상품 B', type: ProductType.GOODS_B, price: '14900', description: '굿즈 B' }),
    ]);
  }

  async listProducts() {
    return this.productRepo.find({ order: { id: 'ASC' } });
  }

  async createOrder(user: User, input: CreateOrderInput) {
    const product = await this.productRepo.findOne({ where: { id: input.productId } });
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다');
    const quantity = input.quantity && input.quantity > 0 ? input.quantity : 1;

    const order = this.orderRepo.create({
      user,
      status: OrderStatus.PENDING,
      product,
      quantity,
      unitPrice: product.price,
      totalAmount: (Number(product.price) * quantity).toFixed(2),
      orderFormValues: input.orderFormValues ?? null,
    });
    const saved = await this.orderRepo.save(order);
    return saved;
  }

  async listOrders(user: User) {
    return this.orderRepo.find({ where: { user: { id: user.id } }, order: { createdAt: 'DESC' } });
  }

  async getOrder(user: User, orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId, user: { id: user.id } } });
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다');
    return order;
  }

  async markPaid(orderId: number) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다');
    order.status = OrderStatus.PAID;
    await this.orderRepo.save(order);

    // 구독형 상품이면 구독 발급
    if ([ProductType.SUBSCRIPTION_MONTHLY_UNLIMITED, ProductType.SUBSCRIPTION_2WEEK_UNLIMITED].includes(order.product.type)) {
      const now = new Date();
      const ends = new Date(now);
      if (order.product.type === ProductType.SUBSCRIPTION_MONTHLY_UNLIMITED) ends.setMonth(now.getMonth() + 1);
      if (order.product.type === ProductType.SUBSCRIPTION_2WEEK_UNLIMITED) ends.setDate(now.getDate() + 14);
      const sub = this.subRepo.create({ user: order.user as any, type: order.product.type, startsAt: now, endsAt: ends, active: true });
      await this.subRepo.save(sub);
    }

    return order;
  }
}


