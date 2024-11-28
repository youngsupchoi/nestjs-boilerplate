import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendSmsRequestDto {
  @ApiProperty({ description: '전화번호', example: '01012345678' })
  @IsString()
  phone: string;

  @ApiProperty({ description: '이름', example: '김파모' })
  @IsString()
  name: string;
}
