import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@/iam/login/decorators/auth-guard.decorator';
import { AuthType } from '@/iam/login/enums/auth-type.enum';
import { GetUser } from '@/users/get-user.decorator';
import { JwtUser } from '@/iam/interfaces/jwt-user.interface';
import { UsersService } from '@/users/users.service';

@ApiTags('orders')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService, private readonly usersService: UsersService) {}

  @Get('products/seed')
  @ApiOperation({ summary: '(dev) 기본 상품 시드' })
  @ApiOkResponse({ description: '시드 완료' })
  async seed() {
    await this.ordersService.seedProductsIfEmpty();
    return { seeded: true };
  }

  @Get('products')
  @ApiOperation({ summary: '상품 목록' })
  @ApiOkResponse({ description: '상품 목록' })
  async products() {
    return this.ordersService.listProducts();
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '주문 생성' })
  @ApiOkResponse({ description: '주문 생성 성공' })
  async createOrder(
    @GetUser() user: JwtUser,
    @Body() body: { productId: number; quantity?: number; orderFormValues?: Record<string, any> },
  ) {
    const me = await this.usersService.findById(user.sub.toString());
    return this.ordersService.createOrder(me, body);
  }

  @Get()
  @ApiOperation({ summary: '내 주문 목록' })
  @ApiOkResponse({ description: '주문 목록' })
  async list(@GetUser() user: JwtUser) {
    const me = await this.usersService.findById(user.sub.toString());
    return this.ordersService.listOrders(me);
  }

  @Get(':id')
  @ApiOperation({ summary: '주문 상세' })
  @ApiOkResponse({ description: '주문 상세' })
  async get(@GetUser() user: JwtUser, @Param('id') id: string) {
    const me = await this.usersService.findById(user.sub.toString());
    return this.ordersService.getOrder(me, Number(id));
  }
}


