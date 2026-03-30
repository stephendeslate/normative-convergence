# MedConnect — Telehealth Booking Platform

> **Demo application — synthetic data only. Not for clinical use.**

Multi-tenant telehealth booking platform built with NestJS, Next.js, and PostgreSQL.

## Tech Stack

- **API**: NestJS 11, Prisma 6, PostgreSQL 16 (Row-Level Security)
- **Web**: Next.js 15, React 19, Tailwind CSS 4, shadcn/ui
- **Real-time**: Socket.io, Twilio Video
- **Payments**: Stripe Connect (1% platform fee)
- **Queue**: BullMQ + Redis
- **Monorepo**: Turborepo + pnpm

## Quick Start

```bash
# Prerequisites: Node 22+, pnpm 9+, Docker

# 1. Start infrastructure
docker compose -f docker-compose.dev.yml up -d

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your keys (or use defaults for local dev)

# 4. Run migrations and seed
pnpm db:migrate
pnpm db:seed

# 5. Start development
pnpm dev
```

API runs on http://localhost:3000, Web on http://localhost:3001.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.medconnect.dev | DemoPass1 |
| Provider | dr.smith@demo.medconnect.dev | DemoPass1 |
| Provider | dr.jones@demo.medconnect.dev | DemoPass1 |
| Patient | patient@demo.medconnect.dev | DemoPass1 |

## Project Structure

```
├── apps/
│   ├── api/          # NestJS API (port 3000)
│   └── web/          # Next.js frontend (port 3001)
├── packages/
│   ├── shared/       # Shared types, schemas, constants
│   └── ui/           # Shared UI components (shadcn/ui)
├── prisma/
│   ├── schema.prisma # Database schema (24 models)
│   ├── seed.ts       # Demo data seeder
│   └── migrations/   # SQL migrations + RLS policies
└── monitoring/       # Prometheus + Grafana config
```

## Architecture

- **Multi-tenancy**: Practice-level isolation via PostgreSQL Row-Level Security
- **Auth**: JWT RS256 with refresh token rotation
- **State Machine**: Appointment lifecycle (PENDING → CONFIRMED → IN_PROGRESS → COMPLETED)
- **Video**: Twilio Video rooms created on appointment confirmation
- **Payments**: Stripe PaymentIntents with platform fee calculation
