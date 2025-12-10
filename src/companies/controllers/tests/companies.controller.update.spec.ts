import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { CompaniesController } from '../companies.controller';
import { CompaniesService } from '../../services/companies.service';
import { CompanyResponseDto } from '../../dto/company-response.dto';
import { mockCompaniesService, clearAllMocks } from './test-setup';

describe('CompaniesController - update', () => {
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

  describe('PATCH /companies/:id', () => {
    it('should update a company successfully', async () => {
      const updateDto = {
        name: 'Updated Company',
        country: 'Canada',
        description: 'Updated description',
      };

      const expectedResponse: CompanyResponseDto = {
        id: 1,
        name: 'Updated Company',
        country: 'Canada',
        description: 'Updated description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.update.mockResolvedValue(expectedResponse);

      await request(app.getHttpServer())
        .patch('/companies/1')
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: 1,
            name: 'Updated Company',
            country: 'Canada',
          });
        });

      expect(mockCompaniesService.update).toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const updateDto = {
        name: 'Partially Updated Company',
      };

      const expectedResponse: CompanyResponseDto = {
        id: 1,
        name: 'Partially Updated Company',
        country: 'United States',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.update.mockResolvedValue(expectedResponse);

      await request(app.getHttpServer())
        .patch('/companies/1')
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: 1,
            name: 'Partially Updated Company',
          });
        });

      expect(mockCompaniesService.update).toHaveBeenCalled();
    });

    it('should return 404 when company does not exist', async () => {
      const updateDto = {
        name: 'Updated Company',
      };

      mockCompaniesService.update.mockRejectedValue(
        new NotFoundException('Company with ID 999 not found'),
      );

      await request(app.getHttpServer())
        .patch('/companies/999')
        .send(updateDto)
        .expect(404)
        .expect((res) => {
          expect((res.body as { message: string }).message).toBe('Company with ID 999 not found');
        });

      expect(mockCompaniesService.update).toHaveBeenCalled();
    });

    it('should allow updating with pricings', async () => {
      const updateDto = {
        name: 'Updated Company',
        pricings: [
          {
            name: 'New Plan',
            cost: 149.99,
            costType: 'absolute' as const,
            isBasePlan: true,
          },
        ],
      };

      const expectedResponse: CompanyResponseDto = {
        id: 1,
        name: 'Updated Company',
        country: 'United States',
        pricings: [
          {
            id: 1,
            name: 'New Plan',
            cost: 149.99,
            costType: 'absolute' as const,
            isBasePlan: true,
            companyId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.update.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .patch('/companies/1')
        .send(updateDto)
        .expect(200);
      const body = response.body as CompanyResponseDto;

      expect(body.pricings).toHaveLength(1);
      expect(body.pricings[0].name).toBe('New Plan');
      expect(mockCompaniesService.update).toHaveBeenCalled();
    });

    it('should reject invalid id formats', async () => {
      const updateDto = {
        name: 'Updated Company',
      };

      const invalidIds = ['abc', '1.5'];

      for (const id of invalidIds) {
        await request(app.getHttpServer()).patch(`/companies/${id}`).send(updateDto).expect(400);

        expect(mockCompaniesService.update).not.toHaveBeenCalled();
      }
    });
  });

  describe('PATCH /companies/:id - validation', () => {
    it('should accept empty body for partial update', async () => {
      const expectedResponse: CompanyResponseDto = {
        id: 1,
        name: 'Company 1',
        country: 'United States',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.update.mockResolvedValue(expectedResponse);

      await request(app.getHttpServer()).patch('/companies/1').send({}).expect(200);

      expect(mockCompaniesService.update).toHaveBeenCalled();
    });

    it('should reject invalid field types', async () => {
      const invalidDtos = [
        { name: 123 }, // name not string
        { country: 123 }, // country not string
        { description: 123 }, // description not string
      ];

      for (const invalidDto of invalidDtos) {
        await request(app.getHttpServer()).patch('/companies/1').send(invalidDto).expect(400);
        expect(mockCompaniesService.update).not.toHaveBeenCalled();
      }
    });
  });
});
