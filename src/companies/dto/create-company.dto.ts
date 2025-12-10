import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePricingDto } from './create-pricing.dto';
import { Company } from '../domain/entities/company.entity';
import { Pricing } from '../domain/entities/pricing.entity';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'United States', description: 'Company country' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ example: 'Technology company', description: 'Company description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '123 Tech Street, San Francisco, CA',
    description: 'Company address',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '+1-555-0100', description: 'Company phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ type: [CreatePricingDto], description: 'Company pricing plans' })
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
        // Preserve ID if provided (for updates)
        if (pricingDto.id !== undefined) {
          pricing.id = pricingDto.id;
        }
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
