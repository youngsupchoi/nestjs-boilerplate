import { ApiProperty } from '@nestjs/swagger';

export class SendVerificationCodeResponseDto {
  @ApiProperty({ description: '인증번호', example: 123456 })
  verificationCode: number;

  @ApiProperty({
    description: '인증번호 생성 시간',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
