/// <reference types="react-scripts" />
declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production' | 'test'
		PUBLIC_URL: string
		REACT_APP_KEYCLOAK_URL: string
		REACT_APP_KEYCLOAK_REALM: string
		REACT_APP_KEYCLOAK_CLIENT: string
		REACT_APP_CONTEXT_ENDPOINT: string
	}
}

interface Window {
	Stripe: any
}
