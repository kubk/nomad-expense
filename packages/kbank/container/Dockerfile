# Use the official Node.js LTS image as the base image
FROM node:24-alpine

# Build argument to control if dev dependencies should be installed
ARG INSTALL_DEV=false

# Set the working directory in the container
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies conditionally
RUN if [ "$INSTALL_DEV" = "true" ]; then npm ci; else npm ci --omit=dev; fi

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3094

# New node.js can run TypeScript directly
CMD ["node", "src/index.ts"]