import { IsBoolean, IsString, MaxLength } from 'class-validator';
import { UserDto } from '../../../users/dto/user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, RegisterPath } from '../../enums/relationship.enum';

export class RegisterUserDto extends UserDto {
  @IsString()
  @MaxLength(10)
  @ApiProperty({
    description: '생년월일',
    example: '19900101',
  })
  birthday: string;

  @IsString()
  @ApiProperty({
    description: '가입 경로',
    example: RegisterPath.DIRECT,
    enum: RegisterPath,
  })
  register_path: RegisterPath;

  @IsBoolean()
  @ApiProperty({
    description: '마케팅 동의 여부',
    example: false,
  })
  marketing_agreed: boolean;
}
