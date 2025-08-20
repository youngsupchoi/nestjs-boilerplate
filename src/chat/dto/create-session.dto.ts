import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: '세션 제목', example: '상담 준비 채팅', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ description: '모델/설정 정보', example: { model: 'gpt-4o', temperature: 0.7 }, required: false })
  @IsOptional()
  settings?: Record<string, any>;
}


