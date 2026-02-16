# Product Features

This document outlines the key features of the expense tracker application.

## Core Functionality

### 1. User and Family Management

- **Family-centric:** The application is designed around the concept of a family unit. Users can invite family members to share and manage expenses together.
- **Invitations:** Users can invite others to their family group.
- **Notifications:** Family members can opt-in to receive notifications about new transactions within the family.

### 2. Multi-Currency Accounts

- **Multiple Accounts:** Users can create and manage multiple financial accounts.
- **Customization:** Each account can be customized with a name, color, and currency.
- **Bank Integration:** Accounts can be linked to a specific bank for statement parsing (e.g., Kasikornbank).

### 3. Transaction Tracking

- **Manual Entry:** Users can manually add transactions, specifying the description, amount, currency, and type (expense or income).
- **Automatic Conversion:** All transactions are automatically converted to a common currency (USD) for consistent reporting.
- **Countable vs. Uncountable:** Transactions can be marked as "countable" or "uncountable" for more flexible budgeting.

### 4. Statement Imports

- **Automated Imports:** Users can import bank statements to automatically add transactions to their accounts.
- **Import Rules:** The system allows for the creation of rules to categorize and process imported transactions automatically.
- **Bank-specific Parsers:** The application includes parsers for specific bank statement formats, such as Kasikornbank.

## Telegram Bot

The application includes a powerful Telegram bot that allows users to manage their expenses on the go.

- **Authentication:** The bot securely authenticates users based on their Telegram ID.
- **Quick Transaction Entry:** Users can quickly add transactions by sending a message in a natural language format (e.g., "100 THB Coffee").
- **Statement Upload:** Users can upload their bank statements directly to the bot, which then guides them through the import process.
- **Interactive Experience:** The bot uses interactive keyboards to simplify tasks like selecting an account or choosing a transaction category.
- **Stateful Conversations:** The bot can handle multi-step conversations, such as asking for a transaction description after an amount has been provided.

## Web Application (Frontend)

The web application provides a comprehensive interface for managing finances.

- **Dashboard:** A central dashboard provides an overview of the user's financial situation.
- **Account Management:** A dedicated section for managing accounts, viewing balances, and transaction history.
- **Family Management:** An interface for inviting and managing family members.
- **Analytics:** A detailed monthly breakdown of income and expenses, allowing users to analyze their spending habits.
- **User Profile:** A user menu provides access to account settings, support, and logout functionality.
- **Responsive Design:** The application is fully responsive and optimized for both desktop and mobile devices.
