import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import { Alerts } from '@prisma/client';

@Injectable()
export class EmailsService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  private async sendAlertEmail(alert: Alerts, currentPrice: number) {
    try {
      await this.mailerService.sendMail({
        to: alert.email,
        subject: `${alert.chain} Price Alert`,
        template: 'alert', // Name of the template file without extension
        context: {
          chain: alert.chain,
          price: currentPrice,
          dollar: alert.dollar,
        },
      });

      this.logger.log(
        `Sent alert email to ${alert.email} for ${alert.chain} at $${currentPrice} USD.`,
      );

      // Deactivate the alert to prevent repeated notifications
      await this.prisma.alerts.update({
        where: { id: alert.id },
        data: { isActive: false },
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${alert.email}:`,
        error.message,
      );
    }
  }
}
