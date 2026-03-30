import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CurrentUser } from '../common/decorators';

@ApiTags('Calendar')
@ApiBearerAuth()
@Controller('calendar')
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get('connections')
  @ApiOperation({ summary: 'List calendar connections' })
  async getConnections(@CurrentUser('id') userId: string) {
    return this.calendarService.getConnections(userId);
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect a calendar provider' })
  async connect(
    @CurrentUser('id') userId: string,
    @Body() dto: { provider: string; accessToken: string; refreshToken?: string },
  ) {
    return this.calendarService.connect(userId, dto.provider, dto.accessToken, dto.refreshToken);
  }

  @Delete('connections/:provider')
  @ApiOperation({ summary: 'Disconnect a calendar provider' })
  async disconnect(
    @CurrentUser('id') userId: string,
    @Param('provider') provider: string,
  ) {
    return this.calendarService.disconnect(userId, provider);
  }

  @Get('connections/:connectionId/events')
  @ApiOperation({ summary: 'Get calendar events' })
  async getEvents(@Param('connectionId') connectionId: string) {
    return this.calendarService.getEvents(connectionId);
  }
}
