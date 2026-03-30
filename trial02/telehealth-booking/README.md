# MedConnect — Telehealth Booking Platform

Full-stack telehealth application for managing medical appointments, video consultations, and patient intake.

## Architecture

- **API**: NestJS 11, Prisma 6, PostgreSQL 16, Redis 7, BullMQ
- **Web**: Next.js 15, React 19, Tailwind CSS, Zustand
- **Shared**: Zod schemas, TypeScript types, business constants
- **Infrastructure**: Docker Compose, multi-stage Dockerfile, health checks

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9.15+
- Docker & Docker Compose

### Development Setup

```bash
# Install dependencies
pnpm install

# Start infrastructure (PostgreSQL + Redis)
docker compose -f docker-compose.dev.yml up -d

# Push database schema and seed
cd apps/api && npx prisma db push && npx prisma db seed && cd ../..

# Start all services in dev mode
pnpm dev
```

### Production Setup

```bash
# Copy and configure environment
cp .env.example .env

# Build and start all services
docker compose up -d --build

# Verify health
curl http://localhost:3000/health
```

## API Documentation

Swagger UI is available at `http://localhost:3000/api/docs` when the API is running.

## Project Structure

```
apps/
  api/          NestJS backend (port 3000)
  web/          Next.js frontend (port 3001)
packages/
  shared/       Shared types, schemas, constants
  ui/           Shared UI components
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medconnect.demo | DemoPass1 |
| Doctor | dr.smith@medconnect.demo | DemoPass1 |
| Doctor | dr.jones@medconnect.demo | DemoPass1 |
| Patient | patient@medconnect.demo | DemoPass1 |

## Environment Variables

See `.env.example` for all required and optional environment variables with descriptions.

## Testing

```bash
pnpm test          # Run all tests
pnpm test:e2e      # Run end-to-end tests
pnpm lint          # Run linting
pnpm typecheck     # Type checking
```

## License

Private — not for redistribution.
