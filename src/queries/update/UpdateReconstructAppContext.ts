import { AppSettings } from "../../config/Variables";
import { qb } from "../QueryBuilder";
import { initElements, parsePrefix } from "../../function/FunctionEditVars";
import { processQuery } from "../../interface/TransactionInterface";
import { updateWorkspaceContext } from "./UpdateMiscQueries";
import {
  updateProjectElement,
  updateProjectElementNames,
} from "./UpdateElementQueries";

export async function reconstructApplicationContextWithDiagrams(): Promise<string> {
  const diagramRetrievalQuery = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?diagram ?graph where {",
    "BIND(<" + AppSettings.contextIRI + "> as ?metaContext).",
    "graph ?metaContext {",
    `?metaContext <${parsePrefix(
      "d-sgov-pracovní-prostor-pojem",
      "odkazuje-na-přílohový-kontext"
    )}> ?graph .`,
    "}",
    "graph ?graph {",
    "?diagram a og:diagram.",
    "}",
    "}",
  ].join(`
  `);
  const diagramIRIs: string[] = await processQuery(
    AppSettings.contextEndpoint,
    diagramRetrievalQuery
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const result = [];
      for (const diag of data.results.bindings) {
        result.push(diag.graph.value);
      }
      return result;
    })
    .catch((e) => {
      console.error(e);
      return [];
    });
  if (diagramIRIs) {
    const transferQuery = diagramIRIs.map(
      (iri) => `add <${iri}> to <${AppSettings.applicationContext}>`
    ).join(`;
    `);
    const elements = initElements();
    return qb.combineQueries(
      updateWorkspaceContext(),
      transferQuery,
      updateProjectElementNames(...elements),
      updateProjectElement(false, ...elements)
    );
  } else return "";
}
