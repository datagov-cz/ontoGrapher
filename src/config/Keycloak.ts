import Keycloak from 'keycloak-js';

const keycloakConfig = {
	url: process.env.REACT_APP_KEYCLOAK_URL,
	realm: process.env.REACT_APP_KEYCLOAK_REALM,
	clientId: process.env.REACT_APP_KEYCLOAK_CLIENT
}
export const keycloak = Keycloak(keycloakConfig);