import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@medconnect/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@Roles(UserRole.PLATFORM_ADMIN)
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('practices')
  async listPractices(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.listPractices({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getAuditLogs({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      action,
      userId,
      startDate,
      endDate,
    });
  }

  @Get('users')
  async listUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
    });
  }
}
