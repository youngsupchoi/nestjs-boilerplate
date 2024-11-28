import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class SendVerificationCodeRequestDto {
  @ApiProperty({ description: '휴대폰 번호', example: '01012345678' })
  @IsNotEmpty()
  @IsString()
  phone: string;
}
