import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { CompaniesController } from '../companies.controller';
import { CompaniesService } from '../../services/companies.service';
import { UpdateCompanyDto } from '../../dto/update-company.dto';
import { CompanyResponseDto } from '../../dto/company-response.dto';
import { mockCompaniesService, clearAllMocks } from './test-setup';

describe('CompaniesController - update', () => {
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

  describe('update', () => {
    it('should update a company successfully', async () => {
      const updateCompanyDto: UpdateCompanyDto = {
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

      const result = await controller.update(1, updateCompanyDto);

      expect(mockCompaniesService.update).toHaveBeenCalledWith(1, expect.anything());
      expect(result).toEqual(expectedResponse);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Updated Company');
    });

    it('should convert DTO to entity before calling service', async () => {
      const updateCompanyDto: UpdateCompanyDto = {
        name: 'Updated Company',
      };

      const expectedResponse: CompanyResponseDto = {
        id: 1,
        name: 'Updated Company',
        country: 'United States',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.update.mockResolvedValue(expectedResponse);

      await controller.update(1, updateCompanyDto);

      expect(mockCompaniesService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: 'Updated Company',
        }),
      );
    });

    it('should handle partial updates', async () => {
      const updateCompanyDto: UpdateCompanyDto = {
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

      const result = await controller.update(1, updateCompanyDto);

      expect(mockCompaniesService.update).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      const updateCompanyDto: UpdateCompanyDto = {
        name: 'Updated Company',
      };

      mockCompaniesService.update.mockRejectedValue(
        new NotFoundException('Company with ID 999 not found'),
      );

      await expect(controller.update(999, updateCompanyDto)).rejects.toThrow(NotFoundException);
      expect(mockCompaniesService.update).toHaveBeenCalledWith(999, expect.anything());
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

    it('should reject when id is not a number', async () => {
      const updateDto = {
        name: 'Updated Company',
      };

      await request(app.getHttpServer())
        .patch('/companies/abc')
        .send(updateDto)
        .expect(400)
        .expect((res) => {
          expect((res.body as { message: string | string[] }).message).toContain(
            'Validation failed',
          );
        });

      expect(mockCompaniesService.update).not.toHaveBeenCalled();
    });

    it('should allow updating with pricings', async () => {
      const updateCompanyDto: UpdateCompanyDto = {
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

      const result = await controller.update(1, updateCompanyDto);

      expect(mockCompaniesService.update).toHaveBeenCalled();
      expect(result.pricings).toHaveLength(1);
      expect(result.pricings?.[0]?.name).toBe('New Plan');
    });
  });

  describe('ValidationPipe', () => {
    it('should pass validation with valid partial DTO', async () => {
      const validDto = {
        name: 'Updated Company',
      };

      const expectedResponse: CompanyResponseDto = {
        id: 1,
        name: 'Updated Company',
        country: 'United States',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompaniesService.update.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .patch('/companies/1')
        .send(validDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        name: 'Updated Company',
      });
      expect(mockCompaniesService.update).toHaveBeenCalled();
    });

    it('should reject when name is not a string', async () => {
      const invalidDto = {
        name: 123,
      };

      await request(app.getHttpServer()).patch('/companies/1').send(invalidDto).expect(400);

      expect(mockCompaniesService.update).not.toHaveBeenCalled();
    });

    it('should reject when country is not a string', async () => {
      const invalidDto = {
        country: 123,
      };

      await request(app.getHttpServer()).patch('/companies/1').send(invalidDto).expect(400);

      expect(mockCompaniesService.update).not.toHaveBeenCalled();
    });

    it('should reject when description is not a string', async () => {
      const invalidDto = {
        description: 123,
      };

      await request(app.getHttpServer()).patch('/companies/1').send(invalidDto).expect(400);

      expect(mockCompaniesService.update).not.toHaveBeenCalled();
    });

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
  });
});
