import { CostType } from '../domain/enums/cost-type.enum';
import { Pricing } from '../domain/entities/pricing.entity';

export class PricingResponseDto {
  id: number;
  name: string;
  description?: string;
  cost: number;
  costType: CostType;
  isBasePlan: boolean;
  companyId: number;
  createdAt: Date;
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
