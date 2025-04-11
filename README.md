# @untools/ts-graphql-api

A CLI tool to scaffold a TypeScript Express MongoDB GraphQL API project quickly and efficiently.

[![npm version](https://img.shields.io/npm/v/@untools/ts-graphql-api.svg)](https://www.npmjs.com/package/@untools/ts-graphql-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

This CLI tool uses [degit](https://github.com/Rich-Harris/degit) to quickly scaffold a new TypeScript GraphQL API project with Express and MongoDB. It's a zero-configuration way to get started with a full-featured backend API.

## Features

The generated project includes:

- **TypeScript**: Strongly typed language for writing scalable and maintainable code
- **Express**: Fast, unopinionated web framework for Node.js
- **Apollo Server**: Spec-compliant GraphQL server
- **MongoDB**: Database integration using Mongoose
- **Authentication**: JWT-based authentication and Google OAuth
- **Role Management**: Role-based access control for users
- **Email Services**: Nodemailer integration for sending emails
- **API Key Management**: Secure API key generation and validation
- **Password Reset**: Secure password reset functionality
- **Environment Configuration**: `.env` file support

## Installation

```bash
# Install globally
npm install -g @untools/ts-graphql-api

# Or use with npx
npx @untools/ts-graphql-api my-api
```

## Usage

### Interactive mode (default)

```bash
@untools/ts-graphql-api my-api
```

This will prompt you for configuration options and create a new project in the `my-api` directory.

### Non-interactive mode

```bash
@untools/ts-graphql-api my-api --yes
```

This will create a new project with default settings.

### Options

- `--yes` or `-y`: Skip all prompts and use default options

## Configuration

During the interactive setup, you can configure:

- Project name
- Application port
- Whether to include Docker configuration

## Project Structure

The generated project follows this structure:

```
my-api/
├── src/
│   ├── config/                # Configuration files
│   ├── graphql/               # GraphQL type definitions and resolvers
│   │   ├── typeDefs/          # GraphQL schema definitions
│   │   ├── resolvers/         # GraphQL resolvers
│   ├── middlewares/           # Express middlewares
│   ├── models/                # Mongoose models
│   ├── services/              # Business logic and service layer
│   ├── utils/                 # Utility functions
│   ├── index.ts               # Entry point
├── .env                       # Environment variables
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project metadata and dependencies
└── [Docker files]             # Optional Docker configuration
```

## Development

To contribute to this project:

```bash
# Clone the repository
git clone https://github.com/yourusername/ts-graphql-api.git

# Install dependencies
cd ts-graphql-api
npm install

# Run in development mode
npm run dev
```

## License

MIT © Miracle Onyenma

## Acknowledgements

This project uses [miracleonyenma/express-ts-graphql-starter](https://github.com/miracleonyenma/express-ts-graphql-starter) as the template source.
