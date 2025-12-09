import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Company } from '../companies/domain/entities/company.entity';
import { Pricing } from '../companies/domain/entities/pricing.entity';
import { CostType } from '../companies/domain/enums/cost-type.enum';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT ?? '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Company, Pricing],
});

async function seed() {
  await dataSource.initialize();

  const companyRepository = dataSource.getRepository(Company);
  const pricingRepository = dataSource.getRepository(Pricing);

  // Clear existing data
  await pricingRepository.delete({});
  await companyRepository.delete({});

  // Create companies with pricings
  const company1 = companyRepository.create({
    name: 'Acme Corporation',
    country: 'United States',
    description: 'Leading software company',
    address: '123 Tech Street, San Francisco, CA',
    phone: '+1-555-0100',
  });
  await companyRepository.save(company1);

  const company1Pricing1 = pricingRepository.create({
    name: 'Basic Plan',
    description: 'Perfect for small teams',
    cost: 99.99,
    costType: CostType.ABSOLUTE,
    isBasePlan: true,
    companyId: company1.id,
  });
  await pricingRepository.save(company1Pricing1);

  const company1Pricing2 = pricingRepository.create({
    name: 'Pro Plan',
    description: 'For growing businesses',
    cost: 1.5,
    costType: CostType.RELATIVE,
    isBasePlan: false,
    companyId: company1.id,
  });
  await pricingRepository.save(company1Pricing2);

  const company2 = companyRepository.create({
    name: 'Global Solutions Ltd',
    country: 'United Kingdom',
    description: 'International consulting firm',
    address: '456 Business Ave, London',
    phone: '+44-20-5555-0100',
  });
  await companyRepository.save(company2);

  const company2Pricing1 = pricingRepository.create({
    name: 'Starter',
    description: 'Entry level package',
    cost: 149.99,
    costType: CostType.ABSOLUTE,
    isBasePlan: true,
    companyId: company2.id,
  });
  await pricingRepository.save(company2Pricing1);

  console.log('✅ Database seeded successfully!');
  console.log(`   - Created ${await companyRepository.count()} companies`);
  console.log(`   - Created ${await pricingRepository.count()} pricings`);

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
