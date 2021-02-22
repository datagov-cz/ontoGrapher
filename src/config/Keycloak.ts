import Keycloak from 'keycloak-js';
import {Environment} from "./Variables";
import {getKeycloakAuthenticationURL, getKeycloakRealm} from "../function/FunctionGetVars";

const keycloakConfig = {
	url: getKeycloakAuthenticationURL(Environment.components.authServer.url),
	realm: getKeycloakRealm(Environment.components.authServer.url),
	clientId: Environment.id
}
export const keycloak = Keycloak(keycloakConfig);
