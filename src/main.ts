import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Companies API')
    .setDescription(
      'REST API for managing companies and their pricing plans.\n\n' +
        '**Pricing Types:**\n' +
        '- **Absolute Pricing**: The cost represents a fixed amount (e.g., $99.99)\n' +
        '- **Relative Pricing**: The cost represents a percentage or multiplier relative to a base plan. For example:\n' +
        '  - If base plan costs $100 and a relative plan has cost 0.8, the calculated price is $80 (80% of base)\n' +
        '  - If base plan costs $100 and a relative plan has cost 1.5, the calculated price is $150 (150% of base)\n' +
        '  - Relative pricing requires at least one pricing plan with `isBasePlan: true`\n' +
        '  - The `cost` field in relative pricing stores the multiplier/percentage as a decimal (e.g., 0.8 for 80%, 1.2 for 120%)',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

(async () => {
  try {
    await bootstrap();
  } catch (error) {
    console.error('Error starting the application:', error);
    process.exit(1);
  }
})();
