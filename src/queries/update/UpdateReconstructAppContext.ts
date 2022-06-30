import { AppSettings } from "../../config/Variables";
import { qb } from "../QueryBuilder";
import { initElements, parsePrefix } from "../../function/FunctionEditVars";
import { processQuery } from "../../interface/TransactionInterface";
import { updateApplicationContext } from "./UpdateMiscQueries";
import {
  updateProjectElement,
  updateProjectElementNames,
} from "./UpdateElementQueries";

export async function reconstructApplicationContextWithDiagrams(): Promise<string> {
  const diagramRetrievalQuery = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?diagram ?graph where {",
    "graph ?contextIRI {",
    `?contextIRI <${parsePrefix(
      "d-sgov-pracovní-prostor-pojem",
      "odkazuje-na-přílohový-kontext"
    )}> ?graph.`,
    "}",
    `values ?contextIRI {<${AppSettings.contextIRIs.join("> <")}>}`,
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
      updateApplicationContext(),
      transferQuery,
      updateProjectElementNames(),
      updateProjectElement(false, ...elements)
    );
  } else return "";
}
