import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [AlertService],
  controllers: [AlertController],
  exports: [AlertService],
  imports: [PrismaModule],
})
export class AlertModule {}
