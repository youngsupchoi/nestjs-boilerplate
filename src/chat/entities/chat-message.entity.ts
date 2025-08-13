import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';

export enum ChatMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

@Entity({ name: 'chat_messages' })
export class ChatMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '메시지 ID', example: 1 })
  id: number;

  @ManyToOne(() => ChatSession, (s) => s.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  @ApiProperty({ description: '채팅 세션' })
  session: ChatSession;

  @Column({ type: 'enum', enum: ChatMessageRole })
  @ApiProperty({ description: '역할', enum: ChatMessageRole, example: ChatMessageRole.USER })
  role: ChatMessageRole;

  @Column({ type: 'text' })
  @ApiProperty({ description: '콘텐츠', example: '안녕하세요' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ description: '토큰/메타데이터', example: { promptTokens: 23, completionTokens: 40 }, nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty({ description: '생성일' })
  createdAt: Date;
}


