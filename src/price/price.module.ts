import { Module } from '@nestjs/common';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), ConfigModule],
  providers: [PriceService],
  controllers: [PriceController],
})
export class PriceModule {}
