import Keycloak from "keycloak-js";
import { Environment } from "./Environment";
import { Locale } from "./Locale";

// Extract Keycloak URL and realm from generic OIDC auth URL
const OIDC_URL = Environment.components["al-auth-server"].url;
const match = /^(.+)\/realms\/(.+)$/.exec(OIDC_URL);
if (!match) {
  throw new Error(Locale.en.errorParsingKeycloakURL);
}
const [, url, realm] = match;

const keycloakConfig = {
  url,
  realm,
  clientId: Environment.id,
};
export const keycloak = Keycloak(keycloakConfig);
