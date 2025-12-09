import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../domain/entities/company.entity';
import { CostType } from '../domain/enums/cost-type.enum';
import { CompanyResponseDto } from '../dto/company-response.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(companyEntity: Partial<Company>): Promise<CompanyResponseDto> {
    if (companyEntity.pricings && companyEntity.pricings.length > 0) {
      const hasRelativePricing = companyEntity.pricings.some(
        (p) => p.costType === CostType.RELATIVE,
      );
      const hasBasePlan = companyEntity.pricings.some((p) => p.isBasePlan === true);

      if (hasRelativePricing && !hasBasePlan) {
        throw new BadRequestException('A base plan is required when creating relative pricings');
      }
    }

    const company = this.companyRepository.create(companyEntity);
    const savedCompany = await this.companyRepository.save(company);

    return CompanyResponseDto.fromEntity(savedCompany);
  }

  async findAll(): Promise<Company[]> {
    const companies = await this.companyRepository.find({
      relations: ['pricings'],
    });

    return companies;
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['pricings'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }
}
