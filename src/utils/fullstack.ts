import chalk from "chalk";
import path from "path";
import fs from "fs";
import { generatePortFromName } from "@untools/port-gen";
import { DEFAULT_NAME } from "..";
import { ProjectOptions } from "../types/index";
import createApiProject from "./api";
import createFrontendProject from "./frontend";

async function createFullstackProject(
  projectDirectory: string = DEFAULT_NAME,
  options?: { yes?: boolean },
  baseOptions?: Partial<ProjectOptions>
) {
  const apiDir = `${projectDirectory}-api`;
  const frontendDir = `${projectDirectory}-client`;

  console.log(
    chalk.blue(`Creating a new full-stack project in ${projectDirectory}...`)
  );

  // Create a parent directory if it doesn't exist
  const parentDir = path.join(process.cwd(), projectDirectory);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // Create API project
  process.chdir(parentDir);
  await createApiProject(apiDir, options, baseOptions);

  // Create frontend project with API URL pointing to the API project
  const apiPort =
    baseOptions?.appPort || generatePortFromName(apiDir).toString();
  const frontendBaseOptions = {
    ...baseOptions,
    appName: frontendDir,
  };

  await createFrontendProject(frontendDir, options, frontendBaseOptions);

  // Create a root package.json with scripts to run both projects
  const rootPkgPath = path.join(parentDir, "package.json");
  const rootPkg = {
    name: projectDirectory,
    version: "0.1.0",
    private: true,
    workspaces: [apiDir, frontendDir],
    scripts: {
      dev: 'concurrently "npm run dev:api" "npm run dev:client"',
      "dev:api": `cd ${apiDir} && npm run dev`,
      "dev:client": `cd ${frontendDir} && npm run dev`,
      build: "npm run build:api && npm run build:client",
      "build:api": `cd ${apiDir} && npm run build`,
      "build:client": `cd ${frontendDir} && npm run build`,
      start: 'concurrently "npm run start:api" "npm run start:client"',
      "start:api": `cd ${apiDir} && npm run start`,
      "start:client": `cd ${frontendDir} && npm run start`,
      codegen: `cd ${frontendDir} && npm run codegen`,
    },
    devDependencies: {
      concurrently: "^8.2.2",
    },
  };

  fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2));

  // Create a root README.md
  const readmePath = path.join(parentDir, "README.md");
  const readmeContent = `
# ${projectDirectory}

Full-stack application with TypeScript, GraphQL, Express, MongoDB, and Next.js.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development servers:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Generate GraphQL types:
   \`\`\`bash
   npm run codegen
   \`\`\`

## Structure

- \`${apiDir}/\`: Backend API with Express, GraphQL, and MongoDB
- \`${frontendDir}/\`: Frontend with Next.js

## Scripts

- \`npm run dev\`: Start both API and client in development mode
- \`npm run dev:api\`: Start only the API server
- \`npm run dev:client\`: Start only the Next.js client
- \`npm run build\`: Build both projects
- \`npm run start\`: Start both projects in production mode
- \`npm run codegen\`: Generate GraphQL types for the frontend

## Generated with @untools/ts-graphql-api

This project was scaffolded using [@untools/ts-graphql-api](https://www.npmjs.com/package/@untools/ts-graphql-api).
`;

  fs.writeFileSync(readmePath, readmeContent);

  console.log(
    chalk.green(
      "\nSuccess! Your new full-stack project has been created in " +
        projectDirectory
    )
  );
  console.log("\nNext steps:");
  console.log(chalk.cyan(`  cd ${projectDirectory}`));
  console.log(chalk.cyan("  npm install"));
  console.log(chalk.cyan("  npm run dev"));
}

export default createFullstackProject;
