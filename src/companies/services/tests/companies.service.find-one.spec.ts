import { NotFoundException } from '@nestjs/common';
import { CompaniesService } from '../companies.service';
import { Company } from '../../domain/entities/company.entity';
import { Pricing } from '../../domain/entities/pricing.entity';
import { CostType } from '../../domain/enums/cost-type.enum';
import { mockCompanyRepository, createTestingModule, clearAllMocks } from './test-setup';

describe('CompaniesService - findOne', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    const { service: serviceInstance } = await createTestingModule();
    service = serviceInstance;
  });

  afterEach(() => {
    clearAllMocks();
  });

  it('should return a company when found', async () => {
    const company = {
      id: 1,
      name: 'Company 1',
      country: 'United States',
      description: null,
      address: null,
      phone: null,
      pricings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company;

    mockCompanyRepository.findOne.mockResolvedValue(company);

    const result = await service.findOne(1);

    expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['pricings'],
    });
    expect(result).toMatchObject({
      id: 1,
      name: 'Company 1',
      country: 'United States',
    });
  });

  it('should throw NotFoundException when company does not exist', async () => {
    mockCompanyRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(999)).rejects.toThrow('Company with ID 999 not found');
  });

  it('should include pricings in the result', async () => {
    const company = {
      id: 1,
      name: 'Company 1',
      country: 'United States',
      description: null,
      address: null,
      phone: null,
      pricings: [
        {
          id: 1,
          name: 'Basic Plan',
          cost: 99.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: true,
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Pricing,
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company;

    mockCompanyRepository.findOne.mockResolvedValue(company);

    const result = await service.findOne(1);

    expect(result.pricings).toHaveLength(1);
    expect(result.pricings?.[0]).toMatchObject({
      id: 1,
      name: 'Basic Plan',
      cost: 99.99,
    });
  });
});
