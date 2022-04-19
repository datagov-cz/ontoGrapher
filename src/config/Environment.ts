import {
  getEnvInstance,
  setProcessEnv,
} from "@opendata-mvcr/assembly-line-shared";
import { Components } from "@opendata-mvcr/assembly-line-shared/dist/env/types";

type LocalVars = "PUBLIC_URL" | "AUTHENTICATION" | "PATTERN";

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
  // Pattern server location
  pattern: string;
} = {
  components: ENV.getComponents(),
  context: ENV.get("CONTEXT"),
  id: ENV.get("ID"),
  url: ENV.get("URL"),
  auth: ENV.get("AUTHENTICATION", "true") === "true",
  pattern: ENV.get("PATTERN"),
};
