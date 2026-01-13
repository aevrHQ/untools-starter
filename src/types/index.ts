interface PackageJson {
  name: string;
  version: string;
  description?: string;
  main?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

interface ProjectOptions {
  appName: string;
  appPort: string;
  includeDocker: boolean;
  database: "mongodb" | "postgres";
  includeDbDocker: boolean; // Docker container for the selected database
  includeEmail: boolean;
  includeOAuth: boolean;
  includePayments: boolean;
  includeGemini: boolean;
  includeWebPush: boolean;
  includeStorage: boolean;
  storageProvider?: "aws" | "cloudinary";
}

type FrontendOptions = ProjectOptions & {
  apiUrl: string;
  useCloudinary: boolean;
  googleOAuth: boolean;
  webPushNotifications: boolean;
};

export { PackageJson, ProjectOptions, FrontendOptions };
