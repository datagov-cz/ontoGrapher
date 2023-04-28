import { Links, WorkspaceLinks } from "../../../config/Variables";
import { LinkType } from "../../../config/Enum";
import { updateTermConnections } from "../UpdateConnectionQueries";

export function updateLegacyWorkspaceToVersion3(): string[] {
  const queries = [];
  for (const link in WorkspaceLinks) {
    WorkspaceLinks[link].hasInverse =
      WorkspaceLinks[link].type !== LinkType.GENERALIZATION &&
      WorkspaceLinks[link].iri in Links;
  }
  queries.push(
    updateTermConnections(
      ...Object.keys(WorkspaceLinks).filter(
        (link) => WorkspaceLinks[link].hasInverse
      )
    )
  );
  queries.push(
    updateTermConnections(
      ...Object.keys(WorkspaceLinks).filter(
        (link) => WorkspaceLinks[link].hasInverse
      )
    )
  );
  return queries;
}
