import { Environment } from "../config/Environment";

export async function validateWorkspace(context: string, language: string) {
  const namespace = context.substring(0, context.lastIndexOf("/") + 1);
  const fragment = context.substring(context.lastIndexOf("/") + 1);
  const url = `${Environment.components["al-sgov-server"].url}/workspaces/${fragment}/validate?namespace=${namespace}`;
  return await fetch(url, {
    headers: { "Accept-language": language },
    method: "GET",
  })
    .then((result) => result.json())
    .catch((e) => {
      console.error(e);
      return false;
    })
    .catch((e) => {
      console.error(e);
      return false;
    });
}
