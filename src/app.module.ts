import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PricesModule } from './prices/prices.module';
import { PrismaModule } from './prisma/prisma.module';
import { AlertsController } from './alerts/alerts.controller';
import { AlertsModule } from './alerts/alerts.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailsModule } from './emails/emails.module';
import { PricesController } from './prices/prices.controller';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'), // e.g., smtp.gmail.com
          port: configService.get<number>('MAIL_PORT'), // e.g., 587
          secure: false, // true for 465, false for other ports
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"Crypto Monitor" <${configService.get<string>('MAIL_FROM')}>`,
        },
        template: {
          dir: process.cwd() + '/templates', // Path to email templates
          adapter: new HandlebarsAdapter(), // or other adapter
          options: {
            strict: true,
          },
        },
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PricesModule,
    PrismaModule,
    AlertsModule,
    EmailsModule,
  ],
  controllers: [AppController, AlertsController, PricesController],
  providers: [AppService],
})
export class AppModule {}
