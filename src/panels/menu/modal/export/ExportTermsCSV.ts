import { RepresentationConfig } from "./../../../../config/logic/RepresentationConfig";
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
import { processQuery } from "../../../../interface/TransactionInterface";
import * as _ from "lodash";

export async function exportTermsCSV(
  exportLanguage: string
): Promise<[source: string, error: string]> {
  const fileID = "data:text/csv;charset=utf-8,";
  const carriageReturn = "\r\n";
  const diagramTerms = Object.keys(WorkspaceElements)
    .filter(
      (iri) =>
        WorkspaceElements[iri].active &&
        !WorkspaceElements[iri].hidden[AppSettings.selectedDiagram] &&
        isElementVisible(
          WorkspaceTerms[iri].types,
          Representation.COMPACT,
          true
        )
    )
    .sort();
  if (diagramTerms.length === 0) return ["", "error"];
  const query = [
    "PREFIX dct: <http://purl.org/dc/terms/>",
    "select ?term ?source where {",
    "?term dct:source ?source.",
    `values ?term {<${_.uniq(
      diagramTerms
        .concat(diagramTerms.flatMap((t) => getIntrinsicTropeTypeIDs(t)))
        .concat(
          diagramTerms
            .flatMap((t) => getActiveToConnections(t))
            .map((c) => WorkspaceLinks[c].iri)
        )
    ).join("> <")}>}`,
    "}",
  ].join(`
  `);
  const separator = ",";
  const compile = (arr: string[]) =>
    arr.map((a) => '"' + a.replaceAll('"', '""') + '"').join(separator);
  const result: { [key: string]: string } = await processQuery(
    AppSettings.contextEndpoint,
    query
  )
    .then((response) => response.json())
    .then((data) => {
      const r: { [key: string]: string } = {};
      for (const row of data.results.bindings) {
        r[row.term.value] = row.source.value;
      }
      return r;
    })
    .catch((e) => {
      console.error(e);
      return { error: e };
    });
  if (Object.keys(result).length === 0)
    console.warn("None of the terms from this diagram have a dct:source.");
  if ("error" in result) return ["", "error1"];
  const rowDescriptionRow =
    [
      "Subjekt/objekt",
      "Popis subjektu",
      "Právní předpis (vč. ustanovení)",
      "Údaj",
      "Popis údaje",
      "Právní předpis (vč. ustanovení)",
      "Typ",
    ].join(",") + carriageReturn;
  const source =
    fileID +
    rowDescriptionRow +
    diagramTerms
      .map((term) => {
        const termType = WorkspaceTerms[term].types.find((f) =>
          RepresentationConfig[
            Representation.COMPACT
          ].visibleStereotypes.includes(f)
        );
        const termRow =
          compile([
            getLabelOrBlank(WorkspaceTerms[term].labels, exportLanguage),
            WorkspaceTerms[term].definitions[exportLanguage],
            term in result ? result[term] : "",
            "",
            "",
            "",
            termType
              ? getLabelOrBlank(Stereotypes[termType].labels, exportLanguage)
              : "",
          ]) + carriageReturn;

        const tropeRows = getIntrinsicTropeTypeIDs(term)
          .map((trope) =>
            compile([
              "",
              "",
              "",
              getLabelOrBlank(WorkspaceTerms[trope].labels, exportLanguage),
              WorkspaceTerms[trope].definitions[exportLanguage],
              term in result ? result[term] : "",
              getLabelOrBlank(
                Stereotypes[parsePrefix("z-sgov-pojem", "typ-vlastnosti")]
                  .labels,
                exportLanguage
              ),
            ])
          )
          .join(carriageReturn);

        const relationshipRows = getActiveToConnections(term)
          .filter((link) => WorkspaceLinks[link].iri in WorkspaceTerms)
          .map((link) =>
            compile([
              "",
              "",
              "",
              getLabelOrBlank(
                WorkspaceTerms[WorkspaceLinks[link].iri].labels,
                exportLanguage
              ),
              WorkspaceTerms[WorkspaceLinks[link].iri].definitions[
                exportLanguage
              ],
              term in result ? result[term] : "",
              getLabelOrBlank(
                Stereotypes[parsePrefix("z-sgov-pojem", "typ-vztahu")].labels,
                exportLanguage
              ),
            ])
          )
          .join(carriageReturn);

        return (
          termRow +
          tropeRows +
          (tropeRows && relationshipRows ? carriageReturn : "") +
          relationshipRows +
          (tropeRows !== relationshipRows ? carriageReturn : "")
        );
      })
      .join(carriageReturn);
  return [source, ""];
}
