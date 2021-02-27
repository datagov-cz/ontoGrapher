import isUrl from "is-url";
import {Locale} from "./Locale";
import {Components} from "../datatypes/Components";
import yaml from "yaml";

export const ENV = {
	...Object.keys(process.env).reduce<Record<string, string>>((acc, key) => {
		const strippedKey = key.replace('REACT_APP_', '')
		acc[strippedKey] = process.env[key]!
		return acc
	}, {}),
	...(window as any).__config__,
}

export const Environment: {
	// JSON object of other components in the vocabulary development pipeline software kit
	components: Components
	// Production / development context
	context: string,
	// ID of the application (for identification and authentication)
	id: string,
	// URL of the deployment
	url: string
} = {
	components: getComponentsVariable('COMPONENTS'),
	context: getEnvironmentVariable('CONTEXT'),
	id: getEnvironmentVariable('ID'),
	url: getEnvironmentVariable('URL'),
}

/**
 * Checks if the given environment variable exists.
 * @param variableKey The environment variable to get
 */
export function getEnvironmentVariable(variableKey: string): string {
	const variable = ENV[variableKey];
	if (variable) return variable;
	else throw new Error(`Error: environment variable ${variableKey} not found`);
}

/**
 * Attempts to retrieve the Components JSON from the environment variable.
 * Expects a YAML format encoded in a base64 string, which is then parsed as an object.
 * @param variableKey The environment variable to get
 */
export function getComponentsVariable(variableKey: string): Components {
	try {
		const componentString = getEnvironmentVariable(variableKey);
		const componentDecoded = new TextDecoder('utf-8').decode(
			Uint8Array.from(atob(componentString), (c) => c.charCodeAt(0)))
		return yaml.parse(componentDecoded);
	} catch (e) {
		console.error(Locale.en.errorParsingEnvironmentVariable);
		throw new Error(e);
	}
}

/**
 * Parses the keycloak realm from the OIDC URL.
 */
export function getKeycloakRealm(): string {
	const keycloakRealm = Environment.components.authServer.url.split("/").filter(str => str !== "").pop();
	if (keycloakRealm !== undefined && keycloakRealm !== "") return keycloakRealm;
	else throw new Error(Locale.en.errorParsingKeycloakRealm);
}

/**
 * Parses the keycloak authentication URL from the OIDC URL.
 */
export function getKeycloakAuthenticationURL(): string {
	const searchString = "/auth";
	const keycloakURL = Environment.components.authServer.url.substring(0, Environment.components.authServer.url.indexOf(searchString) + searchString.length);
	if (keycloakURL !== undefined && isUrl(keycloakURL)) return keycloakURL;
	else throw new Error(Locale.en.errorParsingKeycloakURL);
}