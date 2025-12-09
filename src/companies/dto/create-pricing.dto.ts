import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { CostType } from '../domain/enums/cost-type.enum';

export class CreatePricingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  cost: number;

  @IsEnum(CostType)
  @IsNotEmpty()
  costType: CostType;

  @IsBoolean()
  @IsOptional()
  isBasePlan?: boolean;
}
