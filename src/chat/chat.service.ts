import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage, ChatMessageRole } from './entities/chat-message.entity';
import { ChatSession } from './entities/chat-session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '@/users/entities/user.entity';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

@Injectable()
export class ChatService {
  private readonly claude: ChatAnthropic;

  constructor(
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
  ) {
    // Claude 모델 초기화
    this.claude = new ChatAnthropic({
      model: 'claude-3-5-sonnet-20241022', // 최신 Claude 3.5 Sonnet 모델
      temperature: 0.7,
      maxTokens: 4000,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async createSession(user: User, dto: CreateSessionDto) {
    const session = this.chatSessionRepository.create({
      user,
      title: dto.title ?? null,
      settings: dto.settings ?? null,
    });
    return await this.chatSessionRepository.save(session);
  }

  async listSessions(user: User) {
    return await this.chatSessionRepository.find({
      where: { user: { id: user.id } },
      order: { updatedAt: 'DESC' },
    });
  }

  async getSession(user: User, sessionId: number) {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, user: { id: user.id } },
      relations: ['messages'],
      order: { messages: { createdAt: 'ASC' } as any },
    });
    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다');
    return session;
  }

  async deleteSession(user: User, sessionId: number) {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId, user: { id: user.id } },
    });
    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다');
    await this.chatSessionRepository.remove(session);
    return { deleted: true };
  }

  private async callLlmApi(messages: { role: string; content: string }[], options?: Record<string, any>) {
    try {
      // API 키가 없으면 데모 응답 반환
      if (!process.env.ANTHROPIC_API_KEY) {
        return { content: '준비 중입니다. ANTHROPIC_API_KEY 환경변수를 설정해주세요.' };
      }

      // 메시지를 LangChain 형식으로 변환
      const langchainMessages = messages.map((msg) => {
        switch (msg.role) {
          case 'system':
            return new SystemMessage(msg.content);
          case 'user':
            return new HumanMessage(msg.content);
          case 'assistant':
            return new AIMessage(msg.content);
          default:
            return new HumanMessage(msg.content);
        }
      });

      // Claude 모델 호출
      const response = await this.claude.invoke(langchainMessages);
      
      // content를 문자열로 변환 (LangChain의 MessageContent는 string | MessageContentComplex[] 타입)
      const contentString = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);
      
      return {
        content: contentString,
        meta: {
          model: this.claude.modelName,
          usage: response.usage_metadata || null,
        },
      };
    } catch (error) {
      console.error('Claude API 호출 중 오류 발생:', error);
      return {
        content: '죄송합니다. 현재 응답을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.',
        meta: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }

  async sendMessage(user: User, dto: SendMessageDto) {
    const session = await this.chatSessionRepository.findOne({
      where: { id: dto.sessionId, user: { id: user.id } },
      relations: ['messages'],
      order: { messages: { createdAt: 'ASC' } as any },
    });
    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다');

    // 사용자 메시지 저장
    const userMessage = this.chatMessageRepository.create({
      session,
      role: ChatMessageRole.USER,
      content: dto.content,
      metadata: null,
    });
    await this.chatMessageRepository.save(userMessage);

    // LLM 호출
    const history = [
      ...session.messages.map((m) => ({ role: m.role, content: m.content })),
      { role: ChatMessageRole.USER, content: dto.content },
    ];
    const llm = await this.callLlmApi(history, dto.options);
    const assistantContent = llm?.content ?? '';

    const assistantMessage = this.chatMessageRepository.create({
      session,
      role: ChatMessageRole.ASSISTANT,
      content: assistantContent,
      metadata: llm?.meta ?? null,
    });
    await this.chatMessageRepository.save(assistantMessage);

    // 세션 업데이트 시간 반영
    await this.chatSessionRepository.update(session.id, { updatedAt: new Date() as any });

    return { reply: assistantContent };
  }
}


