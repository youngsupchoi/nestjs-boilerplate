import {
  Controller,
  Post,
  Body,
  HttpStatus,
  BadRequestException,
  HttpCode,
  ValidationPipe,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterUserDto } from './dto/register-user.dto';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthType } from '../login/enums/auth-type.enum';
import { AuthGuard } from '../login/decorators/auth-guard.decorator';
import { SmsService } from '../../sms/sms.service';
import { SendVerificationCodeResponseDto } from '../../iam/register/dto/send-verification-code.response.dto';
import { SendVerificationCodeRequestDto } from '../../iam/register/dto/send-verification-code.request.dto';
// import { SmsService } from '@/sms/sms.service';

@ApiTags('auth')
@AuthGuard(AuthType.None)
@Controller('auth/register')
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly smsService: SmsService,
  ) {}
  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: '유저 회원가입 ',
  })
  @ApiResponse({
    status: 201,
    description: '새로운 사용자를 등록',
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', example: 13 },
      },
    },
  })
  @ApiBadRequestResponse({ status: 400, description: '잘못된 요청입니다' })
  public async register(
    @Body(ValidationPipe) registerUserDto: RegisterUserDto,
  ): Promise<any> {
    try {
      await this.registerService.register(registerUserDto);
      // TODO: 배포시에 연결
      // await this.smsService.sendSms(
      //   registerUserDto.phone,
      //   registerUserDto.name,
      // );

      return {
        message: '사용자 등록이 성공적으로 완료되었습니다!',
        status: HttpStatus.CREATED,
      };
    } catch (err) {
      throw new BadRequestException(err, '오류: 사용자 등록에 실패했습니다!');
    }
  }

  @Post('/phone/verify')
  @ApiOperation({ summary: '휴대폰 인증번호 발송' })
  @ApiResponse({
    status: 200,
    description: '인증번호가 발송되었습니다',
    type: SendVerificationCodeResponseDto,
  })
  @ApiBadRequestResponse({ status: 400, description: '잘못된 요청입니다' })
  @AuthGuard(AuthType.None)
  public async sendVerificationCode(
    @Body(ValidationPipe)
    sendVerificationCodeRequestDto: SendVerificationCodeRequestDto,
  ): Promise<SendVerificationCodeResponseDto> {
    const { verificationCode, createdAt } =
      await this.smsService.sendVerificationCode(
        sendVerificationCodeRequestDto.phone,
      );
    return { verificationCode, createdAt };
  }
}
