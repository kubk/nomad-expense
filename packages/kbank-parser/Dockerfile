FROM node:24-alpine

ARG INSTALL_DEV=false

WORKDIR /app

ENV TZ=UTC

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/kbank-parser/package.json ./packages/kbank-parser/package.json

RUN corepack enable && if [ "$INSTALL_DEV" = "true" ]; then pnpm install --filter kbank-parser --frozen-lockfile; else pnpm install --filter kbank-parser --prod --frozen-lockfile; fi

COPY packages/kbank-parser ./packages/kbank-parser

WORKDIR /app/packages/kbank-parser

EXPOSE 3094

# It's correct, new node.js can run TypeScript directly
CMD ["node", "src/index.ts"]
