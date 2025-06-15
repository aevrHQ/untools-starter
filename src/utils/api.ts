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
        default: "starter",
      },
    ]);
    projectDirectory = answers.projectDirectory || "starter";
  } else if (!projectDirectory) {
    projectDirectory = "starter";
  }

  const targetDir = path.join(process.cwd(), projectDirectory || DEFAULT_NAME);

  console.log(
    chalk.blue(`Creating a new TypeScript GraphQL API in ${targetDir}...`)
  );

  // Check if directory exists
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.log(chalk.red("Error: Directory already exists and is not empty"));
    process.exit(1);
  }

  // Additional configuration if not using default options
  let projectOptions: ProjectOptions = {
    appName: projectDirectory,
    appPort: generatePortFromName(projectDirectory || "starter").toString(),
    includeDocker: true,
    includeMongoDB: true,
    includeMongoDocker: false, // New option for MongoDB Docker container
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
        default: projectDirectory,
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
        type: "confirm",
        name: "includeMongoDB",
        message: "Include MongoDB configuration?",
        default: true,
      },
      {
        type: "confirm",
        name: "includeMongoDocker",
        message:
          "Include MongoDB Docker container? (Recommended for development)",
        default: projectOptions.includeDocker && projectOptions.includeMongoDB,
        when: (answers) =>
          answers.includeMongoDB && projectOptions.includeDocker,
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
    const emitter = degit("miracleonyenma/express-ts-graphql-starter", {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(targetDir);

    // Customize package.json
    const pkgPath = path.join(targetDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as PackageJson;
    pkg.name = projectDirectory || DEFAULT_NAME;
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

      // Set MongoDB URI based on Docker option
      let mongoUri = "";
      if (projectOptions.includeMongoDB) {
        if (projectOptions.includeMongoDocker) {
          mongoUri = `mongodb://mongo:27017/${projectOptions.appName
            .toLowerCase()
            .replace(/\s+/g, "-")}`;
        } else {
          mongoUri = `mongodb://localhost:27017/${projectOptions.appName
            .toLowerCase()
            .replace(/\s+/g, "-")}`;
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

      // MongoDB
      if (projectOptions.includeMongoDB) {
        envContent = replaceEnvVar(envContent, "MONGO_URI", mongoUri);
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

    // Create a brief usage guide
    await createReadme(targetDir, projectOptions);

    console.log(
      chalk.green("\nSuccess! Your new API project has been created.")
    );
    console.log("\nNext steps:");
    console.log(chalk.cyan(`  cd ${projectDirectory}`));

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
    if (projectOptions.includeMongoDB && !projectOptions.includeMongoDocker) {
      console.log(
        chalk.yellow(
          "Make sure MongoDB is running locally or update the MONGO_URI in your .env file!"
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
    if (projectOptions.includeMongoDocker) {
      console.log(
        chalk.green(
          "MongoDB will be available at mongodb://localhost:27017 when running with Docker Compose"
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
  if (options.includeMongoDocker) {
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

  // Add MongoDB environment variables if MongoDB is included
  if (options.includeMongoDB) {
    dockerComposeContent += `
      - MONGO_URI=\${MONGO_URI}`;
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

  // Add depends_on if MongoDB Docker is included
  if (options.includeMongoDocker) {
    dockerComposeContent += `
    depends_on:
      - mongo`;
  }

  // Add MongoDB service if requested
  if (options.includeMongoDocker) {
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
      - ./mongo-init:/docker-entrypoint-initdb.d

volumes:
  mongo_data:`;
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

  // Add MongoDB environment variables if MongoDB is included
  if (options.includeMongoDB) {
    dockerComposeContent += `
      - MONGO_URI=\${MONGO_URI}`;
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

  // Add depends_on if MongoDB Docker is included
  if (options.includeMongoDocker) {
    dockerComposeContent += `
    depends_on:
      - mongo`;
  }

  // Add MongoDB service if requested
  if (options.includeMongoDocker) {
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
      - ./mongo-init:/docker-entrypoint-initdb.d

volumes:
  mongo_data:`;
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

  const setupGuide = `# ${options.appName}

GraphQL API built with TypeScript, Express, and MongoDB.

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
  !options.includeMongoDocker
    ? "4. Make sure MongoDB is running locally\n5. Start the development server:"
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
  options.includeMongoDB
    ? `- \`MONGO_URI\`: ${
        options.includeMongoDocker
          ? "Docker MongoDB connection"
          : "Local MongoDB connection"
      }\n`
    : ""
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
  options.includeMongoDocker
    ? "- **MongoDB**: Database server running on port 27017 with persistent data storage"
    : ""
}

## Features

- TypeScript Express API with GraphQL
- MongoDB integration with Mongoose${
    options.includeDocker
      ? "\n- Docker configuration for development and production"
      : ""
  }${
    options.includeMongoDocker
      ? "\n- Containerized MongoDB with data persistence"
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
  options.includeMongoDocker
    ? "## MongoDB Management\n\nYou can connect to the MongoDB container using any MongoDB client:\n- **Connection String**: `mongodb://localhost:27017`\n- **Database**: `" +
      options.appName.toLowerCase().replace(/\s+/g, "-") +
      '`\n\nTo access the MongoDB shell:\n```bash\ndocker exec -it $(docker ps -qf "name=mongo") mongosh\n```\n'
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
      (options.includeMongoDocker
        ? "docker-compose -f docker-compose.dev.yml logs -f mongo\n"
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

  fs.writeFileSync(readmePath, setupGuide);
  console.log(chalk.green("Created custom README.md with project information"));
}

export default createApiProject;
