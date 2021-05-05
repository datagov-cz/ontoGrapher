import { updateLegacyWorkspaceToVersion2 } from "./UpdateLegacyWorkspaceToVersion2";
import { INSERT } from "@tpluscode/sparql-builder";
import { updateProjectSettings } from "../UpdateMiscQueries";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";

export async function updateLegacyWorkspace(
  legacyVersion: number,
  contextIRI: string,
  contextEndpoint: string,
  handleStatus: Function
): Promise<string[]> {
  handleStatus(
    true,
    Locale[AppSettings.viewLanguage].updatingWorkspaceVersion,
    true,
    false
  );
  const queries: string[] = [];
  if (legacyVersion === 1)
    queries.push(
      INSERT.DATA`${await updateLegacyWorkspaceToVersion2(
        contextIRI,
        contextEndpoint
      )}`.build()
    );
  queries.push(updateProjectSettings(contextIRI, 0));
  return queries;
}
