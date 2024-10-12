import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PriceModule } from './price/price.module';
import { PrismaModule } from './prisma/prisma.module';
import { AlertController } from './alert/alert.controller';
import { AlertModule } from './alert/alert.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PriceModule,
    PrismaModule,
    AlertModule,
  ],
  controllers: [AppController, AlertController],
  providers: [AppService],
})
export class AppModule {}
