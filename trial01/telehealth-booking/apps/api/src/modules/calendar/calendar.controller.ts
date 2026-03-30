import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarProvider } from '@medconnect/shared';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CalendarService } from './calendar.service';

@ApiTags('Calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @ApiBearerAuth()
  @Post('connect')
  async connect(
    @Body() body: { provider: CalendarProvider; practiceId: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.calendarService.connect(user.id, body.practiceId, body.provider);
  }

  @Public()
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    return this.calendarService.handleCallback(code, state);
  }

  @ApiBearerAuth()
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async sync(
    @Body() body: { practiceId: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.calendarService.sync(user.id, body.practiceId);
  }

  @ApiBearerAuth()
  @Get('events')
  async listEvents(
    @Query('practiceId') practiceId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.calendarService.listEvents(user.id, practiceId);
  }

  @ApiBearerAuth()
  @Delete('disconnect')
  @HttpCode(HttpStatus.OK)
  async disconnect(
    @Body() body: { practiceId: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.calendarService.disconnect(user.id, body.practiceId);
  }
}
