import Keycloak from 'keycloak-js';
import {Environment, getKeycloakAuthenticationURL, getKeycloakRealm} from "./Environment";

const keycloakConfig = {
	url: getKeycloakAuthenticationURL(),
	realm: getKeycloakRealm(),
	clientId: Environment.id
}
export const keycloak = Keycloak(keycloakConfig);
