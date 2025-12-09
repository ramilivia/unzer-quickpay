import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Company } from '../domain/entities/company.entity';
import { Pricing } from '../domain/entities/pricing.entity';
import { CostType } from '../domain/enums/cost-type.enum';

describe('CompaniesService', () => {
  let service: CompaniesService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
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

      mockRepository.create.mockReturnValue(companyAfterCreate);
      mockRepository.save.mockResolvedValue(savedCompany);

      const result = await service.create(companyEntity);

      expect(mockRepository.create).toHaveBeenCalledWith(companyEntity);
      expect(mockRepository.save).toHaveBeenCalledWith(companyAfterCreate);
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

      mockRepository.create.mockReturnValue(savedCompany);
      mockRepository.save.mockResolvedValue(savedCompany);

      const result = await service.create(companyEntity);

      expect(mockRepository.create).toHaveBeenCalledWith(companyEntity);
      expect(mockRepository.save).toHaveBeenCalledWith(savedCompany);
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

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
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

      mockRepository.create.mockReturnValue(companyAfterCreate);
      mockRepository.save.mockResolvedValue(savedCompany);

      const result = await service.create(companyEntity);

      expect(mockRepository.create).toHaveBeenCalledWith(companyEntity);
      expect(mockRepository.save).toHaveBeenCalledWith(companyAfterCreate);
      expect(result).toMatchObject({
        id: 1,
        name: 'Test Company',
        country: 'United States',
      });
      expect(result.pricings).toHaveLength(2);
    });
  });

  describe('findAll', () => {
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

      mockRepository.find.mockResolvedValue(companies);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
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
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
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

      mockRepository.find.mockResolvedValue(companies);

      const result = await service.findAll();

      expect(result[0].pricings).toHaveLength(1);
      expect(result[0].pricings?.[0]).toMatchObject({
        id: 1,
        name: 'Basic Plan',
        cost: 99.99,
      });
    });
  });
});
