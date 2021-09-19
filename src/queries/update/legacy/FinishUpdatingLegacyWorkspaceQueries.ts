import { Locale } from "../../../config/Locale";
import { AppSettings, Links, WorkspaceLinks } from "../../../config/Variables";
import { updateConnections } from "../UpdateConnectionQueries";
import { LinkType } from "../../../config/Enum";

export async function finishUpdatingLegacyWorkspace(
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
  if (AppSettings.contextVersion <= 2) {
    for (const link in WorkspaceLinks) {
      WorkspaceLinks[link].hasInverse =
        WorkspaceLinks[link].type !== LinkType.GENERALIZATION &&
        WorkspaceLinks[link].iri in Links;
    }
    queries.push(
      ...Object.keys(WorkspaceLinks)
        .filter((link) => WorkspaceLinks[link].hasInverse)
        .map((link) => updateConnections(link))
    );
    queries.push(
      ...Object.keys(WorkspaceLinks)
        .filter((link) => WorkspaceLinks[link].hasInverse)
        .map((link) => updateConnections(link))
    );
    AppSettings.contextVersion++;
  }
  return queries;
}
