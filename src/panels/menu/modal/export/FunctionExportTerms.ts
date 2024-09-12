import _ from "lodash";
import { Representation } from "../../../../config/Enum";
import {
  AppSettings,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../../../config/Variables";
import { parsePrefix } from "../../../../function/FunctionEditVars";
import {
  isElementHidden,
  isElementVisible,
} from "../../../../function/FunctionElem";
import {
  getActiveSourceConnections,
  getIntrinsicTropeTypeIDs,
} from "../../../../function/FunctionGetVars";

type exportTermObject = { [key: string]: string[] };
export const exportFunctions: {
  getSources: (terms: exportTermObject) => Promise<{ [key: string]: string }>;
  getSuperClassAttributes: (terms: exportTermObject, term: string) => string[];
  constructExportTerms: () => exportTermObject;
} = {
  getSources: async (terms) =>
    Object.fromEntries(_.intersection(Object.keys(terms), Object.keys(WorkspaceTerms)).map(term => [term, WorkspaceTerms[term].source]))
  ,
  getSuperClassAttributes: (terms, term) => {
    const stack = _.clone(WorkspaceTerms[term].subClassOf);
    const attributes: string[] = [];
    while (stack.length > 0) {
      const superClass = stack.pop();
      if (superClass && superClass in terms) {
        attributes.push(...terms[superClass]);
        stack.push(...WorkspaceTerms[superClass].subClassOf);
      }
    }
    return attributes;
  },
  constructExportTerms: () => {
    let exportTerms: exportTermObject = _.fromPairs(
      Object.keys(WorkspaceTerms)
        .filter(
          (t) =>
            WorkspaceElements[t].active &&
            !isElementHidden(t, AppSettings.selectedDiagram) &&
            // support all representations
            isElementVisible(WorkspaceTerms[t].types, Representation.FULL, true)
        )
        .map((t) => [t, []])
    );
    const relationships: exportTermObject = _.fromPairs(
      Object.keys(WorkspaceTerms)
        .filter((c) => {
          const id = Object.keys(WorkspaceLinks).find(
            (l) => WorkspaceLinks[l].iri === c
          );
          if (!id) return false;
          else
            return (
              WorkspaceTerms[c].types.includes(
                parsePrefix("z-sgov-pojem", "typ-vztahu")
              ) &&
              _.intersection(Object.keys(exportTerms), [
                WorkspaceLinks[id].source,
                WorkspaceLinks[id].target,
              ]).length > 0
            );
        })
        .map((t) => [t, []])
    );
    exportTerms = Object.assign(exportTerms, relationships);
    // relationships, but only those that don't have tropes
    const simpleRelationships = Object.keys(exportTerms).filter(
      (c) =>
        WorkspaceTerms[c].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vztahu")
        ) && getIntrinsicTropeTypeIDs(c).length === 0
    );
    // event types, but only those that don't have tropes
    const simpleEvents = Object.keys(exportTerms).filter(
      (t) =>
        WorkspaceTerms[t].types.includes(
          parsePrefix("z-sgov-pojem", "typ-události")
        ) && getIntrinsicTropeTypeIDs(t).length === 0
    );
    // we don't treat code lists any differently for now
    Object.keys(exportTerms).forEach((t) => {
      const activeToConnections = getActiveSourceConnections(t);
      exportTerms[t].push(...getIntrinsicTropeTypeIDs(t));
      exportTerms[t].push(
        ..._.intersection(
          activeToConnections.map((c) => WorkspaceLinks[c].iri),
          simpleRelationships
        )
      );
      exportTerms[t].push(
        ...simpleEvents.filter(
          (e) =>
            activeToConnections.find((c) => WorkspaceLinks[c].target === e) ||
            getActiveSourceConnections(e).find(
              (c) => WorkspaceLinks[c].target === t
            )
        )
      );
    });
    exportTerms = _.fromPairs(
      Object.entries(exportTerms).filter(
        (t) =>
          !simpleRelationships.includes(t[0]) &&
          !simpleEvents.includes(t[0]) &&
          (WorkspaceTerms[t[0]].types.includes(
            parsePrefix("z-sgov-pojem", "typ-objektu")
          ) ||
            t[1].length > 0)
      )
    );
    return exportTerms;
  },
};
