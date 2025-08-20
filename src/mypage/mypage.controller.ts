import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MypageService } from './mypage.service';
import { AuthGuard } from '@/iam/login/decorators/auth-guard.decorator';
import { AuthType } from '@/iam/login/enums/auth-type.enum';
import { GetUser } from '@/users/get-user.decorator';
import { JwtUser } from '@/iam/interfaces/jwt-user.interface';

@ApiTags('mypage')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('mypage')
export class MypageController {
  constructor(private readonly mypageService: MypageService) {}

  @Get()
  @ApiOperation({ summary: '마이페이지 정보 조회' })
  @ApiOkResponse({ description: '마이페이지 데이터' })
  async me(@GetUser() user: JwtUser) {
    return this.mypageService.getMyPage(user.sub.toString());
  }
}


