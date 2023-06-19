import _ from "lodash";
import { Locale } from "../../../../config/Locale";
import {
  AppSettings,
  Stereotypes,
  WorkspaceElements,
  WorkspaceLinks,
  WorkspaceTerms,
} from "../../../../config/Variables";
import { RepresentationConfig } from "../../../../config/logic/RepresentationConfig";
import { parsePrefix } from "../../../../function/FunctionEditVars";
import {
  isElementHidden,
  isElementVisible,
} from "../../../../function/FunctionElem";
import { filterEquivalent } from "../../../../function/FunctionEquivalents";
import {
  getActiveToConnections,
  getIntrinsicTropeTypeIDs,
  getLabelOrBlank,
} from "../../../../function/FunctionGetVars";
import { processQuery } from "../../../../interface/TransactionInterface";
import { Representation } from "./../../../../config/Enum";

type exportTermObject = { [key: string]: string[] };

async function getSources(
  terms: exportTermObject
): Promise<{ [key: string]: string }> {
  const query = [
    "PREFIX dct: <http://purl.org/dc/terms/>",
    "select ?term ?source where {",
    "?term dct:source ?source.",
    `values ?term {<${_.uniq(
      Object.keys(terms).concat(_.flatten(Object.values(terms)))
    ).join("> <")}>}`,
    "}",
  ].join(`
    `);
  return await processQuery(AppSettings.contextEndpoint, query)
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
}

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
    const activeToConnections = getActiveToConnections(t);
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
          getActiveToConnections(e).find((c) => WorkspaceLinks[c].target === t)
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
  if (Object.keys(exportTerms).length === 0)
    return [
      new Blob(),
      Locale[AppSettings.interfaceLanguage].listExportErrorNoTerms,
    ];
  const sources: { [key: string]: string } = await getSources(exportTerms);
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
