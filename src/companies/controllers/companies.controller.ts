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
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CompanyResponseDto } from '../dto/company-response.dto';

@ApiTags('Companies Module')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new company and its pricing plans',
    description:
      'Creates a company with optional pricing plans. If using relative pricing (costType="relative"), at least one pricing plan must have isBasePlan=true. The base plan cost is used to calculate relative pricing costs.',
  })
  @ApiBody({ type: CreateCompanyDto })
  @ApiCreatedResponse({
    description: 'Company successfully created',
    type: CompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Validation failed. Two possible formats:\n' +
      '1) DTO validation errors (ValidationPipe): Returns array of validation messages.\n' +
      '   Example: { "statusCode": 400, "message": ["name must be a string", "name should not be empty"], "error": "Bad Request" }\n' +
      '2) Business logic errors (Service): Returns single error message.\n' +
      '   Example: { "statusCode": 400, "message": "A base plan is required when creating relative pricings", "error": "Bad Request" }',
  })
  create(
    @Body(new ValidationPipe()) createCompanyDto: CreateCompanyDto,
  ): Promise<CompanyResponseDto> {
    const companyEntity = CreateCompanyDto.toEntity(createCompanyDto);
    return this.companiesService.create(companyEntity);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies with their pricing plans' })
  @ApiOkResponse({
    description: 'List of all companies',
    type: [CompanyResponseDto],
  })
  async findAll(): Promise<CompanyResponseDto[]> {
    const companies = await this.companiesService.findAll();
    return companies.map((company) => CompanyResponseDto.fromEntity(company));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID and its pricing plans' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Company ID' })
  @ApiOkResponse({
    description: 'Company found',
    type: CompanyResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Company not found' })
  @ApiBadRequestResponse({
    description:
      'Invalid ID format. ID must be a valid integer. Returned by ParseIntPipe when ID cannot be parsed as a number. Example: { "statusCode": 400, "message": "Validation failed (numeric string is expected)", "error": "Bad Request" }',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CompanyResponseDto> {
    const company = await this.companiesService.findOne(id);
    return CompanyResponseDto.fromEntity(company);
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Update a company, including its pricing plans. You can add, update or delete pricing plans.',
    description:
      'Updates a company and its pricing plans. You can add new pricings (omit id), update existing ones (include id), or remove pricings (omit them from the array). If using relative pricing, ensure at least one pricing has isBasePlan=true.',
  })
  @ApiParam({ name: 'id', type: 'integer', description: 'Company ID' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiOkResponse({
    description: 'Company successfully updated',
    type: CompanyResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Company not found' })
  @ApiBadRequestResponse({
    description:
      'Validation failed. Three possible formats:\n' +
      '1) DTO validation errors (ValidationPipe): Returns array of validation messages.\n' +
      '   Example: { "statusCode": 400, "message": ["name must be a string"], "error": "Bad Request" }\n' +
      '2) Invalid ID format (ParseIntPipe): Returns single error message.\n' +
      '   Example: { "statusCode": 400, "message": "Validation failed (numeric string is expected)", "error": "Bad Request" }\n' +
      '3) Business logic errors (Service): Returns single error message.\n' +
      '   Example: { "statusCode": 400, "message": "A base plan is required when updating with relative pricings", "error": "Bad Request" }',
  })
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
  @ApiOperation({ summary: 'Delete a company and its pricing plans' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Company ID' })
  @ApiNoContentResponse({ description: 'Company successfully deleted' })
  @ApiNotFoundResponse({ description: 'Company not found' })
  @ApiBadRequestResponse({
    description:
      'Invalid ID format. ID must be a valid integer. Returned by ParseIntPipe when ID cannot be parsed as a number. Example: { "statusCode": 400, "message": "Validation failed (numeric string is expected)", "error": "Bad Request" }',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.companiesService.remove(id);
  }
}
