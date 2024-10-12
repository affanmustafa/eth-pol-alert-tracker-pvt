import { IsEnum, IsNumber, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum Chain {
  ETH = 'ETH',
  POL = 'POL',
}

export class CreateAlertDto {
  @ApiProperty({ enum: Chain, description: 'The blockchain for the alert' })
  @IsEnum(Chain)
  chain: Chain;

  @ApiProperty({ description: 'The dollar amount for the alert', minimum: 0 })
  @IsNumber()
  @Min(0)
  dollar: number;

  @ApiProperty({ description: 'Email address for alert notifications' })
  @IsString()
  email: string;
}
