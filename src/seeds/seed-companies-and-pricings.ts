import { DataSource } from 'typeorm';
import { Company } from '../companies/domain/entities/company.entity';
import { Pricing } from '../companies/domain/entities/pricing.entity';
import { CostType } from '../companies/domain/enums/cost-type.enum';
import dataSource from '../data-source';

export async function seedCompaniesAndPricings(dataSource?: DataSource) {
  const connection = dataSource || (await initializeDataSource());

  const companyRepository = connection.getRepository(Company);
  const pricingRepository = connection.getRepository(Pricing);

  await connection.query('TRUNCATE TABLE pricings CASCADE');
  await connection.query('TRUNCATE TABLE companies CASCADE');

  // Company 1: Acme Corporation
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

  const company1Pricing3 = pricingRepository.create({
    name: 'Enterprise Plan',
    description: 'Full-scale solution for large organizations',
    cost: 2.5,
    costType: CostType.RELATIVE,
    isBasePlan: false,
    companyId: company1.id,
  });
  await pricingRepository.save(company1Pricing3);

  // Company 2: Global Solutions Ltd
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

  const company2Pricing2 = pricingRepository.create({
    name: 'Professional',
    description: 'Advanced features',
    cost: 1.8,
    costType: CostType.RELATIVE,
    isBasePlan: false,
    companyId: company2.id,
  });
  await pricingRepository.save(company2Pricing2);

  const company2Pricing3 = pricingRepository.create({
    name: 'Enterprise',
    description: 'Full featured solution',
    cost: 2.0,
    costType: CostType.RELATIVE,
    isBasePlan: false,
    companyId: company2.id,
  });
  await pricingRepository.save(company2Pricing3);

  const company2Pricing4 = pricingRepository.create({
    name: 'Ultimate',
    description: 'Complete enterprise solution',
    cost: 3.0,
    costType: CostType.RELATIVE,
    isBasePlan: false,
    companyId: company2.id,
  });
  await pricingRepository.save(company2Pricing4);

  // Company 3: Tech Innovations Inc
  const company3 = companyRepository.create({
    name: 'Tech Innovations Inc',
    country: 'Canada',
    description: 'Cutting-edge technology provider',
    address: '789 Innovation Drive, Toronto, ON',
    phone: '+1-416-555-0200',
  });
  await companyRepository.save(company3);

  const company3Pricing1 = pricingRepository.create({
    name: 'Standard',
    description: 'Essential features',
    cost: 79.99,
    costType: CostType.ABSOLUTE,
    isBasePlan: true,
    companyId: company3.id,
  });
  await pricingRepository.save(company3Pricing1);

  const company3Pricing2 = pricingRepository.create({
    name: 'Premium',
    description: 'Advanced features',
    cost: 149.99,
    costType: CostType.ABSOLUTE,
    isBasePlan: false,
    companyId: company3.id,
  });
  await pricingRepository.save(company3Pricing2);

  const company3Pricing3 = pricingRepository.create({
    name: 'Enterprise',
    description: 'Full enterprise solution',
    cost: 299.99,
    costType: CostType.ABSOLUTE,
    isBasePlan: false,
    companyId: company3.id,
  });
  await pricingRepository.save(company3Pricing3);

  // Company 4: Digital Dynamics
  const company4 = companyRepository.create({
    name: 'Digital Dynamics',
    country: 'Germany',
    description: 'Digital transformation specialists',
    address: '321 Digital Way, Berlin',
    phone: '+49-30-5555-0300',
  });
  await companyRepository.save(company4);

  const company4Pricing1 = pricingRepository.create({
    name: 'Foundation',
    description: 'Core services package',
    cost: 199.99,
    costType: CostType.ABSOLUTE,
    isBasePlan: true,
    companyId: company4.id,
  });
  await pricingRepository.save(company4Pricing1);

  const company4Pricing2 = pricingRepository.create({
    name: 'Advanced',
    description: 'Extended capabilities',
    cost: 349.99,
    costType: CostType.ABSOLUTE,
    isBasePlan: false,
    companyId: company4.id,
  });
  await pricingRepository.save(company4Pricing2);

  const company4Pricing3 = pricingRepository.create({
    name: 'Enterprise Plus',
    description: 'Maximum performance package',
    cost: 549.99,
    costType: CostType.ABSOLUTE,
    isBasePlan: false,
    companyId: company4.id,
  });
  await pricingRepository.save(company4Pricing3);

  // Company 5: Cloud Services Co
  const company5 = companyRepository.create({
    name: 'Cloud Services Co',
    country: 'Australia',
    description: 'Cloud infrastructure experts',
    address: '654 Cloud Boulevard, Sydney',
    phone: '+61-2-5555-0400',
  });
  await companyRepository.save(company5);

  const company5Pricing1 = pricingRepository.create({
    name: 'Essentials',
    description: 'Basic cloud services',
    cost: 129.99,
    costType: CostType.ABSOLUTE,
    isBasePlan: true,
    companyId: company5.id,
  });
  await pricingRepository.save(company5Pricing1);

  const company5Pricing2 = pricingRepository.create({
    name: 'Business',
    description: 'Complete business solution',
    cost: 1.75,
    costType: CostType.RELATIVE,
    isBasePlan: false,
    companyId: company5.id,
  });
  await pricingRepository.save(company5Pricing2);

  const company5Pricing3 = pricingRepository.create({
    name: 'Enterprise',
    description: 'Large scale deployment',
    cost: 2.25,
    costType: CostType.RELATIVE,
    isBasePlan: false,
    companyId: company5.id,
  });
  await pricingRepository.save(company5Pricing3);

  // Company 6: Future Systems
  const company6 = companyRepository.create({
    name: 'Future Systems',
    country: 'Japan',
    description: 'Next-generation software solutions',
    address: '987 Future Plaza, Tokyo',
    phone: '+81-3-5555-0500',
  });
  await companyRepository.save(company6);

  const company6Pricing1 = pricingRepository.create({
    name: 'Basic',
    description: 'Starter package',
    cost: 89.99,
    costType: CostType.ABSOLUTE,
    isBasePlan: true,
    companyId: company6.id,
  });
  await pricingRepository.save(company6Pricing1);

  const company6Pricing2 = pricingRepository.create({
    name: 'Professional',
    description: 'Professional tier',
    cost: 179.99,
    costType: CostType.ABSOLUTE,
    isBasePlan: false,
    companyId: company6.id,
  });
  await pricingRepository.save(company6Pricing2);

  const company6Pricing3 = pricingRepository.create({
    name: 'Enterprise',
    description: 'Enterprise level solution',
    cost: 349.99,
    costType: CostType.ABSOLUTE,
    isBasePlan: false,
    companyId: company6.id,
  });
  await pricingRepository.save(company6Pricing3);

  console.log('✅ Database seeded successfully!');
  console.log(`   - Created ${await companyRepository.count()} companies`);
  console.log(`   - Created ${await pricingRepository.count()} pricings`);
}

async function initializeDataSource() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

// Allow running directly via ts-node
if (require.main === module) {
  seedCompaniesAndPricings()
    .then(async () => {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error seeding database:', error);
      process.exit(1);
    });
}
