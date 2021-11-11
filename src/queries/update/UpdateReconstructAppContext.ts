import { AppSettings } from "../../config/Variables";
import { qb } from "../QueryBuilder";
import { parsePrefix } from "../../function/FunctionEditVars";
import { getWorkspaceContextIRI } from "../../function/FunctionGetVars";
import { processQuery } from "../../interface/TransactionInterface";
import { updateWorkspaceContext } from "./UpdateMiscQueries";

export async function reconstructApplicationContextWithDiagrams(): Promise<string> {
  const diagramRetrievalQuery = [
    "PREFIX og: <http://onto.fel.cvut.cz/ontologies/application/ontoGrapher/>",
    "select ?diagram where {",
    "BIND(<" + AppSettings.contextIRI + "> as ?metaContext).",
    "graph ?metaContext {",
    `?metaContext ${qb.i(
      parsePrefix(
        "d-sgov-pracovní-prostor-pojem",
        `odkazuje-na-assetový-kontext`
      )
    )} ?diagram .`,
    "}",
    "graph ?diagram {",
    `?diagram ${qb.i(
      parsePrefix("d-sgov-pracovní-prostor-pojem", "má-typ-assetu")
    )} og:diagram.`,
    "}",
    "} limit 1",
  ].join(`
  `);
  const diagramIRI = await processQuery(
    AppSettings.contextEndpoint,
    diagramRetrievalQuery
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.results.bindings.length > 0) {
        return data.results.bindings[0].diagram.value;
      } else return undefined;
    })
    .catch((e) => {
      console.error(e);
      return undefined;
    });
  if (diagramIRI) {
    const transferQuery = [
      `add <${diagramIRI}> to <${getWorkspaceContextIRI()}>`,
    ].join(`
    `);
    return qb.combineQueries(updateWorkspaceContext(), transferQuery);
  } else return "";
}
