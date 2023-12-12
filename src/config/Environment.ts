import {
  getEnvInstance,
  setProcessEnv,
} from "@opendata-mvcr/assembly-line-shared";
import { Components } from "@opendata-mvcr/assembly-line-shared/dist/env/types";

type LocalVars =
  | "PUBLIC_URL"
  | "AUTHENTICATION"
  | "DEBUG_DATA"
  | "TERM_LANGUAGE";

setProcessEnv(process.env);
const ENV = getEnvInstance<LocalVars>();

export const Environment: {
  // JSON object of other components in the vocabulary development pipeline software kit
  components: Components;
  // Production / development context
  context: string;
  // ID of the application (for identification and authentication)
  id: string;
  // URL of the deployment
  url: string;
  // Authentication on/off switch
  auth: boolean;
  // Load local debug data instead of fetching off a DB
  debug: boolean;
  // Default language
  language: string;
} = {
  components: ENV.getComponents(),
  context: ENV.get("CONTEXT"),
  id: ENV.get("ID"),
  url: ENV.get("URL"),
  auth: ENV.get("AUTHENTICATION", "true") === "true",
  debug: ENV.get("DEBUG", "true") === "true",
  language: ENV.get("TERM_LANGUAGE"),
};
