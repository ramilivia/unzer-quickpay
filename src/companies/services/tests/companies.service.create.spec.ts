import { BadRequestException } from '@nestjs/common';
import { CompaniesService } from '../companies.service';
import { Company } from '../../domain/entities/company.entity';
import { Pricing } from '../../domain/entities/pricing.entity';
import { CostType } from '../../domain/enums/cost-type.enum';
import { mockCompanyRepository, createTestingModule, clearAllMocks } from './test-setup';

describe('CompaniesService - create', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    const { service: serviceInstance } = await createTestingModule();
    service = serviceInstance;
  });

  afterEach(() => {
    clearAllMocks();
  });

  it('should create a company with pricings successfully', async () => {
    const companyEntity: Partial<Company> = {
      name: 'Test Company',
      country: 'United States',
      pricings: [
        {
          name: 'Basic Plan',
          cost: 99.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: true,
        } as Pricing,
      ],
    };

    // After repository.create() - still no IDs
    const companyAfterCreate = {
      ...companyEntity,
      description: null,
      address: null,
      phone: null,
      pricings: companyEntity.pricings,
    } as Company;

    // After repository.save() - IDs are assigned by database
    const savedCompany = {
      id: 1,
      name: 'Test Company',
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
        } as Pricing,
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company;

    mockCompanyRepository.create.mockReturnValue(companyAfterCreate);
    mockCompanyRepository.save.mockResolvedValue(savedCompany);

    const result = await service.create(companyEntity);

    expect(mockCompanyRepository.create).toHaveBeenCalledWith(companyEntity);
    expect(mockCompanyRepository.save).toHaveBeenCalledWith(companyAfterCreate);
    expect(result).toMatchObject({
      id: 1,
      name: 'Test Company',
      country: 'United States',
    });
    expect(result.pricings).toHaveLength(1);
  });

  it('should create a company without pricings successfully', async () => {
    const companyEntity: Partial<Company> = {
      name: 'Simple Company',
      country: 'Canada',
    };

    const savedCompany = {
      id: 1,
      name: 'Simple Company',
      country: 'Canada',
      description: null,
      address: null,
      phone: null,
      pricings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company;

    mockCompanyRepository.create.mockReturnValue(savedCompany);
    mockCompanyRepository.save.mockResolvedValue(savedCompany);

    const result = await service.create(companyEntity);

    expect(mockCompanyRepository.create).toHaveBeenCalledWith(companyEntity);
    expect(mockCompanyRepository.save).toHaveBeenCalledWith(savedCompany);
    expect(result).toMatchObject({
      id: 1,
      name: 'Simple Company',
      country: 'Canada',
    });
  });

  it('should throw BadRequestException when relative pricing exists without base plan', async () => {
    const companyEntity: Partial<Company> = {
      name: 'Test Company',
      country: 'United States',
      pricings: [
        {
          name: 'Relative Plan',
          cost: 1.5,
          costType: CostType.RELATIVE,
          isBasePlan: false,
        } as Pricing,
      ],
    };

    await expect(service.create(companyEntity)).rejects.toThrow(BadRequestException);
    await expect(service.create(companyEntity)).rejects.toThrow(
      'A base plan is required when creating relative pricings',
    );

    expect(mockCompanyRepository.create).not.toHaveBeenCalled();
    expect(mockCompanyRepository.save).not.toHaveBeenCalled();
  });

  it('should allow relative pricing when base plan exists', async () => {
    const companyEntity: Partial<Company> = {
      name: 'Test Company',
      country: 'United States',
      pricings: [
        {
          name: 'Base Plan',
          cost: 99.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: true,
        } as Pricing,
        {
          name: 'Relative Plan',
          cost: 1.5,
          costType: CostType.RELATIVE,
          isBasePlan: false,
        } as Pricing,
      ],
    };

    // After repository.create() - still no IDs
    const companyAfterCreate = {
      ...companyEntity,
      description: null,
      address: null,
      phone: null,
      pricings: companyEntity.pricings,
    } as Company;

    // After repository.save() - IDs are assigned by database
    const savedCompany = {
      id: 1,
      name: 'Test Company',
      country: 'United States',
      description: null,
      address: null,
      phone: null,
      pricings: [
        {
          id: 1,
          name: 'Base Plan',
          cost: 99.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: true,
          companyId: 1,
        } as Pricing,
        {
          id: 2,
          name: 'Relative Plan',
          cost: 1.5,
          costType: CostType.RELATIVE,
          isBasePlan: false,
          companyId: 1,
        } as Pricing,
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company;

    mockCompanyRepository.create.mockReturnValue(companyAfterCreate);
    mockCompanyRepository.save.mockResolvedValue(savedCompany);

    const result = await service.create(companyEntity);

    expect(mockCompanyRepository.create).toHaveBeenCalledWith(companyEntity);
    expect(mockCompanyRepository.save).toHaveBeenCalledWith(companyAfterCreate);
    expect(result).toMatchObject({
      id: 1,
      name: 'Test Company',
      country: 'United States',
    });
    expect(result.pricings).toHaveLength(2);
  });
});
