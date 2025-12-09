import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePricingDto } from './create-pricing.dto';
import { Company } from '../domain/entities/company.entity';
import { Pricing } from '../domain/entities/pricing.entity';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePricingDto)
  pricings?: CreatePricingDto[];

  static toEntity(dto: CreateCompanyDto): Partial<Company> {
    const entity: Partial<Company> = {
      name: dto.name,
      country: dto.country,
      description: dto.description,
      address: dto.address,
      phone: dto.phone,
    };

    if (dto.pricings && dto.pricings.length > 0) {
      entity.pricings = dto.pricings.map((pricingDto) => {
        const pricing = new Pricing();
        pricing.name = pricingDto.name;
        pricing.description = pricingDto.description ?? null;
        pricing.cost = pricingDto.cost;
        pricing.costType = pricingDto.costType;
        pricing.isBasePlan = pricingDto.isBasePlan ?? false;
        return pricing;
      });
    }

    return entity;
  }
}
