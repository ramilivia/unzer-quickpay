# Unzer QuickPay

A REST API service built with NestJS, TypeScript, PostgreSQL and Docker for managing companies and their pricing plans.

## Technologies Used

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **TypeORM** - Object-Relational Mapping
- **Docker** - Containerization
- **Jest** - Testing framework
- **Swagger** - API documentation

## Why NestJS? (Architecture-Focused Overview)

The decision felt very natural since I am a seasoned javascript developer and I really think NestJS it's the best available framework for backend. 

NestJS is a progressive Node.js framework that works on top of express and provides a strong architectural foundation out of the box.  It follows proven backend design practices—similar to those used in enterprise frameworks like Spring Boot—making it ideal for building scalable, maintainable, and testable server-side applications.

### Modular Architecture
NestJS organizes code using **modules**, each containing controllers, services, and providers.  
This keeps features separated, makes the project easier to navigate, and supports clear boundaries between responsibilities.

### Layered Design (Same Pattern Used in Spring Boot)
NestJS encourages a classic **Layered Architecture** (also called N-Tier), typically consisting of:

- **Controllers** — handle requests and responses  
- **Services** — contain business logic  
- **Repositories** — manage data access  

This approach provides clear separation of concerns, predictable structure, and easier testing, while laying a solid foundation for future architectural growth.

### Built-In TypeScript and Type Safety
NestJS is written in **TypeScript** and fully supports static typing.  
Benefits include:

- Strong type safety across the entire application  
- Safer refactoring and maintenance  
- Better IDE support and autocompletion  
- Fewer runtime errors thanks to early compile-time checks  

### Dependency Injection for Flexibility and Testability
NestJS uses **dependency injection (DI)** throughout the framework.  
DI makes components **loosely coupled**, allowing you to easily replace or mock dependencies during testing.  
This improves testability by enabling unit tests that focus on one class at a time without relying on real databases, services, or external APIs.

### Database Integration
NestJS has **native support for TypeORM**, making database integration simple and efficient.  
It works seamlessly with relational databases such as **PostgreSQL**, providing:

- Easy entity and repository management  
- Strong type safety for database operations  
- Automated migrations and schema synchronization  
- Clean separation between business logic and data access  

### Powerful CLI
NestJS comes with a **command-line interface (CLI)** that streamlines development by allowing you to quickly generate modules, controllers, services, and other boilerplate code.  
The CLI helps enforce project structure, reduces repetitive tasks, and accelerates onboarding for new team members.

### Support for Event-Driven and Microservices Architectures
NestJS has built-in support for event-driven workflows and **microservices**, with transport layers such as Redis, NATS, gRPC, Kafka, and RabbitMQ.  
Teams can start with a monolith and gradually adopt distributed services without major rewrites.

### Built-In Features for Common Backend Tasks
NestJS provides structured tools to handle recurring backend tasks, keeping your code organized:

- **Guards** — handle authorization  
- **Pipes** — validation and data transformation  
- **Interceptors** — logging, caching, and other cross-cutting concerns  
- **Exception Filters** — centralized error handling  
- **Middleware** — request processing extensions  

These features help separate business logic from supporting infrastructure, making the code easier to maintain and scale.

## PostgreSQL

PostgreSQL is a powerful, open-source relational database known for reliability, strong data integrity, and advanced SQL features. It supports ACID-compliant transactions, rich data types like JSON and arrays, and extensions such as PostGIS. With high performance, scalability, and seamless integration with ORMs like TypeORM, PostgreSQL provides a stable and type-safe foundation for modern backend applications built with NestJS, and it can also enable semantic search using embeddings for advanced search capabilitie

# Getting Started

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

Expected response:
```json
{
  "status": "ok",
  "message": "Server is online"
}
```

## API Documentation

Once the service is running, interactive API documentation is available via Swagger UI:

```
http://localhost:3000/api
```

## Project Structure

```
src/
├── companies/                    # Companies module
│   ├── controllers/              # Controllers layer
│   │   └── tests/                # Controller unit tests
│   ├── services/                 # Services layer (business logic)
│   │   └── tests/                # Service unit tests
│   ├── domain/                   # Domain layer
│   │   ├── entities/             # TypeORM entities
│   │   └── enums/                # Domain enumerations
│   ├── dto/                      # Data Transfer Objects
│   └── companies.module.ts       # NestJS module definition
├── seeds/                        # Database seed files
├── migrations/                   # TypeORM database migrations
├── app.module.ts                 # Root application module
├── app.controller.ts             # Health check controller
├── app.service.ts                # Health check service
├── data-source.ts                # TypeORM data source configuration
└── main.ts                       # Application entry point
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

### Database Seeding

The application supports automatic seeding on startup and manual seeding via command line.

#### Automatic Seeding (On App Startup)

To automatically seed the database when the application starts, add this to your `.env` file:

```bash
RUN_SEEDS=true
```

**Note:** Seeds only run automatically in non-production environments. They run after the app connects to the database.

#### Manual Seeding

To manually seed the database:

```bash
npm run seed:companies
```

**Important:**
- The seed script will clear all existing data before seeding (truncates tables)
- It creates 6 companies with various pricing configurations:
  - Some companies have only absolute pricings
  - Some companies have mixed absolute and relative pricings
- Make sure migrations have been run before seeding: `npm run migration:run`

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

## Accessing pgAdmin (Database Client)

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

