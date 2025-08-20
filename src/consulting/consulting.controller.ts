import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConsultingService } from './consulting.service';
import { ConsultantType } from './entities/consultant.entity';

@ApiTags('consulting')
@Controller('consulting')
export class ConsultingController {
  constructor(private readonly consultingService: ConsultingService) {}

  @Get('saju')
  @ApiOperation({ summary: '사주 상담사 리스트' })
  @ApiOkResponse({ description: '사주 상담사 목록' })
  async listSaju() {
    return this.consultingService.listByType(ConsultantType.SAJU);
  }

  @Get('tarot')
  @ApiOperation({ summary: '타로 상담사 리스트' })
  @ApiOkResponse({ description: '타로 상담사 목록' })
  async listTarot() {
    return this.consultingService.listByType(ConsultantType.TAROT);
  }
}


