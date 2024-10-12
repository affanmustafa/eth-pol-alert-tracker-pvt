import { IsEnum, IsNumber, Min, IsString } from 'class-validator';

enum Chain {
  ETH = 'ETH',
  POL = 'POL',
}

export class CreateAlertDto {
  @IsEnum(Chain)
  chain: Chain;

  @IsNumber()
  @Min(0)
  dollar: number;

  @IsString()
  email: string;
}
