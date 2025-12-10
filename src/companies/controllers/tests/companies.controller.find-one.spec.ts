import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { CompaniesController } from '../companies.controller';
import { CompaniesService } from '../../services/companies.service';
import { CompanyResponseDto } from '../../dto/company-response.dto';
import { CostType } from '../../domain/enums/cost-type.enum';
import { mockCompaniesService, clearAllMocks } from './test-setup';

describe('CompaniesController - findOne', () => {
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

  describe('GET /companies/:id', () => {
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

      const response = await request(app.getHttpServer()).get('/companies/1').expect(200);
      const body = response.body as CompanyResponseDto;

      expect(body.pricings).toHaveLength(1);
      expect(body.pricings[0].name).toBe('Basic Plan');
    });

    it('should reject invalid id formats', async () => {
      const invalidIds = ['abc', '1.5', 'invalid'];

      for (const id of invalidIds) {
        await request(app.getHttpServer()).get(`/companies/${id}`).expect(400);

        expect(mockCompaniesService.findOne).not.toHaveBeenCalled();
      }
    });
  });
});
