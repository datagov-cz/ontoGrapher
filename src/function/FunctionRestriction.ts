import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../config/Variables";
import { Restriction } from "../datatypes/Restriction";
import { getActiveSourceConnections, getNewLink } from "./FunctionGetVars";
import { LinkType } from "../config/Enum";
import { addLink } from "./FunctionCreateVars";
import { parsePrefix } from "./FunctionEditVars";
import { setCompactLinkCardinalitiesFromFullComponents } from "./FunctionLink";
import { mvp1IRI, mvp2IRI } from "./FunctionGraph";
import * as _ from "lodash";
import { filterEquivalent } from "./FunctionEquivalents";

export function createRestriction(
  restriction: Restriction,
  restrictions: Restriction[]
) {
  for (const rest of restrictions) if (rest.compare(restriction)) return;
  restrictions.push(restriction);
}

export function initConnections(): { add: string[]; del: string[] } {
  const linksToPush: string[] = [];
  const linksToDelete: string[] = Object.keys(WorkspaceLinks);
  const restrictions = Object.keys(WorkspaceTerms).flatMap(
    (term) => WorkspaceTerms[term].restrictions
  );
  for (const restriction of restrictions) {
    if (restriction.onClass) restriction.initRestriction(restriction.source);
    else {
      const find = getActiveSourceConnections(restriction.source).find(
        (conn) =>
          WorkspaceLinks[conn].iri === restriction.onProperty &&
          WorkspaceLinks[conn].target === restriction.target
      );
      if (find && restriction.target in WorkspaceTerms)
        _.pull(linksToDelete, find);
      else {
        const newLink = restriction.initRestriction(restriction.source);
        if (newLink) linksToPush.push(newLink);
      }
    }
  }
  for (const iri in WorkspaceTerms) {
    for (const subClassOf of WorkspaceTerms[iri].subClassOf) {
      if (subClassOf in WorkspaceTerms) {
        const rangeID = Object.keys(WorkspaceElements).find(
          (element) => element === subClassOf
        );
        const find = getActiveSourceConnections(iri).find(
          (conn) => WorkspaceLinks[conn].target === subClassOf
        );
        if (find) _.pull(linksToDelete, find);
        if (rangeID && !find) {
          const linkGeneralization = getNewLink(LinkType.GENERALIZATION);
          const id = linkGeneralization.id as string;
          addLink(
            id,
            AppSettings.ontographerContext + "/uml/generalization",
            iri,
            rangeID,
            LinkType.GENERALIZATION
          );
          linksToPush.push(id);
        }
      }
    }
    if (
      filterEquivalent(
        WorkspaceTerms[iri].types,
        parsePrefix("z-sgov-pojem", "typ-vztahu")
      )
    ) {
      const connections: string[] = getActiveSourceConnections(iri);
      if (connections.length > 1) {
        const sourceLink: string | undefined = connections.find(
          (src) => WorkspaceLinks[src].iri === mvp1IRI
        );
        const targetLink: string | undefined = connections.find(
          (src) => WorkspaceLinks[src].iri === mvp2IRI
        );
        if (sourceLink && targetLink) {
          const source = WorkspaceLinks[sourceLink].target;
          const target = WorkspaceLinks[targetLink].target;
          const find = Object.keys(WorkspaceLinks).find(
            (link) =>
              WorkspaceLinks[link].active &&
              WorkspaceLinks[link].iri === iri &&
              WorkspaceLinks[link].source === source &&
              WorkspaceLinks[link].target === target
          );
          if (find) _.pull(linksToDelete, find);
          if (!find) {
            const newLink = getNewLink();
            const newLinkID = newLink.id as string;
            addLink(newLinkID, iri, source, target);
            setCompactLinkCardinalitiesFromFullComponents(
              newLinkID,
              sourceLink,
              targetLink
            );
            linksToPush.push(newLinkID);
          }
        }
      }
    }
  }
  return { add: linksToPush, del: linksToDelete };
}
