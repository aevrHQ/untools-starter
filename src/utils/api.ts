// ./src/utils/api.ts

import inquirer from "inquirer";
import chalk from "chalk";
import degit from "degit";
import path from "path";
import fs from "fs";
import { generatePortFromName } from "@untools/port-gen";
import { DEFAULT_NAME, generateSecureKey, generateVapidKeys } from "..";
import { PackageJson, ProjectOptions } from "../types/index";

async function createApiProject(
  projectDirectory: string = DEFAULT_NAME,
  options?: { yes?: boolean },
  baseOptions?: Partial<ProjectOptions>
) {
  // If no directory is provided, prompt for it
  if (!projectDirectory && !options?.yes) {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectDirectory",
        message: "What is the name of your project?",
        default: ".",
      },
    ]);
    projectDirectory = answers.projectDirectory || ".";
  } else if (!projectDirectory) {
    projectDirectory = ".";
  }

  const targetDir =
    projectDirectory === "."
      ? process.cwd()
      : path.join(process.cwd(), projectDirectory);

  console.log(
    chalk.blue(`Creating a new TypeScript GraphQL API in ${targetDir}...`)
  );

  // Check if directory exists
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.log(chalk.red("Error: Directory already exists and is not empty"));
    process.exit(1);
  }

  // Determine the actual project name
  const actualProjectName =
    projectDirectory === "." ? path.basename(process.cwd()) : projectDirectory;

  // Additional configuration if not using default options
  let projectOptions: ProjectOptions = {
    appName: actualProjectName,
    appPort: generatePortFromName(actualProjectName).toString(),
    includeDocker: true,
    database: "mongodb",
    includeDbDocker: false, // Docker container for the selected database
    includeEmail: true,
    includeOAuth: true,
    includePayments: false,
    includeGemini: false,
    includeWebPush: true,
  };

  // Merge in any base options provided
  if (baseOptions) {
    projectOptions = {
      ...projectOptions,
      ...baseOptions,
      // Ensure appName is never undefined
      appName: baseOptions.appName || projectDirectory,
    };
  }

  if (!options?.yes) {
    // First set of basic config options
    const basicConfigAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "appName",
        message: "What is your application name?",
        default: actualProjectName,
      },
      {
        type: "input",
        name: "appPort",
        message: "Which port should the server run on?",
        default: projectOptions.appPort,
        validate: (input) => !isNaN(Number(input)) || "Port must be a number",
      },
      {
        type: "confirm",
        name: "includeDocker",
        message: "Include Docker configuration?",
        default: true,
      },
    ]);

    // Update the options with basic config
    projectOptions = { ...projectOptions, ...basicConfigAnswers };

    // Second set of feature selection questions
    const featureAnswers = await inquirer.prompt([
      {
        type: "list",
        name: "database",
        message: "Which database would you like to use?",
        choices: [
          { name: "MongoDB", value: "mongodb" },
          { name: "PostgreSQL", value: "postgres" },
        ],
        default: "mongodb",
      },
      {
        type: "confirm",
        name: "includeDbDocker",
        message: (answers) =>
          `Include ${
            answers.database === "mongodb" ? "MongoDB" : "PostgreSQL"
          } Docker container? (Recommended for development)`,
        default: (answers) =>
          projectOptions.includeDocker && answers.database === "mongodb",
        when: (answers) => projectOptions.includeDocker,
      },
      {
        type: "confirm",
        name: "includeEmail",
        message: "Include email service configuration?",
        default: true,
      },
      {
        type: "confirm",
        name: "includeOAuth",
        message: "Include Google OAuth configuration?",
        default: true,
      },
      {
        type: "confirm",
        name: "includePayments",
        message: "Include payment gateway configuration?",
        default: false,
      },
      {
        type: "confirm",
        name: "includeGemini",
        message: "Include Google Gemini AI API configuration?",
        default: false,
      },
      {
        type: "confirm",
        name: "includeWebPush",
        message: "Include Web Push notifications configuration?",
        default: true,
      },
    ]);

    // Update with feature selections
    projectOptions = { ...projectOptions, ...featureAnswers };
  }

  try {
    console.log(chalk.yellow("Downloading starter template..."));

    // Use degit to clone the template
    // Use degit to clone the template
    const templateRepo =
      projectOptions.database === "postgres"
        ? "aevrHQ/express-ts-postgres-graphql-starter"
        : "miracleonyenma/express-ts-graphql-starter";

    const emitter = degit(templateRepo, {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(targetDir);

    // Customize package.json
    const pkgPath = path.join(targetDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as PackageJson;
    pkg.name = actualProjectName;
    pkg.version = "0.1.0";
    pkg.description = `API generated from @untools/starter`;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    // Create or modify docker-compose.yml if Docker is included
    if (projectOptions.includeDocker) {
      await createDockerCompose(targetDir, projectOptions);
    }

    // Create or modify .env file
    const envPath = path.join(targetDir, ".env.example");
    const envTargetPath = path.join(targetDir, ".env");

    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf8");

      // Generate secrets and keys
      const accessTokenSecret = generateSecureKey();
      const refreshTokenSecret = generateSecureKey();
      const webhookSecret = generateSecureKey();

      // Set Database URI based on Docker option
      let dbUri = "";
      if (projectOptions.database === "mongodb") {
        if (projectOptions.includeDbDocker) {
          dbUri = `mongodb://mongo:27017/${projectOptions.appName
            .toLowerCase()
            .replace(/\s+/g, "-")}`;
        } else {
          dbUri = `mongodb://localhost:27017/${projectOptions.appName
            .toLowerCase()
            .replace(/\s+/g, "-")}`;
        }
      } else if (projectOptions.database === "postgres") {
        const dbName = projectOptions.appName
          .toLowerCase()
          .replace(/\s+/g, "_");
        if (projectOptions.includeDbDocker) {
          dbUri = `postgresql://postgres:postgres@postgres:5432/${dbName}`;
        } else {
          dbUri = `postgresql://postgres:postgres@localhost:5432/${dbName}`;
        }
      }

      // Generate VAPID keys if web push is included
      let vapidPublicKey = "";
      let vapidPrivateKey = "";
      if (projectOptions.includeWebPush) {
        console.log(chalk.yellow("Generating VAPID keys for Web Push..."));
        const vapidKeys = await generateVapidKeys();
        vapidPublicKey = vapidKeys.publicKey;
        vapidPrivateKey = vapidKeys.privateKey;
      }

      // Helper function to ensure consistent replacement
      function replaceEnvVar(
        content: string,
        key: string,
        value: string | undefined
      ) {
        const regex = new RegExp(`${key}\\s*=.*`, "g");
        if (content.match(regex)) {
          return content.replace(regex, `${key}=${value}`);
        } else {
          // If the variable doesn't exist, add it
          return `${content}\n${key}=${value}`;
        }
      }

      // Basic configuration
      envContent = replaceEnvVar(envContent, "PORT", projectOptions.appPort);
      envContent = replaceEnvVar(
        envContent,
        "APP_NAME",
        projectOptions.appName
      );
      envContent = replaceEnvVar(
        envContent,
        "APP_URL",
        `http://localhost:${projectOptions.appPort}`
      );

      // Security tokens
      envContent = replaceEnvVar(
        envContent,
        "ACCESS_TOKEN_SECRET",
        accessTokenSecret
      );
      envContent = replaceEnvVar(
        envContent,
        "REFRESH_TOKEN_SECRET",
        refreshTokenSecret
      );
      envContent = replaceEnvVar(envContent, "WEBHOOK_SECRET", webhookSecret);

      // Database
      if (projectOptions.database === "mongodb") {
        envContent = replaceEnvVar(envContent, "MONGO_URI", dbUri);
      } else if (projectOptions.database === "postgres") {
        envContent = replaceEnvVar(envContent, "DATABASE_URL", dbUri);
      }

      // Web Push
      if (projectOptions.includeWebPush) {
        envContent = replaceEnvVar(
          envContent,
          "VAPID_PUBLIC_KEY",
          vapidPublicKey
        );
        envContent = replaceEnvVar(
          envContent,
          "VAPID_PRIVATE_KEY",
          vapidPrivateKey
        );
      }

      // Email Service (placeholders)
      if (projectOptions.includeEmail) {
        envContent = replaceEnvVar(envContent, "MAIL_HOST", "smtp.example.com");
        envContent = replaceEnvVar(envContent, "MAIL_PORT", "587");
        envContent = replaceEnvVar(
          envContent,
          "MAIL_USER",
          "your-email@example.com"
        );
        envContent = replaceEnvVar(envContent, "MAIL_PASS", "your-password");
        envContent = replaceEnvVar(
          envContent,
          "MAIL_LOGO",
          "https://example.com/logo.png"
        );
        envContent = replaceEnvVar(
          envContent,
          "DEFAULT_MAIL_PROVIDER",
          "nodemailer"
        );

        // Add Resend option
        envContent = replaceEnvVar(envContent, "RESEND_API_KEY", "re_");
      }

      // OAuth (placeholders)
      if (projectOptions.includeOAuth) {
        envContent = replaceEnvVar(
          envContent,
          "GOOGLE_CLIENT_ID",
          "your-client-id.apps.googleusercontent.com"
        );
        envContent = replaceEnvVar(
          envContent,
          "GOOGLE_CLIENT_SECRET",
          "your-client-secret"
        );
        envContent = replaceEnvVar(
          envContent,
          "GOOGLE_OAUTH_REDIRECT_URI",
          `http://localhost:${projectOptions.appPort}/auth/google/callback`
        );
      }

      // Payment (placeholder)
      if (projectOptions.includePayments) {
        envContent = replaceEnvVar(
          envContent,
          "PAY_API_KEY",
          "your-payment-api-key"
        );
      }

      // Gemini AI (placeholder)
      if (projectOptions.includeGemini) {
        envContent = replaceEnvVar(
          envContent,
          "GEMINI_API_KEY",
          "your-gemini-api-key"
        );
      }

      fs.writeFileSync(envTargetPath, envContent);
      console.log(chalk.green("Created .env file with your configurations"));
    }

    // Remove Docker files if not needed
    if (!projectOptions.includeDocker) {
      const dockerFiles = [
        path.join(targetDir, "Dockerfile"),
        path.join(targetDir, "docker-compose.yml"),
        path.join(targetDir, "docker-compose.dev.yml"),
        path.join(targetDir, "docker-compose.prod.yml"),
      ];

      dockerFiles.forEach((file) => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
      console.log(chalk.yellow("Removed Docker configuration files"));
    }

    // Remove .kiro/ directory if it exists
    if (fs.existsSync(path.join(targetDir, ".kiro"))) {
      fs.rmSync(path.join(targetDir, ".kiro"), { recursive: true });
      console.log(chalk.yellow("Removed .kiro directory"));
    }

    // Create a brief usage guide
    await createReadme(targetDir, projectOptions);

    console.log(
      chalk.green("\nSuccess! Your new API project has been created.")
    );
    console.log("\nNext steps:");
    if (projectDirectory !== ".") {
      console.log(chalk.cyan(`  cd ${projectDirectory}`));
    }

    if (projectOptions.includeDocker) {
      console.log("\nFor development (with hot reload):");
      console.log(chalk.cyan("  docker-compose -f docker-compose.dev.yml up"));
      console.log(
        chalk.yellow("  # This starts containers with live code reloading")
      );

      console.log("\nFor production:");
      console.log(
        chalk.cyan("  docker-compose -f docker-compose.prod.yml up -d")
      );
      console.log(
        chalk.yellow("  # This starts optimized production containers")
      );

      console.log("\nAlternatively, without Docker:");
      console.log(chalk.cyan("  npm install"));
      console.log(chalk.cyan("  npm run dev"));
    } else {
      console.log(chalk.cyan("  npm install"));
      console.log(chalk.cyan("  npm run dev"));
    }

    console.log("");

    // Show customized next steps based on enabled features
    if (!projectOptions.includeDbDocker) {
      console.log(
        chalk.yellow(
          `Make sure ${
            projectOptions.database === "mongodb" ? "MongoDB" : "PostgreSQL"
          } is running locally or update the ${
            projectOptions.database === "mongodb" ? "MONGO_URI" : "DATABASE_URL"
          } in your .env file!`
        )
      );
    }
    if (projectOptions.includeEmail || projectOptions.includeOAuth) {
      console.log(
        chalk.yellow(
          "Don't forget to update the email and/or OAuth credentials in your .env file!"
        )
      );
    }
    if (projectOptions.includeDbDocker) {
      console.log(
        chalk.green(
          `${
            projectOptions.database === "mongodb" ? "MongoDB" : "PostgreSQL"
          } will be available at ${
            projectOptions.database === "mongodb"
              ? "mongodb://localhost:27017"
              : "postgresql://localhost:5432"
          } when running with Docker Compose`
        )
      );
    }
  } catch (error) {
    console.log(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    process.exit(1);
  }
}

async function createDockerCompose(targetDir: string, options: ProjectOptions) {
  await createDevDockerCompose(targetDir, options);
  await createProdDockerCompose(targetDir, options);
  await createDevDockerfile(targetDir, options);

  // Create mongo initialization directory if MongoDB Docker is included
  if (options.includeDbDocker && options.database === "mongodb") {
    const mongoInitDir = path.join(targetDir, "mongo-init");
    if (!fs.existsSync(mongoInitDir)) {
      fs.mkdirSync(mongoInitDir, { recursive: true });
    }

    // Create a sample initialization script
    const initScript = `// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// You can add any initialization logic here, such as:
// - Creating initial collections
// - Setting up indexes
// - Creating default users
// - Seeding initial data

print('${options.appName} database initialized successfully');
`;
    fs.writeFileSync(path.join(mongoInitDir, "init.js"), initScript);
  }

  console.log(
    chalk.green("Created Docker Compose configurations (dev & prod)")
  );
}

async function createDevDockerCompose(
  targetDir: string,
  options: ProjectOptions
) {
  const dockerComposeDevPath = path.join(targetDir, "docker-compose.dev.yml");

  let dockerComposeContent = `# Development Docker Compose - Hot reload enabled
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "${options.appPort}:${options.appPort}"
    volumes:
      - ./src:/usr/src/app/src:ro
      - ./package.json:/usr/src/app/package.json:ro
      - ./package-lock.json:/usr/src/app/package-lock.json:ro
      - ./tsconfig.json:/usr/src/app/tsconfig.json:ro
      - ./nodemon.json:/usr/src/app/nodemon.json:ro
      - /usr/src/app/node_modules
    environment:
      - NODE_ENV=development
      - PORT=\${PORT}
      - APP_NAME=\${APP_NAME}
      - APP_URL=\${APP_URL}
      - ACCESS_TOKEN_SECRET=\${ACCESS_TOKEN_SECRET}
      - REFRESH_TOKEN_SECRET=\${REFRESH_TOKEN_SECRET}
      - WEBHOOK_SECRET=\${WEBHOOK_SECRET}`;

  // Add Database environment variables
  if (options.database === "mongodb") {
    dockerComposeContent += `
      - MONGO_URI=\${MONGO_URI}`;
  } else if (options.database === "postgres") {
    dockerComposeContent += `
      - DATABASE_URL=\${DATABASE_URL}`;
  }

  // Add other environment variables based on features
  if (options.includeWebPush) {
    dockerComposeContent += `
      - VAPID_PUBLIC_KEY=\${VAPID_PUBLIC_KEY}
      - VAPID_PRIVATE_KEY=\${VAPID_PRIVATE_KEY}`;
  }

  if (options.includeEmail) {
    dockerComposeContent += `
      - MAIL_HOST=\${MAIL_HOST}
      - MAIL_PORT=\${MAIL_PORT}
      - MAIL_USER=\${MAIL_USER}
      - MAIL_PASS=\${MAIL_PASS}
      - MAIL_LOGO=\${MAIL_LOGO}
      - RESEND_API_KEY=\${RESEND_API_KEY}
      - DEFAULT_MAIL_PROVIDER=\${DEFAULT_MAIL_PROVIDER}`;
  }

  if (options.includeOAuth) {
    dockerComposeContent += `
      - GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=\${GOOGLE_CLIENT_SECRET}
      - GOOGLE_OAUTH_REDIRECT_URI=\${GOOGLE_OAUTH_REDIRECT_URI}`;
  }

  if (options.includePayments) {
    dockerComposeContent += `
      - PAY_API_KEY=\${PAY_API_KEY}`;
  }

  if (options.includeGemini) {
    dockerComposeContent += `
      - GEMINI_API_KEY=\${GEMINI_API_KEY}`;
  }

  dockerComposeContent += `
    env_file:
      - .env`;

  // Add depends_on if Database Docker is included
  if (options.includeDbDocker) {
    dockerComposeContent += `
    depends_on:
      - ${options.database === "mongodb" ? "mongo" : "postgres"}`;
  }

  // Add Database service if requested
  if (options.includeDbDocker) {
    if (options.database === "mongodb") {
      const dbName = options.appName.toLowerCase().replace(/\s+/g, "-");
      dockerComposeContent += `
  mongo:
    image: mongo:7
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=${dbName}
    volumes:
      - mongo_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d`;
    } else if (options.database === "postgres") {
      const dbName = options.appName.toLowerCase().replace(/\s+/g, "_");
      dockerComposeContent += `
  postgres:
    image: postgres:15
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=${dbName}
    volumes:
      - postgres_data:/var/lib/postgresql/data`;
    }
  }

  if (options.includeDbDocker) {
    dockerComposeContent += `

volumes:
  ${options.database === "mongodb" ? "mongo_data:" : "postgres_data:"}`;
  }

  fs.writeFileSync(dockerComposeDevPath, dockerComposeContent);
}

async function createProdDockerCompose(
  targetDir: string,
  options: ProjectOptions
) {
  const dockerComposeProdPath = path.join(targetDir, "docker-compose.prod.yml");

  let dockerComposeContent = `# Production Docker Compose
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${options.appPort}:${options.appPort}"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=\${PORT}
      - APP_NAME=\${APP_NAME}
      - APP_URL=\${APP_URL}
      - ACCESS_TOKEN_SECRET=\${ACCESS_TOKEN_SECRET}
      - REFRESH_TOKEN_SECRET=\${REFRESH_TOKEN_SECRET}
      - WEBHOOK_SECRET=\${WEBHOOK_SECRET}`;

  // Add Database environment variables
  if (options.database === "mongodb") {
    dockerComposeContent += `
      - MONGO_URI=\${MONGO_URI}`;
  } else if (options.database === "postgres") {
    dockerComposeContent += `
      - DATABASE_URL=\${DATABASE_URL}`;
  }

  // Add other environment variables based on features
  if (options.includeWebPush) {
    dockerComposeContent += `
      - VAPID_PUBLIC_KEY=\${VAPID_PUBLIC_KEY}
      - VAPID_PRIVATE_KEY=\${VAPID_PRIVATE_KEY}`;
  }

  if (options.includeEmail) {
    dockerComposeContent += `
      - MAIL_HOST=\${MAIL_HOST}
      - MAIL_PORT=\${MAIL_PORT}
      - MAIL_USER=\${MAIL_USER}
      - MAIL_PASS=\${MAIL_PASS}
      - MAIL_LOGO=\${MAIL_LOGO}
      - RESEND_API_KEY=\${RESEND_API_KEY}
      - DEFAULT_MAIL_PROVIDER=\${DEFAULT_MAIL_PROVIDER}`;
  }

  if (options.includeOAuth) {
    dockerComposeContent += `
      - GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=\${GOOGLE_CLIENT_SECRET}
      - GOOGLE_OAUTH_REDIRECT_URI=\${GOOGLE_OAUTH_REDIRECT_URI}`;
  }

  if (options.includePayments) {
    dockerComposeContent += `
      - PAY_API_KEY=\${PAY_API_KEY}`;
  }

  if (options.includeGemini) {
    dockerComposeContent += `
      - GEMINI_API_KEY=\${GEMINI_API_KEY}`;
  }

  dockerComposeContent += `
    env_file:
      - .env`;

  // Add depends_on if Database Docker is included
  if (options.includeDbDocker) {
    dockerComposeContent += `
    depends_on:
      - ${options.database === "mongodb" ? "mongo" : "postgres"}`;
  }

  // Add Database service if requested
  if (options.includeDbDocker) {
    if (options.database === "mongodb") {
      const dbName = options.appName.toLowerCase().replace(/\s+/g, "-");
      dockerComposeContent += `
  mongo:
    image: mongo:7
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=${dbName}
    volumes:
      - mongo_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d`;
    } else if (options.database === "postgres") {
      const dbName = options.appName.toLowerCase().replace(/\s+/g, "_");
      dockerComposeContent += `
  postgres:
    image: postgres:15
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=${dbName}
    volumes:
      - postgres_data:/var/lib/postgresql/data`;
    }
  }

  if (options.includeDbDocker) {
    dockerComposeContent += `

volumes:
  ${options.database === "mongodb" ? "mongo_data:" : "postgres_data:"}`;
  }

  fs.writeFileSync(dockerComposeProdPath, dockerComposeContent);
}

async function createDevDockerfile(targetDir: string, options: ProjectOptions) {
  const dockerfileDevPath = path.join(targetDir, "Dockerfile.dev");

  const dockerfileContent = `# Development Dockerfile with hot reload
FROM node:lts

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE ${options.appPort}

# Start with nodemon for hot reload
CMD ["npm", "run", "dev"]`;

  fs.writeFileSync(dockerfileDevPath, dockerfileContent);
}

async function createReadme(targetDir: string, options: ProjectOptions) {
  const readmePath = path.join(targetDir, "README.md");

  let setupGuide = "";

  if (options.database === "postgres") {
    setupGuide = `# ${options.appName}

A starter project for setting up a TypeScript Express server with Apollo GraphQL.

---

## Features

- **TypeScript**: Strongly typed language for writing scalable and maintainable code.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **Apollo Server**: Spec-compliant and production-ready JavaScript GraphQL server.
- **PostgreSQL**: Database integration using Prisma ORM.
- **Authentication**: JWT-based authentication and Google OAuth.
- **Role Management**: Role-based access control for users.
- **Email Services**: Multi-provider email service with Nodemailer, ZeptoMail, and Resend support.
- **API Key Management**: Secure API key generation and validation.
- **Password Reset**: Secure password reset functionality.
- **Environment Configuration**: \`.env\` file support for managing sensitive configurations.

---

## Installation

### Prerequisites

- Node.js (v20 or later)
- PostgreSQL (local or cloud instance, e.g., Supabase)
- A \`.env\` file with the required environment variables (see below).

### Steps

1. Clone the repository (if you haven't already):

   \`\`\`bash
   git clone https://github.com/aevrHQ/express-ts-postgres-graphql-starter.git ${options.appName}
   \`\`\`

2. Navigate to the project directory:

   \`\`\`bash
   cd ${options.appName}
   \`\`\`

3. Install the dependencies:

   \`\`\`bash
   npm install
   \`\`\`

4. Set up environment variables:
   Copy \`.env.example\` to \`.env\` and update the values.

5. Run database migrations:

   \`\`\`bash
   npx prisma migrate dev
   \`\`\`

---

## Project Structure

\`\`\`
${options.appName}/
├── prisma/                # Prisma schema and migrations
├── src/
│   ├── config/                # Configuration files (e.g., database connection)
│   ├── graphql/               # GraphQL type definitions and resolvers
│   │   ├── typeDefs/          # GraphQL schema definitions
│   │   ├── resolvers/         # GraphQL resolvers
│   ├── middlewares/           # Express middlewares
│   ├── services/              # Business logic and service layer
│   ├── utils/                 # Utility functions (e.g., email, token generation)
│   │   ├── emails/            # Email service with multiple providers
│   ├── index.ts               # Entry point of the application
├── .env                       # Environment variables
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project metadata and dependencies
├── Dockerfile                 # Docker configuration
├── docker-compose.dev.yml     # Docker Compose for development
├── docker-compose.prod.yml    # Docker Compose for production
├── README.md                  # Project documentation
\`\`\`

---

## Key Features and Modules

### 1. **GraphQL API**

- **Type Definitions**: Located in \`src/graphql/typeDefs/\`.
- **Resolvers**: Located in \`src/graphql/resolvers/\`.

#### Example Queries and Mutations

- **User Queries**:

  \`\`\`graphql
  query {
    users {
      data {
        id
        firstName
        lastName
        email
      }
    }
  }
  \`\`\`

- **User Mutations**:

  \`\`\`graphql
  mutation {
    register(
      input: {
        firstName: "John"
        lastName: "Doe"
        email: "john.doe@example.com"
        password: "password123"
      }
    ) {
      user {
        id
        email
      }
    }
  }
  \`\`\`

### 2. **Authentication**

- **JWT Authentication**: Implemented in \`src/utils/token.ts\` and \`src/middlewares/auth.middleware.ts\`.
- **Google OAuth**: Handled in \`src/services/google.auth.services.ts\`.

### 3. **Role Management**

- Roles are defined in \`prisma/schema.prisma\`.
- Role setup is automated in \`src/services/role.services.ts\`.

### 4. **Email Services**

The email service module provides a flexible, provider-agnostic way to send emails with support for multiple email providers:

- **Multiple Provider Support**:

  - Nodemailer (Default) - Traditional SMTP-based email delivery
  - ZeptoMail - Transactional email API
  - Resend - Modern email API for developers

- **Email Templates**: Pre-built responsive templates for common use cases like welcome emails and password reset

- **Features**:
  - Template-based emails
  - Attachment support
  - CC/BCC functionality
  - Reply-to settings
  - Type-safe interfaces
  - Error handling
  - Social media links
  - Button actions

#### Basic Usage

\`\`\`typescript
import { EmailService } from "./src/utils/emails";

// Create email service with preferred provider
const emailService = new EmailService("resend"); // or 'nodemailer' or 'zeptomail'

// Send a simple email
await emailService.sendEmail({
  subject: "Welcome to our service",
  htmlBody: "<h1>Hello there!</h1><p>Welcome to our platform.</p>",
  to: {
    email: "user@example.com",
    name: "John Doe",
  },
});
\`\`\`

#### Using Templates

\`\`\`typescript
import { EmailService } from "./src/utils/emails";

const emailService = new EmailService();

// Generate standard template
const template = emailService.generateStandardTemplate({
  title: "Welcome to Our Platform",
  content:
    "<p>Thank you for signing up! We hope you enjoy using our service.</p>",
  buttonText: "Get Started",
  buttonUrl: "https://example.com/dashboard",
  socialLinks: [
    { name: "Twitter", url: "https://twitter.com/example" },
    { name: "Instagram", url: "https://instagram.com/example" },
  ],
});

// Send email with template
await emailService.sendEmail({
  subject: "Welcome to Our Platform",
  htmlBody: template,
  to: {
    email: "user@example.com",
    name: "John Doe",
  },
});
\`\`\`

#### Pre-made Email Templates

\`\`\`typescript
import { EmailService } from "./src/utils/emails";

const emailService = new EmailService();

// Send welcome email
const welcomeTemplate = emailService.generateWelcomeEmail({
  userName: "John",
  verificationUrl: "https://example.com/verify?token=abc123",
  additionalContent: "<p>Here are some tips to get started...</p>",
});

// Send password reset email
const resetTemplate = emailService.generatePasswordResetEmail({
  userName: "Jane",
  resetUrl: "https://example.com/reset?token=xyz789",
  expiryTime: "24 hours",
});
\`\`\`

#### Legacy Support

\`\`\`typescript
import { mailSender, generateEmailTemplate } from "./src/utils/emails";

// Your existing code will continue to work
const emailBody = generateEmailTemplate(
  "Welcome",
  "<p>Thank you for signing up!</p>"
);

await mailSender("user@example.com", "Welcome", emailBody);
\`\`\`

### 5. **API Key Management**

- API keys are generated and validated in \`src/services/apiKey.services.ts\` and \`src/middlewares/apiKey.middleware.ts\`.

### 6. **Password Reset**

- Password reset functionality is implemented in \`src/services/passwordResetToken.services.ts\`.

---

## Environment Variables

| Variable                    | Description                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| \`PORT\`                      | Port on which the server runs                                          |
| \`DATABASE_URL\`              | PostgreSQL connection string (pooling)                                 |
| \`DIRECT_URL\`                | PostgreSQL connection string (direct)                                  |
| \`JWT_SECRET\`                | Secret for signing JWT tokens                                          |
| \`ACCESS_TOKEN_SECRET\`       | Secret for access tokens                                               |
| \`REFRESH_TOKEN_SECRET\`      | Secret for refresh tokens                                              |
| \`MAIL_USER\`                 | Email address for sending emails                                       |
| \`MAIL_PASS\`                 | Password for the email account                                         |
| \`MAIL_LOGO\`                 | URL of the logo used in email templates                                |
| \`APP_NAME\`                  | Name of the application                                                |
| \`APP_URL\`                   | Base URL of the application                                            |
| \`GOOGLE_CLIENT_ID\`          | Google OAuth client ID                                                 |
| \`GOOGLE_CLIENT_SECRET\`      | Google OAuth client secret                                             |
| \`GOOGLE_OAUTH_REDIRECT_URI\` | Redirect URI for Google OAuth                                          |
| \`ZOHO_KEY\`                  | ZeptoMail API key for email service                                    |
| \`RESEND_API_KEY\`            | Resend API key for email service                                       |
| \`DEFAULT_MAIL_PROVIDER\`     | Default email provider to use ('nodemailer', 'zeptomail', or 'resend') |

---

## Scripts

- \`npm run dev\`: Run the development server with nodemon.
- \`npm run build\`: Build the project.
- \`npm start\`: Start the built project.

---

## Docker Support

### Development

To run the application in a Docker container for development:

\`\`\`bash
docker-compose -f docker-compose.dev.yml up --build
\`\`\`

### Production

To run the application in a Docker container for production:

\`\`\`bash
docker-compose -f docker-compose.prod.yml up --build
\`\`\`

---

## Testing

Currently, no tests are implemented. You can add tests using a framework like **Jest** or **Mocha**.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License.

---

## Troubleshooting

### Common Issues

1. **Database Connection Error**:

   - Ensure PostgreSQL is running and the \`DATABASE_URL\` is correct.
   - If using Supabase, ensure you have both \`DATABASE_URL\` (pooling) and \`DIRECT_URL\` (direct) configured.

2. **Environment Variables Missing**:

   - Ensure you have a \`.env\` file with all required variables.

3. **Email Sending Issues**:
   - Verify your email credentials and ensure less secure app access is enabled for your email account.
   - For Gmail, you may need to generate an "App Password" if 2FA is enabled.
   - Check that the correct email provider is configured (DEFAULT_MAIL_PROVIDER).

---

## Future Improvements

- Add unit and integration tests.
- Implement rate limiting for API endpoints.
- Add support for more OAuth providers.
- Improve error handling and logging.
- Add more email templates for different scenarios.
- Support for AWS SES as an additional email provider.
`;
  } else {
    setupGuide = `# ${options.appName}

GraphQL API built with TypeScript, Express, and ${
      options.database === "mongodb" ? "MongoDB" : "PostgreSQL"
    }.

## Getting Started

### Development Mode (Hot Reload with Docker)

1. Clone this repository
2. Configure your environment variables in the \`.env\` file
3. Start the development services:
\`\`\`bash
docker-compose -f docker-compose.dev.yml up
\`\`\`

This will start the containers with:
- **Hot reload** - Code changes automatically restart the server
- **Volume mounting** - Your source code is mounted into the container
- **Development dependencies** - Nodemon and dev tools available

### Production Mode (Docker)

1. Build and start production services:
\`\`\`bash
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

This uses the optimized production build with compiled TypeScript.

### Local Development (Without Docker)

1. Clone this repository
2. Install dependencies:
\`\`\`bash
npm install
\`\`\`
3. Configure your environment variables in the \`.env\` file
${
  !options.includeDbDocker
    ? `4. Make sure ${
        options.database === "mongodb" ? "MongoDB" : "PostgreSQL"
      } is running locally\n5. Start the development server:`
    : "4. Start the development server:"
}
\`\`\`bash
npm run dev
\`\`\`

## Environment Variables

The following environment variables have been pre-configured:

- \`PORT\`: ${options.appPort} (Server port)
- \`APP_NAME\`: ${options.appName}
- \`APP_URL\`: http://localhost:${options.appPort}
${
  options.database === "mongodb"
    ? `- \`MONGO_URI\`: ${
        options.includeDbDocker
          ? "Docker MongoDB connection"
          : "Local MongoDB connection"
      }\n`
    : `- \`DATABASE_URL\`: ${
        options.includeDbDocker
          ? "Docker PostgreSQL connection"
          : "Local PostgreSQL connection"
      }\n`
}${
      options.includeWebPush
        ? "- `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`: Generated for Web Push notifications\n"
        : ""
    }

${
  options.includeEmail
    ? "### Email Configuration\nUpdate the following variables with your email service credentials:\n- `MAIL_HOST`\n- `MAIL_PORT`\n- `MAIL_USER`\n- `MAIL_PASS`\n- `MAIL_LOGO`\n- `RESEND_API_KEY` (if using Resend)\n- `DEFAULT_MAIL_PROVIDER`\n"
    : ""
}

${
  options.includeOAuth
    ? "### Google OAuth\nUpdate the following variables with your Google OAuth credentials:\n- `GOOGLE_CLIENT_ID`\n- `GOOGLE_CLIENT_SECRET`\n- `GOOGLE_OAUTH_REDIRECT_URI`\n"
    : ""
}

${
  options.includePayments
    ? "### Payments\nConfigure your payment gateway:\n- `PAY_API_KEY`\n"
    : ""
}

${
  options.includeGemini
    ? "### Google Gemini AI\nAdd your Gemini API key:\n- `GEMINI_API_KEY`\n"
    : ""
}

## Docker Services

${
  options.includeDocker
    ? "- **API**: Express GraphQL server running on port " + options.appPort
    : "Docker configuration not included"
}
${
  options.includeDbDocker
    ? options.database === "mongodb"
      ? "- **MongoDB**: Database server running on port 27017 with persistent data storage"
      : "- **PostgreSQL**: Database server running on port 5432 with persistent data storage"
    : ""
}

## Features

- TypeScript Express API with GraphQL
- ${
      options.database === "mongodb"
        ? "MongoDB integration with Mongoose"
        : "PostgreSQL integration with Prisma"
    }${
      options.includeDocker
        ? "\n- Docker configuration for development and production"
        : ""
    }${
      options.includeDbDocker
        ? `\n- Containerized ${
            options.database === "mongodb" ? "MongoDB" : "PostgreSQL"
          } with data persistence`
        : ""
    }${
      options.includeDocker
        ? "\n- **Hot reload in development** - Code changes automatically restart the server"
        : ""
    }${options.includeWebPush ? "\n- Web Push notification support" : ""}${
      options.includeEmail ? "\n- Email service integration" : ""
    }${options.includeOAuth ? "\n- Google OAuth authentication" : ""}${
      options.includePayments ? "\n- Payment gateway integration" : ""
    }${options.includeGemini ? "\n- Google Gemini AI integration" : ""}

## GraphQL Playground

Access the GraphQL playground at: http://localhost:${options.appPort}/graphql

${
  options.includeDbDocker
    ? options.database === "mongodb"
      ? "## MongoDB Management\n\nYou can connect to the MongoDB container using any MongoDB client:\n- **Connection String**: `mongodb://localhost:27017`\n- **Database**: `" +
        options.appName.toLowerCase().replace(/\s+/g, "-") +
        '`\n\nTo access the MongoDB shell:\n```bash\ndocker exec -it $(docker ps -qf "name=mongo") mongosh\n```\n'
      : "## PostgreSQL Management\n\nYou can connect to the PostgreSQL container using any PostgreSQL client:\n- **Connection String**: `postgresql://postgres:postgres@localhost:5432/" +
        options.appName.toLowerCase().replace(/\s+/g, "_") +
        '`\n\nTo access the PostgreSQL shell:\n```bash\ndocker exec -it $(docker ps -qf "name=postgres") psql -U postgres\n```\n'
    : ""
}

## Development Commands

\`\`\`bash
# Local development
npm run dev          # Start with nodemon (hot reload)
npm run build        # Build TypeScript
npm start           # Start production build

${
  options.includeDocker
    ? "# Docker development (with hot reload)\ndocker-compose -f docker-compose.dev.yml up\ndocker-compose -f docker-compose.dev.yml down\n\n# Docker production\ndocker-compose -f docker-compose.prod.yml up -d\ndocker-compose -f docker-compose.prod.yml down\n\n# View logs\ndocker-compose -f docker-compose.dev.yml logs -f api\n" +
      (options.includeDbDocker
        ? options.database === "mongodb"
          ? "docker-compose -f docker-compose.dev.yml logs -f mongo\n"
          : "docker-compose -f docker-compose.dev.yml logs -f postgres\n"
        : "")
    : ""
}
\`\`\`

## Development Workflow

${
  options.includeDocker
    ? "### With Docker (Recommended)\n\n1. Start development containers:\n   ```bash\n   docker-compose -f docker-compose.dev.yml up\n   ```\n\n2. Make changes to your code in the `src/` directory\n\n3. The server will automatically restart when you save changes\n\n4. View logs in real-time in your terminal\n\n5. Stop containers:\n   ```bash\n   docker-compose -f docker-compose.dev.yml down\n   ```\n\n### Without Docker\n\n"
    : ""
}1. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Make changes to your code

3. Nodemon will automatically restart the server

4. Access your API at http://localhost:${options.appPort}

## Production Deployment

${
  options.includeDocker
    ? "Use the production Docker Compose configuration:\n\n```bash\n# Build and start production containers\ndocker-compose -f docker-compose.prod.yml up -d\n\n# Check status\ndocker-compose -f docker-compose.prod.yml ps\n\n# View logs\ndocker-compose -f docker-compose.prod.yml logs -f\n```\n\nThe production setup includes:\n- Compiled TypeScript (no source code in container)\n- Optimized Node.js image\n- Production environment variables\n- Automatic container restart on failure\n"
    : "Build and deploy your application:\n\n```bash\nnpm run build\nnpm start\n```\n"
}

## Generated with @untools/starter

This project was scaffolded using [@untools/starter](https://www.npmjs.com/package/@untools/starter).
`;
  }

  fs.writeFileSync(readmePath, setupGuide);
  console.log(chalk.green("Created custom README.md with project information"));
}

export default createApiProject;
