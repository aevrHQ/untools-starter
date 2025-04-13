#!/usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import degit from "degit";
import path from "path";
import fs from "fs";
import { generatePortFromName } from "@untools/port-gen";

type PackageJson = {
  name: string;
  version: string;
  description: string;
  [key: string]: any;
};

const DEFAULT_NAME = "my-api";

async function main() {
  program
    .name("@untools/ts-graphql-api")
    .description("Create a new TypeScript Express MongoDB GraphQL API project")
    .argument("[project-directory]", "Directory to create the project in")
    .option("-y, --yes", "Skip prompts and use defaults")
    .action(async (projectDirectory?: string, options?: { yes?: boolean }) => {
      // If no directory is provided, prompt for it
      if (!projectDirectory && !options?.yes) {
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "projectDirectory",
            message: "What is the name of your project?",
            default: "my-api",
          },
        ]);
        projectDirectory = answers.projectDirectory || "my-api";
      } else if (!projectDirectory) {
        projectDirectory = "my-api";
      }

      const targetDir = path.join(
        process.cwd(),
        projectDirectory || DEFAULT_NAME
      );

      console.log(
        chalk.blue(`Creating a new TypeScript GraphQL API in ${targetDir}...`)
      );

      // Check if directory exists
      if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
        console.log(
          chalk.red("Error: Directory already exists and is not empty")
        );
        process.exit(1);
      }

      // Additional configuration if not using default options
      let appName = projectDirectory;
      let appPort = generatePortFromName(projectDirectory || "my-api");
      let includeDocker = true;

      if (!options?.yes) {
        const configAnswers = await inquirer.prompt([
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
            default: appPort.toString(),
            validate: (input) =>
              !isNaN(Number(input)) || "Port must be a number",
          },
          {
            type: "confirm",
            name: "includeDocker",
            message: "Include Docker configuration?",
            default: true,
          },
        ]);

        appName = configAnswers.appName;
        appPort = configAnswers.appPort;
        includeDocker = configAnswers.includeDocker;
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
        pkg.description = `API generated from @untools/ts-graphql-api`;
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

        // Create or modify .env file
        const envPath = path.join(targetDir, ".env.example");
        const envTargetPath = path.join(targetDir, ".env");

        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, "utf8");

          // Helper function to ensure consistent replacement
          function replaceEnvVar(
            content: string,
            key: string,
            value: string | undefined
          ) {
            const regex = new RegExp(`${key}\\s*=.*`, "g");
            return content.replace(regex, `${key}=${value}`);
          }

          // Use it for all your replacements
          envContent = replaceEnvVar(envContent, "PORT", appPort.toString());
          envContent = replaceEnvVar(envContent, "APP_NAME", appName);
          envContent = replaceEnvVar(
            envContent,
            "APP_URL",
            `http://localhost:${appPort}`
          );
          fs.writeFileSync(envTargetPath, envContent);
          console.log(
            chalk.green("Created .env file with your configurations")
          );
        }

        // Remove Docker files if not needed
        if (!includeDocker) {
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

        console.log(
          chalk.green("\nSuccess! Your new API project has been created.")
        );
        console.log("\nNext steps:");
        console.log(chalk.cyan(`  cd ${projectDirectory}`));
        console.log(chalk.cyan("  npm install"));
        console.log(chalk.cyan("  npm run dev"));
        console.log("");
        console.log(
          chalk.yellow(
            "Don't forget to set up your MongoDB connection and other environment variables in .env file!"
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
    });

  program.parse();
}

main().catch((error) => {
  console.error(chalk.red("Unexpected error:"), error);
  process.exit(1);
});
