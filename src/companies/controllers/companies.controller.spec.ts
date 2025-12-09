import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
});
