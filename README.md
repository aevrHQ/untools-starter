# @untools/starter

A CLI tool to scaffold a TypeScript Express MongoDB GraphQL API project quickly and efficiently.

[![npm version](https://img.shields.io/npm/v/@untools/starter.svg)](https://www.npmjs.com/package/@untools/starter)
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
- **Email Services**: Nodemailer integration for sending emails (with optional Resend.com support)
- **API Key Management**: Secure API key generation and validation
- **Password Reset**: Secure password reset functionality
- **Environment Configuration**: `.env` file support with auto-generated secrets
- **Smart Port Assignment**: Automatically generates a consistent, project-name-based port number using [`@untools/port-gen`](https://www.npmjs.com/package/@untools/port-gen)
- **Web Push Notifications**: Optional VAPID key generation for web push support
- **Payment Integration**: Optional support for payment gateway integration
- **AI Integration**: Optional Google Gemini AI API integration

## Installation

```bash
# Install globally
npm install -g @untools/starter

# Or use with npx
npx @untools/starter starter
```

## Usage

### Interactive mode (default)

```bash
@untools/starter starter
```

This will prompt you for configuration options and create a new project in the `starter` directory.

### Non-interactive mode

```bash
@untools/starter starter --yes
```

This will create a new project with default settings.

### Options

- `--yes` or `-y`: Skip all prompts and use default options

## Configuration

During the interactive setup, you can configure:

### Basic Configuration

- Project name
- Application port
- Whether to include Docker configuration

### Feature Selection

- MongoDB integration
- Email service integration
- Google OAuth integration
- Payment gateway integration
- Google Gemini AI integration
- Web Push notifications support

### Auto-generated Security

The CLI automatically generates:

- Secure random tokens for JWT authentication (ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET)
- Webhook secret key (WEBHOOK_SECRET)
- VAPID keys for Web Push notifications (if selected)
- Default MongoDB URI based on project name

## Project Structure

The generated project follows this structure:

```bash
starter/
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
├── .env                       # Environment variables (pre-configured based on selections)
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project metadata and dependencies
├── README.md                  # Custom project documentation
└── [Docker files]             # Optional Docker configuration
```

## Development

To contribute to this project:

```bash
# Clone the repository
git clone https://github.com/yourusername/starter.git

# Install dependencies
cd starter
npm install

# Run in development mode
npm run dev
```

## License

MIT © Miracle Onyenma

## Acknowledgements

This project uses [miracleonyenma/express-ts-graphql-starter](https://github.com/miracleonyenma/express-ts-graphql-starter) as the template source.
