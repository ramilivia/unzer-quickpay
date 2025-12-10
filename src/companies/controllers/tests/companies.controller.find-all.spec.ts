import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from '../companies.controller';
import { CompaniesService } from '../../services/companies.service';
import { CompanyResponseDto } from '../../dto/company-response.dto';
import { CostType } from '../../domain/enums/cost-type.enum';
import { mockCompaniesService, clearAllMocks } from './test-setup';

describe('CompaniesController - findAll', () => {
  let controller: CompaniesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: mockCompaniesService,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  afterEach(() => {
    clearAllMocks();
  });

  it('should return an array of companies', async () => {
    const expectedResponse: CompanyResponseDto[] = [
      {
        id: 1,
        name: 'Company 1',
        country: 'United States',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Company 2',
        country: 'Canada',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCompaniesService.findAll.mockResolvedValue(expectedResponse);

    const result = await controller.findAll();

    expect(mockCompaniesService.findAll).toHaveBeenCalled();
    expect(result).toEqual(expectedResponse);
    expect(result).toHaveLength(2);
  });

  it('should return an empty array when no companies exist', async () => {
    mockCompaniesService.findAll.mockResolvedValue([]);

    const result = await controller.findAll();

    expect(mockCompaniesService.findAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should handle companies with pricings', async () => {
    const expectedResponse: CompanyResponseDto[] = [
      {
        id: 1,
        name: 'Company 1',
        country: 'United States',
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
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCompaniesService.findAll.mockResolvedValue(expectedResponse);

    const result = await controller.findAll();

    expect(result[0].pricings).toHaveLength(1);
    expect(result[0].pricings?.[0]?.name).toBe('Basic Plan');
  });
});
