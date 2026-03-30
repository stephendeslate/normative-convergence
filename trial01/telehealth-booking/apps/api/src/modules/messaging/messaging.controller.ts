import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { sendMessageSchema, AUDIT_ACTIONS } from '@medconnect/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { MessagingService } from './messaging.service';

@ApiTags('Messaging')
@ApiBearerAuth()
@Controller('messages')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  @AuditAction(AUDIT_ACTIONS.MESSAGE_SEND)
  @UsePipes(new ZodValidationPipe(sendMessageSchema))
  async sendMessage(
    @Body() body: any,
    @CurrentUser() user: { id: string; practiceId?: string },
  ) {
    return this.messagingService.sendMessage(body, user.id, body.practiceId || user.practiceId!);
  }

  @Get(':appointmentId')
  async getMessages(
    @Param('appointmentId') appointmentId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.messagingService.getMessages(appointmentId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }
}
