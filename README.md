# @untools/starter

A powerful CLI tool to scaffold production-ready TypeScript projects with GraphQL, Express, MongoDB, and Next.js.

[![npm version](https://img.shields.io/npm/v/@untools/starter.svg)](https://www.npmjs.com/package/@untools/starter)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dt/@untools/starter.svg)](https://www.npmjs.com/package/@untools/starter)

## 🚀 Overview

**@untools/starter** helps you jump-start development by quickly scaffolding fully-configured TypeScript projects with modern stack technologies. Choose between:

- **API**: Robust GraphQL API powered by Express and MongoDB
- **Frontend**: Feature-rich Next.js frontend with authentication and GraphQL client
- **Fullstack**: Integrated API and frontend combo with preconfigured connections

Skip the hours of project setup and dive straight into building what matters.

## ✨ Features

### Backend API Features

- **TypeScript**: Full type safety with modern TypeScript configuration
- **Express & Apollo Server**: Industry-standard GraphQL server setup
- **MongoDB Integration**: Preconfigured with Mongoose models and connections
- **Authentication System**: Complete JWT-based auth with refresh tokens
- **OAuth Integration**: Ready-to-use Google authentication flow
- **Role-Based Access Control**: Built-in user permission system
- **Email Services**: Integrated Nodemailer and optional Resend.com support
- **API Key Management**: Secure key generation and validation system
- **Password Reset Flow**: Complete secure reset functionality
- **Web Push Notifications**: VAPID key generation and notification endpoints
- **Payment Gateway**: Optional payment processing integration
- **AI Ready**: Optional Google Gemini AI API configuration
- **Smart Port Allocation**: Consistent project-specific ports via [@untools/port-gen](https://www.npmjs.com/package/@untools/port-gen)
- **Container Ready**: Optional Docker and docker-compose configurations
- **Environment Setup**: Automatically configured `.env` files with secure generated secrets

### Frontend Features

- **Next.js 15**: Modern React with App Router architecture
- **TypeScript**: End-to-end type safety with GraphQL codegen
- **Authentication UI**: Complete login/signup flows and protected routes
- **Responsive Design**: Mobile-friendly layouts using Tailwind CSS
- **State Management**: Preconfigured global state with Zustand
- **File Uploads**: Optional Cloudinary media integration
- **Push Notifications**: Browser notification support
- **GraphQL Client**: Apollo Client with automatic type generation

### Fullstack Setup

- **Monorepo Configuration**: Preconfigured workspace for simultaneous development
- **Connected Services**: API and frontend pre-wired to work together
- **Unified Commands**: Single command to run both services
- **Type Sharing**: Full type safety between backend and frontend

## 📦 Installation

```bash
# Install globally
npm install -g @untools/starter

# Or use with npx (no installation needed)
npx @untools/starter my-project
```

## 🛠️ Usage

### Interactive Mode

```bash
# Create an API project
@untools/starter starter --type api

# Create a Next.js frontend
@untools/starter my-client --type frontend

# Create a full-stack project
@untools/starter my-app --type fullstack
```

The CLI will guide you through configuration options with interactive prompts.

### Quick Start Mode

```bash
# Create with default settings
@untools/starter my-project --type api --yes
@untools/starter my-project --type frontend --yes
@untools/starter my-project --type fullstack --yes
```

### Command Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--type` | `-t` | Project type: `api`, `frontend`, or `fullstack` | `api` |
| `--yes` | `-y` | Skip all prompts and use defaults | `false` |

## ⚙️ Configuration Options

The interactive setup offers extensive customization:

### API Project Options

- **Basic Configuration**:
  - Application name and port
  - Docker integration toggle

- **Feature Selection**:
  - MongoDB database configuration
  - Email service integration
  - Google OAuth authentication
  - Payment gateway services
  - Google Gemini AI integration
  - Web Push notification support

### Frontend Project Options

- **API Connectivity**:
  - GraphQL API URL configuration
  - API key generation

- **Service Integration**:
  - Cloudinary for media uploads
  - Google OAuth credentials
  - Web Push notifications setup

### Fullstack Project Options

All of the above options plus integrated workspace configuration.

## 🔐 Security Features

@untools/starter automatically generates:

- Cryptographically secure random tokens for JWT authentication
- Webhook signature verification secrets
- API keys with secure generation patterns
- VAPID public/private keypairs for Push API
- Session secrets for Next.js
- MongoDB connection strings

## 🏗️ Generated Project Structure

### API Project

```bash
starter/
├── src/
│   ├── config/               # Configuration management
│   ├── graphql/              # GraphQL schema and resolvers
│   │   ├── typeDefs/         # GraphQL type definitions
│   │   ├── resolvers/        # GraphQL resolvers
│   ├── middlewares/          # Express middleware functions
│   ├── models/               # Mongoose data models
│   ├── services/             # Business logic layer
│   ├── utils/                # Helper functions
│   ├── index.ts              # Application entry point
├── .env                      # Environment variables (pre-configured)
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
├── README.md                 # Generated documentation
└── [Docker files]            # Optional Docker configuration
```

### Frontend Project

```bash
starter/
├── app/                      # Next.js App Router structure
├── components/               # Reusable UI components
├── lib/                      # Utility functions and hooks
├── graphql/                  # GraphQL queries and mutations
├── styles/                   # Global CSS and Tailwind config
├── public/                   # Static assets
├── .env.local                # Environment configuration
├── codegen.ts                # GraphQL code generation config
├── package.json              # Dependencies and scripts
└── README.md                 # Generated documentation
```

### Fullstack Project

```bash
starter/
├── my-app-api/               # API project (structure as above)
├── my-app-client/            # Frontend project (structure as above)
├── package.json              # Workspace configuration
└── README.md                 # Project documentation
```

## 🧠 Philosophy

@untools/starter follows these principles:

1. **Zero Configuration**: Works out of the box with sensible defaults
2. **Full Flexibility**: Extensive customization when you need it
3. **Production Ready**: Security-focused with best practices built in
4. **Developer Experience**: Optimized for rapid development and maintenance

## 🤝 Contributing

Contributions are welcome! To contribute:

```bash
# Clone the repository
git clone https://github.com/miracleonyenma/untools-starter.git

# Install dependencies
cd untools-starter
npm install

# Run in development mode
npm run dev
```

## 📄 License

MIT © Miracle Onyenma

## 🙏 Acknowledgements

This project uses:

- [miracleonyenma/express-ts-graphql-starter](https://github.com/miracleonyenma/express-ts-graphql-starter) as the API template
- [miracleonyenma/nextjs-starter-client](https://github.com/miracleonyenma/nextjs-starter-client) for the Next.js template
- [@untools/port-gen](https://www.npmjs.com/package/@untools/port-gen) for consistent port allocation
- [degit](https://github.com/Rich-Harris/degit) for template scaffolding
