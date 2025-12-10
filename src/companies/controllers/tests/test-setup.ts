import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { App } from 'supertest/types';
import { CompaniesController } from '../companies.controller';
import { CompaniesService } from '../../services/companies.service';

export const mockCompaniesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

export async function createTestingModule(): Promise<{
  module: TestingModule;
  controller: CompaniesController;
  app: INestApplication<App>;
}> {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [CompaniesController],
    providers: [
      {
        provide: CompaniesService,
        useValue: mockCompaniesService,
      },
    ],
  }).compile();

  const controller = module.get<CompaniesController>(CompaniesController);

  // Create full NestJS application for ValidationPipe tests
  const app: INestApplication<App> = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.init();

  return { module, controller, app };
}

export function clearAllMocks(): void {
  jest.clearAllMocks();
}
