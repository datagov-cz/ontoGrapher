import { Locale } from "../../../../config/Locale";
import { AppSettings, WorkspaceTerms } from "../../../../config/Variables";
import { parsePrefix } from "../../../../function/FunctionEditVars";
import { getLabelOrBlank } from "../../../../function/FunctionGetVars";
import { exportFunctions } from "./FunctionExportTerms";

export async function exportTermsText(
  exportLanguage: string
): Promise<[source: Blob, error: string]> {
  const fileID = "data:text/plain;charset=utf-8";
  const carriageReturn = "\r\n";
  const bullet = "- ";
  const tab = "\t";
  const exportTerms = exportFunctions.constructExportTerms();
  if (Object.keys(exportTerms).length === 0)
    return [
      new Blob(),
      Locale[AppSettings.interfaceLanguage].listExportErrorNoTerms,
    ];
  let output = "";
  Object.keys(exportTerms).forEach((term) => {
    const termLabel = getLabelOrBlank(
      WorkspaceTerms[term].labels,
      exportLanguage
    );
    const superClassAttributes = exportFunctions.getSuperClassAttributes(
      exportTerms,
      term
    );
    const relationshipOutputs = exportTerms[term]
      .concat(superClassAttributes)
      .filter((r) =>
        WorkspaceTerms[r].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vztahu")
        )
      )
      .map(
        (link) =>
          tab +
          bullet +
          getLabelOrBlank(WorkspaceTerms[link].labels, exportLanguage)
      );
    const eventOutputs = exportTerms[term]
      .concat(superClassAttributes)
      .filter((r) =>
        WorkspaceTerms[r].types.includes(
          parsePrefix("z-sgov-pojem", "typ-události")
        )
      )
      .map(
        (link) =>
          tab +
          bullet +
          getLabelOrBlank(WorkspaceTerms[link].labels, exportLanguage)
      );
    const tropeOutputs = exportTerms[term]
      .concat(superClassAttributes)
      .filter((r) =>
        WorkspaceTerms[r].types.includes(
          parsePrefix("z-sgov-pojem", "typ-vlastnosti")
        )
      )
      .map(
        (link) =>
          tab +
          bullet +
          getLabelOrBlank(WorkspaceTerms[link].labels, exportLanguage)
      );
    output += bullet + termLabel + carriageReturn;
    for (const o of eventOutputs) output += o + carriageReturn;
    for (const o of tropeOutputs) output += o + carriageReturn;
    for (const o of relationshipOutputs) output += o + carriageReturn;
  });
  return [new Blob([output], { type: fileID }), ""];
}
