type Component<T = {}> = {
	name: string
	url: string
	meta: T
}

export type Components = {
  'al-sgov-server': Component
  'al-db-server': Component
  'al-auth-server': Component
  'al-ontographer': Component<{ 'workspace-path': string }>
  'al-termit-server': Component
  'al-termit': Component<{ 'workspace-path': string }>
  'al-mission-control': Component
  'al-issue-tracker': Component<{ 'new-bug': string; 'new-feature': string }>
}
