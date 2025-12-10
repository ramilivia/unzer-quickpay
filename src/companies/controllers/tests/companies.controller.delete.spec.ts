import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { CompaniesController } from '../companies.controller';
import { CompaniesService } from '../../services/companies.service';
import { mockCompaniesService, clearAllMocks } from './test-setup';

describe('CompaniesController - delete', () => {
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

  describe('DELETE /companies/:id', () => {
    it('should return 204 No Content on successful deletion', async () => {
      mockCompaniesService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/companies/1').expect(204);

      expect(mockCompaniesService.remove).toHaveBeenCalledWith(1);
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

    it('should reject invalid id formats', async () => {
      const invalidIds = ['abc', '1.5', 'invalid'];

      for (const id of invalidIds) {
        await request(app.getHttpServer()).delete(`/companies/${id}`).expect(400);

        expect(mockCompaniesService.remove).not.toHaveBeenCalled();
      }
    });
  });
});
