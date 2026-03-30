# Contributing to MedConnect Telehealth

## Development Setup

1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```
2. Copy `.env.example` to `.env` and configure your local environment variables.
3. Start infrastructure services:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```
4. Run database migrations:
   ```bash
   pnpm turbo run db:migrate
   ```
5. Seed the database (optional):
   ```bash
   pnpm turbo run db:seed
   ```

## Running Tests

- Run all tests: `pnpm turbo run test`
- Run tests for a specific package: `pnpm --filter @medconnect/api test`
- Run linting: `pnpm turbo run lint`

## Pull Request Process

1. Create a feature branch from `develop` (e.g., `feature/add-video-recording`).
2. Write tests for any new functionality. Ensure all existing tests pass.
3. Update documentation if your change affects API contracts or environment variables.
4. Open a pull request against `develop`. Include a clear description of the change and link any related issues.
5. At least one approval is required before merging.
6. Squash-merge into `develop`; the CI pipeline must be green.

## Code Style

- Follow the existing ESLint and Prettier configuration.
- Use conventional commit messages (e.g., `feat:`, `fix:`, `chore:`).
- Keep functions small and well-documented with JSDoc where appropriate.
