import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CostType } from '../domain/enums/cost-type.enum';
import { Pricing } from '../domain/entities/pricing.entity';

export class PricingResponseDto {
  @ApiProperty({ example: 1, description: 'Pricing ID' })
  id: number;

  @ApiProperty({ example: 'Basic Plan', description: 'Pricing plan name' })
  name: string;

  @ApiPropertyOptional({
    example: 'Perfect for small teams',
    description: 'Pricing plan description',
  })
  description?: string;

  @ApiProperty({ example: 99.99, description: 'Pricing cost' })
  cost: number;

  @ApiProperty({ enum: CostType, example: CostType.ABSOLUTE, description: 'Cost type' })
  costType: CostType;

  @ApiProperty({ example: false, description: 'Whether this is a base plan' })
  isBasePlan: boolean;

  @ApiProperty({ example: 1, description: 'Company ID this pricing belongs to' })
  companyId: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
  updatedAt: Date;

  static fromEntity(pricing: Pricing): PricingResponseDto {
    return {
      id: pricing.id,
      name: pricing.name,
      description: pricing.description ?? undefined,
      cost: pricing.cost,
      costType: pricing.costType,
      isBasePlan: pricing.isBasePlan,
      companyId: pricing.companyId,
      createdAt: pricing.createdAt,
      updatedAt: pricing.updatedAt,
    };
  }
}
