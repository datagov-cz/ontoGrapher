import { Representation } from "../../../../config/Enum";
import { Locale } from "../../../../config/Locale";
import {
  AppSettings,
  Links,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../../../config/Variables";
import { RepresentationConfig } from "../../../../config/logic/RepresentationConfig";
import { parsePrefix } from "../../../../function/FunctionEditVars";
import { filterEquivalent } from "../../../../function/FunctionEquivalents";
import { getLabelOrBlank } from "../../../../function/FunctionGetVars";
import { mvp1IRI, mvp2IRI } from "../../../../function/FunctionGraph";
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
    const termType = WorkspaceTerms[term].types.find((f) =>
      filterEquivalent(
        RepresentationConfig[Representation.FULL].visibleStereotypes,
        f
      )
    );
    if (!termType) {
      return [new Blob(), `Could not find type for term ${term}`];
    }
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
    if (termType === parsePrefix("z-sgov-pojem", "typ-vztahu")) {
      const linkID = Object.keys(WorkspaceLinks).find(
        (l) => WorkspaceLinks[l].iri === term
      );
      if (linkID) {
        const sourceIRI = WorkspaceLinks[linkID].source;
        const targetIRI = WorkspaceLinks[linkID].target;
        const sourceType = WorkspaceTerms[sourceIRI].types.find((f) =>
          filterEquivalent(
            RepresentationConfig[Representation.FULL].visibleStereotypes,
            f
          )
        );
        const targetType = WorkspaceTerms[targetIRI].types.find((f) =>
          filterEquivalent(
            RepresentationConfig[Representation.FULL].visibleStereotypes,
            f
          )
        );
        if (sourceType)
          output +=
            tab +
            bullet +
            `${getLabelOrBlank(
              Links[mvp1IRI].labels,
              exportLanguage
            )} ${getLabelOrBlank(
              WorkspaceTerms[sourceIRI].labels,
              exportLanguage
            )}` +
            carriageReturn;
        if (targetType)
          output +=
            tab +
            bullet +
            `${getLabelOrBlank(
              Links[mvp2IRI].labels,
              exportLanguage
            )} ${getLabelOrBlank(
              WorkspaceTerms[targetIRI].labels,
              exportLanguage
            )}` +
            carriageReturn;
      }
    }
  });
  return [new Blob([output], { type: fileID }), ""];
}
