import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsObject } from 'class-validator';

export class SendMessageWithPromptDto {
  @ApiProperty({ description: '세션 ID' })
  @IsNumber()
  @IsNotEmpty()
  sessionId: number;

  @ApiProperty({ description: '사용자 메시지 내용' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: '사용할 프롬프트 템플릿 키' })
  @IsString()
  @IsOptional()
  promptTemplate?: string;

  @ApiPropertyOptional({ 
    description: '프롬프트 템플릿에 주입할 변수들',
    example: {
      "birthDate": "1990년 3월 15일",
      "gender": "남성",
      "year": "2024",
      "month": "12"
    }
  })
  @IsObject()
  @IsOptional()
  promptVariables?: Record<string, any>;

  @ApiPropertyOptional({ description: '추가 옵션' })
  @IsObject()
  @IsOptional()
  options?: Record<string, any>;
}
