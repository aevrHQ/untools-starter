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

    // Create or modify .env file
    const envPath = path.join(targetDir, ".env.example");
    const envTargetPath = path.join(targetDir, ".env");

    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf8");

      // Generate secrets and keys
      const accessTokenSecret = generateSecureKey();
      const refreshTokenSecret = generateSecureKey();
      const webhookSecret = generateSecureKey();
      const mongoUri = projectOptions.includeMongoDB
        ? `mongodb://localhost:27017/${projectOptions.appName
            .toLowerCase()
            .replace(/\s+/g, "-")}`
        : "";

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
    const readmePath = path.join(targetDir, "README.md");
    let readmeContent = "";

    if (fs.existsSync(readmePath)) {
      readmeContent = fs.readFileSync(readmePath, "utf8");
    }

    const setupGuide = `
# ${projectOptions.appName}

GraphQL API built with TypeScript, Express, and MongoDB.

## Getting Started

1. Clone this repository
2. Install dependencies:
\`\`\`bash
npm install
\`\`\`
3. Configure your environment variables in the \`.env\` file

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Environment Variables

The following environment variables have been pre-configured:

- \`PORT\`: ${projectOptions.appPort} (Server port)
- \`APP_NAME\`: ${projectOptions.appName}
- \`APP_URL\`: http://localhost:${projectOptions.appPort}
${
  projectOptions.includeMongoDB
    ? "- `MONGO_URI`: Local MongoDB connection\n"
    : ""
}
${
  projectOptions.includeWebPush
    ? "- `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`: Generated for Web Push notifications\n"
    : ""
}

${
  projectOptions.includeEmail
    ? "### Email Configuration\nUpdate the following variables with your email service credentials:\n- `MAIL_HOST`\n- `MAIL_PORT`\n- `MAIL_USER`\n- `MAIL_PASS`\n- `MAIL_LOGO`\n- `RESEND_API_KEY` (if using Resend)\n- `DEFAULT_MAIL_PROVIDER`\n"
    : ""
}

${
  projectOptions.includeOAuth
    ? "### Google OAuth\nUpdate the following variables with your Google OAuth credentials:\n- `GOOGLE_CLIENT_ID`\n- `GOOGLE_CLIENT_SECRET`\n- `GOOGLE_OAUTH_REDIRECT_URI`\n"
    : ""
}

${
  projectOptions.includePayments
    ? "### Payments\nConfigure your payment gateway:\n- `PAY_API_KEY`\n"
    : ""
}

${
  projectOptions.includeGemini
    ? "### Google Gemini AI\nAdd your Gemini API key:\n- `GEMINI_API_KEY`\n"
    : ""
}

## Features

- TypeScript Express API with GraphQL
- MongoDB integration with Mongoose${
      projectOptions.includeDocker
        ? "\n- Docker configuration for development and production"
        : ""
    }${
      projectOptions.includeWebPush ? "\n- Web Push notification support" : ""
    }${projectOptions.includeEmail ? "\n- Email service integration" : ""}${
      projectOptions.includeOAuth ? "\n- Google OAuth authentication" : ""
    }${
      projectOptions.includePayments ? "\n- Payment gateway integration" : ""
    }${projectOptions.includeGemini ? "\n- Google Gemini AI integration" : ""}

## GraphQL Playground

Access the GraphQL playground at: http://localhost:${
      projectOptions.appPort
    }/graphql

## Generated with @untools/starter

This project was scaffolded using [@untools/starter](https://www.npmjs.com/package/@untools/starter).
`;

    fs.writeFileSync(readmePath, setupGuide);
    console.log(
      chalk.green("Created custom README.md with project information")
    );

    console.log(
      chalk.green("\nSuccess! Your new API project has been created.")
    );
    console.log("\nNext steps:");
    console.log(chalk.cyan(`  cd ${projectDirectory}`));
    console.log(chalk.cyan("  npm install"));
    console.log(chalk.cyan("  npm run dev"));
    console.log("");

    // Show customized next steps based on enabled features
    if (projectOptions.includeMongoDB) {
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
  } catch (error) {
    console.log(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    process.exit(1);
  }
}

export default createApiProject;
