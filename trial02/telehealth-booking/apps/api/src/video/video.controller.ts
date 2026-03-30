import { Controller, Get, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VideoService } from './video.service';
import { CurrentUser } from '../common/decorators';

@ApiTags('Video')
@ApiBearerAuth()
@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Post(':appointmentId/room')
  @ApiOperation({ summary: 'Create or get video room for appointment' })
  async createRoom(@Param('appointmentId', ParseUUIDPipe) appointmentId: string) {
    return this.videoService.createRoom(appointmentId);
  }

  @Get(':appointmentId/room')
  @ApiOperation({ summary: 'Get video room details' })
  async getRoom(@Param('appointmentId', ParseUUIDPipe) appointmentId: string) {
    return this.videoService.getRoom(appointmentId);
  }

  @Post(':appointmentId/token')
  @ApiOperation({ summary: 'Generate video access token' })
  async generateToken(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.videoService.generateToken(appointmentId, userId);
  }

  @Post(':appointmentId/join')
  @ApiOperation({ summary: 'Join video room' })
  async joinRoom(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.videoService.joinRoom(appointmentId, userId);
  }

  @Post(':appointmentId/end')
  @ApiOperation({ summary: 'End video session' })
  async endSession(@Param('appointmentId', ParseUUIDPipe) appointmentId: string) {
    return this.videoService.endSession(appointmentId);
  }
}
