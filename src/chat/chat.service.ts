import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage, ChatMessageRole } from './entities/chat-message.entity';
import { ChatSession } from './entities/chat-session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { SendMessageWithPromptDto } from './dto/send-message-with-prompt.dto';
import { User } from '@/users/entities/user.entity';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { PromptService } from './services/prompt.service';

@Injectable()
export class ChatService {
  private readonly claude: ChatAnthropic;

  constructor(
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly promptService: PromptService,
  ) {
    // Claude 모델 초기화
    this.claude = new ChatAnthropic({
      model: 'claude-4-sonnet-20241022', // 최신 Claude 3.5 Sonnet 모델
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

  /**
   * 프롬프트 템플릿을 사용한 메시지 전송
   */
  async sendMessageWithPrompt(user: User, dto: SendMessageWithPromptDto) {
    const session = await this.chatSessionRepository.findOne({
      where: { id: dto.sessionId, user: { id: user.id } },
      relations: ['messages'],
      order: { messages: { createdAt: 'ASC' } as any },
    });
    if (!session) throw new NotFoundException('세션을 찾을 수 없습니다');

    // 프롬프트 템플릿이 지정된 경우 처리
    let systemMessage = '';
    if (dto.promptTemplate) {
      // 필수 변수 검증
      const validation = this.promptService.validateRequiredVariables(
        dto.promptTemplate,
        dto.promptVariables || {},
      );
      
      if (!validation.isValid) {
        throw new NotFoundException(
          `필수 변수가 누락되었습니다: ${validation.missingVariables.join(', ')}`
        );
      }

      // 프롬프트 생성
      const promptResult = this.promptService.generatePrompt(dto.promptTemplate, dto.promptVariables);
      if (!promptResult) {
        throw new NotFoundException(`존재하지 않는 프롬프트 템플릿: ${dto.promptTemplate}`);
      }

      systemMessage = promptResult.systemPrompt;
    }

    // 사용자 메시지 저장 (프롬프트 정보도 메타데이터에 포함)
    const userMessage = this.chatMessageRepository.create({
      session,
      role: ChatMessageRole.USER,
      content: dto.content,
      metadata: dto.promptTemplate ? {
        promptTemplate: dto.promptTemplate,
        promptVariables: dto.promptVariables,
      } : null,
    });
    await this.chatMessageRepository.save(userMessage);

    // 대화 히스토리 구성 (시스템 메시지가 있으면 맨 앞에 추가)
    const history = [];
    
    if (systemMessage) {
      history.push({ role: 'system', content: systemMessage });
    }

    // 기존 대화 히스토리 추가
    history.push(...session.messages.map((m) => ({ role: m.role, content: m.content })));
    
    // 현재 사용자 메시지 추가
    history.push({ role: ChatMessageRole.USER, content: dto.content });

    // LLM 호출
    const llm = await this.callLlmApi(history, dto.options);
    const assistantContent = llm?.content ?? '';

    const assistantMessage = this.chatMessageRepository.create({
      session,
      role: ChatMessageRole.ASSISTANT,
      content: assistantContent,
      metadata: {
        ...llm?.meta,
        usedPromptTemplate: dto.promptTemplate || null,
      },
    });
    await this.chatMessageRepository.save(assistantMessage);

    // 세션 업데이트 시간 반영
    await this.chatSessionRepository.update(session.id, { updatedAt: new Date() as any });

    return {
      reply: assistantContent,
      usedPromptTemplate: dto.promptTemplate || null,
      systemPrompt: systemMessage || null,
    };
  }

  /**
   * 사용 가능한 프롬프트 템플릿 목록 조회
   */
  getAvailablePrompts() {
    return this.promptService.getAvailablePrompts();
  }

  /**
   * 특정 프롬프트 템플릿의 예시 조회
   */
  getPromptExample(templateKey: string) {
    return this.promptService.getPromptExample(templateKey);
  }

  /**
   * 프롬프트 템플릿 정보 조회
   */
  getPromptTemplate(templateKey: string) {
    return this.promptService.getPromptTemplate(templateKey);
  }

  /**
   * 프롬프트 파일 다시 로드 (개발용)
   */
  reloadPrompts() {
    this.promptService.reloadPrompts();
    return { message: '프롬프트가 다시 로드되었습니다.' };
  }
}


