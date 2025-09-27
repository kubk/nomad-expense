FROM node:24-alpine

ARG INSTALL_DEV=false

WORKDIR /app

ENV TZ=UTC

COPY package*.json ./

RUN if [ "$INSTALL_DEV" = "true" ]; then npm ci; else npm ci --omit=dev; fi

COPY . .

EXPOSE 3094

# It's correct, new node.js can run TypeScript directly
CMD ["node", "src/index.ts"]