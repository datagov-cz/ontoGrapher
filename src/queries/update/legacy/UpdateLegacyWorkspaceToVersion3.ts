import { Links, WorkspaceLinks } from "../../../config/Variables";
import { LinkType } from "../../../config/Enum";
import { updateConnections } from "../UpdateConnectionQueries";

export function updateLegacyWorkspaceToVersion3(): string[] {
  const queries = [];
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
  return queries;
}
