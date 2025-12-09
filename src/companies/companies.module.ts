import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './services/companies.service';
import { CompaniesController } from './controllers/companies.controller';
import { Company } from './domain/entities/company.entity';
import { Pricing } from './domain/entities/pricing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Pricing])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
