import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
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

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    const companyEntity = CreateCompanyDto.toEntity(updateCompanyDto as CreateCompanyDto);
    const updatedCompany = await this.companiesService.update(id, companyEntity);
    return CompanyResponseDto.fromEntity(updatedCompany);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.companiesService.remove(id);
  }
}
