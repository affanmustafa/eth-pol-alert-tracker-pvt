import { Module } from '@nestjs/common';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from '../emails/emails.service';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), ConfigModule],
  providers: [PricesService, EmailService],
  controllers: [PricesController],
  exports: [PricesService],
})
export class PricesModule {}
