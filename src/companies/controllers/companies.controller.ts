import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto } from '../dto/create-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body(new ValidationPipe()) createCompanyDto: CreateCompanyDto) {
    const companyEntity = CreateCompanyDto.toEntity(createCompanyDto);
    return this.companiesService.create(companyEntity);
  }
}
