import { Module } from '@nestjs/common';
import { EmailService } from './emails.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [EmailService],
})
export class EmailsModule {}
