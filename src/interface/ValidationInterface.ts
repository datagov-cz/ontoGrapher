export async function validateWorkspace(context: string, language: string) {
	let namespace = context.substring(0, context.lastIndexOf("/") + 1);
	let fragment = context.substring(context.lastIndexOf("/") + 1);
	let url = "https://kbss.felk.cvut.cz/sgov-server/workspaces/" + fragment + "/validate?namespace=" + namespace;
	return await fetch(url, {
		headers: {"Accept-language": language},
		method: "GET"
	}).then(result => result.json()).catch((e) => {
		console.log(e);
		return false;
	}).catch((e) => {
		console.log(e);
		return false;
	});
}