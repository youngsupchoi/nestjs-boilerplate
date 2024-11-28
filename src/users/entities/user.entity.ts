import { RegisterPath } from '../../iam/enums/relationship.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '유저 아이디', example: 1 })
  id: number;

  @Column({ nullable: true })
  @ApiProperty({ description: '이름', example: '홍길동' })
  name: string;

  @Column({
    unique: true,
    nullable: true,
  })
  @ApiProperty({
    description: '이메일',
    example: 'test@test.com',
    nullable: true,
  })
  email: string;

  @Column({
    unique: true,
    nullable: true,
  })
  @ApiProperty({
    description: '휴대폰 번호',
    example: '01012345678',
    nullable: true,
  })
  phone: string;

  @Column({ length: 200 })
  @ApiProperty({ description: '비밀번호', example: 'password' })
  password: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: '생성일', example: '2024-01-01 12:00:00' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: RegisterPath,
    default: RegisterPath.DIRECT,
  })
  @ApiProperty({ description: '가입 경로', example: 'direct' })
  register_path: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '생년월일', example: '19900101', nullable: true })
  birthday: string;

  @Column({ default: false })
  @ApiProperty({ description: '마케팅 동의 여부', example: false })
  marketing_agreed: boolean;

  @Column({ default: 1 })
  @ApiProperty({ description: '프로필 이미지 번호', example: 1 })
  profileImageNo: number;

  @ApiProperty({
    description: '사전질문 처리 여부',
    example: false,
  })
  @IsBoolean()
  @Column({
    name: 'pre_question_processed',
    type: 'bool',
    default: false,
    nullable: false,
    comment: '사전질문 처리 여부',
  })
  preQuestionProcessed: boolean;

  @ApiProperty({
    description: '사후질문 처리 여부',
    example: false,
  })
  @IsBoolean()
  @Column({
    name: 'post_question_processed',
    type: 'bool',
    default: false,
    nullable: false,
    comment: '사후질문 처리 여부',
  })
  postQuestionProcessed: boolean;

  @Column({ nullable: false, default: false })
  @ApiProperty({ description: '유저 탈퇴 여부', example: false })
  isWithdrawal: boolean;

  @Column({ nullable: true })
  @ApiProperty({ description: '탈퇴일', example: '2024-01-01' })
  withdrawalDate: Date;

  @Column({ nullable: true })
  @ApiProperty({ description: '탈퇴사유', example: '서비스 이용 불만' })
  withdrawalReason: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '탈퇴 사유 종류', example: '기타' })
  withdrawalReasonType: string;
}
