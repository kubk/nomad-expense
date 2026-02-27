# Expense Tracker

A family expense tracking app with Telegram bot integration, multi-currency support, and bank statement import.

<!-- TODO: Add screenshot -->

## Features

**Multi-Currency Accounts** — Create accounts in 33+ currencies (including BTC, ETH, USDT). All amounts auto-convert to your family's base currency using live exchange rates.

**Telegram Bot** — Log expenses on the go. Send `100 THB Coffee` and the bot parses it, picks the account, and saves the transaction. Upload bank statements directly in chat.

**Bank Statement Import** — Import PDF statements from Wise and Kasikornbank. Upload a screenshot of any statement and GPT-4 Vision extracts the transactions automatically.

**Family Sharing** — Invite family members with a one-time code. Everyone sees shared accounts, transactions, and gets Telegram notifications when someone logs an expense.

**Analytics** — Monthly expense/income breakdown, last 30 days summary, trending data, and filterable transaction history.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS v4, shadcn/ui, MobX, TanStack Query |
| Backend | tRPC on Cloudflare Workers |
| Database | PostgreSQL (Neon) with Drizzle ORM |
| Auth | Telegram OAuth + Mini App |
| AI | GPT-4 Vision for statement OCR |
| Bot | grammy.js |
| Deploy | Cloudflare Workers + Pages, GitHub Actions CI/CD |

## Project Structure

```
├── api/          # tRPC backend (Cloudflare Worker)
├── frontend/     # React SPA
├── kbank-api/    # Kasikornbank statement parser (Worker)
├── kbank-parser/ # PDF parsing server
└── docs/         # Documentation
```

## Development

See [docs/development.md](docs/development.md) for setup and run commands.
