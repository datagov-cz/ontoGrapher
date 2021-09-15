import { updateLegacyWorkspaceToVersion2 } from "./UpdateLegacyWorkspaceToVersion2";
import { INSERT } from "@tpluscode/sparql-builder";
import { Locale } from "../../../config/Locale";
import { AppSettings } from "../../../config/Variables";

export async function updateLegacyWorkspace(
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
  let version = AppSettings.contextVersion;
  if (version === 1) {
    queries.push(
      INSERT.DATA`${await updateLegacyWorkspaceToVersion2(
        contextIRI,
        contextEndpoint
      )}`.build()
    );
    version++;
  }
  return queries;
}
