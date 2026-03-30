import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  createPracticeSchema,
  updatePracticeSchema,
  inviteMemberSchema,
  MembershipRole,
} from '@medconnect/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { PracticesService } from './practices.service';

@ApiTags('Practices')
@ApiBearerAuth()
@Controller('practices')
export class PracticesController {
  constructor(private readonly practicesService: PracticesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createPracticeSchema))
  async create(
    @Body() body: any,
    @CurrentUser() user: { id: string },
  ) {
    return this.practicesService.create(body, user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.practicesService.findById(id);
  }

  @Patch(':id')
  @Roles(MembershipRole.OWNER, MembershipRole.ADMIN)
  @UsePipes(new ZodValidationPipe(updatePracticeSchema))
  async update(@Param('id') id: string, @Body() body: any) {
    return this.practicesService.update(id, body);
  }

  @Get(':id/members')
  async listMembers(@Param('id') id: string) {
    return this.practicesService.listMembers(id);
  }

  @Post(':id/invite')
  @UsePipes(new ZodValidationPipe(inviteMemberSchema))
  async inviteMember(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: { id: string },
  ) {
    return this.practicesService.inviteMember(id, body, user.id);
  }

  @Delete(':id/members/:userId')
  @Roles(MembershipRole.OWNER)
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.practicesService.removeMember(id, userId);
  }
}
