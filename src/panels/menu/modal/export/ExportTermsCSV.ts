import { Representation } from "../../../../config/Enum";
import {
  WorkspaceElements,
  AppSettings,
  WorkspaceTerms,
  Stereotypes,
  WorkspaceLinks,
} from "../../../../config/Variables";
import { parsePrefix } from "../../../../function/FunctionEditVars";
import { isElementVisible } from "../../../../function/FunctionElem";
import {
  getLabelOrBlank,
  getIntrinsicTropeTypeIDs,
  getActiveToConnections,
} from "../../../../function/FunctionGetVars";

export function exportTermsCSV(exportLanguage: string): string {
  const fileID = "data:text/csv;charset=utf-8,";
  const carriageReturn = "\r\n";
  const diagramTerms = Object.keys(WorkspaceElements)
    .filter(
      (iri) =>
        WorkspaceElements[iri].active &&
        !WorkspaceElements[iri].hidden[AppSettings.selectedDiagram] &&
        isElementVisible(WorkspaceTerms[iri].types, Representation.COMPACT)
    )
    .sort();
  const rowDescriptionRow =
    ["subjekt/objekt", "údaj", "typ údaje", "popis"].join(",") + carriageReturn;
  const source =
    fileID +
    rowDescriptionRow +
    diagramTerms
      .map((term) => {
        const termRow =
          [
            getLabelOrBlank(WorkspaceTerms[term].labels, exportLanguage),
            "",
            "",
            WorkspaceTerms[term].definitions[exportLanguage],
          ].join(",") + carriageReturn;

        const tropeRows = getIntrinsicTropeTypeIDs(term)
          .map((trope) =>
            [
              "",
              getLabelOrBlank(WorkspaceTerms[trope].labels, exportLanguage),
              getLabelOrBlank(
                Stereotypes[parsePrefix("z-sgov-pojem", "typ-vlastnosti")]
                  .labels,
                exportLanguage
              ),
              WorkspaceTerms[trope].definitions[exportLanguage],
            ].join(",")
          )
          .join(carriageReturn);

        const relationshipRows = getActiveToConnections(term)
          .filter((link) => WorkspaceLinks[link].iri in WorkspaceTerms)
          .map(
            (link) =>
              [
                "",
                getLabelOrBlank(
                  WorkspaceTerms[WorkspaceLinks[link].iri].labels,
                  exportLanguage
                ),
                getLabelOrBlank(
                  Stereotypes[parsePrefix("z-sgov-pojem", "typ-vztahu")].labels,
                  exportLanguage
                ),
                WorkspaceTerms[WorkspaceLinks[link].iri].definitions[
                  exportLanguage
                ],
              ].join(",") +
              carriageReturn +
              [
                "",
                "",
                "",
                getLabelOrBlank(
                  WorkspaceTerms[WorkspaceLinks[link].target].labels,
                  exportLanguage
                ),
              ].join(",")
          )
          .join(carriageReturn);

        return (
          termRow +
          tropeRows +
          (relationshipRows ? carriageReturn : "") +
          relationshipRows +
          (tropeRows !== relationshipRows ? carriageReturn : "")
        );
      })
      .join(carriageReturn);
  return source;
}
