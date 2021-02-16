/// <reference types="react-scripts" />
declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production' | 'test'
		PUBLIC_URL: string
		REACT_APP_URL: string
		REACT_APP_ID: string
		REACT_APP_COMPONENT: string
		REACT_APP_CONTEXT: string
	}
}

interface Window {
	Stripe: any
}
