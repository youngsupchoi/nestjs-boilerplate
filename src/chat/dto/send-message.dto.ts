import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: '세션 ID', example: 1 })
  @IsInt()
  @Min(1)
  sessionId: number;

  @ApiProperty({ description: '사용자 메시지', example: '오늘 운세 알려줘' })
  @IsString()
  @MaxLength(4000)
  content: string;

  @ApiProperty({ description: '모델/옵션 오버라이드', required: false })
  @IsOptional()
  options?: Record<string, any>;
}


