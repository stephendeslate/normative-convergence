import { Controller, Get, Post, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { sendMessageSchema } from '@medconnect/shared';
import { MessagingService } from './messaging.service';
import { CurrentUser } from '../common/decorators';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Messaging')
@ApiBearerAuth()
@Controller('messages')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  async send(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(sendMessageSchema)) dto: any,
  ) {
    return this.messagingService.sendMessage(userId, dto);
  }

  @Get(':appointmentId')
  @ApiOperation({ summary: 'Get messages for appointment' })
  async getMessages(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.messagingService.getMessages(
      appointmentId,
      limit ? parseInt(limit, 10) : 50,
      before,
    );
  }

  @Post(':appointmentId/read')
  @ApiOperation({ summary: 'Mark messages as read' })
  async markAsRead(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.messagingService.markAsRead(appointmentId, userId);
    return { success: true };
  }
}
