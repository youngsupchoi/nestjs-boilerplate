import {
  Controller,
  Put,
  Get,
  Body,
  Param,
  HttpStatus,
  NotFoundException,
  Delete,
  BadRequestException,
  HttpCode,
  Post,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { AccountsUsers } from './interfaces/accounts-users.interface';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { GetUser } from './get-user.decorator';
import { JwtUser } from '../iam/interfaces/jwt-user.interface';
import { User } from './entities/user.entity';
import { UnauthorizedResponseDto } from '../shared/dto/unauthorized-response.dto';
import { UserAllResponseDto } from '@/users/dto/response/user-all-response.dto';
import { UserDeleteRequestDto } from '@/users/dto/request/user-delete-request.dto';
import { SmsService } from '@/sms/sms.service';

@ApiTags('users')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly smsService: SmsService,
  ) {}

  @Get()
  @ApiOperation({ summary: '(admin)모든 유저 조회' })
  @ApiResponse({
    status: 200,
    description: '(admin)모든 유저 조회',
    type: [UserAllResponseDto],
  })
  @AuthGuard(AuthType.None)
  public async findAllUser(): Promise<UserAllResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get('/:userId')
  @ApiExcludeEndpoint()
  @ApiOkResponse({
    description: '유저 조회',
    type: User,
  })
  @ApiNotFoundResponse({ status: 400, description: 'User not found' })
  public async findOneUser(
    @Param('userId') userId: string,
  ): Promise<AccountsUsers> {
    return this.usersService.findById(userId);
  }

  @Get('/me/info')
  @HttpCode(200)
  @ApiOperation({ summary: '나의 정보 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: '나의 정보 조회',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: '인증 실패',
    type: UnauthorizedResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  public async findMyInfo(@GetUser() user: JwtUser) {
    const userInfo: User = await this.usersService.findById(
      user.sub.toString(),
    );
    const result = {
      ...userInfo,
    };
    return result;
  }

  @Get('/:userId/profile')
  @ApiExcludeEndpoint()
  @ApiResponse({
    status: 200,
    description: 'Get a user profile by id',
  })
  @ApiNotFoundResponse({ status: 400, description: 'User not found' })
  public async getUser(@Param('userId') userId: string): Promise<any> {
    const user = await this.findOneUser(userId);

    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return {
      user: user,
      status: HttpStatus.OK,
    };
  }

  @Put('/:userId/profile')
  @ApiExcludeEndpoint()
  @ApiResponse({
    status: 200,
    description: 'Update a user profile by id',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'User profile not updated',
  })
  public async updateUserProfile(
    @Param('userId') userId: string,
    @Body() userProfileDto: UserProfileDto,
  ): Promise<any> {
    try {
      await this.usersService.updateUserProfile(userId, userProfileDto);

      return {
        message: 'User Updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: User not updated!');
    }
  }

  @Put('/me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '나의 정보 업데이트하기, 변화하지 않는 정보도 모두 보내야함',
  })
  @ApiOkResponse({
    description: '나의 정보 업데이트하기',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  public async updateUser(
    @GetUser() user: JwtUser,
    @Body() userUpdateDto: UserUpdateDto,
  ): Promise<any> {
    const { phone, name, email } = userUpdateDto;
    await this.usersService.updateUser(user.sub.toString(), phone, email);

    return {
      message: 'User Updated successfully!',
      status: HttpStatus.OK,
    };
  }

  @Post('/withdraw')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '회원탈퇴',
  })
  @ApiOkResponse({
    description: '회원탈퇴 성공',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @AuthGuard(AuthType.Bearer)
  public async withdrawUser(
    @GetUser() user: JwtUser,
    @Body() userDeleteRequestDto: UserDeleteRequestDto,
  ): Promise<any> {
    await this.usersService.withdrawUser(
      +user.sub,
      userDeleteRequestDto.withdrawalReason,
      userDeleteRequestDto.withdrawalReasonType,
    );
    return {
      message: 'User withdrawn successfully!',
    };
  }

  @Get('/withdrawn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '(admin)탈퇴유저 조회',
  })
  @ApiOkResponse({
    description: '탈퇴유저 조회 성공',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 에러',
  })
  @AuthGuard(AuthType.None)
  public async getWithdrawnUsers(): Promise<any> {
    const withdrawnUsers = await this.usersService.getWithdrawnUsers();
    return {
      message: 'Withdrawn users retrieved successfully!',
      data: withdrawnUsers,
    };
  }
}
