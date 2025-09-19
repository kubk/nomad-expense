# Use the official Node.js LTS image as the base image
FROM node:24-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3094

# Define the command to run the application
CMD ["node", "src/index.ts"]