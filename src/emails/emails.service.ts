import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service'; // Ensure the correct path
import { EmailContext } from './interfaces/email.interface'; // Import your EmailContext
import { Chain } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private mailerService: MailerService,
    private prisma: PrismaService, // Inject Prisma service
  ) {}

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: EmailContext,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });

      this.logger.log(`Email sent to ${to} with subject "${subject}"`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async checkAndSendPriceIncreaseEmail(
    chain: Chain,
    email: string,
  ): Promise<void> {
    try {
      const latestPrice = await this.prisma.prices.findFirst({
        where: { chain },
        orderBy: { createdAt: 'desc' },
      });

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const previousPrice = await this.prisma.prices.findFirst({
        where: {
          chain,
          createdAt: {
            gte: oneHourAgo,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!latestPrice || !previousPrice) {
        this.logger.warn(
          `Price data not available for ${chain} to check increase.`,
        );
        return;
      }

      if (isNaN(latestPrice.usdPrice) || isNaN(previousPrice.usdPrice)) {
        this.logger.warn(`Price data is invalid for ${chain}.`);
        return;
      }

      const currentPrice = Number(latestPrice.usdPrice);
      const priceOneHourAgo = Number(previousPrice.usdPrice);
      const percentageIncrease =
        ((currentPrice - priceOneHourAgo) / priceOneHourAgo) * 100;

      if (percentageIncrease > 3) {
        const subject = `${chain} Price Alert: Increased by ${percentageIncrease.toFixed(2)}%`;
        const template = 'price-alert';
        const context: EmailContext = {
          chain,
          price: currentPrice,
          dollar: priceOneHourAgo,
        };

        await this.sendEmail(email, subject, template, context);
      }
    } catch (error) {
      this.logger.error(
        `Error checking price increase for ${chain}: ${error.message}`,
      );
    }
  }
}
