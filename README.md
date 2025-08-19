## Initial Setup

### Installation

- `git clone`
- `npm install`
- `cd packages/api && cp .dev.vars.example .dev.vars`
- Edit project names in `packages/api/wrangler.jsonc` and `packages/frontend/wrangler.jsonc`. For example `example-api-dev` and `example-api-prod` for API and `example-frontend-dev` and `example-frontend-prod` for frontend

### Database

#### Local & test environment

- `createdb -U <your_pg_user> <project_name>`
- `createdb -U <your_pg_user> <project_name>_test`

#### Production / Development

- Set up database here: https://console.neon.tech/

### Set up API environment variables

From the `cd packages/api` directory:

- `cp .dev.vars .env.development`
- Set `STAGE=development` and update `DATABASE_URL` in `.env.development`
- `npm run development:env:encrypt`

- `cp .dev.vars .env.production`
- Set `STAGE=production` and update `DATABASE_URL` in `.env.production`
- `npm run production:env:encrypt`

Read more about secrets here: [docs/api-secrets.md](./docs/api-secrets.md)

#### Check if it's working

- You should be able to access API via `http://localhost:8787/status`
- You should be able to run frontend & backend at the same time via `npm run start` from the project root folder
- `cd /packages/api` and deploy API to dev and prod `npx wrangler deploy --environment=development` and `npx wrangler deploy --environment=production`
- After you obtained API urls, set `VITE_API_URL` in both `packages/frontend/.env.staging` and `packages/frontend/.env.production`
- `cd /packages/frontend`, build and deploy frontend to dev and prod:
- `npm run build`
- `npx wrangler deploy --environment=development`
- `npx wrangler deploy --environment=production`

#### Drizzle

Once you set the DATABASE_URL make sure to call `npm run db:generate-migrations` to generate the initial database schema.

#### Deploy via GitHub

You'll need to set these `Repository secrets` in GitHub (https://github.com/author/repo_name/settings/secrets/actions):
- `CLOUDFLARE_API_TOKEN` - get it from Cloudflare > Profile > API Tokens. Select `Use template` next to the `Edit Cloudflare Worker` and hit create
- `CLOUDFLARE_ACCOUNT_ID` - go to your dashboard and copy the account UUID from URL
- `DOTENV_PRIVATE_KEY_DEVELOPMENT` - get it from the `.env.keys`
- `DOTENV_PRIVATE_KEY_PRODUCTION` - get it from the `.env.keys`
