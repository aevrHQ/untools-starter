#!/usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import crypto from "crypto";
import child_process from "child_process";
import { promisify } from "util";
import createFrontendProject from "./utils/frontend";
import createApiProject from "./utils/api";
import createFullstackProject from "./utils/fullstack";

const exec = promisify(child_process.exec);

export const DEFAULT_NAME = "starter";

// Generate a secure random key
export function generateSecureKey(length = 64): string {
  return crypto.randomBytes(length).toString("hex");
}

// Generate VAPID keys for web push notifications
export async function generateVapidKeys(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  try {
    // Try to use web-push package if installed
    await exec("npm list -g web-push");
    const { stdout } = await exec("npx web-push generate-vapid-keys --json");
    const keys = JSON.parse(stdout);
    return {
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
    };
  } catch (error) {
    // Fallback to crypto if web-push is not available
    const publicKey = crypto.randomBytes(32).toString("base64");
    const privateKey = crypto.randomBytes(32).toString("base64");
    return { publicKey, privateKey };
  }
}

async function main() {
  program
    .name("@untools/starter")
    .description("Create TypeScript fullstack projects with GraphQL")
    .argument("[project-directory]", "Directory to create the project in")
    .option("-y, --yes", "Skip prompts and use defaults")
    .option(
      "-t, --type <type>",
      "Project type: api, frontend, or fullstack",
      undefined // Remove default to enable interactive selection
    )
    .action(
      async (
        projectDirectory?: string,
        options?: { yes?: boolean; type?: string }
      ) => {
        // If no type is specified and not using --yes, prompt for type
        if (!options?.type && !options?.yes) {
          const typeAnswer = await inquirer.prompt([
            {
              type: "list",
              name: "projectType",
              message: "What type of project do you want to create?",
              choices: [
                { name: "API (Express, GraphQL, MongoDB)", value: "api" },
                { name: "Frontend (Next.js)", value: "frontend" },
                { name: "Fullstack (API + Frontend)", value: "fullstack" },
              ],
              default: "api",
            },
          ]);
          options = { ...options, type: typeAnswer.projectType };
        } else if (!options?.type) {
          // Default to API if using --yes without specifying type
          options = { ...options, type: "api" };
        }

        // Handle different project types
        switch (options?.type) {
          case "api":
            await createApiProject(projectDirectory, options);
            break;
          case "frontend":
            await createFrontendProject(projectDirectory, options);
            break;
          case "fullstack":
            await createFullstackProject(projectDirectory, options);
            break;
          default:
            console.log(
              chalk.red(
                "Invalid project type. Use 'api', 'frontend', or 'fullstack'"
              )
            );
            process.exit(1);
        }
      }
    );

  program.parse();
}

main().catch((error) => {
  console.error(chalk.red("Unexpected error:"), error);
  process.exit(1);
});
