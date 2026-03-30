# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-01-20

### Added
- Multi-tenant practice management with tenant isolation
- Stripe payment integration for appointment billing
- Admin dashboard with audit log viewer
- Video session recording consent workflow

### Changed
- Upgraded Prisma to v6 with improved query performance
- Migrated to NestJS 11 module system

### Fixed
- Race condition in concurrent appointment booking (overlap check)
- WebSocket reconnection logic during network interruptions

## [0.2.0] - 2026-01-10

### Added
- Real-time video consultations via WebRTC/LiveKit
- Appointment scheduling with provider availability
- JWT authentication with role-based access control
- In-app messaging between patients and providers

### Security
- Added helmet middleware for HTTP security headers
- Implemented rate limiting on authentication endpoints

## [0.1.0] - 2026-01-05

### Added
- Initial project scaffolding with Turborepo
- NestJS API with PostgreSQL and Prisma ORM
- Next.js web application with Tailwind CSS
- Docker Compose development environment
- Health check endpoints and Prometheus metrics
