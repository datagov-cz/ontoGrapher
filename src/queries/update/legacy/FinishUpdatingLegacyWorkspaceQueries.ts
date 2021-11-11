import { AppSettings } from "../../../config/Variables";
import { updateLegacyWorkspaceToVersion3 } from "./UpdateLegacyWorkspaceToVersion3";

export async function finishUpdatingLegacyWorkspace(): Promise<string[]> {
  const queries: string[] = [];
  if (AppSettings.contextVersion <= 2) {
    queries.push(...updateLegacyWorkspaceToVersion3());
    AppSettings.contextVersion++;
  }
  return queries;
}
