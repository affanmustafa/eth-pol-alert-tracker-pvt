import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service'; // Adjust the import according to your structure
import { logger } from 'handlebars';

@Injectable()
export class PriceCleanupService {
  private readonly logger = new Logger(PriceCleanupService.name);
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_WEEK)
  async handleCron() {
    this.logger.log('Running Cron job interval 1 week: Price cleanup');
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    await this.prisma.prices.deleteMany({
      where: {
        createdAt: {
          lt: oneWeekAgo,
        },
      },
    });

    this.logger.log('Old prices removed successfully');
  }
}
