import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CostType } from '../domain/enums/cost-type.enum';

export class CreatePricingDto {
  @ApiPropertyOptional({ example: 1, description: 'Pricing ID (required for updates)' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ example: 'Basic Plan', description: 'Pricing plan name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Perfect for small teams',
    description: 'Pricing plan description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 99.99,
    description:
      'Pricing cost. For absolute pricing: fixed amount (e.g., 99.99 = $99.99). For relative pricing: multiplier/percentage as decimal (e.g., 0.8 = 80% of base plan, 1.5 = 150% of base plan)',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  cost: number;

  @ApiProperty({
    enum: CostType,
    example: CostType.ABSOLUTE,
    description:
      'Cost type: "absolute" for fixed prices, "relative" for prices calculated as a percentage/multiplier of the base plan. Relative pricing requires at least one pricing plan with isBasePlan=true',
  })
  @IsEnum(CostType)
  @IsNotEmpty()
  costType: CostType;

  @ApiPropertyOptional({
    example: false,
    description:
      'Whether this is a base plan. Must be set to true for at least one pricing when using relative pricing. The base plan cost is used as the reference point for calculating relative pricing costs.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isBasePlan?: boolean;
}
