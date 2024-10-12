# Use the official Node.js image
FROM node:20.11.1-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./


# Install dependencies
RUN npm cache clean --force
RUN npm install

# Copy the rest of the application files
COPY . .

# Copy the wait-for-postgres script
# COPY wait-for-postgres.sh .
# RUN chmod +x wait-for-postgres.sh

# Generate the Prisma client
RUN npx prisma generate

# Expose the port your app runs on
EXPOSE 3000


