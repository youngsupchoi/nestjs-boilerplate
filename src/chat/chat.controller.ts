import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AuthGuard } from '@/iam/login/decorators/auth-guard.decorator';
import { AuthType } from '@/iam/login/enums/auth-type.enum';
import { GetUser } from '@/users/get-user.decorator';
import { JwtUser } from '@/iam/interfaces/jwt-user.interface';
import { UsersService } from '@/users/users.service';

@ApiTags('chat')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService, private readonly usersService: UsersService) {}

  @Post('sessions')
  @HttpCode(201)
  @ApiOperation({ summary: '채팅 세션 생성' })
  @ApiOkResponse({ description: '세션 생성 성공' })
  async createSession(@GetUser() user: JwtUser, @Body() dto: CreateSessionDto) {
    const me = await this.usersService.findById(user.sub.toString());
    return this.chatService.createSession(me, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: '내 채팅 세션 목록' })
  @ApiOkResponse({ description: '세션 목록' })
  async listSessions(@GetUser() user: JwtUser) {
    const me = await this.usersService.findById(user.sub.toString());
    return this.chatService.listSessions(me);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: '세션 상세 및 메시지' })
  @ApiOkResponse({ description: '세션 상세' })
  async getSession(@GetUser() user: JwtUser, @Param('id') id: string) {
    const me = await this.usersService.findById(user.sub.toString());
    return this.chatService.getSession(me, Number(id));
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: '세션 삭제' })
  @ApiOkResponse({ description: '삭제 결과' })
  async deleteSession(@GetUser() user: JwtUser, @Param('id') id: string) {
    const me = await this.usersService.findById(user.sub.toString());
    return this.chatService.deleteSession(me, Number(id));
  }

  @Post('messages')
  @HttpCode(200)
  @ApiOperation({ summary: 'LLM 대화 메시지 전송' })
  @ApiOkResponse({ description: 'LLM 응답' })
  async sendMessage(@GetUser() user: JwtUser, @Body() dto: SendMessageDto) {
    const me = await this.usersService.findById(user.sub.toString());
    return this.chatService.sendMessage(me, dto);
  }
}


