import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  create(createCompanyDto: CreateCompanyDto) {
    return `This action adds a new company with ${JSON.stringify(createCompanyDto)}`;
  }

  findAll() {
    return `This action returns all companies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return `This action updates a #${id} company with ${JSON.stringify(updateCompanyDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} company`;
  }
}
