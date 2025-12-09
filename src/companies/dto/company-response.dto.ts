import { PricingResponseDto } from './pricing-response.dto';
import { Company } from '../domain/entities/company.entity';

export class CompanyResponseDto {
  id: number;
  name: string;
  country: string;
  description?: string;
  address?: string;
  phone?: string;
  pricings?: PricingResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(company: Company): CompanyResponseDto {
    return {
      id: company.id,
      name: company.name,
      country: company.country,
      description: company.description ?? undefined,
      address: company.address ?? undefined,
      phone: company.phone ?? undefined,
      pricings: company.pricings?.map((pricing) => PricingResponseDto.fromEntity(pricing)),
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}
