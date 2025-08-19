### Progress

#### API
- [x] Scalable Edge API hosted on Cloudflare workers
  - [x] Hide error stacktraces in production but not in dev
- [x] Dev & Production separation
  - [x] Encrypted environment variables for secure config
  - [x] Automatic deploy to development on merge to `main` via GitHub actions
  - [x] Manual deploy to production via GitHub actions
  - [x] Deploy triggers only for changes in `packages/api` or related GitHub workflow
  - [x] Running migrations on CI for dev & prod environments
- [x] Drizzle for type-safe database access and migrations
- [x] Type-safe access to environment variables
- [ ] Unit tests & integration tests. Run locally or on CI with a real database

#### Frontend
- [x] React + TypeScript + Vite starter
- [x] Fully TypeSafe API client powered by tRPC
- [x] Dev & Production separation
  - [x] Environment variables for dev/prod. Frontend points to corresponding API environments
  - [x] Automatic deploy to development on merge to `main` via GitHub actions
  - [x] Manual deploy to production via GitHub actions
  - [x] Deploy triggers only for changes in `packages/frontend` or related GitHub workflow
- [ ] Unit tests & integration tests. Run locally or on CI

#### Shared code
- [x] Monorepo setup for easier development workflow and code reuse
- [x] Prettier setup with 2 scripts: format all files or just changed ones (for quicker runs)
- [ ] Unit tests for shared code. Run locally or on CI
