import { ApiProperty } from '@nestjs/swagger';

export class UserAllResponseDto {
  @ApiProperty({ example: 7 })
  userId: number;

  @ApiProperty({ example: '김경아' })
  userName: string;

  @ApiProperty({ example: 'test@test.com' })
  userEmail: string;

  @ApiProperty({ example: '01012345678' })
  userPhone: string;

  @ApiProperty({ example: '2024-11-07T04:04:02.488Z' })
  userCreatedAt: Date;

  @ApiProperty({ example: 'direct' })
  userRegisterPath: string;

  @ApiProperty({ example: '1990-01-01' })
  userBirthday: string;

  @ApiProperty({ example: false })
  userMarketingAgreed: boolean;

  @ApiProperty({ example: 1 })
  userProfileImageNo: number;

  @ApiProperty({ example: true })
  userPreQuestionProcessed: boolean;

  @ApiProperty({ example: true })
  userPostQuestionProcessed: boolean;

  @ApiProperty({ example: false })
  userIsWithdrawal: boolean;

  @ApiProperty({ example: '부모' })
  familyMemberRelationship: string;

  @ApiProperty({ example: 'string' })
  familyMemberName: string;

  @ApiProperty({ example: '2025-02-20T09:49:56.835Z' })
  expiryDate: Date;
}
