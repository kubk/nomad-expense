<h1 align="center">Nomad Expense</h1>

<p align="center">
  <img src="docs/expense-preview.png" alt="Nomad Expense" width="700" />
</p>

<p align="center">
  Family expense tracker as a Telegram mini app&nbsp;·&nbsp;<a href="https://t.me/expense_tracker_turkey_bot">Try it</a>
</p>

## Features

💱 **Multi-Currency Accounts** — Create accounts in multiple currencies (including crypto). All amounts auto-convert to your family's base currency using live exchange rates.

🤖 **Telegram Bot** — Log expenses on the go. Send `100 THB Coffee` and the bot parses it, picks the account, and saves the transaction. Upload bank statements directly in chat.

🏦 **Bank Statement Import** — Import PDF bank statements. Upload a screenshot of any statement and GPT-4 Vision extracts the transactions automatically.

👨‍👩‍👧‍👦 **Family Sharing** — Invite family members. Everyone sees shared accounts, transactions, and gets Telegram notifications when someone logs an expense.

📊 **Analytics** — Monthly expense/income breakdown, last 30 days summary, trending data, and filterable transaction history.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS v4, shadcn/ui, MobX, TanStack Query |
| Backend | tRPC on Cloudflare Workers |
| Database | PostgreSQL with Drizzle ORM |
| Auth | Telegram OAuth + Mini App |
| AI | GPT-4 Vision for statement OCR |
| Bot | grammy.js |
| Deploy | Cloudflare Workers, GitHub Actions CI/CD |

