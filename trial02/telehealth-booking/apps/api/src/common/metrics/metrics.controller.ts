import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../decorators';
import { MetricsService } from './metrics.service';
import type { Response } from 'express';

@ApiTags('Metrics')
@Controller('metrics')
@SkipThrottle()
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  async getMetrics(@Res() res: Response) {
    const metrics = await this.metricsService.getMetrics();
    res.set('Content-Type', this.metricsService.getContentType());
    res.end(metrics);
  }
}
