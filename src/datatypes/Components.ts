type Component<T = {}> = {
	name: string
	url: string
	meta: T
}

export type Components = {
	sgovServer: Component
	dbServer: Component
	authServer: Component
	ontographer: Component<{ workspacePath: string }>
	termitServer: Component
	termit: Component<{ workspacePath: string }>
	missionControl: Component
	issueTracker: Component<{ newBug: string; newFeature: string }>
}
