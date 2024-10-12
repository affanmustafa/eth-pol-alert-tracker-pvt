import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service'; // Adjust the import according to your structure
import { PriceCleanupService } from './price-cleanup.cron';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [PriceCleanupService, PrismaService],
})
export class CronModule {}
