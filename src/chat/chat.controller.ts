import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import {
  CreateConversationDto,
  AddParticipantDto,
  UpdateParticipantDto,
} from './dto/create-conversation.dto';
import {
  CreateMessageDto,
  UpdateMessageDto,
  AddReactionDto,
  MarkAsReadDto,
} from './dto/create-message.dto';
import { QueryConversationsDto, QueryMessagesDto } from './dto/query-chat.dto';
import {
  ConversationResponseDto,
  MessageResponseDto,
  ConversationParticipantResponseDto,
  MessageReactionResponseDto,
} from './dto/chat-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enum/user-role.enum';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Endpoints para conversas
  @Post('conversations')
  @ApiOperation({ summary: 'Criar nova conversa' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Conversa criada com sucesso',
    type: ConversationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  async createConversation(
    @Request() req: any,
    @Body() createConversationDto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    return await this.chatService.createConversation(
      req.user.id,
      createConversationDto,
    );
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Listar minhas conversas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de conversas do usuário',
  })
  async findMyConversations(
    @Request() req: any,
    @Query() query: QueryConversationsDto,
  ) {
    return await this.chatService.findUserConversations(req.user.id, query);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Buscar conversa por ID' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversa encontrada',
    type: ConversationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conversa não encontrada',
  })
  async findConversation(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<ConversationResponseDto> {
    return await this.chatService.findConversationById(id, req.user.id);
  }

  @Post('conversations/:id/participants')
  @ApiOperation({ summary: 'Adicionar participante à conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Participante adicionado com sucesso',
    type: ConversationParticipantResponseDto,
  })
  async addParticipant(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() addParticipantDto: AddParticipantDto,
  ): Promise<ConversationParticipantResponseDto> {
    return await this.chatService.addParticipant(
      id,
      req.user.id,
      addParticipantDto,
    );
  }

  @Delete('conversations/:id/participants/:participantId')
  @ApiOperation({ summary: 'Remover participante da conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiParam({ name: 'participantId', description: 'ID do participante' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Participante removido com sucesso',
  })
  async removeParticipant(
    @Param('id', ParseIntPipe) id: number,
    @Param('participantId', ParseIntPipe) participantId: number,
    @Request() req: any,
  ): Promise<void> {
    return await this.chatService.removeParticipant(
      id,
      req.user.id,
      participantId,
    );
  }

  // Endpoints para mensagens
  @Post('messages')
  @ApiOperation({ summary: 'Enviar nova mensagem' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Mensagem enviada com sucesso',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  async createMessage(
    @Request() req: any,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    return await this.chatService.createMessage(req.user.id, createMessageDto);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Listar mensagens da conversa' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de mensagens da conversa',
  })
  async findConversationMessages(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Query() query: QueryMessagesDto,
  ) {
    return await this.chatService.findConversationMessages(
      id,
      req.user.id,
      query,
    );
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Marcar mensagens como lidas' })
  @ApiParam({ name: 'id', description: 'ID da conversa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mensagens marcadas como lidas',
  })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() markAsReadDto: MarkAsReadDto,
  ): Promise<void> {
    return await this.chatService.markAsRead(id, req.user.id, markAsReadDto);
  }

  // Endpoints para reações
  @Post('messages/:id/reactions')
  @ApiOperation({ summary: 'Adicionar reação à mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Reação adicionada com sucesso',
    type: MessageReactionResponseDto,
  })
  async addReaction(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() addReactionDto: AddReactionDto,
  ): Promise<MessageReactionResponseDto> {
    return await this.chatService.addReaction(id, req.user.id, addReactionDto);
  }

  @Delete('messages/:id/reactions/:emoji')
  @ApiOperation({ summary: 'Remover reação da mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiParam({ name: 'emoji', description: 'Emoji da reação' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Reação removida com sucesso',
  })
  async removeReaction(
    @Param('id', ParseIntPipe) id: number,
    @Param('emoji') emoji: string,
    @Request() req: any,
  ): Promise<void> {
    return await this.chatService.removeReaction(id, req.user.id, emoji);
  }

  // Endpoints de estatísticas
  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas do chat' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estatísticas do chat do usuário',
  })
  async getChatStats(@Request() req: any) {
    return await this.chatService.getChatStats(req.user.id);
  }
}
