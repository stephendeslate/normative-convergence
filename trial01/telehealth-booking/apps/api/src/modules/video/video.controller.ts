import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AUDIT_ACTIONS } from '@medconnect/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditAction } from '../../common/decorators/audit-action.decorator';
import { VideoService } from './video.service';

@ApiTags('Video')
@ApiBearerAuth()
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('rooms')
  @AuditAction(AUDIT_ACTIONS.VIDEO_ROOM_CREATE)
  async createRoom(@Body() body: { appointmentId: string }) {
    return this.videoService.createRoom(body.appointmentId);
  }

  @Get('rooms/:appointmentId')
  async getRoom(@Param('appointmentId') appointmentId: string) {
    return this.videoService.getRoom(appointmentId);
  }

  @Post('token')
  @AuditAction(AUDIT_ACTIONS.VIDEO_JOIN)
  async generateToken(
    @Body() body: { appointmentId: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.videoService.generateToken(body.appointmentId, user.id);
  }

  @Patch('rooms/:appointmentId/end')
  async endSession(@Param('appointmentId') appointmentId: string) {
    return this.videoService.endSession(appointmentId);
  }
}
