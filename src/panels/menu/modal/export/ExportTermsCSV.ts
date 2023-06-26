import { Locale } from "../../../../config/Locale";
import {
  AppSettings,
  Stereotypes,
  WorkspaceTerms,
} from "../../../../config/Variables";
import { RepresentationConfig } from "../../../../config/logic/RepresentationConfig";
import { parsePrefix } from "../../../../function/FunctionEditVars";
import { filterEquivalent } from "../../../../function/FunctionEquivalents";
import { getLabelOrBlank } from "../../../../function/FunctionGetVars";
import { Representation } from "./../../../../config/Enum";
import { exportFunctions } from "./FunctionExportTerms";

export async function exportTermsCSV(
  exportLanguage: string
): Promise<[source: Blob, error: string]> {
  const fileID = "data:text/csv;charset=utf-8";
  const carriageReturn = "\r\n";
  const separator = ",";
  const compile = (arr: string[]) =>
    arr.map((a) => '"' + a.replaceAll('"', '""') + '"').join(separator);

  const rowDescriptionRow =
    compile([
      "Subjekt/objekt",
      "Popis subjektu",
      "Právní předpis (vč. ustanovení)",
      "Údaj",
      "Popis údaje",
      "Právní předpis (vč. ustanovení)",
      "Typ",
    ]) + carriageReturn;
  const exportTerms = exportFunctions.constructExportTerms();
  if (Object.keys(exportTerms).length === 0)
    return [
      new Blob(),
      Locale[AppSettings.interfaceLanguage].listExportErrorNoTerms,
    ];
  const sources: { [key: string]: string } = await exportFunctions.getSources(
    exportTerms
  );
  if (Object.keys(sources).length === 0)
    console.warn("None of the terms from this diagram have a dct:source.");
  if ("error" in sources)
    return [
      new Blob(),
      Locale[AppSettings.interfaceLanguage].listExportErrorNoConnection,
    ];
  let output = rowDescriptionRow;
  Object.keys(exportTerms).forEach((term) => {
    const termLabel = getLabelOrBlank(
      WorkspaceTerms[term].labels,
      exportLanguage
    );
    const termType = WorkspaceTerms[term].types.find((f) =>
      filterEquivalent(
        RepresentationConfig[Representation.FULL].visibleStereotypes,
        f
      )
    );
    const superClassAttributes = exportFunctions.getSuperClassAttributes(
      exportTerms,
      term
    );
    if (!termType) {
      return [new Blob(), `Could not find type for term ${term}`];
    }
    const termOutput = compile([
      termLabel,
      WorkspaceTerms[term].definitions[exportLanguage],
      term in sources ? sources[term] : "",
      "",
      "",
      "",
      getLabelOrBlank(Stereotypes[termType!].labels, exportLanguage),
    ]);
    const relationshipOutputs = exportTerms[term]
      .concat(superClassAttributes)
      .filter((r) =>
        WorkspaceTerms[r].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vztahu")
        )
      )
      .map((link) =>
        compile([
          termLabel,
          "",
          "",
          getLabelOrBlank(WorkspaceTerms[link].labels, exportLanguage),
          WorkspaceTerms[link].definitions[exportLanguage],
          link in sources ? sources[link] : "",
          getLabelOrBlank(
            Stereotypes[parsePrefix("z-sgov-pojem", "typ-vztahu")].labels,
            exportLanguage
          ),
        ])
      );
    const eventOutputs = exportTerms[term]
      .concat(superClassAttributes)
      .filter((r) =>
        WorkspaceTerms[r].types.includes(
          parsePrefix("z-sgov-pojem", "typ-události")
        )
      )
      .map((link) =>
        compile([
          termLabel,
          "",
          "",
          getLabelOrBlank(WorkspaceTerms[link].labels, exportLanguage),
          WorkspaceTerms[link].definitions[exportLanguage],
          link in sources ? sources[link] : "",
          getLabelOrBlank(
            Stereotypes[parsePrefix("z-sgov-pojem", "typ-události")].labels,
            exportLanguage
          ),
        ])
      );
    const tropeOutputs = exportTerms[term]
      .concat(superClassAttributes)
      .filter((r) =>
        WorkspaceTerms[r].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vlastnosti")
        )
      )
      .map((link) =>
        compile([
          termLabel,
          "",
          "",
          getLabelOrBlank(WorkspaceTerms[link].labels, exportLanguage),
          WorkspaceTerms[link].definitions[exportLanguage],
          link in sources ? sources[link] : "",
          getLabelOrBlank(
            Stereotypes[parsePrefix("z-sgov-pojem", "typ-vlastnosti")].labels,
            exportLanguage
          ),
        ])
      );
    output += termOutput + carriageReturn;
    for (const o of eventOutputs) output += o + carriageReturn;
    for (const o of tropeOutputs) output += o + carriageReturn;
    for (const o of relationshipOutputs) output += o + carriageReturn;
  });
  return [new Blob([output], { type: fileID }), ""];
}
