import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { Company } from '../domain/entities/company.entity';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { CompanyResponseDto } from '../dto/company-response.dto';
import { CostType } from '../domain/enums/cost-type.enum';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let app: INestApplication<App>;

  const mockCompaniesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

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

    // Create full NestJS application for ValidationPipe tests
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create', () => {
    it('should create a company successfully', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'Test Company',
        country: 'United States',
        description: 'Test description',
        pricings: [
          {
            name: 'Basic Plan',
            cost: 99.99,
            costType: CostType.ABSOLUTE,
            isBasePlan: true,
          },
        ],
      };

      const expectedResponse: CompanyResponseDto = {
        id: 1,
        name: 'Test Company',
        country: 'United States',
        description: 'Test description',
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
      };

      mockCompaniesService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createCompanyDto);

      expect(mockCompaniesService.create).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Company');
    });

    it('should convert DTO to entity before calling service', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'Test Company',
        country: 'United States',
        pricings: [],
      };

      const expectedResponse: CompanyResponseDto = {
        id: 1,
        name: 'Test Company',
        country: 'United States',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.create.mockResolvedValue(expectedResponse);

      await controller.create(createCompanyDto);

      const serviceCall = (mockCompaniesService.create.mock.calls[0] as [Partial<Company>])[0];
      expect(serviceCall).toHaveProperty('name', 'Test Company');
      expect(serviceCall).toHaveProperty('country', 'United States');
      expect(serviceCall.pricings).toBeUndefined();
    });

    it('should handle company without pricings', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'Simple Company',
        country: 'Canada',
      };

      const expectedResponse: CompanyResponseDto = {
        id: 1,
        name: 'Simple Company',
        country: 'Canada',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createCompanyDto);

      expect(mockCompaniesService.create).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('ValidationPipe', () => {
    it('should pass validation with valid DTO', async () => {
      const validDto = {
        name: 'Test Company',
        country: 'United States',
        description: 'Test description',
      };

      const expectedResponse: CompanyResponseDto = {
        id: 1,
        name: 'Test Company',
        country: 'United States',
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.create.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .post('/companies')
        .send(validDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 1,
        name: 'Test Company',
        country: 'United States',
      });
      expect(mockCompaniesService.create).toHaveBeenCalled();
    });

    it('should reject when name is missing', async () => {
      const invalidDto = {
        country: 'United States',
      };

      await request(app.getHttpServer()).post('/companies').send(invalidDto).expect(400);

      expect(mockCompaniesService.create).not.toHaveBeenCalled();
    });

    it('should reject when name is empty string', async () => {
      const invalidDto = {
        name: '',
        country: 'United States',
      };

      await request(app.getHttpServer()).post('/companies').send(invalidDto).expect(400);

      expect(mockCompaniesService.create).not.toHaveBeenCalled();
    });

    it('should reject when country is missing', async () => {
      const invalidDto = {
        name: 'Test Company',
      };

      await request(app.getHttpServer()).post('/companies').send(invalidDto).expect(400);

      expect(mockCompaniesService.create).not.toHaveBeenCalled();
    });

    it('should reject when name is not a string', async () => {
      const invalidDto = {
        name: 123,
        country: 'United States',
      };

      await request(app.getHttpServer()).post('/companies').send(invalidDto).expect(400);

      expect(mockCompaniesService.create).not.toHaveBeenCalled();
    });

    it('should reject when description is not a string', async () => {
      const invalidDto = {
        name: 'Test Company',
        country: 'United States',
        description: 123,
      };

      await request(app.getHttpServer()).post('/companies').send(invalidDto).expect(400);

      expect(mockCompaniesService.create).not.toHaveBeenCalled();
    });

    it('should reject when pricings is not an array', async () => {
      const invalidDto = {
        name: 'Test Company',
        country: 'United States',
        pricings: 'not an array',
      };

      await request(app.getHttpServer()).post('/companies').send(invalidDto).expect(400);

      expect(mockCompaniesService.create).not.toHaveBeenCalled();
    });

    it('should pass validation with valid nested pricings', async () => {
      const validDto = {
        name: 'Test Company',
        country: 'United States',
        pricings: [
          {
            name: 'Basic Plan',
            cost: 99.99,
            costType: 'absolute',
            isBasePlan: true,
          },
        ],
      };

      const expectedResponse: CompanyResponseDto = {
        id: 1,
        name: 'Test Company',
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
      };

      mockCompaniesService.create.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .post('/companies')
        .send(validDto)
        .expect(201);

      expect((response.body as CompanyResponseDto).pricings).toHaveLength(1);
      expect(mockCompaniesService.create).toHaveBeenCalled();
    });

    it('should reject when pricing name is missing', async () => {
      const invalidDto = {
        name: 'Test Company',
        country: 'United States',
        pricings: [
          {
            cost: 99.99,
            costType: 'absolute',
          },
        ],
      };

      await request(app.getHttpServer()).post('/companies').send(invalidDto).expect(400);

      expect(mockCompaniesService.create).not.toHaveBeenCalled();
    });

    it('should reject when pricing cost is missing', async () => {
      const invalidDto = {
        name: 'Test Company',
        country: 'United States',
        pricings: [
          {
            name: 'Basic Plan',
            costType: 'absolute',
          },
        ],
      };

      await request(app.getHttpServer()).post('/companies').send(invalidDto).expect(400);

      expect(mockCompaniesService.create).not.toHaveBeenCalled();
    });

    it('should reject when pricing costType is invalid', async () => {
      const invalidDto = {
        name: 'Test Company',
        country: 'United States',
        pricings: [
          {
            name: 'Basic Plan',
            cost: 99.99,
            costType: 'invalid',
          },
        ],
      };

      await request(app.getHttpServer()).post('/companies').send(invalidDto).expect(400);

      expect(mockCompaniesService.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
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

  describe('findOne', () => {
    it('should return a company by id', async () => {
      mockCompaniesService.findOne.mockResolvedValue({
        id: 1,
        name: 'Company 1',
        country: 'United States',
        description: null,
        address: null,
        phone: null,
        pricings: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await controller.findOne(1);

      expect(mockCompaniesService.findOne).toHaveBeenCalledWith(1);
      expect(result).toMatchObject({
        id: 1,
        name: 'Company 1',
        country: 'United States',
      });
    });

    it('should throw NotFoundException when company does not exist', async () => {
      mockCompaniesService.findOne.mockRejectedValue(
        new NotFoundException('Company with ID 999 not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockCompaniesService.findOne).toHaveBeenCalledWith(999);
    });

    it('should return 404 when company does not exist', async () => {
      mockCompaniesService.findOne.mockRejectedValue(
        new NotFoundException('Company with ID 999 not found'),
      );

      await request(app.getHttpServer())
        .get('/companies/999')
        .expect(404)
        .expect((res) => {
          expect((res.body as { message: string }).message).toBe('Company with ID 999 not found');
        });

      expect(mockCompaniesService.findOne).toHaveBeenCalledWith(999);
    });

    it('should handle company with pricings', async () => {
      mockCompaniesService.findOne.mockResolvedValue({
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
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await controller.findOne(1);

      expect(result.pricings).toHaveLength(1);
      expect(result.pricings?.[0]?.name).toBe('Basic Plan');
    });

    it('should reject when id is not a number', async () => {
      await request(app.getHttpServer())
        .get('/companies/abc')
        .expect(400)
        .expect((res) => {
          expect((res.body as { message: string | string[] }).message).toContain(
            'Validation failed',
          );
        });

      expect(mockCompaniesService.findOne).not.toHaveBeenCalled();
    });

    it('should reject when id is a decimal number', async () => {
      await request(app.getHttpServer()).get('/companies/1.5').expect(400);

      expect(mockCompaniesService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('ParseIntPipe for findOne route parameter', () => {
    it('should validate id parameter and return 400 for non-numeric id', async () => {
      await request(app.getHttpServer()).get('/companies/invalid').expect(400);

      expect(mockCompaniesService.findOne).not.toHaveBeenCalled();
    });

    it('should accept valid numeric id', async () => {
      mockCompaniesService.findOne.mockResolvedValue({
        id: 1,
        name: 'Company 1',
        country: 'United States',
        description: null,
        address: null,
        phone: null,
        pricings: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app.getHttpServer())
        .get('/companies/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: 1,
            name: 'Company 1',
            country: 'United States',
          });
        });

      expect(mockCompaniesService.findOne).toHaveBeenCalledWith(1);
    });
  });
});
