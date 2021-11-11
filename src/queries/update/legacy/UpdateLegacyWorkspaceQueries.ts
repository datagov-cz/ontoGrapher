import { updateLegacyWorkspaceToVersion2 } from "./UpdateLegacyWorkspaceToVersion2";
import { INSERT } from "@tpluscode/sparql-builder";
import { AppSettings } from "../../../config/Variables";
import { updateLegacyWorkspaceToVersion4 } from "./UpdateLegacyWorkspaceToVersion4";

export async function updateLegacyWorkspace(
  contextIRI: string,
  contextEndpoint: string
): Promise<string[]> {
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
  if (version === 3) {
    queries.push(
      INSERT.DATA`${await updateLegacyWorkspaceToVersion4(
        contextIRI,
        contextEndpoint
      )}`.build()
    );
    version++;
  }
  return queries;
}
