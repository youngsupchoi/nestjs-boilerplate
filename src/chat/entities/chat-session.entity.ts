import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatMessage } from './chat-message.entity';

@Entity({ name: 'chat_sessions' })
export class ChatSession extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '채팅 세션 ID', example: 1 })
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: '사용자', type: () => User })
  user: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiProperty({ description: '세션 제목', example: '상담 준비 채팅', nullable: true })
  title: string | null;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ description: '모델/설정 정보', example: { model: 'gpt-4o', temperature: 0.7 }, nullable: true })
  settings: Record<string, any> | null;

  @OneToMany(() => ChatMessage, (m) => m.session)
  @ApiProperty({ description: '메시지 목록', type: () => [ChatMessage] })
  messages: ChatMessage[];

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @ApiProperty({ description: '수정일' })
  updatedAt: Date;
}


