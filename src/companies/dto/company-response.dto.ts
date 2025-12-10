import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PricingResponseDto } from './pricing-response.dto';
import { Company } from '../domain/entities/company.entity';

export class CompanyResponseDto {
  @ApiProperty({ example: 1, description: 'Company ID' })
  id: number;

  @ApiProperty({ example: 'Acme Corp', description: 'Company name' })
  name: string;

  @ApiProperty({ example: 'United States', description: 'Company country' })
  country: string;

  @ApiPropertyOptional({ example: 'Technology company', description: 'Company description' })
  description?: string;

  @ApiPropertyOptional({
    example: '123 Tech Street, San Francisco, CA',
    description: 'Company address',
  })
  address?: string;

  @ApiPropertyOptional({ example: '+1-555-0100', description: 'Company phone number' })
  phone?: string;

  @ApiPropertyOptional({ type: [PricingResponseDto], description: 'Company pricing plans' })
  pricings?: PricingResponseDto[];

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
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
