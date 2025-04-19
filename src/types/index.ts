type PackageJson = {
  name: string;
  version: string;
  description: string;
  [key: string]: any;
};

type ProjectOptions = {
  appName: string;
  appPort: string;
  includeDocker: boolean;
  includeMongoDB: boolean;
  includeEmail: boolean;
  includeOAuth: boolean;
  includePayments: boolean;
  includeGemini: boolean;
  includeWebPush: boolean;
};

type FrontendOptions = ProjectOptions & {
  apiUrl: string;
  useCloudinary: boolean;
  googleOAuth: boolean;
  webPushNotifications: boolean;
};

export { PackageJson, ProjectOptions, FrontendOptions };
