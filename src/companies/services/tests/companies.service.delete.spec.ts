import { NotFoundException } from '@nestjs/common';
import { CompaniesService } from '../companies.service';
import { Company } from '../../domain/entities/company.entity';
import { Pricing } from '../../domain/entities/pricing.entity';
import { CostType } from '../../domain/enums/cost-type.enum';
import { mockCompanyRepository, createTestingModule, clearAllMocks } from './test-setup';

describe('CompaniesService - remove', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    const { service: serviceInstance } = await createTestingModule();
    service = serviceInstance;
  });

  afterEach(() => {
    clearAllMocks();
  });

  it('should delete a company successfully', async () => {
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
    mockCompanyRepository.remove.mockResolvedValue(company);

    await service.remove(1);

    expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['pricings'],
    });
    expect(mockCompanyRepository.remove).toHaveBeenCalledWith(company);
  });

  it('should throw NotFoundException when company does not exist', async () => {
    mockCompanyRepository.findOne.mockResolvedValue(null);

    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    await expect(service.remove(999)).rejects.toThrow('Company with ID 999 not found');

    expect(mockCompanyRepository.remove).not.toHaveBeenCalled();
  });

  it('should delete a company with pricings', async () => {
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
        {
          id: 2,
          name: 'Premium Plan',
          cost: 199.99,
          costType: CostType.ABSOLUTE,
          isBasePlan: false,
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Pricing,
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company;

    mockCompanyRepository.findOne.mockResolvedValue(company);
    mockCompanyRepository.remove.mockResolvedValue(company);

    await service.remove(1);

    expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['pricings'],
    });
    expect(mockCompanyRepository.remove).toHaveBeenCalledWith(company);
    // The pricings should be deleted automatically due to cascade
    expect(company.pricings).toHaveLength(2);
  });

  it('should call findOne before remove to verify company exists', async () => {
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
    mockCompanyRepository.remove.mockResolvedValue(company);

    await service.remove(1);

    // Verify findOne was called first (to check if company exists)
    expect(mockCompanyRepository.findOne).toHaveBeenCalled();
    // Verify remove was called with the company from findOne
    // This implicitly verifies the order since remove receives the result from findOne
    expect(mockCompanyRepository.remove).toHaveBeenCalledWith(company);
    // Verify the call order by checking mock call indices
    const findOneCallIndex = mockCompanyRepository.findOne.mock.invocationCallOrder[0];
    const removeCallIndex = mockCompanyRepository.remove.mock.invocationCallOrder[0];
    expect(findOneCallIndex).toBeLessThan(removeCallIndex);
  });
});
