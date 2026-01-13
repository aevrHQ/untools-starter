import inquirer from "inquirer";
import chalk from "chalk";
import degit from "degit";
import path from "path";
import fs from "fs";
import { generatePortFromName } from "@untools/port-gen";
import { DEFAULT_NAME, generateSecureKey, generateVapidKeys } from "..";
import { FrontendOptions, ProjectOptions } from "../types/index";

async function createFrontendProject(
  projectDirectory: string = DEFAULT_NAME,
  options?: { yes?: boolean },
  baseOptions?: Partial<ProjectOptions>
) {
  const targetDir =
    projectDirectory === "."
      ? process.cwd()
      : path.join(process.cwd(), projectDirectory);
  const actualProjectName =
    projectDirectory === "." ? path.basename(process.cwd()) : projectDirectory;
  console.log(chalk.blue(`Creating a new Next.js frontend in ${targetDir}...`));

  // Check directory existence
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.log(chalk.red("Error: Directory already exists and is not empty"));
    process.exit(1);
  }

  // Frontend-specific options
  let frontendOptions: FrontendOptions = {
    appName: baseOptions?.appName || actualProjectName,
    appPort:
      baseOptions?.appPort ||
      generatePortFromName(actualProjectName).toString(),
    includeDocker: baseOptions?.includeDocker ?? true,
    database: baseOptions?.database ?? "mongodb",
    includeDbDocker: baseOptions?.includeDbDocker ?? false,
    includeEmail: baseOptions?.includeEmail ?? true,
    includeOAuth: baseOptions?.includeOAuth ?? true,
    includePayments: baseOptions?.includePayments ?? false,
    includeGemini: baseOptions?.includeGemini ?? false,
    includeWebPush: baseOptions?.includeWebPush ?? true,
    includeStorage: false,
    apiUrl: "http://localhost:5416",
    useCloudinary: true,
    googleOAuth: true,
    webPushNotifications: true,
  };

  if (!options?.yes) {
    // Prompt for Next.js specific options
    const frontendAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "apiUrl",
        message: "What's the URL of your GraphQL API?",
        default: "http://localhost:5416",
      },
      {
        type: "confirm",
        name: "useCloudinary",
        message: "Include Cloudinary configuration?",
        default: true,
      },
      {
        type: "confirm",
        name: "googleOAuth",
        message: "Include Google OAuth configuration?",
        default: true,
      },
      {
        type: "confirm",
        name: "webPushNotifications",
        message: "Include Web Push notifications configuration?",
        default: true,
      },
    ]);

    frontendOptions = { ...frontendOptions, ...frontendAnswers };
  }

  try {
    console.log(chalk.yellow("Downloading Next.js starter template..."));

    // Use degit to clone the Next.js template
    const emitter = degit("miracleonyenma/nextjs-starter-client", {
      cache: false,
      force: true,
      verbose: false,
    });

    await emitter.clone(targetDir);

    // Customize package.json
    const pkgPath = path.join(targetDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.name = actualProjectName;
    pkg.version = "0.1.0";
    pkg.description = `Next.js frontend generated from @untools/starter`;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    // Create or modify .env.local file
    const envExamplePath = path.join(targetDir, ".env.example");
    const envLocalPath = path.join(targetDir, ".env.local");

    let envContent = "";
    if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, "utf8");
    } else {
      // Create default env content if example doesn't exist
      envContent = `NEXT_PUBLIC_APP_URL=http://localhost:3030\nNEXT_PUBLIC_APP_NAME=${projectDirectory}\n`;
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
        return `${content}\n${key}=${value}`;
      }
    }

    // Basic configuration
    envContent = replaceEnvVar(
      envContent,
      "NEXT_PUBLIC_APP_URL",
      "http://localhost:3030"
    );
    envContent = replaceEnvVar(
      envContent,
      "NEXT_PUBLIC_APP_NAME",
      actualProjectName
    );

    // API configuration
    envContent = replaceEnvVar(
      envContent,
      "NEXT_PUBLIC_API_URL",
      frontendOptions.apiUrl
    );
    envContent = replaceEnvVar(
      envContent,
      "NEXT_PUBLIC_GRAPHQL_API",
      `${frontendOptions.apiUrl}/graphql`
    );
    envContent = replaceEnvVar(envContent, "API_KEY", generateSecureKey());

    // Session secrets
    envContent = replaceEnvVar(
      envContent,
      "SESSION_SECRET",
      generateSecureKey()
    );

    // Generate VAPID keys if web push is included
    if (frontendOptions.webPushNotifications) {
      console.log(chalk.yellow("Generating VAPID keys for Web Push..."));
      const vapidKeys = await generateVapidKeys();
      envContent = replaceEnvVar(
        envContent,
        "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
        vapidKeys.publicKey
      );
      envContent = replaceEnvVar(
        envContent,
        "VAPID_PRIVATE_KEY",
        vapidKeys.privateKey
      );
    }

    // Google OAuth
    if (frontendOptions.googleOAuth) {
      envContent = replaceEnvVar(
        envContent,
        "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
        "your-client-id.apps.googleusercontent.com"
      );
      envContent = replaceEnvVar(
        envContent,
        "GOOGLE_CLIENT_SECRET",
        "your-client-secret"
      );
      envContent = replaceEnvVar(
        envContent,
        "NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI",
        "http://localhost:3030/api/auth/google"
      );
    }

    // Cloudinary
    if (frontendOptions.useCloudinary) {
      envContent = replaceEnvVar(
        envContent,
        "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
        "your-cloud-name"
      );
      envContent = replaceEnvVar(
        envContent,
        "NEXT_PUBLIC_CLOUDINARY_API_KEY",
        "your-api-key"
      );
      envContent = replaceEnvVar(
        envContent,
        "CLOUDINARY_API_SECRET",
        "your-api-secret"
      );
    }

    // Write the .env.local file
    fs.writeFileSync(envLocalPath, envContent);
    console.log(
      chalk.green("Created .env.local file with your configurations")
    );

    // Output success message
    console.log(
      chalk.green("\nSuccess! Your new Next.js project has been created.")
    );
    console.log("\nNext steps:");
    if (projectDirectory !== ".") {
      console.log(chalk.cyan(`  cd ${projectDirectory}`));
    }
    console.log(chalk.cyan("  npm install"));
    console.log(chalk.cyan("  npm run dev"));

    // Show customized next steps based on enabled features
    if (frontendOptions.googleOAuth) {
      console.log(
        chalk.yellow(
          "\nDon't forget to update Google OAuth credentials in your .env.local file!"
        )
      );
    }
    if (frontendOptions.useCloudinary) {
      console.log(
        chalk.yellow(
          "Update Cloudinary credentials in your .env.local file for file uploads!"
        )
      );
    }
    console.log(
      chalk.yellow(
        "\nRun 'npm run codegen' after setting up the API to generate GraphQL types."
      )
    );
  } catch (error) {
    console.log(
      chalk.red(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    );
    process.exit(1);
  }
}

export default createFrontendProject;
