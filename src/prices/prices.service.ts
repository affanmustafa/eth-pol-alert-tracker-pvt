import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Chain } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import Moralis from 'moralis';
import { subHours, format } from 'date-fns';
import {
  HourlyPriceResponse,
  PriceData,
  Token,
} from './interfaces/price.interface';
import { EmailService } from 'src/emails/emails.service';
import { EmailContext } from 'src/emails/interfaces/email.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);
  private readonly ETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
  private readonly ETH_CHAIN = '0x1';
  private readonly POLYGON_ADDRESS =
    '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6';
  private readonly POLYGON_CHAIN = '0x1';

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.initializeMoralis();
  }

  /**
   * Test the email service and get the price of ETH
   * @param email - The email to send the test price to
   */
  async testEmail(email: string) {
    const ethPriceData = await this.fetchTokenPrice({
      name: 'Ethereum',
      address: this.ETH_ADDRESS,
      chain: this.ETH_CHAIN,
    });
    await this.emailService.sendEmail(email, 'Test Email', 'email-test', {
      chain: ethPriceData.chain,
      price: ethPriceData.usdPrice,
      dollar: ethPriceData.usdPrice,
    });
  }

  /**
   * Get the price of BTC in USD for a given amount of ETH
   * @param ethAmount - The amount of ETH to convert to BTC
   * @returns An object containing the BTC amount, the ETH fee, the USD fee, and the total fee
   */
  async getSwapPrice(ethAmount: number) {
    const ethPriceData = await this.fetchTokenPrice({
      name: 'Ethereum',
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain: '0x1',
    });

    const btcPriceData = await this.fetchTokenPrice({
      name: 'Bitcoin',
      address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      chain: '0x1',
    });

    const ethUsdPrice = ethPriceData.usdPrice;
    const btcUsdPrice = btcPriceData.usdPrice;

    const totalEthValueInUsd = ethAmount * ethUsdPrice;
    const btcAmount = totalEthValueInUsd / btcUsdPrice;

    const feePercentage = 0.03 / 100;
    const ethFee = ethAmount * feePercentage;
    const usdFee = ethFee * ethUsdPrice;
    const totalFee = ethFee + usdFee;

    return {
      btcAmount,
      ethFee,
      usdFee,
      totalFee,
    };
  }

  async getHourlyPrices(): Promise<HourlyPriceResponse[]> {
    const currentDate = new Date();

    const prices = await this.prisma.prices.findMany({
      where: {
        chain: { in: ['ETH', 'POL'] },
        createdAt: {
          gte: subHours(currentDate, 24),
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const priceMap: {
      [hour: string]: { ethPrices: number[]; polPrices: number[] };
    } = {};

    prices.forEach((priceEntry) => {
      const hour = format(priceEntry.createdAt, 'yyyy-MM-dd HH');

      if (!priceMap[hour]) {
        priceMap[hour] = { ethPrices: [], polPrices: [] };
      }

      if (priceEntry.chain === 'ETH') {
        priceMap[hour].ethPrices.push(Number(priceEntry.usdPrice));
      } else if (priceEntry.chain === 'POL') {
        priceMap[hour].polPrices.push(Number(priceEntry.usdPrice));
      }
    });

    const hourlyPrices = Object.entries(priceMap).map(
      ([hour, { ethPrices, polPrices }]) => {
        const ethAvg = ethPrices.length
          ? ethPrices.reduce((a, b) => a + b, 0) / ethPrices.length
          : 0;
        const polAvg = polPrices.length
          ? polPrices.reduce((a, b) => a + b, 0) / polPrices.length
          : 0;

        return {
          hour,
          ethPrice: ethAvg,
          polPrice: polAvg,
        };
      },
    );

    return hourlyPrices;
  }

  private async fetchTokenPrice(token: Token) {
    try {
      const response = await Moralis.EvmApi.token.getTokenPrice({
        address: token.address,
        chain: token.chain,
      });

      const data = response.toJSON();
      const symbol = data.tokenSymbol;
      const price = data.usdPrice;

      return {
        tokenName: data.tokenName,
        tokenSymbol: symbol,
        tokenDecimals: parseInt(data.tokenDecimals, 10),
        usdPrice: price,
        chain: token.name === 'Ethereum' ? Chain.ETH : Chain.POL,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching token price for ${token.name}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Save the token price to the database
   * @param priceData
   */
  private async saveTokenPrice(priceData: PriceData) {
    try {
      await this.prisma.prices.create({
        data: priceData,
      });

      this.logger.log(
        `Saved ${priceData.tokenSymbol} price of $${priceData.usdPrice} to the database.`,
      );
    } catch (error) {
      this.logger.error(
        `Error saving token price for ${priceData.tokenSymbol}: ${error.message}`,
      );
      throw error;
    }
  }

  private async initializeMoralis() {
    const apiKey = this.configService.get<string>('MORALIS_API_KEY');
    await Moralis.start({
      apiKey,
    });
  }

  /**
   * Checks if the price of a given chain has increased by more than 3% in the last hour.
   * If so, it sends an email notification.
   *
   * @param chain - The chain to check the price increase for.
   * @enum {Chain} - The chain enum from Prisma. Can be either ETH or POL.
   */

  async checkPriceIncrease(): Promise<void> {
    const chains: Chain[] = [Chain.ETH, Chain.POL];

    for (const chain of chains) {
      try {
        const currentPriceEntry = await this.prisma.prices.findFirst({
          where: { chain },
          orderBy: { createdAt: 'desc' },
        });

        if (!currentPriceEntry) {
          this.logger.warn(`No current price data available for ${chain}`);
          continue;
        }

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const oneHourAgoPriceEntry = await this.prisma.prices.findFirst({
          where: {
            chain,
            createdAt: {
              lte: oneHourAgo,
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!oneHourAgoPriceEntry) {
          this.logger.warn(`No price data available for ${chain} one hour ago`);
          continue;
        }

        const currentPrice = Number(currentPriceEntry.usdPrice);
        const oneHourAgoPrice = Number(oneHourAgoPriceEntry.usdPrice);

        const percentageChange =
          ((currentPrice - oneHourAgoPrice) / oneHourAgoPrice) * 100;

        this.logger.log(
          `${chain} percentage change: ${percentageChange.toFixed(2)}%`,
        );

        if (percentageChange > 3) {
          const email = 'hyperhire_assignment@hyperhire.in';
          const subject = `${chain} Price Alert: Increased by ${percentageChange.toFixed(2)}%`;
          const template = 'price-alert';
          const context: EmailContext = {
            chain: chain,
            price: currentPrice,
            dollar: oneHourAgoPrice,
          };

          await this.emailService.sendEmail(email, subject, template, context);
          this.logger.log(`Price increase alert sent for ${chain} to ${email}`);
        } else {
          this.logger.log(`No significant price increase for ${chain}`);
        }
      } catch (error) {
        this.logger.error(
          `Error checking price increase for ${chain}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Fetching price every 5 minutes. To change, just change the CronExpression
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async savePriceAfterFiveMinutes() {
    try {
      const ethPriceData = await this.fetchTokenPrice({
        name: 'Ethereum',
        address: this.ETH_ADDRESS,
        chain: this.ETH_CHAIN,
      });
      await this.saveTokenPrice(ethPriceData);

      const polygonPriceData = await this.fetchTokenPrice({
        name: 'Polygon',
        address: this.POLYGON_ADDRESS,
        chain: this.POLYGON_CHAIN,
      });
      await this.saveTokenPrice(polygonPriceData);
    } catch (error) {
      this.logger.error(`Error during cron job execution: ${error.message}`);
    }
  }

  /**
   * A cron job that runs every hour to see whether the price has increased by more than 3%
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkPriceIncreaseEveryHour() {
    try {
      await this.checkPriceIncrease();
    } catch (error) {
      this.logger.error(
        `Error during hourly cron job execution: ${error.message}`,
      );
    }
  }
  async onModuleInit() {
    await this.savePriceAfterFiveMinutes();
    await this.checkPriceIncreaseEveryHour();
  }
}
