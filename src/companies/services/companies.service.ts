import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../domain/entities/company.entity';
import { Pricing } from '../domain/entities/pricing.entity';
import { CostType } from '../domain/enums/cost-type.enum';
import { CompanyResponseDto } from '../dto/company-response.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Pricing)
    private readonly pricingRepository: Repository<Pricing>,
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

  async update(id: number, companyToUpdate: Partial<Company>): Promise<Company> {
    const companyStored = await this.findOne(id);

    // If pricings are being updated, validate and handle replacement
    if (companyToUpdate.pricings !== undefined) {
      // Validate relative pricings if any are being updated
      if (companyToUpdate.pricings.length > 0) {
        const hasRelativePricing = companyToUpdate.pricings.some(
          (p) => p.costType === CostType.RELATIVE,
        );
        const hasBasePlan = companyToUpdate.pricings.some((p) => p.isBasePlan === true);

        if (hasRelativePricing && !hasBasePlan) {
          throw new BadRequestException(
            'A base plan is required when updating with relative pricings',
          );
        }
      }

      // Get IDs of pricings that should remain (those present in the update)
      const pricingIdsToKeep = companyToUpdate.pricings
        .filter((p): p is Pricing & { id: number } => p.id !== undefined)
        .map((p) => p.id);

      // Find pricings that should be removed (exist in stored but not in update)
      const pricingsToRemove =
        companyStored.pricings?.filter(
          (storedPricing) => !pricingIdsToKeep.includes(storedPricing.id),
        ) || [];

      // Remove pricings that are no longer present
      if (pricingsToRemove.length > 0) {
        await this.pricingRepository.remove(pricingsToRemove);
      }

      // Process pricings: update existing ones or create new ones
      const processedPricings: Pricing[] = [];

      for (const pricingData of companyToUpdate.pricings) {
        if (pricingData.id) {
          // Existing pricing - load and update it
          const existingPricing = await this.pricingRepository.findOne({
            where: { id: pricingData.id, companyId: id },
          });

          if (existingPricing) {
            // Update the existing pricing properties
            existingPricing.name = pricingData.name;
            existingPricing.description = pricingData.description ?? null;
            existingPricing.cost = pricingData.cost;
            existingPricing.costType = pricingData.costType;
            existingPricing.isBasePlan = pricingData.isBasePlan ?? false;
            processedPricings.push(existingPricing);
          }
        } else {
          // New pricing - create it
          const newPricing = this.pricingRepository.create({
            ...pricingData,
            companyId: id,
            description: pricingData.description ?? null,
            isBasePlan: pricingData.isBasePlan ?? false,
          });
          processedPricings.push(newPricing);
        }
      }

      companyToUpdate.pricings = processedPricings;
    }

    // Merge the update data with existing company (excluding pricings if not provided)
    const { pricings, ...otherFields } = companyToUpdate;
    Object.assign(companyStored, otherFields);

    // If pricings were provided, assign them
    if (pricings !== undefined) {
      companyStored.pricings = pricings;
    }

    // Save the updated company and return it
    return this.companyRepository.save(companyStored);
  }
}
