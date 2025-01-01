import config from "./config.json";

type Environment = "local" | "production";

const getEnvironment = (): Environment => {
  // Check if we're in development mode (Vite sets this automatically)
//   return import.meta.env.DEV ? "local" : "production";

    return "production";
};

export const getConfig = () => {
  const env = getEnvironment();
  return config[env];
};
