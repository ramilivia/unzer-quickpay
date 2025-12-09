import { Controller, Post, Get, Body, Param, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { CompanyResponseDto } from '../dto/company-response.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(
    @Body(new ValidationPipe()) createCompanyDto: CreateCompanyDto,
  ): Promise<CompanyResponseDto> {
    const companyEntity = CreateCompanyDto.toEntity(createCompanyDto);
    return this.companiesService.create(companyEntity);
  }

  @Get()
  async findAll(): Promise<CompanyResponseDto[]> {
    const companies = await this.companiesService.findAll();
    return companies.map((company) => CompanyResponseDto.fromEntity(company));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CompanyResponseDto> {
    const company = await this.companiesService.findOne(id);
    return CompanyResponseDto.fromEntity(company);
  }
}
