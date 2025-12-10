import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from '../companies.service';
import { Company } from '../../domain/entities/company.entity';
import { Pricing } from '../../domain/entities/pricing.entity';
import { CostType } from '../../domain/enums/cost-type.enum';
import {
  mockCompanyRepository,
  mockPricingRepository,
  createTestingModule,
  clearAllMocks,
} from './test-setup';

describe('CompaniesService - update', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    const { service: serviceInstance } = await createTestingModule();
    service = serviceInstance;
  });

  afterEach(() => {
    clearAllMocks();
  });

  it('should update a company successfully', async () => {
    const existingCompany = {
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

    const updatedCompany = {
      ...existingCompany,
      name: 'Updated Company',
      country: 'Canada',
      description: 'Updated description',
    } as Company;

    mockCompanyRepository.findOne.mockResolvedValueOnce(existingCompany);
    mockCompanyRepository.save.mockResolvedValue(updatedCompany);

    const updateData: Partial<Company> = {
      name: 'Updated Company',
      country: 'Canada',
      description: 'Updated description',
    };

    const result = await service.update(1, updateData);

    expect(mockCompanyRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockCompanyRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        name: 'Updated Company',
        country: 'Canada',
        description: 'Updated description',
      }),
    );
    expect(result).toMatchObject({
      id: 1,
      name: 'Updated Company',
      country: 'Canada',
      description: 'Updated description',
    });
  });

  it('should throw NotFoundException when company does not exist', async () => {
    mockCompanyRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.update(999, { name: 'New Name' })).rejects.toThrow(NotFoundException);
    await expect(service.update(999, { name: 'New Name' })).rejects.toThrow(
      'Company with ID 999 not found',
    );

    expect(mockCompanyRepository.save).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when relative pricing exists without base plan', async () => {
    const existingCompany = {
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

    mockCompanyRepository.findOne.mockResolvedValue(existingCompany);

    const updateData: Partial<Company> = {
      pricings: [
        {
          name: 'Relative Plan',
          cost: 1.5,
          costType: CostType.RELATIVE,
          isBasePlan: false,
        } as Pricing,
      ],
    };

    await expect(service.update(1, updateData)).rejects.toThrow(BadRequestException);
    await expect(service.update(1, updateData)).rejects.toThrow(
      'A base plan is required when updating with relative pricings',
    );

    expect(mockCompanyRepository.save).not.toHaveBeenCalled();
  });

  it('should allow partial updates', async () => {
    const existingCompany = {
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

    const updatedCompany = {
      ...existingCompany,
      name: 'Updated Name',
    } as Company;

    mockCompanyRepository.findOne.mockResolvedValueOnce(existingCompany);
    mockCompanyRepository.save.mockResolvedValue(updatedCompany);

    const updateData: Partial<Company> = {
      name: 'Updated Name',
    };

    const result = await service.update(1, updateData);

    expect(result.name).toBe('Updated Name');
    expect(result.country).toBe('United States'); // Original value preserved
  });

  it('should update existing pricings when IDs are provided', async () => {
    const existingPricing1 = {
      id: 1,
      name: 'Basic Plan',
      cost: 99.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: true,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const existingPricing2 = {
      id: 2,
      name: 'Premium Plan',
      cost: 199.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: false,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const existingCompany = {
      id: 1,
      name: 'Company 1',
      country: 'United States',
      description: null,
      address: null,
      phone: null,
      pricings: [existingPricing1, existingPricing2],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company;

    // Updated pricing data
    const updatedPricing1 = {
      ...existingPricing1,
      name: 'Updated Basic Plan',
      cost: 89.99,
    } as Pricing;

    const updatedPricing2 = {
      ...existingPricing2,
      name: 'Updated Premium Plan',
      cost: 189.99,
    } as Pricing;

    const updatedCompany = {
      ...existingCompany,
      pricings: [updatedPricing1, updatedPricing2],
    } as Company;

    mockCompanyRepository.findOne.mockResolvedValueOnce(existingCompany);
    mockPricingRepository.findOne
      .mockResolvedValueOnce(existingPricing1)
      .mockResolvedValueOnce(existingPricing2);
    mockCompanyRepository.save.mockResolvedValue(updatedCompany);

    const updateData: Partial<Company> = {
      pricings: [
        {
          id: 1,
          name: 'Updated Basic Plan',
          cost: 89.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: true,
        } as Pricing,
        {
          id: 2,
          name: 'Updated Premium Plan',
          cost: 189.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: false,
        } as Pricing,
      ],
    };

    const result = await service.update(1, updateData);

    expect(mockPricingRepository.findOne).toHaveBeenCalledTimes(2);
    expect(mockPricingRepository.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 1, companyId: 1 },
    });
    expect(mockPricingRepository.findOne).toHaveBeenNthCalledWith(2, {
      where: { id: 2, companyId: 1 },
    });
    expect(result.pricings).toHaveLength(2);
    expect(result.pricings?.[0]).toMatchObject({
      id: 1,
      name: 'Updated Basic Plan',
      cost: 89.99,
    });
    expect(result.pricings?.[1]).toMatchObject({
      id: 2,
      name: 'Updated Premium Plan',
      cost: 189.99,
    });
  });

  it('should add new pricings when no IDs are provided', async () => {
    const existingCompany = {
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

    const newPricing1 = {
      id: 1,
      name: 'Basic Plan',
      cost: 99.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: true,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const newPricing2 = {
      id: 2,
      name: 'Premium Plan',
      cost: 199.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: false,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const updatedCompany = {
      ...existingCompany,
      pricings: [newPricing1, newPricing2],
    } as Company;

    mockCompanyRepository.findOne.mockResolvedValueOnce(existingCompany);
    mockPricingRepository.create
      .mockReturnValueOnce({ ...newPricing1, id: undefined })
      .mockReturnValueOnce({ ...newPricing2, id: undefined });
    mockCompanyRepository.save.mockResolvedValue(updatedCompany);

    const updateData: Partial<Company> = {
      pricings: [
        {
          name: 'Basic Plan',
          cost: 99.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: true,
        } as Pricing,
        {
          name: 'Premium Plan',
          cost: 199.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: false,
        } as Pricing,
      ],
    };

    const result = await service.update(1, updateData);

    expect(mockPricingRepository.create).toHaveBeenCalledTimes(2);
    expect(mockPricingRepository.create).toHaveBeenNthCalledWith(1, {
      name: 'Basic Plan',
      cost: 99.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: true,
      companyId: 1,
      description: null,
    });
    expect(mockPricingRepository.create).toHaveBeenNthCalledWith(2, {
      name: 'Premium Plan',
      cost: 199.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: false,
      companyId: 1,
      description: null,
    });
    expect(result.pricings).toHaveLength(2);
    expect(mockPricingRepository.findOne).not.toHaveBeenCalled();
  });

  it('should remove pricings that are not in the update', async () => {
    const existingPricing1 = {
      id: 1,
      name: 'Basic Plan',
      cost: 99.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: true,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const existingPricing2 = {
      id: 2,
      name: 'Premium Plan',
      cost: 199.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: false,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const existingPricing3 = {
      id: 3,
      name: 'Enterprise Plan',
      cost: 299.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: false,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const existingCompany = {
      id: 1,
      name: 'Company 1',
      country: 'United States',
      description: null,
      address: null,
      phone: null,
      pricings: [existingPricing1, existingPricing2, existingPricing3],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company;

    const updatedCompany = {
      ...existingCompany,
      pricings: [existingPricing1, existingPricing2],
    } as Company;

    mockCompanyRepository.findOne.mockResolvedValueOnce(existingCompany);
    mockPricingRepository.findOne
      .mockResolvedValueOnce(existingPricing1)
      .mockResolvedValueOnce(existingPricing2);
    mockPricingRepository.remove.mockResolvedValue([existingPricing3]);
    mockCompanyRepository.save.mockResolvedValue(updatedCompany);

    const updateData: Partial<Company> = {
      pricings: [
        {
          id: 1,
          name: 'Basic Plan',
          cost: 99.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: true,
        } as Pricing,
        {
          id: 2,
          name: 'Premium Plan',
          cost: 199.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: false,
        } as Pricing,
      ],
    };

    const result = await service.update(1, updateData);

    expect(mockPricingRepository.remove).toHaveBeenCalledWith([existingPricing3]);
    expect(result.pricings).toHaveLength(2);
    expect(result.pricings?.some((p) => p.id === 3)).toBe(false);
  });

  it('should handle mixed operations: update, add, and remove pricings', async () => {
    const existingPricing1 = {
      id: 1,
      name: 'Basic Plan',
      cost: 99.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: true,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const existingPricing2 = {
      id: 2,
      name: 'Premium Plan',
      cost: 199.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: false,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const existingPricing3 = {
      id: 3,
      name: 'Enterprise Plan',
      cost: 299.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: false,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const existingCompany = {
      id: 1,
      name: 'Company 1',
      country: 'United States',
      description: null,
      address: null,
      phone: null,
      pricings: [existingPricing1, existingPricing2, existingPricing3],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company;

    // Updated pricing 1
    const updatedPricing1 = {
      ...existingPricing1,
      name: 'Updated Basic Plan',
      cost: 89.99,
    } as Pricing;

    // New pricing 4
    const newPricing4 = {
      id: 4,
      name: 'Starter Plan',
      cost: 49.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: false,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const updatedCompany = {
      ...existingCompany,
      pricings: [updatedPricing1, existingPricing2, newPricing4],
    } as Company;

    mockCompanyRepository.findOne.mockResolvedValueOnce(existingCompany);
    mockPricingRepository.findOne
      .mockResolvedValueOnce(existingPricing1)
      .mockResolvedValueOnce(existingPricing2);
    mockPricingRepository.create.mockReturnValue({ ...newPricing4, id: undefined });
    mockPricingRepository.remove.mockResolvedValue([existingPricing3]);
    mockCompanyRepository.save.mockResolvedValue(updatedCompany);

    const updateData: Partial<Company> = {
      pricings: [
        {
          id: 1,
          name: 'Updated Basic Plan',
          cost: 89.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: true,
        } as Pricing,
        {
          id: 2,
          name: 'Premium Plan',
          cost: 199.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: false,
        } as Pricing,
        {
          name: 'Starter Plan',
          cost: 49.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: false,
        } as Pricing,
      ],
    };

    const result = await service.update(1, updateData);

    // Verify pricing 3 was removed
    expect(mockPricingRepository.remove).toHaveBeenCalledWith([existingPricing3]);

    // Verify pricing 1 was updated
    expect(mockPricingRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1, companyId: 1 },
    });

    // Verify new pricing was created
    expect(mockPricingRepository.create).toHaveBeenCalledWith({
      name: 'Starter Plan',
      cost: 49.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: false,
      companyId: 1,
      description: null,
    });

    // Verify final result
    expect(result.pricings).toHaveLength(3);
    expect(result.pricings?.some((p) => p.id === 1 && p.name === 'Updated Basic Plan')).toBe(true);
    expect(result.pricings?.some((p) => p.id === 2)).toBe(true);
    expect(result.pricings?.some((p) => p.id === 3)).toBe(false); // Removed
    expect(result.pricings?.some((p) => p.name === 'Starter Plan')).toBe(true); // Added
  });

  it('should remove all pricings when empty array is provided', async () => {
    const existingPricing1 = {
      id: 1,
      name: 'Basic Plan',
      cost: 99.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: true,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const existingPricing2 = {
      id: 2,
      name: 'Premium Plan',
      cost: 199.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: false,
      companyId: 1,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const existingCompany = {
      id: 1,
      name: 'Company 1',
      country: 'United States',
      description: null,
      address: null,
      phone: null,
      pricings: [existingPricing1, existingPricing2],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company;

    const updatedCompany = {
      ...existingCompany,
      pricings: [],
    } as Company;

    mockCompanyRepository.findOne.mockResolvedValueOnce(existingCompany);
    mockPricingRepository.remove.mockResolvedValue([existingPricing1, existingPricing2]);
    mockCompanyRepository.save.mockResolvedValue(updatedCompany);

    const updateData: Partial<Company> = {
      pricings: [],
    };

    const result = await service.update(1, updateData);

    expect(mockPricingRepository.remove).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
      ]),
    );
    expect(result.pricings).toHaveLength(0);
    expect(mockPricingRepository.findOne).not.toHaveBeenCalled();
    expect(mockPricingRepository.create).not.toHaveBeenCalled();
  });

  it('should handle pricing with description null correctly', async () => {
    const existingPricing1 = {
      id: 1,
      name: 'Basic Plan',
      cost: 99.99,
      costType: CostType.ABSOLUTE,
      isBasePlan: true,
      companyId: 1,
      description: 'Old description',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Pricing;

    const existingCompany = {
      id: 1,
      name: 'Company 1',
      country: 'United States',
      description: null,
      address: null,
      phone: null,
      pricings: [existingPricing1],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company;

    const updatedPricing1 = {
      ...existingPricing1,
      description: null,
    } as Pricing;

    const updatedCompany = {
      ...existingCompany,
      pricings: [updatedPricing1],
    } as Company;

    mockCompanyRepository.findOne.mockResolvedValueOnce(existingCompany);
    mockPricingRepository.findOne.mockResolvedValueOnce(existingPricing1);
    mockCompanyRepository.save.mockResolvedValue(updatedCompany);

    const updateData: Partial<Company> = {
      pricings: [
        {
          id: 1,
          name: 'Basic Plan',
          cost: 99.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: true,
        } as Partial<Pricing> as Pricing,
      ],
    };

    const result = await service.update(1, updateData);

    expect(result.pricings?.[0].description).toBeNull();
  });
});
