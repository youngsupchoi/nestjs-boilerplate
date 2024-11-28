import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class UserDeleteRequestDto {
  @ApiProperty({ description: '탈퇴 사유', example: '서비스 이용 불만' })
  @IsString()
  withdrawalReason: string;

  @ApiProperty({ description: '탈퇴 사유 종류', example: '기타' })
  @IsString()
  withdrawalReasonType: string;
}
