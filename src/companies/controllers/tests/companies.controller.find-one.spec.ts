import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { CompaniesController } from '../companies.controller';
import { CompaniesService } from '../../services/companies.service';
import { CostType } from '../../domain/enums/cost-type.enum';
import { mockCompaniesService, clearAllMocks } from './test-setup';

describe('CompaniesController - findOne', () => {
  let controller: CompaniesController;
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

    controller = module.get<CompaniesController>(CompaniesController);

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
