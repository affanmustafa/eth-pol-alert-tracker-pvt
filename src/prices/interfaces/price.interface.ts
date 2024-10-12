import { Chain } from '@prisma/client';

export interface PriceData {
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  usdPrice: number;
  chain: Chain;
}

export interface SwapPriceData {
  ethPrice: number;
  polPrice: number;
}

export interface Token {
  name: string;
  address: string;
  chain: string;
}

export interface HourlyPriceResponse {
  hour: string;
  ethPrice: number;
  polPrice: number;
}
