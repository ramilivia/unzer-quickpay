import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { CompaniesController } from '../companies.controller';
import { CompaniesService } from '../../services/companies.service';
import { CompanyResponseDto } from '../../dto/company-response.dto';
import { CostType } from '../../domain/enums/cost-type.enum';
import { mockCompaniesService, clearAllMocks } from './test-setup';

describe('CompaniesController - create', () => {
  let app: INestApplication<App>;

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

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterEach(() => {
    clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /companies', () => {
    it('should create a company successfully', async () => {
      const createCompanyDto = {
        name: 'Test Company',
        country: 'United States',
        description: 'Test description',
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

      await request(app.getHttpServer())
        .post('/companies')
        .send(createCompanyDto)
        .expect(201)
        .expect((res) => {
          const body = res.body as CompanyResponseDto;
          expect(body).toMatchObject({
            id: 1,
            name: 'Test Company',
            country: 'United States',
          });
          expect(body.pricings).toHaveLength(1);
        });

      expect(mockCompaniesService.create).toHaveBeenCalled();
    });

    it('should handle company without pricings', async () => {
      const createCompanyDto = {
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

      await request(app.getHttpServer())
        .post('/companies')
        .send(createCompanyDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: 1,
            name: 'Simple Company',
            country: 'Canada',
          });
        });

      expect(mockCompaniesService.create).toHaveBeenCalled();
    });
  });

  describe('POST /companies - validation', () => {
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

      await request(app.getHttpServer()).post('/companies').send(validDto).expect(201);

      expect(mockCompaniesService.create).toHaveBeenCalled();
    });

    it('should reject invalid company fields', async () => {
      const invalidDtos = [
        { country: 'United States' }, // missing name
        { name: '', country: 'United States' }, // empty name
        { name: 'Test Company' }, // missing country
        { name: 123, country: 'United States' }, // name not string
        { name: 'Test Company', country: 'United States', description: 123 }, // description not string
        { name: 'Test Company', country: 'United States', pricings: 'not an array' }, // pricings not array
      ];

      for (const invalidDto of invalidDtos) {
        await request(app.getHttpServer()).post('/companies').send(invalidDto).expect(400);
        expect(mockCompaniesService.create).not.toHaveBeenCalled();
      }
    });

    it('should reject invalid pricing fields', async () => {
      const invalidDtos = [
        {
          name: 'Test Company',
          country: 'United States',
          pricings: [{ cost: 99.99, costType: 'absolute' }], // missing name
        },
        {
          name: 'Test Company',
          country: 'United States',
          pricings: [{ name: 'Basic Plan', costType: 'absolute' }], // missing cost
        },
        {
          name: 'Test Company',
          country: 'United States',
          pricings: [{ name: 'Basic Plan', cost: 99.99, costType: 'invalid' }], // invalid costType
        },
      ];

      for (const invalidDto of invalidDtos) {
        await request(app.getHttpServer()).post('/companies').send(invalidDto).expect(400);
        expect(mockCompaniesService.create).not.toHaveBeenCalled();
      }
    });
  });
});
