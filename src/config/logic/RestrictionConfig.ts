import { Restriction } from "../../datatypes/Restriction";
import { AppSettings, WorkspaceLinks, WorkspaceTerms } from "../Variables";
import { addLink } from "../../function/FunctionCreateVars";
import {
  getActiveToConnections,
  getDefaultCardinality,
  getNewLink,
} from "../../function/FunctionGetVars";
import { LinkType } from "../Enum";
import { Cardinality } from "../../datatypes/Cardinality";
import _ from "lodash";

export const RestrictionConfig: {
  [key: string]: (iri: string, restriction: Restriction) => string | void;
} = {
  "http://www.w3.org/2002/07/owl#someValuesFrom": (
    iri: string,
    restriction: Restriction
  ) => createConnection(iri, restriction),
  "http://www.w3.org/2002/07/owl#allValuesFrom": (
    iri: string,
    restriction: Restriction
  ) => createConnection(iri, restriction),
  "http://www.w3.org/2002/07/owl#minQualifiedCardinality": (
    iri: string,
    restriction: Restriction
  ) => createCardinality(iri, restriction),
  "http://www.w3.org/2002/07/owl#maxQualifiedCardinality": (
    iri: string,
    restriction: Restriction
  ) => createCardinality(iri, restriction),
} as const;

function createConnection(iri: string, restriction: Restriction) {
  if (restriction.inverse) return;
  const target = restriction.target;
  if (
    !getActiveToConnections(iri).find(
      (conn) =>
        WorkspaceLinks[conn].iri === restriction.onProperty &&
        WorkspaceLinks[conn].target === target
    ) &&
    target in WorkspaceTerms
  ) {
    const link = getNewLink(LinkType.DEFAULT);
    const linkID = link.id as string;
    addLink(linkID, restriction.onProperty, iri, target);
    return linkID;
  }
}

function createCardinality(iri: string, restriction: Restriction) {
  if (iri && restriction.target && restriction.onClass) {
    const linkID = Object.keys(WorkspaceLinks).find(
      (link) =>
        getActiveToConnections(restriction.source).includes(link) &&
        WorkspaceLinks[link].iri === restriction.onProperty &&
        restriction.onClass === WorkspaceLinks[link].target
    );
    if (linkID) {
      const pos = restriction.restriction.includes("max");
      const originalCardinality = _.cloneDeep(
        restriction.inverse
          ? WorkspaceLinks[linkID].sourceCardinality
          : WorkspaceLinks[linkID].targetCardinality
      );
      let newCardinality = new Cardinality(
        pos
          ? originalCardinality.getFirstCardinality() ||
            AppSettings.defaultCardinality1
          : restriction.target,
        pos
          ? restriction.target
          : originalCardinality.getSecondCardinality() ||
            AppSettings.defaultCardinality2
      );
      if (!newCardinality.checkCardinalities())
        newCardinality = getDefaultCardinality();
      if (restriction.inverse) {
        WorkspaceLinks[linkID].sourceCardinality = _.cloneDeep(newCardinality);
      } else {
        WorkspaceLinks[linkID].targetCardinality = _.cloneDeep(newCardinality);
      }
    }
  }
}
