import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { seedCompaniesAndPricings } from './seed-companies-and-pricings';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production' && process.env.RUN_SEEDS === 'true') {
      console.log('🌱 Running database seeds...');
      await this.runSeeds();
    }
  }

  private async runSeeds() {
    try {
      // Run all seed functions
      await seedCompaniesAndPricings(this.dataSource);
      console.log('✅ Seeding completed!');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
    }
  }
}
