import { Representation } from "../../../../config/Enum";
import {
  WorkspaceElements,
  AppSettings,
  WorkspaceTerms,
  WorkspaceLinks,
} from "../../../../config/Variables";
import {
  isElementHidden,
  isElementVisible,
} from "../../../../function/FunctionElem";
import {
  getActiveToConnections,
  getIntrinsicTropeTypeIDs,
  getLabelOrBlank,
} from "../../../../function/FunctionGetVars";

export async function exportTermsText(
  exportLanguage: string
): Promise<[source: string, error: string]> {
  const fileID = "data:text/plain;charset=utf-8,";
  const carriageReturn = "\r\n";
  const diagramTerms = Object.keys(WorkspaceElements)
    .filter(
      (iri) =>
        WorkspaceElements[iri].active &&
        !isElementHidden(iri, AppSettings.selectedDiagram) &&
        isElementVisible(WorkspaceTerms[iri].types, Representation.COMPACT)
    )
    .sort();
  const source =
    fileID +
    diagramTerms
      .map((term) => {
        const termName =
          "- " +
          getLabelOrBlank(WorkspaceTerms[term].labels, exportLanguage) +
          carriageReturn;
        const tropes = getIntrinsicTropeTypeIDs(term)
          .map(
            (trope) =>
              "\t - " +
              getLabelOrBlank(WorkspaceTerms[trope].labels, exportLanguage)
          )
          .join(carriageReturn);
        const relationships = getActiveToConnections(term)
          .filter((link) => WorkspaceLinks[link].iri in WorkspaceTerms)
          .map(
            (link) =>
              "\t - " +
              getLabelOrBlank(
                WorkspaceTerms[WorkspaceLinks[link].iri].labels,
                exportLanguage
              )
          )
          .join(carriageReturn);
        return (
          termName +
          tropes +
          (tropes && relationships ? carriageReturn : "") +
          relationships +
          (tropes !== relationships ? carriageReturn : "")
        );
      })
      .join(carriageReturn);
  return [source, ""];
}
