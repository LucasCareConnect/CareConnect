import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardWidget } from './entities/dashboard-widget.entity';
import { DashboardMetric } from './entities/dashboard-metric.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { MetricsCollectorService } from './metrics-collector.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DashboardWidget, DashboardMetric]),
    UserModule,
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository, MetricsCollectorService],
  exports: [DashboardService, MetricsCollectorService],
})
export class DashboardModule {}
