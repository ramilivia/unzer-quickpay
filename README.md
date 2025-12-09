# Unzer QuickPay

A REST API service built with NestJS, TypeScript, and PostgreSQL for managing companies and their pricing plans.

## Prerequisites

- Docker Desktop installed and running
- Git

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd unzer-quickpay
```

### 2. Setup environment variables

Rename `.env.example` to `.env`:

```bash
cp .env.example .env
```

**⚠️ Important:** The credentials in `.env.example` are **for local development only**. Never use these credentials in production. For production environments, use proper secrets management (AWS Secrets Manager, HashiCorp Vault, etc.) and strong, randomly generated passwords.

The `.env` file contains the database configuration for local development. You can modify the values if needed for your local setup.

### 3. Start all services

```bash
docker-compose up
```

This will start:
- PostgreSQL database on port `5432`
- NestJS API on port `3000`
- pgAdmin on port `5050`

### 4. Verify the API is running

```bash
curl http://localhost:3000/
```

Expected response: `Hello World!`

## Accessing pgAdmin

**Note:** The pgAdmin credentials below are for **local development only**.

### Step 1: Open pgAdmin

Navigate to: `http://localhost:5050`

### Step 2: Login

- **Email**: `admin@admin.com`
- **Password**: `admin`

⚠️ **These are default credentials for local development. Change them in production.**

### Step 3: Add Server Connection

1. Right-click on **"Servers"** in the left sidebar
2. Select **"Register"** → **"Server..."**

3. Fill in the connection details:

   **General Tab:**
   - **Name**: `Unzer QuickPay` (or any name)

   **Connection Tab:**
   - **Host name/address**: `postgres`
   - **Port**: `5432`
   - **Maintenance database**: `unzer_quickpay` (or your `POSTGRES_DB` value)
   - **Username**: `postgres` (from your `.env` file)
   - **Password**: `postgres` (from your `.env` file)
   - ✅ Check "Save password" (optional)

⚠️ **These database credentials match your `.env` file values for local development only.**

4. Click **"Save"**

The server will appear in the left sidebar. Click on it to expand and explore the database.

## API Documentation

Once the service is running, interactive API documentation is available via Swagger UI:

```
http://localhost:3000/api
```

## Development

### Running locally (without Docker)

```bash
# Install dependencies
npm install

# Start PostgreSQL locally or use Docker only for DB
docker-compose up postgres

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Running tests

```bash
# Unit tests
npm test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Database Migrations

```bash
# Generate a new migration
# Note: Always specify the full path including src/migrations/ folder
npm run migration:generate -- src/migrations/CreateCompanyAndPricingTables

# Run pending migrations
npm run migration:run

# Revert the last executed migration
npm run migration:revert
```

**Important:**
- Migrations are stored in `src/migrations/` folder
- Always use descriptive names for migrations (e.g., `CreateCompanyAndPricingTables`)
- TypeORM will automatically add a timestamp prefix to migration files
- Migrations are tracked in the database and executed automatically in order

## Project Structure

```
src/
├── companies/           # Companies module
│   ├── dto/            # Data Transfer Objects
│   ├── entities/       # TypeORM entities
│   ├── companies.controller.ts
│   ├── companies.service.ts
│   └── companies.module.ts
├── app.module.ts       # Root module
└── main.ts            # Application entry point
```

## Docker Commands

```bash
# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Rebuild containers
docker-compose up --build
```

## Technologies Used

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **TypeORM** - Object-Relational Mapping
- **Docker** - Containerization
- **Jest** - Testing framework
- **Swagger** - API documentation

## License

[MIT licensed](LICENSE)
