# NestJS PostgreSQL Project

This is a NestJS application that interacts with a PostgreSQL database using Prisma ORM. It includes several features such as RESTful API endpoints and cron jobs for scheduled tasks.
It uses the Moralis API to fetch the price of ETH and POLYGON.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Configuration](#configuration)
  - [Docker Setup](#docker-setup)
  - [Run the Application](#run-the-application)
- [Building the Project](#building-the-project)
- [API Endpoints](#api-endpoints)
- [Cron Jobs](#cron-jobs)
- [Contributing](#contributing)
- [License](#license)

## Features

- RESTful API for CRUD operations.
- Integration with PostgreSQL using Prisma.
- Three scheduled cron jobs for automated tasks:
  - **Daily Cleanup**: Removes outdated data.
  - **Weekly Summary**: Sends weekly reports via email.
  - **Monthly Statistics**: Aggregates data and generates monthly reports.

## Technologies

- [NestJS](https://nestjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/)
- [Docker](https://www.docker.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Setup

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en/) (version 16 or higher)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- A package manager like npm or yarn.

### Clone the Repository

Clone this repository to your local machine:

```bash
git clone git@github.com:affanmustafa/eth-pol-alert-tracker.git
cd eth-pol-alert-tracker
```

### Configuration

Copy the `.env.example` file to `.env` and set the appropriate values.

### Docker Setup

Run `docker compose up --build` to start the application.

### Run the Application

Run `npm run start:migrate:prod` to run the migrations and start the application.

## Building the Project

Run `npm run build` to build the project.

## API Endpoints

Check out the Swagger UI at `http://localhost:3000/api` for the full API documentation.

## Cron Jobs

These are the CRON jobs that this project runs:

- **Every 5 minutes**: Fetch the price of ETH and POLYGON and save it to the database.
- **Every 10 minutes**: Check if any alerts have been triggered and send an email if they have.
- **Every hour**: Fetch the price of ETH and POLYGON and check if the price has increased by more than 3% since the last check. If it has, send an email to the user.
- **Weekly Price Cleanup**: Runs every Sunday at midnight and removes all price records that are more than a week old.
  - **Implementation**: Located in `src/cron/price-cleanup.cron.ts`.
