import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompaniesService } from '../companies.service';
import { Company } from '../../domain/entities/company.entity';
import { Pricing } from '../../domain/entities/pricing.entity';

export const mockCompanyRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

export const mockPricingRepository = {
  remove: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
};

export async function createTestingModule(): Promise<{
  module: TestingModule;
  service: CompaniesService;
}> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      CompaniesService,
      {
        provide: getRepositoryToken(Company),
        useValue: mockCompanyRepository,
      },
      {
        provide: getRepositoryToken(Pricing),
        useValue: mockPricingRepository,
      },
    ],
  }).compile();

  const service = module.get<CompaniesService>(CompaniesService);

  return { module, service };
}

export function clearAllMocks(): void {
  jest.clearAllMocks();
}
