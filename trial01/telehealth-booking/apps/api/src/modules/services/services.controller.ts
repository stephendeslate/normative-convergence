import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { createServiceSchema, updateServiceSchema } from '@medconnect/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ServicesService } from './services.service';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createServiceSchema))
  async create(
    @Body() body: any,
    @CurrentUser() user: { id: string; practiceId?: string },
  ) {
    return this.servicesService.create(body, body.practiceId || user.practiceId!);
  }

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('consultationType') consultationType?: string,
    @Query('practiceId') practiceId?: string,
  ) {
    return this.servicesService.list({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      consultationType,
      practiceId,
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateServiceSchema))
  async update(@Param('id') id: string, @Body() body: any) {
    return this.servicesService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.servicesService.delete(id);
  }
}
