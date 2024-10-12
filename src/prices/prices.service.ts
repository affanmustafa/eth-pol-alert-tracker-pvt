import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Chain } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import Moralis from 'moralis';

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);

  constructor(private prisma: PrismaService) {
    this.initializeMoralis();
  }

  // Initialize Moralis with API key
  private async initializeMoralis() {
    const apiKey = process.env.MORALIS_API_KEY;
    console.log('Moralis API Key:', apiKey); // Log the API key
    await Moralis.start({
      apiKey,
    });
  }

  private async fetchAndSaveTokenPrice(token: {
    name: string;
    address: string;
    chain: string;
  }) {
    try {
      const response = await Moralis.EvmApi.token.getTokenPrice({
        address: token.address,
        chain: token.chain,
      });

      const data = response.toJSON();
      const symbol = data.tokenSymbol;
      const price = data.usdPrice;

      this.logger.log({
        symbol: symbol,
        price: price,
      });

      // Save to the database
      await this.prisma.prices.create({
        data: {
          chain: token.name === 'Ethereum' ? Chain.ETH : Chain.POL,
          tokenName: data.tokenName,
          tokenSymbol: symbol,
          tokenDecimals: parseInt(data.tokenDecimals, 10),
          usdPrice: price,
        },
      });

      this.logger.log(`Saved ${symbol} price to the database.`);
    } catch (error) {
      this.logger.error(
        `Error fetching/saving token price for ${token.name}: ${error.message}`,
      );
    }
  }

  // Fetching price every 5 minutes. To change, just change the CronExpression
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    const ethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
    const ethChain = '0x1';

    const polygonAddress = '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6';
    const polygonChain = '0x1';

    await this.fetchAndSaveTokenPrice({
      name: 'Ethereum',
      address: ethAddress,
      chain: ethChain,
    });
    await this.fetchAndSaveTokenPrice({
      name: 'Polygon',
      address: polygonAddress,
      chain: polygonChain,
    });
  }

  async onModuleInit() {
    await this.handleCron();
  }
}
