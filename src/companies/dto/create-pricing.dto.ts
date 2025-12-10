import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CostType } from '../domain/enums/cost-type.enum';

export class CreatePricingDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
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
