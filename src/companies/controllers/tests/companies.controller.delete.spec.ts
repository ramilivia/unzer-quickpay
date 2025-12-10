import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { CompaniesController } from '../companies.controller';
import { CompaniesService } from '../../services/companies.service';
import { mockCompaniesService, clearAllMocks } from './test-setup';

describe('CompaniesController - delete', () => {
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

  describe('remove', () => {
    it('should delete a company successfully', async () => {
      mockCompaniesService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockCompaniesService.remove).toHaveBeenCalledWith(1);
    });

    it('should return 204 No Content on successful deletion', async () => {
      mockCompaniesService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/companies/1').expect(204);

      expect(mockCompaniesService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when company does not exist', async () => {
      mockCompaniesService.remove.mockRejectedValue(
        new NotFoundException('Company with ID 999 not found'),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockCompaniesService.remove).toHaveBeenCalledWith(999);
    });

    it('should return 404 when company does not exist', async () => {
      mockCompaniesService.remove.mockRejectedValue(
        new NotFoundException('Company with ID 999 not found'),
      );

      await request(app.getHttpServer())
        .delete('/companies/999')
        .expect(404)
        .expect((res) => {
          expect((res.body as { message: string }).message).toBe('Company with ID 999 not found');
        });

      expect(mockCompaniesService.remove).toHaveBeenCalledWith(999);
    });

    it('should reject when id is not a number', async () => {
      await request(app.getHttpServer())
        .delete('/companies/abc')
        .expect(400)
        .expect((res) => {
          expect((res.body as { message: string | string[] }).message).toContain(
            'Validation failed',
          );
        });

      expect(mockCompaniesService.remove).not.toHaveBeenCalled();
    });

    it('should reject when id is a decimal number', async () => {
      await request(app.getHttpServer()).delete('/companies/1.5').expect(400);

      expect(mockCompaniesService.remove).not.toHaveBeenCalled();
    });
  });

  describe('ParseIntPipe for remove route parameter', () => {
    it('should validate id parameter and return 400 for non-numeric id', async () => {
      await request(app.getHttpServer()).delete('/companies/invalid').expect(400);

      expect(mockCompaniesService.remove).not.toHaveBeenCalled();
    });

    it('should accept valid numeric id', async () => {
      mockCompaniesService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/companies/1').expect(204);

      expect(mockCompaniesService.remove).toHaveBeenCalledWith(1);
    });
  });
});
