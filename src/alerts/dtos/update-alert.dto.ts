import {
  IsEnum,
  IsNumber,
  Min,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum Chain {
  ETH = 'ETH',
  POL = 'POL',
}

export class UpdateAlertDto {
  @ApiProperty({
    enum: Chain,
    description: 'The blockchain for the alert',
    required: false,
  })
  @IsOptional()
  @IsEnum(Chain)
  chain?: Chain;

  @ApiProperty({
    description: 'The dollar amount for the alert',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dollar?: number;

  @ApiProperty({
    description: 'Email address for alert notifications',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Indicates whether the alert is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
