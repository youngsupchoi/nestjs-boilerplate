import { ApiProperty } from '@nestjs/swagger';
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from 'class-validator';

export class UserDto {
  @IsString()
  @MaxLength(30)
  @ApiProperty({
    description: '이름',
    example: '김경아',
  })
  readonly name: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '이메일',
    example: 'test@test.com',
  })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  @ApiProperty({
    description: '비밀번호',
    example: 'password',
  })
  password: string;

  @IsString()
  @MaxLength(11)
  @ApiProperty({
    description: '휴대폰 번호',
    example: '01012345678',
  })
  readonly phone: string;
}
