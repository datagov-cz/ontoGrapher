import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../config/Variables";
import { Restriction } from "../datatypes/Restriction";
import { getElemFromIRI, getNewLink } from "./FunctionGetVars";
import { LinkType } from "../config/Enum";
import { addLink } from "./FunctionCreateVars";

export function createRestriction(
  restrictions: Restriction[],
  restriction: string,
  onProperty: string,
  target: { type: string; value: string },
  inverse: boolean,
  onClass?: string
) {
  if (target.type !== "bnode") {
    const newRestriction = new Restriction(
      restriction,
      onProperty,
      target.value,
      onClass,
      inverse
    );
    for (const rest of restrictions) {
      if (rest.compare(newRestriction)) {
        return;
      }
    }
    restrictions.push(newRestriction);
    restrictions.sort((a: Restriction, b: Restriction) =>
      a.restriction.localeCompare(b.restriction)
    );
  }
}

export function initConnections(): string[] {
  const linksToPush = [];
  for (const iri in WorkspaceTerms) {
    for (const restriction of WorkspaceTerms[iri].restrictions) {
      const newLink = restriction.initRestriction(iri);
      if (newLink) linksToPush.push(newLink);
    }

    for (const subClassOf of WorkspaceTerms[iri].subClassOf) {
      if (subClassOf in WorkspaceTerms) {
        const domainID = getElemFromIRI(iri);
        const rangeID = Object.keys(WorkspaceElements).find(
          (element) => WorkspaceElements[element].iri === subClassOf
        );
        if (
          domainID &&
          rangeID &&
          !WorkspaceElements[domainID].connections.find(
            (conn) =>
              WorkspaceElements[WorkspaceLinks[conn].target].iri === subClassOf
          )
        ) {
          let linkGeneralization = getNewLink(LinkType.GENERALIZATION);
          const id = linkGeneralization.id as string;
          addLink(
            id,
            AppSettings.ontographerContext + "/uml/generalization",
            domainID,
            rangeID,
            LinkType.GENERALIZATION
          );
          WorkspaceElements[domainID].connections.push(id);
          linksToPush.push(id);
        }
      }
    }
  }
  return linksToPush;
}
