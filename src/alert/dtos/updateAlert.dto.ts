import {
  IsEnum,
  IsNumber,
  Min,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

enum Chain {
  ETH = 'ETH',
  POL = 'POL',
}

export class UpdateAlertDto {
  @IsOptional()
  @IsEnum(Chain)
  chain?: Chain;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dollar?: number;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
