import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../config/Variables";
import { Restriction } from "../datatypes/Restriction";
import { getActiveToConnections, getNewLink } from "./FunctionGetVars";
import { LinkType } from "../config/Enum";
import { addLink } from "./FunctionCreateVars";
import { parsePrefix } from "./FunctionEditVars";
import { constructFullConnections } from "./FunctionLink";
import { mvp1IRI, mvp2IRI } from "./FunctionGraph";
import _ from "lodash";

export function createRestriction(
  restriction: Restriction,
  restrictions: Restriction[]
) {
  for (const rest of restrictions) if (rest.compare(restriction)) return;
  restrictions.push(restriction);
}

export function initConnections(): string[] {
  const linksToPush = [];
  const restrictions = _.flatten(
    Object.keys(WorkspaceTerms).map((term) => WorkspaceTerms[term].restrictions)
  ).sort((a, b) => a.restriction.localeCompare(b.restriction));
  for (const restriction of restrictions) {
    const newLink = restriction.initRestriction(restriction.source);
    if (newLink) linksToPush.push(newLink);
  }
  for (const iri in WorkspaceTerms) {
    for (const subClassOf of WorkspaceTerms[iri].subClassOf) {
      if (subClassOf in WorkspaceTerms) {
        const rangeID = Object.keys(WorkspaceElements).find(
          (element) => element === subClassOf
        );
        if (
          rangeID &&
          !getActiveToConnections(iri).find(
            (conn) => WorkspaceLinks[conn].target === subClassOf
          )
        ) {
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
      WorkspaceTerms[iri].types.includes(
        parsePrefix("z-sgov-pojem", "typ-vztahu")
      )
    ) {
      const connections: string[] = getActiveToConnections(iri);
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
          if (!find) {
            const newLink = getNewLink();
            const newLinkID = newLink.id as string;
            addLink(newLinkID, iri, source, target);
            constructFullConnections(newLinkID, sourceLink, targetLink);
            linksToPush.push(newLinkID);
          }
        }
      }
    }
  }
  return linksToPush;
}
