import Keycloak from 'keycloak-js';
import {Environment} from "./Variables";
import {getKeycloakAuthenticationURL, getKeycloakRealm} from "../function/FunctionGetVars";

const keycloakConfig = {
	url: getKeycloakAuthenticationURL(),
	realm: getKeycloakRealm(),
	clientId: Environment.id
}
export const keycloak = Keycloak(keycloakConfig);
