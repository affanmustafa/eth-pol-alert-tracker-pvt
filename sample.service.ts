// src/alert/alert.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer'; // Ensure MailerModule is set up
import { Alert } from '@prisma/client';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService, // For sending emails
  ) {}

  // Create a new alert
  async createAlert(data: {
    chain: 'Ethereum' | 'Polygon';
    targetPrice: number;
    email: string;
  }): Promise<Alert> {
    try {
      const alert = await this.prisma.alert.create({
        data: {
          chain: data.chain,
          targetPrice: data.targetPrice,
          email: data.email,
        },
      });
      this.logger.log(`Created new alert: ${JSON.stringify(alert)}`);
      return alert;
    } catch (error) {
      this.logger.error('Error creating alert:', error.message);
      throw error;
    }
  }

  // Get all alerts
  async getAllAlerts(): Promise<Alert[]> {
    try {
      const alerts = await this.prisma.alert.findMany();
      return alerts;
    } catch (error) {
      this.logger.error('Error fetching alerts:', error.message);
      throw error;
    }
  }

  // Delete an alert by ID
  async deleteAlert(id: number): Promise<void> {
    try {
      await this.prisma.alert.delete({
        where: { id },
      });
      this.logger.log(`Deleted alert with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting alert with ID ${id}:`, error.message);
      throw error;
    }
  }

  // Check and process alerts
  async checkAlerts(): Promise<void> {
    try {
      // Fetch active alerts
      const activeAlerts = await this.prisma.alert.findMany({
        where: {
          isActive: true,
        },
      });

      if (activeAlerts.length === 0) {
        this.logger.log('No active alerts to process.');
        return;
      }

      // Fetch the latest price for each chain
      const chains = ['Ethereum', 'Polygon'] as const;
      const latestPrices = await Promise.all(
        chains.map(async (chain) => {
          const latestPrice = await this.prisma.price.findFirst({
            where: { chain },
            orderBy: { timestamp: 'desc' },
          });
          return { chain, price: latestPrice?.usdPrice || 0 };
        }),
      );

      for (const alert of activeAlerts) {
        // Find the latest price for the alert's chain
        const latestPriceEntry = latestPrices.find(
          (price) => price.chain === alert.chain,
        );

        if (!latestPriceEntry || latestPriceEntry.price === 0) {
          this.logger.warn(`No price data found for ${alert.chain}.`);
          continue;
        }

        // Check if the latest price meets the alert condition
        if (latestPriceEntry.price >= alert.targetPrice) {
          // Send notification email
          try {
            await this.mailerService.sendMail({
              to: alert.email,
              subject: `${alert.chain} Price Alert`,
              template: 'alert', // Specify the email template
              context: {
                chain: alert.chain,
                price: latestPriceEntry.price,
                targetPrice: alert.targetPrice,
              },
            });

            this.logger.log(
              `Sent alert email to ${alert.email} for ${alert.chain} at $${latestPriceEntry.price} USD.`,
            );

            // Deactivate the alert to prevent repeated notifications
            await this.prisma.alert.update({
              where: { id: alert.id },
              data: { isActive: false },
            });
          } catch (emailError) {
            this.logger.error(
              `Failed to send email to ${alert.email}:`,
              emailError.message,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Error checking alerts:', error.message);
    }
  }

  // Schedule the checkAlerts method to run every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Running scheduled task: Check alerts');
    await this.checkAlerts();
  }
}
