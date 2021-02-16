import Keycloak from 'keycloak-js';
import {Environment} from "./Variables";

const keycloakConfig = {
	url: Environment.components.authServer.url,
	realm: Environment.components.authServer.meta.realm,
	clientId: Environment.id
}
export const keycloak = Keycloak(keycloakConfig);