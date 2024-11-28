import { ApiProperty } from '@nestjs/swagger';

export class PhoneNotFoundResponseDto {
  @ApiProperty({ example: 'User #01012365678 not found' })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: string;

  @ApiProperty({ example: 404 })
  statusCode: number;
}
