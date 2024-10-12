import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [AlertsService],
  controllers: [AlertsController],
  exports: [AlertsService],
  imports: [PrismaModule],
})
export class AlertsModule {}
