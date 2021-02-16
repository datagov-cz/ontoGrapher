type Component<T = {}> = {
	name: string
	url: string
	meta: T
}

export type Components = {
	sgovServer: Component
	// repositoryPath: relative path to the repository (e.g. /repositories/testOG)
	dbServer: Component<{ repositoryPath: string }>
	// realm: Keycloak realm
	authServer: Component<{ realm: string }>
	ontographer: Component<{ workspacePath: string }>
	termitServer: Component
	termit: Component<{ workspacePath: string }>
	missionControl: Component
	issueTracker: Component<{ newBug: string; newFeature: string }>
}