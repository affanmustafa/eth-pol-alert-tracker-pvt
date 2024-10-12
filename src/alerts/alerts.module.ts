import { Module } from '@nestjs/common';
import { AlertService } from './alerts.service';
import { AlertController } from './alerts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailService } from 'src/emails/emails.service';

@Module({
  providers: [AlertService, EmailService],
  controllers: [AlertController],
  exports: [AlertService],
  imports: [PrismaModule],
})
export class AlertModule {}
