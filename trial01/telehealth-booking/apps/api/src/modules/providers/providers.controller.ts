import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { createProviderProfileSchema, updateProviderProfileSchema } from '@medconnect/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProvidersService } from './providers.service';

@ApiTags('Providers')
@ApiBearerAuth()
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('profile')
  @UsePipes(new ZodValidationPipe(createProviderProfileSchema))
  async createProfile(
    @Body() body: any,
    @CurrentUser() user: { id: string; practiceId?: string },
  ) {
    return this.providersService.createProfile(body, body.practiceId || user.practiceId!);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.providersService.findById(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateProviderProfileSchema))
  async update(@Param('id') id: string, @Body() body: any) {
    return this.providersService.update(id, body);
  }

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('specialty') specialty?: string,
    @Query('acceptingNewPatients') acceptingNewPatients?: string,
  ) {
    return this.providersService.list({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      specialty,
      acceptingNewPatients:
        acceptingNewPatients !== undefined
          ? acceptingNewPatients === 'true'
          : undefined,
    });
  }

  @Get(':id/availability')
  async getAvailability(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('timezone') timezone: string,
  ) {
    return this.providersService.getAvailability(id, date, timezone);
  }
}
