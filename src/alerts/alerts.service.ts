import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateAlertDto, UpdateAlertDto } from './dtos';
import { Alerts } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  /**
   * Creates a new alert in the system.
   *
   * This function takes a `CreateAlertDto` object, which contains the necessary
   * information to create a new alert, such as the chain, the dollar threshold,
   * and the email.
   *
   * @param {CreateAlertDto} createAlertDto - The data transfer object containing
   * the details of the alert to be created.
   * @returns {Promise<Alerts>} A promise that resolves to the created alert object.
   *
   * @throws {Error} Throws an error if the alert creation fails.
   */
  async createAlert(createAlertDto: CreateAlertDto): Promise<Alerts> {
    const { chain, dollar, email } = createAlertDto;
    const alert = await this.prisma.alerts.create({
      data: {
        chain,
        dollar,
        email,
      },
    });
    this.logger.log(`Created new alert: ${JSON.stringify(alert)}`);
    return alert;
  }

  /**
   * Retrieves all alerts from the database.
   *
   * This function fetches all alerts stored in the database and returns them as an array.
   *
   * @returns {Promise<Alerts[]>} A promise that resolves to an array of alert objects.
   */
  async getAlerts(): Promise<Alerts[]> {
    return this.prisma.alerts.findMany();
  }

  /**
   * Retrieves a specific alert by its ID.
   *
   * This function fetches a single alert from the database using the provided ID and returns it.
   *
   * @param {number} id - The ID of the alert to retrieve.
   * @returns {Promise<Alerts | null>} A promise that resolves to the alert object or null if not found.
   */
  async getAlertById(id: number): Promise<Alerts | null> {
    return this.prisma.alerts.findUnique({ where: { id } });
  }

  /**
   * Retrieves all active alerts from the database.
   *
   * This function fetches all alerts stored in the database that are currently active.
   *
   * @returns {Promise<Alerts[]>} A promise that resolves to an array of active alert objects.
   */
  async getActiveAlerts(): Promise<Alerts[]> {
    return this.prisma.alerts.findMany({ where: { isActive: true } });
  }

  /**
   * Updates an existing alert in the database.
   *
   * This function updates an alert's information using the provided ID and the data from an `UpdateAlertDto` object.
   *
   * @param {number} id - The ID of the alert to update.
   * @param {UpdateAlertDto} updateAlertDto - The data transfer object containing
   * the updated information for the alert.
   * @returns {Promise<Alerts>} A promise that resolves to the updated alert object.
   */
  async updateAlert(
    id: number,
    updateAlertDto: UpdateAlertDto,
  ): Promise<Alerts> {
    return this.prisma.alerts.update({
      where: { id },
      data: updateAlertDto,
    });
  }

  /**
   * Deletes an alert from the database.
   *
   * @param {number} id - The ID of the alert to delete.
   */
  async deleteAlert(id: number): Promise<void> {
    try {
      await this.prisma.alerts.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Error deleting alert: ${error.message}`);
      throw error;
    }
  }

  /**
   * Checks all active alerts and triggers them if the price condition is met.
   */
  async checkAlerts(): Promise<void> {
    try {
      this.logger.log('Checking alerts...');

      const activeAlerts = await this.prisma.alerts.findMany({
        where: { isActive: true },
      });

      if (activeAlerts.length === 0) {
        this.logger.log('No active alerts to process.');
        return;
      }

      // Identify unique chains from active alerts
      const uniqueChains = [
        ...new Set(activeAlerts.map((alert) => alert.chain)),
      ];

      // Fetch latest price for each unique chain
      const latestPrices = await Promise.all(
        uniqueChains.map(async (chain) => {
          const latestPriceEntry = await this.prisma.prices.findFirst({
            where: { chain },
            orderBy: { createdAt: 'desc' },
          });
          return { chain, price: latestPriceEntry?.usdPrice || 0 };
        }),
      );

      // Create a price map for quick access
      const priceMap = new Map<string, number>();
      latestPrices.forEach(({ chain, price }) => {
        priceMap.set(chain, price);
      });

      // Process each alert
      for (const alert of activeAlerts) {
        const currentPrice = priceMap.get(alert.chain) || 0;

        if (new Decimal(currentPrice).gte(alert.dollar)) {
          //   await this.sendAlertEmail(alert, currentPrice);
          this.logger.log(
            `Alert triggered for ${alert.chain} and price ${currentPrice}`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error checking alerts:', error.message);
    }
  }

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

  // Schedule alert checking every 5 minutes
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Running scheduled task: Check alerts');
    await this.checkAlerts();
  }
}
