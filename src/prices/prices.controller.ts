import { Controller, Get, Post, Query } from '@nestjs/common';
import { PricesService } from './prices.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('prices')
@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get('hourly')
  @ApiOperation({ summary: 'Get hourly prices' })
  getHourlyPrices() {
    return this.pricesService.getHourlyPrices();
  }

  @Get('swap-price')
  @ApiOperation({ summary: 'Get swap price for Ethereum to Bitcoin' })
  @ApiQuery({
    name: 'ethAmount',
    required: true,
    type: Number,
    description: 'Amount of Ethereum to swap',
  })
  @ApiResponse({
    status: 200,
    description: 'The swap price for Ethereum to Bitcoin',
  })
  getSwapPrice(@Query('ethAmount') ethAmount: number) {
    return this.pricesService.getSwapPrice(ethAmount);
  }

  @Post('test-email')
  @ApiOperation({
    summary:
      'Test the email service. Current price of ETH will be emailed to the provided email',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    type: String,
    description: 'The email to send the test price to',
  })
  @ApiResponse({
    status: 201,
    description: 'The price of ETH was emailed successfully',
  })
  testEmail(@Query('email') email: string) {
    return this.pricesService.testEmail(email);
  }
}
