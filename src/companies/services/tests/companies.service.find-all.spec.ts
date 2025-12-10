import { CompaniesService } from '../companies.service';
import { Company } from '../../domain/entities/company.entity';
import { Pricing } from '../../domain/entities/pricing.entity';
import { CostType } from '../../domain/enums/cost-type.enum';
import { mockCompanyRepository, createTestingModule, clearAllMocks } from './test-setup';

describe('CompaniesService - findAll', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    const { service: serviceInstance } = await createTestingModule();
    service = serviceInstance;
  });

  afterEach(() => {
    clearAllMocks();
  });

  it('should return an array of company entities', async () => {
    const companies = [
      {
        id: 1,
        name: 'Company 1',
        country: 'United States',
        description: null,
        address: null,
        phone: null,
        pricings: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Company,
      {
        id: 2,
        name: 'Company 2',
        country: 'Canada',
        description: null,
        address: null,
        phone: null,
        pricings: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Company,
    ];

    mockCompanyRepository.find.mockResolvedValue(companies);

    const result = await service.findAll();

    expect(mockCompanyRepository.find).toHaveBeenCalledWith({
      relations: ['pricings'],
    });
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 1,
      name: 'Company 1',
      country: 'United States',
    });
    expect(result[1]).toMatchObject({
      id: 2,
      name: 'Company 2',
      country: 'Canada',
    });
  });

  it('should return an empty array when no companies exist', async () => {
    mockCompanyRepository.find.mockResolvedValue([]);

    const result = await service.findAll();

    expect(mockCompanyRepository.find).toHaveBeenCalledWith({
      relations: ['pricings'],
    });
    expect(result).toEqual([]);
  });

  it('should include pricings in the entities', async () => {
    const companies = [
      {
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
      } as Company,
    ];

    mockCompanyRepository.find.mockResolvedValue(companies);

    const result = await service.findAll();

    expect(result[0].pricings).toHaveLength(1);
    expect(result[0].pricings?.[0]).toMatchObject({
      id: 1,
      name: 'Basic Plan',
      cost: 99.99,
    });
  });
});
