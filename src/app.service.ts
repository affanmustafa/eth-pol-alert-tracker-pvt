import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'ETH and POL Price Tracking submission by Affan Mustafa';
  }
}
