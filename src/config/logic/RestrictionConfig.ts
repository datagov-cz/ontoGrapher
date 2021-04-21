import { Restriction } from "../../datatypes/Restriction";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../Variables";
import { parsePrefix } from "../../function/FunctionEditVars";
import { addLink } from "../../function/FunctionCreateVars";
import {
  getDefaultCardinality,
  getElemFromIRI,
  getNewLink,
} from "../../function/FunctionGetVars";
import { LinkType } from "../Enum";
import { Cardinality } from "../../datatypes/Cardinality";
import _ from "underscore";

export const RestrictionConfig: {
  [key: string]: (iri: string, restriction: Restriction) => string | void;
} = {
  "http://www.w3.org/2002/07/owl#someValuesFrom": (
    iri: string,
    restriction: Restriction
  ) => createConnection(iri, restriction, parsePrefix("owl", "allValuesFrom")),
  "http://www.w3.org/2002/07/owl#allValuesFrom": (
    iri: string,
    restriction: Restriction
  ) => createConnection(iri, restriction, parsePrefix("owl", "someValuesFrom")),
  "http://www.w3.org/2002/07/owl#minQualifiedCardinality": (
    iri: string,
    restriction: Restriction
  ) => createCardinality(iri, restriction),
  "http://www.w3.org/2002/07/owl#maxQualifiedCardinality": (
    iri: string,
    restriction: Restriction
  ) => createCardinality(iri, restriction),
} as const;

function createConnection(iri: string, restriction: Restriction, pred: string) {
  if (
    _.find(WorkspaceTerms[iri].restrictions, {
      restriction: pred,
      onProperty: restriction.onProperty,
      target: restriction.target,
    })
  ) {
    const id = getElemFromIRI(iri);
    const target = getElemFromIRI(restriction.target);
    if (
      id &&
      target &&
      !WorkspaceElements[id].connections.find(
        (conn) =>
          WorkspaceLinks[conn].iri === restriction.onProperty &&
          WorkspaceLinks[conn].target === target
      )
    ) {
      const link = getNewLink(LinkType.DEFAULT);
      const linkID = link.id as string;
      addLink(linkID, restriction.onProperty, id, target);
      WorkspaceElements[id].connections.push(linkID);
      return linkID;
    }
  }
}

function createCardinality(iri: string, restriction: Restriction) {
  const elemID = getElemFromIRI(iri) || "";
  if (elemID !== "" && restriction.target !== "" && restriction.onClass) {
    const linkID = Object.keys(WorkspaceLinks).find(
      (link) =>
        WorkspaceElements[elemID].connections.includes(link) &&
        WorkspaceLinks[link].active &&
        WorkspaceLinks[link].iri === restriction.onProperty &&
        restriction.onClass ===
          WorkspaceElements[WorkspaceLinks[link].target].iri
    );
    if (linkID) {
      const pos = restriction.restriction.includes("max");
      WorkspaceLinks[linkID].targetCardinality = pos
        ? new Cardinality(
            WorkspaceLinks[linkID].targetCardinality.getFirstCardinality() ||
              AppSettings.defaultCardinality1,
            restriction.target
          )
        : new Cardinality(
            restriction.target,
            WorkspaceLinks[linkID].targetCardinality.getSecondCardinality() ||
              AppSettings.defaultCardinality2
          );
      if (!WorkspaceLinks[linkID].targetCardinality.checkCardinalities())
        WorkspaceLinks[linkID].targetCardinality = getDefaultCardinality();
    }
  }
}
