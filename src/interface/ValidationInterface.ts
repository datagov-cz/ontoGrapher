import { Environment } from "../config/Environment";

export async function validateWorkspace(contexts: string[], language: string) {
  const url = `${
    Environment.components["al-sgov-server"].url
  }/validate?vocabularyContextIri=${contexts.join("&vocabularyContextIri=")}`;
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
