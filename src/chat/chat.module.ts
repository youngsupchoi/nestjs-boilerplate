import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PromptService } from './services/prompt.service';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatSession } from './entities/chat-session.entity';
import { UsersModule } from '@/users/users.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, ChatMessage]),
    UsersModule,
    HttpModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, PromptService],
  exports: [ChatService, PromptService],
})
export class ChatModule {}


